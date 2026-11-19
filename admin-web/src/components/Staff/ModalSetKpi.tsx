'use client';

import React, { useState } from 'react';
import { X, Target, AlertCircle } from 'lucide-react';
import { HRMType, UserType } from '@/types';

interface ModalSetKpiProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: UserType.User[];
  onSubmit: (data: HRMType.KPICreateInput) => Promise<any>;
}

export default function ModalSetKpi({ isOpen, onClose, staffList, onSubmit }: ModalSetKpiProps) {
  const now = new Date();
  const [userId, setUserId] = useState<number>(staffList[0]?.id || 0);
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [targetAmount, setTargetAmount] = useState<number>(20000000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('Vui lòng chọn nhân viên');
      return;
    }
    if (targetAmount <= 0) {
      setError('Mục tiêu doanh số phải lớn hơn 0');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        userId: Number(userId),
        month: Number(month),
        year: Number(year),
        targetAmount: Number(targetAmount)
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Có lỗi xảy ra khi thiết lập KPI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4E4E0] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E0]">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#EA580C]" />
            <h3 className="font-bold text-[#18181B] text-base">Giao Chỉ Tiêu KPI</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">
              Chọn nhân viên <span className="text-[#EA580C]">*</span>
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] text-xs font-medium text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
              required
            >
              <option value={0}>-- Chọn nhân sự --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.role}) - {s.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                Tháng
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] text-xs font-bold text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                Năm
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] text-xs font-mono font-bold text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">
              Doanh số mục tiêu (VNĐ) <span className="text-[#EA580C]">*</span>
            </label>
            <input
              type="number"
              step="500000"
              min="1000000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] text-xs font-mono font-bold text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E4E4E0] text-xs font-bold text-[#6E6E77] hover:bg-[#F7F7F5] transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#EA580C]/90 shadow-sm shadow-[#EA580C]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Giao Chỉ Tiêu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
