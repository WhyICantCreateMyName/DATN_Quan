import { Tabs, useRouter } from 'expo-router';
import { QrCode, CalendarClock, ActivitySquare } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';
import { setAuthToken } from '@/services/apiClient';

export default function TabLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     SecureStore.getItemAsync('member_token').then(token => {
        if (!token) { router.replace('/login'); }
        else {
           setAuthToken(token);
           setLoading(false);
        }
     }).catch(() => router.replace('/login'));
  }, []);

  if (loading) return <View className="flex-1 bg-memberBlack items-center justify-center"><ActivityIndicator color="#0ea5e9" size="large"/></View>;

  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1e293b' },
      tabBarActiveTintColor: '#0ea5e9',
      tabBarInactiveTintColor: '#64748b'
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mã Cửa',
          tabBarIcon: ({ color }) => <QrCode color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Lịch Tập',
          tabBarIcon: ({ color }) => <CalendarClock color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="inbody"
        options={{
          title: 'Chỉ số',
          tabBarIcon: ({ color }) => <ActivitySquare color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
