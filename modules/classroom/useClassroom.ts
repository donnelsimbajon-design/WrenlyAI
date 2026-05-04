import { EVENTS, useEventBus } from '@/modules/events/eventBus';
import { supabase } from '@/services/supabase';
import { create } from 'zustand';
import { Announcement, Classroom, ClassroomMember, ClassroomService, Material } from './classroom.service';

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
  subscriptionsActive: boolean;

  // Actions
  fetchMyClassrooms: (userId: string, role: 'teacher' | 'student') => Promise<void>;
  fetchClassroom: (id: string) => Promise<void>;
  fetchMembers: (classroomId: string) => Promise<void>;
  fetchAnnouncements: (classroomId: string) => Promise<void>;
  fetchMaterials: (classroomId: string) => Promise<void>;
  subscribeToUpdates: (classroomId: string) => Promise<void>;
  unsubscribeFromUpdates: () => void;
  createClassroom: (name: string, subject: string, teacherId: string) => Promise<{ classroom: Classroom | null; error: any }>;
  joinClassroom: (code: string, studentId: string) => Promise<{ classroom: Classroom | null; error: any }>;
  postAnnouncement: (classroomId: string, teacherId: string, title: string, body: string) => Promise<{ error: any }>;
  clearError: () => void;
  clearCurrent: () => void;
}

// Track active subscriptions
let subscriptions: any[] = [];
let eventBusUnsubscribers: Array<() => void> = [];

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
  subscriptionsActive: false,

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
    try {
      const members = await ClassroomService.getMembers(classroomId);
      set({ members });
    } catch (err: any) {
      console.error('Error fetching members:', err);
    }
  },

  fetchAnnouncements: async (classroomId) => {
    try {
      const announcements = await ClassroomService.getAnnouncements(classroomId);
      set({ announcements });
    } catch (err: any) {
      console.error('Error fetching announcements:', err);
    }
  },

  fetchMaterials: async (classroomId) => {
    try {
      const materials = await ClassroomService.getMaterials(classroomId);
      set({ materials });
    } catch (err: any) {
      console.error('Error fetching materials:', err);
    }
  },

  subscribeToUpdates: async (classroomId) => {
    try {
      // Unsubscribe from any previous subscriptions
      get().unsubscribeFromUpdates();

      // Subscribe to new materials
      const materialSub = supabase.channel(`materials:${classroomId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'materials', filter: `classroom_id=eq.${classroomId}` },
          (payload: any) => {
            set((state) => ({
              materials: [payload.new, ...state.materials],
            }));
            useEventBus.getState().emit(EVENTS.MATERIAL_ADDED, payload.new);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'materials', filter: `classroom_id=eq.${classroomId}` },
          (payload: any) => {
            set((state) => ({
              materials: state.materials.map((m) => 
                m.id === payload.new.id ? payload.new : m
              ),
            }));
            useEventBus.getState().emit(EVENTS.MATERIAL_UPDATED, payload.new);
          }
        )
        .subscribe();

      subscriptions.push(materialSub);

      // Subscribe to new announcements
      const announcementSub = supabase.channel(`announcements:${classroomId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'announcements', filter: `classroom_id=eq.${classroomId}` },
          (payload: any) => {
            set((state) => ({
              announcements: [payload.new, ...state.announcements],
            }));
            useEventBus.getState().emit(EVENTS.ANNOUNCEMENT_ADDED, payload.new);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'announcements', filter: `classroom_id=eq.${classroomId}` },
          (payload: any) => {
            set((state) => ({
              announcements: state.announcements.map((a) => 
                a.id === payload.new.id ? payload.new : a
              ),
            }));
            useEventBus.getState().emit(EVENTS.ANNOUNCEMENT_UPDATED, payload.new);
          }
        )
        .subscribe();

      subscriptions.push(announcementSub);

      // Subscribe to new enrollments (for teachers to see new students)
      const enrollmentSub = supabase.channel(`enrollments:${classroomId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'enrollments', filter: `classroom_id=eq.${classroomId}` },
          (payload: any) => {
            // Refresh members list
            get().fetchMembers(classroomId);
            useEventBus.getState().emit(EVENTS.ENROLLMENT_ADDED, payload.new);
          }
        )
        .subscribe();

      subscriptions.push(enrollmentSub);

      // Listen to event bus for local updates
      const materialEventUnsub = useEventBus.getState().on(EVENTS.MATERIAL_ADDED, (material) => {
        if (material.classroom_id === classroomId) {
          set((state) => ({
            materials: [material, ...state.materials],
          }));
        }
      });

      const announcementEventUnsub = useEventBus.getState().on(EVENTS.ANNOUNCEMENT_ADDED, (announcement) => {
        if (announcement.classroom_id === classroomId) {
          set((state) => ({
            announcements: [announcement, ...state.announcements],
          }));
        }
      });

      eventBusUnsubscribers.push(materialEventUnsub);
      eventBusUnsubscribers.push(announcementEventUnsub);

      set({ subscriptionsActive: true });
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
    }
  },

  unsubscribeFromUpdates: () => {
    subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
    subscriptions = [];

    eventBusUnsubscribers.forEach((unsub) => {
      unsub();
    });
    eventBusUnsubscribers = [];

    set({ subscriptionsActive: false });
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
      // Fetch new announcements to update list
      await get().fetchAnnouncements(classroomId);
      useEventBus.getState().emit(EVENTS.ANNOUNCEMENT_ADDED, {
        classroom_id: classroomId,
        teacher_id: teacherId,
        title,
        body,
      });
    }
    return result;
  },

  clearError: () => set({ error: null }),
  clearCurrent: () => {
    get().unsubscribeFromUpdates();
    set({ 
      currentClassroom: null, 
      members: [], 
      announcements: [], 
      materials: [] 
    });
  },
}));
