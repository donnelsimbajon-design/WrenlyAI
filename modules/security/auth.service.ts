import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import { UserRole, LoginCredentials, RegisterCredentials } from '@/types/auth.types';

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * Signs up a new user and creates their profile with the selected role.
 */
export async function signUp(credentials: RegisterCredentials): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
    options: {
      data: {
        full_name: credentials.fullName,
        role: credentials.role,
        school: credentials.school,
        grade_level: credentials.gradeLevel,
      },
    },
  });

  if (!error && data.user) {
    // Immediately upsert the profile so it exists even before email confirmation
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: credentials.fullName,
      role: credentials.role,
    }, { onConflict: 'id' });
  }

  return {
    user: data?.user ?? null,
    session: data?.session ?? null,
    error,
  };
}

/**
 * Signs in a user with email and password via Supabase Auth.
 */
export async function signIn(credentials: LoginCredentials): Promise<AuthResult> {
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
export async function signOut(): Promise<{ error: AuthError | null }> {
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

/**
 * Fetch the user's profile from the profiles table.
 */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { profile: data, error };
}
