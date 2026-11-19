'use client';

import React, { useState } from 'react';
import { Target, Plus, Trash2, Award, TrendingUp, CheckCircle2 } from 'lucide-react';
import { HRMType, UserType } from '@/types';
import { formatVND } from '@/libs/utils';
import ModalSetKpi from './ModalSetKpi';

interface KpiManagementProps {
  kpis: HRMType.StaffKPI[];
  staffList: UserType.User[];
  onSaveKpi: (data: HRMType.KPICreateInput) => Promise<any>;
  onDeleteKpi: (id: number) => Promise<any>;
}

export default function KpiManagement({
  kpis,
  staffList,
  onSaveKpi,
  onDeleteKpi
}: KpiManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalTarget = kpis.reduce((sum, k) => sum + k.targetAmount, 0);
  const totalAchieved = kpis.reduce((sum, k) => sum + k.achievedAmount, 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 3 Overview KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-[#E4E4E0] bg-[#FFFFFF] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#6E6E77] uppercase tracking-wider">
              Tổng Mục Tiêu Phòng Gym
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EA580C]">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black text-[#18181B]">
            {formatVND(totalTarget)}
          </p>
          <p className="text-[11px] text-[#6E6E77] mt-1">
            Tổng doanh số kỳ vọng tháng này
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[#E4E4E0] bg-[#FFFFFF] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#6E6E77] uppercase tracking-wider">
              Doanh Số Thực Tế Đã Đạt
            </span>
            <div className="w-8 h-8 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-[#15803D]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black text-[#15803D]">
            {formatVND(totalAchieved)}
          </p>
          <p className="text-[11px] text-[#6E6E77] mt-1">
            Tự động tích lũy từ Hóa đơn POS & Gói tập
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[#E4E4E0] bg-[#FFFFFF] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#6E6E77] uppercase tracking-wider">
              Tiến Độ Hoàn Thành Chung
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black text-[#18181B]">
            {overallPercent}%
          </p>
          <div className="w-full bg-[#E4E4E0] rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-[#EA580C] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(overallPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main KPI Section */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4E4E0] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#EA580C]" /> Chỉ Tiêu Doanh Số Nhân Viên
            </h3>
            <p className="text-xs text-[#6E6E77] mt-1">
              Theo dõi hiệu suất làm việc và tỷ lệ đạt chỉ tiêu doanh số của từng nhân sự
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#EA580C]/90 shadow-sm shadow-[#EA580C]/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Giao Chỉ Tiêu KPI
          </button>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((k) => {
            const pct = k.achievementPercent || 0;
            let ratingColor = 'bg-gray-100 text-gray-700 border-gray-200';
            let barColor = 'bg-[#EA580C]';
            if (k.performanceRating === 'EXCELLENT') {
              ratingColor = 'bg-green-50 text-green-700 border-green-200';
              barColor = 'bg-[#15803D]';
            } else if (k.performanceRating === 'GOOD') {
              ratingColor = 'bg-amber-50 text-amber-700 border-amber-200';
              barColor = 'bg-amber-500';
            } else if (k.performanceRating === 'AVERAGE') {
              ratingColor = 'bg-blue-50 text-blue-700 border-blue-200';
              barColor = 'bg-blue-500';
            } else if (k.performanceRating === 'POOR') {
              ratingColor = 'bg-red-50 text-red-700 border-red-200';
              barColor = 'bg-red-500';
            }

            return (
              <div
                key={k.id}
                className="p-5 rounded-2xl border border-[#E4E4E0] bg-[#F7F7F5] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#E4E4E0] flex items-center justify-center font-bold text-xs text-[#EA580C] shrink-0">
                        {k.user?.fullName ? k.user.fullName.charAt(0) : 'U'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#18181B] line-clamp-1">
                          {k.user?.fullName}
                        </h4>
                        <span className="text-[10px] font-mono text-[#6E6E77] uppercase">
                          {k.user?.role} • Tháng {k.month}/{k.year}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteKpi(k.id)}
                      title="Xóa chỉ tiêu"
                      className="p-1 rounded-lg text-[#6E6E77] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Numbers */}
                  <div className="space-y-1.5 my-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6E6E77]">Mục tiêu:</span>
                      <span className="font-mono font-bold text-[#18181B]">
                        {formatVND(k.targetAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6E6E77]">Thực tế đạt:</span>
                      <span className="font-mono font-bold text-[#15803D]">
                        {formatVND(k.achievedAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-[#6E6E77]">Tiến độ</span>
                      <span className="font-mono font-bold text-[#18181B]">{pct}%</span>
                    </div>
                    <div className="w-full bg-[#FFFFFF] rounded-full h-2 border border-[#E4E4E0] overflow-hidden">
                      <div
                        className={`${barColor} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E4E4E0] flex items-center justify-between">
                  <span className="text-[11px] text-[#6E6E77]">Xếp loại hiệu suất:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${ratingColor}`}>
                    {k.performanceRating}
                  </span>
                </div>
              </div>
            );
          })}

          {kpis.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#6E6E77] text-xs">
              Chưa thiết lập chỉ tiêu KPI cho nhân viên nào trong tháng này.
            </div>
          )}
        </div>
      </div>

      {/* Modal Set KPI */}
      <ModalSetKpi
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staffList={staffList}
        onSubmit={onSaveKpi}
      />
    </div>
  );
}
