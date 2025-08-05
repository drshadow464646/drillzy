
// This file is no longer in use for fetching skills.
// The skills have been moved to the Supabase database.
// You will need to create a 'skills' table and populate it with the data that was previously in this file.
// See the project's README or setup instructions for the SQL script to do this.

import type { Skill, Category } from './types';

// This function is now deprecated.
export function getSkillById(id: string): Skill | undefined {
  console.warn("getSkillById is deprecated. Skills are now fetched from the database.");
  return undefined;
}

// This function is now deprecated.
export function getSkillsByCategory(category: Category): Skill[] {
    console.warn("getSkillsByCategory is deprecated. Skills are now fetched from the database.");
    return [];
}
