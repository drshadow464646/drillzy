
'use server';
/**
 * @fileOverview A flow for generating a new daily skill for a user.
 *
 * - generateSkill - A function that generates a new skill.
 * - GenerateSkillInput - The input type for the generateSkill function.
 * - GenerateSkillOutput - The return type for the generateSkill function.
 */

// THIS FILE IS NO LONGER IN USE AND WILL BE REMOVED IN A FUTURE UPDATE.
// The app now uses a pre-defined list of skills from /src/lib/skills-data.ts

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {Category} from '@/lib/types';

const GenerateSkillInputSchema = z.object({
  category: z.string().describe('The skill category for the user.'),
  existingSkills: z
    .array(z.string())
    .describe('A list of skills the user has already completed.'),
});
export type GenerateSkillInput = z.infer<typeof GenerateSkillInputSchema>;

const GenerateSkillOutputSchema = z.object({
  text: z
    .string()
    .describe('A new, unique, and actionable micro-skill for the user.'),
});
export type GenerateSkillOutput = z.infer<typeof GenerateSkillOutputSchema>;

const generateSkillPrompt = ai.definePrompt({
  name: 'generateSkillPrompt',
  input: {schema: GenerateSkillInputSchema},
  output: {schema: GenerateSkillOutputSchema},
  prompt: `You are a world-class coach specializing in personal development. Your goal is to provide a user with a new, actionable "micro-skill" every day.

The user's skill archetype is '{{category}}'.

Here are the skills the user has already been given or completed. You MUST NOT generate a skill that is substantially similar to any of these:
{{#if existingSkills}}
{{#each existingSkills}}
- {{{this}}}
{{/each}}
{{else}}
This is the user's first skill!
{{/if}}

Generate a new, unique, and actionable micro-skill that fits the user's '{{category}}' archetype.

The skill should be:
- A single, clear sentence.
- Actionable in 5-10 minutes.
- Not a question.
- Framed as a command (e.g., "Write...", "Practice...", "Identify...").
- Do not greet the user or add any conversational fluff. Only provide the skill text.`,
});

const generateSkillFlow = ai.defineFlow(
  {
    name: 'generateSkillFlow',
    inputSchema: GenerateSkillInputSchema,
    outputSchema: GenerateSkillOutputSchema,
  },
  async input => {
    const {output} = await generateSkillPrompt(input, {
      config: {
        maxOutputTokens: 50,
        temperature: 1.2,
      },
    });

    return output!;
  }
);

export async function generateSkill(
  input: GenerateSkillInput
): Promise<GenerateSkillOutput> {
  return generateSkillFlow(input);
}
