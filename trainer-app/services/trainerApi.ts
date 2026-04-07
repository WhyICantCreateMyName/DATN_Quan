import apiClient from './apiClient';

export const authService = {
   login: (phone: string, password: string) => apiClient.post('/auth/login', { phone, password }),
   getMe: () => apiClient.get('/auth/me').then(res => res.data),
};

export const trainerService = {
   getDashboard: () => apiClient.get('/trainer/dashboard').then(res => res.data),
   getSchedule: () => apiClient.get('/trainer/schedule').then(res => res.data),
   getClients: () => apiClient.get('/trainer/clients').then(res => res.data),
   updateProfile: (data: any) => apiClient.put('/trainer/profile', data).then(res => res.data),
};

export const metricsService = {
   getHistory: (memberId: string | number) => apiClient.get(`/metrics/${memberId}`).then(res => res.data),
   save: (data: any) => apiClient.post('/metrics', data).then(res => res.data),
};
