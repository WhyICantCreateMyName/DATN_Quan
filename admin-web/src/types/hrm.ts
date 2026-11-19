export interface StaffUserSummary {
  id: number;
  fullName: string;
  role: string;
  phone: string;
  avatarUrl?: string | null;
  baseSalary?: number;
}

export interface StaffShift {
  id: number;
  userId: number;
  startTime: string;
  endTime: string;
  note?: string | null;
  createdAt?: string;
  user: StaffUserSummary;
}

export interface CommissionRate {
  id: number;
  name: string;
  type: 'PERCENTAGE' | 'FIXED' | string;
  value: number;
  applyTo: 'SALE' | 'SESSION' | string;
  planId?: number | null;
  plan?: {
    id: number;
    name: string;
    price: number;
  } | null;
}

export interface StaffKPI {
  id: number;
  userId: number;
  month: number;
  year: number;
  targetAmount: number;
  achievedAmount: number;
  achievementPercent?: number;
  performanceRating?: string;
  createdAt?: string;
  updatedAt?: string;
  user: StaffUserSummary;
}

export interface CommissionLog {
  id: number;
  userId: number;
  amount: number;
  reason: string;
  invoiceItemId?: number | null;
  bookingId?: number | null;
  createdAt: string;
  user: StaffUserSummary;
}

export interface PayrollItem {
  user: StaffUserSummary;
  month: number;
  year: number;
  baseSalary: number;
  totalCommission: number;
  shiftCount: number;
  targetKpi: number;
  achievedKpi: number;
  kpiPercent: number;
  performanceRating: string;
  netSalary: number;
}

export interface ShiftCreateInput {
  userId: number;
  startTime: string | Date;
  endTime: string | Date;
  note?: string;
}

export interface KPICreateInput {
  userId: number;
  month: number;
  year: number;
  targetAmount: number;
}

export interface CommissionRateInput {
  id?: number;
  name: string;
  type: string;
  value: number;
  applyTo: string;
  planId?: number | null;
}
