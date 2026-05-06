import { useState, useCallback, useEffect } from 'react';
import { trainerService } from '@/services/trainerApi';
import { TrainerType } from '@/types';

export const useTrainerClients = () => {
    const [data, setData] = useState<TrainerType.ClientItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetch = async () => {
        try {
            const res = await trainerService.getClients();
            setData(res.data); // Vì API đã được bọc bởi PaginationResponse
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
