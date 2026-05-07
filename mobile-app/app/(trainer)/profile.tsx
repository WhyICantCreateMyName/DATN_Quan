import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { gymStorage } from '@/libs/storage';
import { authService, trainerService } from '@/services/trainerApi';
import { setAuthToken } from '@/services/apiClient';
import { LogOut, UserCircle2, Phone, Briefcase, Camera, Save, Edit2, Calendar, TrendingUp } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';

const COLORS = {
   background: '#020617',
   card: '#0f172a',
   primary: '#f59e0b',
   textMain: '#ffffff',
   textSecondary: '#94a3b8',
   border: '#1e293b',
   error: '#ef4444',
   inputBg: '#111827',
   avatarBg: '#111827'
};

export default function ProfileScreen() {
   const router = useRouter();
   const [profile, setProfile] = useState<any>(null);
   const [isEditing, setIsEditing] = useState(false);
   const [form, setForm] = useState({ fullName: '', specialization: '', height: '', weight: '', bodyFat: '', avatarUrl: '' });

   const load = () => {
      authService.getMe().then(data => {
         setProfile(data);
         const tr = data.trainerProfile || {};
         setForm({
            fullName: data.fullName || '',
            specialization: tr.specialization || '',
            height: tr.height ? tr.height.toString() : '',
            weight: tr.weight ? tr.weight.toString() : '',
            bodyFat: tr.bodyFat ? tr.bodyFat.toString() : '',
            avatarUrl: tr.avatarUrl || ''
         });
      }).catch(() => null);
   };

   useEffect(() => { load(); }, []);

   const handleLogout = async () => {
      await gymStorage.deleteItem('gym_token');
      await gymStorage.deleteItem('user_role');
      setAuthToken(null);
      router.replace('/login' as any);
   };

   const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
         allowsEditing: true, aspect: [1, 1], quality: 0.3, base64: true,
      });
      if (!result.canceled && result.assets[0].base64) {
         setForm({ ...form, avatarUrl: `data:image/jpeg;base64,${result.assets[0].base64}` });
      }
   };

   const handleSave = async () => {
      try {
         await trainerService.updateProfile(form);
         setIsEditing(false);
         load();
      } catch (e) { Alert.alert('Lỗi', 'Không thể lưu hồ sơ'); }
   };

   if (isEditing) {
      return (
         <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
               <View style={styles.avatarPickerSection}>
                  <TouchableOpacity onPress={pickImage} style={styles.avatarPicker}>
                     {form.avatarUrl ? <Image source={{ uri: form.avatarUrl }} style={styles.avatarLarge} /> : <Camera color={COLORS.primary} size={32} />}
                  </TouchableOpacity>
                  <Text style={styles.avatarPickerLabel}>Đổi Avatar</Text>
               </View>

               <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Họ Tên</Text>
                  <TextInput value={form.fullName} onChangeText={t => setForm({ ...form, fullName: t })} style={styles.textInput} />
               </View>

               <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Chuyên môn</Text>
                  <TextInput value={form.specialization} onChangeText={t => setForm({ ...form, specialization: t })} style={styles.textInput} />
               </View>

               <View style={styles.row}>
                  <View style={styles.flex1}>
                     <Text style={styles.inputLabel}>Cân nặng(kg)</Text>
                     <TextInput value={form.weight} onChangeText={t => setForm({ ...form, weight: t })} keyboardType="numeric" style={styles.textInput} />
                  </View>
                  <View style={styles.flex1}>
                     <Text style={styles.inputLabel}>Chiều cao(cm)</Text>
                     <TextInput value={form.height} onChangeText={t => setForm({ ...form, height: t })} keyboardType="numeric" style={styles.textInput} />
                  </View>
               </View>

               <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Mỡ BodyFat (%)</Text>
                  <TextInput value={form.bodyFat} onChangeText={t => setForm({ ...form, bodyFat: t })} keyboardType="numeric" style={styles.textInput} />
               </View>

               <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
                     <Text style={styles.cancelButtonText}>HỦY BỎ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                     <Save color="#000" size={20} style={{ marginRight: 8 }} />
                     <Text style={styles.saveButtonText}>LƯU LẠI</Text>
                  </TouchableOpacity>
               </View>
            </ScrollView>
         </KeyboardAvoidingView>
      )
   }

   return (
      <SafeAreaView style={styles.container}>
         <View style={styles.profileHeader}>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
               <Edit2 color={COLORS.primary} size={20} />
            </TouchableOpacity>

            <View style={styles.avatarFrame}>
               {profile?.trainerProfile?.avatarUrl ?
                  <Image source={{ uri: profile.trainerProfile.avatarUrl }} style={styles.avatarLarge} /> :
                  <UserCircle2 color={COLORS.primary} size={48} />
               }
            </View>
            <Text style={styles.profileName}>{profile?.fullName}</Text>
            <Text style={styles.profileRole}>{profile?.role}</Text>
         </View>

         <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.infoCard}>
               <View style={styles.infoItem}>
                  <Phone color="#9ca3af" size={20} style={{ marginRight: 16 }} />
                  <Text style={styles.infoText}>{profile?.phone}</Text>
               </View>
               <View style={styles.infoItem}>
                  <Briefcase color="#9ca3af" size={20} style={{ marginRight: 16 }} />
                  <Text style={styles.infoText}>{profile?.trainerProfile?.specialization || 'Chưa thiết lập'}</Text>
               </View>
            </View>

            <TouchableOpacity 
              onPress={() => router.push('/(trainer)/my-metrics' as any)}
              style={styles.statsCard}
            >
               <View style={styles.cardHeader}>
                  <TrendingUp color={COLORS.primary} size={20} />
                  <Text style={styles.cardTitle}>CHỈ SỐ CƠ THỂ CỦA TÔI</Text>
               </View>
               <View style={styles.statsGrid}>
                  <View style={styles.gridItem}>
                     <Text style={styles.gridLabel}>Cân Nặng</Text>
                     <Text style={styles.gridValue}>{profile?.trainerProfile?.weight || '--'} kg</Text>
                  </View>
                  <View style={styles.gridItem}>
                     <Text style={styles.gridLabel}>Chiều Cao</Text>
                     <Text style={styles.gridValue}>{profile?.trainerProfile?.height || '--'} cm</Text>
                  </View>
                  <View style={styles.gridItem}>
                     <Text style={styles.gridLabel}>Cơ / Mỡ</Text>
                     <Text style={styles.gridValue}>{profile?.trainerProfile?.bodyFat || '--'} %</Text>
                  </View>
               </View>
               <Text style={styles.viewMoreText}>Xem chi tiết & Cập nhật →</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(trainer)/availability' as any)} style={styles.availabilityAction}>
               <Calendar color={COLORS.primary} size={20} />
               <Text style={styles.availabilityText}>QUẢN LÝ LỊCH RẢNH</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} style={styles.logoutAction}>
               <LogOut color={COLORS.error} size={20} />
               <Text style={styles.logoutText}>ĐĂNG XUẤT</Text>
            </TouchableOpacity>
         </ScrollView>
      </SafeAreaView>
   )
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: COLORS.background,
   },
   scroll: {
      flex: 1,
      paddingHorizontal: 24,
   },
   avatarPickerSection: {
      alignItems: 'center',
      marginVertical: 32,
   },
   avatarPicker: {
      width: 96,
      height: 96,
      backgroundColor: COLORS.avatarBg,
      borderRadius: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: COLORS.primary,
      overflow: 'hidden',
   },
   avatarLarge: {
      width: 96,
      height: 96,
   },
   avatarPickerLabel: {
      color: COLORS.primary,
      marginTop: 12,
      fontWeight: '700',
      fontSize: 12,
      textTransform: 'uppercase',
   },
   formGroup: {
      marginBottom: 20,
   },
   inputLabel: {
      color: COLORS.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
      fontSize: 13,
   },
   textInput: {
      backgroundColor: COLORS.inputBg,
      color: COLORS.textMain,
      padding: 16,
      borderRadius: 16,
      fontSize: 16,
      fontWeight: '700',
   },
   row: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 20,
   },
   flex1: {
      flex: 1,
   },
   buttonRow: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 12,
   },
   cancelButton: {
      flex: 1,
      backgroundColor: '#1f2937',
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
   },
   cancelButtonText: {
      color: COLORS.textMain,
      fontWeight: '700',
   },
   saveButton: {
      flex: 1,
      backgroundColor: COLORS.primary,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
   },
   saveButtonText: {
      color: '#000',
      fontWeight: '700',
   },
   profileHeader: {
      paddingTop: 40,
      paddingBottom: 24,
      alignItems: 'center',
      position: 'relative',
   },
   editButton: {
      position: 'absolute',
      top: 40,
      right: 24,
      padding: 10,
      backgroundColor: COLORS.avatarBg,
      borderRadius: 20,
   },
   avatarFrame: {
      width: 96,
      height: 96,
      backgroundColor: COLORS.avatarBg,
      borderRadius: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: COLORS.primary,
      marginBottom: 16,
      overflow: 'hidden',
   },
   profileName: {
      color: COLORS.textMain,
      fontSize: 24,
      fontWeight: '900',
   },
   profileRole: {
      color: COLORS.textSecondary,
      fontWeight: '600',
      marginTop: 4,
   },
   infoCard: {
      backgroundColor: COLORS.card,
      borderRadius: 32,
      padding: 24,
      borderWidth: 1,
      borderColor: COLORS.border,
      marginBottom: 24,
   },
   infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
   },
   infoText: {
      color: COLORS.textMain,
      fontSize: 16,
      fontWeight: '700',
   },
   statsCard: {
      backgroundColor: COLORS.card,
      borderRadius: 32,
      padding: 24,
      borderWidth: 1,
      borderColor: COLORS.border,
      marginBottom: 24,
   },
   cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
   },
   cardTitle: {
      color: COLORS.textSecondary,
      fontWeight: '800',
      fontSize: 12,
      letterSpacing: 1,
   },
   statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
   },
   viewMoreText: {
      color: COLORS.primary,
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'right',
   },
   gridItem: {
      alignItems: 'center',
   },
   gridLabel: {
      color: COLORS.textSecondary,
      fontSize: 12,
      marginBottom: 4,
   },
   gridValue: {
      color: COLORS.textMain,
      fontWeight: '900',
      fontSize: 18,
   },
   availabilityAction: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      paddingVertical: 18,
      borderRadius: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.2)',
   },
   availabilityText: {
      color: COLORS.primary,
      fontWeight: '900',
      fontSize: 16,
   },
   logoutAction: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      paddingVertical: 18,
      borderRadius: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
   },
   logoutText: {
      color: COLORS.error,
      fontWeight: '900',
      fontSize: 16,
   }
});

