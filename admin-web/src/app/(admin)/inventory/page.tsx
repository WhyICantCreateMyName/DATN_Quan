import { Metadata } from 'next';
import Inventory from '@/components/Inventory';

export const metadata: Metadata = {
  title: 'Kho hàng cũ | TitanGym Admin',
  description: 'Quản lý kho hàng và dịch vụ (Phiên bản cũ).',
};

export default function InventoryPage() {
  return <Inventory />;
}
