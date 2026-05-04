// Check materials table schema + add mock materials for each classroom
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

// 1. Check materials schema
const cols = await sql(`
  SELECT column_name FROM information_schema.columns 
  WHERE table_schema='public' AND table_name='materials' ORDER BY ordinal_position
`);
console.log('Materials columns:', cols.map(c => c.column_name).join(', '));

// 2. Get teacher ID
const teacher = await sql(`SELECT id FROM auth.users WHERE email='demo.teacher@wrenly.ai' LIMIT 1`);
const teacherId = teacher[0]?.id;
if (!teacherId) { console.error('Teacher not found'); process.exit(1); }
console.log('Teacher ID:', teacherId);

// 3. Get all classrooms
const classrooms = await sql(`SELECT id, name, subject FROM public.classrooms WHERE teacher_id='${teacherId}'`);
console.log('Classrooms:', classrooms.map(c => c.name));

// 4. Get existing lesson IDs per classroom to link materials
const lessonRows = await sql(`SELECT id, title, classroom_id FROM public.lessons WHERE classroom_id IN (${classrooms.map(c=>`'${c.id}'`).join(',')})`);

// 5. Add materials for each classroom lesson
const columnNames = cols.map(c => c.column_name);
const hasTeacherId = columnNames.includes('teacher_id');
const hasProcessingStatus = columnNames.includes('processing_status');
const hasStoragePath = columnNames.includes('storage_path');
const hasLessonId = columnNames.includes('lesson_id');

console.log('\nAdding materials...');
for (const cls of classrooms) {
  const lessons = lessonRows.filter(l => l.classroom_id === cls.id);
  
  for (const lesson of lessons) {
    // Check if material already exists for this lesson
    const checkCol = hasLessonId ? `lesson_id='${lesson.id}'` : `classroom_id='${cls.id}' AND title='${lesson.title.replace(/'/g,"''")}'`;
    const existing = await sql(`SELECT id FROM public.materials WHERE ${checkCol} LIMIT 1`);
    if (existing.length > 0) { console.log(`  ↩  Exists: "${lesson.title}"`); continue; }

    // Build insert based on available columns
    const insertCols = ['title', 'classroom_id'];
    const insertVals = [`'${lesson.title.replace(/'/g,"''")}'`, `'${cls.id}'`];

    if (hasTeacherId)        { insertCols.push('teacher_id');        insertVals.push(`'${teacherId}'`); }
    if (hasLessonId)         { insertCols.push('lesson_id');         insertVals.push(`'${lesson.id}'`); }
    if (hasProcessingStatus) { insertCols.push('processing_status'); insertVals.push(`'done'`); }
    if (hasStoragePath)      { insertCols.push('storage_path');      insertVals.push(`'mock/placeholder.pdf'`); }
    if (columnNames.includes('file_type')) { insertCols.push('file_type'); insertVals.push(`'pdf'`); }

    await sql(`INSERT INTO public.materials (${insertCols.join(', ')}) VALUES (${insertVals.join(', ')})`);
    console.log(`  ✅  Material added: "${lesson.title}" → ${cls.name}`);
  }
}

console.log('\n✅ Done! Lessons tab should now show materials in each classroom.');
