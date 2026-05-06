'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight, Activity, Users, MapPin, CheckCircle2, Ticket, CreditCard, ChevronRight } from 'lucide-react';
import { catalogService } from '@/services/catalogService';

export default function LandingPage() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    catalogService.getPlans(1, 4).then(res => setPlans(res.data)).catch(err => console.error(err));
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero_bg.png"
            alt="Gym Background"
            fill
            priority
            className="object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tighter leading-tight">
              Khai Phá <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-white">
                Phiên Bản Hoàn Hảo Nhất
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl font-light">
              Chào mừng bạn đến với cộng đồng thể hình bùng nổ nhất. Trang thiết bị đỉnh cao cùng những huấn luyện viên tâm huyết sẽ giúp bạn sớm điêu khắc nên vóc dáng trong mơ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/schedule"
                className="bg-neon-blue text-black font-bold uppercase tracking-wide px-8 py-4 rounded-full hover:bg-white transition-all transform hover:scale-105 neon-border flex items-center justify-center gap-2"
              >
                Xem Lịch Tập <ArrowRight className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="glass text-white font-bold uppercase tracking-wide px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                <MapPin className="w-5 h-5 text-neon-blue" /> Đăng ký tại quầy
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="py-16 border-y border-white/5 relative z-20 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -5 }} className="glass p-8 rounded-2xl flex flex-col items-center text-center">
              <Activity className="w-12 h-12 text-neon-blue mb-4 animate-pulse-slow" />
              <h3 className="text-3xl font-black mb-2">500+</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Thiết Bị Tối Tân</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="glass p-8 rounded-2xl flex flex-col items-center text-center">
              <Users className="w-12 h-12 text-neon-blue mb-4 animate-pulse-slow" />
              <h3 className="text-3xl font-black mb-2">50+</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Coach Đồng Hành</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="glass p-8 rounded-2xl flex flex-col items-center text-center">
              <MapPin className="w-12 h-12 text-neon-blue mb-4 animate-pulse-slow" />
              <h3 className="text-3xl font-black mb-2">5</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cơ Sở Trải Dài</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRICING PLANS */}
      <section className="py-24 bg-dark-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Gói Tập <span className="neon-text">Linh Hoạt</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Lựa chọn lộ trình phù hợp với mục tiêu và ngân sách của bạn. Không phí ẩn, không ràng buộc rắc rối.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan: any) => (
              <motion.div 
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                className="glass p-8 rounded-3xl border-white/5 flex flex-col relative overflow-hidden group"
              >
                {plan.ptSessions > 0 && (
                  <div className="absolute -right-12 top-6 bg-neon-blue text-black font-black py-1 px-12 rotate-45 text-[10px] uppercase tracking-widest">
                    Best Value
                  </div>
                )}
                <h3 className="text-xl font-black mb-2 uppercase">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black text-neon-blue">{(plan.price / 1000).toLocaleString('vi-VN')}K</span>
                  <span className="text-gray-500 text-sm ml-1">/ {plan.durationDays} ngày</span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-neon-blue" /> Check-in không giới hạn
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-neon-blue" /> Toàn bộ trang thiết bị
                  </li>
                  {plan.ptSessions > 0 && (
                    <li className="flex items-center gap-2 text-sm text-neon-green font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Tặng {plan.ptSessions} buổi PT
                    </li>
                  )}
                </ul>
                <button 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full py-3 rounded-xl border border-white/10 group-hover:border-neon-blue group-hover:bg-neon-blue group-hover:text-black transition-all font-bold uppercase tracking-wide text-xs"
                >
                  Đăng ký ngay
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTRATION STEPS */}
      <section className="py-24 bg-dark-surface border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Gia Nhập <span className="neon-text">TitanGym</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Chỉ với 3 bước đơn giản để bắt đầu hành trình thay đổi vóc dáng của bạn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: MapPin, title: "Đến Trực Tiếp", desc: "Ghé thăm cơ sở TitanGym gần nhất tại 124 Hoàng Mai Thám để tham quan không gian tập luyện." },
              { icon: Ticket, title: "Chọn Gói Tập", desc: "Đội ngũ lễ tân sẽ tư vấn gói tập phù hợp nhất với mục tiêu và thời gian biểu của bạn." },
              { icon: CreditCard, title: "Onboarding", desc: "Hoàn tất thủ tục, chụp ảnh hồ sơ và nhận E-card ngay trên App để bắt đầu tập luyện." }
            ].map((step, idx) => (
              <div key={idx} className="relative text-center group">
                <div className="w-20 h-20 bg-neon-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-neon-blue/20 group-hover:border-neon-blue transition-colors">
                  <step.icon className="w-10 h-10 text-neon-blue" />
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-10 -right-6 text-white/10">
                    <ChevronRight className="w-12 h-12" />
                  </div>
                )}
                <h3 className="text-2xl font-black mb-3 uppercase italic tracking-tighter">0{idx + 1}. {step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COACHES SECTION */}
      <section className="py-24 relative overflow-hidden bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Người Bạn <span className="neon-text">Đồng Hành</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Không chỉ là những người hướng dẫn, họ là những người bạn sẽ sát cánh cùng bạn đập tan mọi vòng eo mỡ màng để chạm tới đỉnh cao thể lực.</p>
          </div>
          
          <div className="flex justify-center relative">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative w-80 h-[450px] rounded-3xl overflow-hidden glass border-white/20 group"
            >
              <Image 
                src="/coach_1.png" 
                alt="Gym Coach" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-black mb-1 uppercase">Trần Văn PT</h3>
                <p className="text-neon-blue font-bold uppercase text-sm mb-3 tracking-widest">Master Trainer</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-gray-300 text-sm">Chuyên gia Thể Hình & Giảm mỡ. Bí quyết kiến tạo body vạn người mê.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section id="contact" className="py-24 bg-dark-bg text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-black uppercase mb-8">Sẵn Sàng Thay Đổi <span className="text-neon-blue">Ngay Hôm Nay?</span></h2>
          <p className="text-xl text-gray-400 mb-12">Đến trực tiếp cơ sở TitanGym gần nhất để nhận lộ trình tập luyện cá nhân hóa và bắt đầu hành trình của bạn.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-neon-blue/10 p-3 rounded-xl border border-neon-blue/20">
                  <MapPin className="w-8 h-8 text-neon-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-1">Địa Chỉ Phòng Tập</h3>
                  <p className="text-2xl font-black text-neon-blue uppercase">124 Hoàng Mai Thám, Hà Nội</p>
                </div>
              </div>

              <div className="p-8 glass rounded-3xl border-neon-blue/10">
                <h4 className="text-lg font-bold mb-4 uppercase text-white">Giờ Mở Cửa</h4>
                <div className="space-y-2 text-gray-400">
                  <div className="flex justify-between"><span>Thứ 2 - Thứ 6:</span> <span className="text-white font-bold">05:00 - 22:00</span></div>
                  <div className="flex justify-between"><span>Thứ 7 - CN:</span> <span className="text-white font-bold">07:00 - 20:00</span></div>
                </div>
              </div>
            </div>

            <div className="glass p-4 rounded-3xl border-white/5 overflow-hidden h-[400px] relative group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.863981779836!2d105.81577707503144!3d21.03812778061358!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab0c6b12c6a9%3A0x633d45c553531b78!2zMTI0IEhvw6BuZyBIb2EgVGjDoW0sIFRodXkgS2h1w6osIFTDonkgSOG7kywgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1715000000000!5m2!1svi!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 opacity-70 group-hover:opacity-100"
              ></iframe>
              <div className="absolute inset-0 pointer-events-none border-2 border-neon-blue/20 rounded-2xl group-hover:border-neon-blue/50 transition-colors"></div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}


