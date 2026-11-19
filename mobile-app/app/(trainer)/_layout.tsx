import { Tabs, useRouter } from 'expo-router';
import { UserCircle2, Calendar, LayoutDashboard, Settings } from 'lucide-react-native';
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
        if (!token || role !== 'PT') {
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
      <Tabs.Screen
        name="availability"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="metrics/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="my-metrics"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="workout/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="client-details/[id]"
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

