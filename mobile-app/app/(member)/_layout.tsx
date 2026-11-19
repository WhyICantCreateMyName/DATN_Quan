import { Tabs, useRouter } from 'expo-router';
import { QrCode, CalendarClock, ActivitySquare, CalendarPlus, Dumbbell } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { gymStorage } from '@/libs/storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setAuthToken } from '@/services/apiClient';

const COLORS = {
  background: '#0E100F',
  card: '#1A1D1B',
  primary: '#C8F135',
  border: '#282C29',
  inactive: '#8E9490'
};

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  // Tính toán khoảng cách an toàn so với thanh vuốt cử chỉ điều hướng (Gesture bar / Home pill)
  const bottomPadding = Math.max(insets.bottom, 12) + 6;
  const tabHeight = 54 + bottomPadding;

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
        height: tabHeight,
        paddingBottom: bottomPadding,
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

