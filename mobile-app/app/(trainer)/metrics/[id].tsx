import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { metricsService, trainerService } from '@/services/trainerApi';
import { ChevronLeft, Save, TrendingUp, Activity, User as UserIcon } from 'lucide-react-native';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';

const COLORS = {
  background: '#020617',
  card: '#0f172a',
  primary: '#f59e0b',
  secondary: '#0ea5e9',
  textMain: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  success: '#10b981'
};

const CHART_CONFIG = {
  size: 240,
  center: 120,
  max: 100,
  radius: 90
};

const AXES = [
  { label: 'Cân Nặng', key: 'weight', max: 120 },
  { label: 'BMI', key: 'bmi', max: 40 },
  { label: 'Mỡ %', key: 'bodyFat', max: 50 },
  { label: 'Cơ bắp', key: 'muscleMass', max: 60 },
  { label: 'Thể lực', key: 'fitness', max: 100 }
];

export default function MetricsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [form, setForm] = useState({
    weight: '',
    height: '',
    bodyFat: '',
    muscleMass: ''
  });

  const loadData = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const [clientData, historyData] = await Promise.all([
        trainerService.getClientDetail(id as string),
        metricsService.getHistory(id as string)
      ]);
      setClient(clientData);
      setHistory(historyData);
      if (historyData.length > 0) {
        const last = historyData[historyData.length - 1];
        setForm({
          weight: last.weight.toString(),
          height: last.height.toString(),
          bodyFat: last.bodyFat.toString(),
          muscleMass: last.muscleMass.toString()
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSave = async () => {
    if (!form.weight || !form.height) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập ít nhất Cân nặng và Chiều cao');
      return;
    }
    try {
      setLoading(true);
      await metricsService.save({ ...form, memberId: Number(id) });
      Alert.alert('Thành công', 'Đã đồng bộ chỉ số Inbody mới!');
      loadData();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu chỉ số');
    } finally {
      setLoading(false);
    }
  };

  const getPoint = (value: number, axisIndex: number, maxValue: number) => {
    const normalized = (value / maxValue) * CHART_CONFIG.radius;
    const angle = (Math.PI * 2 * axisIndex) / AXES.length - Math.PI / 2;
    return {
      x: CHART_CONFIG.center + normalized * Math.cos(angle),
      y: CHART_CONFIG.center + normalized * Math.sin(angle)
    };
  };

  const latest = history.length > 0 ? history[history.length - 1] : null;

  const radarPoints = AXES.map((axis, i) => {
    let val = 0;
    if (axis.key === 'fitness') val = 80; // Placeholder for fitness
    else if (latest) val = latest[axis.key] || 0;
    const p = getPoint(val, i, axis.max);
    return `${p.x},${p.y}`;
  }).join(' ');

  if (loading && history.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft color={COLORS.primary} size={24} />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', color: '#fff', fontSize: 16, fontWeight: '900', marginRight: 40 }} numberOfLines={1}>
          {client ? `INBODY: ${client.user?.fullName?.toUpperCase()}` : 'CHỈ SỐ INBODY'}
        </Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Radar Chart Section */}
          <View style={{ margin: 24, padding: 24, backgroundColor: COLORS.card, borderRadius: 32, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <TrendingUp color={COLORS.primary} size={18} />
              <Text style={{ color: COLORS.textSecondary, fontWeight: '800' as const, fontSize: 12, letterSpacing: 1 }}>TIẾN TRÌNH HÌNH THỂ</Text>
            </View>

            <Svg height={CHART_CONFIG.size} width={CHART_CONFIG.size}>
              {/* Background Concentric Circles */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
                <Circle key={i} cx={CHART_CONFIG.center} cy={CHART_CONFIG.center} r={CHART_CONFIG.radius * r} fill="none" stroke={COLORS.border} strokeWidth="1" />
              ))}

              {/* Axis Lines and Labels */}
              {AXES.map((axis, i) => {
                const lineP = getPoint(axis.max, i, axis.max);
                const labelP = getPoint(axis.max + 15, i, axis.max);
                return (
                  <View key={i}>
                    <Line x1={CHART_CONFIG.center} y1={CHART_CONFIG.center} x2={lineP.x} y2={lineP.y} stroke={COLORS.border} strokeWidth="1" />
                    <SvgText x={labelP.x} y={labelP.y} fill={COLORS.textSecondary} fontSize="10" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">{axis.label}</SvgText>
                  </View>
                );
              })}

              {/* Data Polygon */}
              <Polygon points={radarPoints} fill="rgba(245, 158, 11, 0.25)" stroke={COLORS.primary} strokeWidth="3" />

              {/* Center Dot */}
              <Circle cx={CHART_CONFIG.center} cy={CHART_CONFIG.center} r={4} fill={COLORS.primary} />
            </Svg>
          </View>

          {/* Input Form Section */}
          <View style={{ paddingHorizontal: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Activity color={COLORS.primary} size={20} />
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>Cập Nhật Chỉ Số</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Cân Nặng (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.weight}
                  onChangeText={t => setForm({ ...form, weight: t })}
                  placeholderTextColor="#4b5563"
                  placeholder="0.0"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Chiều cao (cm)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.height}
                  onChangeText={t => setForm({ ...form, height: t })}
                  placeholderTextColor="#4b5563"
                  placeholder="0"
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Mỡ (% Body Fat)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.bodyFat}
                  onChangeText={t => setForm({ ...form, bodyFat: t })}
                  placeholderTextColor="#4b5563"
                  placeholder="0.0"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Cơ (kg Muscle)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.muscleMass}
                  onChangeText={t => setForm({ ...form, muscleMass: t })}
                  placeholderTextColor="#4b5563"
                  placeholder="0.0"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              style={{ backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Save color="#000" size={20} style={{ marginRight: 10 }} />
                  <Text style={{ color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 }}>ĐỒNG BỘ DỮ LIỆU</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase'
  },
  input: {
    backgroundColor: COLORS.card,
    color: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
    fontWeight: '700'
  }
});

