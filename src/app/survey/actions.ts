'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import type {SurveyAnswer} from '@/lib/types';
import {calculateSkillProfile} from '@/ai/flows/calculate-skill-profile';

export async function submitSurvey(answers: SurveyAnswer[]) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const {
    data: {user},
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?message=You must be logged in to take the survey.');
  }

  try {
    const {category} = await calculateSkillProfile(answers);

    const {error: profileError} = await supabase
      .from('profiles')
      .update({category: category})
      .eq('id', user.id);
    if (profileError) throw profileError;
  } catch (error) {
    console.error('Error submitting survey:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return redirect(
      `/survey?message=Failed to save profile: ${errorMessage}`
    );
  }

  revalidatePath('/', 'layout');
  redirect('/home');
}
