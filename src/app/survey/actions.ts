
'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import type {Category, SurveyAnswer} from '@/lib/types';
import { surveyQuestions } from '@/lib/skills';

export async function submitSurvey(answers: SurveyAnswer[]): Promise<{ error?: string }> {
  const supabase = createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login?message=You must be logged in to take the survey.');
  }

  try {
    const categoryCounts: Record<Category, number> = {
      thinker: 0,
      builder: 0,
      creator: 0,
      connector: 0,
    };

    answers.forEach(answer => {
      const question = surveyQuestions.find(q => q.text === answer.question);
      const option = question?.options.find(o => o.text === answer.answer);
      if (option?.category) {
        categoryCounts[option.category]++;
      }
    });

    const determinedCategory = Object.keys(categoryCounts).reduce((a, b) =>
      categoryCounts[a as Category] > categoryCounts[b as Category] ? a : b
    ) as Category;

    const {error: profileError} = await supabase
      .from('profiles')
      .update({category: determinedCategory})
      .eq('id', user.id);

    if (profileError) throw profileError;

  } catch (error) {
    console.error('Error submitting survey:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    // This redirect won't work from a client component action, returning error instead
    return { error: `Failed to save profile: ${errorMessage}` };
  }

  revalidatePath('/', 'layout');
  redirect('/home');
}
