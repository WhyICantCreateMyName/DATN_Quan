'use client';

import React from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import { Menu, LogOut, ShieldCheck, UserCheck } from 'lucide-react';

export default function AppHeader() {
  const { isExpanded, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { currentUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-[#FFFFFF] border-b border-[#E4E4E0] transition-colors">
      <div className="flex items-center gap-4">
        {/* Nút toggle Sidebar trên Desktop */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center w-9 h-9 text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5] rounded-lg transition-colors"
          title={isExpanded ? 'Thu gọn menu' : 'Mở rộng menu'}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Nút toggle Drawer trên Mobile */}
        <button
          onClick={toggleMobileSidebar}
          className="flex lg:hidden items-center justify-center w-9 h-9 text-[#6E6E77] hover:text-[#18181B] hover:bg-[#F7F7F5] rounded-lg transition-colors"
          title="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <span className="text-xs font-mono font-medium text-[#6E6E77] uppercase tracking-wider">
            Titan Gym Operating System
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {currentUser && (
          <div className="flex items-center gap-3 pl-4 border-l border-[#E4E4E0]">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#F7F7F5] border border-[#E4E4E0] flex items-center justify-center shrink-0">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-[#18181B]">
                  {currentUser.fullName?.charAt(0) || 'U'}
                </span>
              )}
            </div>

            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-[#18181B] leading-none mb-1">
                {currentUser.fullName}
              </div>
              <div className="flex items-center gap-1">
                {currentUser.role === 'ADMIN' ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#EA580C] uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" /> QUẢN TRỊ VIÊN
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#15803D] uppercase tracking-wider">
                    <UserCheck className="w-3 h-3" /> LỄ TÂN
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center justify-center w-9 h-9 ml-2 text-[#6E6E77] hover:text-[#EA580C] hover:bg-[#F7F7F5] rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
