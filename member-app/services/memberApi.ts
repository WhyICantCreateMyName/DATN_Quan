import apiClient from './apiClient';

export const authService = {
   login: (phone: string, password: string) => apiClient.post('/auth/login', { phone, password }),
   getMe: () => apiClient.get('/auth/me').then(res => res.data),
};

export const memberService = {
   getDashboard: () => apiClient.get('/member/dashboard').then(res => res.data),
   getSchedule: () => apiClient.get('/member/schedule').then(res => res.data),
   getInbody: () => apiClient.get('/member/inbody').then(res => res.data),
};
