'use client';

import React, { useState } from 'react';
import { X, Percent, AlertCircle } from 'lucide-react';
import { HRMType } from '@/types';

interface ModalCommissionRateProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HRMType.CommissionRateInput) => Promise<any>;
}

export default function ModalCommissionRate({ isOpen, onClose, onSubmit }: ModalCommissionRateProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('PERCENTAGE');
  const [value, setValue] = useState<number>(10);
  const [applyTo, setApplyTo] = useState('SALE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên chính sách');
      return;
    }
    if (value <= 0) {
      setError('Mức hoa hồng phải lớn hơn 0');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        name: name.trim(),
        type,
        value: Number(value),
        applyTo
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Có lỗi xảy ra khi lưu tỷ lệ hoa hồng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4E4E0] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E0]">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-[#EA580C]" />
            <h3 className="font-bold text-[#18181B] text-base">Thêm Chính Sách Hoa Hồng</h3>
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
              Tên chính sách <span className="text-[#EA580C]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Hoa hồng dạy PT kèm, Hoa hồng bán gói tập..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] text-xs font-medium text-[#18181B] placeholder-[#6E6E77] focus:outline-hidden focus:border-[#EA580C]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                Áp dụng cho
              </label>
              <select
                value={applyTo}
                onChange={(e) => {
                  setApplyTo(e.target.value);
                  if (e.target.value === 'SESSION') {
                    setType('FIXED');
                    setValue(50000);
                  } else {
                    setType('PERCENTAGE');
                    setValue(10);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] text-xs font-bold text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
              >
                <option value="SALE">Doanh số bán (SALE)</option>
                <option value="SESSION">Buổi dạy PT (SESSION)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                Hình thức tính
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] text-xs font-bold text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">
              Mức hoa hồng ({type === 'PERCENTAGE' ? '%' : 'VNĐ'}) <span className="text-[#EA580C]">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
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
              {loading ? 'Đang lưu...' : 'Lưu Chính Sách'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
