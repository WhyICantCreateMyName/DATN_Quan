import axiosClient from './axiosClient';
import { PaginationResponse, UserType } from '@/types';

export const userService = {
  getMembers: (page = 1, limit = 10): Promise<PaginationResponse<UserType.User>> => 
    axiosClient.get(`/users?role=MEMBER&page=${page}&limit=${limit}`),
  
  getStaff: (page = 1, limit = 10): Promise<PaginationResponse<UserType.User>> => 
    axiosClient.get(`/users?role=STAFF&page=${page}&limit=${limit}`),
  
  createUser: (data: UserType.CreateInput): Promise<UserType.User> => 
    axiosClient.post('/users', data),
  
  updateProfile: (userId: number, data: { avatarUrl?: string, fingerprintId?: string }): Promise<any> =>
    axiosClient.patch(`/users/${userId}/profile`, data),

  updateUser: (userId: number, data: Partial<UserType.User>): Promise<UserType.User> =>
    axiosClient.patch(`/users/${userId}`, data),

  deleteUser: (userId: number): Promise<any> =>
    axiosClient.delete(`/users/${userId}`),
};
