import axiosClient from './axiosClient';
import { PaginationResponse } from '@/types';
import { User, CreateUserDto, UpdateUserDto, UserQueryParams } from '@/types/user';

export const userService = {
  getUsers: (params?: UserQueryParams): Promise<PaginationResponse<User>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.role) query.append('role', params.role);
    if (params?.keyword) query.append('keyword', params.keyword);
    if (params?.isActive !== undefined) query.append('isActive', params.isActive.toString());
    return axiosClient.get(`/users?${query.toString()}`);
  },

  getMembers: (page = 1, limit = 10): Promise<PaginationResponse<User>> => 
    axiosClient.get(`/users?role=MEMBER&page=${page}&limit=${limit}`),
  
  getStaff: (page = 1, limit = 10): Promise<PaginationResponse<User>> => 
    axiosClient.get(`/users?role=STAFF&page=${page}&limit=${limit}`),
  
  getUserById: (id: number): Promise<User> =>
    axiosClient.get(`/users/${id}`),

  createUser: (data: CreateUserDto): Promise<User> => 
    axiosClient.post('/users', data),
  
  updateProfile: (userId: number, data: { avatarUrl?: string; fingerprintId?: string }): Promise<any> =>
    axiosClient.patch(`/users/${userId}/profile`, data),

  updateUser: (userId: number, data: UpdateUserDto): Promise<User> =>
    axiosClient.patch(`/users/${userId}`, data),

  deleteUser: (userId: number): Promise<any> =>
    axiosClient.delete(`/users/${userId}`),
};
