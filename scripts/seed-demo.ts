/**
 * ─────────────────────────────────────────────────────────────
 *  Wrenly AI — Demo Seed Script
 *  Run with: npx ts-node --skip-project scripts/seed-demo.ts
 * ─────────────────────────────────────────────────────────────
 *
 *  Creates:
 *    1. A demo teacher account
 *    2. 3 classrooms (Math, Science, English)
 *    3. Enrolls YOUR student account into all 3 classrooms
 *    4. Adds announcements to each classroom
 *    5. Adds published lessons to each classroom
 *
 *  Your student account must already exist. Enter your login
 *  email below under STUDENT_EMAIL / STUDENT_PASSWORD.
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

// ── Config ───────────────────────────────────────────────────
const SUPABASE_URL  = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY  = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Student account (LRN 123123123123 → email format)
const STUDENT_EMAIL    = '123123123123@student.wrenly.ai';
const STUDENT_PASSWORD = 'wrenlyai';

const TEACHER_EMAIL    = 'demo.teacher@wrenly.ai';
const TEACHER_PASSWORD = 'password123';
// ─────────────────────────────────────────────────────────────

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing env vars. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function upsertUser(email: string, password: string, meta: Record<string, any>) {
  // Try login first (idempotent)
  const { data: login } = await supabase.auth.signInWithPassword({ email, password });
  if (login?.user) {
    console.log(`  ↩  Signed in as existing user: ${email}`);
    // Ensure profile exists
    await supabase.from('profiles').upsert({
      id: login.user.id,
      full_name: meta.full_name,
      role: meta.role,
    }, { onConflict: 'id' });
    return login.user;
  }

  // Otherwise sign up
  const { data: signup, error } = await supabase.auth.signUp({ email, password, options: { data: meta } });
  if (error || !signup?.user) throw new Error(`Failed to create ${email}: ${error?.message}`);
  console.log(`  ✅  Created user: ${email}`);
  await supabase.from('profiles').upsert({
    id: signup.user.id,
    full_name: meta.full_name,
    role: meta.role,
  }, { onConflict: 'id' });
  return signup.user;
}

async function run() {
  console.log('\n🌱  Wrenly AI — Demo Seed\n');

  // ── 1. Sign in student to get their ID ───────────────────
  console.log('1️⃣   Verifying student account...');
  const student = await upsertUser(STUDENT_EMAIL, STUDENT_PASSWORD, {
    full_name: 'Demo Student',
    role: 'student',
  });
  const studentId = student.id;
  console.log(`     Student ID: ${studentId}`);

  // ── 2. Sign up / in as teacher ────────────────────────────
  console.log('\n2️⃣   Setting up teacher account...');
  const teacher = await upsertUser(TEACHER_EMAIL, TEACHER_PASSWORD, {
    full_name: 'Ms. Rivera',
    role: 'teacher',
  });
  const teacherId = teacher.id;
  console.log(`     Teacher ID: ${teacherId}`);

  // Sign in AS teacher so RLS passes for classroom inserts
  await supabase.auth.signInWithPassword({ email: TEACHER_EMAIL, password: TEACHER_PASSWORD });

  // ── 3. Create classrooms ──────────────────────────────────
  console.log('\n3️⃣   Creating classrooms...');

  const classroomDefs = [
    { name: 'Grade 10 Mathematics', subject: 'Mathematics' },
    { name: 'Grade 10 Science',     subject: 'Science'     },
    { name: 'Grade 10 English',     subject: 'English'     },
  ];

  const classrooms: any[] = [];

  for (const def of classroomDefs) {
    // Check if a classroom by this teacher + name already exists
    const { data: existing } = await supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('name', def.name)
      .maybeSingle();

    if (existing) {
      console.log(`  ↩  Classroom already exists: ${def.name} (code: ${existing.class_code})`);
      classrooms.push(existing);
      continue;
    }

    const code = generateCode();
    const { data, error } = await supabase
      .from('classrooms')
      .insert({ name: def.name, subject: def.subject, teacher_id: teacherId, class_code: code })
      .select()
      .single();

    if (error) {
      console.error(`  ❌  Failed to create ${def.name}:`, error.message);
      continue;
    }
    console.log(`  ✅  Created: ${def.name} — Join Code: ${code}`);
    classrooms.push(data);
  }

  // ── 4. Enroll student in all classrooms ───────────────────
  // Switch back to student session for enrollment (RLS: student_id = auth.uid())
  console.log('\n4️⃣   Enrolling student in all classrooms...');
  await supabase.auth.signInWithPassword({ email: STUDENT_EMAIL, password: STUDENT_PASSWORD });

  for (const cls of classrooms) {
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('classroom_id', cls.id)
      .eq('student_id', studentId)
      .maybeSingle();

    if (existing) {
      console.log(`  ↩  Already enrolled in: ${cls.name}`);
      continue;
    }

    const { error } = await supabase
      .from('enrollments')
      .insert({ classroom_id: cls.id, student_id: studentId });

    if (error) console.error(`  ❌  Enrollment error (${cls.name}):`, error.message);
    else console.log(`  ✅  Enrolled in: ${cls.name}`);
  }

  // ── 5. Announcements (as teacher) ─────────────────────────
  console.log('\n5️⃣   Adding announcements...');
  await supabase.auth.signInWithPassword({ email: TEACHER_EMAIL, password: TEACHER_PASSWORD });

  const announcementDefs: Record<string, { title: string; body: string }[]> = {
    Mathematics: [
      { title: 'Welcome to Grade 10 Math!', body: 'Please review Chapter 1 before our first session. Bring your calculators!' },
      { title: 'Quiz Next Week 📝',         body: 'We will have a short quiz on Quadratic Equations. Review pages 45–60.' },
    ],
    Science: [
      { title: 'Welcome to Science Class!', body: 'Our first topic is Cell Biology. Please read the intro materials posted below.' },
      { title: 'Lab Report Reminder 🔬',    body: 'Reminder: Lab reports for the Osmosis experiment are due Friday.' },
    ],
    English: [
      { title: 'Welcome to English! 📖',    body: 'We start with poetry analysis this week. Come prepared to share your thoughts!' },
      { title: 'Essay Submission',          body: 'Reflective essays on "Noli Me Tangere" are due Monday. 500 words minimum.' },
    ],
  };

  for (const cls of classrooms) {
    const defs = announcementDefs[cls.subject] ?? [];
    for (const def of defs) {
      // Skip if already exists (rough check by title)
      const { data: existing } = await supabase
        .from('announcements')
        .select('id')
        .eq('classroom_id', cls.id)
        .eq('title', def.title)
        .maybeSingle();

      if (existing) { console.log(`  ↩  Announcement exists: "${def.title}"`); continue; }

      const { error } = await supabase.from('announcements').insert({
        classroom_id: cls.id,
        teacher_id: teacherId,
        title: def.title,
        body: def.body,
      });
      if (error) console.error(`  ❌  Announcement error:`, error.message);
      else console.log(`  ✅  Posted: "${def.title}"`);
    }
  }

  // ── 6. Lessons ────────────────────────────────────────────
  console.log('\n6️⃣   Adding lessons...');

  const lessonDefs: Record<string, { title: string; grade_level: number; content_en: string; content_tl: string; content_ceb: string }[]> = {
    Mathematics: [
      {
        title: 'Introduction to Quadratic Equations',
        grade_level: 10,
        content_en: 'A quadratic equation is a polynomial equation of degree 2, written in the form ax² + bx + c = 0. The solutions, called roots, can be found using the quadratic formula: x = (-b ± √(b²-4ac)) / 2a. The discriminant (b²-4ac) tells us the nature of the roots.',
        content_tl: 'Ang quadratic equation ay isang polynomial equation na may antas na 2, isinulat sa anyo na ax² + bx + c = 0. Ang mga solusyon, na tinatawag na roots, ay mahahanap gamit ang quadratic formula: x = (-b ± √(b²-4ac)) / 2a.',
        content_ceb: 'Ang quadratic equation usa ka polynomial equation nga may degree nga 2, gisulat sa porma nga ax² + bx + c = 0. Ang mga solusyon, nga gitawag ug roots, makita gamit ang quadratic formula.',
      },
      {
        title: 'Solving Systems of Linear Equations',
        grade_level: 10,
        content_en: 'A system of linear equations consists of two or more equations with the same variables. Methods to solve include: Substitution (isolate one variable), Elimination (add/subtract equations to cancel a variable), and Graphing (find the intersection point).',
        content_tl: 'Ang sistema ng linear equations ay binubuo ng dalawa o higit pang equations na may parehong mga variable. Ang mga pamamaraan ay kinabibilangan ng: Substitution, Elimination, at Graphing.',
        content_ceb: 'Ang sistema sa linear equations naglangkob sa duha o labaw pa nga equations nga adunay parehas nga mga variable. Ang mga pamaagi naglangkob sa: Substitution, Elimination, ug Graphing.',
      },
    ],
    Science: [
      {
        title: 'Cell Structure and Function',
        grade_level: 10,
        content_en: 'Cells are the basic building blocks of all living things. Animal cells contain a nucleus (which controls cell activities), mitochondria (energy production), cell membrane, cytoplasm, and ribosomes. Plant cells additionally have a cell wall, chloroplasts, and a large central vacuole.',
        content_tl: 'Ang mga selula ay ang pangunahing gusali ng lahat ng buhay na bagay. Ang mga selula ng hayop ay naglalaman ng nucleus, mitochondria, cell membrane, cytoplasm, at ribosomes. Ang mga selula ng halaman ay mayroon ding cell wall at chloroplasts.',
        content_ceb: 'Ang mga selula mao ang sukaranan nga bloke sa tanan nga buhing butang. Ang mga selula sa mananap adunay nucleus, mitochondria, cell membrane, cytoplasm, ug ribosomes. Ang mga selula sa tanum adunay dugang cell wall ug chloroplasts.',
      },
      {
        title: 'Photosynthesis and Cellular Respiration',
        grade_level: 10,
        content_en: 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce glucose and oxygen: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Cellular respiration is the reverse process where glucose is broken down to release energy in the form of ATP.',
        content_tl: 'Ang photosynthesis ay ang proseso kung saan ginagamit ng mga halaman ang sikat ng araw, tubig, at carbon dioxide upang gumawa ng glucose at oxygen. Ang cellular respiration ay ang kabaligtaran na proseso.',
        content_ceb: 'Ang photosynthesis mao ang proseso diin gigamit sa mga tanum ang adlaw, tubig, ug carbon dioxide aron makahimo ug glucose ug oxygen. Ang cellular respiration mao ang kabaliktaran nga proseso.',
      },
    ],
    English: [
      {
        title: 'Introduction to Philippine Literature',
        grade_level: 10,
        content_en: 'Philippine literature reflects the rich cultural heritage of the Filipino people. It spans oral traditions (epics, folk tales, riddles), the Spanish colonial period (Noli Me Tangere by Rizal), and modern literature. Key themes include nationalism, identity, and resilience.',
        content_tl: 'Ang panitikang Pilipino ay nagpapakita ng mayamang kultura ng mga Filipino. Sinasaklaw nito ang mga oral na tradisyon, ang panahon ng kolonyal na Kastila (Noli Me Tangere ni Rizal), at modernong panitikan.',
        content_ceb: 'Ang literaturang Pilipino nagpakita sa dato nga kulturanhon na pamana sa mga Pilipino. Naglangkob kini sa oral nga mga tradisyon, ang panahon sa Kastila (Noli Me Tangere ni Rizal), ug modernong literatura.',
      },
      {
        title: 'Elements of a Short Story',
        grade_level: 10,
        content_en: 'A short story contains five key elements: 1) Plot (sequence of events with exposition, rising action, climax, falling action, resolution), 2) Character (protagonist, antagonist, supporting), 3) Setting (time and place), 4) Conflict (person vs. person/nature/self/society), 5) Theme (central message).',
        content_tl: 'Ang maikling kuwento ay may limang pangunahing elemento: 1) Plot (pagkakasunod ng mga pangyayari), 2) Character (mga tauhan), 3) Setting (lugar at panahon), 4) Conflict (salungatan), 5) Theme (pangunahing mensahe).',
        content_ceb: 'Ang mubo nga sugilanon adunay lima ka yawe nga elemento: 1) Plot, 2) Character, 3) Setting, 4) Conflict, ug 5) Theme.',
      },
    ],
  };

  // Check if the lessons table has classroom_id column
  // (some older migrations may not have it)
  let hasClassroomId = true;
  const { error: colCheck } = await supabase
    .from('lessons')
    .select('classroom_id')
    .limit(1);
  if (colCheck?.message?.includes('classroom_id')) {
    hasClassroomId = false;
    console.log('  ⚠️   lessons.classroom_id column not found — lessons will be inserted without it');
  }

  for (const cls of classrooms) {
    const defs = lessonDefs[cls.subject] ?? [];
    for (const def of defs) {
      // Skip if already exists
      const { data: existing } = await supabase
        .from('lessons')
        .select('id')
        .eq('title', def.title)
        .maybeSingle();

      if (existing) { console.log(`  ↩  Lesson exists: "${def.title}"`); continue; }

      const payload: Record<string, any> = {
        title: def.title,
        subject: cls.subject,
        grade_level: def.grade_level,
        is_published: true,
        content_en: def.content_en,
        content_tl: def.content_tl,
        content_ceb: def.content_ceb,
      };
      if (hasClassroomId) payload['classroom_id'] = cls.id;

      const { error } = await supabase.from('lessons').insert(payload);
      if (error) console.error(`  ❌  Lesson error ("${def.title}"):`, error.message);
      else console.log(`  ✅  Added lesson: "${def.title}"`);
    }
  }

  // ── Done ─────────────────────────────────────────────────
  console.log('\n────────────────────────────────────────────────────');
  console.log('✅  Demo seed complete!\n');
  console.log('📋  Classroom join codes:');
  classrooms.forEach(c => console.log(`   ${c.subject.padEnd(14)} →  ${c.class_code}`));
  console.log('\n👩‍🏫  Teacher login:');
  console.log(`   Email:    ${TEACHER_EMAIL}`);
  console.log(`   Password: ${TEACHER_PASSWORD}`);
  console.log('\n👩‍🎓  Student login:');
  console.log(`   Email:    ${STUDENT_EMAIL}`);
  console.log(`   Password: ${STUDENT_PASSWORD}`);
  console.log('────────────────────────────────────────────────────\n');
}

run().catch(console.error);
