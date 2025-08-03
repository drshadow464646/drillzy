
export type Category = 'builder' | 'creator' | 'thinker' | 'connector';

export interface Skill {
  id: string;
  text: string;
  category: Category;
}

export interface TodaySkill {
  date: string;
  skillId: string;
  completed: boolean;
}

export interface WeeklyProgressItem {
    date: string;
    completed: number;
}

export interface CategoryCounts {
    thinker: number;
    builder: number;
    creator: number;
    connector: number;
}

export interface CumulativeGrowthItem {
    date: string;
    total: number;
}

export interface UserData {
  id: string;
  name:string;
  category: Category | null;
  streakCount: number;
  todaySkill: TodaySkill | null;
  weeklyProgress: WeeklyProgressItem[];
  categoryCounts: CategoryCounts;
  cumulativeGrowth: CumulativeGrowthItem[];
  seenSkillIds: string[];
}

export interface SurveyQuestion {
  id: number;
  text: string;
  options: {
    text: string;
  }[];
}

export type SurveyAnswer = { question: string, answer: string };
