// Wrenly AI — Demo Seed via Supabase Management API
// Run: node scripts/seed-demo.mjs

import { readFileSync } from 'fs';

// Load .env manually
const env = readFileSync('.env', 'utf8');
const getVar = (key) => {
  const match = env.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return match ? match[1].trim() : null;
};

const ACCESS_TOKEN  = getVar('SUPABASE_ACCESS_TOKEN');
const SUPABASE_URL  = getVar('EXPO_PUBLIC_SUPABASE_URL');
const PROJECT_REF   = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

const STUDENT_EMAIL    = '123123123123@student.wrenly.ai';
const TEACHER_EMAIL    = 'demo.teacher@wrenly.ai';
const TEACHER_PASSWORD = 'password123';

if (!ACCESS_TOKEN || !PROJECT_REF) {
  console.error('❌  Missing SUPABASE_ACCESS_TOKEN or SUPABASE_URL in .env');
  process.exit(1);
}

console.log(`\n🌱  Wrenly AI Demo Seed`);
console.log(`   Project: ${PROJECT_REF}\n`);

// ── Helpers ───────────────────────────────────────────────────

async function sql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`SQL error: ${JSON.stringify(data)}`);
  return data;
}

async function adminCreateUser(email, password, metadata) {
  // Check if user already exists via SQL
  const existing = await sql(`SELECT id FROM auth.users WHERE email = '${email}' LIMIT 1`);
  if (existing.length > 0) {
    console.log(`  ↩  User already exists: ${email}`);
    return existing[0].id;
  }

  // Use the project's own auth admin endpoint
  const projectUrl = `https://${PROJECT_REF}.supabase.co`;
  const res = await fetch(`${projectUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'apikey': ACCESS_TOKEN,
    },
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: metadata })
  });
  const data = await res.json();
  if (!res.ok) {
    // If we can't create via auth, insert directly into auth.users via SQL as fallback
    console.log(`  ⚠️   Auth API failed, using SQL fallback...`);
    const uuid = crypto.randomUUID();
    const now = new Date().toISOString();
    await sql(`
      INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
      VALUES (
        '${uuid}',
        '00000000-0000-0000-0000-000000000000',
        '${email}',
        crypt('${password}', gen_salt('bf')),
        '${now}',
        '${JSON.stringify(metadata).replace(/'/g, "''")}',
        'authenticated',
        'authenticated',
        '${now}',
        '${now}'
      )
    `);
    console.log(`  ✅  Created teacher via SQL: ${email}`);
    return uuid;
  }
  console.log(`  ✅  Created user: ${email}`);
  return data.id;
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── Main ─────────────────────────────────────────────────────

async function run() {

  // 1. Get student UUID
  console.log('1️⃣   Looking up student account...');
  const studentRows = await sql(`SELECT id FROM auth.users WHERE email = '${STUDENT_EMAIL}' LIMIT 1`);
  if (!studentRows.length) {
    console.error(`❌  Student account not found: ${STUDENT_EMAIL}`);
    console.error('    Make sure you have registered in the app first.');
    process.exit(1);
  }
  const studentId = studentRows[0].id;
  console.log(`     ✅  Found student: ${studentId}`);

  // 2. Create teacher
  console.log('\n2️⃣   Setting up teacher account...');
  const teacherId = await adminCreateUser(TEACHER_EMAIL, TEACHER_PASSWORD, {
    full_name: 'Ms. Rivera', role: 'teacher'
  });

  // Upsert teacher profile
  await sql(`
    INSERT INTO public.profiles (id, full_name, role)
    VALUES ('${teacherId}', 'Ms. Rivera', 'teacher')
    ON CONFLICT (id) DO UPDATE SET full_name = 'Ms. Rivera', role = 'teacher'
  `);

  // Ensure student profile exists too (update role just in case)
  await sql(`
    UPDATE public.profiles SET role = 'student' WHERE id = '${studentId}'
  `);

  // 3. Create classrooms
  console.log('\n3️⃣   Creating classrooms...');
  const classroomDefs = [
    { name: 'Grade 10 Mathematics', subject: 'Mathematics' },
    { name: 'Grade 10 Science',     subject: 'Science'     },
    { name: 'Grade 10 English',     subject: 'English'     },
  ];

  const classrooms = [];
  for (const def of classroomDefs) {
    const existing = await sql(`
      SELECT * FROM public.classrooms 
      WHERE teacher_id = '${teacherId}' AND name = '${def.name}' LIMIT 1
    `);
    if (existing.length > 0) {
      console.log(`  ↩  Exists: ${def.name} (${existing[0].class_code})`);
      classrooms.push(existing[0]);
      continue;
    }
    const code = generateCode();
    const rows = await sql(`
      INSERT INTO public.classrooms (name, subject, teacher_id, class_code)
      VALUES ('${def.name}', '${def.subject}', '${teacherId}', '${code}')
      RETURNING *
    `);
    console.log(`  ✅  Created: ${def.name} — Code: ${code}`);
    classrooms.push(rows[0]);
  }

  // 4. Enroll student
  console.log('\n4️⃣   Enrolling student...');
  for (const cls of classrooms) {
    const existing = await sql(`
      SELECT id FROM public.enrollments 
      WHERE classroom_id = '${cls.id}' AND student_id = '${studentId}' LIMIT 1
    `);
    if (existing.length > 0) { console.log(`  ↩  Already enrolled in ${cls.name}`); continue; }
    await sql(`
      INSERT INTO public.enrollments (classroom_id, student_id)
      VALUES ('${cls.id}', '${studentId}')
    `);
    console.log(`  ✅  Enrolled in: ${cls.name}`);
  }

  // 5. Announcements
  console.log('\n5️⃣   Adding announcements...');
  const announcements = {
    'Mathematics': [
      ['Welcome to Grade 10 Math! 📐', 'Please review Chapter 1 before our first session. Bring your calculators!'],
      ['Quiz Next Week 📝', 'We will have a short quiz on Quadratic Equations. Review pages 45–60.'],
    ],
    'Science': [
      ['Welcome to Science Class! 🔬', 'Our first topic is Cell Biology. Please read the intro materials posted below.'],
      ['Lab Report Reminder', 'Reminder: Lab reports for the Osmosis experiment are due this Friday.'],
    ],
    'English': [
      ['Welcome to English! 📖', 'We start with poetry analysis this week. Come prepared to share your thoughts!'],
      ['Essay Submission', 'Reflective essays on "Noli Me Tangere" are due Monday. 500 words minimum.'],
    ],
  };

  for (const cls of classrooms) {
    for (const [title, body] of (announcements[cls.subject] ?? [])) {
      const exists = await sql(`
        SELECT id FROM public.announcements WHERE classroom_id = '${cls.id}' AND title = '${title.replace(/'/g, "''")}' LIMIT 1
      `);
      if (exists.length > 0) { console.log(`  ↩  Exists: "${title}"`); continue; }
      await sql(`
        INSERT INTO public.announcements (classroom_id, teacher_id, title, body)
        VALUES ('${cls.id}', '${teacherId}', '${title.replace(/'/g, "''")}', '${body.replace(/'/g, "''")}')
      `);
      console.log(`  ✅  Announcement: "${title}"`);
    }
  }

  // 6. Lessons
  console.log('\n6️⃣   Adding lessons...');

  // Check if lessons table has classroom_id - we already confirmed it does
  const hasClassroomId = true;

  const lessons = {
    'Mathematics': [
      {
        title: 'Introduction to Quadratic Equations',
        content_en: 'A quadratic equation is a polynomial equation of degree 2, written as ax² + bx + c = 0. Solutions called roots can be found using the quadratic formula: x = (-b ± √(b²-4ac)) / 2a. The discriminant (b²-4ac) tells us the nature of the roots: positive means 2 real roots, zero means 1 root, negative means no real roots.',
        content_tl: 'Ang quadratic equation ay isang polynomial equation na may antas na 2, isinulat sa anyo na ax² + bx + c = 0. Ang mga solusyon ay mahahanap gamit ang quadratic formula. Ang discriminant ay nagpapakita kung ilang real roots ang solusyon.',
        content_ceb: 'Ang quadratic equation usa ka polynomial equation nga may degree nga 2. Ang mga solusyon makita gamit ang quadratic formula. Ang discriminant nagpakita kung pila ka real roots ang sulondon.',
      },
      {
        title: 'Solving Systems of Linear Equations',
        content_en: 'A system of linear equations has two or more equations with the same variables. Methods: Substitution (isolate one variable and substitute), Elimination (add/subtract to cancel a variable), and Graphing (find the intersection). Systems can have one solution, no solution, or infinite solutions.',
        content_tl: 'Ang sistema ng linear equations ay may dalawa o higit pang equations. Mga pamamaraan: Substitution, Elimination, at Graphing. Ang mga sistema ay maaaring may isang solusyon, walang solusyon, o walang katapusang solusyon.',
        content_ceb: 'Ang sistema sa linear equations adunay duha o labaw pa nga equations. Mga pamaagi: Substitution, Elimination, ug Graphing. Ang sistema mahimong adunay usa, wala, o walay katapusan nga solusyon.',
      },
    ],
    'Science': [
      {
        title: 'Cell Structure and Function',
        content_en: 'Cells are the basic building blocks of living things. Animal cells have: nucleus (controls cell), mitochondria (energy), cell membrane (protection), cytoplasm, and ribosomes. Plant cells additionally have: cell wall (rigid support), chloroplasts (photosynthesis), and a large central vacuole (water storage).',
        content_tl: 'Ang mga selula ay ang pangunahing gusali ng lahat ng buhay. Ang selula ng hayop ay may nucleus, mitochondria, cell membrane, cytoplasm, at ribosomes. Ang selula ng halaman ay mayroon pang cell wall, chloroplasts, at malaking vacuole.',
        content_ceb: 'Ang mga selula mao ang sukaranan nga bloke sa tanan nga buhing butang. Ang selula sa mananap adunay nucleus, mitochondria, ug cell membrane. Ang selula sa tanum adunay dugang cell wall ug chloroplasts.',
      },
      {
        title: 'Photosynthesis Explained',
        content_en: 'Photosynthesis is how plants make food using sunlight, water, and CO₂. Equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. It happens in the chloroplasts. Two stages: Light reactions (capture energy from sunlight) and the Calvin Cycle (uses energy to make glucose).',
        content_tl: 'Ang photosynthesis ay kung paano gumagawa ng pagkain ang mga halaman gamit ang sikat ng araw, tubig, at CO₂. Nangyayari ito sa chloroplasts. May dalawang yugto: Light reactions at Calvin Cycle.',
        content_ceb: 'Ang photosynthesis mao kung giunsa sa mga tanum ang paghimo ug pagkaon gamit ang adlaw, tubig, ug CO₂. Nahitabo kini sa chloroplasts. Adunay duha ka bahin: Light reactions ug Calvin Cycle.',
      },
    ],
    'English': [
      {
        title: 'Introduction to Philippine Literature',
        content_en: 'Philippine literature reflects Filipino cultural heritage spanning oral traditions (epics, folk tales), the Spanish colonial period featuring Jose Rizal\'s Noli Me Tangere, and modern literature. Key themes include nationalism, identity, and resilience. The Baybayin script is one of the oldest Filipino writing systems.',
        content_tl: 'Ang panitikang Pilipino ay nagpapakita ng mayamang kultura ng mga Filipino. Sinasaklaw nito ang oral na tradisyon, panahon ng Kastila na kinapapalooban ng Noli Me Tangere ni Rizal, at modernong panitikan. Ang mga pangunahing tema ay nasyonalismo at pagkakakilanlan.',
        content_ceb: 'Ang literaturang Pilipino nagpakita sa dato nga kultura sa mga Pilipino. Naglangkob kini sa oral nga tradisyon, panahon sa Kastila nga adunay Noli Me Tangere ni Rizal, ug modernong literatura.',
      },
      {
        title: 'Elements of a Short Story',
        content_en: 'A short story has 5 key elements: 1) Plot — sequence of events (exposition, rising action, climax, falling action, resolution). 2) Character — protagonist, antagonist, supporting. 3) Setting — time and place. 4) Conflict — person vs. person/nature/self/society. 5) Theme — the central message or moral.',
        content_tl: 'Ang maikling kuwento ay may 5 pangunahing elemento: 1) Plot, 2) Tauhan (Character), 3) Setting (lugar at panahon), 4) Conflict (salungatan), at 5) Theme (pangunahing mensahe o aral).',
        content_ceb: 'Ang mubo nga sugilanon adunay 5 ka yawe nga elemento: 1) Plot, 2) Character, 3) Setting, 4) Conflict, ug 5) Theme nga mao ang sentral nga mensahe.',
      },
    ],
  };

  for (const cls of classrooms) {
    for (const lesson of (lessons[cls.subject] ?? [])) {
      const titleEsc = lesson.title.replace(/'/g, "''");
      const exists = await sql(`SELECT id FROM public.lessons WHERE title = '${titleEsc}' LIMIT 1`);
      if (exists.length > 0) { console.log(`  ↩  Exists: "${lesson.title}"`); continue; }

      const enEsc   = lesson.content_en.replace(/'/g, "''");
      const tlEsc   = lesson.content_tl.replace(/'/g, "''");
      const cebEsc  = lesson.content_ceb.replace(/'/g, "''");
      const subEsc  = cls.subject.replace(/'/g, "''");

      const classroomCol = hasClassroomId ? `, classroom_id` : '';
      const classroomVal = hasClassroomId ? `, '${cls.id}'` : '';

      await sql(`
        INSERT INTO public.lessons (title, grade_level, is_published, content_en, content_tl, content_ceb${classroomCol})
        VALUES ('${titleEsc}', 10, true, '${enEsc}', '${tlEsc}', '${cebEsc}'${classroomVal})
      `);
      console.log(`  ✅  Lesson: "${lesson.title}"`);
    }
  }

  // ── Summary ───────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────────────────');
  console.log('✅  Done! Here is your demo data:\n');
  console.log('📋  Classroom join codes:');
  classrooms.forEach(c => console.log(`   ${c.subject?.padEnd(14) ?? ''}  →  ${c.class_code}`));
  console.log('\n👩‍🎓  Your student login:');
  console.log(`   LRN:      123123123123`);
  console.log(`   Password: wrenlyai`);
  console.log('\n👩‍🏫  Teacher login (for demo):');
  console.log(`   Email:    ${TEACHER_EMAIL}`);
  console.log(`   Password: ${TEACHER_PASSWORD}`);
  console.log('──────────────────────────────────────────────────────\n');
}

run().catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1); });
