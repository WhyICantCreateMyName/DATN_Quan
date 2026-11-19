import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Dumbbell, Target, Banknote, CalendarCheck, TrendingUp, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrainerDashboard } from '@/hooks/useTrainerDashboard';
import { formatVND } from '@/libs/utils';
import { useRouter } from 'expo-router';

// High-Performance Kinetic Dark Tokens
const COLORS = {
  background: '#0E100F',
  surface: '#1A1D1B',
  surfaceLight: '#242826',
  border: '#282C29',
  primaryText: '#F4F5F0',
  mutedText: '#8E9490',
  accentVolt: '#C8F135',
  accentCoral: '#FF5A36',
  btnText: '#0E100F'
};

export default function DashboardScreen() {
  const router = useRouter();
  const { data: stats, refreshing, onRefresh } = useTrainerDashboard();

  const commission = stats.commissionEarned !== undefined ? stats.commissionEarned : stats.commissionEstimated;
  const kpi = stats.kpi;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accentVolt}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>THÁNG NÀY</Text>
          <Text style={styles.headerTitle}>Năng Suất Của Bạn</Text>
        </View>

        {/* Thẻ Thu Nhập Hoa Hồng Thực Nhận */}
        <View style={styles.commissionCard}>
          <View style={styles.commissionHeader}>
            <View style={styles.iconCircle}>
              <Banknote color={COLORS.accentVolt} size={22} />
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>REAL-TIME</Text>
            </View>
          </View>

          <Text style={styles.commissionLabel}>Thu nhập hoa hồng tích lũy</Text>
          <Text style={styles.commissionValue}>{formatVND(commission)}</Text>
          <Text style={styles.commissionNote}>
            Tự động ghi nhận từ buổi dạy PT & bán gói tập
          </Text>
        </View>

        {/* 2 Thống kê số buổi */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: 'rgba(200, 241, 53, 0.12)' }]}>
              <CalendarCheck color={COLORS.accentVolt} size={20} />
            </View>
            <Text style={styles.statNumber}>{stats.completedThisMonth}</Text>
            <Text style={styles.statLabel}>Buổi đã dạy</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: 'rgba(255, 90, 54, 0.12)' }]}>
              <Target color={COLORS.accentCoral} size={20} />
            </View>
            <Text style={styles.statNumber}>{stats.pendingClasses}</Text>
            <Text style={styles.statLabel}>Buổi chờ dạy</Text>
          </View>
        </View>

        {/* Thẻ KPI Nếu có */}
        {kpi && (
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TrendingUp color={COLORS.accentVolt} size={18} />
                <Text style={styles.kpiTitle}>Chỉ Tiêu Doanh Số (KPI)</Text>
              </View>
              <Text style={styles.kpiPercent}>{kpi.achievementPercent}%</Text>
            </View>

            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(kpi.achievementPercent, 100)}%` }
                ]}
              />
            </View>

            <View style={styles.kpiFooter}>
              <Text style={styles.kpiAmount}>
                Đạt: <Text style={{ color: COLORS.accentVolt }}>{formatVND(kpi.achievedAmount)}</Text>
              </Text>
              <Text style={styles.kpiAmount}>
                Mục tiêu: {formatVND(kpi.targetAmount)}
              </Text>
            </View>
          </View>
        )}

        {/* Nút thao tác nhanh */}
        <TouchableOpacity
          onPress={() => router.push('/(trainer)/clients' as any)}
          style={styles.actionCard}
          activeOpacity={0.8}
        >
          <View style={styles.actionIcon}>
            <Dumbbell color={COLORS.btnText} size={22} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Quản lý học viên & Inbody</Text>
            <Text style={styles.actionDesc}>
              Xem tiến độ mỡ/cơ, nhật ký buổi tập và lập giáo án
            </Text>
          </View>
          <ChevronRight color={COLORS.mutedText} size={18} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerLabel: {
    color: COLORS.accentVolt,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerTitle: {
    color: COLORS.primaryText,
    fontSize: 28,
    fontWeight: '900',
  },
  commissionCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
  },
  commissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconCircle: {
    backgroundColor: 'rgba(200, 241, 53, 0.12)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 241, 53, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 53, 0.25)',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accentVolt,
  },
  liveBadgeText: {
    color: COLORS.accentVolt,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  commissionLabel: {
    color: COLORS.mutedText,
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 4,
  },
  commissionValue: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.primaryText,
    letterSpacing: -0.5,
  },
  commissionNote: {
    color: COLORS.mutedText,
    fontSize: 11,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    color: COLORS.primaryText,
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    color: COLORS.mutedText,
    fontWeight: '600',
    fontSize: 12,
    marginTop: 2,
  },
  kpiCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  kpiTitle: {
    color: COLORS.primaryText,
    fontWeight: '800',
    fontSize: 14,
  },
  kpiPercent: {
    color: COLORS.accentVolt,
    fontWeight: '900',
    fontSize: 15,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accentVolt,
    borderRadius: 3,
  },
  kpiFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kpiAmount: {
    color: COLORS.mutedText,
    fontSize: 11,
    fontWeight: '500',
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.accentVolt,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    color: COLORS.primaryText,
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 2,
  },
  actionDesc: {
    color: COLORS.mutedText,
    fontSize: 11,
  },
});
