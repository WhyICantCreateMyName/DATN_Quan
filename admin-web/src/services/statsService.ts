import axiosClient from './axiosClient';
import { StatsType } from '@/types';

export const statsService = {
  getStats: (): Promise<StatsType.DashboardStats> => axiosClient.get('/stats'),
};
