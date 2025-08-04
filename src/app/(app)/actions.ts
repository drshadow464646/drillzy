'use server';

import {createClient} from '@/lib/supabase/server';
import type {Category, Skill} from '@/lib/types';

export async function getSkillByIdAction(id: string): Promise<Skill | null> {
  const supabase = createClient();
  const {data, error} = await supabase
    .from('skills')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching skill by id ${id}:`, error);
    return null;
  }
  return data;
}

export async function getNewSkillAction(
  seenIds: string[],
  userCategory?: Category
): Promise<Skill | null> {
  const supabase = createClient();

  let query = supabase.from('skills').select('*');

  if (seenIds.length > 0) {
    query = query.not('id', 'in', `(${seenIds.join(',')})`);
  }

  if (userCategory) {
    query = query.eq('category', userCategory);
  }

  const {data: availableSkills, error} = await query;

  if (error) {
    console.error('Error fetching new skill:', error);
    return null;
  }

  if (availableSkills.length === 0) {
    // If no skills are available in the user's category, try any skill they haven't seen.
    const {data: anyAvailableSkills, error: anyError} = await supabase
      .from('skills')
      .select('*')
      .not('id', 'in', `(${seenIds.join(',')})`);

    if (anyError || !anyAvailableSkills || anyAvailableSkills.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * anyAvailableSkills.length);
    return anyAvailableSkills[randomIndex];
  }

  const randomIndex = Math.floor(Math.random() * availableSkills.length);
  return availableSkills[randomIndex];
}
