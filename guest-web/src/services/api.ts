import axiosClient from './axiosClient';

// Auth Services
export const loginUser = (phone: string, password: string) => {
  return axiosClient.post('/auth/login', { phone, password });
};

export const fetchMe = () => {
  return axiosClient.get('/auth/me');
};

export const logoutUser = () => {
  return axiosClient.post('/auth/logout');
};

// Member Services
export const getMembershipPlans = () => {
  return axiosClient.get('/memberships/plans');
};

export const trialRegistration = (fullName: string, phone: string) => {
  return axiosClient.post('/users', {
    fullName, phone, password: 'trial_account', role: 'MEMBER'
  });
};

// Booking & Classes
export const getAvailableClasses = () => {
  return axiosClient.get('/bookings/classes');
};

export const bookClass = (memberId: number, groupClassId: number, startTime: string, endTime: string) => {
  return axiosClient.post('/bookings', {
    memberId, groupClassId, startTime, endTime
  });
};

// Payment Flow
export const generateMoMoPayment = (amount: number, orderInfo: string) => {
  return axiosClient.post('/payment/momo', {
    amount, orderInfo, orderId: `CLASS_${Date.now()}`
  });
};
