/**
 * @fileoverview This file initializes the Genkit AI plugin and exports the `ai` object.
 */
'use server';

import {genkit} from 'genkit';
import {openRouter} from 'genkitx-openrouter';

export const ai = genkit({
  plugins: [
    // The OpenRouter plugin is removed for now to fix the build.
    // We will find the correct package and add it back.
  ],
  // Log to the console in a development environment.
  logSinks: [console.log],
  // Our prompt templates will be stored in the prompts folder.
  promptSources: ['./prompts/*'],
});
