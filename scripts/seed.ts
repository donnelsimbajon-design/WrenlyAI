import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function signUp(email: string, password: string, data: any) {
  let user;
  
  // 1. Try to login first
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (loginData?.user) {
    user = loginData.user;
  } else {
    // 2. If login fails, try to sign up
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data }
    });
    
    if (signUpErr) {
      throw new Error(`Failed to create/login user ${email}: ${signUpErr.message}`);
    }
    user = signUpData.user;
  }
  
  if (!user) throw new Error("Could not authenticate " + email);

  // 3. Upsert profile now that we are authenticated as this user
  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: data.full_name,
    role: data.role,
    lrn: data.lrn,
    grade_level: data.grade_level
  }, { onConflict: 'id' });

  if (profileErr) {
    console.error("Profile upsert failed for", email, profileErr.message);
  }

  return user;
}

async function run() {
  console.log('Seeding data...');
  try {
    // 1. Create Teachers
    const teachers = [];
    for (let i = 1; i <= 3; i++) {
      const email = `teacher${i}@wrenly.ai`;
      console.log(`Creating teacher ${email}...`);
      const user = await signUp(email, 'password123', {
        full_name: `Teacher ${i}`,
        role: 'teacher'
      });
      teachers.push(user);
    }

    // 2. Create Student
    const studentEmail = '123456789012@student.wrenly.ai';
    console.log(`Creating student ${studentEmail}...`);
    const student = await signUp(studentEmail, 'password123', {
      full_name: 'Test Student',
      role: 'student',
      lrn: '123456789012',
      grade_level: 10
    });

    if (!student) {
        throw new Error("Failed to create or retrieve student.");
    }

    // 3. Create Classrooms
    console.log('Creating classrooms...');
    const classes = [];
    const subjects = ['Mathematics', 'Science', 'History'];
    for (let i = 0; i < 3; i++) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      
      const teacherId = teachers[i]?.id;
      if (!teacherId) continue;

      const { data, error } = await supabase.from('classrooms').insert({
        name: `Grade 10 ${subjects[i]}`,
        subject: subjects[i],
        teacher_id: teacherId,
        class_code: code
      }).select().single();
      
      if (error) {
        console.error(`Error creating class ${subjects[i]}:`, error.message);
        continue;
      }
      classes.push(data);
      console.log(`Created class ${data.name} with code ${code}`);
    }

    // 4. Enroll student
    console.log('Enrolling student...');
    for (const cls of classes) {
      // Check if already enrolled
      const { data: existing } = await supabase.from('enrollments')
        .select('id').eq('classroom_id', cls.id).eq('student_id', student.id).maybeSingle();
        
      if (!existing) {
        const { error } = await supabase.from('enrollments').insert({
          classroom_id: cls.id,
          student_id: student.id
        });
        if (error) console.error("Enrollment error:", error.message);
      }
    }

    // 5. Create Announcements and Materials
    console.log('Creating announcements and materials...');
    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      const teacherId = teachers[i]?.id;
      if (!teacherId) continue;

      await supabase.from('announcements').insert({
        classroom_id: cls.id,
        teacher_id: teacherId,
        title: `Welcome to ${cls.name}`,
        body: 'Please review the syllabus and introductory materials.'
      });

      await supabase.from('materials').insert({
        classroom_id: cls.id,
        teacher_id: teacherId,
        title: 'Chapter 1 Overview',
        file_type: 'pdf',
        processing_status: 'done'
      });
    }
    
    console.log('----------------------------------------------------');
    console.log('✅ Seeding complete! You can log in with:');
    console.log('👉 Student LRN: 123456789012 / Password: password123');
    console.log('👉 Teacher Email: teacher1@wrenly.ai / Password: password123');
    console.log('----------------------------------------------------');
    
  } catch (e) {
    console.error('Error seeding:', e);
  }
}

run();
