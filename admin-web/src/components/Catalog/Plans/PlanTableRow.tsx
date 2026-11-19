'use client';

import { Edit2, Trash2, Dumbbell, Clock, Sparkles } from 'lucide-react';
import { MembershipPlan } from '@/types/membership';
import { formatVND } from '@/libs/utils';

interface PlanTableRowProps {
  plan: MembershipPlan;
  onEdit: (plan: MembershipPlan) => void;
  onDelete: (id: number) => void;
}

export default function PlanTableRow({ plan, onEdit, onDelete }: PlanTableRowProps) {
  const getTagBadge = (tag?: string | null) => {
    switch (tag) {
      case 'DIAMOND':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Sparkles size={12} /> DIAMOND
          </span>
        );
      case 'GOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            ★ GOLD
          </span>
        );
      case 'PT_ADDON':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            + PT ADD-ON
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
            {tag || 'TIÊU CHUẨN'}
          </span>
        );
    }
  };

  return (
    <tr className="border-b border-[#E4E4E0] hover:bg-[#F7F7F5]/60 transition-colors">
      <td className="py-3.5 px-4">
        <div>
          <div className="font-semibold text-sm text-[#18181B] flex items-center gap-2">
            {plan.name}
          </div>
          {plan.description && (
            <div className="text-xs text-[#6E6E77] line-clamp-1 max-w-xs mt-0.5">
              {plan.description}
            </div>
          )}
        </div>
      </td>

      <td className="py-3.5 px-4">{getTagBadge(plan.tag)}</td>

      <td className="py-3.5 px-4 font-mono font-medium text-sm text-[#18181B]">
        {formatVND(plan.price)}
      </td>

      <td className="py-3.5 px-4 font-mono text-sm text-[#6E6E77]">
        <span className="inline-flex items-center gap-1.5">
          <Clock size={14} className="text-[#6E6E77]" />
          {plan.durationDays} ngày
        </span>
      </td>

      <td className="py-3.5 px-4">
        <span className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-[#18181B]">
          <Dumbbell size={14} className={plan.ptSessions > 0 ? 'text-[#EA580C]' : 'text-zinc-400'} />
          {plan.ptSessions} buổi
        </span>
      </td>

      <td className="py-3.5 px-4">
        {plan.isActive !== false ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
            Đang mở bán
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Đã ngưng
          </span>
        )}
      </td>

      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEdit(plan)}
            title="Chỉnh sửa gói"
            className="p-1.5 rounded-lg text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5] border border-transparent hover:border-[#E4E4E0] transition"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(plan.id)}
            title="Xóa gói"
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
