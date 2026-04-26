import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'teacher';

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

/**
 * Signs in a user with email and password via Supabase Auth.
 * Used for both Student (LRN-based email) and Teacher logins.
 */
export async function loginWithEmail(credentials: LoginCredentials): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
  });

  return {
    user: data?.user ?? null,
    session: data?.session ?? null,
    error,
  };
}

/**
 * Signs out the currently authenticated user and clears the local session.
 */
export async function logout(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Returns the currently active session, or null if not authenticated.
 */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Returns the currently authenticated user, or null.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
