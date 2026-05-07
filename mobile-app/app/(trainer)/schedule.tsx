import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { trainerService, authService } from '@/services/trainerApi';
import { Search, Clock, Calendar, Check, X, Dumbbell, QrCode } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

const COLORS = {
   background: '#020617',
   card: '#0f172a',
   primary: '#f59e0b',
   textMain: '#ffffff',
   textSecondary: '#94a3b8',
   border: '#1e293b',
   timeSection: '#111827'
};

export default function ScheduleScreen() {
   const router = useRouter();
   const [schedule, setSchedule] = useState<any[]>([]);
   const [refreshing, setRefreshing] = useState(false);
   const [user, setUser] = useState<any>(null);

   const [permission, requestPermission] = useCameraPermissions();
   const [scannerVisible, setScannerVisible] = useState(false);
   const [scanned, setScanned] = useState(false);

   const load = async () => {
      try {
         const [res, me] = await Promise.all([
            trainerService.getSchedule(),
            authService.getMe()
         ]);
         setSchedule(res?.data || []);
         setUser(me);
      } catch (e) { 
         setSchedule([]);
      }
   };

   useEffect(() => { load(); }, []);
   const onRefresh = useCallback(() => { setRefreshing(true); load().then(() => setRefreshing(false)); }, []);

   const handleUpdateStatus = async (id: number, status: string) => {
      try {
         await trainerService.updateBookingStatus(id, status);
         load();
         Alert.alert('Thành công', `Đã ${status === 'CONFIRMED' ? 'xác nhận' : 'từ chối'} lịch tập.`);
      } catch (e) {
         Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
      }
   };

   const handleBarCodeScanned = async ({ data }: { data: string }) => {
      if (scanned) return;
      setScanned(true);
      try {
         const qrData = JSON.parse(data);
         if (qrData.type === 'SESSION_COMPLETE' && qrData.bookingId) {
            await trainerService.completeWithQR(qrData.bookingId, user.id);
            setScannerVisible(false);
            Alert.alert('Thành công', 'Đã xác nhận hoàn thành buổi tập và trừ buổi khách hàng.');
            load();
         } else {
            Alert.alert('Lỗi', 'Mã QR không hợp lệ cho việc xác nhận buổi tập');
         }
      } catch (e: any) {
         Alert.alert('Lỗi', e.response?.data?.error || 'Không thể xử lý mã QR');
      } finally {
         setTimeout(() => setScanned(false), 2000);
      }
   };

   const startScan = async () => {
      if (!permission?.granted) {
         const { granted } = await requestPermission();
         if (!granted) {
            Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền Camera để quét mã QR');
            return;
         }
      }
      setScannerVisible(true);
      setScanned(false);
   };

   return (
      <SafeAreaView style={styles.container}>
         <View style={styles.header}>
            <Text style={styles.headerTitle}>Lịch Dạy</Text>
            <View style={styles.headerActions}>
               <TouchableOpacity onPress={() => router.push('/(trainer)/availability' as any)} style={styles.iconButton}>
                  <Calendar color={COLORS.primary} size={20} />
               </TouchableOpacity>
               <View style={[styles.iconButton, { marginLeft: 12 }]}>
                  <Search color="#6b7280" size={20} />
               </View>
            </View>
         </View>

         <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            style={styles.scroll}
         >
            {schedule.length === 0 && <Text style={styles.emptyText}>Chưa có lịch dạy nào được xếp!</Text>}
            {schedule.map(b => {
               const time = new Date(b.startTime);
               return (
                  <View key={b.id} style={styles.bookingCard}>
                     <View style={styles.dateSection}>
                        <Text style={styles.monthText}>Tháng {time.getMonth() + 1}</Text>
                        <Text style={styles.dayText}>{time.getDate()}</Text>
                     </View>
                     <View style={styles.infoSection}>
                        <Text style={styles.memberName}>{b.member?.user?.fullName}</Text>
                        <View style={styles.statusRow}>
                           <View style={[styles.statusBadge, b.status === 'COMPLETED' ? styles.statusCompleted : b.status === 'CONFIRMED' ? styles.statusConfirmed : b.status === 'PENDING' ? styles.statusPending : styles.statusCancelled]}>
                              <Text style={styles.statusText}>{b.status}</Text>
                           </View>
                           <View style={styles.timeRow}>
                              <Clock color="#6b7280" size={14} style={{ marginRight: 4 }} />
                              <Text style={styles.timeText}>{time.getHours()}:00</Text>
                           </View>
                        </View>

                          {b.status === 'CONFIRMED' && (
                             <View style={styles.actionRow}>
                                <TouchableOpacity 
                                   onPress={() => router.push({ pathname: '/(trainer)/workout/[id]', params: { id: b.memberId, bookingId: b.id } } as any)} 
                                   style={styles.planBtn}
                                >
                                   <Dumbbell color={COLORS.primary} size={16} />
                                   <Text style={styles.planBtnText}>Giáo án</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                   onPress={startScan}
                                   style={styles.scanBtn}
                                >
                                   <QrCode color="#fff" size={16} />
                                   <Text style={styles.scanBtnText}>Quét QR</Text>
                                </TouchableOpacity>
                             </View>
                          )}

                          {b.status === 'PENDING' && (
                             <View style={styles.actionRow}>
                                <TouchableOpacity onPress={() => handleUpdateStatus(b.id, 'DECLINED')} style={styles.declineBtn}>
                                   <X color="#ef4444" size={16} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleUpdateStatus(b.id, 'CONFIRMED')} style={styles.confirmBtn}>
                                   <Check color="#fff" size={16} />
                                   <Text style={styles.confirmBtnText}>Xác nhận</Text>
                                </TouchableOpacity>
                             </View>
                          )}
                     </View>
                  </View>
               );
            })}
         </ScrollView>

         <Modal visible={scannerVisible} animationType="slide">
            <View style={styles.scannerContainer}>
               <CameraView
                  style={StyleSheet.absoluteFillObject}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{
                     barcodeTypes: ['qr'],
                  }}
               />
               <View style={styles.scannerOverlay}>
                  <View style={styles.scanTarget} />
                  <Text style={styles.scanText}>Quét mã QR của học viên để hoàn thành</Text>
                  <TouchableOpacity onPress={() => setScannerVisible(false)} style={styles.cancelScanBtn}>
                     <Text style={styles.cancelScanText}>Hủy bỏ</Text>
                  </TouchableOpacity>
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
      paddingTop: 24,
      paddingBottom: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
   },
   headerTitle: {
      fontSize: 32,
      fontWeight: '900',
      color: COLORS.textMain,
   },
   headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   iconButton: {
      backgroundColor: COLORS.card,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: COLORS.border,
   },
   scroll: {
      paddingHorizontal: 24,
   },
   emptyText: {
      color: COLORS.textSecondary,
      marginTop: 40,
      textAlign: 'center',
      fontWeight: '500',
   },
   bookingCard: {
      backgroundColor: COLORS.card,
      padding: 20,
      borderRadius: 24,
      marginBottom: 16,
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: COLORS.border,
   },
   dateSection: {
      marginRight: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 60,
   },
   monthText: {
      fontSize: 10,
      color: COLORS.textSecondary,
      textTransform: 'uppercase',
      fontWeight: '800',
   },
   dayText: {
      color: COLORS.primary,
      fontSize: 28,
      fontWeight: '900',
   },
   infoSection: {
      flex: 1,
      borderLeftWidth: 1,
      borderLeftColor: COLORS.border,
      paddingLeft: 20,
      justifyContent: 'center',
   },
   memberName: {
      color: COLORS.textMain,
      fontWeight: '800',
      fontSize: 18,
      marginBottom: 4,
   },
   timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   timeText: {
      color: COLORS.textSecondary,
      fontSize: 13,
      fontWeight: '500',
   },
   statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
   },
   statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
   },
   statusConfirmed: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
   },
   statusPending: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
   },
   statusCancelled: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
   },
   statusCompleted: {
      backgroundColor: 'rgba(57, 255, 20, 0.1)',
   },
   statusText: {
      fontSize: 10,
      fontWeight: '900',
      color: COLORS.textMain,
   },
   actionRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 4,
   },
   confirmBtn: {
      flex: 1,
      backgroundColor: '#22c55e',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderRadius: 12,
      gap: 4,
   },
   confirmBtnText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 12,
   },
   declineBtn: {
      width: 40,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.2)',
   },
   planBtn: {
      flex: 1,
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      paddingVertical: 10,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.2)',
   },
   planBtnText: {
      color: COLORS.primary,
      fontWeight: '800',
      fontSize: 13,
   },
   scanBtn: {
      flex: 1.2,
      backgroundColor: '#22c55e',
      paddingVertical: 10,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
   },
   scanBtnText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 13,
   },
   scannerContainer: {
      flex: 1,
      backgroundColor: '#000',
   },
   scannerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
   },
   scanTarget: {
      width: 250,
      height: 250,
      borderWidth: 2,
      borderColor: '#39FF14',
      backgroundColor: 'transparent',
      borderRadius: 24,
   },
   scanText: {
      color: '#fff',
      marginTop: 24,
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
      paddingHorizontal: 40,
   },
   cancelScanBtn: {
      marginTop: 40,
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.1)',
   },
   cancelScanText: {
      color: '#fff',
      fontWeight: '800',
   }
});
