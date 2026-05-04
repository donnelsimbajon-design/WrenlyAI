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
  return res.json();
}

async function run() {
  const policies = await sql(`SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'materials'`);
  console.log('Current materials policies:', policies);

  console.log('Adding permissive read/write policy for authenticated users...');
  
  await sql(`ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY`);
  
  // Create a policy for all authenticated users to do anything with materials
  await sql(`
    CREATE POLICY "Auth users can read materials" ON public.materials FOR SELECT TO authenticated USING (true);
  `);
  await sql(`
    CREATE POLICY "Auth users can read materials anon" ON public.materials FOR SELECT TO anon USING (true);
  `);
  await sql(`
    CREATE POLICY "Auth users can insert materials" ON public.materials FOR INSERT TO authenticated WITH CHECK (true);
  `);
  await sql(`
    CREATE POLICY "Auth users can update materials" ON public.materials FOR UPDATE TO authenticated USING (true);
  `);
  await sql(`
    CREATE POLICY "Auth users can delete materials" ON public.materials FOR DELETE TO authenticated USING (true);
  `);
  
  console.log('Done!');
}
run();
