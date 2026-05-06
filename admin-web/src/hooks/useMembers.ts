import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/userService';
import { PaginationResponse, UserType } from '@/types';

export const useMembers = (initialPage = 1) => {
  const [members, setMembers] = useState<UserType.User[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: initialPage });
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await userService.getMembers(page);
      setMembers(res.data);
      setPagination({
        total: res.total,
        totalPages: Math.ceil(res.total / res.limit),
        page: res.page
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createMember = async (data: UserType.CreateInput) => {
    const newUser = await userService.createUser(data);
    await fetchMembers(pagination.page);
    return newUser;
  };

  useEffect(() => {
    fetchMembers(initialPage);
  }, [fetchMembers, initialPage]);

  return { 
    members, 
    pagination, 
    loading, 
    refresh: () => fetchMembers(pagination.page), 
    setPage: fetchMembers,
    createMember 
  };
};
