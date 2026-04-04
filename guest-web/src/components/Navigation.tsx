'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Dumbbell, User as UserIcon, LogOut } from 'lucide-react';
import { loginUser, logoutUser } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  // Hardcode cho Test Data
  const [phone, setPhone] = useState('0903333333');
  const [password, setPassword] = useState('123456');

  // Lấy dữ liệu từ AuthContext
  const { currentUser, loadUser, loading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser(phone, password);
      await loadUser(); // Tải lại user từ /me API
      setShowLogin(false);
    } catch (error: any) {
      alert(error.error || 'Sai thông tin đăng nhập');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser(); // Xoá Http Cookie
      await loadUser();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
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
                <Link href="/" className="hover:text-neon-blue transition-colors px-3 py-2 text-sm font-medium">Trang Chủ</Link>
                <Link href="/services" className="hover:text-neon-blue transition-colors px-3 py-2 text-sm font-medium">Dịch Vụ & PT</Link>
                <Link href="/schedule" className="hover:text-neon-blue transition-colors px-3 py-2 text-sm font-medium">Lịch Học</Link>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {!loading && (
                currentUser ? (
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 text-sm font-bold text-neon-blue"><UserIcon className="w-4 h-4"/> Chào, {currentUser.fullName}</span>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors" title="Đăng Xuất"><LogOut className="w-5 h-5"/></button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowLogin(true)}
                    className="bg-neon-blue text-black font-bold uppercase tracking-wide px-6 py-2.5 rounded-full hover:bg-white transition-all transform hover:scale-105 neon-border"
                  >
                    Đăng Nhập
                  </button>
                )
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
              <Link href="/" className="hover:text-neon-blue block px-3 py-2 text-base font-medium">Trang Chủ</Link>
              <Link href="/services" className="hover:text-neon-blue block px-3 py-2 text-base font-medium">Dịch Vụ & PT</Link>
              <Link href="/schedule" className="hover:text-neon-blue block px-3 py-2 text-base font-medium">Lịch Học</Link>
              {currentUser ? (
                <button onClick={handleLogout} className="mt-4 w-full bg-red-500/20 text-red-400 font-bold px-6 py-3 rounded-md hover:bg-red-500 hover:text-white transition-all text-left">
                  Đăng Xuất
                </button>
              ) : (
                <button onClick={() => setShowLogin(true)} className="mt-4 w-full bg-neon-blue text-black font-bold px-6 py-3 rounded-md hover:bg-white transition-all text-left">
                  Đăng Nhập
                </button>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLogin(false)} />
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="relative w-full max-w-sm bg-dark-card border border-white/10 rounded-3xl p-8 shadow-2xl">
              <button onClick={() => setShowLogin(false)} className="absolute right-4 top-4 text-gray-400 hover:text-white pt-2 pr-2"><X className="w-5 h-5"/></button>
              
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight text-center">Đăng <span className="neon-text">Nhập</span></h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Số điện thoại</label>
                  <input type="text" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 focus:border-neon-blue outline-none" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Mật khẩu</label>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 focus:border-neon-blue outline-none" required />
                </div>
                <button type="submit" className="w-full bg-neon-blue text-black font-bold py-3 rounded-xl mt-4 hover:bg-white transition-all neon-border">Truy Cập</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
