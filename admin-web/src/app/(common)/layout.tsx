'use client';

import RoleGuard from "@/components/RoleGuard";

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  // Không giới hạn role cụ thể, chỉ yêu cầu đăng nhập (RoleGuard mặc định xử lý auth)
  return <RoleGuard>{children}</RoleGuard>;
}
