import type { Prisma } from '@prisma/client';

export type GroupClass = Prisma.GroupClassGetPayload<{}>;
export type ClassCreateInput = Omit<GroupClass, 'id'>;
