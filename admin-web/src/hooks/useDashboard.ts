import { useState, useEffect, useCallback } from 'react';
import { statsService } from '@/services/statsService';
import { StatsType } from '@/types';

export const useDashboard = () => {
  const [stats, setStats] = useState<StatsType.DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await statsService.getStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const timer = setInterval(fetchStats, 30000);
    return () => clearInterval(timer);
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
};
