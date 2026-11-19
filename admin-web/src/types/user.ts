export type Role = 'ADMIN' | 'RECEPTIONIST' | 'PT' | 'MEMBER';

export interface TrainerProfile {
  id: number;
  userId: number;
  specialization?: string | null;
  bio?: string | null;
}

export interface MemberSubscription {
  id: number;
  memberId: number;
  planId: number;
  startDate: string;
  endDate: string;
  remainingPtSessions: number;
  status: string;
  plan?: {
    id: number;
    name: string;
    price: number;
    durationDays: number;
    ptSessions: number;
    tag?: string | null;
  };
}

export interface MemberProfile {
  id: number;
  userId: number;
  fingerprintId?: string | null;
  remainingPtSessions: number;
  subscriptions?: MemberSubscription[];
}

export interface User {
  id: number;
  phone: string;
  fullName: string;
  avatarUrl?: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberProfile?: MemberProfile | null;
  trainerProfile?: TrainerProfile | null;
}

export interface CreateUserDto {
  phone: string;
  password?: string;
  fullName: string;
  role: Role;
  avatarUrl?: string | null;
  specialization?: string;
}

export interface UpdateUserDto {
  phone?: string;
  fullName?: string;
  role?: Role;
  isActive?: boolean;
  avatarUrl?: string | null;
  specialization?: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: string;
  keyword?: string;
  isActive?: boolean;
}

// Backward-compatibility alias
export type CreateInput = CreateUserDto;
