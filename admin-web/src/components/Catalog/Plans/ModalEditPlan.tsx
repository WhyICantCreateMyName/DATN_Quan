'use client';

import { useState, useEffect } from 'react';
import { X, Tag, DollarSign, Calendar, Dumbbell, AlignLeft, CheckCircle } from 'lucide-react';
import { MembershipPlan, UpdatePlanDto } from '@/types/membership';
import { useMembership } from '@/hooks/useMembership';

interface ModalEditPlanProps {
  isOpen: boolean;
  onClose: () => void;
  plan: MembershipPlan | null;
}

export default function ModalEditPlan({ isOpen, onClose, plan }: ModalEditPlanProps) {
  const { updatePlan, isUpdatingPlan } = useMembership();

  const [form, setForm] = useState<UpdatePlanDto>({
    name: '',
    price: 0,
    durationDays: 30,
    ptSessions: 0,
    description: '',
    tag: 'SILVER',
    isActive: true,
  });

  useEffect(() => {
    if (plan) {
      setForm({
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
        ptSessions: plan.ptSessions,
        description: plan.description || '',
        tag: plan.tag || 'SILVER',
        isActive: plan.isActive ?? true,
      });
    }
  }, [plan]);

  if (!isOpen || !plan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;

    try {
      await updatePlan({
        planId: plan.id,
        data: {
          ...form,
          price: Number(form.price),
          durationDays: Number(form.durationDays),
          ptSessions: Number(form.ptSessions),
        },
      });
      onClose();
    } catch (err) {
      // Toast handled by useMembership
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="p-6 border-b border-[#E4E4E0] flex justify-between items-center bg-[#F7F7F5]/50">
          <div>
            <h3 className="text-xl font-bold text-[#18181B] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]"></span>
              Chỉnh Sửa Gói Tập #{plan.id}
            </h3>
            <p className="text-sm text-[#6E6E77] mt-0.5">
              Cập nhật biểu phí và quyền lợi của gói {plan.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6E6E77] hover:text-[#18181B] p-2 hover:bg-[#F7F7F5] rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6E6E77] block mb-1.5">
              Tên Gói Tập *
            </label>
            <div className="relative">
              <Dumbbell className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E77]" size={16} />
              <input
                required
                type="text"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#18181B] focus:border-[#EA580C] focus:bg-[#FFFFFF] outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6E6E77] block mb-1.5">
                Phân Khúc (Tag) *
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E77]" size={16} />
                <select
                  value={form.tag || 'SILVER'}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#18181B] focus:border-[#EA580C] focus:bg-[#FFFFFF] outline-none transition"
                >
                  <option value="DIAMOND">DIAMOND (Cao Cấp)</option>
                  <option value="GOLD">GOLD (Tiêu Chuẩn)</option>
                  <option value="SILVER">SILVER (Cơ Bản)</option>
                  <option value="PT_ADDON">PT_ADDON (Gói Kèm PT)</option>
                  <option value="TRIAL">TRIAL (Trải Nghiệm)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6E6E77] block mb-1.5">
                Giá Niêm Yết (VNĐ) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E77]" size={16} />
                <input
                  required
                  type="number"
                  min="0"
                  step="50000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#18181B] font-mono focus:border-[#EA580C] focus:bg-[#FFFFFF] outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6E6E77] block mb-1.5">
                Thời Hạn (Ngày) *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E77]" size={16} />
                <input
                  required
                  type="number"
                  min="1"
                  value={form.durationDays}
                  onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#18181B] font-mono focus:border-[#EA580C] focus:bg-[#FFFFFF] outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6E6E77] block mb-1.5">
                Số Buổi Tập PT *
              </label>
              <div className="relative">
                <Dumbbell className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E77]" size={16} />
                <input
                  required
                  type="number"
                  min="0"
                  value={form.ptSessions}
                  onChange={(e) => setForm({ ...form, ptSessions: Number(e.target.value) })}
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#18181B] font-mono focus:border-[#EA580C] focus:bg-[#FFFFFF] outline-none transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6E6E77] block mb-1.5">
              Mô Tả & Quyền Lợi
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-3.5 top-3 text-[#6E6E77]" size={16} />
              <textarea
                rows={3}
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#18181B] focus:border-[#EA580C] focus:bg-[#FFFFFF] outline-none transition resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#18181B]">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-[#E4E4E0] text-[#EA580C] focus:ring-[#EA580C]"
              />
              Đang mở bán (Hiển thị cho hội viên đăng ký)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E4E4E0]">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdatingPlan}
              className="px-5 py-2.5 text-sm font-medium text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5] rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUpdatingPlan}
              className="px-6 py-2.5 text-sm font-semibold bg-[#15803D] hover:bg-[#166534] text-white rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isUpdatingPlan ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Đang Cập Nhật...
                </>
              ) : (
                'Lưu Thay Đổi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
