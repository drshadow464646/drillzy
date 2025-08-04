
import type { SurveyQuestion } from './types';

export const surveyQuestions: SurveyQuestion[] = [
  {
    id: 1,
    text: 'When you face a challenge, what’s your first instinct?',
    options: [
      { text: 'Analyze it from all angles', category: 'thinker' },
      { text: 'Start building a solution', category: 'builder' },
      { text: 'Brainstorm a wild idea', category: 'creator' },
      { text: 'Ask others for their input', category: 'connector' },
    ],
  },
  {
    id: 2,
    text: 'A friend is launching a project. How do you help?',
    options: [
      { text: 'Help them build the website', category: 'builder' },
      { text: 'Design a cool logo for them', category: 'creator' },
      { text: 'Connect them with potential users', category: 'connector' },
      { text: 'Create a strategic plan', category: 'thinker' },
    ],
  },
  {
    id: 3,
    text: 'You have a free Saturday. What do you do?',
    options: [
      { text: 'Create a piece of art or music', category: 'creator' },
      { text: 'Go to a networking event', category: 'connector' },
      { text: 'Read a book on a complex topic', category: 'thinker' },
      { text: 'Work on a DIY project at home', category: 'builder' },
    ],
  },
  {
    id: 4,
    text: 'What kind of compliment makes you feel most proud?',
    options: [
      { text: '"You bring people together so well!"', category: 'connector' },
      { text: '"Your work is so practical and solid!"', category: 'builder' },
      { text: '"That is such an original perspective!"', category: 'creator' },
      { text: '"You understand things so deeply!"', category: 'thinker' },
    ],
  },
  {
    id: 5,
    text: 'Pick a tool you couldn’t live without.',
    options: [
      { text: 'A well-organized database', category: 'thinker' },
      { text: 'A blank canvas', category: 'creator' },
      { text: 'A hammer and nails', category: 'builder' },
      { text: 'A contact list', category: 'connector' },
    ],
  },
];
