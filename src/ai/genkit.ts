/**
 * @fileoverview This file initializes the Genkit AI plugin and exports the `ai` object.
 */
'use server';

import {genkit} from 'genkit';
import {openAI} from '@genkit-ai/compat-oai/openai';

export const ai = genkit({
  plugins: [
    openAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    }),
  ],
  // Log to the console in a development environment.
  logSinks: [console.log],
  // Our prompt templates will be stored in the prompts folder.
  promptSources: ['./prompts/*'],
});
