'use client';

import React, { useState, useEffect } from 'react';
import { User, UpdateUserDto, Role } from '@/types/user';
import { X, Camera, Save, ShieldCheck, UserCheck, Dumbbell } from 'lucide-react';

interface ModalEditStaffProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (userId: number, data: UpdateUserDto) => Promise<any>;
}

export default function ModalEditStaff({ isOpen, user, onClose, onSubmit }: ModalEditStaffProps) {
  const [form, setForm] = useState<UpdateUserDto>({
    fullName: '',
    phone: '',
    role: 'PT',
    specialization: '',
    avatarUrl: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        role: user.role,
        specialization: user.trainerProfile?.specialization || '',
        avatarUrl: user.avatarUrl || '',
        isActive: user.isActive,
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName?.trim() || !form.phone?.trim()) return;

    try {
      setSubmitting(true);
      await onSubmit(user.id, form);
      onClose();
    } catch (error) {
      // Error handled by Toast in hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18181B]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-2xl border border-[#E4E4E0] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E0] bg-[#F7F7F5]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#18181B]">
              Cập Nhật Hồ Sơ Nhân Sự
            </h3>
            <p className="text-xs text-[#6E6E77] mt-0.5">
              Mã nhân viên: #{user.id.toString().padStart(4, '0')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6E6E77] hover:text-[#18181B] p-1.5 rounded-lg hover:bg-[#FFFFFF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar Preview & URL */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-[#F7F7F5] border border-[#E4E4E0]">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#FFFFFF] border border-[#E4E4E0] flex items-center justify-center shrink-0">
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-6 h-6 text-[#6E6E77]" />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-[#18181B] mb-1">
                Link Ảnh Đại Diện (Avatar URL)
              </label>
              <input
                type="url"
                value={form.avatarUrl || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-1.5 text-xs bg-[#FFFFFF] border border-[#E4E4E0] rounded-lg text-[#18181B] focus:outline-none focus:border-[#EA580C]"
              />
            </div>
          </div>

          {/* Họ tên */}
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1">
              Họ Và Tên
            </label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              className="w-full px-3.5 py-2 text-xs bg-[#FFFFFF] border border-[#E4E4E0] rounded-xl text-[#18181B] focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1">
              Số Điện Thoại
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3.5 py-2 text-xs font-mono bg-[#FFFFFF] border border-[#E4E4E0] rounded-xl text-[#18181B] focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          {/* Vai trò */}
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1">
              Vai Trò Quyền Hạn
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { role: 'PT' as Role, label: 'PT Huấn Luyện', icon: Dumbbell },
                { role: 'RECEPTIONIST' as Role, label: 'Lễ Tân', icon: UserCheck },
                { role: 'ADMIN' as Role, label: 'Quản Trị', icon: ShieldCheck },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: item.role }))}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    form.role === item.role
                      ? 'border-[#EA580C] bg-[#EA580C]/10 text-[#EA580C] font-bold'
                      : 'border-[#E4E4E0] bg-[#FFFFFF] text-[#6E6E77] hover:border-gray-400'
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-[11px] font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chuyên môn nếu là PT */}
          {form.role === 'PT' && (
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1">
                Lĩnh Vực Chuyên Môn
              </label>
              <input
                type="text"
                value={form.specialization || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))}
                placeholder="Ví dụ: Thể hình, Giảm mỡ siết cơ, Yoga..."
                className="w-full px-3.5 py-2 text-xs bg-[#FFFFFF] border border-[#E4E4E0] rounded-xl text-[#18181B] focus:outline-none focus:border-[#EA580C]"
              />
            </div>
          )}

          {/* Trạng thái hoạt động */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F7F5] border border-[#E4E4E0]">
            <div>
              <div className="text-xs font-bold text-[#18181B]">Trạng Thái Hoạt Động</div>
              <div className="text-[11px] text-[#6E6E77]">Cho phép tài khoản đăng nhập vào hệ thống</div>
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.isActive ? 'bg-[#15803D]' : 'bg-[#E4E4E0]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E4E4E0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#6E6E77] hover:text-[#18181B] rounded-xl hover:bg-[#F7F7F5] transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#EA580C] hover:bg-[#EA580C]/90 rounded-xl transition-colors shadow-sm shadow-[#EA580C]/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
