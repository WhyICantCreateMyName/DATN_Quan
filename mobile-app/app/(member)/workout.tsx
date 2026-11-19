import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { memberService } from '@/services/memberApi';
import { Dumbbell, Calendar, User, ChevronDown, ChevronUp, Zap, Apple, Layers } from 'lucide-react-native';
import { KINETIC_THEME } from '@/constants/theme';
import { formatDate } from '@/libs/utils';

export default function WorkoutLogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = async () => {
    try {
      const data = await memberService.getWorkoutLogs();
      setLogs(data || []);
      if (data && data.length > 0 && expandedId === null) {
        setExpandedId(data[0].id); // Expand the newest log by default
      }
    } catch (e) {
      console.error('Error fetching workout logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
        <ActivityIndicator color={KINETIC_THEME.accentPrimary} size="large" />
        <Text style={styles.loadingText}>Đang tải giáo án tập luyện...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>GIÁO ÁN ĐIỆN TỬ</Text>
        <Text style={styles.headerTitle}>Nhật Ký Tập Luyện</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={KINETIC_THEME.accentPrimary}
          />
        }
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Dumbbell size={40} color={KINETIC_THEME.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có giáo án nào</Text>
            <Text style={styles.emptyDesc}>
              Sau mỗi buổi tập kèm PT, huấn luyện viên sẽ cập nhật các bài tập, mức tạ và nhận xét thể lực vào đây.
            </Text>
          </View>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedId === log.id;
            const exercisesCount = log.exercises?.length || 0;

            return (
              <View key={log.id} style={styles.card}>
                {/* Header Row */}
                <TouchableOpacity
                  onPress={() => toggleExpand(log.id)}
                  style={styles.cardHeader}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.metaRow}>
                      <View style={styles.dateBadge}>
                        <Calendar size={12} color={KINETIC_THEME.accentPrimary} />
                        <Text style={styles.dateText}>{formatDate(log.date)}</Text>
                      </View>
                      {log.trainer?.user && (
                        <View style={styles.ptBadge}>
                          <User size={12} color={KINETIC_THEME.textMuted} />
                          <Text style={styles.ptText}>PT: {log.trainer.user.fullName}</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.logTitle}>
                      {log.notes || `Buổi tập ngày ${formatDate(log.date)}`}
                    </Text>

                    <Text style={styles.exerciseSummary}>
                      {exercisesCount} bài tập • {log.energyLevel || 'Thể lực tốt'}
                    </Text>
                  </View>

                  <View style={styles.expandIcon}>
                    {isExpanded ? (
                      <ChevronUp size={20} color={KINETIC_THEME.accentPrimary} />
                    ) : (
                      <ChevronDown size={20} color={KINETIC_THEME.textMuted} />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Expanded Details */}
                {isExpanded && (
                  <View style={styles.cardBody}>
                    {/* Energy & Nutrition */}
                    {(log.energyLevel || log.nutrition) && (
                      <View style={styles.feedbackBox}>
                        {log.energyLevel && (
                          <View style={styles.feedbackItem}>
                            <Zap size={14} color={KINETIC_THEME.accentPrimary} />
                            <Text style={styles.feedbackText}>
                              Thể lực: <Text style={{ color: KINETIC_THEME.textPrimary, fontWeight: '700' }}>{log.energyLevel}</Text>
                            </Text>
                          </View>
                        )}
                        {log.nutrition && (
                          <View style={styles.feedbackItem}>
                            <Apple size={14} color="#10B981" />
                            <Text style={styles.feedbackText}>
                              Dinh dưỡng: <Text style={{ color: KINETIC_THEME.textPrimary, fontWeight: '700' }}>{log.nutrition}</Text>
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Exercises List */}
                    <View style={styles.exerciseList}>
                      <Text style={styles.listHeading}>DANH SÁCH BÀI TẬP</Text>

                      {log.exercises?.map((ex: any, idx: number) => (
                        <View key={ex.id || idx} style={styles.exerciseItem}>
                          <View style={styles.exIndex}>
                            <Text style={styles.exIndexText}>{idx + 1}</Text>
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text style={styles.exName}>{ex.name}</Text>
                            <View style={styles.exStats}>
                              <Text style={styles.exStatPill}>
                                <Text style={styles.statNum}>{ex.sets}</Text> sets
                              </Text>
                              <Text style={styles.exStatPill}>
                                <Text style={styles.statNum}>{ex.reps}</Text> reps
                              </Text>
                              {ex.weight > 0 && (
                                <Text style={[styles.exStatPill, styles.weightHighlight]}>
                                  <Text style={[styles.statNum, { color: KINETIC_THEME.accentPrimary }]}>{ex.weight}</Text> kg
                                </Text>
                              )}
                            </View>
                            {ex.notes ? (
                              <Text style={styles.exNotes}>{ex.notes}</Text>
                            ) : null}
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KINETIC_THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    marginTop: 20,
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
  card: {
    backgroundColor: KINETIC_THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    color: KINETIC_THEME.accentPrimary,
  },
  ptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ptText: {
    fontSize: 11,
    color: KINETIC_THEME.textMuted,
  },
  logTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: KINETIC_THEME.textPrimary,
  },
  exerciseSummary: {
    fontSize: 12,
    color: KINETIC_THEME.textMuted,
    marginTop: 3,
  },
  expandIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: KINETIC_THEME.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: KINETIC_THEME.border,
  },
  feedbackBox: {
    backgroundColor: KINETIC_THEME.background,
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    gap: 8,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedbackText: {
    fontSize: 12,
    color: KINETIC_THEME.textMuted,
  },
  exerciseList: {
    gap: 10,
  },
  listHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: KINETIC_THEME.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: KINETIC_THEME.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
  },
  exIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: KINETIC_THEME.surface,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exIndexText: {
    fontSize: 11,
    fontWeight: '800',
    color: KINETIC_THEME.accentPrimary,
  },
  exName: {
    fontSize: 14,
    fontWeight: '700',
    color: KINETIC_THEME.textPrimary,
  },
  exStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  exStatPill: {
    fontSize: 11,
    color: KINETIC_THEME.textMuted,
    backgroundColor: KINETIC_THEME.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: KINETIC_THEME.border,
  },
  weightHighlight: {
    borderColor: 'rgba(200, 241, 53, 0.3)',
  },
  statNum: {
    fontWeight: '800',
    color: KINETIC_THEME.textPrimary,
  },
  exNotes: {
    fontSize: 11,
    color: KINETIC_THEME.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
