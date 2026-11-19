'use client';

import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { membershipService } from '@/services/membershipService';
import { MembershipPlan, CreatePlanDto, UpdatePlanDto, MemberSubscription } from '@/types/membership';
import { PaginationResponse } from '@/types';
import { Toast } from '@/context/ToastContext';

export const useMembershipPlans = (page = 1, limit = 10) => {
  return useSWR(
    ['membershipPlans', page, limit],
    async () => {
      try {
        const result = await membershipService.getPlans(page, limit);
        return result as PaginationResponse<MembershipPlan>;
      } catch (error) {
        return { data: [], limit, page, total: 0 } as PaginationResponse<MembershipPlan>;
      }
    },
    {
      dedupingInterval: 10000,
      revalidateOnFocus: false,
    }
  );
};

export const useMemberSubscriptions = (memberId?: number | null) => {
  return useSWR(
    memberId ? ['memberSubscriptions', memberId] : null,
    async () => {
      if (!memberId) return [];
      try {
        return await membershipService.getMemberSubscriptions(memberId);
      } catch (error) {
        return [];
      }
    },
    {
      dedupingInterval: 10000,
      revalidateOnFocus: false,
    }
  );
};

export const useMembership = () => {
  const { trigger: createPlan, isMutating: isCreatingPlan } = useSWRMutation(
    'createPlan',
    async (_key: string, { arg }: { arg: CreatePlanDto }) => {
      try {
        const result = await membershipService.createPlan(arg);
        Toast.show({
          title: 'Thành công',
          message: `Đã tạo gói tập "${result.name}" thành công!`,
          variant: 'success',
        });
        mutate((key: any) => Array.isArray(key) && key[0] === 'membershipPlans', undefined, { revalidate: true });
        return result;
      } catch (error: any) {
        Toast.show({
          title: 'Lỗi',
          message: error?.response?.data?.error || error?.message || 'Có lỗi xảy ra khi tạo gói tập!',
          variant: 'error',
        });
        throw error;
      }
    }
  );

  const { trigger: updatePlan, isMutating: isUpdatingPlan } = useSWRMutation(
    'updatePlan',
    async (_key: string, { arg }: { arg: { planId: number; data: UpdatePlanDto } }) => {
      try {
        const result = await membershipService.updatePlan(arg.planId, arg.data);
        Toast.show({
          title: 'Thành công',
          message: `Đã cập nhật gói tập "${result.name}"!`,
          variant: 'success',
        });
        mutate((key: any) => Array.isArray(key) && key[0] === 'membershipPlans', undefined, { revalidate: true });
        return result;
      } catch (error: any) {
        Toast.show({
          title: 'Lỗi',
          message: error?.response?.data?.error || error?.message || 'Có lỗi xảy ra khi cập nhật gói tập!',
          variant: 'error',
        });
        throw error;
      }
    }
  );

  const { trigger: deletePlan, isMutating: isDeletingPlan } = useSWRMutation(
    'deletePlan',
    async (_key: string, { arg }: { arg: number }) => {
      try {
        const result = await membershipService.deletePlan(arg);
        Toast.show({
          title: 'Thành công',
          message: 'Đã xóa gói tập thành công!',
          variant: 'success',
        });
        mutate((key: any) => Array.isArray(key) && key[0] === 'membershipPlans', undefined, { revalidate: true });
        return result;
      } catch (error: any) {
        Toast.show({
          title: 'Lỗi',
          message: error?.response?.data?.error || error?.message || 'Có lỗi xảy ra khi xóa gói tập!',
          variant: 'error',
        });
        throw error;
      }
    }
  );

  const { trigger: subscribeMember, isMutating: isSubscribing } = useSWRMutation(
    'subscribeMember',
    async (_key: string, { arg }: { arg: { memberId?: number; planId: number } }) => {
      try {
        const result = await membershipService.subscribe(arg);
        Toast.show({
          title: 'Thành công',
          message: result.message || 'Đăng ký gói tập thành công!',
          variant: 'success',
        });
        mutate((key: any) => Array.isArray(key) && (key[0] === 'memberSubscriptions' || key[0] === 'users'), undefined, { revalidate: true });
        return result;
      } catch (error: any) {
        Toast.show({
          title: 'Lỗi',
          message: error?.response?.data?.error || error?.message || 'Không thể đăng ký gói tập!',
          variant: 'error',
        });
        throw error;
      }
    }
  );

  return {
    createPlan,
    isCreatingPlan,
    updatePlan,
    isUpdatingPlan,
    deletePlan,
    isDeletingPlan,
    subscribeMember,
    isSubscribing,
  };
};
