import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { memberService } from '@/services/memberApi';
import { useRouter } from 'expo-router';
import { Calendar, Clock, Crown, ChevronRight, Check, Dumbbell, Sparkles, Wallet, RefreshCw, Zap } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { KINETIC_THEME, KINETIC_FONTS } from '@/constants/theme';
import { formatDate, formatVND } from '@/libs/utils';

const TAG_MAP: Record<string, string> = {
  'GOLD': 'HỘI VIÊN VÀNG',
  'DIAMOND': 'KIM CƯƠNG VIP',
  'SILVER': 'CƠ BẢN',
  'PT_ADDON': 'GÓI BUỔI PT',
  'TRIAL': 'TRẢI NGHIỆM'
};

const TAG_COLORS: Record<string, string> = {
  'GOLD': '#F59E0B',
  'DIAMOND': '#A855F7',
  'SILVER': '#94A3B8',
  'PT_ADDON': KINETIC_THEME.accentPrimary,
  'TRIAL': '#38BDF8'
};

export default function MembershipScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeSub, setActiveSub] = useState<any>(null);
  const [remainingPtSessions, setRemainingPtSessions] = useState<number>(0);
  const [plans, setPlans] = useState<any[]>([]);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    loadData();

    const sub = Linking.addEventListener('url', (event) => {
      const { queryParams } = Linking.parse(event.url);
      if (queryParams?.refresh === 'true') {
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
      setActiveSub(dash.activeSubscription || null);
      setRemainingPtSessions(dash.remainingPtSessions || 0);
      setPlans(planRes.data || []);
    } catch (e) {
      console.error('Error loading membership data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (plan: any) => {
    Alert.alert(
      'Xác nhận đăng ký gói',
      `Bạn có chắc chắn muốn đăng ký gói "${plan.name}" với giá ${formatVND(plan.price)}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thanh toán MoMo',
          onPress: async () => {
            setBuying(true);
            try {
              const redirectUrl = Linking.createURL('/', { queryParams: { refresh: 'true' } });
              const result = await memberService.createMomoPayment(plan.price, plan.id, redirectUrl);

              if (result.payUrl) {
                Alert.alert(
                  'Cổng thanh toán MoMo',
                  'Chuyển sang ứng dụng MoMo để hoàn tất thanh toán an toàn.',
                  [
                    { text: 'Để sau', style: 'cancel' },
                    { text: 'Mở MoMo ngay', onPress: () => Linking.openURL(result.payUrl) }
                  ]
                );
              } else {
                throw new Error('Không lấy được liên kết thanh toán MoMo');
              }
            } catch (e: any) {
              Alert.alert('Lỗi', e.response?.data?.error || e.message || 'Không thể tạo giao dịch thanh toán');
            } finally {
              setBuying(false);
            }
          }
        }
      ]
    );
  };

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={KINETIC_THEME.accentPrimary} />
        <Text style={styles.loadingText}>Đang tải thông tin gói tập...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>QUẢN LÝ DỊCH VỤ</Text>
          <Text style={styles.headerTitle}>Gói Tập & Quyền Lợi</Text>
        </View>
        <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
          <RefreshCw color={KINETIC_THEME.textMuted} size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet & Active Plan Banner */}
        <View style={styles.sectionHeader}>
          <Crown size={16} color={KINETIC_THEME.accentPrimary} />
          <Text style={styles.sectionTitle}>THẺ HỘI VIÊN ĐANG HOẠT ĐỘNG</Text>
        </View>

        {activeSub ? (
          <View style={styles.activeCard}>
            {/* Top row */}
            <View style={styles.activeTop}>
              <View style={styles.planBadgeContainer}>
                <View style={styles.crownCircle}>
                  <Crown color={KINETIC_THEME.textOnAccent} size={18} />
                </View>
                <View>
                  <Text style={styles.activePlanName}>{activeSub.plan?.name}</Text>
                  {activeSub.plan?.tag && (
                    <View
                      style={[
                        styles.tagBadge,
                        {
                          backgroundColor: (TAG_COLORS[activeSub.plan.tag] || '#888') + '20',
                          borderColor: TAG_COLORS[activeSub.plan.tag] || '#888',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          { color: TAG_COLORS[activeSub.plan.tag] || '#888' },
                        ]}
                      >
                        {TAG_MAP[activeSub.plan.tag] || activeSub.plan.tag}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.daysBadge}>
                <Text style={styles.daysCount}>{getRemainingDays(activeSub.endDate)}</Text>
                <Text style={styles.daysLabel}>NGÀY</Text>
              </View>
            </View>

            {/* Wallet Stat Highlight */}
            <View style={styles.walletBox}>
              <View style={styles.walletItem}>
                <View style={styles.walletIcon}>
                  <Dumbbell size={18} color={KINETIC_THEME.accentPrimary} />
                </View>
                <View>
                  <Text style={styles.walletLabel}>VÍ BUỔI TẬP KÈM PT</Text>
                  <Text style={styles.walletValue}>
                    {remainingPtSessions} <Text style={styles.walletUnit}>buổi</Text>
                  </Text>
                </View>
              </View>
              <View style={styles.walletDivider} />
              <View style={styles.walletItem}>
                <View style={styles.walletIcon}>
                  <Clock size={18} color={KINETIC_THEME.textPrimary} />
                </View>
                <View>
                  <Text style={styles.walletLabel}>HẠN SỬ DỤNG</Text>
                  <Text style={styles.walletDate}>{formatDate(activeSub.endDate)}</Text>
                </View>
              </View>
            </View>

            {/* Contract Snapshot Note */}
            <View style={styles.contractRow}>
              <Text style={styles.contractText}>
                Số buổi cấp theo hợp đồng: {activeSub.grantedPtSessions ?? activeSub.plan?.ptSessions ?? 0} buổi
              </Text>
              <View style={styles.activeStatusPill}>
                <View style={styles.activeDot} />
                <Text style={styles.activeStatusText}>ACTIVE</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Crown size={32} color={KINETIC_THEME.textMuted} />
            <Text style={styles.emptyTitle}>Chưa Kích Hoạt Thẻ Hội Viên</Text>
            <Text style={styles.emptyDesc}>
              Bạn hiện chưa có gói tập đang hoạt động. Hãy lựa chọn một gói bên dưới để bắt đầu rèn luyện!
            </Text>
          </View>
        )}

        {/* Available Plans Catalog */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Zap size={16} color={KINETIC_THEME.accentPrimary} />
          <Text style={styles.sectionTitle}>DANH MỤC GÓI TẬP & NÂNG CẤP</Text>
        </View>

        <View style={styles.planList}>
          {plans.map((plan) => {
            const isAddon = plan.tag === 'PT_ADDON';
            const tagColor = TAG_COLORS[plan.tag] || KINETIC_THEME.accentPrimary;

            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  isAddon && styles.addonCardBorder,
                ]}
                onPress={() => handlePurchase(plan)}
                disabled={buying}
                activeOpacity={0.7}
              >
                <View style={styles.planCardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.planTitleRow}>
                      <Text style={styles.planTitle}>{plan.name}</Text>
                      {plan.tag && (
                        <View
                          style={[
                            styles.tagBadge,
                            {
                              backgroundColor: tagColor + '20',
                              borderColor: tagColor,
                            },
                          ]}
                        >
                          <Text style={[styles.tagText, { color: tagColor }]}>
                            {TAG_MAP[plan.tag] || plan.tag}
                          </Text>
                        </View>
                      )}
                    </View>
                    {plan.description ? (
                      <Text style={styles.planDesc}>{plan.description}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Price and Details */}
                <View style={styles.planCardFooter}>
                  <View style={styles.featurePills}>
                    {!isAddon && (
                      <View style={styles.pill}>
                        <Calendar size={13} color={KINETIC_THEME.textMuted} />
                        <Text style={styles.pillText}>{plan.durationDays} ngày</Text>
                      </View>
                    )}
                    {plan.ptSessions > 0 && (
                      <View style={[styles.pill, styles.pillHighlight]}>
                        <Dumbbell size={13} color={KINETIC_THEME.accentPrimary} />
                        <Text style={[styles.pillText, { color: KINETIC_THEME.accentPrimary }]}>
                          +{plan.ptSessions} buổi PT
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{formatVND(plan.price)}</Text>
                    <View style={styles.buyArrow}>
                      <ChevronRight size={18} color={KINETIC_THEME.textOnAccent} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: KINETIC_THEME.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: KINETIC_THEME.textMuted,
    fontSize: 14,
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
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: KINETIC_THEME.surface,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: KINETIC_THEME.textMuted,
    letterSpacing: 1.2,
  },
  activeCard: {
    backgroundColor: KINETIC_THEME.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    padding: 20,
    overflow: 'hidden',
  },
  activeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  crownCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: KINETIC_THEME.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePlanName: {
    fontSize: 18,
    fontWeight: '800',
    color: KINETIC_THEME.textPrimary,
  },
  tagBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  daysBadge: {
    backgroundColor: KINETIC_THEME.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  daysCount: {
    fontSize: 18,
    fontWeight: '800',
    color: KINETIC_THEME.accentPrimary,
  },
  daysLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: KINETIC_THEME.textMuted,
    letterSpacing: 0.5,
  },
  walletBox: {
    marginTop: 18,
    backgroundColor: KINETIC_THEME.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: KINETIC_THEME.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: KINETIC_THEME.textMuted,
    letterSpacing: 0.5,
  },
  walletValue: {
    fontSize: 18,
    fontWeight: '800',
    color: KINETIC_THEME.accentPrimary,
    marginTop: 1,
  },
  walletUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: KINETIC_THEME.textMuted,
  },
  walletDivider: {
    width: 1,
    height: 32,
    backgroundColor: KINETIC_THEME.border,
    marginHorizontal: 8,
  },
  walletDate: {
    fontSize: 13,
    fontWeight: '700',
    color: KINETIC_THEME.textPrimary,
    marginTop: 2,
  },
  contractRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: KINETIC_THEME.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contractText: {
    fontSize: 11,
    color: KINETIC_THEME.textMuted,
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  emptyCard: {
    backgroundColor: KINETIC_THEME.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  planList: {
    gap: 14,
  },
  planCard: {
    backgroundColor: KINETIC_THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    padding: 16,
  },
  addonCardBorder: {
    borderColor: 'rgba(200, 241, 53, 0.35)',
  },
  planCardHeader: {
    marginBottom: 12,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: KINETIC_THEME.textPrimary,
    flex: 1,
  },
  planDesc: {
    fontSize: 12,
    color: KINETIC_THEME.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  planCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: KINETIC_THEME.border,
    paddingTop: 12,
  },
  featurePills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: KINETIC_THEME.background,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillHighlight: {
    borderColor: 'rgba(200, 241, 53, 0.3)',
    backgroundColor: 'rgba(200, 241, 53, 0.08)',
  },
  pillText: {
    fontSize: 11,
    color: KINETIC_THEME.textMuted,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: KINETIC_THEME.textPrimary,
  },
  buyArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: KINETIC_THEME.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
