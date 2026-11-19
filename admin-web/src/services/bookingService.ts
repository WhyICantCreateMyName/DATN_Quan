import axiosClient from './axiosClient';
import { GroupClass } from '@/types/class';
import { PaginationResponse } from '@/types';

export const bookingService = {
  getAvailableClasses: async (): Promise<GroupClass[]> => {
    const res: any = await axiosClient.get('/bookings/classes?limit=50');
    return res.data || res || [];
  },

  getBookings: (params?: { page?: number; limit?: number; status?: string; date?: string; trainerId?: number }): Promise<PaginationResponse<any>> => {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const status = params?.status ? `&status=${params.status}` : '';
    const date = params?.date ? `&date=${params.date}` : '';
    const trainerId = params?.trainerId ? `&trainerId=${params.trainerId}` : '';
    return axiosClient.get(`/bookings?page=${page}&limit=${limit}${status}${date}${trainerId}`);
  },

  bookClass: (memberId: number, groupClassId: number, startTime: string | Date, endTime: string | Date) => {
    return axiosClient.post('/bookings', {
      memberId,
      groupClassId,
      startTime,
      endTime,
    });
  },

  updateBookingStatus: (id: number, status: string) => {
    return axiosClient.patch(`/bookings/${id}`, { status });
  },
};

export const getAvailableClasses = bookingService.getAvailableClasses;
export const bookClass = bookingService.bookClass;
