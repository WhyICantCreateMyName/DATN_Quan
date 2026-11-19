export interface MembershipPlan {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  durationDays: number;
  ptSessions: number;
  tag?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type Plan = MembershipPlan;

export interface CreatePlanDto {
  name: string;
  price: number;
  durationDays: number;
  ptSessions: number;
  description?: string;
  tag?: string;
}

export type PlanCreateInput = CreatePlanDto;

export interface UpdatePlanDto extends Partial<CreatePlanDto> {
  isActive?: boolean;
}

export interface MemberSubscription {
  id: number;
  memberId: number;
  planId: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'FROZEN';
  grantedPtSessions: number;
  plan?: MembershipPlan;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
