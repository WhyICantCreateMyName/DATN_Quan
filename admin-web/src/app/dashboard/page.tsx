'use client';

import { useState, useEffect } from 'react';
import { Users, Activity, Banknote, CalendarCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axiosClient from '@/services/axiosClient';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    try {
      const data = await axiosClient.get('/stats');
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
    // Re-fetch sau mỗi 30s để live reload giả lập
    const timer = setInterval(fetchStats, 30000);
    return () => clearInterval(timer);
  }, []);

  if (!stats) return <div className="text-gray-400 p-8">Đang đồng bộ dữ liệu...</div>;

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Tổng Quan Hiệu Suất</h1>
        <p className="text-gray-400">Theo dõi doanh thu, lượt khách ra vào (Check-in) và hiệu suất bán gói tập theo thời gian thực.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Doanh thu hôm nay</h3>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><Banknote className="w-5 h-5"/></div>
          </div>
          <p className="text-3xl font-black">{(stats.overview.todayRevenue).toLocaleString('vi-VN')} đ</p>
          <p className="text-sm text-green-400 mt-2 flex items-center gap-1">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Khách Lên Bar (Check-in)</h3>
            <div className="p-2 bg-[#39FF14]/10 rounded-lg text-[#39FF14]"><Activity className="w-5 h-5"/></div>
          </div>
          <p className="text-3xl font-black">{stats.overview.todayCheckIns}</p>
          <p className="text-sm text-gray-500 mt-2">Hôm nay</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Thẻ Đang Hoạt Động (Active)</h3>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><CalendarCheck className="w-5 h-5"/></div>
          </div>
          <p className="text-3xl font-black">{stats.overview.activeMemberships}</p>
          <p className="text-sm text-gray-500 mt-2">Sinh ra dòng tiền</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Tổng File Khách Hàng</h3>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Users className="w-5 h-5"/></div>
          </div>
          <p className="text-3xl font-black">{stats.overview.totalMembers}</p>
          <p className="text-sm text-gray-500 mt-2">Tính cả khách quá hạn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <h3 className="text-xl font-bold mb-6">Biểu đồ Doanh thu (7 ngày qua)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} đ`, 'Doanh thu']}
                />
                <Bar dataKey="total" fill="#39FF14" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <h3 className="text-xl font-bold mb-6">Tương quan Thẻ Tập</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl">
              <div>
                <p className="font-bold text-[#39FF14]">Đang Hoạt Động</p>
                <p className="text-sm text-gray-400">Total Active</p>
              </div>
              <span className="text-xl font-black">{stats.statusCount.active}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl">
              <div>
                <p className="font-bold text-yellow-500">Sắp Hết Hạn</p>
                <p className="text-sm text-gray-400">Dưới 7 ngày (Cần CSKH)</p>
              </div>
              <span className="text-xl font-black">{stats.statusCount.expiring}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl">
              <div>
                <p className="font-bold text-blue-500">Thẻ Đã Đóng Băng</p>
                <p className="text-sm text-gray-400">Bảo lưu do Y tế/Công tác</p>
              </div>
              <span className="text-xl font-black">{stats.statusCount.frozen}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl opacity-50">
              <div>
                <p className="font-bold text-gray-300">Đã Hết Hạn</p>
                <p className="text-sm text-gray-400">Lead Cần telesale gọi lại</p>
              </div>
              <span className="text-xl font-black">{stats.statusCount.expired}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
