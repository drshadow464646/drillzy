
import { BottomNav } from '@/components/BottomNav';
import { createClient } from '@/lib/supabase/server';
import type { UserData } from '@/lib/types';
import React from 'react';

// This is a server component, so we can fetch initial data here
// and pass it down to the client-side provider.
async function getInitialUserData(): Promise<UserData | null> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) {
      return null;
    }
  
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, category')
      .eq('id', user.id)
      .single();
  
    return {
      id: user.id,
      name: profile?.name || user.user_metadata.name || 'Learner',
      category: profile?.category || null,
      skillHistory: [], // This will be hydrated on the client from localStorage
      streakCount: 0, // This will be calculated on the client
    };
  }

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // We no longer need the Initializer component as data is passed directly.
  return (
    <div className="min-h-screen">
      <main className="pb-20 pt-[env(safe-area-inset-top)]">{children}</main>
      <BottomNav />
    </div>
  );
}
