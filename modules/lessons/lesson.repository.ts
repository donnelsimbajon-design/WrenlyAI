import { supabase } from '@/services/supabase';

export const LessonRepository = {
  /**
   * Fetch all published lessons for a given classroom,
   * joined with the classroom's subject name.
   */
  async getLessonsByClassroom(classroomId: string) {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        grade_level,
        is_published,
        created_at,
        classroom_id,
        classrooms ( subject )
      `)
      .eq('classroom_id', classroomId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch all published lessons across all classrooms a student is enrolled in.
   */
  async getLessonsForStudent(studentId: string) {
    // Step 1: get enrolled classroom IDs
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('classroom_id')
      .eq('student_id', studentId);

    if (enrollError) throw enrollError;
    if (!enrollments || enrollments.length === 0) return [];

    const classroomIds = enrollments.map((e) => e.classroom_id);

    // Step 2: fetch lessons from those classrooms, joined with classroom subject
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        grade_level,
        is_published,
        created_at,
        classrooms ( subject )
      `)
      .in('classroom_id', classroomIds)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getLessonById(id: string) {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        content_en,
        content_tl,
        content_ceb,
        grade_level,
        is_published,
        created_at,
        classrooms ( subject ),
        materials ( id, title, storage_path, file_type )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * TEMPORARY DEVELOPMENT BYPASS
   * Fetches all published lessons regardless of enrollment.
   */
  async getDevelopmentBypassLessons() {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        grade_level,
        is_published,
        created_at,
        classrooms ( subject )
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
