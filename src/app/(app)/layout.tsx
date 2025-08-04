import React from 'react';
import { BottomNav } from '@/components/BottomNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UserData } from '@/lib/types';
import { UserDataProvider } from '@/context/UserDataProvider';

// This is the layout for the main application pages.
// It includes the bottom navigation bar.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Fetch all necessary data in parallel
  const [profileRes, historyRes, streakRes] = await Promise.all([
    supabase.from('profiles').select('name, category').eq('id', user.id).single(),
    supabase.from('skill_history').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.rpc('calculate_streak', { user_id_param: user.id })
  ]);

  const { data: profile } = profileRes;
  const { data: history, error: historyError } = historyRes;
  const { data: streakCount, error: streakError } = streakRes;

  if (historyError) {
    console.error("Error fetching skill history:", historyError);
    // Handle error appropriately, maybe redirect to an error page
  }
  if (streakError) {
    console.error("Error fetching streak:", streakError);
  }

  const initialUserData: UserData = {
    id: user.id,
    name: profile?.name || user.user_metadata.name || 'Learner',
    category: profile?.category || null,
    skillHistory: history || [],
    streakCount: streakCount || 0,
  };

  return (
    <UserDataProvider initialData={initialUserData}>
      <div className="pb-20"> {/* Add padding to the bottom to avoid content being hidden by the nav bar */}
        <main>{children}</main>
        <BottomNav />
      </div>
    </UserDataProvider>
  );
}
