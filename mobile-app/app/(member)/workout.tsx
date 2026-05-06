import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { memberService } from '@/services/memberApi';
import { Dumbbell, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react-native';

const COLORS = {
  background: '#020617',
  card: '#0f172a',
  primary: '#0ea5e9',
  textMain: '#ffffff',
  textSecondary: '#64748b',
  border: '#1e293b',
  accent: '#38bdf8'
};

export default function WorkoutLogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = async () => {
    try {
      const data = await memberService.getWorkoutLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().then(() => setRefreshing(false));
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giáo Án Tập Luyện</Text>
        <Text style={styles.headerSubtitle}>Lịch sử bài tập từ PT của bạn</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Dumbbell color={COLORS.border} size={64} />
            <Text style={styles.emptyText}>Chưa có giáo án nào được ghi nhận.</Text>
            <Text style={styles.emptySubText}>Hãy bắt đầu tập luyện cùng PT để theo dõi tiến độ!</Text>
          </View>
        ) : (
          logs.map((log) => (
            <TouchableOpacity
              key={log.id}
              onPress={() => toggleExpand(log.id)}
              activeOpacity={0.7}
              style={[styles.logCard, expandedId === log.id && styles.logCardExpanded]}
            >
              <View style={styles.logHeader}>
                <View style={styles.dateBadge}>
                   <Text style={styles.dateDay}>{new Date(log.date).getDate()}</Text>
                   <Text style={styles.dateMonth}>Tháng {new Date(log.date).getMonth() + 1}</Text>
                </View>
                <View style={styles.logInfo}>
                  <Text style={styles.logTitle}>{log.notes || 'Buổi tập cá nhân'}</Text>
                  <View style={styles.trainerRow}>
                    <User color={COLORS.accent} size={14} style={{ marginRight: 4 }} />
                    <Text style={styles.trainerName}>PT: {log.trainer?.user?.fullName}</Text>
                  </View>
                </View>
                {expandedId === log.id ? <ChevronUp color={COLORS.textSecondary} /> : <ChevronDown color={COLORS.textSecondary} />}
              </View>

              {expandedId === log.id && (
                <View style={styles.detailsContainer}>
                  {log.energyLevel && (
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Thể lực: </Text>
                      <Text style={styles.metaValue}>{log.energyLevel}</Text>
                    </View>
                  )}
                  {log.nutrition && (
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Dinh dưỡng: </Text>
                      <Text style={styles.metaValue}>{log.nutrition}</Text>
                    </View>
                  )}

                  <View style={styles.exerciseList}>
                    <Text style={styles.listTitle}>Danh sách bài tập:</Text>
                    {log.exercises.map((ex: any, idx: number) => (
                      <View key={ex.id} style={styles.exerciseItem}>
                        <View style={styles.exNumberContainer}>
                           <Text style={styles.exNumber}>{idx + 1}</Text>
                        </View>
                        <View style={styles.exContent}>
                          <Text style={styles.exName}>{ex.name}</Text>
                          <Text style={styles.exStats}>
                            {ex.sets} hiệp × {ex.reps} lần {ex.weight ? `(${ex.weight}kg)` : ''}
                          </Text>
                          {ex.notes && <Text style={styles.exNote}>• {ex.notes}</Text>}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 24, paddingVertical: 24 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: COLORS.textMain },
  headerSubtitle: { color: COLORS.primary, fontSize: 13, fontWeight: '600', marginTop: 4, letterSpacing: 0.5 },
  scroll: { flex: 1, paddingHorizontal: 24 },
  emptyContainer: { alignItems: 'center', marginTop: 80, opacity: 0.8 },
  emptyText: { color: COLORS.textMain, fontSize: 16, fontWeight: '700', marginTop: 20 },
  emptySubText: { color: COLORS.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' },
  logCard: { backgroundColor: COLORS.card, borderRadius: 24, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  logCardExpanded: { borderColor: COLORS.primary },
  logHeader: { flexDirection: 'row', alignItems: 'center' },
  dateBadge: { width: 60, height: 60, backgroundColor: 'rgba(14, 165, 233, 0.1)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  dateDay: { color: COLORS.primary, fontSize: 22, fontWeight: '900' },
  dateMonth: { color: COLORS.primary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  logInfo: { flex: 1 },
  logTitle: { color: COLORS.textMain, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  trainerRow: { flexDirection: 'row', alignItems: 'center' },
  trainerName: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  detailsContainer: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  metaRow: { flexDirection: 'row', marginBottom: 8 },
  metaLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  metaValue: { color: COLORS.textMain, fontSize: 12, fontWeight: '600', flex: 1 },
  exerciseList: { marginTop: 16 },
  listTitle: { color: COLORS.accent, fontSize: 14, fontWeight: '900', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  exerciseItem: { flexDirection: 'row', marginBottom: 16 },
  exNumberContainer: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  exNumber: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '900' },
  exContent: { flex: 1 },
  exName: { color: COLORS.textMain, fontSize: 15, fontWeight: '800' },
  exStats: { color: COLORS.primary, fontSize: 13, fontWeight: '700', marginTop: 2 },
  exNote: { color: COLORS.textSecondary, fontSize: 12, fontStyle: 'italic', marginTop: 4 }
});
