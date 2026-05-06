import { useState } from 'react';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loadUser } = useAuth();

  const login = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      await authService.login(data);
      await loadUser();
    } catch (err: any) {
      setError(err.error || 'Đăng nhập thất bại.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
