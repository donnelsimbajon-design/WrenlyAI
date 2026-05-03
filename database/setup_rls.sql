-- 1. Fix RLS Policies for the tables (so the app works properly)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Do the same for classrooms, enrollments, materials, announcements
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public classrooms read" ON classrooms;
DROP POLICY IF EXISTS "Teachers can insert classrooms" ON classrooms;
CREATE POLICY "Public classrooms read" ON classrooms FOR SELECT USING (true);
CREATE POLICY "Teachers can insert classrooms" ON classrooms FOR INSERT WITH CHECK (auth.uid() = teacher_id);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public enrollments read" ON enrollments;
DROP POLICY IF EXISTS "Students can enroll" ON enrollments;
CREATE POLICY "Public enrollments read" ON enrollments FOR SELECT USING (true);
CREATE POLICY "Students can enroll" ON enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public materials read" ON materials;
DROP POLICY IF EXISTS "Teachers can insert materials" ON materials;
CREATE POLICY "Public materials read" ON materials FOR SELECT USING (true);
CREATE POLICY "Teachers can insert materials" ON materials FOR INSERT WITH CHECK (auth.uid() = teacher_id);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public announcements read" ON announcements;
DROP POLICY IF EXISTS "Teachers can insert announcements" ON announcements;
CREATE POLICY "Public announcements read" ON announcements FOR SELECT USING (true);
CREATE POLICY "Teachers can insert announcements" ON announcements FOR INSERT WITH CHECK (auth.uid() = teacher_id);
