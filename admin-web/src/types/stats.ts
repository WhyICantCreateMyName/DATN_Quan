export interface DashboardStats {
  overview: {
    todayRevenue: number;
    todayCheckIns: number;
    activeMemberships: number;
    totalMembers: number;
  };
  chartData: { name: string; total: number }[];
  statusCount: {
    active: number;
    expiring: number;
    frozen: number;
    expired: number;
  };
}
