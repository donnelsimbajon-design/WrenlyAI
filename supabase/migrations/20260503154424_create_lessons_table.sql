-- =============================================
-- Migration: create_lessons_table
-- Created: 2026-05-03
-- =============================================

-- Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subject text NOT NULL,
  duration text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Materials table (linked to lessons)
CREATE TABLE IF NOT EXISTS public.materials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read lessons
CREATE POLICY "Authenticated users can read lessons"
  ON public.lessons FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to read materials
CREATE POLICY "Authenticated users can read materials"
  ON public.materials FOR SELECT
  TO authenticated
  USING (true);

-- Seed starter data
INSERT INTO public.lessons (title, subject, duration) VALUES
  ('Fractions & Decimals', 'Advanced Mathematics', '45 mins'),
  ('The Water Cycle', 'Biology 101', '30 mins'),
  ('Introduction to Poetry', 'Literature', '60 mins'),
  ('Mitosis vs Meiosis', 'Biology 101', '40 mins'),
  ('Algebraic Expressions', 'Advanced Mathematics', '50 mins');
