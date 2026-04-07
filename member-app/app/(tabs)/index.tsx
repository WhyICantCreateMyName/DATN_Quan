import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import QRCode from 'react-native-qrcode-svg';
import { memberService, authService } from '@/services/memberApi';
import { CreditCard, LogOut } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken } from '@/services/apiClient';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [dash, setDash] = useState<any>(null);
  const [me, setMe] = useState<any>(null);

  const loadData = async () => {
    try {
      const db = await memberService.getDashboard();
      setDash(db);
      const profile = await authService.getMe();
      setMe(profile);
    } catch(e) {}
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('member_token');
    setAuthToken(null);
    router.replace('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-memberBlack">
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9"/>}>
        <View className="px-6 pt-8 flex-row justify-between items-center">
           <View>
              <Text className="text-gray-400 text-sm tracking-widest uppercase mb-1">Thẻ Hội Viên</Text>
              <Text className="text-white font-black text-2xl">{me?.fullName || 'Hội Viên'}</Text>
           </View>
           <TouchableOpacity onPress={handleLogout} className="p-2 bg-red-500/10 rounded-full">
              <LogOut color="#EF4444" size={20}/>
             </TouchableOpacity>
        </View>

        <View className="items-center mt-12 mb-8">
           <View className="bg-white p-4 rounded-3xl opacity-95">
              <QRCode 
                 value={`TITAN-GATE-${me?.id || 0}`} 
                 size={200} 
                 color="#0f172a"
                 backgroundColor="transparent"
              />
           </View>
           <Text className="text-gray-400 font-medium mt-6 text-center px-8">Hãy đưa mã này vào máy quét tại cổng để Check-in vào phòng tập.</Text>
        </View>

        <View className="px-6 mb-8">
           <Text className="text-white font-bold text-xl mb-4">Gói tập của bạn</Text>
           {dash?.activeSubscription ? (
              <View className="bg-memberDark rounded-3xl p-6 border border-slate-700">
                 <View className="flex-row items-center mb-4">
                    <CreditCard color="#0ea5e9" size={24} className="mr-3" />
                    <Text className="text-white font-black text-lg flex-1">{dash.activeSubscription.plan.name}</Text>
                 </View>
                 
                 <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400">Buổi tập PT còn lại</Text>
                    <Text className="text-white font-bold">{dash.remainingPtSessions} buổi</Text>
                 </View>
                 <View className="flex-row justify-between">
                    <Text className="text-gray-400">Trạng thái</Text>
                    <Text className="text-emerald-400 font-bold">● ĐANG HOẠT ĐỘNG</Text>
                 </View>
              </View>
           ) : (
              <View className="bg-memberDark rounded-3xl p-6 border border-slate-800 items-center">
                 <Text className="text-gray-400">Bạn hiện chưa có gói tập nào đang kích hoạt.</Text>
              </View>
           )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
