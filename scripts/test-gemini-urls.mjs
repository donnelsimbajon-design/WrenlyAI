import OpenAI from 'openai';
import { readFileSync } from 'fs';

const env = readFileSync('.env', 'utf8');
const getVar = (key) => { const m = env.match(new RegExp(`^${key}=(.+)$`, 'm')); return m ? m[1].trim() : null; };
const apiKey = getVar('EXPO_PUBLIC_WRENLY_AI_GEMMA_KEY') || getVar('Wrenly_ai_gemma_key');

async function test(url) {
  const client = new OpenAI({ apiKey, baseURL: url });
  try {
    const response = await client.chat.completions.create({
      model: 'gemini-1.5-flash',
      messages: [{ role: 'user', content: 'Hello' }]
    });
    console.log('Success for', url);
  } catch (e) {
    console.error('Error for', url, ':', e.status, e.message);
  }
}

async function run() {
  await test('https://generativelanguage.googleapis.com/v1beta/openai/');
  await test('https://generativelanguage.googleapis.com/v1beta/openai');
  await test('https://generativelanguage.googleapis.com/v1beta/');
}
run();
