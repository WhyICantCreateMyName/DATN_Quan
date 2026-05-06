'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, Dumbbell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();

  return (
    <nav className="fixed w-full z-40 glass top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <Dumbbell className="text-neon-blue w-8 h-8" />
            <Link href="/" className="font-black text-2xl tracking-tighter">
              TITAN<span className="text-neon-blue">GYM</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="hover:text-neon-blue transition-colors px-3 py-2 text-sm font-medium uppercase">Trang Chủ</Link>
              <Link href="/schedule" className="hover:text-neon-blue transition-colors px-3 py-2 text-sm font-medium uppercase">Lịch Học</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <Link 
                href={currentUser.role === 'ADMIN' ? '/dashboard' : '/pos'}
                className="bg-neon-blue text-black font-bold uppercase tracking-wide px-6 py-2.5 rounded-full hover:bg-white transition-all transform hover:scale-105 neon-border"
              >
                Vào Hệ Thống
              </Link>
            ) : (
              <Link 
                href="/login"
                className="bg-neon-blue text-black font-bold uppercase tracking-wide px-6 py-2.5 rounded-full hover:bg-white transition-all transform hover:scale-105 neon-border"
              >
                Đăng Nhập
              </Link>
            )}
          </div>

          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-white hover:text-neon-blue focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass border-t border-white/5 absolute w-full"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 flex flex-col">
            <Link href="/" className="hover:text-neon-blue block px-3 py-2 text-base font-medium">TRANG CHỦ</Link>
            <Link href="/schedule" className="hover:text-neon-blue block px-3 py-2 text-base font-medium">LỊCH HỌC</Link>
            {currentUser ? (
               <Link href={currentUser.role === 'ADMIN' ? '/dashboard' : '/pos'} className="mt-4 w-full bg-neon-blue text-black font-bold px-6 py-3 rounded-md hover:bg-white transition-all text-center">
                VÀO HỆ THỐNG
              </Link>
            ) : (
              <Link href="/login" className="mt-4 w-full bg-neon-blue text-black font-bold px-6 py-3 rounded-md hover:bg-white transition-all text-center">
                ĐĂNG NHẬP
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
