/**
 * @fileOverview A Genkit flow that determines a user's skill category based on survey answers.
 *
 * - calculateSkillProfile - Analyzes survey responses to categorize a user.
 * - ProfileAnalysisInput - The input type for the calculateSkillProfile flow.
 * - ProfileAnalysisOutput - The return type for the calculateSkillProfile flow.
 */
'use server';

import type {SurveyAnswer} from '@/lib/types';
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

import {ai} from '@/ai/genkit';
import {defineFlow} from 'genkit';

const PROMPT = `
You are an AI assistant for a mobile app that helps users build skills.
Your task is to analyze a user's answers to a survey and determine which of the four categories they fall into: thinker, builder, creator, or connector.

Here are the user's answers:
{answers}

Based on these answers, determine the user's category and provide a brief, menacing yet encouraging explanation for why the category was chosen, in the style of Duolingo.

Your output should be a JSON object with two keys: "category" and "reasoning".
`;

export const calculateSkillProfile = defineFlow(
  {
    name: 'calculateSkillProfile',
    inputSchema: ProfileAnalysisInputSchema,
    outputSchema: ProfileAnalysisOutputSchema,
  },
  async (input: ProfileAnalysisInput) => {
    const response = await ai.generate({
      prompt: PROMPT,
      model: 'z-ai/glm-4.5-air:free',
      variables: {
        answers: JSON.stringify(input.answers),
      },
    });

    const result = response.output();
    if (typeof result !== 'object' || result === null) {
      throw new Error('Unexpected AI output format');
    }
    return result as ProfileAnalysisOutput;
  }
);