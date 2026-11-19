'use client';

import { useState } from 'react';
import { useLogin } from '@/hooks/useLogin';
import { Lock, Phone, AlertCircle } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('0902222222');
  const [password, setPassword] = useState('123456');
  const { login, loading, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ phone, password });
    } catch (err) {
      // Error handled by hook state
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#FFFFFF] rounded-2xl shadow-xl p-8 border border-[#E4E4E0]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4 text-[#EA580C]">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-[#18181B] tracking-tight">
            TITAN<span className="text-[#EA580C]">GYM</span>
          </h1>
          <p className="text-[#6E6E77] mt-1 text-xs">Cổng quản trị vận hành dành cho Ban Quản Lý & Lễ Tân</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">Số điện thoại đăng nhập</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#6E6E77] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại..."
                className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono font-bold text-[#18181B] placeholder-[#6E6E77] focus:outline-hidden focus:border-[#EA580C] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6E6E77] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#18181B] placeholder-[#6E6E77] focus:outline-hidden focus:border-[#EA580C] transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:bg-[#EA580C]/90 shadow-sm shadow-[#EA580C]/20 transition-all disabled:opacity-50 mt-6 cursor-pointer"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'}
          </button>
        </form>
      </div>
    </div>
  );
}
