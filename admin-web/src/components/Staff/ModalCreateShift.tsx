'use client';

import React, { useState } from 'react';
import { X, Clock, Calendar, AlertCircle } from 'lucide-react';
import { HRMType, UserType } from '@/types';

interface ModalCreateShiftProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: UserType.User[];
  onSubmit: (data: HRMType.ShiftCreateInput) => Promise<any>;
}

export default function ModalCreateShift({ isOpen, onClose, staffList, onSubmit }: ModalCreateShiftProps) {
  const [userId, setUserId] = useState<number>(staffList[0]?.id || 0);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('Vui lòng chọn nhân viên');
      return;
    }
    if (!startTime || !endTime) {
      setError('Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setError('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        userId: Number(userId),
        startTime,
        endTime,
        note: note.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Có lỗi xảy ra khi tạo ca trực');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4E4E0] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E0]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#EA580C]" />
            <h3 className="font-bold text-[#18181B] text-base">Xếp Ca Trực Mới</h3>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                Bắt đầu <span className="text-[#EA580C]">*</span>
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] text-xs font-mono text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                Kết thúc <span className="text-[#EA580C]">*</span>
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] text-xs font-mono text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">
              Ghi chú nhiệm vụ
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Trực sàn tầng 2, Hướng dẫn khách tập máy mới..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] text-xs text-[#18181B] placeholder-[#6E6E77] focus:outline-hidden focus:border-[#EA580C]"
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
              {loading ? 'Đang lưu...' : 'Tạo Ca Trực'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
