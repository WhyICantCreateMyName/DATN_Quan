import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Search, Clock } from 'lucide-react-native';

export default function ScheduleScreen() {
   const [schedule, setSchedule] = useState<any[]>([]);
   const [refreshing, setRefreshing] = useState(false);

   const load = async () => {
      try {
         const res = await axios.get(`/trainer/schedule`);
         setSchedule(res.data);
      } catch (e) {}
   };

   useEffect(() => { load(); }, []);
   const onRefresh = useCallback(() => { setRefreshing(true); load().then(()=>setRefreshing(false)); }, []);

   return (
      <SafeAreaView className="flex-1 bg-ptBlack pt-6">
         <View className="px-6 mb-4 flex-row justify-between items-center">
            <Text className="text-3xl font-black text-white">Lịch Dạy</Text>
            <View className="bg-ptDark w-10 h-10 items-center justify-center rounded-full"><Search color="#6b7280" size={20}/></View>
         </View>

         <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />} className="px-6">
            {schedule.length === 0 && <Text className="text-gray-500 mt-10 text-center">Chưa có lịch dạy nào được xếp!</Text>}
            {schedule.map(b => {
               const time = new Date(b.startTime);
               return (
                  <View key={b.id} className="bg-ptDark p-5 rounded-2xl mb-4 flex-row border border-gray-800">
                     <View className="mr-5 items-center justify-center">
                        <Text className="text-xs text-gray-500 uppercase font-bold">Tháng {time.getMonth()+1}</Text>
                        <Text className="text-ptPrimary text-2xl font-black">{time.getDate()}</Text>
                     </View>
                     <View className="flex-1 border-l border-gray-800 pl-5 justify-center">
                        <Text className="text-white font-bold text-lg mb-1">{b.member?.user?.fullName}</Text>
                        <View className="flex-row items-center">
                           <Clock color="#6b7280" size={14} className="mr-1"/>
                           <Text className="text-gray-400 text-xs">{time.getHours()}:00 - {b.status}</Text>
                        </View>
                     </View>
                  </View>
               );
            })}
         </ScrollView>
      </SafeAreaView>
   );
}
