import axiosClient from './axiosClient';
import { MembershipPlan, CreatePlanDto, UpdatePlanDto, MemberSubscription } from '@/types/membership';
import { PaginationResponse } from '@/types';

export const membershipService = {
  getPlans: (page = 1, limit = 10): Promise<PaginationResponse<MembershipPlan>> =>
    axiosClient.get(`/memberships/plans?page=${page}&limit=${limit}`),

  getPlanById: (id: number): Promise<MembershipPlan> =>
    axiosClient.get(`/memberships/plans/${id}`),

  createPlan: (data: CreatePlanDto): Promise<MembershipPlan> =>
    axiosClient.post('/memberships/plans', data),

  updatePlan: (id: number, data: UpdatePlanDto): Promise<MembershipPlan> =>
    axiosClient.patch(`/memberships/plans/${id}`, data),

  deletePlan: (id: number): Promise<{ success: boolean }> =>
    axiosClient.delete(`/memberships/plans/${id}`),

  subscribe: (data: { memberId?: number; planId: number }): Promise<any> =>
    axiosClient.post('/memberships/subscribe', data),

  getMemberSubscriptions: (memberId: number): Promise<MemberSubscription[]> =>
    axiosClient.get(`/memberships/user/${memberId}`),

  updateSubscriptionStatus: (id: number, status: 'ACTIVE' | 'EXPIRED' | 'FROZEN'): Promise<MemberSubscription> =>
    axiosClient.patch(`/memberships/subscriptions/${id}/status`, { status }),

  transferSubscription: (id: number, targetMemberId: number): Promise<MemberSubscription> =>
    axiosClient.patch(`/memberships/subscriptions/${id}/transfer`, { targetMemberId }),
};
