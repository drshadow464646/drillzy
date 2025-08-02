/**
 * @fileoverview This file initializes the Genkit AI plugin and exports the `ai` object.
 */
'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // The Gemini 1.5 Flash model is a good default for text-only tasks.
      // It's fast, cheap, and has a large context window.
      model: 'gemini-1.5-flash-preview-0514',
    }),
  ],
  // Log to the console in a development environment.
  logSinks: [console.log],
  // Our prompt templates will be stored in the prompts folder.
  promptSources: ['./prompts/*'],
});
