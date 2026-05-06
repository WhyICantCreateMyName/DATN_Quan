import axiosClient from './axiosClient';

export const membershipService = {
  updateSubscriptionStatus: (id: number, status: string): Promise<any> =>
    axiosClient.patch(`/memberships/subscriptions/${id}/status`, { status }),

  transferSubscription: (id: number, targetMemberId: number): Promise<any> =>
    axiosClient.patch(`/memberships/subscriptions/${id}/transfer`, { targetMemberId }),
};
