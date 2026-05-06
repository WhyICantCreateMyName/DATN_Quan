import type { Prisma } from '@prisma/client';

export type StaffShift = Prisma.StaffShiftGetPayload<{ include: { user: true } }>;
export type CommissionRate = Prisma.CommissionRateGetPayload<{ include: { plan: true } }>;
export type StaffKPI = Prisma.StaffKPIGetPayload<{ include: { user: true } }>;
export type CommissionLog = Prisma.CommissionLogGetPayload<{ include: { user: true } }>;

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
