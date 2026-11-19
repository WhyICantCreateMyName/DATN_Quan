import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { CreditCard, LogOut, ArrowRight, UserCircle2 } from 'lucide-react-native';
import { gymStorage } from '@/libs/storage';
import { setAuthToken } from '@/services/apiClient';
import { useRouter } from 'expo-router';
import { useDashboard } from '@/hooks/useDashboard';
import { formatDate, getRemainingDays } from '@/libs/utils';
import { KINETIC_THEME } from '@/constants/theme';

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
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={KINETIC_THEME.accentPrimary}/>}>
        <View style={styles.header}>
           <View style={styles.headerProfile}>
              <View style={styles.avatarFrame}>
                 {me?.avatarUrl ? (
                    <Image source={{ uri: me.avatarUrl }} style={styles.avatarImg} />
                 ) : (
                    <UserCircle2 color={KINETIC_THEME.accentPrimary} size={36} />
                 )}
              </View>
              <View>
                 <Text style={styles.headerLabel}>THẺ HỘI VIÊN</Text>
                 <Text style={styles.headerTitle}>{me?.fullName || 'Hội Viên'}</Text>
              </View>
           </View>
           <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut color={KINETIC_THEME.accentSecondary} size={18}/>
           </TouchableOpacity>
        </View>

        <View style={styles.qrSection}>
           <View style={styles.qrContainer}>
              <QRCode 
                 value={`TITAN-GATE-${me?.id || 0}`} 
                 size={190} 
                 color={KINETIC_THEME.background}
                 backgroundColor="transparent"
              />
           </View>
           <Text style={styles.qrHint}>Đưa mã QR này vào máy quét tại cổng để Check-in vào phòng tập.</Text>
        </View>

        <View style={styles.content}>
           <Text style={styles.sectionTitle}>GÓI TẬP HIỆN TẠI</Text>
           {dash?.activeSubscription ? (() => {
              const sub = dash.activeSubscription;
              const remainingDays = getRemainingDays(sub.endDate);
              
              return (
              <View style={styles.planCard}>
                  <View style={styles.planHeader}>
                     <CreditCard color={KINETIC_THEME.accentPrimary} size={22} style={{ marginRight: 10 }} />
                     <Text style={styles.planName}>{sub.plan.name}</Text>
                     <TouchableOpacity onPress={() => router.push('/(member)/membership' as any)}>
                        <ArrowRight color={KINETIC_THEME.accentPrimary} size={20} />
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
                    <Text style={styles.infoLabel}>Ví buổi tập PT</Text>
                    <Text style={[styles.infoValue, { color: KINETIC_THEME.accentPrimary, fontWeight: '800' }]}>
                       {dash?.remainingPtSessions ?? 0} buổi
                    </Text>
                 </View>

                 <View style={styles.statusRow}>
                    <Text style={styles.infoLabel}>Trạng thái</Text>
                    <Text style={styles.statusText}>{sub.status === 'ACTIVE' ? '● Đang hoạt động' : sub.status}</Text>
                 </View>
              </View>
              );
           })() : (
              <View style={styles.emptyCard}>
                 <Text style={{ color: KINETIC_THEME.textMuted, fontSize: 14 }}>Bạn chưa đăng ký gói tập nào đang hoạt động.</Text>
                 <TouchableOpacity onPress={() => router.push('/(member)/membership' as any)} style={styles.upgradeButton}>
                    <Text style={styles.upgradeButtonText}>XEM DANH MỤC GÓI TẬP</Text>
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
    backgroundColor: KINETIC_THEME.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: KINETIC_THEME.border,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarFrame: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: KINETIC_THEME.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: KINETIC_THEME.accentPrimary,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  headerLabel: {
    color: KINETIC_THEME.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerTitle: {
    color: KINETIC_THEME.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: KINETIC_THEME.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: KINETIC_THEME.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  qrHint: {
    color: KINETIC_THEME.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: KINETIC_THEME.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: KINETIC_THEME.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: KINETIC_THEME.border,
  },
  planName: {
    flex: 1,
    color: KINETIC_THEME.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    color: KINETIC_THEME.textMuted,
    fontSize: 13,
  },
  infoValue: {
    color: KINETIC_THEME.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: KINETIC_THEME.border,
  },
  statusText: {
    color: KINETIC_THEME.success,
    fontWeight: '800',
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: KINETIC_THEME.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: KINETIC_THEME.accentPrimary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 18,
    width: '100%',
  },
  upgradeButtonText: {
    color: KINETIC_THEME.textOnAccent,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  }
});
