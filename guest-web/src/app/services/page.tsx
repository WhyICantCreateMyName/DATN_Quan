'use client';

import { useEffect, useState } from 'react';
import { getMembershipPlans, generateMoMoPayment } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, X, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ServicesPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States cho chốt thanh toán MoMo
  const [authNeeded, setAuthNeeded] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    getMembershipPlans()
      .then((res: any) => setPlans(res))
      .finally(() => setLoading(false));
  }, []);

  const handleBuyPlan = async (plan: any) => {
    if (!currentUser) {
      setAuthNeeded(true);
      return;
    }

    setIsProcessing(true);
    try {
      const payment: any = await generateMoMoPayment(plan.price, `ThanhToanThe_${plan.name}`);
      setQrCodeData(payment);
    } catch (e: any) {
      alert("Đã có lỗi kết nối đến cổng thanh toán MoMo.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg py-20 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Các Hạng Thẻ <span className="neon-text">Đặc Quyền</span></h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Chọn gói tập phù hợp với mục tiêu thể hình của bạn. Khám phá giới hạn bản thân cùng Titan Gym ngay hôm nay.</p>
        </div>

        {loading ? (
          <div className="flex justify-center"><div className="w-10 h-10 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan: any, i) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={plan.id}
                className={`glass p-8 rounded-3xl relative overflow-hidden group hover:border-neon-blue transition-all ${plan.price > 1000000 ? 'border-neon-blue/30 shadow-[0_0_30px_rgba(0,240,255,0.1)]' : ''}`}
              >
                {plan.price > 1000000 && (
                  <div className="absolute top-0 right-0 bg-neon-blue text-black font-bold text-xs uppercase px-4 py-1 rounded-bl-xl">Khuyên Dùng</div>
                )}

                <h3 className="text-2xl font-black uppercase mb-2">{plan.name}</h3>
                <div className="text-3xl flex items-end gap-1 mb-6 font-bold text-neon-blue">
                  {plan.price.toLocaleString('vi-VN')} <span className="text-base text-gray-400 font-normal line-through">.000₫</span>
                </div>

                <p className="text-gray-400 text-sm mb-8 h-10">{plan.description}</p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-neon-blue" /> Thời hạn {plan.durationDays} Ngày</li>
                  <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-neon-blue" /> Không giới hạn thời gian tập</li>
                  <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-neon-blue" /> Đặc quyền tham gia tất cả Lớp học Group X</li>
                  {plan.ptSessions > 0 ? (
                    <li className="flex items-center gap-3 text-sm font-bold text-white"><Star className="w-5 h-5 text-neon-green" /> Tặng {plan.ptSessions} Buổi Gym cùng PT</li>
                  ) : (
                    <li className="flex items-center gap-3 text-sm text-gray-500 opacity-50"><XIcon /> Không bao gồm PT cá nhân</li>
                  )}
                </ul>

                <button 
                  onClick={() => handleBuyPlan(plan)}
                  disabled={isProcessing}
                  className="w-full bg-white/5 border border-white/10 hover:bg-neon-blue hover:text-black hover:border-neon-blue transition-all font-bold tracking-wide uppercase px-6 py-4 rounded-xl disabled:opacity-50"
                >
                  {isProcessing ? 'Đang Tạo Mã...' : 'Đăng Ký Mua Gói'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Warning Modal */}
      <AnimatePresence>
        {authNeeded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setAuthNeeded(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-dark-card border border-white/10 p-8 rounded-2xl max-w-sm text-center shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Đợi Chút Nhé Khách Yêu!</h3>
              <p className="text-gray-400 mb-6">Bạn phải đăng nhập tài khoản ở góc trên màn hình trước khi thực hiện mua Cực Yêu Gói Tập. Nếu chưa có, nhờ lễ tân trợ đăng ký nhé.</p>
              <button onClick={() => setAuthNeeded(false)} className="bg-white/10 text-white font-bold py-2 px-6 rounded-lg hover:bg-white/20">Tôi Biết Rồi</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code MoMo Simulation Modal */}
      <AnimatePresence>
        {qrCodeData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setQrCodeData(null)} />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-dark-card border border-[#A50064]/50 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(165,0,100,0.2)]">
              <button onClick={() => setQrCodeData(null)} className="absolute right-4 top-4 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>

              <div className="text-center">
                <div className="bg-[#A50064] text-white font-bold py-2 rounded-t-xl mb-4">
                  Ví MoMo Sẵn Sàng
                </div>
                <p className="text-gray-300 text-sm mb-4">Sát cánh cùng Titan Gym. Thanh toán an toàn, mở khoá thể lực!</p>

                <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeData.payUrl} alt="MoMo QR Sandbox" className="w-48 h-48" />
                </div>

                <div className="flex justify-between border-t border-white/10 pt-4 mb-6">
                  <span className="text-gray-400">Số tiền:</span>
                  <span className="font-bold text-xl text-white">{qrCodeData.amount.toLocaleString('vi-VN')} đ</span>
                </div>

                <div className="flex items-center justify-center gap-2 text-[#39FF14] bg-[#39FF14]/10 py-3 rounded-xl border border-[#39FF14]/20">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">Quét ngay để kích hoạt tư cách Hội viên</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  )
}
