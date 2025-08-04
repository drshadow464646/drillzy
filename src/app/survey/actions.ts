
'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import type {SurveyAnswer} from '@/lib/types';
import {calculateSkillProfile} from '@/ai/flows/calculate-skill-profile';

export async function submitSurvey(answers: SurveyAnswer[]) {
  const supabase = createClient();

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


export async function* getProfileAnalysis(answers: SurveyAnswer[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      // In a real app, you'd handle this more gracefully.
      // For a stream, we can't redirect, so we'll send an error object.
      yield { error: 'User not authenticated' };
      return;
  }

  try {
      let finalResponse: any = null;

      await calculateSkillProfile(answers, (reasoningChunk) => {
          // This is a server-side callback. We can't yield from here.
          // We would need a different mechanism to stream this to the client.
          // For now, let's just demonstrate the concept.
          // In a real implementation, you'd use a pub/sub or websocket.
      });
      
      const response = await calculateSkillProfile(answers);
      finalResponse = response;


      const { error: profileError } = await supabase
          .from('profiles')
          .update({ category: finalResponse.category })
          .eq('id', user.id);

      if (profileError) {
          throw profileError;
      }
      
      yield { reasoning: finalResponse.reasoning, category: finalResponse.category, done: true };
      
  } catch (error) {
      console.error('Error in getProfileAnalysis stream:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      yield { error: `Failed to analyze profile: ${errorMessage}` };
  }
}
