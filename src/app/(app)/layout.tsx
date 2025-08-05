import React from 'react';
import { BottomNav } from '@/components/BottomNav';

<<<<<<< HEAD
import { BottomNav } from '@/components/BottomNav';
import { UserDataProvider } from '@/context/UserDataProvider';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <UserDataProvider>
            <main className="pb-24">
                {children}
            </main>
            <BottomNav />
        </UserDataProvider>
    );
=======
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
>>>>>>> 3e1ca5c3cb9d7694b8f6e232e63ddbe3fd47b9da
}
