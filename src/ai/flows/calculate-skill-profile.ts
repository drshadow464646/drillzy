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

const profileAnalysisPrompt = ai.definePrompt({
    name: 'profileAnalysisPrompt',
    input: { schema: ProfileAnalysisInputSchema },
    output: { schema: ProfileAnalysisOutputSchema },
    prompt: `
        You are an AI assistant for the app Drillzy, designed to help users build new skills.
        Your task is to analyze a user's answers to a 5-question survey and categorize them into one of four types: Thinker, Builder, Creator, or Connector.

        The categories are defined as follows:
        - **Thinker**: Analytical, loves to learn, breaks down problems.
        - **Builder**: Practical, enjoys making and fixing things, process-oriented.
        - **Creator**: Imaginative, artistic, comes up with original ideas.
        - **Connector**: Social, good at networking, brings people together.

        Analyze the following survey answers and determine the best-fitting category. Provide a short, menacing-yet-encouraging explanation for your choice, in the style of the Duolingo owl.

        Survey Answers:
        {{#each answers}}
        - Question: "{{question}}"
        - Answer: "{{answer}}"
        {{/each}}
    `,
});

const profileAnalysisFlow = ai.defineFlow(
    {
        name: 'profileAnalysisFlow',
        inputSchema: ProfileAnalysisInputSchema,
        outputSchema: ProfileAnalysisOutputSchema,
    },
    async (input) => {
        const { output } = await profileAnalysisPrompt(input);
        return output!;
    }
);


export async function calculateSkillProfile(
  answers: SurveyAnswer[]
): Promise<ProfileAnalysisOutput> {
  return await profileAnalysisFlow({ answers });
}
