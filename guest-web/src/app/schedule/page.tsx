'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, QrCode, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvailableClasses, bookClass, generateMoMoPayment } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function SchedulePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [authNeeded, setAuthNeeded] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Lấy currentUser từ AuthContext thay vì localStorage
  const { currentUser } = useAuth();

  useEffect(() => {
    getAvailableClasses().then((res: any) => setClasses(res));
  }, []);

  const handleBooking = async (cls: any) => {
    if (!currentUser) {
      setAuthNeeded(true);
      return;
    }

    setIsProcessing(true);
    try {
      // Vì đã gắn cookie JWT qua withCredentials nên ta tự động được xác thực ở REST
      await bookClass(currentUser.memberProfile?.id || currentUser.id, cls.id, cls.startTime, cls.endTime);
      
      const payment: any = await generateMoMoPayment(100000, `ThanhToanLop_${cls.name}`);
      setQrCodeData(payment);
    } catch (e: any) {
      alert("Đăng ký không thành công. Bạn hãy thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Lịch Tập <span className="neon-text">Hôm Nay</span></h1>
          <p className="text-gray-400 max-w-xl">Tra cứu thời khóa biểu và thanh toán vé để giữ slot.</p>
        </div>

        <div className="grid gap-6">
          {classes.map((cls: any) => {
            const start = new Date(cls.startTime);
            const end = new Date(cls.endTime);
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
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute:'2-digit' })}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Sức chứa {cls.capacity} hv</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-neon-green font-bold text-xl">100.000₫</p>
                  <button 
                    onClick={() => handleBooking(cls)}
                    disabled={isProcessing}
                    className="w-full md:w-auto bg-neon-blue text-black hover:bg-white hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all font-bold tracking-wide uppercase px-8 py-3 rounded-xl disabled:opacity-50"
                  >
                    {isProcessing ? 'Đang Xử Lý...' : 'Mua Vé Lớp Nay'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning Modal */}
      <AnimatePresence>
        {authNeeded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setAuthNeeded(false)} />
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="relative bg-dark-card border border-white/10 p-8 rounded-2xl max-w-sm text-center shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Vui Lòng Đăng Nhập</h3>
              <p className="text-gray-400 mb-6">Bạn cần đăng nhập bằng tài khoản hội viên ở thanh Điều hướng (Navigation) phía trên để có thể giữ chỗ.</p>
              <button onClick={() => setAuthNeeded(false)} className="bg-white/10 text-white font-bold py-2 px-6 rounded-lg hover:bg-white/20">Đóng lại</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code MoMo Simulation Modal */}
      <AnimatePresence>
        {qrCodeData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setQrCodeData(null)} />
            <motion.div initial={{y: 50, opacity:0}} animate={{y:0, opacity:1}} exit={{y:50, opacity:0}} className="relative bg-dark-card border border-[#A50064]/50 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(165,0,100,0.2)]">
              <button onClick={() => setQrCodeData(null)} className="absolute right-4 top-4 text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
              
              <div className="text-center">
                <div className="bg-[#A50064] text-white font-bold py-2 rounded-t-xl mb-4">
                  Thanh Toán An Toàn Qua MoMo
                </div>
                <p className="text-gray-300 text-sm mb-4">Mở ứng dụng MoMo và quét mã để hoàn tất đăng ký.</p>
                
                <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeData.payUrl} alt="MoMo QR Sandbox" className="w-48 h-48" />
                </div>
                
                <div className="flex justify-between border-t border-white/10 pt-4 mb-6">
                  <span className="text-gray-400">Số tiền:</span>
                  <span className="font-bold text-xl text-white">{qrCodeData.amount.toLocaleString('vi-VN')}đ</span>
                </div>

                <div className="flex items-center justify-center gap-2 text-[#39FF14] bg-[#39FF14]/10 py-3 rounded-xl border border-[#39FF14]/20">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">Chỗ của bạn đã được tạm giữ 5 phút</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
