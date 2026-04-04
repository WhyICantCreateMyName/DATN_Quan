'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarCheck } from 'lucide-react';
import { trialRegistration } from '@/services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrialBookingModal({ isOpen, onClose }: Props) {
  const [formData, setFormData] = useState({ fullName: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await trialRegistration(formData.fullName, formData.phone);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setFormData({ fullName: '', phone: '' });
      }, 3000);
    } catch (error) {
      alert('Đã có lỗi xảy ra. Hãy thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-dark-card border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl"
          >
            {/* Decals */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            {success ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-neon-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarCheck className="w-10 h-10 text-neon-blue" />
                </div>
                <h3 className="text-2xl font-black mb-2">Ngầu Quá! Đã Ghi Nhận!</h3>
                <p className="text-gray-400">Lễ tân đáng yêu của chúng mình sẽ nhấc máy gọi bạn trong ít phút nữa để chốt lịch hẹn lên gặp mặt đo inbody nhé.</p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Kích Hoạt <span className="neon-text">Thẻ Quyền Lực</span></h2>
                <p className="text-gray-400 mb-8 text-sm">Trọn vẹn 7 ngày cày ải miệt mài hệ thống VIP. Điền thông tin vào ngay để lột xác nhanh chóng!</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Họ và tên của bạn</label>
                    <input 
                      type="text" 
                      required
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                      placeholder="Nguyễn Văn A" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Số điện thoại</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                      placeholder="09xx xxx xxx" 
                    />
                  </div>
                  <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full bg-neon-blue text-black font-bold uppercase tracking-wide py-4 border border-transparent rounded-xl hover:bg-white transition-all neon-border flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? 'Đang Ép Mỡ...' : 'Tới Bến Luôn'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
