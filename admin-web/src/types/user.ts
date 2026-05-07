import type { Prisma } from '@prisma/client';

export type User = Prisma.UserGetPayload<{
  include: {
    memberProfile: {
      include: {
        subscriptions: {
          include: { plan: true }
        }
      }
    },
    trainerProfile: true
  }
}>;

// DTO cho việc tạo User mới, chấp nhận password thô (sẽ được Backend hash)
export type CreateInput = Omit<Prisma.UserCreateInput, 'isActive' | 'passwordHash'> & {
  password?: string;
};
