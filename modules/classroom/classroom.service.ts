import { supabase } from '@/services/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Classroom {
  id: string;
  name: string;
  subject?: string;
  grade_level?: number;
  teacher_id: string;
  class_code: string;
  created_at: string;
  studentCount: number;
  materialCount: number;
  teacherName?: string;
}

export interface ClassroomMember {
  id: string;
  full_name: string;
  grade_level?: number;
}

export interface Announcement {
  id: string;
  classroom_id: string;
  teacher_id: string;
  title: string;
  body: string;
  created_at: string;
  teacherName?: string;
}

export interface Material {
  id: string;
  classroom_id: string;
  title: string;
  file_type: string;
  processing_status: string;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateClassCode(): string {
  // Exclude ambiguous chars like 0, O, 1, I, L
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const ClassroomService = {

  async createClassroom(
    name: string,
    subject: string,
    teacherId: string
  ): Promise<{ classroom: Classroom | null; error: any }> {
    let code = generateClassCode();

    // Simple uniqueness check — retry once if collision
    const { data: exists } = await supabase
      .from('classrooms')
      .select('id')
      .eq('class_code', code)
      .maybeSingle();
    if (exists) code = generateClassCode();

    const { data, error } = await supabase
      .from('classrooms')
      .insert({ name, subject, teacher_id: teacherId, class_code: code })
      .select()
      .single();

    return { classroom: data ? { ...data, studentCount: 0, materialCount: 0 } : null, error };
  },

  async joinClassroom(
    code: string,
    studentId: string
  ): Promise<{ classroom: Classroom | null; error: any }> {
    // 1. Find classroom by code
    const { data: classroom, error: findErr } = await supabase
      .from('classrooms')
      .select('*')
      .eq('class_code', code.trim().toUpperCase())
      .maybeSingle();

    if (findErr || !classroom) {
      return { classroom: null, error: { message: 'Class not found. Check the code and try again.' } };
    }

    // 2. Check if already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('classroom_id', classroom.id)
      .eq('student_id', studentId)
      .maybeSingle();

    if (existing) {
      return { classroom, error: { message: 'You are already enrolled in this class.' } };
    }

    // 3. Enroll
    const { error: enrollErr } = await supabase
      .from('enrollments')
      .insert({ classroom_id: classroom.id, student_id: studentId });

    return { classroom: { ...classroom, studentCount: 0, materialCount: 0 }, error: enrollErr };
  },

  async getMyClassrooms(userId: string, role: 'teacher' | 'student'): Promise<Classroom[]> {
    if (role === 'teacher') {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*, enrollments(id), materials(id)')
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((c: any) => ({
        ...c,
        studentCount: c.enrollments?.length ?? 0,
        materialCount: c.materials?.length ?? 0,
      }));
    } else {
      // Get classroom IDs from enrollments
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('classroom_id')
        .eq('student_id', userId);

      const ids = enrollments?.map((e: any) => e.classroom_id) ?? [];
      if (ids.length === 0) return [];

      const { data, error } = await supabase
        .from('classrooms')
        .select('*, enrollments(id), materials(id)')
        .in('id', ids)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      // Fetch teacher names separately
      const teacherIds = [...new Set(data.map((c: any) => c.teacher_id))];
      const { data: teachers } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', teacherIds);

      const teacherMap: Record<string, string> = {};
      teachers?.forEach((t: any) => { teacherMap[t.id] = t.full_name; });

      return data.map((c: any) => ({
        ...c,
        studentCount: c.enrollments?.length ?? 0,
        materialCount: c.materials?.length ?? 0,
        teacherName: teacherMap[c.teacher_id],
      }));
    }
  },

  async getClassroomById(id: string): Promise<{ classroom: Classroom | null; error: any }> {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*, enrollments(id), materials(id)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return { classroom: null, error };

    const { data: teacher } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', data.teacher_id)
      .maybeSingle();

    return {
      classroom: {
        ...data,
        studentCount: data.enrollments?.length ?? 0,
        materialCount: data.materials?.length ?? 0,
        teacherName: teacher?.full_name,
      },
      error: null,
    };
  },

  async getMembers(classroomId: string): Promise<ClassroomMember[]> {
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('classroom_id', classroomId);

    const ids = enrollments?.map((e: any) => e.student_id) ?? [];
    if (ids.length === 0) return [];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, grade_level')
      .in('id', ids);

    return profiles ?? [];
  },

  async getAnnouncements(classroomId: string): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    // Fetch teacher names
    const teacherIds = [...new Set(data.map((a: any) => a.teacher_id))];
    const { data: teachers } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', teacherIds);

    const teacherMap: Record<string, string> = {};
    teachers?.forEach((t: any) => { teacherMap[t.id] = t.full_name; });

    return data.map((a: any) => ({ ...a, teacherName: teacherMap[a.teacher_id] }));
  },

  async postAnnouncement(
    classroomId: string,
    teacherId: string,
    title: string,
    body: string
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from('announcements')
      .insert({ classroom_id: classroomId, teacher_id: teacherId, title, body });
    return { error };
  },

  async getMaterials(classroomId: string): Promise<Material[]> {
    const { data } = await supabase
      .from('materials')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });
    return data ?? [];
  },
};
