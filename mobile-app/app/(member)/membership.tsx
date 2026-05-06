import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { memberService } from '@/services/memberApi';
import { useRouter } from 'expo-router';
import { CreditCard, Calendar, Clock, Crown, ChevronRight, Check } from 'lucide-react-native';
import * as Linking from 'expo-linking';

const COLORS = {
  background: '#020617',
  card: '#0f172a',
  primary: '#0ea5e9',
  textMain: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  accent: '#f59e0b'
};

const TAG_MAP: Record<string, string> = {
  'GOLD': 'VÀNG',
  'DIAMOND': 'KIM CƯƠNG'
};

const TAG_COLORS: Record<string, string> = {
  'GOLD': '#f59e0b',
  'DIAMOND': '#0ea5e9'
};

export default function MembershipScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeSub, setActiveSub] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    loadData();

    const sub = Linking.addEventListener('url', (event) => {
      const { queryParams } = Linking.parse(event.url);
      if (queryParams?.refresh === 'true') {
        console.log('Payment success, refreshing data...');
        loadData();
      }
    });

    return () => sub.remove();
  }, []);

  const loadData = async () => {
    try {
      const [dash, planRes] = await Promise.all([
        memberService.getDashboard(),
        memberService.getMembershipPlans()
      ]);
      setActiveSub(dash.activeSubscription);
      setPlans(planRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId: number) => {
    Alert.alert(
      'Xác nhận đăng ký',
      'Bạn có chắc chắn muốn đăng ký gói tập này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            setBuying(true);
            try {
              const plan = plans.find(p => p.id === planId);
              const redirectUrl = Linking.createURL('/', { queryParams: { refresh: 'true' } });
              console.log('App DeepLink with Refresh:', redirectUrl);

              const result = await memberService.createMomoPayment(plan.price, planId, redirectUrl);

              if (result.payUrl) {
                Alert.alert(
                  'Thanh toán MoMo',
                  'Hệ thống sẽ chuyển bạn đến ứng dụng MoMo để thanh toán.',
                  [
                    { text: 'Để sau', style: 'cancel' },
                    { text: 'Thanh toán ngay', onPress: () => Linking.openURL(result.payUrl) }
                  ]
                );
              } else {
                throw new Error('Không lấy được link thanh toán');
              }
            } catch (e: any) {
              Alert.alert('Lỗi', e.response?.data?.error || 'Không thể tạo giao dịch MoMo');
            } finally {
              setBuying(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hội Viên & Gói Tập</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.sectionTitle}>Gói tập hiện tại</Text>
        {activeSub ? (
          <View style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <View style={styles.crownIcon}>
                <Crown color={COLORS.accent} size={24} />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.planName}>{activeSub.plan?.name}</Text>
                  {activeSub.plan?.tag && (
                    <View style={[styles.tagBadge, { backgroundColor: TAG_COLORS[activeSub.plan.tag] + '20', borderColor: TAG_COLORS[activeSub.plan.tag] }]}>
                      <Text style={[styles.tagText, { color: TAG_COLORS[activeSub.plan.tag] }]}>{TAG_MAP[activeSub.plan.tag]}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.expiryText}>Hết hạn: {new Date(activeSub.endDate).toLocaleDateString('vi-VN')}</Text>
              </View>
              <View style={styles.daysBadge}>
                <Text style={styles.daysCount}>{getRemainingDays(activeSub.endDate)}</Text>
                <Text style={styles.daysLabel}>Ngày</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>PT SESSIONS</Text>
                <Text style={styles.statValue}>{activeSub.remainingPtSessions}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>TRẠNG THÁI</Text>
                <Text style={[styles.statValue, { color: '#10b981' }]}>{activeSub.status}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Bạn chưa đăng ký gói tập nào</Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Đăng ký gói mới / Gia hạn</Text>
        {plans.map(plan => (
          <TouchableOpacity
            key={plan.id}
            style={styles.planCard}
            onPress={() => handlePurchase(plan.id)}
            disabled={buying}
          >
            <View style={styles.planInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={styles.planTitle}>{plan.name}</Text>
                {plan.tag && (
                  <View style={[styles.tagBadge, { backgroundColor: TAG_COLORS[plan.tag] + '10', borderColor: TAG_COLORS[plan.tag] }]}>
                    <Text style={[styles.tagText, { color: TAG_COLORS[plan.tag], fontSize: 10 }]}>{TAG_MAP[plan.tag]}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.planPrice}>{plan.price.toLocaleString()}đ</Text>
              <View style={styles.planMeta}>
                <View style={styles.metaItem}>
                  <Calendar color={COLORS.textSecondary} size={14} />
                  <Text style={styles.metaText}>{plan.durationDays} ngày</Text>
                </View>
                <View style={styles.metaItem}>
                  <Check color={COLORS.textSecondary} size={14} />
                  <Text style={styles.metaText}>{plan.ptSessions} buổi PT</Text>
                </View>
              </View>
            </View>
            <View style={styles.buyBtn}>
              <ChevronRight color={COLORS.primary} size={24} />
            </View>
          </TouchableOpacity>
        ))}
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
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 16,
  },
  activeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  crownIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  planName: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '900',
  },
  expiryText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  daysBadge: {
    marginLeft: 'auto',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderRadius: 16,
    minWidth: 60,
  },
  daysCount: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  daysLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  statValue: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: '900',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  emptyCard: {
    padding: 40,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  planCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '900',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: '800',
  },
  planPrice: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '900',
    marginVertical: 4,
  },
  planMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  buyBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
