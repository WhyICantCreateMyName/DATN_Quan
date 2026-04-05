import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Activity, ChevronRight, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ClientsScreen() {
   const router = useRouter();
   const [clients, setClients] = useState<any[]>([]);
   const [refreshing, setRefreshing] = useState(false);

   const load = async () => {
      try {
         const res = await axios.get(`/trainer/clients`);
         setClients(res.data);
      } catch (e) {}
   };

   useEffect(() => { load(); }, []);
   const onRefresh = useCallback(() => { setRefreshing(true); load().then(()=>setRefreshing(false)); }, []);

   return (
      <SafeAreaView className="flex-1 bg-ptBlack pt-6">
         <View className="px-6 mb-6">
            <Text className="text-3xl font-black text-white">Theo Dõi</Text>
            <Text className="text-ptPrimary font-medium text-xs tracking-widest uppercase mt-1">Danh sách Hội viên</Text>
         </View>

         <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />} className="px-6">
            {clients.map(c => {
               // Get latest metric if any
               const latest = c.bodyMetrics && c.bodyMetrics.length > 0 ? c.bodyMetrics[0] : null;
               const fat = latest?.bodyFat || '--';
               const muscle = latest?.muscleMass || '--';

               return (
                  <TouchableOpacity 
                     key={c.id} 
                     onPress={() => router.push(`/metrics/${c.id}`)}
                     className="bg-ptDark p-5 rounded-3xl mb-4 border border-gray-800 flex-row items-center"
                  >
                     <View className="w-12 h-12 rounded-full bg-gray-800 items-center justify-center mr-4 border border-gray-700">
                        <User color="#9ca3af" size={24}/>
                     </View>
                     <View className="flex-1">
                        <Text className="text-white font-bold text-lg mb-1">{c.user?.fullName}</Text>
                        <View className="flex-row items-center">
                           <Activity color="#F59E0B" size={14} className="mr-1"/>
                           <Text className="text-gray-400 text-xs">Fat: {fat}%  |  Cơ: {muscle}kg</Text>
                        </View>
                     </View>
                     <ChevronRight color="#4b5563" size={20}/>
                  </TouchableOpacity>
               );
            })}
         </ScrollView>
      </SafeAreaView>
   );
}
