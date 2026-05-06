import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { gymStorage } from '@/libs/storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { setAuthToken } from '@/services/apiClient';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await gymStorage.getItem('gym_token');
        const role = await gymStorage.getItem('user_role');
        
        const inAuthGroup = (segments[0] as any) === '(trainer)' || (segments[0] as any) === '(member)';

        if (!token && inAuthGroup) {
          router.replace('/login' as any);
        } else if (token) {
          setAuthToken(token);
          if (!inAuthGroup) {
            if (role === 'PT') router.replace('/(trainer)' as any);
            else if (role === 'MEMBER') router.replace('/(member)' as any);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();
  }, [segments]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#020617' } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(member)" />
      <Stack.Screen name="(trainer)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    backgroundColor: '#020617', 
    alignItems: 'center', 
    justifyContent: 'center'
  }
});


