import type { Prisma } from '@prisma/client';

export type Plan = Prisma.MembershipPlanGetPayload<{}>;
export type PlanCreateInput = Omit<Plan, 'id' | 'isActive'> & { description?: string };
