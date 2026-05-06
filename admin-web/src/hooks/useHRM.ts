import { useState, useCallback, useEffect } from 'react';
import { hrmService } from '@/services/hrmService';
import { HRMType } from '@/types';

export const useHRM = () => {
  const [shifts, setShifts] = useState<HRMType.StaffShift[]>([]);
  const [rates, setRates] = useState<HRMType.CommissionRate[]>([]);
  const [kpis, setKpis] = useState<HRMType.StaffKPI[]>([]);
  const [logs, setLogs] = useState<HRMType.CommissionLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r, k, l] = await Promise.all([
        hrmService.getShifts(),
        hrmService.getCommissionRates(),
        hrmService.getKPIs(new Date().getMonth() + 1, new Date().getFullYear()),
        hrmService.getCommissionLogs()
      ]);
      setShifts(s);
      setRates(r);
      setKpis(k);
      setLogs(l);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    shifts,
    rates,
    kpis,
    logs,
    loading,
    refresh: fetchData,
    createShift: hrmService.createShift,
    saveCommission: hrmService.saveCommissionRate,
    saveKPI: hrmService.saveKPI
  };
};
