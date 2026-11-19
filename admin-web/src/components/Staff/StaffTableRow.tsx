'use client';

import React from 'react';
import { User } from '@/types/user';
import { Edit2, Trash2, ShieldCheck, UserCheck, Dumbbell } from 'lucide-react';

interface StaffTableRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function StaffTableRow({ user, onEdit, onDelete }: StaffTableRowProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20">
            <ShieldCheck className="w-3 h-3" /> Quản trị
          </span>
        );
      case 'RECEPTIONIST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20">
            <UserCheck className="w-3 h-3" /> Lễ tân
          </span>
        );
      case 'PT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Dumbbell className="w-3 h-3" /> PT Huấn luyện
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-[#6E6E77]">
            {role}
          </span>
        );
    }
  };

  return (
    <tr className="border-b border-[#E4E4E0] hover:bg-[#F7F7F5]/70 transition-colors">
      {/* Cột Tên & Avatar */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#F7F7F5] border border-[#E4E4E0] flex items-center justify-center shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-[#18181B]">
                {user.fullName?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-[#18181B] leading-snug">
              {user.fullName}
            </div>
            <div className="text-[11px] font-mono text-[#6E6E77] mt-0.5">
              ID: #{user.id.toString().padStart(4, '0')}
            </div>
          </div>
        </div>
      </td>

      {/* Cột Số điện thoại */}
      <td className="px-6 py-4">
        <span className="text-xs font-mono font-medium text-[#18181B]">
          {user.phone}
        </span>
      </td>

      {/* Cột Vai trò */}
      <td className="px-6 py-4">
        {getRoleBadge(user.role)}
      </td>

      {/* Cột Chuyên môn */}
      <td className="px-6 py-4">
        <span className="text-xs text-[#6E6E77]">
          {user.trainerProfile?.specialization || '—'}
        </span>
      </td>

      {/* Cột Trạng thái */}
      <td className="px-6 py-4">
        {user.isActive ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
            Hoạt động
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E6E77]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6E6E77]" />
            Tạm dừng
          </span>
        )}
      </td>

      {/* Cột Thao tác */}
      <td className="px-6 py-4 text-right">
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => onEdit(user)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#6E6E77] hover:text-[#18181B] hover:bg-[#FFFFFF] border border-transparent hover:border-[#E4E4E0] transition-colors"
            title="Chỉnh sửa"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#6E6E77] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
            title="Xóa nhân sự"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
