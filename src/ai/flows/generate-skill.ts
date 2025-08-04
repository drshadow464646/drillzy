/**
 * @fileOverview A Genkit flow that generates a new skill for a user.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {defineFlow} from 'genkit';

const GenerateSkillInputSchema = z.object({
  category: z.enum(['thinker', 'builder', 'creator', 'connector']),
  history: z.array(z.string()).optional(),
});
type GenerateSkillInput = z.infer<typeof GenerateSkillInputSchema>;

const GenerateSkillOutputSchema = z.object({
  skill: z.string().describe('The new skill text.'),
});
type GenerateSkillOutput = z.infer<typeof GenerateSkillOutputSchema>;

const PROMPT = `
You are an AI assistant for a mobile app that helps users build skills.
Your task is to generate a new, unique, and actionable micro-skill for a user based on their category.

The user's category is: {category}

The user has already completed the following skills:
{history}

Please generate a new skill that is:
- Relevant to the user's category.
- A micro-skill that can be completed in 15-20 minutes.
- Actionable and specific.
- Not a repeat of a skill they have already completed.

Provide only the skill text in your response.
`;

export const generateSkill = defineFlow(
  {
    name: 'generateSkill',
    inputSchema: GenerateSkillInputSchema,
    outputSchema: GenerateSkillOutputSchema,
  },
  async (input: GenerateSkillInput) => {
    const response = await ai.generate({
      prompt: PROMPT,
      model: 'z-ai/glm-4.5-air:free',
      variables: {
        category: input.category,
        history: input.history?.join(', ') || 'None',
      },
    });

    return {
      skill: response.text(),
    };
  }
);
