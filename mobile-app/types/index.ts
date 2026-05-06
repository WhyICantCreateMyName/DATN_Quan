import type { Prisma } from '@prisma/client';

export interface PaginationResponse<T> {
  data: T[];
  page: number;
  total: number;
  limit: number;
}

export namespace AuthType {
  export type LoginResponse = { 
    token: string; 
    user: Prisma.UserGetPayload<{}>;
  };
}

export namespace MemberType {
  export type Dashboard = {
    activeSubscription?: Prisma.MemberSubscriptionGetPayload<{ include: { plan: true } }>;
    remainingPtSessions: number;
  };
  export type ScheduleItem = Prisma.BookingGetPayload<{
    include: { groupClass: true, trainer: { include: { user: true } } }
  }>;
  export type InbodyItem = Prisma.BodyMetricGetPayload<{}>;
}

export namespace TrainerType {
  export type Dashboard = { 
    completedThisMonth: number; 
    pendingClasses: number; 
    commissionEstimated: number 
  };
  
  export type ScheduleItem = Prisma.BookingGetPayload<{ 
    include: { member: { include: { user: true } } } 
  }>;
  
  export type ClientItem = Prisma.MemberProfileGetPayload<{ 
    include: { 
      user: true, 
      subscriptions: { include: { plan: true } }, 
      bodyMetrics: true 
    } 
  }>;
  
  export type InbodyForm = { 
    weight: string; 
    height: string; 
    bodyFat: string; 
    muscleMass: string; 
    memberId: number;
  };
}

