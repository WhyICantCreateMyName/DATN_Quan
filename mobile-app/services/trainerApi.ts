import apiClient from './apiClient';
import { AuthType, TrainerType, PaginationResponse } from '@/types';

export const authService = {
   login: (phone: string, password: string) => apiClient.post<AuthType.LoginResponse>('/auth/login', { phone, password }).then(res => res.data),
   getMe: (): Promise<any> => apiClient.get('/auth/me').then(res => res.data),
};

export const trainerService = {
   getDashboard: (): Promise<TrainerType.Dashboard> => apiClient.get('/trainer/dashboard').then(res => res.data),
   getSchedule: (page = 1, limit = 10): Promise<PaginationResponse<TrainerType.ScheduleItem>> => apiClient.get(`/trainer/schedule?page=${page}&limit=${limit}`).then(res => res.data),
   getClients: (page = 1, limit = 10): Promise<PaginationResponse<TrainerType.ClientItem>> => apiClient.get(`/trainer/clients?page=${page}&limit=${limit}`).then(res => res.data),
   getClientDetail: (id: string | number) => apiClient.get(`/trainer/clients/${id}`).then(res => res.data),
   updateProfile: (data: any) => apiClient.put('/trainer/profile', data).then(res => res.data),
   getAvailability: () => apiClient.get('/trainer/availability').then(res => res.data),
   updateAvailability: (slots: any[]) => apiClient.post('/trainer/availability', { slots }).then(res => res.data),
   updateBookingStatus: (id: number, status: string) => apiClient.patch(`/bookings/${id}`, { status }).then(res => res.data),
};

export const metricsService = {
   getHistory: (memberId: string | number) => apiClient.get(`/metrics/${memberId}`).then(res => res.data),
   getSelfHistory: () => apiClient.get('/metrics/history/self').then(res => res.data),
   save: (data: TrainerType.InbodyForm) => apiClient.post('/metrics', data).then(res => res.data),
   saveSelf: (data: Omit<TrainerType.InbodyForm, 'memberId'>) => apiClient.post('/metrics', { ...data, memberId: 0 }).then(res => res.data),
};
