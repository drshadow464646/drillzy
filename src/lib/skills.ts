import type { Skill, SurveyQuestion } from './types';

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

export const allSkills: Skill[] = [
  { id: 'skill_001', text: 'Write a one-minute journal entry about your day.' },
  { id: 'skill_002', text: 'Organize one drawer or shelf.' },
  { id: 'skill_003', text: 'Break down a large task into 3 smaller steps.' },
  { id: 'skill_004', text: 'Fix one small thing in your home that is broken.' },
  { id: 'skill_005', text: 'Follow a new recipe to cook a meal.' },
  { id: 'skill_006', text: 'Take a photo of something ordinary and make it look interesting.' },
  { id: 'skill_007', text: 'Write a six-word story.' },
  { id: 'skill_008', text: 'Doodle for 5 minutes without a specific goal.' },
  { id: 'skill_009', text: 'Come up with a new use for a common object like a paperclip.' },
  { id: 'skill_010', text: 'Practice explaining a complex idea simply.' },
  { id: 'skill_011', text: 'Read an article about a topic you know nothing about.' },
  { id: 'skill_012', text: 'Spend 5 minutes questioning one of your own assumptions.' },
  { id: 'skill_013', text: 'Watch a documentary on a historical event.' },
  { id: 'skill_014', text: 'Learn one new word and its definition.' },
  { id: 'skill_015', text: 'Identify the logical fallacies in a news editorial.' },
  { id: 'skill_016', text: 'Send a thoughtful message to a friend you haven\'t spoken to in a while.' },
  { id: 'skill_017', text: 'Introduce two people you think should know each other.' },
  { id: 'skill_018', text: 'Practice active listening in your next conversation.' },
  { id: 'skill_019', text: 'Write a positive comment on a social media post.' },
  { id: 'skill_020', text: 'Ask someone a question about their passion.' },
];

export function getSkillById(id: string): Skill | undefined {
  return allSkills.find(skill => skill.id === id);
}

export function getNewSkill(seenIds: string[]): Skill | null {
  const availableSkills = allSkills.filter(
    (skill) => !seenIds.includes(skill.id)
  );

  if (availableSkills.length === 0) {
    return null; // All skills for this category have been seen
  }

  const randomIndex = Math.floor(Math.random() * availableSkills.length);
  return availableSkills[randomIndex];
}
