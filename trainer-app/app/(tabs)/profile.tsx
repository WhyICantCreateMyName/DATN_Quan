import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { LogOut, UserCircle2, Mail, Phone, Briefcase } from 'lucide-react-native';
import { useState, useEffect } from 'react';

export default function ProfileScreen() {
   const router = useRouter();
   const [profile, setProfile] = useState<any>(null);

   useEffect(() => {
      axios.get(`/auth/me`).then(res => setProfile(res.data)).catch(() => null);
   }, []);

   const handleLogout = async () => {
      await SecureStore.deleteItemAsync('pt_token');
      delete axios.defaults.headers.common['Authorization'];
      router.replace('/login');
   };

   return (
      <SafeAreaView className="flex-1 bg-ptBlack">
         <View className="px-6 pt-10 pb-6 items-center">
            <View className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center border-2 border-ptPrimary mb-4">
               <UserCircle2 color="#F59E0B" size={48} />
            </View>
            <Text className="text-white text-2xl font-black">{profile?.fullName}</Text>
            <Text className="text-gray-400 font-medium">{profile?.role}</Text>
         </View>

         <View className="px-6 py-4">
            <View className="bg-ptDark rounded-3xl p-6 border border-gray-800 mb-6">
               <View className="flex-row items-center mb-4 gap-2">
                  <Phone color="#9ca3af" size={20} className="mr-4" />
                  <Text className="text-white text-lg font-bold">{profile?.phone}</Text>
               </View>
               <View className="flex-row items-center gap-2">
                  <Briefcase color="#9ca3af" size={20} className="mr-4" />
                  <Text className="text-white text-lg font-bold">{profile?.trainerProfile?.specialization || 'Chưa thiết lập chuyên môn'}</Text>
               </View>
            </View>

            <TouchableOpacity onPress={handleLogout} className="bg-red-500/20 py-4 rounded-2xl flex-row justify-center items-center gap-2">
               <LogOut color="#EF4444" size={20} />
               <Text className="text-red-500 font-black text-md">ĐĂNG XUẤT</Text>
            </TouchableOpacity>
         </View>
      </SafeAreaView>
   )
}
