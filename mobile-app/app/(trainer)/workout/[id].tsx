import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { trainerService } from '@/services/trainerApi';
import { workoutService, WorkoutExercise } from '@/services/workoutService';
import { ChevronLeft, Save, Plus, Trash2, ClipboardList, Zap, Utensils } from 'lucide-react-native';

const COLORS = {
  background: '#020617',
  card: '#0f172a',
  primary: '#f59e0b',
  secondary: '#0ea5e9',
  textMain: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  danger: '#ef4444'
};

export default function WorkoutLogScreen() {
  const { id, bookingId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [client, setClient] = useState<any>(null);
  
  const [notes, setNotes] = useState('');
  const [energyLevel, setEnergyLevel] = useState('Bình thường');
  const [nutrition, setNutrition] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([
    { name: '', sets: '', reps: '', weight: '', notes: '' }
  ]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await trainerService.getClientDetail(id as string);
        setClient(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '', weight: '', notes: '' }]);
  };

  const removeExercise = (index: number) => {
    if (exercises.length === 1) return;
    const newEx = [...exercises];
    newEx.splice(index, 1);
    setExercises(newEx);
  };

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: string) => {
    const newEx = [...exercises];
    newEx[index] = { ...newEx[index], [field]: value };
    setExercises(newEx);
  };

  const handleSave = async () => {
    if (exercises.some(ex => !ex.name)) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên bài tập cho tất cả các mục');
      return;
    }
    try {
      setSubmitting(true);
      await workoutService.save({
        memberId: Number(id),
        notes,
        energyLevel,
        nutrition,
        exercises,
        bookingId: bookingId ? Number(bookingId) : undefined
      });
      Alert.alert('Thành công', 'Đã lưu giáo án buổi tập!');
      router.back();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu giáo án');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={COLORS.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {client ? `GIÁO ÁN: ${client.user?.fullName?.toUpperCase()}` : 'LÊN GIÁO ÁN'}
        </Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
          
          {/* Session Overview Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ClipboardList color={COLORS.primary} size={20} />
              <Text style={styles.cardTitle}>TỔNG QUAN BUỔI TẬP</Text>
            </View>

            <Text style={styles.label}>Trọng tâm buổi tập</Text>
            <TextInput 
              style={styles.input}
              placeholder="VD: Tập Ngực & Tay sau"
              placeholderTextColor="#4b5563"
              value={notes}
              onChangeText={setNotes}
            />

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <Zap color={COLORS.primary} size={14} />
                  <Text style={styles.label}>Thể lực học viên</Text>
                </View>
                <View style={styles.pickerRow}>
                  {['Yếu', 'Bình thường', 'Khỏe'].map(level => (
                    <TouchableOpacity 
                      key={level}
                      onPress={() => setEnergyLevel(level)}
                      style={[styles.pickerItem, energyLevel === level && styles.pickerItemActive]}
                    >
                      <Text style={[styles.pickerText, energyLevel === level && styles.pickerTextActive]}>{level}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={{ marginTop: 16 }}>
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <Utensils color={COLORS.primary} size={14} />
                  <Text style={styles.label}>Ghi chú dinh dưỡng</Text>
                </View>
                <TextInput 
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="VD: Ăn thêm protein sau tập..."
                  placeholderTextColor="#4b5563"
                  multiline
                  value={nutrition}
                  onChangeText={setNutrition}
                />
            </View>
          </View>

          {/* Exercises Section */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>Bài Tập Chi Tiết</Text>
            <TouchableOpacity onPress={addExercise} style={styles.addButton}>
              <Plus color="#000" size={20} />
              <Text style={{ color: '#000', fontWeight: 'bold', marginLeft: 4 }}>THÊM</Text>
            </TouchableOpacity>
          </View>

          {exercises.map((ex, index) => (
            <View key={index} style={styles.exCard}>
              <View style={styles.exHeader}>
                <Text style={styles.exNumber}>#{index + 1}</Text>
                <TouchableOpacity onPress={() => removeExercise(index)}>
                  <Trash2 color={COLORS.danger} size={18} />
                </TouchableOpacity>
              </View>

              <TextInput 
                style={styles.exInputName}
                placeholder="Tên bài tập (VD: Bench Press)"
                placeholderTextColor="#4b5563"
                value={ex.name}
                onChangeText={t => updateExercise(index, 'name', t)}
              />

              <View style={styles.exStatsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exLabel}>Số Hiệp</Text>
                  <TextInput 
                    style={styles.exInputStat}
                    keyboardType="numeric"
                    placeholder="3"
                    placeholderTextColor="#4b5563"
                    value={ex.sets.toString()}
                    onChangeText={t => updateExercise(index, 'sets', t)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exLabel}>Số Lần</Text>
                  <TextInput 
                    style={styles.exInputStat}
                    keyboardType="numeric"
                    placeholder="12"
                    placeholderTextColor="#4b5563"
                    value={ex.reps.toString()}
                    onChangeText={t => updateExercise(index, 'reps', t)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exLabel}>Khối lượng (kg)</Text>
                  <TextInput 
                    style={styles.exInputStat}
                    keyboardType="numeric"
                    placeholder="60"
                    placeholderTextColor="#4b5563"
                    value={ex.weight.toString()}
                    onChangeText={t => updateExercise(index, 'weight', t)}
                  />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity 
            onPress={handleSave} 
            disabled={submitting}
            style={styles.saveButton}
          >
            {submitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Save color="#000" size={20} style={{ marginRight: 10 }} />
                <Text style={styles.saveButtonText}>LƯU GIÁO ÁN</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 24, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 16, fontWeight: '900', marginRight: 40 },
  card: { backgroundColor: COLORS.card, borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitle: { color: COLORS.textSecondary, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#020617', color: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, fontSize: 15, fontWeight: '600' },
  pickerRow: { flexDirection: 'row', gap: 8 },
  pickerItem: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', backgroundColor: '#020617' },
  pickerItemActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pickerText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  pickerTextActive: { color: '#000' },
  addButton: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  exCard: { backgroundColor: COLORS.card, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  exNumber: { color: COLORS.primary, fontWeight: '900', fontSize: 14 },
  exInputName: { color: '#fff', fontSize: 16, fontWeight: '800', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 8, marginBottom: 16 },
  exStatsRow: { flexDirection: 'row', gap: 12 },
  exLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '800', marginBottom: 4, textTransform: 'uppercase' },
  exInputStat: { backgroundColor: '#020617', color: COLORS.primary, padding: 12, borderRadius: 12, fontSize: 16, fontWeight: '900', textAlign: 'center' },
  saveButton: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  saveButtonText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 }
});
