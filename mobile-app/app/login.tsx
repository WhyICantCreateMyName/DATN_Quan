import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { gymStorage } from '@/libs/storage';
import { authService } from '@/services/memberApi';
import { setAuthToken } from '@/services/apiClient';

const COLORS = {
  background: '#020617',
  card: '#0f172a',
  primary: '#0ea5e9',
  textMain: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  error: '#ef4444'
};

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) return Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin.');

    setIsLoggingIn(true);
    try {
      const res = await authService.login(phone, password);

      if (res && res.token) {
        await gymStorage.setItem('gym_token', res.token);
        await gymStorage.setItem('user_role', res.user.role);
        setAuthToken(res.token);

        if (res.user.role === 'PT') {
          router.replace('/(trainer)' as any);
        } else if (res.user.role === 'MEMBER') {
          router.replace('/(member)' as any);
        } else {
          Alert.alert('Lỗi', 'Vai trò không được hỗ trợ trên ứng dụng di động.');
        }
      }
    } catch (e: any) {
      Alert.alert('Lỗi', 'Số điện thoại hoặc mật khẩu không chính xác.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logoText}>TITAN<Text style={styles.logoAccent}>GYM</Text></Text>
          <Text style={styles.subtitle}>Mobile Ecosystem</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại của bạn"
              placeholderTextColor="#475569"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="********"
              placeholderTextColor="#475569"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            disabled={isLoggingIn}
            onPress={handleLogin}
            style={[styles.loginButton, isLoggingIn && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {isLoggingIn ? 'Đang xác thực...' : 'Đăng Nhập Hệ Thống'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.textMain,
    letterSpacing: -1,
  },
  logoAccent: {
    color: COLORS.primary,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 2,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.textMain,
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 18,
    textTransform: 'uppercase',
  },
});


