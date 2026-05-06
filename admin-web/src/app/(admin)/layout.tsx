'use client';

import RoleGuard from "@/components/RoleGuard";

export default function AdminOnlyLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['ADMIN']}>{children}</RoleGuard>;
}
