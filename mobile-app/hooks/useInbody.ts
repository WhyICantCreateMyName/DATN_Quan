import { useState, useCallback, useEffect } from 'react';
import { memberService } from '@/services/memberApi';
import { MemberType } from '@/types';

export const useInbody = () => {
    const [metrics, setMetrics] = useState<MemberType.InbodyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const fetch = async () => {
        try {
            const res = await memberService.getInbody();
            setMetrics(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetch().finally(() => setRefreshing(false));
    }, []);

    return { metrics, loading, refreshing, onRefresh };
};
