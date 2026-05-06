import { Metadata } from 'next';
import Login from '@/components/Login';

export const metadata: Metadata = {
  title: 'Đăng nhập | TitanGym Admin',
  description: 'Cổng đăng nhập dành cho quản trị viên và nhân viên TitanGym.',
};

export default function LoginPage() {
  return <Login />;
}
