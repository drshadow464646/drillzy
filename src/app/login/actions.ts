
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

  const {error} = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {name},
    },
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      return redirect('/login?message=User already registered. Please log in.');
    }
    return redirect('/login?message=Could not create user. Please try again.');
  }

  revalidatePath('/', 'layout');
  return redirect(
    '/login?message=Check your email to complete the signup process'
  );
}
