import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { metricsService, authService } from '@/services/trainerApi';
import { ChevronLeft, Save, TrendingUp, Activity, User as UserIcon } from 'lucide-react-native';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';

const COLORS = {
  background: '#020617',
  card: '#0f172a',
  primary: '#f59e0b',
  secondary: '#0ea5e9',
  textMain: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  success: '#10b981'
};

const CHART_CONFIG = {
  size: 240,
  center: 120,
  max: 100,
  radius: 90
};

const AXES = [
  { label: 'Cân Nặng', key: 'weight', max: 120 },
  { label: 'BMI', key: 'bmi', max: 40 },
  { label: 'Mỡ %', key: 'bodyFat', max: 50 },
  { label: 'Cơ bắp', key: 'muscleMass', max: 60 },
  { label: 'Thể lực', key: 'fitness', max: 100 }
];

export default function MyMetricsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [form, setForm] = useState({
    weight: '',
    height: '',
    bodyFat: '',
    muscleMass: ''
  });

  const loadData = async () => {
    try {
      const [me, historyData] = await Promise.all([
        authService.getMe(),
        metricsService.getSelfHistory()
      ]);
      setProfile(me);
      setHistory(historyData);
      
      if (historyData.length > 0) {
        const last = historyData[historyData.length - 1];
        setForm({
          weight: last.weight.toString(),
          height: last.height.toString(),
          bodyFat: last.bodyFat.toString(),
          muscleMass: last.muscleMass.toString()
        });
      } else if (me.trainerProfile) {
        // Fallback to current profile stats if no history
        setForm({
          weight: me.trainerProfile.weight?.toString() || '',
          height: me.trainerProfile.height?.toString() || '',
          bodyFat: me.trainerProfile.bodyFat?.toString() || '',
          muscleMass: ''
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (!form.weight || !form.height) {
      Alert.alert('Lỗi', 'Vui lòng nhập cân nặng và chiều cao');
      return;
    }
    try {
      await metricsService.saveSelf({
        weight: form.weight,
        height: form.height,
        bodyFat: form.bodyFat || '0',
        muscleMass: form.muscleMass || '0'
      });
      Alert.alert('Thành công', 'Đã cập nhật chỉ số cá nhân');
      loadData();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu chỉ số');
    }
  };

  const calculatePoints = (data: any) => {
    if (!data) return AXES.map((_, i) => `${CHART_CONFIG.center},${CHART_CONFIG.center}`).join(' ');
    
    return AXES.map((axis, i) => {
      const value = data[axis.key] || 0;
      const r = (value / axis.max) * CHART_CONFIG.radius;
      const angle = (i * 2 * Math.PI) / AXES.length - Math.PI / 2;
      const x = CHART_CONFIG.center + r * Math.cos(angle);
      const y = CHART_CONFIG.center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={COLORS.primary} size="large" />
    </View>
  );

  const latestData = history.length > 0 ? history[history.length - 1] : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft color={COLORS.primary} size={24} />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', color: '#fff', fontSize: 16, fontWeight: '900', marginRight: 40 }}>CHỈ SỐ CỦA TÔI</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Radar Chart Section */}
          <View style={{ margin: 24, padding: 24, backgroundColor: COLORS.card, borderRadius: 32, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <TrendingUp color={COLORS.primary} size={18} />
              <Text style={{ color: COLORS.textSecondary, fontWeight: '800', fontSize: 12, letterSpacing: 1 }}>PHÂN TÍCH CÁ NHÂN</Text>
            </View>

            <Svg height={CHART_CONFIG.size} width={CHART_CONFIG.size}>
              {/* Background circles */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((p, i) => (
                <Circle key={i} cx={CHART_CONFIG.center} cy={CHART_CONFIG.center} r={CHART_CONFIG.radius * p} fill="none" stroke={COLORS.border} strokeWidth="1" />
              ))}
              
              {/* Axis lines */}
              {AXES.map((_, i) => {
                const angle = (i * 2 * Math.PI) / AXES.length - Math.PI / 2;
                return (
                  <Line key={i} x1={CHART_CONFIG.center} y1={CHART_CONFIG.center} x2={CHART_CONFIG.center + CHART_CONFIG.radius * Math.cos(angle)} y2={CHART_CONFIG.center + CHART_CONFIG.radius * Math.sin(angle)} stroke={COLORS.border} strokeWidth="1" />
                );
              })}

              {/* Labels */}
              {AXES.map((axis, i) => {
                const angle = (i * 2 * Math.PI) / AXES.length - Math.PI / 2;
                const x = CHART_CONFIG.center + (CHART_CONFIG.radius + 25) * Math.cos(angle);
                const y = CHART_CONFIG.center + (CHART_CONFIG.radius + 15) * Math.sin(angle);
                return (
                  <SvgText key={i} x={x} y={y} fill={COLORS.textSecondary} fontSize="10" fontWeight="bold" textAnchor="middle">{axis.label}</SvgText>
                );
              })}

              {/* Data Polygon */}
              <Polygon points={calculatePoints(latestData)} fill="rgba(245, 158, 11, 0.3)" stroke={COLORS.primary} strokeWidth="3" />
            </Svg>
          </View>

          {/* Input Form Section */}
          <View style={{ paddingHorizontal: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Activity color={COLORS.primary} size={20} />
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>Cập Nhật Chỉ Số</Text>
            </View>

            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.textSecondary, marginBottom: 8, marginLeft: 4, fontSize: 12 }}>Cân Nặng (kg)</Text>
                  <TextInput value={form.weight} onChangeText={t => setForm({ ...form, weight: t })} keyboardType="numeric" style={{ backgroundColor: COLORS.card, color: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, fontSize: 16, fontWeight: 'bold' }} placeholder="0.0" placeholderTextColor="#4b5563" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.textSecondary, marginBottom: 8, marginLeft: 4, fontSize: 12 }}>Chiều Cao (cm)</Text>
                  <TextInput value={form.height} onChangeText={t => setForm({ ...form, height: t })} keyboardType="numeric" style={{ backgroundColor: COLORS.card, color: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, fontSize: 16, fontWeight: 'bold' }} placeholder="0" placeholderTextColor="#4b5563" />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.textSecondary, marginBottom: 8, marginLeft: 4, fontSize: 12 }}>Body Fat (%)</Text>
                  <TextInput value={form.bodyFat} onChangeText={t => setForm({ ...form, bodyFat: t })} keyboardType="numeric" style={{ backgroundColor: COLORS.card, color: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, fontSize: 16, fontWeight: 'bold' }} placeholder="0.0" placeholderTextColor="#4b5563" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.textSecondary, marginBottom: 8, marginLeft: 4, fontSize: 12 }}>Cơ Bắp (kg)</Text>
                  <TextInput value={form.muscleMass} onChangeText={t => setForm({ ...form, muscleMass: t })} keyboardType="numeric" style={{ backgroundColor: COLORS.card, color: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, fontSize: 16, fontWeight: 'bold' }} placeholder="0.0" placeholderTextColor="#4b5563" />
                </View>
              </View>

              <TouchableOpacity onPress={handleSave} style={{ backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }}>
                <Save color="#000" size={20} style={{ marginRight: 10 }} />
                <Text style={{ color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 }}>LƯU CHỈ SỐ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
