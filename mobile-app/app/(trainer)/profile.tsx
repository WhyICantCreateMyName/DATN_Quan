import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { gymStorage } from '@/libs/storage';
import { authService, trainerService } from '@/services/trainerApi';
import { setAuthToken } from '@/services/apiClient';
import { LogOut, UserCircle2, Phone, Briefcase, Camera, Save, Edit2, Calendar, TrendingUp, Info } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { KINETIC_THEME } from '@/constants/theme';

export default function ProfileScreen() {
   const router = useRouter();
   const [profile, setProfile] = useState<any>(null);
   const [isEditing, setIsEditing] = useState(false);
   const [form, setForm] = useState({ fullName: '', specialization: '', bio: '', avatarUrl: '' });
   const [saving, setSaving] = useState(false);

   const load = () => {
      authService.getMe().then(data => {
         setProfile(data);
         const tr = data.trainerProfile || {};
         setForm({
            fullName: data.fullName || '',
            specialization: tr.specialization || '',
            bio: tr.bio || '',
            avatarUrl: data.avatarUrl || ''
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
      const result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
         allowsEditing: true,
         aspect: [1, 1],
         quality: 0.5,
         base64: true,
      });
      if (!result.canceled && result.assets[0].base64) {
         setForm(prev => ({ ...prev, avatarUrl: `data:image/jpeg;base64,${result.assets[0].base64}` }));
      }
   };

   const handleSave = async () => {
      if (!form.fullName.trim()) {
         Alert.alert('Lỗi', 'Họ tên không được để trống');
         return;
      }
      try {
         setSaving(true);
         await trainerService.updateProfile(form);
         setIsEditing(false);
         load();
      } catch (e: any) {
         Alert.alert('Lỗi', e?.message || 'Không thể lưu hồ sơ');
      } finally {
         setSaving(false);
      }
   };

   if (isEditing) {
      return (
         <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <SafeAreaView style={styles.container}>
               <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
                  <View style={styles.editHeader}>
                     <Text style={styles.editTitle}>Chỉnh Sửa Hồ Sơ PT</Text>
                     <Text style={styles.editSubtitle}>Thông tin hiển thị cho học viên và bộ phận quản lý</Text>
                  </View>

                  <View style={styles.avatarPickerSection}>
                     <TouchableOpacity onPress={pickImage} style={styles.avatarPicker}>
                        {form.avatarUrl ? (
                           <Image source={{ uri: form.avatarUrl }} style={styles.avatarLarge} />
                        ) : (
                           <Camera color={KINETIC_THEME.accentPrimary} size={32} />
                        )}
                     </TouchableOpacity>
                     <Text style={styles.avatarPickerLabel}>CHẠM ĐỂ ĐỔI ẢNH</Text>
                  </View>

                  <View style={styles.formGroup}>
                     <Text style={styles.inputLabel}>HỌ VÀ TÊN</Text>
                     <TextInput 
                        value={form.fullName} 
                        onChangeText={t => setForm(prev => ({ ...prev, fullName: t }))} 
                        placeholder="Nhập họ và tên..."
                        placeholderTextColor={KINETIC_THEME.textMuted}
                        style={styles.textInput} 
                     />
                  </View>

                  <View style={styles.formGroup}>
                     <Text style={styles.inputLabel}>CHUYÊN MÔN CHÍNH</Text>
                     <TextInput 
                        value={form.specialization} 
                        onChangeText={t => setForm(prev => ({ ...prev, specialization: t }))} 
                        placeholder="Ví dụ: Bodybuilding, Giảm mỡ siết cơ, Yoga..."
                        placeholderTextColor={KINETIC_THEME.textMuted}
                        style={styles.textInput} 
                     />
                  </View>

                  <View style={styles.formGroup}>
                     <Text style={styles.inputLabel}>TIỂU SỬ & KINH NGHIỆM (BIO)</Text>
                     <TextInput 
                        value={form.bio} 
                        onChangeText={t => setForm(prev => ({ ...prev, bio: t }))} 
                        placeholder="Tóm tắt số năm kinh nghiệm, thành tích thi đấu..."
                        placeholderTextColor={KINETIC_THEME.textMuted}
                        multiline
                        numberOfLines={4}
                        style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]} 
                     />
                  </View>

                  <View style={styles.buttonRow}>
                     <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>HỦY BỎ</Text>
                     </TouchableOpacity>
                     <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButton}>
                        <Save color={KINETIC_THEME.textOnAccent} size={18} style={{ marginRight: 8 }} />
                        <Text style={styles.saveButtonText}>{saving ? 'ĐANG LƯU...' : 'LƯU HỒ SƠ'}</Text>
                     </TouchableOpacity>
                  </View>
               </ScrollView>
            </SafeAreaView>
         </KeyboardAvoidingView>
      );
   }

   return (
      <SafeAreaView style={styles.container}>
         <View style={styles.profileHeader}>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
               <Edit2 color={KINETIC_THEME.accentPrimary} size={18} />
            </TouchableOpacity>

            <View style={styles.avatarFrame}>
               {profile?.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.avatarLarge} />
               ) : (
                  <UserCircle2 color={KINETIC_THEME.accentPrimary} size={64} />
               )}
            </View>
            <Text style={styles.profileName}>{profile?.fullName || 'Huấn Luyện Viên'}</Text>
            <View style={styles.roleBadge}>
               <Text style={styles.roleBadgeText}>HUẤN LUYỆN VIÊN CÁ NHÂN</Text>
            </View>
         </View>

         <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Card thông tin cơ bản */}
            <View style={styles.infoCard}>
               <View style={styles.infoItem}>
                  <Phone color={KINETIC_THEME.accentPrimary} size={18} style={{ marginRight: 14 }} />
                  <View>
                     <Text style={styles.infoSub}>Số điện thoại</Text>
                     <Text style={styles.infoText}>{profile?.phone || 'Chưa cập nhật'}</Text>
                  </View>
               </View>
               <View style={[styles.infoItem, { borderTopWidth: 1, borderTopColor: KINETIC_THEME.border, paddingTop: 14 }]}>
                  <Briefcase color={KINETIC_THEME.accentPrimary} size={18} style={{ marginRight: 14 }} />
                  <View style={{ flex: 1 }}>
                     <Text style={styles.infoSub}>Chuyên môn</Text>
                     <Text style={styles.infoText}>{profile?.trainerProfile?.specialization || 'General Fitness & Gym'}</Text>
                  </View>
               </View>
               {profile?.trainerProfile?.bio && (
                  <View style={[styles.infoItem, { borderTopWidth: 1, borderTopColor: KINETIC_THEME.border, paddingTop: 14 }]}>
                     <Info color={KINETIC_THEME.textMuted} size={18} style={{ marginRight: 14 }} />
                     <View style={{ flex: 1 }}>
                        <Text style={styles.infoSub}>Giới thiệu</Text>
                        <Text style={styles.bioText}>{profile.trainerProfile.bio}</Text>
                     </View>
                  </View>
               )}
            </View>

            {/* Điều hướng xem Inbody cá nhân */}
            <TouchableOpacity 
               onPress={() => router.push('/(trainer)/my-metrics' as any)}
               style={styles.actionCard}
            >
               <View style={styles.cardHeader}>
                  <TrendingUp color={KINETIC_THEME.accentPrimary} size={20} />
                  <Text style={styles.cardTitle}>CHỈ SỐ HÌNH THỂ & INBODY CỦA TÔI</Text>
               </View>
               <Text style={styles.actionDesc}>Theo dõi tiến trình tăng cơ, giảm mỡ của bản thân qua bảng đo Inbody chuẩn.</Text>
               <Text style={styles.viewMoreText}>Vào trang đo & biểu đồ tiến trình →</Text>
            </TouchableOpacity>

            {/* Điều hướng lịch rảnh */}
            <TouchableOpacity onPress={() => router.push('/(trainer)/availability' as any)} style={styles.availabilityAction}>
               <Calendar color={KINETIC_THEME.accentPrimary} size={20} />
               <Text style={styles.availabilityText}>CẤU HÌNH LỊCH TRỐNG (AVAILABILITY)</Text>
            </TouchableOpacity>

            {/* Đăng xuất */}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutAction}>
               <LogOut color={KINETIC_THEME.accentSecondary} size={20} />
               <Text style={styles.logoutText}>ĐĂNG XUẤT KHỎI HỆ THỐNG</Text>
            </TouchableOpacity>
         </ScrollView>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: KINETIC_THEME.background,
   },
   scroll: {
      flex: 1,
      paddingHorizontal: 20,
   },
   editHeader: {
      marginTop: 16,
      marginBottom: 8,
   },
   editTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: KINETIC_THEME.textPrimary,
      textTransform: 'uppercase',
      letterSpacing: -0.5,
   },
   editSubtitle: {
      fontSize: 13,
      color: KINETIC_THEME.textMuted,
      marginTop: 4,
   },
   profileHeader: {
      alignItems: 'center',
      paddingVertical: 24,
      position: 'relative',
      borderBottomWidth: 1,
      borderBottomColor: KINETIC_THEME.border,
      marginBottom: 16,
   },
   editButton: {
      position: 'absolute',
      right: 20,
      top: 24,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: KINETIC_THEME.surface,
      borderWidth: 1,
      borderColor: KINETIC_THEME.border,
      alignItems: 'center',
      justifyContent: 'center',
   },
   avatarFrame: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: KINETIC_THEME.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: KINETIC_THEME.accentPrimary,
      overflow: 'hidden',
      marginBottom: 12,
   },
   avatarPickerSection: {
      alignItems: 'center',
      marginVertical: 24,
   },
   avatarPicker: {
      width: 100,
      height: 100,
      backgroundColor: KINETIC_THEME.surface,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: KINETIC_THEME.accentPrimary,
      overflow: 'hidden',
   },
   avatarLarge: {
      width: '100%',
      height: '100%',
   },
   avatarPickerLabel: {
      color: KINETIC_THEME.accentPrimary,
      marginTop: 10,
      fontWeight: '800',
      fontSize: 11,
      letterSpacing: 1,
   },
   profileName: {
      color: KINETIC_THEME.textPrimary,
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.3,
   },
   roleBadge: {
      backgroundColor: KINETIC_THEME.surface,
      borderWidth: 1,
      borderColor: KINETIC_THEME.border,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 6,
   },
   roleBadgeText: {
      color: KINETIC_THEME.accentPrimary,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.8,
   },
   infoCard: {
      backgroundColor: KINETIC_THEME.surface,
      borderWidth: 1,
      borderColor: KINETIC_THEME.border,
      borderRadius: 20,
      padding: 18,
      marginBottom: 16,
   },
   infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
   },
   infoSub: {
      color: KINETIC_THEME.textMuted,
      fontSize: 11,
      textTransform: 'uppercase',
      fontWeight: '700',
      letterSpacing: 0.5,
   },
   infoText: {
      color: KINETIC_THEME.textPrimary,
      fontSize: 15,
      fontWeight: '600',
      marginTop: 2,
   },
   bioText: {
      color: KINETIC_THEME.textPrimary,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 2,
   },
   actionCard: {
      backgroundColor: KINETIC_THEME.surface,
      borderWidth: 1,
      borderColor: KINETIC_THEME.border,
      borderRadius: 20,
      padding: 18,
      marginBottom: 16,
   },
   cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
   },
   cardTitle: {
      color: KINETIC_THEME.textPrimary,
      fontWeight: '900',
      fontSize: 13,
      letterSpacing: 0.5,
   },
   actionDesc: {
      color: KINETIC_THEME.textMuted,
      fontSize: 12,
      lineHeight: 18,
   },
   viewMoreText: {
      color: KINETIC_THEME.accentPrimary,
      fontSize: 12,
      fontWeight: '800',
      marginTop: 10,
   },
   availabilityAction: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: KINETIC_THEME.surface,
      borderWidth: 1,
      borderColor: KINETIC_THEME.border,
      borderRadius: 16,
      paddingVertical: 16,
      marginBottom: 16,
   },
   availabilityText: {
      color: KINETIC_THEME.textPrimary,
      fontWeight: '800',
      fontSize: 12,
      letterSpacing: 0.8,
   },
   logoutAction: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: KINETIC_THEME.accentSecondary + '40',
      borderRadius: 16,
      paddingVertical: 16,
      marginBottom: 24,
   },
   logoutText: {
      color: KINETIC_THEME.accentSecondary,
      fontWeight: '800',
      fontSize: 12,
      letterSpacing: 0.8,
   },
   formGroup: {
      marginBottom: 16,
   },
   inputLabel: {
      color: KINETIC_THEME.textMuted,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginBottom: 8,
      marginLeft: 4,
   },
   textInput: {
      backgroundColor: KINETIC_THEME.surface,
      color: KINETIC_THEME.textPrimary,
      borderWidth: 1,
      borderColor: KINETIC_THEME.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 14,
      fontSize: 15,
      fontWeight: '600',
   },
   buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
   },
   cancelButton: {
      flex: 1,
      backgroundColor: KINETIC_THEME.surface,
      borderWidth: 1,
      borderColor: KINETIC_THEME.border,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
   },
   cancelButtonText: {
      color: KINETIC_THEME.textMuted,
      fontWeight: '800',
      fontSize: 12,
      letterSpacing: 0.8,
   },
   saveButton: {
      flex: 2,
      backgroundColor: KINETIC_THEME.accentPrimary,
      borderRadius: 14,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
   },
   saveButtonText: {
      color: KINETIC_THEME.textOnAccent,
      fontWeight: '900',
      fontSize: 13,
      letterSpacing: 0.8,
   },
});
