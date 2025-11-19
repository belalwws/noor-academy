// 🔒 Authentication Types for Lisan-Alhekma
// Type-safe interfaces matching Django backend

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role?: 'student' | 'teacher' | 'supervisor' | 'general_supervisor' | 'academic_supervisor' | 'admin'; // Optional since backend might not always send it
  is_verified: boolean;
  is_email_verified?: boolean; // Email verification status
  is_active: boolean;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
  // Django backend specific fields
  is_staff?: boolean;
  is_superuser?: boolean;
  last_login?: string | null;
  date_joined?: string;
  // Optional fields from backend
  age?: number;
  gender?: string;
  phone?: string;
  learning_goal?: string;
  preferred_language?: string;
  bio?: string;
  is_profile_complete?: boolean;
  is_profile_public?: boolean;
  profile_image_thumbnail_url?: string;
  // Teacher specific fields
  specialization?: string;
  qualifications?: string;
  years_of_experience?: number;
  primary_teaching_language?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthData {
  user: User;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: Record<string, string[]>;
  // DRF pagination
  results?: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export interface TokenRefreshResponse {
  access: string;
  refresh?: string;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}
