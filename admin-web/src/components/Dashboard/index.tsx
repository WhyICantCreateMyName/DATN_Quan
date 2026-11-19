'use client';

import { Users, Activity, Banknote, CalendarCheck, TrendingUp, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useDashboard } from '@/hooks/useDashboard';
import { formatVND } from '@/libs/utils';

export default function Dashboard() {
  const { stats, loading } = useDashboard();

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center p-12 text-xs font-mono text-[#6E6E77]">
        Đang đồng bộ dữ liệu tổng quan...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Tổng Quan Hiệu Suất</h1>
        <p className="text-xs text-[#6E6E77] mt-1">
          Theo dõi doanh thu phòng tập, lưu lượng Check-in và trạng thái thẻ hội viên thời gian thực.
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu hôm nay */}
        <div className="bg-[#FFFFFF] border border-[#E4E4E0] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#6E6E77] uppercase tracking-wider">Doanh Thu Hôm Nay</h3>
            <div className="w-8 h-8 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-[#15803D]">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black text-[#15803D]">
            {formatVND(stats.overview.todayRevenue)}
          </p>
          <p className="text-[11px] text-[#6E6E77] mt-1.5 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#15803D]" /> Cập nhật: {new Date().toLocaleTimeString('vi-VN')}
          </p>
        </div>

        {/* Khách Check-in */}
        <div className="bg-[#FFFFFF] border border-[#E4E4E0] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#6E6E77] uppercase tracking-wider">Khách Lên Bar (Check-in)</h3>
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EA580C]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black text-[#18181B]">
            {stats.overview.todayCheckIns} <span className="text-xs font-normal text-[#6E6E77]">lượt</span>
          </p>
          <p className="text-[11px] text-[#6E6E77] mt-1.5">Lưu lượng quét thẻ / QR hôm nay</p>
        </div>

        {/* Thẻ Active */}
        <div className="bg-[#FFFFFF] border border-[#E4E4E0] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#6E6E77] uppercase tracking-wider">Thẻ Đang Hoạt Động</h3>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black text-[#18181B]">
            {stats.overview.activeMemberships} <span className="text-xs font-normal text-[#6E6E77]">hội viên</span>
          </p>
          <p className="text-[11px] text-[#6E6E77] mt-1.5">Gói tập còn hạn hiệu lực</p>
        </div>

        {/* Tổng Khách Hàng */}
        <div className="bg-[#FFFFFF] border border-[#E4E4E0] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#6E6E77] uppercase tracking-wider">Tổng Hồ Sơ Hội Viên</h3>
            <div className="w-8 h-8 rounded-xl bg-[#F7F7F5] border border-[#E4E4E0] flex items-center justify-center text-[#18181B]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black text-[#18181B]">
            {stats.overview.totalMembers} <span className="text-xs font-normal text-[#6E6E77]">hồ sơ</span>
          </p>
          <p className="text-[11px] text-[#6E6E77] mt-1.5">Bao gồm hội viên cũ & mới</p>
        </div>
      </div>

      {/* Main Charts & Membership Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu 7 ngày */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E4E4E0] p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#EA580C]" /> Doanh Thu 7 Ngày Gần Nhất
              </h3>
              <p className="text-xs text-[#6E6E77] mt-0.5">Biến động dòng tiền từ Gói tập và Bán lẻ POS</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E0" vertical={false} />
                <XAxis dataKey="name" stroke="#6E6E77" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#6E6E77"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E4E0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                  formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} đ`, 'Doanh thu']}
                />
                <Bar dataKey="total" fill="#EA580C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tương quan trạng thái thẻ */}
        <div className="bg-[#FFFFFF] border border-[#E4E4E0] p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#18181B] mb-1">Tương Quan Thẻ Tập</h3>
            <p className="text-xs text-[#6E6E77] mb-6">Phân loại thẻ theo trạng thái vận hành</p>

            <div className="space-y-3">
              {/* Đang hoạt động */}
              <div className="flex justify-between items-center p-3.5 rounded-xl bg-green-50/60 border border-green-100">
                <div>
                  <p className="font-bold text-xs text-[#15803D]">Đang Hoạt Động</p>
                  <p className="text-[11px] text-[#6E6E77]">Hợp đồng hợp lệ</p>
                </div>
                <span className="text-lg font-mono font-black text-[#15803D]">{stats.statusCount.active}</span>
              </div>

              {/* Sắp hết hạn */}
              <div className="flex justify-between items-center p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                <div>
                  <p className="font-bold text-xs text-amber-700">Sắp Hết Hạn</p>
                  <p className="text-[11px] text-[#6E6E77]">Hạn dưới 7 ngày (Cần gia hạn)</p>
                </div>
                <span className="text-lg font-mono font-black text-amber-700">{stats.statusCount.expiring}</span>
              </div>

              {/* Đóng băng */}
              <div className="flex justify-between items-center p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <div>
                  <p className="font-bold text-xs text-blue-700">Thẻ Đóng Băng</p>
                  <p className="text-[11px] text-[#6E6E77]">Bảo lưu tạm thời</p>
                </div>
                <span className="text-lg font-mono font-black text-blue-700">{stats.statusCount.frozen}</span>
              </div>

              {/* Đã hết hạn */}
              <div className="flex justify-between items-center p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E4E4E0]">
                <div>
                  <p className="font-bold text-xs text-[#6E6E77]">Đã Hết Hạn</p>
                  <p className="text-[11px] text-[#6E6E77]">Cần Telesales gọi chăm sóc</p>
                </div>
                <span className="text-lg font-mono font-black text-[#18181B]">{stats.statusCount.expired}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
