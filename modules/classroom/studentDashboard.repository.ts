import { supabase } from '@/services/supabase';

export const StudentDashboardRepository = {
  async getEnrolledClassrooms(studentId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        classroom_id,
        classrooms (
          id,
          name,
          subject,
          grade_level,
          profiles ( full_name )
        )
      `)
      .eq('student_id', studentId);
    
    if (error) throw error;
    return data.map(d => d.classrooms);
  },

  async getRecentAnnouncements(classroomIds: string[]) {
    if (classroomIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .in('classroom_id', classroomIds)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data;
  },

  async joinClass(studentId: string, classCode: string) {
    // 1. Find the classroom
    const { data: classroom, error: classError } = await supabase
      .from('classrooms')
      .select('id')
      .eq('class_code', classCode)
      .single();

    if (classError || !classroom) throw new Error('Invalid class code');

    // 2. Check if already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('classroom_id', classroom.id)
      .eq('student_id', studentId)
      .single();

    if (existing) throw new Error('You are already enrolled in this class');

    // 3. Enroll
    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert([{ classroom_id: classroom.id, student_id: studentId }]);

    if (enrollError) throw enrollError;
    return true;
  }
};
