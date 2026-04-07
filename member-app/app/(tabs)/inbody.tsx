import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { memberService } from '@/services/memberApi';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';

// Custom Radar Config
const config = { size: 280, center: 140, max: 100 };
const axes = [{lbl:'Cân Nặng', prop:'weight'}, {lbl:'BMI', prop:'bmi'}, {lbl:'Mỡ %', prop:'bodyFat'}, {lbl:'Cơ bắp', prop:'muscleMass'}, {lbl:'T.Lượng', prop:'volume'}];

export default function InbodyScreen() {
   const [metrics, setMetrics] = useState<any[]>([]);
   const [refreshing, setRefreshing] = useState(false);

   const load = async () => {
      try {
         const data = await memberService.getInbody();
         setMetrics(data);
      } catch (e) {}
   };

   useEffect(() => { load(); }, []);

   const onRefresh = useCallback(() => {
      setRefreshing(true);
      load().then(() => setRefreshing(false));
   }, []);

   const lastMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null;

   const getPoint = (val: number, i: number, maxLines: number, scale=1) => {
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
         (Number(lastMetric.muscleMass||0) + Number(lastMetric.weight||0))/2
      ];
      matrixPoints = axes.map((_, i) => getPoint(100, i, 5, 0.8)).map(p => `${p.x},${p.y}`).join(' ');
      polygonPoints = safeData.map((v, i) => getPoint(v>100?100:v, i, 5, 0.8)).map(p => `${p.x},${p.y}`).join(' ');
   }

   return (
      <SafeAreaView className="flex-1 bg-memberBlack">
         <View className="px-6 py-6 border-b border-slate-800 flex-row justify-between items-center bg-memberBlack z-10 shadow-xl">
            <Text className="text-white font-black text-2xl tracking-tight">Body Tracker</Text>
         </View>

         <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />} className="flex-1">
            {lastMetric ? (
               <>
               <View className="items-center py-10 bg-memberDark m-6 rounded-3xl border border-slate-800">
                  <Text className="text-gray-400 font-bold mb-4">CHỈ SỐ ĐO GẦN NHẤT</Text>
                  <Svg height={config.size} width={config.size}>
                     {axes.map((a, i) => {
                        const p = getPoint(100, i, 5, 0.8);
                        const lblP = getPoint(100, i, 5, 0.95);
                        return (
                           <View key={'ax'+i}>
                              <Line x1={config.center} y1={config.center} x2={p.x} y2={p.y} stroke="#334155" strokeWidth="1"/>
                              <SvgText x={lblP.x} y={lblP.y} fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">{a.lbl}</SvgText>
                           </View>
                        );
                     })}
                     <Polygon points={matrixPoints} fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="3,3"/>
                     <Polygon points={polygonPoints} fill="rgba(14, 165, 233, 0.3)" stroke="#0ea5e9" strokeWidth="3"/>
                  </Svg>
               </View>

               <View className="px-6 pb-10">
                  <Text className="text-white font-bold text-xl mb-4">Chi Tiết Trọng Lượng</Text>
                  <View className="flex-row gap-4 mb-4">
                     <View className="flex-1 bg-memberDark p-5 rounded-2xl border border-slate-800">
                        <Text className="text-gray-400 text-sm mb-1">Cân nặng</Text>
                        <Text className="text-white font-black text-2xl">{lastMetric.weight || '--'} kg</Text>
                     </View>
                     <View className="flex-1 bg-memberDark p-5 rounded-2xl border border-slate-800">
                        <Text className="text-gray-400 text-sm mb-1">Body Fat</Text>
                        <Text className="text-sky-400 font-black text-2xl">{lastMetric.bodyFat || '--'} %</Text>
                     </View>
                  </View>
                  <View className="bg-memberDark p-5 rounded-2xl border border-slate-800">
                     <Text className="text-gray-400 text-sm mb-1">Khối lượng cơ (Muscle/Skeletal)</Text>
                     <Text className="text-white font-black text-2xl">{lastMetric.muscleMass || '--'} kg</Text>
                  </View>
                  
                  <Text className="text-gray-500 mt-6 text-sm text-center">Các chỉ số được đo đạc và cập nhật bởi Huấn Luyện Viên cá nhân của bạn.</Text>
               </View>
               </>
            ) : (
               <View className="items-center mt-20 px-8">
                  <Text className="text-gray-500 font-bold mb-2 text-center text-lg">Chưa có dữ liệu Inbody</Text>
                  <Text className="text-gray-600 text-center">Hãy yêu cầu PT của bạn thực hiện đo Inbody và tải lên hệ thống để cập nhật kết quả tại đây.</Text>
               </View>
            )}
         </ScrollView>
      </SafeAreaView>
   );
}
