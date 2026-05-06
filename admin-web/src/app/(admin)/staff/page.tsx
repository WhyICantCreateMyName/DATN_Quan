import Staff from '@/components/Staff';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản trị Nhân sự & KPI | TITANGYM',
  description: 'Hệ thống theo dõi hiệu suất, hoa hồng và lịch trực nhân viên.',
};

export default function StaffPage() {
  return <Staff />;
}
