
/**
 * @fileOverview A Genkit flow that determines a user's skill category based on survey answers.
 *
 * - calculateSkillProfile - Analyzes survey responses to categorize a user.
 * - ProfileAnalysisInput - The input type for the calculateSkillProfile flow.
 * - ProfileAnalysisOutput - The return type for the calculateSkillProfile flow.
 */
'use server';

import {ai} from '@/ai/genkit';
import type {SurveyAnswer} from '@/lib/types';
import {defineFlow, definePrompt} from 'genkit';
import {z} from 'zod';

const ProfileAnalysisInputSchema = z.object({
  answers: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
});
export type ProfileAnalysisInput = z.infer<typeof ProfileAnalysisInputSchema>;

const ProfileAnalysisOutputSchema = z.object({
  category: z
    .enum(['thinker', 'builder', 'creator', 'connector'])
    .describe(
      'The category that best fits the user based on their answers.'
    ),
  reasoning: z
    .string()
    .describe('A brief, menacing yet encouraging explanation for why the category was chosen, in the style of Duolingo.'),
});
export type ProfileAnalysisOutput = z.infer<
  typeof ProfileAnalysisOutputSchema
>;

const skillProfilePrompt = ai.definePrompt({
  name: 'skillProfilePrompt',
  input: {schema: ProfileAnalysisInputSchema},
  output: {schema: ProfileAnalysisOutputSchema},
  prompt: `
You are a career coach bot that helps users determine their primary skill category based on their answers to a short survey. The categories are:
- **Thinker**: Analytical, strategic, enjoys understanding complex systems.
- **Builder**: Enjoys creating tangible things, working with their hands, and seeing concrete results.
- **Creator**: Artistic, imaginative, enjoys expressing new ideas.
- **Connector**: Social, empathetic, enjoys building relationships and communities.

Analyze the following survey answers and determine the single best-fit category for the user. Provide a brief, menacing yet encouraging explanation for your choice, in the style of the Duolingo owl.

Survey Answers:
{{#each answers}}
- Question: "{{question}}"
- Answer: "{{answer}}"
{{/each}}
`,
});

const calculateSkillProfileFlow = ai.defineFlow(
  {
    name: 'calculateSkillProfileFlow',
    inputSchema: ProfileAnalysisInputSchema,
    outputSchema: ProfileAnalysisOutputSchema,
  },
  async ({answers}) => {
    const {output} = await skillProfilePrompt({answers});
    return output!;
  }
);

export async function calculateSkillProfile(
  answers: SurveyAnswer[]
): Promise<ProfileAnalysisOutput> {
  return calculateSkillProfileFlow({answers});
}
