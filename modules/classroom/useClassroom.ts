import { create } from 'zustand';
import { useAuth } from '@/modules/security/useAuth';
import { ClassroomService, Classroom, ClassroomMember, Announcement, Material } from './classroom.service';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClassroomState {
  classrooms: Classroom[];
  currentClassroom: Classroom | null;
  members: ClassroomMember[];
  announcements: Announcement[];
  materials: Material[];
  isLoading: boolean;
  isCreating: boolean;
  isJoining: boolean;
  error: string | null;

  // Actions
  fetchMyClassrooms: (userId: string, role: 'teacher' | 'student') => Promise<void>;
  fetchClassroom: (id: string) => Promise<void>;
  fetchMembers: (classroomId: string) => Promise<void>;
  fetchAnnouncements: (classroomId: string) => Promise<void>;
  fetchMaterials: (classroomId: string) => Promise<void>;
  createClassroom: (name: string, subject: string, teacherId: string) => Promise<{ classroom: Classroom | null; error: any }>;
  joinClassroom: (code: string, studentId: string) => Promise<{ classroom: Classroom | null; error: any }>;
  postAnnouncement: (classroomId: string, teacherId: string, title: string, body: string) => Promise<{ error: any }>;
  clearError: () => void;
  clearCurrent: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useClassroom = create<ClassroomState>((set, get) => ({
  classrooms: [],
  currentClassroom: null,
  members: [],
  announcements: [],
  materials: [],
  isLoading: false,
  isCreating: false,
  isJoining: false,
  error: null,

  fetchMyClassrooms: async (userId, role) => {
    set({ isLoading: true, error: null });
    try {
      const classrooms = await ClassroomService.getMyClassrooms(userId, role);
      set({ classrooms });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchClassroom: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { classroom, error } = await ClassroomService.getClassroomById(id);
      if (error) throw error;
      set({ currentClassroom: classroom });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMembers: async (classroomId) => {
    const members = await ClassroomService.getMembers(classroomId);
    set({ members });
  },

  fetchAnnouncements: async (classroomId) => {
    const announcements = await ClassroomService.getAnnouncements(classroomId);
    set({ announcements });
  },

  fetchMaterials: async (classroomId) => {
    const materials = await ClassroomService.getMaterials(classroomId);
    set({ materials });
  },

  createClassroom: async (name, subject, teacherId) => {
    set({ isCreating: true, error: null });
    try {
      const result = await ClassroomService.createClassroom(name, subject, teacherId);
      if (!result.error && result.classroom) {
        set((state) => ({ classrooms: [result.classroom!, ...state.classrooms] }));
      }
      return result;
    } catch (err: any) {
      set({ error: err.message });
      return { classroom: null, error: err };
    } finally {
      set({ isCreating: false });
    }
  },

  joinClassroom: async (code, studentId) => {
    set({ isJoining: true, error: null });
    try {
      const result = await ClassroomService.joinClassroom(code, studentId);
      if (!result.error && result.classroom) {
        set((state) => ({ classrooms: [...state.classrooms, result.classroom!] }));
      }
      return result;
    } catch (err: any) {
      set({ error: err.message });
      return { classroom: null, error: err };
    } finally {
      set({ isJoining: false });
    }
  },

  postAnnouncement: async (classroomId, teacherId, title, body) => {
    const result = await ClassroomService.postAnnouncement(classroomId, teacherId, title, body);
    if (!result.error) {
      // Refresh announcements
      const announcements = await ClassroomService.getAnnouncements(classroomId);
      set({ announcements });
    }
    return result;
  },

  clearError: () => set({ error: null }),
  clearCurrent: () => set({ currentClassroom: null, members: [], announcements: [], materials: [] }),
}));
