'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Dumbbell,
  CreditCard,
  Package,
  KeyRound,
  QrCode,
  Flame,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { name: 'Nhân sự', href: '/staff', icon: Users },
  { name: 'Hội viên', href: '/members', icon: UserCheck },
  { name: 'Gói tập & Lớp', href: '/catalog', icon: Dumbbell },
  { name: 'Thu ngân POS', href: '/pos', icon: CreditCard },
  { name: 'Kho hàng', href: '/inventory', icon: Package },
  { name: 'Tủ đồ (Locker)', href: '/locker', icon: KeyRound },
  { name: 'Cổng Check-in', href: '/checkin', icon: QrCode },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();

  const isWide = isExpanded || isHovered;

  return (
    <aside
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#FFFFFF] border-r border-[#E4E4E0] transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0 w-[290px]' : '-translate-x-full lg:translate-x-0'}
        ${isWide ? 'lg:w-[290px]' : 'lg:w-[90px]'}
      `}
    >
      {/* Logo & Header */}
      <div className="flex items-center h-16 px-6 border-b border-[#E4E4E0] shrink-0">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#EA580C] text-white shrink-0 shadow-sm shadow-[#EA580C]/20">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          {isWide && (
            <div className="flex flex-col whitespace-nowrap animate-in fade-in duration-200">
              <span className="text-base font-black tracking-tight text-[#18181B] uppercase font-['Plus_Jakarta_Sans',sans-serif]">
                TITAN <span className="text-[#EA580C]">GYM</span>
              </span>
              <span className="text-[10px] font-mono font-medium text-[#6E6E77] uppercase tracking-wider">
                Management OS
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-150 group
                ${isActive
                  ? 'bg-[#EA580C]/10 text-[#EA580C] font-extrabold'
                  : 'text-[#6E6E77] hover:bg-[#F7F7F5] hover:text-[#18181B]'
                }
              `}
              title={!isWide ? item.name : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors
                  ${isActive ? 'text-[#EA580C]' : 'text-[#6E6E77] group-hover:text-[#18181B]'}
                `}
              />
              {isWide && (
                <span className="truncate whitespace-nowrap animate-in fade-in duration-200">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      {isWide && (
        <div className="p-4 m-3 rounded-xl bg-[#F7F7F5] border border-[#E4E4E0] shrink-0 text-left">
          <div className="text-[11px] font-bold text-[#18181B]">TITAN GYM v2.0</div>
          <div className="text-[10px] font-mono text-[#6E6E77] mt-0.5">Sprint 1 • Identity Layer</div>
        </div>
      )}
    </aside>
  );
}
