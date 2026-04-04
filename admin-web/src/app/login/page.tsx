'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosClient from '@/services/axiosClient';

export default function LoginPage() {
  const [phone, setPhone] = useState('0902222222'); // Hardcode sdt Admin cho tiện test
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const { loadUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axiosClient.post('/auth/login', { phone, password });
      await loadUser(); // AuthContext sẽ tự redirect sang /dashboard nếu pass
    } catch (err: any) {
      setError(err.error || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">TITANGYM <span className="text-[#39FF14]">ADMIN</span></h1>
          <p className="text-gray-400 mt-2 text-sm">Cổng quản trị nội bộ dành cho Nhân viên</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Số điện thoại</label>
            <input 
              type="text" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] transition-colors"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] transition-colors"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#39FF14] text-black font-bold uppercase tracking-wide py-4 rounded-xl hover:bg-white transition-all disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập Hệ Thống'}
          </button>
        </form>
      </div>
    </div>
  );
}
