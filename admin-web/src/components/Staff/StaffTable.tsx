'use client';

import React, { useState } from 'react';
import { useUsers, useUser } from '@/hooks/useUser';
import { User, CreateUserDto, UpdateUserDto } from '@/types/user';
import StaffTableHeader from './StaffTableHeader';
import StaffTableRow from './StaffTableRow';
import ModalCreateStaff from './ModalCreateStaff';
import ModalEditStaff from './ModalEditStaff';
import Pagination from '@/components/Pagination';
import { Users, Plus, Search, ShieldCheck, UserCheck, Dumbbell, Filter } from 'lucide-react';

export default function StaffTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'PT' | 'RECEPTIONIST' | 'ADMIN'>('ALL');
  const [search, setSearch] = useState('');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // SWR Hook
  const { data: usersResponse, isLoading } = useUsers({
    page,
    limit,
    role: roleFilter === 'ALL' ? 'STAFF' : roleFilter,
    keyword: search,
  });

  // Mutation Hook
  const { createUser, updateUser, deleteUser } = useUser();

  const handleCreate = async (data: CreateUserDto) => {
    await createUser(data);
  };

  const handleUpdate = async (userId: number, data: UpdateUserDto) => {
    await updateUser({ userId, data });
  };

  const handleDelete = async (user: User) => {
    if (confirm(`Bạn có chắc chắn muốn xóa nhân sự "${user.fullName}" (SĐT: ${user.phone})?`)) {
      await deleteUser({ userId: user.id, name: user.fullName });
    }
  };

  const users = usersResponse?.data || [];
  const total = usersResponse?.total || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#18181B] uppercase font-['Plus_Jakarta_Sans',sans-serif]">
            Đội Ngũ <span className="text-[#EA580C]">Nhân Sự</span>
          </h1>
          <p className="text-xs text-[#6E6E77] mt-1">
            Quản trị danh bạ, tài khoản phân quyền và thông tin huấn luyện viên / lễ tân Titan Gym
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#EA580C]/90 shadow-sm shadow-[#EA580C]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          THÊM NHÂN VIÊN MỚI
        </button>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4E4E0] shadow-xs overflow-hidden">
        {/* Controls: Search & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 border-b border-[#E4E4E0] bg-[#FFFFFF]">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F7F7F5] border border-[#E4E4E0] overflow-x-auto">
            {[
              { id: 'ALL' as const, label: 'Tất Cả', icon: Users },
              { id: 'PT' as const, label: 'PT Huấn Luyện', icon: Dumbbell },
              { id: 'RECEPTIONIST' as const, label: 'Lễ Tân', icon: UserCheck },
              { id: 'ADMIN' as const, label: 'Quản Trị', icon: ShieldCheck },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setRoleFilter(tab.id);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  roleFilter === tab.id
                    ? 'bg-[#FFFFFF] text-[#EA580C] shadow-xs border border-[#E4E4E0]'
                    : 'text-[#6E6E77] hover:text-[#18181B]'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E77]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên hoặc số điện thoại..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F7F7F5] border border-[#E4E4E0] rounded-xl text-[#18181B] placeholder-[#6E6E77] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#EA580C] transition-colors"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <StaffTableHeader />
            <tbody className="divide-y divide-[#E4E4E0]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-[#6E6E77]">
                    <div className="inline-block w-5 h-5 border-2 border-[#EA580C] border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Đang tải dữ liệu nhân sự...</div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <StaffTableRow
                    key={user.id}
                    user={user}
                    onEdit={(u) => setEditingUser(u)}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-[#6E6E77]">
                    Không tìm thấy nhân viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalItems={total}
          limit={limit}
          onPageChange={setPage}
        />
      </div>

      {/* Modals */}
      <ModalCreateStaff
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <ModalEditStaff
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
