import axiosClient from './axiosClient';
import { HRMType } from '@/types';

export const hrmService = {
  // Shifts
  getShifts: (): Promise<HRMType.StaffShift[]> => axiosClient.get('/hrm/shifts'),
  createShift: (data: HRMType.ShiftCreateInput): Promise<HRMType.StaffShift> => axiosClient.post('/hrm/shifts', data),

  // Commissions
  getCommissionRates: (): Promise<HRMType.CommissionRate[]> => axiosClient.get('/hrm/commissions/rates'),
  saveCommissionRate: (data: any): Promise<HRMType.CommissionRate> => axiosClient.post('/hrm/commissions/rates', data),
  getCommissionLogs: (): Promise<HRMType.CommissionLog[]> => axiosClient.get('/hrm/commissions/logs'),

  // KPIs
  getKPIs: (month?: number, year?: number): Promise<HRMType.StaffKPI[]> => 
    axiosClient.get(`/hrm/kpi?month=${month || ''}&year=${year || ''}`),
  saveKPI: (data: HRMType.KPICreateInput): Promise<HRMType.StaffKPI> => axiosClient.post('/hrm/kpi', data),
};
