import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { memberService } from '@/services/memberApi';
import { Clock, Calendar, Plus, X, User, Dumbbell, QrCode as QrIcon, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { KINETIC_THEME, KINETIC_FONTS } from '@/constants/theme';
import { formatDate } from '@/libs/utils';

export default function ScheduleScreen() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [qrModal, setQrModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const load = async () => {
    try {
      const res = await memberService.getSchedule();
      setSchedule(res.data || []);
    } catch (e) {
      console.error('Error fetching schedule:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().then(() => setRefreshing(false));
  }, []);

  const openQR = (booking: any) => {
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') return;
    setSelectedBooking(booking);
    setQrModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          label: 'ĐÃ XÁC NHẬN',
          bg: 'rgba(200, 241, 53, 0.15)',
          color: KINETIC_THEME.accentPrimary,
        };
      case 'COMPLETED':
        return {
          label: 'HOÀN THÀNH',
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#10B981',
        };
      case 'CANCELLED':
        return {
          label: 'ĐÃ HỦY',
          bg: 'rgba(255, 90, 54, 0.15)',
          color: KINETIC_THEME.accentSecondary,
        };
      default:
        return {
          label: 'CHỜ DUYỆT',
          bg: 'rgba(244, 245, 240, 0.1)',
          color: KINETIC_THEME.textMuted,
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>LỊCH TẬP & ĐẶT CHỖ</Text>
          <Text style={styles.headerTitle}>Lịch Hẹn Của Bạn</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(member)/explore' as any)}
          style={styles.addButton}
          activeOpacity={0.8}
        >
          <Plus color={KINETIC_THEME.textOnAccent} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={KINETIC_THEME.accentPrimary}
          />
        }
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {schedule.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Calendar size={40} color={KINETIC_THEME.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có lịch hẹn nào</Text>
            <Text style={styles.emptyDesc}>
              Bấm dấu &quot;+&quot; góc phải để chọn huấn luyện viên hoặc đăng ký lớp học GroupX.
            </Text>
          </View>
        ) : (
          schedule.map((item) => {
            const isPT = !!item.trainer;
            const statusInfo = getStatusBadge(item.status);
            const startTimeStr = new Date(item.startTime).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const endTimeStr = new Date(item.endTime).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => openQR(item)}
                activeOpacity={item.status === 'COMPLETED' ? 1 : 0.7}
              >
                {/* Top Row: Type & Status */}
                <View style={styles.cardTop}>
                  <View style={styles.typeBadge}>
                    {isPT ? (
                      <Dumbbell size={13} color={KINETIC_THEME.accentPrimary} />
                    ) : (
                      <Calendar size={13} color="#A855F7" />
                    )}
                    <Text
                      style={[
                        styles.typeText,
                        { color: isPT ? KINETIC_THEME.accentPrimary : '#A855F7' },
                      ]}
                    >
                      {isPT ? 'BUỔI TẬP KÈM PT' : 'LỚP HỌC GROUPX'}
                    </Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {/* Main Info */}
                <Text style={styles.sessionTitle}>
                  {isPT
                    ? `Buổi tập với ${item.trainer?.user?.fullName || 'Huấn luyện viên'}`
                    : item.groupClass?.name || 'Lớp học nhóm'}
                </Text>

                {/* Time & Date */}
                <View style={styles.timeBox}>
                  <View style={styles.timeItem}>
                    <Calendar size={14} color={KINETIC_THEME.textMuted} />
                    <Text style={styles.timeText}>{formatDate(item.startTime)}</Text>
                  </View>
                  <View style={styles.timeItem}>
                    <Clock size={14} color={KINETIC_THEME.accentPrimary} />
                    <Text style={[styles.timeText, { color: KINETIC_THEME.accentPrimary, fontWeight: '700' }]}>
                      {startTimeStr} - {endTimeStr}
                    </Text>
                  </View>
                </View>

                {/* Footer action hint */}
                {item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
                  <View style={styles.qrPrompt}>
                    <QrIcon size={14} color={KINETIC_THEME.textMuted} />
                    <Text style={styles.qrPromptText}>
                      Chạm để mở mã QR hoàn thành buổi tập với PT
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* QR Modal for Check-Out */}
      <Modal visible={qrModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Xác Nhận Buổi Tập</Text>
              <TouchableOpacity onPress={() => setQrModal(false)} style={styles.closeBtn}>
                <X size={18} color={KINETIC_THEME.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Đưa mã QR này cho PT để xác nhận hoàn thành buổi tập và cập nhật ví số buổi.
            </Text>

            <View style={styles.qrContainer}>
              {selectedBooking && (
                <QRCode
                  value={`TITAN-BOOKING-${selectedBooking.id}-${selectedBooking.memberId}`}
                  size={200}
                  color={KINETIC_THEME.background}
                  backgroundColor="#FFFFFF"
                />
              )}
            </View>

            <View style={styles.bookingIdBadge}>
              <Text style={styles.bookingIdText}>
                MÃ LỊCH HẸN: #{selectedBooking?.id}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KINETIC_THEME.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: KINETIC_THEME.border,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: KINETIC_THEME.accentPrimary,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: KINETIC_THEME.textPrimary,
    marginTop: 2,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: KINETIC_THEME.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KINETIC_THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: KINETIC_THEME.textPrimary,
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 12,
    color: KINETIC_THEME.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  card: {
    backgroundColor: KINETIC_THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    padding: 18,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: KINETIC_THEME.textPrimary,
    marginBottom: 12,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: KINETIC_THEME.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    padding: 10,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    color: KINETIC_THEME.textPrimary,
    fontWeight: '600',
  },
  qrPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: KINETIC_THEME.border,
  },
  qrPromptText: {
    fontSize: 11,
    color: KINETIC_THEME.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: KINETIC_THEME.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: KINETIC_THEME.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: KINETIC_THEME.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
  },
  bookingIdBadge: {
    backgroundColor: KINETIC_THEME.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
  },
  bookingIdText: {
    fontSize: 11,
    fontWeight: '700',
    color: KINETIC_THEME.accentPrimary,
    letterSpacing: 1,
  },
});
