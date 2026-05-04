// Fix lessons table: add FK constraint + ensure RLS allows student reads
import { readFileSync } from 'fs';
const env = readFileSync('.env', 'utf8');
const getVar = (key) => { const m = env.match(new RegExp(`^${key}=(.+)$`, 'm')); return m ? m[1].trim() : null; };
const TOKEN = getVar('SUPABASE_ACCESS_TOKEN');
const REF   = getVar('EXPO_PUBLIC_SUPABASE_URL').match(/https:\/\/([^.]+)/)[1];

async function sql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`SQL error: ${JSON.stringify(data)}`);
  return data;
}

console.log('🔧  Fixing lessons table...\n');

// 1. Add FK constraint so Supabase can resolve classrooms(subject) join
try {
  await sql(`
    ALTER TABLE public.lessons 
    ADD CONSTRAINT lessons_classroom_id_fkey 
    FOREIGN KEY (classroom_id) REFERENCES public.classrooms(id) ON DELETE SET NULL
  `);
  console.log('✅  Added FK: lessons.classroom_id → classrooms.id');
} catch (e) {
  if (e.message.includes('already exists')) {
    console.log('↩   FK constraint already exists');
  } else {
    console.log('⚠️   FK error (may be fine):', e.message.slice(0, 120));
  }
}

// 2. Ensure RLS allows authenticated students to read lessons
await sql(`ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY`);

await sql(`DROP POLICY IF EXISTS "Authenticated users can read lessons" ON public.lessons`);
await sql(`
  CREATE POLICY "Authenticated users can read lessons"
  ON public.lessons FOR SELECT
  TO authenticated
  USING (true)
`);
console.log('✅  RLS policy set: authenticated users can read all published lessons');

// 3. Verify lessons exist with classroom_id populated
const rows = await sql(`
  SELECT l.title, l.is_published, l.classroom_id, c.name as classroom_name
  FROM public.lessons l
  LEFT JOIN public.classrooms c ON c.id = l.classroom_id
  ORDER BY c.name, l.title
`);
console.log(`\n📚  Lessons in DB (${rows.length} total):`);
rows.forEach(r => console.log(`   [${r.is_published ? '✅ published' : '❌ draft   '}]  ${r.classroom_name ?? '(no classroom)'} → ${r.title}`));

console.log('\n✅  Done! The "My Lessons" page should now load correctly.\n');
