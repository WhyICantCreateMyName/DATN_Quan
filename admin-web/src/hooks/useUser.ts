'use client';

import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { userService } from '@/services/userService';
import { User, CreateUserDto, UpdateUserDto, UserQueryParams } from '@/types/user';
import { PaginationResponse } from '@/types';
import { Toast } from '@/context/ToastContext';

export const useUsers = (params?: UserQueryParams) => {
  return useSWR(
    ['users', params],
    async () => {
      try {
        const result = await userService.getUsers(params);
        return result as PaginationResponse<User>;
      } catch (error) {
        return { data: [], limit: 10, page: 1, total: 0 } as PaginationResponse<User>;
      }
    },
    {
      dedupingInterval: 10000,
      revalidateOnFocus: false,
    }
  );
};

export const useUserDetail = (userId?: number | null) => {
  return useSWR(
    userId ? ['userDetail', userId] : null,
    async () => {
      if (!userId) return null;
      return await userService.getUserById(userId);
    },
    {
      dedupingInterval: 10000,
      revalidateOnFocus: false,
    }
  );
};

export const useUser = () => {
  const { trigger: createUser, isMutating: isCreatingUser } = useSWRMutation(
    'createUser',
    async (_key: string, { arg }: { arg: CreateUserDto }) => {
      try {
        const result = await userService.createUser(arg);
        Toast.show({
          title: 'Thành công',
          message: `Đã thêm mới tài khoản ${result.fullName}! (Mật khẩu mặc định: 123456)`,
          variant: 'success',
        });
        mutate((key: any) => Array.isArray(key) && key[0] === 'users', undefined, { revalidate: true });
        return result;
      } catch (error: any) {
        Toast.show({
          title: 'Lỗi',
          message: error?.response?.data?.error || error?.message || 'Có lỗi xảy ra khi tạo người dùng!',
          variant: 'error',
        });
        throw error;
      }
    }
  );

  const { trigger: updateUser, isMutating: isUpdatingUser } = useSWRMutation(
    'updateUser',
    async (_key: string, { arg }: { arg: { userId: number; data: UpdateUserDto } }) => {
      try {
        const result = await userService.updateUser(arg.userId, arg.data);
        Toast.show({
          title: 'Thành công',
          message: `Đã cập nhật thông tin tài khoản ${result.fullName}!`,
          variant: 'success',
        });
        mutate((key: any) => Array.isArray(key) && key[0] === 'users', undefined, { revalidate: true });
        return result;
      } catch (error: any) {
        Toast.show({
          title: 'Lỗi',
          message: error?.response?.data?.error || error?.message || 'Có lỗi xảy ra khi cập nhật!',
          variant: 'error',
        });
        throw error;
      }
    }
  );

  const { trigger: deleteUser, isMutating: isDeletingUser } = useSWRMutation(
    'deleteUser',
    async (_key: string, { arg }: { arg: { userId: number; name?: string } }) => {
      try {
        await userService.deleteUser(arg.userId);
        Toast.show({
          title: 'Đã xóa',
          message: `Đã xóa tài khoản ${arg.name || ''} khỏi hệ thống!`,
          variant: 'info',
        });
        mutate((key: any) => Array.isArray(key) && key[0] === 'users', undefined, { revalidate: true });
        return true;
      } catch (error: any) {
        Toast.show({
          title: 'Lỗi',
          message: error?.response?.data?.error || error?.message || 'Không thể xóa tài khoản này!',
          variant: 'error',
        });
        throw error;
      }
    }
  );

  return {
    createUser,
    isCreatingUser,
    updateUser,
    isUpdatingUser,
    deleteUser,
    isDeletingUser,
  };
};
