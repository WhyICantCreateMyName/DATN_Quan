'use client';

import { useState } from 'react';
import { Plus, Tag, RefreshCw, Layers } from 'lucide-react';
import { MembershipPlan } from '@/types/membership';
import { useMembershipPlans, useMembership } from '@/hooks/useMembership';
import PlanTableHeader from './PlanTableHeader';
import PlanTableRow from './PlanTableRow';
import ModalCreatePlan from './ModalCreatePlan';
import ModalEditPlan from './ModalEditPlan';
import Pagination from '@/components/Pagination';

export default function PlanTable() {
  const [page, setPage] = useState(1);
  const limit = 8;
  const { data: plansRes, isLoading, mutate } = useMembershipPlans(page, limit);
  const { deletePlan } = useMembership();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

  const plans = plansRes?.data || [];
  const total = plansRes?.total || 0;

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa gói tập này? Dữ liệu lịch sử đăng ký của hội viên vẫn được bảo lưu.')) {
      try {
        await deletePlan(id);
      } catch (e) {
        // Handled by Toast in hook
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center border border-[#EA580C]/20">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#18181B]">
              Danh Mục Gói Tập & Dịch Vụ ({total})
            </h2>
            <p className="text-xs text-[#6E6E77]">
              Cấu hình các phân khúc thẻ tập, thời hạn và số buổi kèm huấn luyện viên (PT)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => mutate()}
            disabled={isLoading}
            className="p-2 text-[#6E6E77] hover:text-[#18181B] hover:bg-[#FFFFFF] rounded-xl border border-[#E4E4E0] transition"
            title="Làm mới danh sách"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition"
          >
            <Plus size={16} />
            Thêm Gói Mới
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#FFFFFF] border border-[#E4E4E0] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <PlanTableHeader />
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#6E6E77]">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#EA580C]/30 border-t-[#EA580C] rounded-full animate-spin"></span>
                      Đang đồng bộ biểu phí gói tập...
                    </div>
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Tag className="mx-auto text-[#6E6E77] mb-2 opacity-50" size={32} />
                    <p className="text-sm font-medium text-[#18181B]">Chưa có gói tập nào</p>
                    <p className="text-xs text-[#6E6E77] mt-0.5">
                      Bấm &quot;Thêm Gói Mới&quot; để thiết lập gói tập đầu tiên cho phòng gym.
                    </p>
                  </td>
                </tr>
              ) : (
                plans.map((p) => (
                  <PlanTableRow
                    key={p.id}
                    plan={p}
                    onEdit={(plan) => setEditingPlan(plan)}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {total > limit && (
          <div className="p-4 border-t border-[#E4E4E0] bg-[#F7F7F5]/30 flex justify-between items-center">
            <div className="text-xs text-[#6E6E77]">
              Hiển thị <span className="font-semibold text-[#18181B]">{plans.length}</span> trên tổng số{' '}
              <span className="font-semibold text-[#18181B]">{total}</span> gói tập
            </div>
            <Pagination
              currentPage={page}
              totalItems={total}
              limit={limit}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <ModalCreatePlan
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <ModalEditPlan
        isOpen={!!editingPlan}
        plan={editingPlan}
        onClose={() => setEditingPlan(null)}
      />
    </div>
  );
}
