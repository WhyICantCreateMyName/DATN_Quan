import { useState, useCallback, useEffect } from 'react';
import { memberService, authService } from '@/services/memberApi';
import { MemberType } from '@/types';

export const useDashboard = () => {
    const [dash, setDash] = useState<MemberType.Dashboard | null>(null);
    const [me, setMe] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const fetch = async () => {
        try {
            const [dashRes, meRes] = await Promise.all([
                memberService.getDashboard(),
                authService.getMe()
            ]);
            setDash(dashRes);
            setMe(meRes);
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

    return { dash, me, loading, refreshing, onRefresh };
};
