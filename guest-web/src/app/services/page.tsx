'use client';

import { useEffect, useState } from 'react';
import { getMembershipPlans } from '@/services/api';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';

export default function ServicesPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMembershipPlans()
      .then(res => setPlans(res))
      .finally(() => setLoading(false));
  }, []);

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
                  {plan.ptSessions > 0 ? (
                    <li className="flex items-center gap-3 text-sm font-bold text-white"><Star className="w-5 h-5 text-neon-green" /> Tặng {plan.ptSessions} Buổi Gym cùng PT</li>
                  ) : (
                    <li className="flex items-center gap-3 text-sm text-gray-500 opacity-50"><XIcon /> Không bao gồm PT cá nhân</li>
                  )}
                </ul>

                <button className="w-full bg-white/5 border border-white/10 hover:bg-neon-blue hover:text-black hover:border-neon-blue transition-all font-bold tracking-wide uppercase px-6 py-4 rounded-xl">
                  Đăng Ký Mua Gói
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  )
}
