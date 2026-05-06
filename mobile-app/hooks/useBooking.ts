import { useState, useEffect } from 'react';
import { memberService } from '@/services/memberApi';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

export function useBooking() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeSub, setActiveSub] = useState<any>(null);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingType, setBookingType] = useState<'PT' | 'GROUP'>('PT');
  const [groupClasses, setGroupClasses] = useState<any[]>([]);

  const reload = async () => {
    try {
       const [dash, trainersData, classesRes] = await Promise.all([
          memberService.getDashboard(),
          memberService.getTrainers(),
          memberService.getGroupClasses()
       ]);
       setActiveSub(dash.activeSubscription);
       setTrainers(trainersData);
       setGroupClasses(classesRes.data || []);
       
       if (trainersData.length > 0 && !selectedTrainer) {
          handleSelectTrainer(trainersData[0]);
       }
    } catch (e) {
       console.error(e);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    reload();

    const sub = Linking.addEventListener('url', (event) => {
      const { queryParams } = Linking.parse(event.url);
      if (queryParams?.refresh === 'true') {
        reload();
      }
    });

    return () => sub.remove();
  }, []);

  const handleSelectTrainer = (trainer: any) => {
    setSelectedTrainer(trainer);
    setSelectedSlot(null);
    memberService.getTrainerAvailability(trainer.id)
      .then(setAvailability)
      .catch(() => setAvailability([]));
  };

  const handleConfirmPTBooking = async () => {
    if (!selectedSlot || !selectedTrainer) return;

    if (!activeSub || activeSub.remainingPtSessions <= 0) {
      Alert.alert(
        'Hết buổi PT',
        'Bạn đã hết buổi tập PT hoặc chưa có gói tập. Vui lòng mua thêm để tiếp tục đặt lịch.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Mua ngay', onPress: () => router.push('/(member)/membership' as any) }
        ]
      );
      return;
    }

    setBookingLoading(true);
    try {
      const now = new Date();
      const currentDay = now.getDay();
      const targetDay = selectedSlot.dayOfWeek;
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7;
      
      const bookingDate = new Date(now);
      bookingDate.setDate(now.getDate() + diff);
      
      const [sh, sm] = selectedSlot.startTime.split(':');
      const [eh, em] = selectedSlot.endTime.split(':');
      
      const startTime = new Date(bookingDate);
      startTime.setHours(parseInt(sh), parseInt(sm), 0, 0);
      
      const endTime = new Date(bookingDate);
      endTime.setHours(parseInt(eh), parseInt(em), 0, 0);

      await memberService.createBooking({
        trainerId: selectedTrainer.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      Alert.alert('Thành công', 'Lịch hẹn của bạn đã được gửi và đang chờ PT xác nhận.');
      router.push('/(member)/schedule' as any);
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.error || 'Không thể đặt lịch');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleConfirmGroupBooking = async (cls: any) => {
    if (!activeSub) {
      Alert.alert(
        'Yêu cầu Gói tập',
        'Bạn cần có gói tập đang hoạt động để đăng ký lớp Yoga/Zumba.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Mua ngay', onPress: () => router.push('/(member)/membership' as any) }
        ]
      );
      return;
    }
    setBookingLoading(true);
    try {
      await memberService.createBooking({
        groupClassId: cls.id,
        startTime: cls.startTime,
        endTime: cls.endTime,
      });
      Alert.alert('Thành công', `Bạn đã giữ chỗ lớp ${cls.name} thành công.`);
      router.push('/(member)/schedule' as any);
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.error || 'Không thể đăng ký lớp');
    } finally {
      setBookingLoading(false);
    }
  };

  return {
    loading,
    activeSub,
    trainers,
    selectedTrainer,
    availability,
    selectedSlot,
    bookingLoading,
    bookingType,
    groupClasses,
    setBookingType,
    setSelectedSlot,
    handleSelectTrainer,
    handleConfirmPTBooking,
    handleConfirmGroupBooking,
    reload
  };
}
