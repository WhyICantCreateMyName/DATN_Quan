import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useBooking } from '@/hooks/useBooking';
import { Calendar, Clock, User, CheckCircle2 } from 'lucide-react-native';

const COLORS = {
  background: '#020617',
  card: '#0f172a',
  primary: '#0ea5e9',
  textMain: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  success: '#10b981'
};

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function BookingScreen() {
  const {
    loading,
    trainers,
    selectedTrainer,
    availability,
    selectedSlot,
    bookingLoading,
    bookingType,
    groupClasses,
    setBookingType,
    setSelectedSlot,
    handleSelectTrainer,
    handleConfirmPTBooking,
    handleConfirmGroupBooking,
    reload
  } = useBooking();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
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
        <Text style={styles.headerTitle}>Đặt Lịch Tập</Text>
      </View>

      <View style={styles.typeToggle}>
        <TouchableOpacity 
          style={[styles.typeBtn, bookingType === 'PT' && styles.typeBtnActive]} 
          onPress={() => setBookingType('PT')}
        >
          <Text style={[styles.typeBtnText, bookingType === 'PT' && styles.typeBtnTextActive]}>Đặt Lịch PT</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeBtn, bookingType === 'GROUP' && styles.typeBtnActive]} 
          onPress={() => setBookingType('GROUP')}
        >
          <Text style={[styles.typeBtnText, bookingType === 'GROUP' && styles.typeBtnTextActive]}>Lớp Nhóm (Group X)</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {bookingType === 'PT' ? (
          <>
            <Text style={styles.sectionTitle}>1. Chọn Huấn Luyện Viên</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trainerList}>
              {trainers.map(t => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => handleSelectTrainer(t)}
                  style={[styles.trainerCard, selectedTrainer?.id === t.id && styles.trainerCardActive]}
                >
                  <View style={styles.avatarContainer}>
                    {t.avatarBase64 ? (
                      <Image source={{ uri: t.avatarBase64 }} style={styles.avatar} />
                    ) : (
                      <User color={COLORS.textSecondary} size={32} />
                    )}
                    {selectedTrainer?.id === t.id && (
                      <View style={styles.activeCheck}>
                        <CheckCircle2 color="#fff" size={12} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.trainerName} numberOfLines={1}>{t.user?.fullName}</Text>
                  <Text style={styles.trainerSpec} numberOfLines={1}>{t.specialization || 'PT'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>2. Chọn Khung Giờ Rảnh</Text>
            {availability.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>PT này chưa khai báo lịch rảnh</Text>
              </View>
            ) : (
              <View style={styles.slotsGrid}>
                {availability.map((s, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedSlot(s)}
                    style={[styles.slotCard, selectedSlot === s && styles.slotCardActive]}
                  >
                    <Text style={styles.slotDay}>{DAYS[s.dayOfWeek]}</Text>
                    <Text style={styles.slotTime}>{s.startTime}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedSlot && (
              <View style={styles.confirmSection}>
                <View style={styles.summaryBox}>
                  <View style={styles.summaryRow}>
                    <Calendar color={COLORS.primary} size={16} />
                    <Text style={styles.summaryText}>Buổi tập vào thứ: {DAYS[selectedSlot.dayOfWeek]}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Clock color={COLORS.primary} size={16} />
                    <Text style={styles.summaryText}>Thời gian: {selectedSlot.startTime} - {selectedSlot.endTime}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleConfirmPTBooking}
                  disabled={bookingLoading}
                  style={styles.bookButton}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.bookButtonText}>XÁC NHẬN ĐẶT LỊCH</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.groupSection}>
            <Text style={styles.sectionTitle}>Các lớp học sắp diễn ra</Text>
            {groupClasses.length === 0 ? (
               <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Hiện chưa có lớp Group X nào</Text>
               </View>
            ) : (
               groupClasses.map(cls => (
                  <View key={cls.id} style={styles.groupCard}>
                     <View style={styles.groupInfo}>
                        <Text style={styles.groupName}>{cls.name}</Text>
                        <View style={styles.groupTimeRow}>
                           <Clock color={COLORS.textSecondary} size={14} />
                           <Text style={styles.groupTimeText}>
                              {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {new Date(cls.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </Text>
                        </View>
                        <Text style={styles.groupCapacity}>Sức chứa: {cls.capacity} người</Text>
                     </View>
                     <TouchableOpacity 
                        onPress={() => handleConfirmGroupBooking(cls)}
                        style={styles.joinBtn}
                     >
                        <Text style={styles.joinBtnText}>GIỮ CHỖ</Text>
                     </TouchableOpacity>
                  </View>
               ))
            )}
          </View>
        )}


      </ScrollView>
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
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textMain,
  },
  typeToggle: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 12,
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  typeBtnTextActive: {
    color: '#fff',
  },
  scroll: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: '800',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  trainerList: {
    paddingLeft: 24,
  },
  trainerCard: {
    width: 100,
    marginRight: 16,
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trainerCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(14, 165, 233, 0.05)',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 56,
    height: 56,
  },
  activeCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 2,
  },
  trainerName: {
    color: COLORS.textMain,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  trainerSpec: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  slotCard: {
    width: '21%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slotCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotDay: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  slotTime: {
    color: COLORS.textMain,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  confirmSection: {
    padding: 24,
    marginTop: 12,
  },
  summaryBox: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryText: {
    color: COLORS.textMain,
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },

  groupSection: {
    paddingHorizontal: 24,
  },
  groupCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  groupTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  groupTimeText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  groupCapacity: {
    color: '#475569',
    fontSize: 12,
  },
  joinBtn: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  joinBtnText: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 12,
  }
});
