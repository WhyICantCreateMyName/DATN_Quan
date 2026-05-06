import { Tabs, useRouter } from 'expo-router';
import { QrCode, CalendarClock, ActivitySquare, CalendarPlus, Dumbbell } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { gymStorage } from '@/libs/storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { setAuthToken } from '@/services/apiClient';

const COLORS = {
  background: '#020617',
  card: '#0f172a',
  primary: '#0ea5e9',
  border: '#1e293b',
  inactive: '#64748b'
};

export default function TabLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const verify = async () => {
        const token = await gymStorage.getItem('gym_token');
        const role = await gymStorage.getItem('user_role');
        if (!token || role !== 'MEMBER') {
           router.replace('/login' as any);
        } else {
           setAuthToken(token);
           setLoading(false);
        }
     };
     verify();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large"/>
      </View>
    );
  }

  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: { 
        backgroundColor: COLORS.card, 
        borderTopColor: COLORS.border,
        height: 64,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.inactive,
      tabBarLabelStyle: {
        fontWeight: 'bold',
        fontSize: 11,
      }
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
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Giáo án',
          tabBarIcon: ({ color }) => <Dumbbell color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Đặt Lịch',
          href: null,
          tabBarIcon: ({ color }) => <CalendarPlus color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="membership"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    backgroundColor: COLORS.background, 
    alignItems: 'center', 
    justifyContent: 'center'
  }
});

