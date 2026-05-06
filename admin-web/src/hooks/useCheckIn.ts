import { useState } from 'react';
import { checkinService, MemberLookupResponse } from '@/services/checkinService';

export const useCheckIn = () => {
  const [status, setStatus] = useState<'idle' | 'success' | 'failed' | 'loading'>('idle');
  const [member, setMember] = useState<MemberLookupResponse | null>(null);

  const lookup = async (phone: string) => {
    setStatus('loading');
    try {
      const data = await checkinService.lookup(phone);
      setMember(data);
      if (data.hasAccess) {
        setStatus('success');
        await checkinService.record(data.memberId, 'MANUAL');
      } else {
        setStatus('failed');
      }
      return data;
    } catch (e) {
      setStatus('failed');
      setMember(null);
      throw e;
    }
  };

  const reset = () => {
    setStatus('idle');
    setMember(null);
  };

  return { status, member, lookup, reset };
};
