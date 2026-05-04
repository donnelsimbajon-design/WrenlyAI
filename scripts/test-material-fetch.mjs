import { readFileSync } from 'fs';
const env = readFileSync('.env', 'utf8');
const getVar = (key) => { const m = env.match(new RegExp(`^${key}=(.+)$`, 'm')); return m ? m[1].trim() : null; };
const ANON = getVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');
const URL   = getVar('EXPO_PUBLIC_SUPABASE_URL');

async function run() {
  const testRes = await fetch(
    `${URL}/rest/v1/materials?select=*,classrooms(name)&limit=1`,
    { headers: { 'apikey': ANON, 'Authorization': `Bearer ${ANON}` } }
  );
  const testData = await testRes.json();
  console.log(JSON.stringify(testData, null, 2));
}
run();
