import { create } from 'zustand';

export interface UserProfile {
  id: string;
  role: 'teacher' | 'student';
  full_name: string;
  lrn?: string;
  grade_level?: number;
  school_id?: string;
  parental_consent?: boolean;
}

interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isLoading: boolean;
  setSession: (session: any | null) => void;
  setUser: (user: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, session: null }),
}));
