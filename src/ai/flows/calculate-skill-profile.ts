
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
    .describe('A brief, menacing yet encouraging explanation for why the category was chosen, in the style of the Duolingo owl.'),
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

export async function calculateSkillProfile(
  answers: SurveyAnswer[],
  // An optional callback function to stream the reasoning as it's generated.
  onReasoningChunk?: (chunk: string) => void
): Promise<ProfileAnalysisOutput> {
  const {stream, response} = ai.generateStream({
    prompt: skillProfilePrompt,
    input: {answers},
    streaming: true,
  });

  // Stream the reasoning chunks to the callback.
  if (onReasoningChunk) {
    for await (const chunk of stream) {
      const reasoning = chunk.output?.reasoning;
      if (reasoning) {
        onReasoningChunk(reasoning);
      }
    }
  }

  // Wait for the full response to be generated and return it.
  const result = await response;
  return result.output!;
}
