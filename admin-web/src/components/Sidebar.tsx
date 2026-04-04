'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, ScanLine, Settings, LogOut, Database, Briefcase } from 'lucide-react';
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
    { label: 'Khách Hàng', href: '/members', icon: Users, roles: ['ADMIN', 'RECEPTIONIST'] },
    { label: 'Kho & Dịch Vụ', href: '/inventory', icon: Database, roles: ['ADMIN'] },
    { label: 'Nhân Sự', href: '/staff', icon: Briefcase, roles: ['ADMIN'] },
    { label: 'Cấu hình', href: '/settings', icon: Settings, roles: ['ADMIN'] },
  ];

  if (!currentUser) return null;

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 h-screen flex flex-col fixed left-0 top-0">
      <div className="h-20 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-black text-white tracking-tight">TITANGYM <span className="text-[#39FF14]">ADMIN</span></h1>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map(item => {
          if (!item.roles.includes(currentUser.role)) return null;
          
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm text-white">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{currentUser.fullName}</p>
            <p className="text-xs text-gray-500">{currentUser.role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
