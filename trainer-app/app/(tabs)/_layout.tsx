import { Tabs, useRouter } from 'expo-router';
import { UserCircle2, Calendar, LayoutDashboard, Settings } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';
import { setAuthToken } from '@/services/apiClient';

export default function TabLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     SecureStore.getItemAsync('pt_token').then(token => {
        if (!token) { router.replace('/login'); }
        else {
           setAuthToken(token);
           setLoading(false);
        }
     }).catch(() => router.replace('/login'));
  }, []);

  if (loading) return <View className="flex-1 bg-ptBlack items-center justify-center"><ActivityIndicator color="#F59E0B" size="large"/></View>;

  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: { backgroundColor: '#111827', borderTopColor: '#1F2937' },
      tabBarActiveTintColor: '#F59E0B',
      tabBarInactiveTintColor: '#6b7280'
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hiệu suất',
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Lịch dạy',
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Học viên',
          tabBarIcon: ({ color }) => <UserCircle2 color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
