// Quick schema check
import { readFileSync } from 'fs';
const env = readFileSync('.env', 'utf8');
const getVar = (key) => { const m = env.match(new RegExp(`^${key}=(.+)$`, 'm')); return m ? m[1].trim() : null; };
const TOKEN = getVar('SUPABASE_ACCESS_TOKEN');
const REF = getVar('EXPO_PUBLIC_SUPABASE_URL').match(/https:\/\/([^.]+)/)[1];

const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='lessons' ORDER BY ordinal_position` })
});
const cols = await r.json();
console.log('Lessons table columns:');
cols.forEach(c => console.log(` - ${c.column_name} (${c.data_type})`));
