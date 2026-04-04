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
      
      // Chặn hội viên thường không được truy cập Admin Web
      if (data.role === 'MEMBER') {
        await axiosClient.post('/auth/logout');
        setCurrentUser(null);
        if (pathname !== '/login') router.push('/login');
      } else {
        setCurrentUser(data);
        if (pathname === '/login') router.push('/dashboard');
      }
    } catch (error) {
      setCurrentUser(null);
      if (pathname !== '/login') router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Không check login ở route /login
    if (pathname !== '/login') {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ currentUser, loadUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
