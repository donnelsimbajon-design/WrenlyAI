-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- 1. PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. SCHOOLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public schools read" ON schools;

CREATE POLICY "Public schools read" ON schools FOR SELECT USING (true);

-- 3. CLASSROOMS
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public classrooms read" ON classrooms;
DROP POLICY IF EXISTS "Teachers can insert classrooms" ON classrooms;
DROP POLICY IF EXISTS "Teachers can update their classrooms" ON classrooms;

CREATE POLICY "Public classrooms read" ON classrooms FOR SELECT USING (true);
CREATE POLICY "Teachers can insert classrooms" ON classrooms FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update their classrooms" ON classrooms FOR UPDATE USING (auth.uid() = teacher_id);

-- 4. ENROLLMENTS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public enrollments read" ON enrollments;
DROP POLICY IF EXISTS "Students can enroll" ON enrollments;

CREATE POLICY "Public enrollments read" ON enrollments FOR SELECT USING (true);
CREATE POLICY "Students can enroll" ON enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);

-- 5. MATERIALS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public materials read" ON materials;
DROP POLICY IF EXISTS "Teachers can insert materials" ON materials;
DROP POLICY IF EXISTS "Teachers can update their materials" ON materials;

CREATE POLICY "Public materials read" ON materials FOR SELECT USING (true);
CREATE POLICY "Teachers can insert materials" ON materials FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update their materials" ON materials FOR UPDATE USING (auth.uid() = teacher_id);

-- 6. LESSONS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public lessons read" ON lessons;

CREATE POLICY "Public lessons read" ON lessons FOR SELECT USING (true);

-- 7. QUIZZES
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public quizzes read" ON quizzes;

CREATE POLICY "Public quizzes read" ON quizzes FOR SELECT USING (true);

-- 8. QUIZ ATTEMPTS
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can view own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Students can insert own attempts" ON quiz_attempts;

CREATE POLICY "Students can view own attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);

-- 9. ANNOUNCEMENTS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public announcements read" ON announcements;
DROP POLICY IF EXISTS "Teachers can insert announcements" ON announcements;

CREATE POLICY "Public announcements read" ON announcements FOR SELECT USING (true);
CREATE POLICY "Teachers can insert announcements" ON announcements FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- 10. MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public messages read" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;

CREATE POLICY "Public messages read" ON messages FOR SELECT USING (true);
CREATE POLICY "Users can insert own messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 11. TEACHER_SETTINGS
ALTER TABLE teacher_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers can view own settings" ON teacher_settings;
DROP POLICY IF EXISTS "Teachers can insert own settings" ON teacher_settings;
DROP POLICY IF EXISTS "Teachers can update own settings" ON teacher_settings;

CREATE POLICY "Teachers can view own settings" ON teacher_settings FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can insert own settings" ON teacher_settings FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update own settings" ON teacher_settings FOR UPDATE USING (auth.uid() = teacher_id);

-- ==========================================
-- ENABLE REALTIME (postgres_changes)
-- ==========================================
-- Run these in Supabase dashboard: Replication → Toggle ON for these tables:

-- ALTER PUBLICATION supabase_realtime ADD TABLE classrooms;
-- ALTER PUBLICATION supabase_realtime ADD TABLE materials;
-- ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE enrollments;
-- ALTER PUBLICATION supabase_realtime ADD TABLE lessons;
