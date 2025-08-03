
export type Category = 'builder' | 'creator' | 'thinker' | 'connector';

export interface Skill {
  id: string;
  text: string;
  category: Category;
}

export interface SkillHistoryItem {
  date: string; // YYYY-MM-DD
  skill: Skill;
  completed: boolean;
}

export interface UserData {
  id: string;
  name:string;
  category: Category | null;
  skillHistory: SkillHistoryItem[];
  streakCount: number;
}

export interface SurveyQuestion {
  id: number;
  text: string;
  options: {
    text: string;
  }[];
}

export type SurveyAnswer = { question: string, answer: string };
