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

// Placeholder function until a reliable model integration is confirmed.
const calculateSkillProfilePlaceholder = async (
    answers: SurveyAnswer[]
  ): Promise<ProfileAnalysisOutput> => {
    // This is a simple heuristic-based placeholder.
    // It can be replaced with a real AI call when the integration is ready.
    const categoryCounts: Record<string, number> = {
      thinker: 0,
      builder: 0,
      creator: 0,
      connector: 0,
    };
  
    answers.forEach(a => {
      if (a.question.includes('challenge')) {
        if (a.answer.includes('Analyze')) categoryCounts.thinker++;
        if (a.answer.includes('building')) categoryCounts.builder++;
        if (a.answer.includes('Brainstorm')) categoryCounts.creator++;
        if (a.answer.includes('Ask others')) categoryCounts.connector++;
      } else if (a.question.includes('project')) {
        if (a.answer.includes('website')) categoryCounts.builder++;
        if (a.answer.includes('logo')) categoryCounts.creator++;
        if (a.answer.includes('Connect them')) categoryCounts.connector++;
        if (a.answer.includes('strategic plan')) categoryCounts.thinker++;
      } else if (a.question.includes('Saturday')) {
        if (a.answer.includes('art')) categoryCounts.creator++;
        if (a.answer.includes('networking')) categoryCounts.connector++;
        if (a.answer.includes('book')) categoryCounts.thinker++;
        if (a.answer.includes('DIY project')) categoryCounts.builder++;
      } else if (a.question.includes('compliment')) {
        if (a.answer.includes('bring people together')) categoryCounts.connector++;
        if (a.answer.includes('practical and solid')) categoryCounts.builder++;
        if (a.answer.includes('original perspective')) categoryCounts.creator++;
        if (a.answer.includes('understand things so deeply')) categoryCounts.thinker++;
      } else if (a.question.includes('tool')) {
        if (a.answer.includes('database')) categoryCounts.thinker++;
        if (a.answer.includes('canvas')) categoryCounts.creator++;
        if (a.answer.includes('hammer')) categoryCounts.builder++;
        if (a.answer.includes('contact list')) categoryCounts.connector++;
      }
    });
  
    const determinedCategory = Object.keys(categoryCounts).reduce((a, b) =>
      categoryCounts[a] > categoryCounts[b] ? a : b
    ) as 'thinker' | 'builder' | 'creator' | 'connector';
  
    return {
      category: determinedCategory,
      reasoning:
        'I have analyzed your responses and this is the only logical conclusion. Now, get to work.',
    };
};

export async function calculateSkillProfile(
  answers: SurveyAnswer[]
): Promise<ProfileAnalysisOutput> {
  // Using the placeholder function for now.
  return calculateSkillProfilePlaceholder(answers);
}