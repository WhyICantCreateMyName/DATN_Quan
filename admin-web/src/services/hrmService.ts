import axiosClient from './axiosClient';
import { HRMType } from '@/types';

export const hrmService = {
  // Shifts
  getShifts: (userId?: number, startDate?: string, endDate?: string): Promise<HRMType.StaffShift[]> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', String(userId));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return axiosClient.get(`/hrm/shifts${query ? `?${query}` : ''}`);
  },
  createShift: (data: HRMType.ShiftCreateInput): Promise<HRMType.StaffShift> => axiosClient.post('/hrm/shifts', data),
  deleteShift: (id: number): Promise<{ success: boolean }> => axiosClient.delete(`/hrm/shifts/${id}`),

  // Commissions
  getCommissionRates: (): Promise<HRMType.CommissionRate[]> => axiosClient.get('/hrm/commissions/rates'),
  saveCommissionRate: (data: HRMType.CommissionRateInput): Promise<HRMType.CommissionRate> => axiosClient.post('/hrm/commissions/rates', data),
  deleteCommissionRate: (id: number): Promise<{ success: boolean }> => axiosClient.delete(`/hrm/commissions/rates/${id}`),
  getCommissionLogs: (userId?: number, month?: number, year?: number): Promise<{ data: HRMType.CommissionLog[]; totalAmount: number; total: number }> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', String(userId));
    if (month) params.append('month', String(month));
    if (year) params.append('year', String(year));
    const query = params.toString();
    return axiosClient.get(`/hrm/commissions/logs${query ? `?${query}` : ''}`);
  },

  // KPIs
  getKPIs: (month?: number, year?: number, userId?: number): Promise<HRMType.StaffKPI[]> => {
    const params = new URLSearchParams();
    if (month) params.append('month', String(month));
    if (year) params.append('year', String(year));
    if (userId) params.append('userId', String(userId));
    const query = params.toString();
    return axiosClient.get(`/hrm/kpi${query ? `?${query}` : ''}`);
  },
  saveKPI: (data: HRMType.KPICreateInput): Promise<HRMType.StaffKPI> => axiosClient.post('/hrm/kpi', data),
  deleteKPI: (id: number): Promise<{ success: boolean }> => axiosClient.delete(`/hrm/kpi/${id}`),

  // Payroll
  getPayroll: (month?: number, year?: number): Promise<{ month: number; year: number; data: HRMType.PayrollItem[] }> => {
    const params = new URLSearchParams();
    if (month) params.append('month', String(month));
    if (year) params.append('year', String(year));
    const query = params.toString();
    return axiosClient.get(`/hrm/payroll${query ? `?${query}` : ''}`);
  }
};
