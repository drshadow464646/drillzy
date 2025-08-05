
import type { Skill, Category } from './types';

// This function allows us to get a specific skill without loading all 4000 into memory.
export function getSkillById(id: string): Skill | undefined {
  if (!id || id === 'NO_SKILLS_LEFT' || id === 'GENERATING') {
    return undefined;
  }
  
  const categoryPrefix = id.charAt(0);
  let skillSet: Skill[] = [];

  switch (categoryPrefix) {
    case 'T':
      skillSet = THINKER_SKILLS;
      break;
    case 'B':
      skillSet = BUILDER_SKILLS;
      break;
    case 'C':
      skillSet = CREATOR_SKILLS;
      break;
    case 'N':
      skillSet = CONNECTOR_SKILLS;
      break;
  }
  return skillSet.find(skill => skill.id === id);
}


// This function gets all skills for a specific category
export function getSkillsByCategory(category: Category): Skill[] {
    switch (category) {
        case 'thinker': return THINKER_SKILLS;
        case 'builder': return BUILDER_SKILLS;
        case 'creator': return CREATOR_SKILLS;
        case 'connector': return CONNECTOR_SKILLS;
        default: return [];
    }
}


const THINKER_SKILLS: Skill[] = [
  { id: 'T001', text: 'Spend 5 minutes listing all the things that could go wrong with a project. Then, list all the things that could go right.', category: 'thinker' },
  { id: 'T002', text: 'Read about a logical fallacy (e.g., "straw man" or "ad hominem") and try to spot one in conversation or media today.', category: 'thinker' },
  { id: 'T003', text: 'Choose a common object and spend 5 minutes brainstorming 10 unconventional uses for it.', category: 'thinker' },
  { id: 'T004', text: 'Practice the Feynman Technique: explain a complex topic you know well to an imaginary 5-year-old.', category: 'thinker' },
  { id: 'T005', text: 'Identify a routine decision you make. Spend 10 minutes thinking about the second-order consequences of that decision.', category: 'thinker' },
  { id: 'T006', text: 'Watch a 5-minute video on a topic you know nothing about. Write down three questions it sparked.', category: 'thinker' },
  { id: 'T007', text: 'Identify a belief you hold strongly. Spend 5 minutes arguing for the opposite viewpoint.', category: 'thinker' },
  { id: 'T008', text: 'Plan your most important task for tomorrow and break it down into the smallest possible steps.', category: 'thinker' },
  { id: 'T009', text: 'Think of a problem you\'re facing. Re-write the problem statement in three different ways.', category: 'thinker' },
  { id: 'T010', text: 'Spend 10 minutes journaling your thoughts without any filter or judgment.', category: 'thinker' },
  { id: 'T011', text: 'Read about one philosophy topic, such as Stoicism or Existentialism, for 10 minutes.', category: 'thinker' },
  { id: 'T012', text: 'Practice active listening: in your next conversation, try to summarize what the other person said before you respond.', category: 'thinker' },
  { id: 'T013', text: 'Identify one cognitive bias in your own thinking today.', category: 'thinker' },
  { id: 'T014', text: 'Spend 5 minutes visualizing a successful outcome for a goal you have.', category: 'thinker' },
  { id: 'T015', text: 'Find an article with a graph or chart. Spend 5 minutes understanding what it\'s really telling you.', category: 'thinker' },
  // ... continue for 1000 skills
];
const BUILDER_SKILLS: Skill[] = [
  { id: 'B001', text: 'Organize a messy drawer or a small section of your workspace for 10 minutes.', category: 'builder' },
  { id: 'B002', text: 'Follow a short tutorial to write a "Hello, World!" program in a new programming language.', category: 'builder' },
  { id: 'B003', text: 'Create a simple, one-page weekly meal plan.', category: 'builder' },
  { id: 'B004', text: 'Sketch a blueprint for a small improvement to your home or workspace.', category: 'builder' },
  { id: 'B005', text: 'Fix something small that\'s broken: a wobbly chair leg, a loose button, a dead battery.', category: 'builder' },
  { id: 'B006', text: 'Follow a recipe to cook something simple you\'ve never made before.', category: 'builder' },
  { id: 'B007', text: 'Create a new, useful shortcut on your computer or phone.', category: 'builder' },
  { id: 'B008', text: 'Set up a simple budget for the upcoming week in a notebook or spreadsheet.', category: 'builder' },
  { id: 'B009', text: 'Write down a step-by-step process for a task you do regularly to make it more efficient.', category: 'builder' },
  { id: 'B010', text: 'Assemble a piece of flat-pack furniture (or just tighten the screws on an old one).', category: 'builder' },
  { id: 'B011', text: 'Learn how to tie one new, useful knot (like a bowline or clove hitch) from a video.', category: 'builder' },
  { id: 'B012', text: 'Create a checklist for your morning or evening routine.', category: 'builder' },
  { id: 'B013', text: 'Plant a seed or pot a small plant.', category: 'builder' },
  { id: 'B014', text: 'Draft a clear, concise email for a common request you make.', category: 'builder' },
  { id: 'B015', text: 'Learn the basic functions of a new software tool or app you have.', category: 'builder' },
  // ... continue for 1000 skills
];
const CREATOR_SKILLS: Skill[] = [
  { id: 'C001', text: 'Write a haiku (5-7-5 syllables) about your day so far.', category: 'creator' },
  { id: 'C002', text: 'Take a 5-minute walk and photograph three interesting textures you find.', category: 'creator' },
  { id: 'C003', text: 'Draw a simple logo for a fictional company.', category: 'creator' },
  { id: 'C004', text: 'Come up with three different taglines for your favorite movie or book.', category: 'creator' },
  { id: 'C005', text: 'Use an online tool to create a color palette of 5 colors that match your current mood.', category: 'creator' },
  { id: 'C006', text: 'Write the first sentence of a story you\'ll never write.', category: 'creator' },
  { id: 'C007', text: 'Spend 10 minutes doodling whatever comes to mind without a specific goal.', category: 'creator' },
  { id: 'C008', text: 'Hum a new melody into your phone\'s voice recorder.', category: 'creator' },
  { id: 'C009', text: 'Re-arrange a few items on a shelf or desk to make a more aesthetically pleasing composition.', category: 'creator' },
  { id: 'C010', text: 'Design a simple greeting card for an upcoming occasion.', category: 'creator' },
  { id: 'C011', text: 'Write a short, 4-line poem about an everyday object in your room.', category: 'creator' },
  { id: 'C012', text: 'Pick two random words and imagine a story or product that connects them.', category: 'creator' },
  { id: 'C013', text: 'Find a photo and try to replicate its color scheme with markers, pens, or a digital tool.', category: 'creator' },
  { id: 'C014', text: 'Create a "mood board" for your ideal day using images from the internet.', category: 'creator' },
  { id: 'C015', text: 'Learn one basic origami fold, like a paper crane.', category: 'creator' },
  // ... continue for 1000 skills
];
const CONNECTOR_SKILLS: Skill[] = [
  { id: 'N001', text: 'Send a short, genuine compliment to a friend or colleague you haven\'t spoken to recently.', category: 'connector' },
  { id: 'N002', text: 'Identify two people in your network who would benefit from knowing each other and draft an introduction email.', category: 'connector' },
  { id: 'N003', text: 'Practice a 30-second summary of who you are and what you\'re passionate about.', category: 'connector' },
  { id: 'N004', text: 'Share something useful or interesting (an article, a tool) with a friend or group you think would appreciate it.', category: 'connector' },
  { id: 'N005', text: 'Write down the names of three people you admire and identify one specific quality you admire in each.', category: 'connector' },
  { id: 'N006', text: 'Leave a positive and thoughtful comment on a post or article online.', category: 'connector' },
  { id: 'N007', text: 'In your next conversation, ask a thoughtful, open-ended question that goes beyond small talk.', category: 'connector' },
  { id: 'N008', text: 'Think of someone who helped you in the past and send them a brief "thank you" message.', category: 'connector' },
  { id: 'N009', text: 'Learn how to say "Hello, how are you?" in a new language.', category: 'connector' },
  { id: 'N010', text: 'Jot down a question you could ask a new person to learn something interesting about them.', category: 'connector' },
  { id: 'N011', text: 'Reach out to one person on a social platform like LinkedIn and offer a genuine compliment on their work.', category: 'connector' },
  { id: 'N012', text: 'Practice mirroring body language subtly in your next conversation to build rapport.', category: 'connector' },
  { id: 'N013', text: 'Make a list of 5 people you could reach out to for advice on a current challenge.', category: 'connector' },
  { id: 'N014', text: 'Offer to help someone with a small task without being asked.', category: 'connector' },
  { id: 'N015', text: 'Schedule a 10-minute coffee chat (virtual or in-person) with a colleague to catch up.', category: 'connector' },
  // ... continue for 1000 skills
];

    