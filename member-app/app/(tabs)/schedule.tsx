import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { memberService } from '@/services/memberApi';
import { Search, Clock, CalendarDays } from 'lucide-react-native';

export default function ScheduleScreen() {
   const [schedule, setSchedule] = useState<any[]>([]);
   const [refreshing, setRefreshing] = useState(false);

   const load = async () => {
      try {
         const data = await memberService.getSchedule();
         setSchedule(data);
      } catch (e) {}
   };

   useEffect(() => { load(); }, []);

   const onRefresh = useCallback(() => {
      setRefreshing(true);
      load().then(() => setRefreshing(false));
   }, []);

   return (
      <SafeAreaView className="flex-1 bg-memberBlack">
         <View className="px-6 py-6 border-b border-slate-800 flex-row justify-between items-center">
            <Text className="text-white font-black text-2xl tracking-tight">Lịch hẹn Tập</Text>
            <View className="w-10 h-10 bg-memberDark rounded-full items-center justify-center">
               <Search color="#9ca3af" size={20} />
            </View>
         </View>

         <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />} className="flex-1 px-6 pt-6">
            {schedule.map((item, id) => {
               const st = new Date(item.startTime);
               const et = new Date(item.endTime);
               const isPT = !!item.trainer;

               return (
                  <View key={id} className="bg-memberDark rounded-3xl p-5 mb-4 border border-slate-800">
                     <View className="flex-row items-start justify-between mb-4">
                        <View className="flex-row items-center flex-1">
                           <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isPT ? 'bg-sky-500/20' : 'bg-purple-500/20'}`}>
                              <CalendarDays color={isPT ? "#0ea5e9" : "#a855f7"} size={22} />
                           </View>
                           <View className="flex-1">
                              <Text className="text-white font-bold text-lg">{isPT ? 'Tập PT Cá nhân' : item.groupClass?.name}</Text>
                              <Text className="text-gray-400 mt-1">{isPT ? `Huấn luyện viên: ${item.trainer.user.fullName}` : 'Lớp học nhóm'}</Text>
                           </View>
                        </View>
                     </View>

                     <View className="bg-memberBlack rounded-2xl p-4 flex-row items-center border border-slate-800/80">
                        <Clock color="#0ea5e9" size={16} className="mr-2"/>
                        <Text className="text-sky-400 font-bold">
                           {st.toLocaleDateString('vi-VN')} • {st.getHours()}:{st.getMinutes().toString().padStart(2, '0')} - {et.getHours()}:{et.getMinutes().toString().padStart(2, '0')}
                        </Text>
                     </View>
                  </View>
               );
            })}
            {schedule.length === 0 && (
               <View className="items-center mt-20">
                  <Text className="text-gray-500 font-bold mb-2">Chưa có lịch hẹn nào</Text>
                  <Text className="text-gray-600">Bạn có thể đặt lịch PT hoặc Tham gia CLB nhóm qua Guest Web</Text>
               </View>
            )}
         </ScrollView>
      </SafeAreaView>
   );
}
