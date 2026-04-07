import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '@/services/trainerApi';
import { setAuthToken } from '@/services/apiClient';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('0902222222');
  const [password, setPassword] = useState('123456');

  const handleLogin = async () => {
    try {
      const res = await authService.login(phone, password);
      if (res.data && res.data.user?.role === 'PT') {
        if (res.data.token) {
          await SecureStore.setItemAsync('pt_token', res.data.token);
          setAuthToken(res.data.token);
        }
        router.replace('/(tabs)');
      } else {
        Alert.alert('Lỗi', 'Tài khoản không có quyền truy cập PT App');
      }
    } catch (e: any) {
      Alert.alert('Lỗi', 'Đăng nhập thất bại. ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-ptBlack">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-8" keyboardShouldPersistTaps="handled">
        <View className="mb-12 items-center">
          <Text className="text-4xl font-black text-white">TITAN<Text className="text-ptPrimary">GYM</Text></Text>
          <Text className="text-gray-400 mt-2 font-medium tracking-widest text-xs uppercase">Trainer Portal</Text>
        </View>

        <Text className="text-white mb-2 ml-1">Số điện thoại</Text>
        <TextInput
          className="bg-ptDark text-white p-4 rounded-2xl mb-4 font-medium"
          placeholder="09xx..."
          placeholderTextColor="#6b7280"
          value={phone}
          onChangeText={setPhone}
        />

        <Text className="text-white mb-2 ml-1 mt-2">Mật khẩu</Text>
        <TextInput
          className="bg-ptDark text-white p-4 rounded-2xl mb-8 font-medium"
          placeholder="********"
          placeholderTextColor="#6b7280"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          onPress={handleLogin}
          className="bg-ptPrimary py-4 rounded-2xl items-center shadow-lg shadow-orange-500/20"
        >
          <Text className="text-black font-black text-lg">ĐĂNG NHẬP</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
