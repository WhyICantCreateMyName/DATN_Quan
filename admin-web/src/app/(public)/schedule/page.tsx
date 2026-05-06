'use client';

import { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvailableClasses, bookClass } from '@/services/bookingService';
import { useAuth } from '@/context/AuthContext';

export default function PublicSchedulePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [authNeeded, setAuthNeeded] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { currentUser } = useAuth();

  useEffect(() => {
    getAvailableClasses()
      .then((res: any) => setClasses(res))
      .catch(err => console.error(err));
  }, []);

  const handleBooking = async (cls: any) => {
    if (!currentUser) {
      setAuthNeeded(true);
      return;
    }

    setIsProcessing(true);
    try {
      await bookClass(currentUser.id, cls.id, cls.startTime, cls.endTime);
      setBookSuccess(true);
    } catch (e: any) {
      alert("Đăng ký không thành công. Vui lòng thử lại sau.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg py-24 relative mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Lịch Học <span className="neon-text">Hàng Tuần</span></h1>
          <p className="text-gray-400 max-w-xl">Khám phá các lớp học bùng nổ cùng cộng đồng TitanGym. Hội viên có thể đăng ký giữ chỗ trực tuyến ngay tại đây.</p>
        </div>

        <div className="grid gap-6">
          {classes.length > 0 ? (
            classes.map((cls: any) => {
              const start = new Date(cls.startTime);
              return (
                <div key={cls.id} className="glass p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-neon-blue/50 transition-colors">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="bg-dark-surface p-4 rounded-xl border border-white/5 text-center min-w-24">
                      <p className="text-sm text-neon-blue font-bold uppercase mb-1">{start.toLocaleDateString('vi-VN', { weekday: 'short' })}</p>
                      <p className="text-3xl font-black">{start.getDate()}</p>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black mb-2 uppercase">{cls.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Tối đa {cls.capacity} bạn</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="text-neon-green font-bold text-sm uppercase px-3 py-1 bg-neon-green/10 rounded-full">Dành Cho Hội Viên</div>
                    <button
                      onClick={() => handleBooking(cls)}
                      disabled={isProcessing}
                      className="w-full md:w-auto bg-neon-blue text-black hover:bg-white hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all font-bold tracking-wide uppercase px-8 py-3 rounded-xl disabled:opacity-50"
                    >
                      {isProcessing ? 'Đang xử lý...' : 'Đăng Ký Tham Gia'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass p-12 rounded-2xl text-center">
              <p className="text-gray-400">Hiện chưa có lịch học nào được công bố. Vui lòng quay lại sau!</p>
            </div>
          )}
        </div>
      </div>

      {/* Warning Modal */}
      <AnimatePresence>
        {authNeeded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setAuthNeeded(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-dark-card border border-white/10 p-8 rounded-2xl max-w-sm text-center shadow-2xl">
              <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">Khoan đã!</h3>
              <p className="text-gray-400 mb-6">Bạn cần đăng nhập tài khoản Hội viên để đăng ký tham gia lớp học này.</p>
              <button onClick={() => setAuthNeeded(false)} className="bg-neon-blue text-black font-bold py-3 px-8 rounded-xl hover:bg-white transition-all uppercase tracking-wide text-sm">Đã hiểu</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {bookSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setBookSuccess(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-dark-card border border-white/10 p-8 rounded-2xl max-w-sm text-center shadow-2xl">
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-neon-green" />
              </div>
              <h3 className="text-xl font-bold mb-2 uppercase tracking-tight text-neon-green">Giữ Chỗ Thành Công!</h3>
              <p className="text-gray-400 mb-6">Bạn đã có một suất tập tại lớp học này. Hẹn gặp bạn tại phòng gym!</p>
              <button onClick={() => setBookSuccess(false)} className="w-full bg-white/10 text-white font-bold py-3 px-6 rounded-xl hover:bg-neon-blue hover:text-black transition-all border border-white/10">Quá Tuyệt Vời</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
