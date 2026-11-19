'use client';

import React from 'react';
import { useSidebar } from '@/context/SidebarContext';
import AppHeader from '@/layout/AppHeader';
import AppSidebar from '@/layout/AppSidebar';
import Backdrop from '@/layout/Backdrop';

export default function CoreLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? 'ml-0'
    : isExpanded || isHovered
      ? 'lg:ml-[290px]'
      : 'lg:ml-[90px]';

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#18181B] selection:bg-[#EA580C]/20 selection:text-[#EA580C]">
      <AppSidebar />
      <Backdrop />
      <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <main className="flex-1 p-6 mx-auto w-full max-w-[1920px]">
          {children}
        </main>
      </div>
    </div>
  );
}
