'use client';

import React, { useState } from 'react';
import { DollarSign, Percent, Plus, Trash2, Award, TrendingUp, Users, Calendar } from 'lucide-react';
import { HRMType } from '@/types';
import { formatVND } from '@/libs/utils';
import ModalCommissionRate from './ModalCommissionRate';

interface PayrollManagementProps {
  payroll: HRMType.PayrollItem[];
  rates: HRMType.CommissionRate[];
  onSaveRate: (data: HRMType.CommissionRateInput) => Promise<any>;
  onDeleteRate: (id: number) => Promise<any>;
}

export default function PayrollManagement({
  payroll,
  rates,
  onSaveRate,
  onDeleteRate
}: PayrollManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPayroll = payroll.reduce((sum, p) => sum + p.netSalary, 0);
  const totalCommission = payroll.reduce((sum, p) => sum + p.totalCommission, 0);
  const totalBaseSalary = payroll.reduce((sum, p) => sum + p.baseSalary, 0);

  return (
    <div className="space-y-6">
      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-[#E4E4E0] bg-[#FFFFFF] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#6E6E77] uppercase tracking-wider">
              Tổng Quỹ Lương Tháng
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EA580C]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black text-[#18181B]">
            {formatVND(totalPayroll)}
          </p>
          <p className="text-[11px] text-[#6E6E77] mt-1">
            Bao gồm lương cứng & toàn bộ hoa hồng nhân sự
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[#E4E4E0] bg-[#FFFFFF] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#6E6E77] uppercase tracking-wider">
              Tổng Hoa Hồng Đã Chi
            </span>
            <div className="w-8 h-8 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-[#15803D]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black text-[#15803D]">
            {formatVND(totalCommission)}
          </p>
          <p className="text-[11px] text-[#6E6E77] mt-1">
            Thưởng doanh số bán hàng & buổi dạy PT
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[#E4E4E0] bg-[#FFFFFF] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#6E6E77] uppercase tracking-wider">
              Quy Mô Nhân Sự
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F7F7F5] border border-[#E4E4E0] flex items-center justify-center text-[#18181B]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black text-[#18181B]">
            {payroll.length} <span className="text-sm font-normal text-[#6E6E77]">nhân viên</span>
          </p>
          <p className="text-[11px] text-[#6E6E77] mt-1">
            Tổng lương cứng cơ bản: {formatVND(totalBaseSalary)}
          </p>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4E4E0] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E4E0] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#EA580C]" /> Bảng Tính Lương & Thu Nhập Nhân Sự
            </h3>
            <p className="text-xs text-[#6E6E77] mt-1">
              Tự động tổng hợp Lương cứng + Hoa hồng thực tế từ POS và Buổi dạy PT
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E4E4E0] bg-[#F7F7F5] text-[11px] font-bold text-[#6E6E77] uppercase tracking-wider">
                <th className="py-3 px-6">Nhân Viên</th>
                <th className="py-3 px-6">Lương Cứng</th>
                <th className="py-3 px-6">Hoa Hồng Tháng</th>
                <th className="py-3 px-6 text-center">Ca Trực</th>
                <th className="py-3 px-6">Đánh Giá KPI</th>
                <th className="py-3 px-6 text-right">Tổng Thực Nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E0] text-xs">
              {payroll.map((p) => {
                let ratingColor = 'bg-gray-100 text-gray-700 border-gray-200';
                if (p.performanceRating === 'EXCELLENT') ratingColor = 'bg-green-50 text-green-700 border-green-200';
                else if (p.performanceRating === 'GOOD') ratingColor = 'bg-amber-50 text-amber-700 border-amber-200';
                else if (p.performanceRating === 'AVERAGE') ratingColor = 'bg-blue-50 text-blue-700 border-blue-200';
                else if (p.performanceRating === 'POOR') ratingColor = 'bg-red-50 text-red-700 border-red-200';

                return (
                  <tr key={p.user.id} className="hover:bg-[#F7F7F5]/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F7F7F5] border border-[#E4E4E0] flex items-center justify-center font-bold text-xs text-[#EA580C] shrink-0">
                          {p.user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#18181B]">{p.user.fullName}</p>
                          <p className="text-[10px] font-mono text-[#6E6E77]">{p.user.role} • {p.user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-medium text-[#18181B]">
                      {formatVND(p.baseSalary)}
                    </td>
                    <td className="py-3.5 px-6 font-mono font-semibold text-[#15803D]">
                      +{formatVND(p.totalCommission)}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full font-mono font-bold bg-[#F7F7F5] border border-[#E4E4E0] text-[#18181B] text-[11px]">
                        {p.shiftCount} ca
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ratingColor}`}>
                          {p.performanceRating}
                        </span>
                        {p.targetKpi > 0 && (
                          <span className="font-mono text-[11px] text-[#6E6E77]">
                            ({p.kpiPercent}%)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-black text-sm text-[#18181B]">
                      {formatVND(p.netSalary)}
                    </td>
                  </tr>
                );
              })}

              {payroll.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6E6E77]">
                    Chưa có dữ liệu bảng lương tháng này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Policies */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4E4E0] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2">
              <Percent className="w-5 h-5 text-[#EA580C]" /> Chính Sách Tỷ Lệ Hoa Hồng
            </h3>
            <p className="text-xs text-[#6E6E77] mt-0.5">
              Quy định tỷ lệ phần trăm bán hàng và định mức trả công theo buổi tập
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#EA580C]/90 shadow-sm shadow-[#EA580C]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Chính Sách
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rates.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl border border-[#E4E4E0] bg-[#F7F7F5] flex justify-between items-start"
            >
              <div>
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FFFFFF] border border-[#E4E4E0] text-[#EA580C] mb-2">
                  {r.applyTo === 'SALE' ? 'Bán Hàng' : 'Dạy Buổi PT'}
                </span>
                <p className="text-xs font-bold text-[#18181B]">{r.name}</p>
                <p className="text-2xl font-mono font-black text-[#18181B] mt-2">
                  {r.type === 'PERCENTAGE' ? `${r.value}%` : formatVND(r.value)}
                </p>
                <p className="text-[10px] text-[#6E6E77] mt-1">
                  Hình thức: {r.type === 'PERCENTAGE' ? 'Trích % doanh số' : 'Thưởng cố định / buổi'}
                </p>
              </div>

              <button
                onClick={() => onDeleteRate(r.id)}
                title="Xóa chính sách"
                className="p-1.5 rounded-lg text-[#6E6E77] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {rates.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-[#6E6E77]">
              Chưa có chính sách hoa hồng nào được thiết lập.
            </div>
          )}
        </div>
      </div>

      {/* Modal Thêm Chính Sách */}
      <ModalCommissionRate
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onSaveRate}
      />
    </div>
  );
}
