'use client';

import React, { useState } from 'react';
import { Clock, Plus, Trash2, Calendar, User, Search, Filter } from 'lucide-react';
import { HRMType, UserType } from '@/types';
import ModalCreateShift from './ModalCreateShift';

interface ShiftManagementProps {
  shifts: HRMType.StaffShift[];
  staffList: UserType.User[];
  onCreateShift: (data: HRMType.ShiftCreateInput) => Promise<any>;
  onDeleteShift: (id: number) => Promise<any>;
}

export default function ShiftManagement({
  shifts,
  staffList,
  onCreateShift,
  onDeleteShift
}: ShiftManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [searchName, setSearchName] = useState<string>('');

  const filteredShifts = shifts.filter((s) => {
    const matchRole = selectedRole === 'ALL' || s.user?.role === selectedRole;
    const matchName = !searchName || s.user?.fullName.toLowerCase().includes(searchName.toLowerCase());
    return matchRole && matchName;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4E4E0] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#EA580C]" /> Phân Ca & Lịch Trực Nhân Sự
            </h3>
            <p className="text-xs text-[#6E6E77] mt-1">
              Quản lý lịch trực hàng ngày của Huấn luyện viên, Lễ tân và Quản trị viên
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#EA580C]/90 shadow-sm shadow-[#EA580C]/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Xếp Ca Mới
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-6 border-t border-[#E4E4E0]">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#6E6E77] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên nhân viên..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] text-xs font-medium text-[#18181B] placeholder-[#6E6E77] focus:outline-hidden focus:border-[#EA580C]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#6E6E77] shrink-0" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-[#E4E4E0] bg-[#F7F7F5] text-xs font-bold text-[#18181B] focus:outline-hidden focus:border-[#EA580C]"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="PT">Huấn luyện viên (PT)</option>
              <option value="RECEPTIONIST">Lễ tân</option>
              <option value="ADMIN">Quản lý (Admin)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShifts.map((s) => {
          const start = new Date(s.startTime);
          const end = new Date(s.endTime);
          const isToday = new Date().toDateString() === start.toDateString();

          return (
            <div
              key={s.id}
              className={`p-5 rounded-2xl border transition-all ${
                isToday
                  ? 'border-[#EA580C]/40 bg-[#FFFFFF] shadow-sm shadow-[#EA580C]/5 ring-1 ring-[#EA580C]/10'
                  : 'border-[#E4E4E0] bg-[#FFFFFF]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F7F7F5] border border-[#E4E4E0] flex items-center justify-center font-bold text-xs text-[#EA580C] shrink-0">
                    {s.user?.fullName ? s.user.fullName.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#18181B] line-clamp-1">
                      {s.user?.fullName}
                    </h4>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F7F7F5] text-[#6E6E77] border border-[#E4E4E0]">
                      {s.user?.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteShift(s.id)}
                  title="Xóa ca trực"
                  className="p-1.5 rounded-lg text-[#6E6E77] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-[#F7F7F5] border border-[#E4E4E0] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E77] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#EA580C]" /> Ngày:
                  </span>
                  <span className="font-mono font-bold text-[#18181B]">
                    {start.toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E77] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#15803D]" /> Thời gian:
                  </span>
                  <span className="font-mono font-semibold text-[#18181B]">
                    {start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {s.note && (
                <div className="mt-3 p-2.5 rounded-xl bg-orange-50/50 border border-orange-100 text-[11px] text-[#6E6E77]">
                  <span className="font-semibold text-[#EA580C]">Nhiệm vụ:</span> {s.note}
                </div>
              )}
            </div>
          );
        })}

        {filteredShifts.length === 0 && (
          <div className="col-span-full py-16 text-center bg-[#FFFFFF] rounded-2xl border border-[#E4E4E0] p-8">
            <Clock className="w-10 h-10 text-[#6E6E77]/40 mx-auto mb-3" />
            <p className="text-xs font-bold text-[#18181B]">Không có lịch trực nào phù hợp</p>
            <p className="text-xs text-[#6E6E77] mt-1">Bấm "Xếp Ca Mới" để tạo lịch làm việc cho nhân viên.</p>
          </div>
        )}
      </div>

      {/* Modal Xếp Ca */}
      <ModalCreateShift
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staffList={staffList}
        onSubmit={onCreateShift}
      />
    </div>
  );
}
