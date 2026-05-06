import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { CreditCard, LogOut, ArrowRight } from 'lucide-react-native';
import { gymStorage } from '@/libs/storage';
import { setAuthToken } from '@/services/apiClient';
import { useRouter } from 'expo-router';
import { useDashboard } from '@/hooks/useDashboard';
import { formatDate, getRemainingDays } from '@/libs/utils';

const COLORS = {
  background: '#020617',
  card: '#0f172a',
  primary: '#0ea5e9',
  textMain: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  success: '#10b981'
};

export default function DashboardScreen() {
  const router = useRouter();
  const { dash, me, refreshing, onRefresh } = useDashboard();

  const handleLogout = async () => {
    await gymStorage.deleteItem('gym_token');
    await gymStorage.deleteItem('user_role');
    setAuthToken(null);
    router.replace('/login' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary}/>}>
        <View style={styles.header}>
           <View>
              <Text style={styles.headerLabel}>Thẻ Hội Viên</Text>
              <Text style={styles.headerTitle}>{me?.fullName || 'Hội Viên'}</Text>
           </View>
           <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut color="#EF4444" size={20}/>
           </TouchableOpacity>
        </View>

        <View style={styles.qrSection}>
           <View style={styles.qrContainer}>
              <QRCode 
                 value={`TITAN-GATE-${me?.id || 0}`} 
                 size={200} 
                 color={COLORS.background}
                 backgroundColor="transparent"
              />
           </View>
           <Text style={styles.qrHint}>Hãy đưa mã này vào máy quét tại cổng để Check-in vào phòng tập.</Text>
        </View>

        <View style={styles.content}>
           <Text style={styles.sectionTitle}>Gói tập của bạn</Text>
           {dash?.activeSubscription ? (() => {
              const sub = dash.activeSubscription;
              const remainingDays = getRemainingDays(sub.endDate);
              
              return (
              <View style={styles.planCard}>
                  <View style={styles.planHeader}>
                     <CreditCard color={COLORS.primary} size={24} style={{ marginRight: 12 }} />
                     <Text style={styles.planName}>{sub.plan.name}</Text>
                     <TouchableOpacity onPress={() => router.push('/(member)/membership' as any)}>
                        <ArrowRight color={COLORS.primary} size={20} />
                     </TouchableOpacity>
                  </View>
                 
                 <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Hạn sử dụng</Text>
                    <Text style={styles.infoValue}>{formatDate(sub.endDate)}</Text>
                 </View>
                 <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Thời gian còn lại</Text>
                    <Text style={styles.infoValue}>{remainingDays > 0 ? `${remainingDays} ngày` : 'Hết hạn'}</Text>
                 </View>
                 <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Buổi tập PT còn lại</Text>
                    <Text style={styles.infoValue}>{dash.remainingPtSessions} buổi</Text>
                 </View>
                  <View style={styles.statusRow}>
                     <Text style={styles.infoLabel}>Trạng thái</Text>
                     <Text style={styles.statusText}>● ĐANG HOẠT ĐỘNG</Text>
                  </View>

                  <TouchableOpacity 
                     onPress={() => router.push('/(member)/membership' as any)}
                     style={styles.upgradeButton}
                  >
                     <Text style={styles.upgradeButtonText}>Gia hạn / Nâng cấp gói</Text>
                  </TouchableOpacity>
               </View>
              );
           })() : (
               <View style={styles.emptyCard}>
                  <Text style={styles.infoLabel}>Bạn hiện chưa có gói tập nào đang kích hoạt.</Text>
                  <TouchableOpacity 
                     onPress={() => router.push('/(member)/membership' as any)}
                     style={[styles.upgradeButton, { marginTop: 16, width: '100%' }]}
                  >
                     <Text style={styles.upgradeButtonText}>Đăng ký ngay</Text>
                  </TouchableOpacity>
               </View>
           )}
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: '700',
  },
  headerTitle: {
    color: COLORS.textMain,
    fontSize: 24,
    fontWeight: '900',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 99,
  },
  qrSection: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 32,
  },
  qrContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  qrHint: {
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 24,
    textAlign: 'center',
    paddingHorizontal: 32,
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    color: COLORS.textMain,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '900',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: COLORS.textMain,
    fontWeight: '700',
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  statusText: {
    color: COLORS.success,
    fontWeight: '800',
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  upgradeButtonText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 14,
  }
});

