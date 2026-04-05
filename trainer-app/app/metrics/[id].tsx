import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, Save } from 'lucide-react-native';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';

// Vẽ biểu đồ mạng nhện đa giác 5 trục (Radar Chart) Custom bằng SVG
const config = { size: 200, center: 100, max: 100 };
const axes = [{lbl:'Cân Nặng', prop:'weight'}, {lbl:'BMI', prop:'bmi'}, {lbl:'Mỡ %', prop:'bodyFat'}, {lbl:'Cơ bắp', prop:'muscleMass'}, {lbl:'T.Lượng', prop:'volume'}];

const getPoint = (value: number, angleIndex: number, totalAxes: number, ratio=1) => {
   // Normalize value to 0-100 logic roughly
   const normalized = Math.min(value > 100 ? 100 : value, 100);
   const r = (normalized / 100) * (config.size/2) * ratio;
   const angle = (Math.PI * 2 * angleIndex) / totalAxes - Math.PI / 2;
   return { x: config.center + r * Math.cos(angle), y: config.center + r * Math.sin(angle) };
};

export default function MetricsScreen() {
   const { id } = useLocalSearchParams();
   const router = useRouter();
   const [history, setHistory] = useState<any[]>([]);
   
   const [form, setForm] = useState({ weight: '70', height: '175', bodyFat: '15', muscleMass: '35' });

   const load = async () => {
      try {
         const res = await axios.get(`/metrics/${id}`);
         setHistory(res.data);
         if(res.data.length > 0) {
            const last = res.data[res.data.length-1];
            setForm({ weight: last.weight.toString(), height: last.height.toString(), bodyFat: last.bodyFat.toString(), muscleMass: last.muscleMass.toString() });
         }
      } catch (e) {}
   };

   useEffect(() => { load(); }, [id]);

   const handleSave = async () => {
      try {
         await axios.post(`/metrics`, { ...form, memberId: Number(id) });
         Alert.alert('Thành công', 'Đã lưu chỉ số Inbody mới!');
         load(); // Refresh history
      } catch (e) { Alert.alert('Lỗi', 'Không thể lưu (Kiểm tra lại server)'); }
   };

   // Dựng data để vẽ
   const latestIndex = history.length > 0 ? history[history.length-1] : { weight:0, bmi:0, bodyFat:0, muscleMass:0};
   // Scale data cho tròn biểu đồ radar
   const p1 = latestIndex.weight || 10;
   const p2 = (latestIndex.bmi || 10) * 3; // Normalize BMI 20 -> 60
   const p3 = latestIndex.bodyFat || 10;
   const p4 = (latestIndex.muscleMass || 10) * 2; // Normalize muscle 35 -> 70
   const p5 = 80; // Giả sử độ hoàn thiện thể lực
   const vals = [p1, p2, p3, p4, p5];

   const polygonPoints = vals.map((v, i) => { const p = getPoint(v, i, 5, 0.8); return `${p.x},${p.y}`; }).join(' ');
   const matrixPoints = axes.map((_, i) => { const p = getPoint(100, i, 5, 0.8); return `${p.x},${p.y}`; }).join(' ');

   return (
      <SafeAreaView className="flex-1 bg-ptBlack">
         <View className="px-6 py-4 flex-row items-center border-b border-gray-800 relative justify-center">
            <TouchableOpacity onPress={() => router.back()} className="absolute left-6"><ChevronLeft color="#F59E0B" size={28}/></TouchableOpacity>
            <Text className="text-white font-bold text-lg tracking-widest">HỒ SƠ INBODY</Text>
         </View>

         <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
         <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
            <View className="items-center py-10 bg-ptDark m-6 rounded-3xl border border-gray-800">
               <Text className="text-gray-400 font-bold mb-4">BIỂU ĐỒ ĐA GIÁC (RADAR)</Text>
               <Svg height={config.size} width={config.size}>
                  {/* Trục Spider */}
                  {axes.map((a, i) => {
                     const p = getPoint(100, i, 5, 0.8);
                     const lblP = getPoint(100, i, 5, 1);
                     return (
                        <View key={'ax'+i}>
                           <Line x1={config.center} y1={config.center} x2={p.x} y2={p.y} stroke="#374151" strokeWidth="1"/>
                           <SvgText x={lblP.x} y={lblP.y} fill="#9ca3af" fontSize="10" textAnchor="middle" alignmentBaseline="middle">{a.lbl}</SvgText>
                        </View>
                     );
                  })}
                  <Polygon points={matrixPoints} fill="none" stroke="#374151" strokeWidth="1"/>
                  <Polygon points={polygonPoints} fill="rgba(245, 158, 11, 0.4)" stroke="#F59E0B" strokeWidth="2"/>
               </Svg>
            </View>

            <View className="px-6 mb-10">
               <Text className="text-white font-black text-2xl mb-4">Cập Nhật Kỷ Lục</Text>
               
               <View className="flex-row gap-4 mb-4">
                  <View className="flex-1">
                     <Text className="text-gray-400 text-xs mb-2 ml-1">Cân Nặng (kg)</Text>
                     <TextInput keyboardType="numeric" value={form.weight} onChangeText={t=>setForm({...form,weight:t})} className="bg-ptDark text-white p-4 rounded-2xl font-bold"/>
                  </View>
                  <View className="flex-1">
                     <Text className="text-gray-400 text-xs mb-2 ml-1">Chiều cao (cm)</Text>
                     <TextInput keyboardType="numeric" value={form.height} onChangeText={t=>setForm({...form,height:t})} className="bg-ptDark text-white p-4 rounded-2xl font-bold"/>
                  </View>
               </View>

               <View className="flex-row gap-4 mb-6">
                  <View className="flex-1">
                     <Text className="text-gray-400 text-xs mb-2 ml-1">Mỡ (Body Fat %)</Text>
                     <TextInput keyboardType="numeric" value={form.bodyFat} onChangeText={t=>setForm({...form,bodyFat:t})} className="bg-ptDark text-white p-4 rounded-2xl font-bold"/>
                  </View>
                  <View className="flex-1">
                     <Text className="text-gray-400 text-xs mb-2 ml-1">Khối Lượng Cơ (kg)</Text>
                     <TextInput keyboardType="numeric" value={form.muscleMass} onChangeText={t=>setForm({...form,muscleMass:t})} className="bg-ptDark text-white p-4 rounded-2xl font-bold"/>
                  </View>
               </View>

               <TouchableOpacity onPress={handleSave} className="bg-ptPrimary py-4 rounded-2xl flex-row justify-center items-center">
                  <Save color="#000" size={20} className="mr-2"/>
                  <Text className="text-black font-black text-lg">ĐỒNG BỘ CHỈ SỐ</Text>
               </TouchableOpacity>
            </View>
         </ScrollView>
         </KeyboardAvoidingView>
      </SafeAreaView>
   );
}
