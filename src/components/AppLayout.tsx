
"use client";

import type { ReactNode } from 'react';
import { useContext } from 'react';
import { BottomNav } from './BottomNav';
import { AppContext } from '@/context/AppContext';

export function AppLayout({ children }: { children: ReactNode }) {
  const { isMounted, isAuthenticated } = useContext(AppContext);
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow pb-28">{children}</main>
      {isMounted && isAuthenticated && <BottomNav />}
    </div>
  );
}
