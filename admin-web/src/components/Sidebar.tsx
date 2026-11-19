'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, ScanLine, Settings, LogOut, Database, Briefcase, Box } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axiosClient from '@/services/axiosClient';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, loadUser } = useAuth();

  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
      await loadUser(); // Sẽ tự đá ra /login
    } catch (e) {}
  };

  const navItems = [
    { label: 'Tổng Quan', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
    { label: 'Lễ Tân POS', href: '/pos', icon: CreditCard, roles: ['ADMIN', 'RECEPTIONIST'] },
    { label: 'Check-in Cổng', href: '/check-in', icon: ScanLine, roles: ['ADMIN', 'RECEPTIONIST'] },
    { label: 'Quản lý Tủ đồ', href: '/locker', icon: Box, roles: ['ADMIN', 'RECEPTIONIST'] },
    { label: 'Khách Hàng', href: '/members', icon: Users, roles: ['ADMIN', 'RECEPTIONIST'] },
    { label: 'Quản lý Danh mục', href: '/catalog', icon: Database, roles: ['ADMIN'] },
    { label: 'Nhân Sự', href: '/staff', icon: Briefcase, roles: ['ADMIN'] },
    { label: 'Cấu hình', href: '/settings', icon: Settings, roles: ['ADMIN'] },
  ];

  if (!currentUser) return null;

  return (
    <aside className="w-64 bg-[#FFFFFF] border-r border-[#E4E4E0] h-screen flex flex-col fixed left-0 top-0">
      <div className="h-20 flex items-center px-6 border-b border-[#E4E4E0]">
        <h1 className="text-xl font-black text-[#18181B] tracking-tight">TITAN<span className="text-[#EA580C]">GYM</span></h1>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        {navItems.map(item => {
          if (!item.roles.includes(currentUser.role)) return null;
          
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-xs font-bold ${
                isActive ? 'bg-[#EA580C] text-white shadow-sm shadow-[#EA580C]/20' : 'text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#E4E4E0]">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-[#F7F7F5] rounded-xl border border-[#E4E4E0]">
          <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#E4E4E0] flex items-center justify-center font-bold text-xs text-[#EA580C]">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-[#18181B] line-clamp-1">{currentUser.fullName}</p>
            <p className="text-[10px] font-mono text-[#6E6E77] uppercase">{currentUser.role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
