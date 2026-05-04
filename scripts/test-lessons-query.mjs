// Test the exact query getLessonsForStudent runs, as the student
import { readFileSync } from 'fs';
const env = readFileSync('.env', 'utf8');
const getVar = (key) => { const m = env.match(new RegExp(`^${key}=(.+)$`, 'm')); return m ? m[1].trim() : null; };
const TOKEN  = getVar('SUPABASE_ACCESS_TOKEN');
const REF    = getVar('EXPO_PUBLIC_SUPABASE_URL').match(/https:\/\/([^.]+)/)[1];
const ANON   = getVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');
const URL    = getVar('EXPO_PUBLIC_SUPABASE_URL');

async function sql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return res.json();
}

const STUDENT_ID = 'cb085141-7182-4f37-a318-b9d575ac48d3';

// 1. Check what the enrollments query returns
const enrollments = await sql(`SELECT classroom_id FROM public.enrollments WHERE student_id = '${STUDENT_ID}'`);
console.log('Enrolled classrooms:', enrollments.map(e => e.classroom_id));

// 2. Check what the lessons query returns  
const classroomIds = enrollments.map(e => `'${e.classroom_id}'`).join(',');
const lessons = await sql(`
  SELECT l.id, l.title, l.is_published, l.classroom_id, c.subject
  FROM public.lessons l
  LEFT JOIN public.classrooms c ON c.id = l.classroom_id
  WHERE l.classroom_id IN (${classroomIds})
  AND l.is_published = true
`);
console.log(`\nLessons found: ${lessons.length}`);
lessons.forEach(l => console.log(` - [${l.subject}] ${l.title}`));

// 3. Test if the REST API (used by Supabase client) can do the join  
// The JS client uses: supabase.from('lessons').select('id, title, classrooms(subject)')
// This requires a PostgREST relationship — let's check
const restRes = await fetch(`${URL}/rest/v1/lessons?select=id,title,classroom_id,is_published,classrooms(subject)&is_published=eq.true&classroom_id=in.(${enrollments.map(e=>e.classroom_id).join(',')})`, {
  headers: { 'apikey': ANON, 'Authorization': `Bearer ${ANON}` }
});
const restData = await restRes.json();
console.log('\nREST API join test:');
if (Array.isArray(restData)) {
  console.log(`  ✅ ${restData.length} lessons returned`);
  restData.forEach(l => console.log(`  - ${l.classrooms?.subject ?? 'NO SUBJECT'} → ${l.title}`));
} else {
  console.log('  ❌ Error:', JSON.stringify(restData));
}
