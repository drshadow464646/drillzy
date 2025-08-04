import React from 'react';
import { BottomNav } from '@/components/BottomNav';

// This is the layout for the main application pages.
// It includes the bottom navigation bar.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pb-20"> {/* Add padding to the bottom to avoid content being hidden by the nav bar */}
      <main>{children}</main>
      <BottomNav />
    </div>
  );
}
