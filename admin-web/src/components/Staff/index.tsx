'use client';

import React, { useState } from 'react';
import { Users, Clock, Percent, Target, Plus } from 'lucide-react';
import { useHRM } from '@/hooks/useHRM';
import { formatVND } from '@/libs/utils';
import StaffTable from './StaffTable';

export default function Staff() {
  const { shifts, rates, kpis, logs } = useHRM();
  const [activeTab, setActiveTab] = useState<'staff' | 'shifts' | 'commission' | 'kpi'>('staff');

  return (
    <div className="space-y-6">
      {/* Tab Switcher - Warm Editorial / Clean Slate Style */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#FFFFFF] border border-[#E4E4E0] w-fit shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'staff'
              ? 'bg-[#EA580C] text-white shadow-sm shadow-[#EA580C]/20'
              : 'text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5]'
          }`}
        >
          <Users className="w-4 h-4" />
          Đội Ngũ Nhân Viên
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'shifts'
              ? 'bg-[#EA580C] text-white shadow-sm shadow-[#EA580C]/20'
              : 'text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5]'
          }`}
        >
          <Clock className="w-4 h-4" />
          Lịch Trực Ca
        </button>

        <button
          onClick={() => setActiveTab('commission')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'commission'
              ? 'bg-[#EA580C] text-white shadow-sm shadow-[#EA580C]/20'
              : 'text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5]'
          }`}
        >
          <Percent className="w-4 h-4" />
          Chính Sách Hoa Hồng
        </button>

        <button
          onClick={() => setActiveTab('kpi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'kpi'
              ? 'bg-[#EA580C] text-white shadow-sm shadow-[#EA580C]/20'
              : 'text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5]'
          }`}
        >
          <Target className="w-4 h-4" />
          Chỉ Tiêu KPI
        </button>
      </div>

      {/* Tab 1: Nhân sự (Sprint 1 core) */}
      {activeTab === 'staff' && <StaffTable />}

      {/* Tab 2: Lịch trực ca */}
      {activeTab === 'shifts' && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4E4E0] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#EA580C]" /> Phân Ca Làm Việc Nhân Sự
              </h3>
              <p className="text-xs text-[#6E6E77] mt-1">Lịch trực ca hàng tuần của Huấn luyện viên và Lễ tân</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#EA580C]/90 shadow-sm shadow-[#EA580C]/20 transition-all cursor-pointer">
              <Plus className="w-4 h-4" /> Xếp Ca Mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#E4E4E0] flex items-center justify-center font-bold text-[#EA580C] text-xs">
                    {s.user.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">{s.user.fullName}</p>
                    <p className="text-[10px] font-mono text-[#6E6E77] uppercase">{s.user.role}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6E6E77]">Bắt đầu:</span>
                    <span className="font-mono font-medium text-[#18181B]">{new Date(s.startTime).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E6E77]">Kết thúc:</span>
                    <span className="font-mono font-medium text-[#18181B]">{new Date(s.endTime).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
                {s.note && (
                  <p className="mt-3 text-[11px] text-[#6E6E77] bg-[#FFFFFF] p-2 rounded-lg border border-[#E4E4E0] italic">
                    "{s.note}"
                  </p>
                )}
              </div>
            ))}
            {shifts.length === 0 && (
              <p className="text-[#6E6E77] col-span-full py-12 text-center text-xs">Chưa có lịch trực nào được sắp trong tuần này.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Cấu hình hoa hồng */}
      {activeTab === 'commission' && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4E4E0] p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2 mb-4">
            <Percent className="w-5 h-5 text-[#EA580C]" /> Cấu Hình Tỷ Lệ Hoa Hồng PT
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rates.map((r) => (
              <div key={r.id} className="p-5 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] flex justify-between items-center">
                <div>
                  <p className="text-[11px] font-bold text-[#6E6E77] uppercase tracking-wider mb-1">{r.name}</p>
                  <p className="text-xl font-mono font-black text-[#18181B]">
                    {r.value}{r.type === 'PERCENTAGE' ? '%' : ' đ'}
                  </p>
                  <p className="text-[10px] text-[#6E6E77] mt-1">
                    Áp dụng: {r.applyTo === 'SALE' ? 'Doanh số bán' : 'Số buổi dạy'}
                  </p>
                </div>
              </div>
            ))}
            {rates.length === 0 && (
              <p className="text-[#6E6E77] col-span-full py-12 text-center text-xs">Chưa có cấu hình hoa hồng nào.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Chỉ tiêu KPI */}
      {activeTab === 'kpi' && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4E4E0] p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#EA580C]" /> Thiết Lập Chỉ Tiêu KPI
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((k) => (
              <div key={k.id} className="p-4 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5]">
                <p className="text-xs font-bold text-[#18181B]">{k.user.fullName}</p>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6E6E77]">Kỳ đánh giá:</span>
                    <span className="font-mono font-bold text-[#18181B]">Tháng {k.month}/{k.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E6E77]">Mục tiêu doanh số:</span>
                    <span className="font-mono font-bold text-[#15803D]">{formatVND(k.targetAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E6E77]">Thực tế đạt được:</span>
                    <span className="font-mono font-bold text-[#18181B]">{formatVND(k.achievedAmount)}</span>
                  </div>
                </div>
              </div>
            ))}
            {kpis.length === 0 && (
              <p className="text-[#6E6E77] col-span-full py-12 text-center text-xs">Chưa thiết lập chỉ tiêu KPI cho nhân sự nào.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
