
export type Category = 'builder' | 'creator' | 'thinker' | 'connector';

export type SystemSkillId = 'GENERATING' | 'NO_SKILLS_LEFT';

export interface Skill {
  id: string;
  text: string;
  category: Category;
}

export interface SkillHistoryItem {
  user_id: string;
  date: string; // YYYY-MM-DD
  skill_id: string | SystemSkillId;
  completed: boolean;
  // This is the crucial change.
  // The 'skill' property can now hold the full Skill object from the 'skills' table.
  skill?: Skill | null;
}

export interface UserData {
  id: string;
  name: string;
  category: Category | null;
  skillHistory: SkillHistoryItem[];
  streakCount: number;
}

export interface SurveyQuestion {
  id: number;
  text: string;
  options: {
    text: string;
    category: Category;
  }[];
}

export type SurveyAnswer = { question: string, answer: string };
