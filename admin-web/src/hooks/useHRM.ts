import { useState, useCallback, useEffect } from 'react';
import { hrmService } from '@/services/hrmService';
import { userService } from '@/services/userService';
import { HRMType, UserType, PaginationResponse } from '@/types';

export const useHRM = () => {
  const [staff, setStaff] = useState<PaginationResponse<UserType.User> | null>(null);
  const [shifts, setShifts] = useState<HRMType.StaffShift[]>([]);
  const [rates, setRates] = useState<HRMType.CommissionRate[]>([]);
  const [kpis, setKpis] = useState<HRMType.StaffKPI[]>([]);
  const [logs, setLogs] = useState<HRMType.CommissionLog[]>([]);
  const [payroll, setPayroll] = useState<HRMType.PayrollItem[]>([]);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const fetchData = useCallback(async (staffPage = 1) => {
    setLoading(true);
    try {
      const [st, s, r, k, lRes, pRes] = await Promise.all([
        userService.getStaff(staffPage),
        hrmService.getShifts(),
        hrmService.getCommissionRates(),
        hrmService.getKPIs(currentMonth, currentYear),
        hrmService.getCommissionLogs(undefined, currentMonth, currentYear),
        hrmService.getPayroll(currentMonth, currentYear)
      ]);
      setStaff(st);
      setShifts(s);
      setRates(r);
      setKpis(k);
      setLogs(lRes?.data || []);
      setPayroll(pRes?.data || []);
    } catch (e) {
      console.error('Error fetching HRM data:', e);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStaff = async (id: number, data: Partial<UserType.User>) => {
    await userService.updateUser(id, data);
    await fetchData(staff?.page || 1);
  };

  const deleteStaff = async (id: number) => {
    if (confirm('Xác nhận xóa nhân viên này khỏi hệ thống?')) {
      await userService.deleteUser(id);
      await fetchData(staff?.page || 1);
    }
  };

  const handleCreateShift = async (data: HRMType.ShiftCreateInput) => {
    const res = await hrmService.createShift(data);
    await fetchData(staff?.page || 1);
    return res;
  };

  const handleDeleteShift = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa ca trực này?')) {
      await hrmService.deleteShift(id);
      await fetchData(staff?.page || 1);
    }
  };

  const handleSaveCommission = async (data: HRMType.CommissionRateInput) => {
    const res = await hrmService.saveCommissionRate(data);
    await fetchData(staff?.page || 1);
    return res;
  };

  const handleDeleteCommission = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa chính sách hoa hồng này?')) {
      await hrmService.deleteCommissionRate(id);
      await fetchData(staff?.page || 1);
    }
  };

  const handleSaveKPI = async (data: HRMType.KPICreateInput) => {
    const res = await hrmService.saveKPI(data);
    await fetchData(staff?.page || 1);
    return res;
  };

  const handleDeleteKPI = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa chỉ tiêu KPI này?')) {
      await hrmService.deleteKPI(id);
      await fetchData(staff?.page || 1);
    }
  };

  return {
    staff,
    shifts,
    rates,
    kpis,
    logs,
    payroll,
    loading,
    refresh: fetchData,
    createShift: handleCreateShift,
    deleteShift: handleDeleteShift,
    saveCommission: handleSaveCommission,
    deleteCommission: handleDeleteCommission,
    saveKPI: handleSaveKPI,
    deleteKPI: handleDeleteKPI,
    updateStaff,
    deleteStaff
  };
};
