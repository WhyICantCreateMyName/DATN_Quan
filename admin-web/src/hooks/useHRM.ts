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
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (staffPage = 1) => {
    setLoading(true);
    try {
      const [st, s, r, k, l] = await Promise.all([
        userService.getStaff(staffPage),
        hrmService.getShifts(),
        hrmService.getCommissionRates(),
        hrmService.getKPIs(new Date().getMonth() + 1, new Date().getFullYear()),
        hrmService.getCommissionLogs()
      ]);
      setStaff(st);
      setShifts(s);
      setRates(r);
      setKpis(k);
      setLogs(l);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return {
    staff,
    shifts,
    rates,
    kpis,
    logs,
    loading,
    refresh: fetchData,
    createShift: hrmService.createShift,
    saveCommission: hrmService.saveCommissionRate,
    saveKPI: hrmService.saveKPI,
    updateStaff,
    deleteStaff
  };
};
