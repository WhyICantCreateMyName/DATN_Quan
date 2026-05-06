import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { trainerService } from '@/services/trainerApi';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2, Save, Calendar, Clock, X } from 'lucide-react-native';

const COLORS = {
  background: '#020617',
  card: '#0f172a',
  primary: '#f59e0b',
  textMain: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  error: '#ef4444',
  success: '#22c55e'
};

const DAYS = [
  { label: 'Thứ 2', value: 1 },
  { label: 'Thứ 3', value: 2 },
  { label: 'Thứ 4', value: 3 },
  { label: 'Thứ 5', value: 4 },
  { label: 'Thứ 6', value: 5 },
  { label: 'Thứ 7', value: 6 },
  { label: 'Chủ Nhật', value: 0 },
];

const DEFAULT_SLOTS = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00",
  "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00",
  "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00"
];

export default function AvailabilityScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slots, setSlots] = useState<any[]>([]); // { dayOfWeek, startTime, endTime }
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingType, setEditingType] = useState<'start' | 'end'>('start');

  const HOURS = Array.from({ length: 17 }, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`);

  useEffect(() => {
    trainerService.getAvailability()
      .then(data => {
        setSlots(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAddSlot = (dayOfWeek: number) => {
    const newSlot = { dayOfWeek, startTime: '08:00', endTime: '09:00' };
    setSlots([...slots, newSlot]);
  };

  const handleRemoveSlot = (index: number) => {
    const newSlots = [...slots];
    newSlots.splice(index, 1);
    setSlots(newSlots);
  };

  const openTimePicker = (index: number, type: 'start' | 'end') => {
    setEditingSlotIndex(index);
    setEditingType(type);
    setShowTimePicker(true);
  };

  const selectTime = (time: string) => {
    if (editingSlotIndex === null) return;
    const newSlots = [...slots];
    const slot = { ...newSlots[editingSlotIndex] };

    if (editingType === 'start') {
      slot.startTime = time;
      // Auto set end time to +1h if it's less than start
      const startHour = parseInt(time);
      const endHour = parseInt(slot.endTime);
      if (endHour <= startHour) {
        slot.endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;
      }
    } else {
      slot.endTime = time;
    }

    newSlots[editingSlotIndex] = slot;
    setSlots(newSlots);
    setShowTimePicker(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await trainerService.updateAvailability(slots);
      Alert.alert('Thành công', 'Đã cập nhật lịch rảnh của bạn');
      router.back();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu lịch rảnh');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={COLORS.textMain} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch Rảnh</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButtonHeader}>
          {saving ? <ActivityIndicator size="small" color="#000" /> : <Save color="#000" size={20} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.introText}>Thiết lập các khung giờ bạn có thể dạy trong tuần để học viên có thể đăng ký.</Text>

        {DAYS.map(day => {
          const daySlots = slots.filter(s => s.dayOfWeek === day.value);
          return (
            <View key={day.value} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayTitleRow}>
                  <Calendar color={COLORS.primary} size={18} style={{ marginRight: 8 }} />
                  <Text style={styles.dayLabel}>{day.label}</Text>
                </View>
                <TouchableOpacity onPress={() => handleAddSlot(day.value)} style={styles.addButton}>
                  <Plus color={COLORS.primary} size={20} />
                  <Text style={styles.addButtonText}>Thêm giờ</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.slotsContainer}>
                {daySlots.length === 0 ? (
                  <Text style={styles.noSlotsText}>Chưa có lịch rảnh</Text>
                ) : (
                  daySlots.map((s, i) => {
                    const globalIndex = slots.findIndex(gs => gs === s);
                    return (
                      <View key={i} style={styles.slotItem}>
                        <View style={styles.slotTimeContainer}>
                          <TouchableOpacity onPress={() => openTimePicker(globalIndex, 'start')}>
                            <Text style={styles.slotTime}>{s.startTime}</Text>
                          </TouchableOpacity>
                          <Text style={styles.slotSeparator}> - </Text>
                          <TouchableOpacity onPress={() => openTimePicker(globalIndex, 'end')}>
                            <Text style={styles.slotTime}>{s.endTime}</Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => handleRemoveSlot(globalIndex)} style={styles.deleteButton}>
                          <Trash2 color={COLORS.error} size={18} />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={showTimePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingType === 'start' ? 'Bắt đầu lúc' : 'Kết thúc lúc'}
              </Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <X color={COLORS.textMain} size={24} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={HOURS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.timeOption}
                  onPress={() => selectTime(item)}
                >
                  <Text style={styles.timeOptionText}>{item}</Text>
                  <Clock color={COLORS.primary} size={18} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textMain,
  },
  saveButtonHeader: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  introText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 20,
    marginBottom: 24,
    lineHeight: 20,
  },
  dayCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayLabel: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '800',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  slotsContainer: {
    gap: 10,
  },
  noSlotsText: {
    color: '#475569',
    fontSize: 13,
    fontStyle: 'italic',
  },
  slotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  slotTime: {
    color: COLORS.textMain,
    fontWeight: '700',
    fontSize: 15,
  },
  slotTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotSeparator: {
    color: '#475569',
    fontSize: 15,
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '60%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: COLORS.textMain,
    fontSize: 20,
    fontWeight: '900',
  },
  timeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  timeOptionText: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '600',
  }
});
