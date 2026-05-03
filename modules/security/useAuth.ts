import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';
import { UserProfile, UserRole, LoginCredentials, RegisterCredentials } from '@/types/auth.types';
import * as authService from './auth.service';

const WELCOME_KEY = '@wrenly:hasSeenWelcome';

interface AuthState {
  user: any | null;
  profile: UserProfile | null;
  role: UserRole | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSeenWelcome: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  completeWelcome: () => Promise<void>;
  signIn: (credentials: LoginCredentials) => Promise<{ error: any | null }>;
  signUp: (credentials: RegisterCredentials) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  role: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  hasSeenWelcome: false,

  completeWelcome: async () => {
    try {
      await AsyncStorage.setItem(WELCOME_KEY, 'true');
    } catch (_) {}
    set({ hasSeenWelcome: true });
  },

  initialize: async () => {
    try {
      // Check if user has seen the welcome screen
      try {
        const seen = await AsyncStorage.getItem(WELCOME_KEY);
        if (seen === 'true') {
          set({ hasSeenWelcome: true });
        }
      } catch (_) {
        // AsyncStorage unavailable — treat as not seen
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      set({ session, user: session?.user ?? null, isAuthenticated: !!session?.user });

      if (session?.user) {
        const { profile } = await authService.getProfile(session.user.id);
        if (profile) {
          set({ profile: profile as UserProfile, role: profile.role as UserRole });
        }
      }

      // Listen for auth state changes (e.g., token refresh)
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        set({ session: newSession, user: newSession?.user ?? null, isAuthenticated: !!newSession?.user });
        
        if (newSession?.user) {
          const { profile } = await authService.getProfile(newSession.user.id);
          if (profile) {
            set({ profile: profile as UserProfile, role: profile.role as UserRole });
          }
        } else {
          set({ profile: null, role: null });
        }
        set({ isLoading: false });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (credentials) => {
    set({ isLoading: true });
    try {
      const { user, session, error } = await authService.signIn(credentials);
      if (error) throw error;
      
      set({ session, user, isAuthenticated: true });

      // Fetch profile to get the role
      if (user) {
        const { profile } = await authService.getProfile(user.id);
        if (profile) {
          set({ profile: profile as UserProfile, role: profile.role as UserRole });
        }
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (credentials) => {
    set({ isLoading: true });
    try {
      const { user, session, error } = await authService.signUp(credentials);
      if (error) throw error;
      
      // If session is null, email confirmation is still required in Supabase settings.
      if (!session) {
        throw new Error(
          'Registration succeeded but email confirmation is required.\n\n' +
          'To fix this: Go to your Supabase Dashboard → Authentication → Providers → Email → Disable "Confirm email".'
        );
      }

      set({ session, user, isAuthenticated: !!user });

      if (user) {
        const { profile } = await authService.getProfile(user.id);
        if (profile) {
          set({ profile: profile as UserProfile, role: profile.role as UserRole });
        } else {
          // Fallback: use the role from the credentials
          set({ role: credentials.role });
        }
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    await authService.signOut();
    try {
      await AsyncStorage.removeItem(WELCOME_KEY);
    } catch (_) {}
    set({ user: null, profile: null, role: null, session: null, isAuthenticated: false, isLoading: false, hasSeenWelcome: false });
  },
}));
