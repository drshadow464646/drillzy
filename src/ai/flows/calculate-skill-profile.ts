/**
 * @fileOverview A Genkit flow that determines a user's skill category based on survey answers.
 *
 * - calculateSkillProfile - Analyzes survey responses to categorize a user.
 * - ProfileAnalysisInput - The input type for the calculateSkillProfile flow.
 * - ProfileAnalysisOutput - The return type for the calculateSkillProfile flow.
 */
'use server';

import {ai} from '@/ai/genkit';
import type {Category, SurveyAnswer} from '@/lib/types';
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
    .describe('A brief explanation for why the category was chosen.'),
});
export type ProfileAnalysisOutput = z.infer<
  typeof ProfileAnalysisOutputSchema
>;

// Define the prompt for the AI model.
const profileAnalysisPrompt = ai.definePrompt({
  name: 'profileAnalysisPrompt',
  input: {schema: ProfileAnalysisInputSchema},
  output: {schema: ProfileAnalysisOutputSchema},
  prompt: `
    You are an expert career and personality coach.
    Based on the following questions and answers from a user's survey, determine which of the four categories they fall into:

    - Thinker: Analytical, loves data, strategy, and understanding complex systems.
    - Builder: Likes to create tangible things, work with tools, and see concrete results.
    - Creator: Enjoys originality, art, brainstorming, and expressing new ideas.
    - Connector: Skilled at networking, communication, and bringing people together.

    Analyze the user's responses and choose the single best-fit category for them. Provide a brief reasoning for your choice.

    User's Survey Answers:
    {{#each answers}}
    - Question: {{question}}
      Answer: {{answer}}
    {{/each}}
  `,
});

// Define the flow that uses the prompt.
const calculateSkillProfileFlow = ai.defineFlow(
  {
    name: 'calculateSkillProfileFlow',
    inputSchema: ProfileAnalysisInputSchema,
    outputSchema: ProfileAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await profileAnalysisPrompt(input);
    return output!;
  }
);

// Define the exported function that the application will call.
export async function calculateSkillProfile(
  answers: SurveyAnswer[]
): Promise<ProfileAnalysisOutput> {
  return calculateSkillProfileFlow({answers});
}
