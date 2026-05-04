import OpenAI from 'openai';

// Using Google Gemini API compatible with OpenAI SDK
const apiKey = process.env.EXPO_PUBLIC_WRENLY_AI_GEMMA_KEY || '';

export const openaiClient = new OpenAI({
  apiKey,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  dangerouslyAllowBrowser: true, // Needed for React Native/Expo
});
