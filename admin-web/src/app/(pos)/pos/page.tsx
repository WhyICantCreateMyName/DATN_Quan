import { Metadata } from 'next';
import POS from '@/components/POS';

export const metadata: Metadata = {
  title: 'Máy tính tiền POS | TitanGym Admin',
  description: 'Hệ thống bán lẻ sản phẩm và kích hoạt gói tập tại quầy lễ tân.',
};

export default function PosPage() {
  return <POS />;
}
