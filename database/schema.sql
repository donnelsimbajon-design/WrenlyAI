-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  role TEXT CHECK (role IN ('teacher', 'student')),
  full_name TEXT,
  lrn TEXT UNIQUE,              -- Student LRN
  grade_level INTEGER,
  school_id UUID,
  parental_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schools
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT,
  division TEXT
);

-- Classrooms
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT,
  grade_level INTEGER,
  teacher_id UUID REFERENCES profiles(id),
  class_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classroom enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES classrooms(id),
  student_id UUID REFERENCES profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materials uploaded by teachers
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES classrooms(id),
  teacher_id UUID REFERENCES profiles(id),
  title TEXT,
  file_type TEXT CHECK (file_type IN ('pdf', 'pptx', 'mp4', 'docx')),
  storage_path TEXT,
  processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'done', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated lessons from materials
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id),
  classroom_id UUID REFERENCES classrooms(id),
  title TEXT,
  content_en TEXT,              -- English simplified version
  content_tl TEXT,              -- Tagalog translation
  content_ceb TEXT,             -- Bisaya/Cebuano translation
  grade_level INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id),
  questions JSONB,              -- Array of {question, choices, answer, explanation}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student quiz attempts
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id),
  student_id UUID REFERENCES profiles(id),
  score INTEGER,
  answers JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT false  -- for offline sync tracking
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES classrooms(id),
  teacher_id UUID REFERENCES profiles(id),
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES classrooms(id),
  sender_id UUID REFERENCES profiles(id),
  message TEXT,
  is_ai BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Teacher AI Settings
CREATE TABLE teacher_settings (
  teacher_id UUID REFERENCES profiles(id) PRIMARY KEY,
  target_grade_level INTEGER DEFAULT 7,
  auto_generate_quiz BOOLEAN DEFAULT true,
  enable_tl BOOLEAN DEFAULT true,
  enable_ceb BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
