import { redirect } from 'next/navigation';

export default function Home() {
  // Trang root lập tức đẩy thẳng vào dashboard
  redirect('/dashboard');
}
