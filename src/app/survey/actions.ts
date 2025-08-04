
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


export async function* getProfileAnalysis(answers: SurveyAnswer[]): AsyncGenerator<any> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      yield { error: 'User not authenticated' };
      return;
  }

  try {
    const { stream, response } = ai.generateStream({
        prompt: skillProfilePrompt,
        input: { answers },
        streaming: true,
    });

    let reasoning = '';
    for await (const chunk of stream) {
        const partial = chunk.output?.reasoning;
        if (partial) {
            reasoning = partial;
            yield { reasoning };
        }
    }

    const finalResponse = await response;
    const category = finalResponse.output?.category;
    
    if (category) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ category })
            .eq('id', user.id);

        if (profileError) {
            throw profileError;
        }
        
        yield { reasoning, category, done: true };
    } else {
        throw new Error("Could not determine user category.");
    }
      
  } catch (error) {
      console.error('Error in getProfileAnalysis stream:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      yield { error: `Failed to analyze profile: ${errorMessage}` };
  }
}
