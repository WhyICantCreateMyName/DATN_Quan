import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { authService, trainerService } from '@/services/trainerApi';
import { setAuthToken } from '@/services/apiClient';
import { LogOut, UserCircle2, Mail, Phone, Briefcase, Camera, Save, Edit2 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
   const router = useRouter();
   const [profile, setProfile] = useState<any>(null);
   const [isEditing, setIsEditing] = useState(false);
   const [form, setForm] = useState({ fullName: '', specialization: '', height: '', weight: '', bodyFat: '', avatarBase64: '' });

   const load = () => {
      authService.getMe().then(data => {
         setProfile(data);
         const tr = data.trainerProfile || {};
         setForm({ 
            fullName: data.fullName || '', 
            specialization: tr.specialization || '',
            height: tr.height ? tr.height.toString() : '',
            weight: tr.weight ? tr.weight.toString() : '',
            bodyFat: tr.bodyFat ? tr.bodyFat.toString() : '',
            avatarBase64: tr.avatarBase64 || ''
         });
      }).catch(() => null);
   };

   useEffect(() => { load(); }, []);

   const handleLogout = async () => {
      await SecureStore.deleteItemAsync('pt_token');
      setAuthToken(null);
      router.replace('/login');
   };

   const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, aspect: [1, 1], quality: 0.3, base64: true,
      });
      if (!result.canceled && result.assets[0].base64) {
         setForm({...form, avatarBase64: `data:image/jpeg;base64,${result.assets[0].base64}`});
      }
   };

   const handleSave = async () => {
      try {
         await trainerService.updateProfile(form);
         setIsEditing(false);
         load();
      } catch(e) { Alert.alert('Lỗi', 'Không thể lưu hồ sơ'); }
   };

   if (isEditing) {
      return (
         <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-ptBlack">
         <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
            <View className="items-center mb-6">
               <TouchableOpacity onPress={pickImage} className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center border-2 border-ptPrimary overflow-hidden">
                  {form.avatarBase64 ? <Image source={{uri: form.avatarBase64}} className="w-24 h-24" /> : <Camera color="#F59E0B" size={32}/>}
               </TouchableOpacity>
               <Text className="text-ptPrimary mt-2 font-bold text-xs uppercase">Đổi Avatar</Text>
            </View>

            <Text className="text-gray-400 mb-2 ml-1">Họ Tên</Text>
            <TextInput value={form.fullName} onChangeText={t=>setForm({...form, fullName:t})} className="bg-ptDark text-white p-4 rounded-xl mb-4 font-bold" />

            <Text className="text-gray-400 mb-2 ml-1">Chuyên môn</Text>
            <TextInput value={form.specialization} onChangeText={t=>setForm({...form, specialization:t})} className="bg-ptDark text-white p-4 rounded-xl mb-4 font-bold" />

            <View className="flex-row gap-4 mb-4">
               <View className="flex-1">
                  <Text className="text-gray-400 mb-2 ml-1">Cân nặng(kg)</Text>
                  <TextInput value={form.weight} onChangeText={t=>setForm({...form, weight:t})} keyboardType="numeric" className="bg-ptDark text-white p-4 rounded-xl font-bold" />
               </View>
               <View className="flex-1">
                  <Text className="text-gray-400 mb-2 ml-1">Chiều cao(cm)</Text>
                  <TextInput value={form.height} onChangeText={t=>setForm({...form, height:t})} keyboardType="numeric" className="bg-ptDark text-white p-4 rounded-xl font-bold" />
               </View>
            </View>

            <View className="mb-6">
               <Text className="text-gray-400 mb-2 ml-1">Mỡ BodyFat (%)</Text>
               <TextInput value={form.bodyFat} onChangeText={t=>setForm({...form, bodyFat:t})} keyboardType="numeric" className="bg-ptDark text-white p-4 rounded-xl font-bold" />
            </View>

            <View className="flex-row gap-4">
               <TouchableOpacity onPress={()=>setIsEditing(false)} className="flex-1 bg-gray-800 py-4 rounded-xl items-center">
                  <Text className="text-white font-bold">HỦY BỎ</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={handleSave} className="flex-1 bg-ptPrimary py-4 rounded-xl items-center flex-row justify-center">
                  <Save color="#000" size={20} className="mr-2"/>
                  <Text className="text-black font-bold">LƯU LẠI</Text>
               </TouchableOpacity>
            </View>
         </ScrollView>
         </KeyboardAvoidingView>
      )
   }

   return (
      <SafeAreaView className="flex-1 bg-ptBlack">
         <View className="px-6 pt-10 pb-6 items-center relative">
            <TouchableOpacity onPress={()=>setIsEditing(true)} className="absolute top-10 right-6 p-2 bg-gray-800 rounded-full">
               <Edit2 color="#F59E0B" size={20}/>
            </TouchableOpacity>

            <View className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center border-2 border-ptPrimary mb-4 overflow-hidden">
               {profile?.trainerProfile?.avatarBase64 ? 
                  <Image source={{uri: profile.trainerProfile.avatarBase64}} className="w-24 h-24" /> : 
                  <UserCircle2 color="#F59E0B" size={48} />
               }
            </View>
            <Text className="text-white text-2xl font-black">{profile?.fullName}</Text>
            <Text className="text-gray-400 font-medium">{profile?.role}</Text>
         </View>

         <ScrollView className="flex-1 px-6 py-4">
            <View className="bg-ptDark rounded-3xl p-6 border border-gray-800 mb-6">
               <View className="flex-row items-center mb-4 gap-2">
                  <Phone color="#9ca3af" size={20} className="mr-4" />
                  <Text className="text-white text-lg font-bold">{profile?.phone}</Text>
               </View>
               <View className="flex-row items-center gap-2">
                  <Briefcase color="#9ca3af" size={20} className="mr-4" />
                  <Text className="text-white text-lg font-bold">{profile?.trainerProfile?.specialization || 'Chưa thiết lập'}</Text>
               </View>
            </View>

            <View className="bg-ptDark rounded-3xl p-6 border border-gray-800 mb-6 flex-row justify-between">
               <View className="items-center">
                  <Text className="text-gray-400 text-xs mb-1">Cân Nặng</Text>
                  <Text className="text-white font-black text-xl">{profile?.trainerProfile?.weight || '--'} kg</Text>
               </View>
               <View className="items-center">
                  <Text className="text-gray-400 text-xs mb-1">Chiều Cao</Text>
                  <Text className="text-white font-black text-xl">{profile?.trainerProfile?.height || '--'} cm</Text>
               </View>
               <View className="items-center">
                  <Text className="text-gray-400 text-xs mb-1">Cơ / Mỡ</Text>
                  <Text className="text-white font-black text-xl">{profile?.trainerProfile?.bodyFat || '--'} %</Text>
               </View>
            </View>

            <TouchableOpacity onPress={handleLogout} className="bg-red-500/20 py-4 rounded-2xl flex-row justify-center items-center gap-2">
               <LogOut color="#EF4444" size={20} />
               <Text className="text-red-500 font-black text-md">ĐĂNG XUẤT</Text>
            </TouchableOpacity>
         </ScrollView>
      </SafeAreaView>
   )
}
