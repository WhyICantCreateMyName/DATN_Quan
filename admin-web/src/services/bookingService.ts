import axiosClient from './axiosClient';

export const getAvailableClasses = () => {
  return axiosClient.get('/bookings/classes').then(res => res.data);
};

export const bookClass = (memberId: number, groupClassId: number, startTime: string, endTime: string) => {
  return axiosClient.post('/bookings', {
    memberId, groupClassId, startTime, endTime
  }).then(res => res.data);
};
