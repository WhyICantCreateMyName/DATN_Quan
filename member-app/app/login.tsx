import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '@/services/memberApi';
import { setAuthToken } from '@/services/apiClient';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('0988888888'); // Mock member phone
  const [password, setPassword] = useState('123');

  const handleLogin = async () => {
    try {
      const res = await authService.login(phone, password);
      // Backend có thể không check role hoặc trả về user.role = 'MEMBER'
      if (res.data && res.data.user?.role === 'MEMBER' || !res.data.user.role || res.data.user.role !== 'PT') {
         if (res.data.token) {
            await SecureStore.setItemAsync('member_token', res.data.token);
            setAuthToken(res.data.token);
         }
         router.replace('/(tabs)');
      } else {
         Alert.alert('Lỗi', 'Tài khoản không phải hội viên.');
      }
    } catch (e: any) {
      Alert.alert('Lỗi', 'Đăng nhập thất bại.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-memberBlack">
       <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-8" keyboardShouldPersistTaps="handled">
         <View className="mb-12 items-center">
           <Text className="text-4xl font-black text-white">TITAN<Text className="text-memberPrimary">GYM</Text></Text>
           <Text className="text-gray-400 mt-2 font-medium tracking-widest text-xs uppercase">Member Space</Text>
         </View>

         <Text className="text-white mb-2 ml-1">Số điện thoại</Text>
         <TextInput 
            className="bg-memberDark text-white p-4 rounded-xl mb-4 font-medium"
            placeholder="09xx..."
            placeholderTextColor="#6b7280"
            value={phone}
            onChangeText={setPhone}
         />

         <Text className="text-white mb-2 ml-1 mt-2">Mật khẩu</Text>
         <TextInput 
            className="bg-memberDark text-white p-4 rounded-xl mb-8 font-medium"
            placeholder="********"
            placeholderTextColor="#6b7280"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
         />

         <TouchableOpacity 
            onPress={handleLogin}
            className="bg-memberPrimary py-4 rounded-xl items-center shadow-lg shadow-sky-500/20"
         >
           <Text className="text-white font-black text-lg">VÀO PHÒNG TẬP</Text>
         </TouchableOpacity>
       </ScrollView>
    </KeyboardAvoidingView>
  );
}
