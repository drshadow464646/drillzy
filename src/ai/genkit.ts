/**
 * @fileoverview This file initializes the Genkit AI plugin and exports the `ai` object.
 */
'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-ai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  // Log to the console in a development environment.
  logSinks: [console.log],
  // Our prompt templates will be stored in the prompts folder.
  promptSources: ['./prompts/*'],
});
