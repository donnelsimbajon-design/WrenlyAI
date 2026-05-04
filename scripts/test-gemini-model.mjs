import OpenAI from 'openai';
import { readFileSync } from 'fs';

const env = readFileSync('.env', 'utf8');
const getVar = (key) => { const m = env.match(new RegExp(`^${key}=(.+)$`, 'm')); return m ? m[1].trim() : null; };
const apiKey = getVar('EXPO_PUBLIC_WRENLY_AI_GEMMA_KEY');

const client = new OpenAI({
  apiKey,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

async function run() {
  try {
    const response = await client.chat.completions.create({
      model: 'gemini-1.5-flash',
      messages: [{ role: 'user', content: 'Hello' }]
    });
    console.log('Success (gemini-1.5-flash):', response.choices[0].message.content);
  } catch (e) {
    console.error('Error (gemini-1.5-flash):', e.message);
  }

  try {
    const response2 = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello' }]
    });
    console.log('Success (gpt-4o):', response2.choices[0].message.content);
  } catch (e) {
    console.error('Error (gpt-4o):', e.message);
  }
}
run();
