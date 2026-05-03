export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  email?: string;
  school?: string;
  grade_level?: number;
  avatar_url?: string;
  created_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  school?: string;
  gradeLevel?: number;
}
