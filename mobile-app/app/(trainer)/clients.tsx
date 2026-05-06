import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, ChevronRight, ClipboardList, User, UserCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTrainerClients } from '@/hooks/useTrainerClients';

const COLORS = {
  background: '#020617',
  card: '#0f172a',
  primary: '#f59e0b',
  textMain: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  avatarBg: '#111827'
};

export default function ClientsScreen() {
  const router = useRouter();
  const { data: clients, refreshing, onRefresh } = useTrainerClients();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Theo Dõi</Text>
        <Text style={styles.headerSubtitle}>Danh sách Hội viên</Text>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} style={styles.scroll}>
        {clients.map(c => {
          const latest = c.bodyMetrics && c.bodyMetrics.length > 0 ? c.bodyMetrics[0] : null;
          const fat = latest?.bodyFat || '--';
          const muscle = latest?.muscleMass || '--';

          return (
            <View
              key={c.id}
              style={styles.clientCard}
            >
              <View style={styles.avatar}>
                <User color="#9ca3af" size={24} />
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{c.user?.fullName}</Text>
                <View style={styles.statsRow}>
                  <Activity color={COLORS.primary} size={14} style={{ marginRight: 4 }} />
                  <Text style={styles.statsText}>Fat: {fat}%  |  Cơ: {muscle}kg</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <TouchableOpacity
                    onPress={() => router.push(`/(trainer)/client-details/${c.id}` as any)}
                    style={styles.actionBtn}
                  >
                    <UserCircle2 color="#000" size={14} />
                    <Text style={styles.actionBtnText}>CHI TIẾT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push(`/(trainer)/metrics/${c.id}` as any)}
                    style={[styles.actionBtn, { backgroundColor: '#1e293b' }]}
                  >
                    <Activity color={COLORS.primary} size={14} />
                    <Text style={[styles.actionBtnText, { color: COLORS.textSecondary }]}>INBODY</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <ChevronRight color="#4b5563" size={20} />
            </View>

          );
        })}
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
    paddingTop: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textMain,
  },
  headerSubtitle: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
  },
  scroll: {
    paddingHorizontal: 24,
  },
  clientCard: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 32,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    color: COLORS.textMain,
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000'
  }
});

