'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadUser = async () => {
    try {
      const data: any = await axiosClient.get('/auth/me');
      setCurrentUser(data);
      
      // Nếu đã đăng nhập mà còn ở trang login thì đẩy vào trong
      if (pathname === '/login') {
        if (data.role === 'ADMIN') router.push('/dashboard');
        else if (data.role === 'RECEPTIONIST') router.push('/pos');
        // Hội viên có thể ở lại trang chủ hoặc chuyển về trang cá nhân (nếu có)
      }
    } catch (error) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Luôn cố gắng load user khi khởi tạo hoặc chuyển trang
    loadUser();
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ currentUser, loadUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

