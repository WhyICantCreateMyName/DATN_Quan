'use client';

import React from 'react';
import { SidebarProvider } from '@/context/SidebarContext';
import CoreLayout from '@/layout/CoreLayout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <CoreLayout>
        {children}
      </CoreLayout>
    </SidebarProvider>
  );
}
