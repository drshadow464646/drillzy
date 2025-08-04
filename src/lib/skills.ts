
import type { Category, Skill, SurveyQuestion } from './types';
import { getSkillByIdAction, getNewSkillAction } from '@/lib/actions';


export const surveyQuestions: SurveyQuestion[] = [
  {
    id: 1,
    text: 'When you face a challenge, what’s your first instinct?',
    options: [
      { text: 'Analyze it from all angles' },
      { text: 'Start building a solution' },
      { text: 'Brainstorm a wild idea' },
      { text: 'Ask others for their input' },
    ],
  },
  {
    id: 2,
    text: 'A friend is launching a project. How do you help?',
    options: [
      { text: 'Help them build the website' },
      { text: 'Design a cool logo for them' },
      { text: 'Connect them with potential users' },
      { text: 'Create a strategic plan' },
    ],
  },
  {
    id: 3,
    text: 'You have a free Saturday. What do you do?',
    options: [
      { text: 'Create a piece of art or music' },
      { text: 'Go to a networking event' },
      { text: 'Read a book on a complex topic' },
      { text: 'Work on a DIY project at home' },
    ],
  },
  {
    id: 4,
    text: 'What kind of compliment makes you feel most proud?',
    options: [
      { text: '"You bring people together so well!"' },
      { text: '"Your work is so practical and solid!"' },
      { text: '"That is such an original perspective!"' },
      { text: '"You understand things so deeply!"' },
    ],
  },
  {
    id: 5,
    text: 'Pick a tool you couldn’t live without.',
    options: [
      { text: 'A well-organized database' },
      { text: 'A blank canvas' },
      { text: 'A hammer and nails' },
      { text: 'A contact list' },
    ],
  },
];


export async function getSkillById(id: string): Promise<Skill | null> {
    return getSkillByIdAction(id);
}

export async function getNewSkill(seenIds: string[], userCategory?: Category): Promise<Skill | null> {
    return getNewSkillAction(seenIds, userCategory);
}
