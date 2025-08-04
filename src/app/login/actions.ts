
'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function login(formData: FormData) {
  const supabase = createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const {error} = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect('/login?message=Invalid credentials');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const origin = headers().get('origin');
  
  const emailRedirectTo = `${origin}/auth/callback`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: { name },
    },
  });

  // If there's an error, but it's the "User already registered" error,
  // we still want to proceed as if it was a success. This allows users
  // who might have closed the browser to try signing up again and get the
  // verification email resent.
  if (error && !error.message.includes('User already registered')) {
    console.error('Signup Error:', error);
    return redirect('/login?message=Could not create user. Please try again.');
  }

  // Redirect to a page that tells the user to check their email.
  revalidatePath('/', 'layout');
  return redirect(
    '/login?message=Check your email to complete the signup process'
  );
}
