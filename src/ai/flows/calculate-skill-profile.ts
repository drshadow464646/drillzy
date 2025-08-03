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
    .describe('A brief, menacing yet encouraging explanation for why the category was chosen, in the style of Duolingo.'),
});
export type ProfileAnalysisOutput = z.infer<
  typeof ProfileAnalysisOutputSchema
>;

// Define the exported function that the application will call.
// This is now a placeholder that returns a random category.
export async function calculateSkillProfile(
  answers: SurveyAnswer[]
): Promise<ProfileAnalysisOutput> {
  // Placeholder logic since the AI model is disabled.
  const categories: Category[] = ['thinker', 'builder', 'creator', 'connector'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  return Promise.resolve({
    category: randomCategory,
    reasoning: "The AI is currently taking a nap. We've assigned you a category for now. Don't worry, we're watching."
  });
}
