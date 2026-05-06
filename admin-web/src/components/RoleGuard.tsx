'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppLayout from "@/components/AppLayout";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push('/login');
      } else if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
        // Nếu không có quyền, đẩy về trang chủ của role đó
        router.push(currentUser.role === 'RECEPTIONIST' ? '/pos' : '/dashboard');
      }
    }
  }, [currentUser, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#39FF14]"></div>
      </div>
    );
  }

  if (!currentUser) return null;

  // Kiểm tra role lần cuối trước khi render
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return null;
  }

  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}
