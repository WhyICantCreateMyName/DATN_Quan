import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { memberService } from '@/services/memberApi';
import { Search, Clock, CalendarDays, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const COLORS = {
   background: '#020617',
   card: '#0f172a',
   primary: '#0ea5e9',
   textMain: '#ffffff',
   textSecondary: '#94a3b8',
   border: '#1e293b',
   ptIconBg: 'rgba(14, 165, 233, 0.1)',
   groupIconBg: 'rgba(168, 85, 247, 0.1)',
   groupIcon: '#a855f7'
};

export default function ScheduleScreen() {
   const router = useRouter();
   const [schedule, setSchedule] = useState<any[]>([]);
   const [refreshing, setRefreshing] = useState(false);

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

   return (
      <SafeAreaView style={styles.container}>
         <View style={styles.header}>
            <Text style={styles.headerTitle}>Lịch hẹn Tập</Text>
            <View style={styles.headerActions}>
               <TouchableOpacity onPress={() => router.push('/(member)/explore' as any)} style={styles.addButton}>
                  <Plus color="#fff" size={20} />
               </TouchableOpacity>
               <View style={[styles.iconButton, { marginLeft: 12 }]}>
                  <Search color="#9ca3af" size={20} />
               </View>
            </View>
         </View>

         <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} style={styles.scroll}>
            {schedule.map((item, id) => {
               const st = new Date(item.startTime);
               const et = new Date(item.endTime);
               const isPT = !!item.trainer;

               return (
                  <View key={id} style={styles.card}>
                     <View style={styles.cardHeader}>
                        <View style={styles.iconContainer}>
                           <View style={[styles.iconBg, { backgroundColor: isPT ? COLORS.ptIconBg : COLORS.groupIconBg }]}>
                              <CalendarDays color={isPT ? COLORS.primary : COLORS.groupIcon} size={22} />
                           </View>
                           <View style={styles.textContainer}>
                              <Text style={styles.itemTitle}>{isPT ? 'Tập PT Cá nhân' : item.groupClass?.name}</Text>
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
                  </View>
               );
            })}
            {schedule.length === 0 && (
               <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Chưa có lịch hẹn nào</Text>
                  <Text style={styles.emptySubtitle}>Bạn có thể đặt lịch PT hoặc Tham gia CLB nhóm qua Web</Text>
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
      letterSpacing: -0.5,
   },
   headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   addButton: {
      width: 40,
      height: 40,
      backgroundColor: COLORS.primary,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
   },
   iconButton: {
      width: 40,
      height: 40,
      backgroundColor: COLORS.card,
      borderRadius: 20,
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
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
   },
   textContainer: {
      flex: 1,
   },
   itemTitle: {
      color: COLORS.textMain,
      fontWeight: '800',
      fontSize: 18,
   },
   itemSubtitle: {
      color: COLORS.textSecondary,
      marginTop: 4,
      fontSize: 14,
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
      fontWeight: '700',
      fontSize: 14,
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
   }
});

