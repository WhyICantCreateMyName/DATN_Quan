'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Activity, Users, MapPin } from 'lucide-react';
import TrialBookingModal from '@/components/TrialBookingModal';
import { useState } from 'react';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              Đánh Thức <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-white">
                Sức Mạnh Tiềm Ẩn
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl font-light">
              Hệ thống phòng tập chuẩn 5 sao với trang thiết bị hiện đại bậc nhất. Tham gia ngay hôm nay để nhận được sự đồng hành từ các chuyên gia thể hình hàng đầu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-neon-blue text-black font-bold uppercase tracking-wide px-8 py-4 rounded-full hover:bg-white transition-all transform hover:scale-105 neon-border flex items-center justify-center gap-2"
              >
                Tập Thử Miễn Phí <ArrowRight className="w-5 h-5" />
              </button>
              <button className="glass text-white font-bold uppercase tracking-wide px-8 py-4 rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                Xem Lịch Tập
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
              <p className="text-gray-400">Máy Tối Tân</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="glass p-8 rounded-2xl flex flex-col items-center text-center">
              <Users className="w-12 h-12 text-neon-blue mb-4 animate-pulse-slow" />
              <h3 className="text-3xl font-black mb-2">50+</h3>
              <p className="text-gray-400">PT Chuyên Nghiệp</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="glass p-8 rounded-2xl flex flex-col items-center text-center">
              <MapPin className="w-12 h-12 text-neon-blue mb-4 animate-pulse-slow" />
              <h3 className="text-3xl font-black mb-2">5</h3>
              <p className="text-gray-400">Cơ Sở Trung Tâm</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* COACHES ONSNEAK */}
      <section className="py-24 relative overflow-hidden bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Huấn Luyện Viên <span className="neon-text">Hàng Đầu</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Đội ngũ chuyên gia được đào tạo bài bản, sẵn sàng đồng hành cùng bạn thiết kế lộ trình riêng biệt để đạt mục tiêu hằng mơ ước.</p>
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
                <h3 className="text-2xl font-black mb-1">Trần Văn PT</h3>
                <p className="text-neon-blue font-bold uppercase text-sm mb-3">Master Trainer</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-gray-300 text-sm">Chuyên gia Thể Hình & Giảm mỡ. Bí quyết kiến tạo body vạn người mê.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Modal View */}
      <TrialBookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
