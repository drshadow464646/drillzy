
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function requestPasswordReset(formData: FormData) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const email = formData.get('email') as string;
  const origin = headers().get('origin');

  if (!email) {
    return { error: 'Please provide your email address.' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    console.error('Password Reset Error:', error);
    return { error: "Could not send password reset email. Please try again." };
  }

  return { error: null };
}
