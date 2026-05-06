import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Dumbbell, Target, Banknote, CalendarCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrainerDashboard } from '@/hooks/useTrainerDashboard';
import { formatVND } from '@/libs/utils';

const COLORS = {
  background: '#020617',
  card: '#0f172a',
  primary: '#f59e0b',
  textMain: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  completed: '#10b981',
  pending: '#3b82f6'
};

export default function DashboardScreen() {
  const { data: stats, refreshing, onRefresh } = useTrainerDashboard();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} style={styles.scroll}>
         <View style={styles.header}>
            <Text style={styles.headerLabel}>Tháng này</Text>
            <Text style={styles.headerTitle}>Năng Suất Của Bạn</Text>
         </View>

         {/* Tổng Hoa Hồng */}
         <View style={styles.commissionCard}>
            <View style={styles.iconCircle}>
               <Banknote color={COLORS.primary} size={24}/>
            </View>
            <Text style={styles.commissionLabel}>Thu nhập ước tính (Hoa hồng)</Text>
            <Text style={styles.commissionValue}>{formatVND(stats.commissionEstimated)}</Text>
         </View>

         <View style={styles.statsRow}>
            <View style={styles.statBox}>
               <CalendarCheck color={COLORS.completed} size={24} style={{ marginBottom: 12 }}/>
               <Text style={styles.statNumber}>{stats.completedThisMonth}</Text>
               <Text style={styles.statLabel}>Buổi đã dạy</Text>
            </View>

            <View style={styles.statBox}>
               <Target color={COLORS.pending} size={24} style={{ marginBottom: 12 }}/>
               <Text style={styles.statNumber}>{stats.pendingClasses}</Text>
               <Text style={styles.statLabel}>Buổi chờ dạy</Text>
            </View>
         </View>

         {/* Nút hành động */}
         <View style={styles.actionCard}>
              <View style={styles.actionIcon}>
                 <Dumbbell color="#111827" size={24}/>
              </View>
              <View style={styles.actionInfo}>
                 <Text style={styles.actionTitle}>Thiết lập giáo án</Text>
                 <Text style={styles.actionDesc}>Lập giáo án Inbody bằng cách chọn học viên bên tab học viên.</Text>
              </View>
         </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    marginBottom: 32,
  },
  headerLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '700',
  },
  headerTitle: {
    color: COLORS.textMain,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 4,
  },
  commissionCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
  },
  iconCircle: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  commissionLabel: {
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
    fontSize: 14,
  },
  commissionValue: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statBox: {
    backgroundColor: COLORS.card,
    flex: 1,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    color: COLORS.textMain,
    fontSize: 32,
    fontWeight: '900',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontSize: 12,
    marginTop: 4,
  },
  actionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 40,
  },
  actionIcon: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    color: COLORS.textMain,
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 2,
  },
  actionDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
  }
});
