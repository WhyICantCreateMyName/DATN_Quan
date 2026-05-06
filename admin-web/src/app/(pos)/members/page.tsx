import { Metadata } from 'next';
import Members from '@/components/Members';

export const metadata: Metadata = {
  title: 'Quản lý Hội viên | TitanGym Admin',
  description: 'Danh sách hồ sơ khách hàng, trạng thái gói tập và thông tin liên hệ.',
};

export default function MembersPage() {
  return <Members />;
}
