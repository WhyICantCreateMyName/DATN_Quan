import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';
import { useInbody } from '@/hooks/useInbody';

const COLORS = {
   background: '#020617',
   card: '#0f172a',
   primary: '#0ea5e9',
   textMain: '#ffffff',
   textSecondary: '#94a3b8',
   border: '#1e293b',
   chartAxis: '#334155'
};

// Custom Radar Config
const config = { size: 280, center: 140, max: 100 };
const axes = [{ lbl: 'Cân Nặng', prop: 'weight' }, { lbl: 'BMI', prop: 'bmi' }, { lbl: 'Mỡ %', prop: 'bodyFat' }, { lbl: 'Cơ bắp', prop: 'muscleMass' }, { lbl: 'T.Lượng', prop: 'volume' }];

export default function InbodyScreen() {
   const { metrics, refreshing, onRefresh } = useInbody();

   const lastMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null;

   const getPoint = (val: number, i: number, maxLines: number, scale = 1) => {
      const angle = (Math.PI * 2 / maxLines) * i - Math.PI / 2;
      const r = (val / config.max) * (config.size / 2) * scale;
      return { x: config.center + Math.cos(angle) * r, y: config.center + Math.sin(angle) * r };
   };

   let matrixPoints = "";
   let polygonPoints = "";

   if (lastMetric) {
      const safeData = [
         Number(lastMetric.weight || 0), Number(lastMetric.bmi || 0),
         Number(lastMetric.bodyFat || 0), Number(lastMetric.muscleMass || 0),
         (Number(lastMetric.muscleMass || 0) + Number(lastMetric.weight || 0)) / 2
      ];
      matrixPoints = axes.map((_, i) => getPoint(100, i, 5, 0.8)).map(p => `${p.x},${p.y}`).join(' ');
      polygonPoints = safeData.map((v, i) => getPoint(v > 100 ? 100 : v, i, 5, 0.8)).map(p => `${p.x},${p.y}`).join(' ');
   }

   return (
      <SafeAreaView style={styles.container}>
         <View style={styles.header}>
            <Text style={styles.headerTitle}>Body Tracker</Text>
         </View>

         <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} style={styles.scroll}>
            {lastMetric ? (
               <>
                  <View style={styles.chartCard}>
                     <Text style={styles.chartTitle}>CHỈ SỐ ĐO GẦN NHẤT</Text>
                     <Svg height={config.size} width={config.size}>
                        {axes.map((a, i) => {
                           const p = getPoint(100, i, 5, 0.8);
                           const lblP = getPoint(100, i, 5, 0.95);
                           return (
                              <View key={'ax' + i}>
                                 <Line x1={config.center} y1={config.center} x2={p.x} y2={p.y} stroke={COLORS.chartAxis} strokeWidth="1" />
                                 <SvgText x={lblP.x} y={lblP.y} fill={COLORS.textSecondary} fontSize="12" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">{a.lbl}</SvgText>
                              </View>
                           );
                        })}
                        <Polygon points={matrixPoints} fill="none" stroke={COLORS.chartAxis} strokeWidth="2" strokeDasharray="3,3" />
                        <Polygon points={polygonPoints} fill="rgba(14, 165, 233, 0.3)" stroke={COLORS.primary} strokeWidth="3" />
                     </Svg>
                  </View>

                  <View style={styles.detailsSection}>
                     <Text style={styles.sectionTitle}>Chi Tiết Trọng Lượng</Text>
                     <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                           <Text style={styles.statLabel}>Cân nặng</Text>
                           <Text style={styles.statValue}>{lastMetric.weight || '--'} kg</Text>
                        </View>
                        <View style={styles.statCard}>
                           <Text style={styles.statLabel}>Body Fat</Text>
                           <Text style={[styles.statValue, { color: COLORS.primary }]}>{lastMetric.bodyFat || '--'} %</Text>
                        </View>
                     </View>
                     <View style={styles.mainStatCard}>
                        <Text style={styles.statLabel}>Khối lượng cơ (Muscle/Skeletal)</Text>
                        <Text style={styles.statValue}>{lastMetric.muscleMass || '--'} kg</Text>
                     </View>

                     <Text style={styles.footerText}>Các chỉ số được đo đạc và cập nhật bởi Huấn Luyện Viên cá nhân của bạn.</Text>
                  </View>
               </>
            ) : (
               <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Chưa có dữ liệu Inbody</Text>
                  <Text style={styles.emptySubtitle}>Hãy yêu cầu PT của bạn thực hiện đo Inbody và tải lên hệ thống để cập nhật kết quả tại đây.</Text>
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
      paddingHorizontal: 24,
      paddingVertical: 24,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      backgroundColor: COLORS.background,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8,
      zIndex: 10,
   },
   headerTitle: {
      color: COLORS.textMain,
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: -0.5,
   },
   scroll: {
      flex: 1,
   },
   chartCard: {
      alignItems: 'center',
      paddingVertical: 40,
      backgroundColor: COLORS.card,
      margin: 24,
      borderRadius: 32,
      borderWidth: 1,
      borderColor: COLORS.border,
   },
   chartTitle: {
      color: COLORS.textSecondary,
      fontWeight: '800',
      marginBottom: 24,
      letterSpacing: 1,
      fontSize: 12,
   },
   detailsSection: {
      paddingHorizontal: 24,
      paddingBottom: 40,
   },
   sectionTitle: {
      color: COLORS.textMain,
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 16,
   },
   statsRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
   },
   statCard: {
      flex: 1,
      backgroundColor: COLORS.card,
      padding: 20,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: COLORS.border,
   },
   mainStatCard: {
      backgroundColor: COLORS.card,
      padding: 20,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: COLORS.border,
   },
   statLabel: {
      color: COLORS.textSecondary,
      fontSize: 13,
      fontWeight: '500',
      marginBottom: 4,
   },
   statValue: {
      color: COLORS.textMain,
      fontWeight: '900',
      fontSize: 24,
   },
   footerText: {
      color: '#475569',
      marginTop: 24,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 20,
   },
   emptyState: {
      alignItems: 'center',
      marginTop: 80,
      paddingHorizontal: 32,
   },
   emptyTitle: {
      color: COLORS.textSecondary,
      fontWeight: '800',
      fontSize: 18,
      marginBottom: 8,
      textAlign: 'center',
   },
   emptySubtitle: {
      color: '#475569',
      textAlign: 'center',
      fontSize: 14,
      lineHeight: 22,
   }
});

