'use client';

import RoleGuard from "@/components/RoleGuard";

export default function PosGroupLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['ADMIN', 'RECEPTIONIST']}>{children}</RoleGuard>;
}
