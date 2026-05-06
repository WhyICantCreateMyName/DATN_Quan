import { Metadata } from 'next';
import CheckIn from '@/components/CheckIn';

export const metadata: Metadata = {
  title: 'Kiểm soát Cổng | TitanGym Admin',
  description: 'Theo dõi lượt khách ra vào và tra cứu thông tin thẻ hội viên tại cổng.',
};

export default function CheckInPage() {
  return <CheckIn />;
}
