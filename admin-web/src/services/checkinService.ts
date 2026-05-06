import axiosClient from './axiosClient';

export interface MemberLookupResponse {
  id: number;
  memberId: number;
  name: string;
  phone: string;
  hasAccess: boolean;
  plan: string;
  expireDate: string;
  remainingDays: number;
}

export const checkinService = {
  lookup: (payload: string): Promise<MemberLookupResponse> => 
    axiosClient.post('/checkin/lookup', { payload }),
  
  record: (memberId: number, method: string): Promise<any> => 
    axiosClient.post('/checkin/record', { memberId, method }),
};
