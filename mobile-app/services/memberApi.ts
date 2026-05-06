import apiClient from './apiClient';
import { AuthType, MemberType, PaginationResponse } from '@/types';

export const authService = {
   login: (phone: string, password: string) => apiClient.post<AuthType.LoginResponse>('/auth/login', { phone, password }).then(res => res.data),
   getMe: (): Promise<any> => apiClient.get('/auth/me').then(res => res.data),
};

export const memberService = {
   getDashboard: (): Promise<MemberType.Dashboard> => apiClient.get('/member/dashboard').then(res => res.data),
   getSchedule: (page = 1, limit = 10): Promise<PaginationResponse<MemberType.ScheduleItem>> => apiClient.get(`/member/schedule?page=${page}&limit=${limit}`).then(res => res.data),
   getInbody: (page = 1, limit = 10): Promise<PaginationResponse<MemberType.InbodyItem>> => apiClient.get(`/member/inbody?page=${page}&limit=${limit}`).then(res => res.data),
   getTrainers: (): Promise<any[]> => apiClient.get('/member/trainers').then(res => res.data),
   getTrainerAvailability: (trainerId: number): Promise<any[]> => apiClient.get(`/member/trainer-availability/${trainerId}`).then(res => res.data),
   createBooking: (data: any) => apiClient.post('/bookings', data).then(res => res.data),
   getGroupClasses: () => apiClient.get('/bookings/classes').then(res => res.data),
   getMembershipPlans: () => apiClient.get('/memberships/plans').then(res => res.data),
   purchaseSubscription: (planId: number) => apiClient.post('/memberships/subscribe', { planId }).then(res => res.data),
   createMomoPayment: (amount: number, planId: number, redirectUrl?: string) => apiClient.post('/payment/momo', { amount, planId, redirectUrl }).then(res => res.data),
   getWorkoutLogs: () => apiClient.get('/workout/me').then(res => res.data),
};
