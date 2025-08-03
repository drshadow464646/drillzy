
import { BottomNav } from '@/components/BottomNav';
import React from 'react';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <main className="pb-20 pt-[env(safe-area-inset-top)]">{children}</main>
      <BottomNav />
    </div>
  );
}
