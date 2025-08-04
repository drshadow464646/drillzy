'use server';

import type { Category, Skill } from '@/lib/types';
import { allSkills } from '@/lib/skillsData';

export async function getSkillByIdAction(id: string): Promise<Skill | null> {
  const skill = allSkills.find(s => s.id === id);
  return skill || null;
}

export async function getNewSkillAction(
  seenIds: string[],
  userCategory?: Category
): Promise<Skill | null> {
  // Filter out skills that have already been seen
  const unseenSkills = allSkills.filter(skill => !seenIds.includes(skill.id));

  let availableSkills = unseenSkills;

  // If a user category is provided, try to find a skill in that category first
  if (userCategory) {
    const categorizedSkills = unseenSkills.filter(skill => skill.category === userCategory);
    if (categorizedSkills.length > 0) {
      availableSkills = categorizedSkills;
    }
  }

  // If there are no available skills (either in the category or at all), return null
  if (availableSkills.length === 0) {
    return null;
  }

  // Return a random skill from the available list
  const randomIndex = Math.floor(Math.random() * availableSkills.length);
  return availableSkills[randomIndex];
}
