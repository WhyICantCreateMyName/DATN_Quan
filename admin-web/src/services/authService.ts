import axiosClient from './axiosClient';

export const authService = {
  login: (data: any): Promise<any> => axiosClient.post('/auth/login', data),
  logout: (): Promise<any> => axiosClient.post('/auth/logout'),
  me: (): Promise<any> => axiosClient.get('/auth/me'),
};
