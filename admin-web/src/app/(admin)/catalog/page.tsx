import { Metadata } from 'next';
import Catalog from '@/components/Catalog';

export const metadata: Metadata = {
  title: 'Quản lý Danh mục | TitanGym Admin',
  description: 'Quản lý các gói tập, lớp học và sản phẩm bán lẻ của TitanGym.',
  openGraph: {
    title: 'Quản lý Danh mục - TitanGym',
    description: 'Hệ thống quản trị dịch vụ và hàng hóa TitanGym.',
  },
};

export default function CatalogPage() {
  return <Catalog />;
}
