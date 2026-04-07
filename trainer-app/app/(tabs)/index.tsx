import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { Dumbbell, Target, Banknote, CalendarCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trainerService } from '@/services/trainerApi';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ completedThisMonth: 0, pendingClasses: 0, commissionEstimated: 0 });

  const fetchStats = async () => {
    try {
      const data = await trainerService.getDashboard();
      setStats(data);
    } catch (e) {}
  };

  useEffect(() => { fetchStats(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats().then(() => setRefreshing(false));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-ptBlack pt-6">
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />} className="px-6">
         <View className="mb-8">
            <Text className="text-gray-400 text-sm uppercase tracking-widest font-bold">Tháng này</Text>
            <Text className="text-white text-3xl font-black mt-1">Năng Suất Của Bạn</Text>
         </View>

         {/* Tổng Hoa Hồng */}
         <View className="bg-gradient-to-r from-orange-500/20 to-ptPrimary/10 border border-ptPrimary/30 rounded-3xl p-6 mb-6">
            <View className="bg-ptPrimary/20 w-12 h-12 rounded-full items-center justify-center mb-4">
               <Banknote color="#F59E0B" size={24}/>
            </View>
            <Text className="text-gray-400 font-medium mb-1">Thu nhập ước tính (Hoa hồng)</Text>
            <Text className="text-4xl font-black text-ptPrimary">{stats.commissionEstimated.toLocaleString()} đ</Text>
         </View>

         <View className="flex-row gap-4 mb-6">
            <View className="bg-ptDark flex-1 rounded-3xl p-6">
               <CalendarCheck color="#10B981" size={24} className="mb-3"/>
               <Text className="text-white text-3xl font-black">{stats.completedThisMonth}</Text>
               <Text className="text-gray-400 font-medium text-xs mt-1">Buổi đã dạy</Text>
            </View>

            <View className="bg-ptDark flex-1 rounded-3xl p-6">
               <Target color="#3B82F6" size={24} className="mb-3"/>
               <Text className="text-white text-3xl font-black">{stats.pendingClasses}</Text>
               <Text className="text-gray-400 font-medium text-xs mt-1">Buổi chờ dạy</Text>
            </View>
         </View>

         {/* Nút hành động */}
         <View className="bg-ptDark rounded-2xl p-4 flex-row items-center border border-gray-800 relative overflow-hidden">
             <View className="w-12 h-12 bg-ptPrimary rounded-xl items-center justify-center mr-4">
                <Dumbbell color="#111827" size={24}/>
             </View>
             <View>
                <Text className="text-white font-bold text-lg mb-1">Thiết lập giáo án</Text>
                <Text className="text-gray-400 text-xs text-wrap max-w-[250px]">Lật giáo án Inbody bằng cách chọn học viên bên thanh điều hướng ngang.</Text>
             </View>
         </View>
      </ScrollView>
    </SafeAreaView>
  );
}
