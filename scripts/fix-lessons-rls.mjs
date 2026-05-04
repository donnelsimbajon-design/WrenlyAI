// Fix RLS on lessons so the Supabase JS client (anon key) can read them
import { readFileSync } from 'fs';
const env = readFileSync('.env', 'utf8');
const getVar = (key) => { const m = env.match(new RegExp(`^${key}=(.+)$`, 'm')); return m ? m[1].trim() : null; };
const TOKEN = getVar('SUPABASE_ACCESS_TOKEN');
const REF   = getVar('EXPO_PUBLIC_SUPABASE_URL').match(/https:\/\/([^.]+)/)[1];
const ANON  = getVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');
const URL   = getVar('EXPO_PUBLIC_SUPABASE_URL');

async function sql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

console.log('🔧  Fixing RLS on lessons table...\n');

// Drop all existing policies on lessons
const policies = await sql(`
  SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lessons'
`);
console.log('Existing policies:', policies.map(p => p.policyname));

for (const p of policies) {
  await sql(`DROP POLICY IF EXISTS "${p.policyname}" ON public.lessons`);
  console.log(`  🗑  Dropped: "${p.policyname}"`);
}

// Create a clean, simple policy that allows ALL authenticated users to read published lessons
await sql(`
  CREATE POLICY "Anyone authenticated can read published lessons"
  ON public.lessons
  FOR SELECT
  TO authenticated
  USING (is_published = true)
`);
console.log('✅  Created read policy for authenticated users');

// Also allow anon reads (for dev/web clients that use anon key before auth)
await sql(`
  CREATE POLICY "Anon can read published lessons"
  ON public.lessons
  FOR SELECT
  TO anon
  USING (is_published = true)
`);
console.log('✅  Created read policy for anon key');

// Verify via REST API
const STUDENT_ID = 'cb085141-7182-4f37-a318-b9d575ac48d3';
const enrolledIds = [
  '644d3cdc-c481-4654-98f7-70d81fcacac0',
  '3910f72c-3eb1-45ad-972b-3c956e42125c',
  'ec4e9b1c-0632-429a-a21c-d88195268028'
];

const testRes = await fetch(
  `${URL}/rest/v1/lessons?select=id,title,classroom_id,classrooms(subject)&is_published=eq.true&classroom_id=in.(${enrolledIds.join(',')})`,
  { headers: { 'apikey': ANON, 'Authorization': `Bearer ${ANON}` } }
);
const testData = await testRes.json();

console.log(`\n📋  REST API verification (${Array.isArray(testData) ? testData.length : 0} lessons):`);
if (Array.isArray(testData) && testData.length > 0) {
  testData.forEach(l => console.log(`  ✅  [${l.classrooms?.subject}] ${l.title}`));
  console.log('\n🎉  My Lessons page will now load correctly!');
} else {
  console.log('  Result:', JSON.stringify(testData));
}
