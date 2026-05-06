import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { trainerService } from '@/services/trainerApi';
import { ChevronLeft, Calendar, Dumbbell, History, Activity, User, Phone, Award } from 'lucide-react-native';

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

export default function ClientDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);

  const load = async () => {
    try {
      const data = await trainerService.getClientDetail(id as string);
      setClient(data);
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể tải thông tin học viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  const upcomingBookings = client.bookings?.filter((b: any) => b.status === 'CONFIRMED' || b.status === 'PENDING') || [];
  const workoutHistory = client.workoutLogs || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={COLORS.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HỒ SƠ HỌC VIÊN</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Client Info Card */}
        <View style={styles.clientCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <User color={COLORS.primary} size={32} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>{client.user?.fullName}</Text>
              <View style={styles.phoneRow}>
                <Phone color={COLORS.textSecondary} size={14} style={{ marginRight: 4 }} />
                <Text style={styles.phoneText}>{client.user?.phone}</Text>
              </View>
            </View>
          </View>

          <View style={styles.membershipRow}>
             <Award color={COLORS.primary} size={16} />
             <Text style={styles.membershipText}>
                Gói tập: {client.subscriptions?.[0]?.plan?.name || 'Chưa đăng ký'}
             </Text>
          </View>
        </View>

        {/* Section: Upcoming Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar color={COLORS.primary} size={20} />
            <Text style={styles.sectionTitle}>LỊCH TẬP SẮP TỚI</Text>
          </View>
          
          {upcomingBookings.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có lịch hẹn nào sắp tới.</Text>
          ) : (
            upcomingBookings.map((b: any) => (
              <View key={b.id} style={styles.bookingItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookingDate}>
                    {new Date(b.startTime).toLocaleDateString('vi-VN')} - {new Date(b.startTime).getHours()}:00
                  </Text>
                  <Text style={styles.bookingStatus}>{b.status}</Text>
                </View>
                {b.status === 'CONFIRMED' && !b.workoutLog && (
                  <TouchableOpacity 
                    onPress={() => router.push({ pathname: '/(trainer)/workout/[id]', params: { id: client.id, bookingId: b.id } } as any)}
                    style={styles.planBtn}
                  >
                    <Dumbbell color="#000" size={14} />
                    <Text style={styles.planBtnText}>Lên giáo án</Text>
                  </TouchableOpacity>
                )}
                {b.workoutLog && (
                   <View style={styles.plannedBadge}>
                      <Text style={styles.plannedText}>Đã có giáo án</Text>
                   </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Section: Workout History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <History color={COLORS.secondary} size={20} />
            <Text style={styles.sectionTitle}>LỊCH SỬ GIÁO ÁN</Text>
          </View>
          
          {workoutHistory.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có lịch sử giáo án.</Text>
          ) : (
            workoutHistory.map((log: any) => (
              <View key={log.id} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{new Date(log.date).toLocaleDateString('vi-VN')}</Text>
                  <Text style={styles.historyNotes} numberOfLines={1}>{log.notes}</Text>
                </View>
                <View style={styles.exerciseTags}>
                  {log.exercises?.slice(0, 3).map((ex: any) => (
                    <View key={ex.id} style={styles.tag}>
                      <Text style={styles.tagText}>{ex.name}</Text>
                    </View>
                  ))}
                  {log.exercises?.length > 3 && <Text style={styles.moreText}>+{log.exercises.length - 3} bài khác</Text>}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Action: New Inbody */}
        <TouchableOpacity 
           onPress={() => router.push(`/(trainer)/metrics/${client.id}` as any)}
           style={styles.metricAction}
        >
           <Activity color={COLORS.primary} size={20} />
           <Text style={styles.metricActionText}>CẬP NHẬT CHỈ SỐ INBODY</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 24, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 16, fontWeight: '900', marginRight: 40 },
  clientCard: { margin: 24, backgroundColor: COLORS.card, borderRadius: 32, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  clientName: { color: '#fff', fontSize: 24, fontWeight: '900' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  phoneText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  membershipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 12, borderRadius: 16 },
  membershipText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  emptyText: { color: COLORS.textSecondary, fontSize: 13, fontStyle: 'italic', marginLeft: 8 },
  bookingItem: { backgroundColor: COLORS.card, padding: 16, borderRadius: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  bookingDate: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  bookingStatus: { color: COLORS.primary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  planBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  planBtnText: { color: '#000', fontWeight: '900', fontSize: 12 },
  plannedBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  plannedText: { color: COLORS.success, fontWeight: '800', fontSize: 12 },
  historyItem: { backgroundColor: COLORS.card, padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  historyDate: { color: COLORS.secondary, fontWeight: '800', fontSize: 14 },
  historyNotes: { color: COLORS.textSecondary, fontSize: 13, flex: 1, marginLeft: 12, textAlign: 'right' },
  exerciseTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#1e293b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: COLORS.textMain, fontSize: 11, fontWeight: '600' },
  moreText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', alignSelf: 'center' },
  metricAction: { marginHorizontal: 24, backgroundColor: 'rgba(14, 165, 233, 0.1)', paddingVertical: 18, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(14, 165, 233, 0.2)' },
  metricActionText: { color: COLORS.secondary, fontWeight: '900', fontSize: 14, letterSpacing: 1 }
});
