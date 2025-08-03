
'use server';

import {createClient} from '@/lib/supabase/server';
import {revalidatePath} from 'next/cache';

export async function updateUserName(newName: string) {
  const supabase = createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();
  if (!user) {
    return {error: 'You must be logged in to update your name.'};
  }

  if (!newName || newName.trim().length === 0) {
    return {error: 'Name cannot be empty.'};
  }

  const {error} = await supabase
    .from('profiles')
    .update({name: newName.trim()})
    .eq('id', user.id);

  if (error) {
    console.error('Error updating name:', error);
    return {error: 'Could not update your name. Please try again.'};
  }

  // Revalidate paths to reflect the change immediately.
  revalidatePath('/settings');
  revalidatePath('/home');
  revalidatePath('/leaderboard');
  revalidatePath('/profile');

  return {success: true};
}
