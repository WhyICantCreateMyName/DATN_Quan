import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { memberService } from '@/services/memberApi';
import { Search, Clock, CalendarDays, Plus, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

const COLORS = {
   background: '#020617',
   card: '#0f172a',
   primary: '#39FF14', // Đổi sang màu Neon Green cho TitanGym
   textMain: '#ffffff',
   textSecondary: '#94a3b8',
   border: '#1e293b',
   ptIconBg: 'rgba(57, 255, 20, 0.1)',
   groupIconBg: 'rgba(168, 85, 247, 0.1)',
   groupIcon: '#a855f7'
};

export default function ScheduleScreen() {
   const router = useRouter();
   const [schedule, setSchedule] = useState<any[]>([]);
   const [refreshing, setRefreshing] = useState(false);
   
   const [qrModal, setQrModal] = useState(false);
   const [selectedBooking, setSelectedBooking] = useState<any>(null);

   const load = async () => {
      try {
         const res = await memberService.getSchedule();
         setSchedule(res.data);
      } catch (e) { }
   };

   useEffect(() => { load(); }, []);

   const onRefresh = useCallback(() => {
      setRefreshing(true);
      load().then(() => setRefreshing(false));
   }, []);

   const openQR = (booking: any) => {
      if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') return;
      setSelectedBooking(booking);
      setQrModal(true);
   };

   return (
      <SafeAreaView style={styles.container}>
         <View style={styles.header}>
            <Text style={styles.headerTitle}>Lịch hẹn Tập</Text>
            <View style={styles.headerActions}>
               <TouchableOpacity onPress={() => router.push('/(member)/explore' as any)} style={styles.addButton}>
                  <Plus color="#000" size={20} />
               </TouchableOpacity>
            </View>
         </View>

         <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} style={styles.scroll}>
            {schedule.map((item, id) => {
               const st = new Date(item.startTime);
               const et = new Date(item.endTime);
               const isPT = !!item.trainer;

               return (
                  <TouchableOpacity 
                     key={id} 
                     style={[styles.card, item.status === 'COMPLETED' && { opacity: 0.5 }]} 
                     onPress={() => isPT && openQR(item)}
                     activeOpacity={isPT ? 0.7 : 1}
                  >
                     <View style={styles.cardHeader}>
                        <View style={styles.iconContainer}>
                           <View style={[styles.iconBg, { backgroundColor: isPT ? COLORS.ptIconBg : COLORS.groupIconBg }]}>
                              <CalendarDays color={isPT ? COLORS.primary : COLORS.groupIcon} size={22} />
                           </View>
                           <View style={styles.textContainer}>
                              <View style={styles.titleRow}>
                                 <Text style={styles.itemTitle}>{isPT ? 'Tập PT Cá nhân' : item.groupClass?.name}</Text>
                                 <View style={[styles.statusBadge, item.status === 'COMPLETED' ? styles.statusSuccess : styles.statusPending]}>
                                    <Text style={styles.statusText}>{item.status}</Text>
                                 </View>
                              </View>
                              <Text style={styles.itemSubtitle}>{isPT ? `Huấn luyện viên: ${item.trainer.user.fullName}` : 'Lớp học nhóm'}</Text>
                           </View>
                        </View>
                     </View>

                     <View style={styles.timeSection}>
                        <Clock color={COLORS.primary} size={16} style={{ marginRight: 8 }} />
                        <Text style={styles.timeText}>
                           {st.toLocaleDateString('vi-VN')} • {st.getHours()}:{st.getMinutes().toString().padStart(2, '0')} - {et.getHours()}:{et.getMinutes().toString().padStart(2, '0')}
                        </Text>
                     </View>
                     
                     {isPT && item.status !== 'COMPLETED' && (
                        <Text style={styles.tapTip}>Nhấn để hiển thị mã xác nhận</Text>
                     )}
                  </TouchableOpacity>
               );
            })}
            {schedule.length === 0 && (
               <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Chưa có lịch hẹn nào</Text>
                  <Text style={styles.emptySubtitle}>Bạn có thể đặt lịch PT qua mục "Huấn luyện viên"</Text>
               </View>
            )}
         </ScrollView>

         <Modal visible={qrModal} transparent animationType="fade">
            <View style={styles.modalBg}>
               <View style={styles.modalContent}>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setQrModal(false)}>
                     <X color="#fff" size={24} />
                  </TouchableOpacity>
                  
                  <Text style={styles.modalTitle}>Mã Xác Nhận Buổi Tập</Text>
                  <Text style={styles.modalSubtitle}>Đưa mã này cho PT của bạn quét khi kết thúc buổi tập để xác nhận hoàn thành.</Text>
                  
                  <View style={styles.qrContainer}>
                     <QRCode 
                        value={JSON.stringify({ bookingId: selectedBooking?.id, type: 'SESSION_COMPLETE' })}
                        size={200}
                        backgroundColor={COLORS.card}
                        color={COLORS.primary}
                     />
                  </View>
                  
                  <View style={styles.bookingSummary}>
                     <Text style={styles.summaryText}>HLV: {selectedBooking?.trainer?.user?.fullName}</Text>
                     <Text style={styles.summaryTime}>
                        {new Date(selectedBooking?.startTime).toLocaleDateString('vi-VN')}
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
      backgroundColor: COLORS.background,
   },
   header: {
      paddingHorizontal: 24,
      paddingVertical: 24,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
   },
   headerTitle: {
      color: COLORS.textMain,
      fontSize: 24,
      fontWeight: '900',
      textTransform: 'uppercase',
      fontStyle: 'italic',
   },
   headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   addButton: {
      width: 40,
      height: 40,
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
   },
   scroll: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 24,
   },
   card: {
      backgroundColor: COLORS.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
   },
   cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 16,
   },
   iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
   },
   iconBg: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
   },
   textContainer: {
      flex: 1,
   },
   titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
   },
   itemTitle: {
      color: COLORS.textMain,
      fontWeight: '800',
      fontSize: 16,
   },
   statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
   },
   statusPending: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
   },
   statusSuccess: {
      backgroundColor: 'rgba(57, 255, 20, 0.1)',
   },
   statusText: {
      fontSize: 8,
      fontWeight: '900',
      color: COLORS.textMain,
      textTransform: 'uppercase',
   },
   itemSubtitle: {
      color: COLORS.textSecondary,
      marginTop: 2,
      fontSize: 13,
   },
   timeSection: {
      backgroundColor: COLORS.background,
      borderRadius: 16,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
   },
   timeText: {
      color: COLORS.primary,
      fontWeight: '800',
      fontSize: 13,
   },
   tapTip: {
      color: COLORS.textSecondary,
      fontSize: 10,
      textAlign: 'center',
      marginTop: 12,
      fontStyle: 'italic',
   },
   emptyState: {
      alignItems: 'center',
      marginTop: 80,
   },
   emptyTitle: {
      color: COLORS.textSecondary,
      fontWeight: '700',
      fontSize: 16,
      marginBottom: 8,
   },
   emptySubtitle: {
      color: '#475569',
      textAlign: 'center',
      fontSize: 14,
      paddingHorizontal: 32,
   },
   modalBg: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
   },
   modalContent: {
      width: '100%',
      backgroundColor: COLORS.card,
      borderRadius: 32,
      padding: 32,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.border,
   },
   closeBtn: {
      position: 'absolute',
      top: 20,
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.05)',
      alignItems: 'center',
      justifyContent: 'center',
   },
   modalTitle: {
      color: COLORS.textMain,
      fontSize: 22,
      fontWeight: '900',
      marginTop: 20,
      textAlign: 'center',
   },
   modalSubtitle: {
      color: COLORS.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 32,
      lineHeight: 20,
   },
   qrContainer: {
      padding: 20,
      backgroundColor: '#fff',
      borderRadius: 24,
   },
   bookingSummary: {
      marginTop: 32,
      alignItems: 'center',
   },
   summaryText: {
      color: COLORS.textMain,
      fontWeight: '800',
      fontSize: 16,
   },
   summaryTime: {
      color: COLORS.primary,
      fontWeight: '700',
      fontSize: 14,
      marginTop: 4,
   }
});


