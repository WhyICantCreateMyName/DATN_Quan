import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, ChevronRight, User, UserCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTrainerClients } from '@/hooks/useTrainerClients';

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

export default function ClientsScreen() {
  const router = useRouter();
  const { data: clients, refreshing, onRefresh } = useTrainerClients();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>QUẢN LÝ KHÁCH HÀNG</Text>
        <Text style={styles.headerTitle}>Hội Viên Kèm PT</Text>
      </View>

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
        {clients.map((c) => {
          const latest = c.bodyMetrics && c.bodyMetrics.length > 0 ? c.bodyMetrics[0] : null;
          const fat = latest?.bodyFat !== undefined && latest?.bodyFat !== null ? `${latest.bodyFat}%` : '--';
          const muscle = latest?.muscleMass !== undefined && latest?.muscleMass !== null ? `${latest.muscleMass}kg` : '--';

          return (
            <View key={c.id} style={styles.clientCard}>
              <View style={styles.avatar}>
                <User color={COLORS.mutedText} size={22} />
              </View>

              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{c.user?.fullName}</Text>
                <View style={styles.statsRow}>
                  <Activity color={COLORS.accentVolt} size={13} style={{ marginRight: 6 }} />
                  <Text style={styles.statsText}>
                    Mỡ: <Text style={{ color: COLORS.primaryText, fontWeight: '700' }}>{fat}</Text>  |  Cơ: <Text style={{ color: COLORS.primaryText, fontWeight: '700' }}>{muscle}</Text>
                  </Text>
                </View>

                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    onPress={() => router.push(`/(trainer)/client-details/${c.id}` as any)}
                    style={styles.actionBtnPrimary}
                    activeOpacity={0.8}
                  >
                    <UserCircle2 color={COLORS.btnText} size={13} />
                    <Text style={styles.actionBtnPrimaryText}>CHI TIẾT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(`/(trainer)/metrics/${c.id}` as any)}
                    style={styles.actionBtnSecondary}
                    activeOpacity={0.8}
                  >
                    <Activity color={COLORS.accentVolt} size={13} />
                    <Text style={styles.actionBtnSecondaryText}>INBODY</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ChevronRight color={COLORS.mutedText} size={18} />
            </View>
          );
        })}

        {clients.length === 0 && (
          <View style={styles.emptyContainer}>
            <User color={COLORS.mutedText} size={36} style={{ marginBottom: 12, opacity: 0.5 }} />
            <Text style={styles.emptyTitle}>Chưa có học viên nào</Text>
            <Text style={styles.emptySubtitle}>
              Các học viên đặt lịch hoặc đo Inbody sẽ hiển thị tại đây.
            </Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerSubtitle: {
    color: COLORS.accentVolt,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primaryText,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  clientCard: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    color: COLORS.primaryText,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsText: {
    color: COLORS.mutedText,
    fontSize: 12,
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentVolt,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5,
  },
  actionBtnPrimaryText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.btnText,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5,
  },
  actionBtnSecondaryText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryText,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: COLORS.primaryText,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    color: COLORS.mutedText,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 240,
  },
});
