import { Metadata } from 'next';
import Dashboard from '@/components/Dashboard';

export const metadata: Metadata = {
  title: 'Tổng quan | TitanGym Admin',
  description: 'Báo cáo doanh thu, lượt check-in và hiệu suất hoạt động của phòng tập TitanGym.',
  openGraph: {
    title: 'TitanGym Dashboard',
    description: 'Hệ thống quản trị thời gian thực TitanGym.',
  },
};

export default function DashboardPage() {
  return <Dashboard />;
}
