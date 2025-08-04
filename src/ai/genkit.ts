/**
 * @fileoverview This file initializes the Genkit AI plugin and exports the `ai` object.
 */
'use server';

import {genkit} from 'genkit';
import {defineModel} from 'genkit-plugin-openrouter';

export const ai = genkit({
  plugins: [
    defineModel(
        {
          name: 'z-ai/glm-4.5-air:free',
          label: 'Z-AI - GLM 4.5 Air',
          family: 'GLM',
          description: 'A Z-AI powerhouse',
          capabilities: {
            media: false,
            web: false,
            tools: false,
            output: ['text'],
            multiturn: true,
          },
        },
        {
          apiKey: process.env.OPENROUTER_API_KEY,
        }
    ),
    defineModel(
        {
            name: 'moonshotai/kimi-k2:free',
            label: 'Moonshot AI - Kimi K2',
            family: 'Kimi',
            description: 'A Moonshot AI powerhouse',
            capabilities: {
                media: false,
                web: false,
                tools: false,
                output: ['text'],
                multiturn: true,
            },
        },
        {
            apiKey: process.env.OPENROUTER_API_KEY,
        }
    ),
  ],
  // Log to the console in a development environment.
  logSinks: [console.log],
  // Our prompt templates will be stored in the prompts folder.
  promptSources: ['./prompts/*'],
});
