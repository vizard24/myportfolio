import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure API key is available
const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ Google AI API key not found. Please set GOOGLE_API_KEY or GEMINI_API_KEY environment variable.');
  throw new Error('Google AI API key is required');
}

export const ai = genkit({
  plugins: [googleAI({
    apiKey: apiKey
  })],
  model: 'googleai/gemini-2.0-flash',
});
