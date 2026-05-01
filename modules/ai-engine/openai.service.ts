import OpenAI from 'openai';

// Ideally, this should be set in .env.local or handled via a backend proxy for security in a real app.
const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'sk-dummy-key-for-local-dev';

export const openaiClient = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true, // Needed for React Native/Expo, though a backend proxy is recommended
});
