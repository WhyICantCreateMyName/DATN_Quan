'use client';

import React, { useState } from 'react';
import { Users, Clock, DollarSign, Target } from 'lucide-react';
import { useHRM } from '@/hooks/useHRM';
import StaffTable from './StaffTable';
import ShiftManagement from './ShiftManagement';
import PayrollManagement from './PayrollManagement';
import KpiManagement from './KpiManagement';

export default function Staff() {
  const {
    staff,
    shifts,
    rates,
    kpis,
    payroll,
    loading,
    createShift,
    deleteShift,
    saveCommission,
    deleteCommission,
    saveKPI,
    deleteKPI
  } = useHRM();

  const [activeTab, setActiveTab] = useState<'staff' | 'shifts' | 'payroll' | 'kpi'>('staff');

  const staffList = staff?.data || [];

  return (
    <div className="space-y-6">
      {/* Tab Switcher - Warm Editorial / Clean Slate Style */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#FFFFFF] border border-[#E4E4E0] w-fit shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'staff'
              ? 'bg-[#EA580C] text-white shadow-sm shadow-[#EA580C]/20'
              : 'text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5]'
          }`}
        >
          <Users className="w-4 h-4" />
          Đội Ngũ Nhân Viên
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'shifts'
              ? 'bg-[#EA580C] text-white shadow-sm shadow-[#EA580C]/20'
              : 'text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5]'
          }`}
        >
          <Clock className="w-4 h-4" />
          Lịch Trực Ca
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'payroll'
              ? 'bg-[#EA580C] text-white shadow-sm shadow-[#EA580C]/20'
              : 'text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5]'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Bảng Lương & Hoa Hồng
        </button>

        <button
          onClick={() => setActiveTab('kpi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'kpi'
              ? 'bg-[#EA580C] text-white shadow-sm shadow-[#EA580C]/20'
              : 'text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5]'
          }`}
        >
          <Target className="w-4 h-4" />
          Chỉ Tiêu KPI
        </button>
      </div>

      {/* Tab 1: Đội ngũ nhân sự */}
      {activeTab === 'staff' && <StaffTable />}

      {/* Tab 2: Phân ca làm việc */}
      {activeTab === 'shifts' && (
        <ShiftManagement
          shifts={shifts}
          staffList={staffList}
          onCreateShift={createShift}
          onDeleteShift={deleteShift}
        />
      )}

      {/* Tab 3: Bảng lương & Hoa hồng */}
      {activeTab === 'payroll' && (
        <PayrollManagement
          payroll={payroll}
          rates={rates}
          onSaveRate={saveCommission}
          onDeleteRate={deleteCommission}
        />
      )}

      {/* Tab 4: Chỉ tiêu KPI */}
      {activeTab === 'kpi' && (
        <KpiManagement
          kpis={kpis}
          staffList={staffList}
          onSaveKpi={saveKPI}
          onDeleteKpi={deleteKPI}
        />
      )}
    </div>
  );
}
