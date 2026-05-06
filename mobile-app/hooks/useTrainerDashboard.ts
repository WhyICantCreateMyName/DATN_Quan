import { useState, useCallback, useEffect } from 'react';
import { trainerService } from '@/services/trainerApi';
import { TrainerType } from '@/types';

export const useTrainerDashboard = () => {
    const [data, setData] = useState<TrainerType.Dashboard>({ completedThisMonth: 0, pendingClasses: 0, commissionEstimated: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetch = async () => {
        try {
            const res = await trainerService.getDashboard();
            setData(res);
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

    return { data, loading, refreshing, onRefresh };
};
