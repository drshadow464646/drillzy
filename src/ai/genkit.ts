// /**
//  * @fileoverview This file initializes the Genkit AI plugin and exports the `ai` object.
//  */
// 'use server';
//
// import {genkit} from 'genkit';
// import {defineModel} from 'genkit-plugin-openrouter';
//
// export const ai = genkit({
//   plugins: [
//     defineModel(
//         {
//           name: 'google/gemini-pro',
//           label: 'Google - Gemini Pro',
//           family: 'Gemini',
//           description: 'A Google powerhouse',
//           capabilities: {
//             media: false,
//             web: false,
//             tools: false,
//             output: ['text'],
//             multiturn: true,
//           },
//         },
//         {
//           apiKey: process.env.OPENROUTER_API_KEY,
//         }
//       ),
//   ],
//   // Log to the console in a development environment.
//   logSinks: [console.log],
//   // Our prompt templates will be stored in the prompts folder.
//   promptSources: ['./prompts/*'],
// });
