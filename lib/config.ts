/**
 * Professional Configuration Setup
 * ------------------------------
 * This setup provides a scalable and maintainable way to manage application settings
 * across different environments (development, production, staging, etc.).
 */

// 1. Define the application environments
type Environment = 'development' | 'production' | 'staging';

// 2. Determine the current environment
const getCurrentEnvironment = (): Environment => {
  // Use NEXT_PUBLIC_APP_ENV to determine which environment config to use
  const appEnv = process.env['NEXT_PUBLIC_APP_ENV'];
  if (appEnv === 'production') return 'production';
  if (appEnv === 'staging') return 'staging';
  return 'development';
};

export const CURRENT_ENV = getCurrentEnvironment();

// 3. Define the structure for our configuration
interface AppConfig {
  readonly apiUrl: string;
  readonly livekitUrl: string;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
}

// 4. Get base API URL from environment variable
const getBaseApiUrl = (): string => {
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
  const appEnv = process.env['NEXT_PUBLIC_APP_ENV'] || 'development';
  
  return apiUrl;
};

// 4b. Get LiveKit URL from environment variable
const getBaseLivekitUrl = (): string => {
  return process.env['NEXT_PUBLIC_LIVEKIT_URL'] || 'ws://localhost:7880';
};

// 5. Create environment-specific configurations
const configurations: Record<Environment, AppConfig> = {
  development: {
    apiUrl: getBaseApiUrl(),
    livekitUrl: getBaseLivekitUrl(),
    isDevelopment: true,
    isProduction: false,
  },
  production: {
    apiUrl: getBaseApiUrl(),
    livekitUrl: getBaseLivekitUrl(),
    isDevelopment: false,
    isProduction: true,
  },
  staging: {
    apiUrl: getBaseApiUrl(),
    livekitUrl: getBaseLivekitUrl(),
    isDevelopment: false,
    isProduction: false,
  },
};

// 6. Export the configuration for the current environment
export const Config: AppConfig = configurations[CURRENT_ENV];

// 7. Define API endpoints in a separate, clean object
export const Endpoints = {
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  LOGOUT: '/auth/logout/',
  USER_PROFILE: '/auth/profile/',
  CHANGE_PASSWORD: '/auth/profile/change-password/',
  TOKEN_REFRESH: '/auth/token/refresh/',
  TOKEN: '/auth/token/',
  SEND_EMAIL_VERIFICATION: '/auth/email-verification/send/',
  CONFIRM_EMAIL_VERIFICATION: '/auth/email-verification/confirm',
  FORGOT_PASSWORD: '/auth/email-verification/send/',
  RESET_PASSWORD: '/auth/email-verification/confirm',
  UPLOAD_IMAGE: '/auth/profile/image/upload/',
  DELETE_IMAGE: '/auth/profile/image/delete/',
  GET_IMAGE_URLS: '/auth/profile/image/urls/',
  TEACHER_REGISTER: '/teachers/register/',
  TEACHER_PROFILE: '/teachers/profile', 
  TEACHER_SESSIONS: '/teachers/sessions/',
  TEACHER_UPLOAD_IMAGE: '/teachers/upload-image/',
  TEACHER_DELETE_IMAGE: '/teachers/delete-image/',
  TEACHER_STATS: '/teachers/stats/',
  // Supervisor Shared Endpoints
  SUPERVISOR_PROFILE: '/supervisors/profile/',
  SUPERVISOR_PROFILE_COMPLETION: '/supervisors/profile/complete/',
  SUPERVISOR_PROFILE_STATUS: '/supervisors/profile/status/',
  SUPERVISOR_SETUP_PASSWORD: '/supervisors/setup-password/',
  SUPERVISOR_VALIDATE_TOKEN: '/supervisors/validate-token/',
  SUPERVISOR_CHECK_COMPLETION: '/supervisors/check-completion/',

  // General Supervisor Management Endpoints
  GENERAL_SUPERVISOR_DASHBOARD_STATS: '/supervisors/general/dashboard/statistics/',
  GENERAL_SUPERVISOR_INVITE_ACADEMIC: '/supervisors/general/invite-academic/',
  GENERAL_SUPERVISOR_ACADEMIC_SUPERVISORS: '/supervisors/general/academic-supervisors/',
  GENERAL_SUPERVISOR_PENDING_INVITATIONS: '/supervisors/general/pending-invitations/',
  GENERAL_SUPERVISOR_PENDING_TEACHERS: '/supervisors/general/pending-teachers/',
  GENERAL_SUPERVISOR_APPROVED_TEACHERS: '/supervisors/general/approved-teachers/',
  GENERAL_SUPERVISOR_APPROVE_TEACHER: '/supervisors/general/approve-teacher/',
  GENERAL_SUPERVISOR_REJECT_TEACHER: '/supervisors/general/reject-teacher/',
  GENERAL_SUPERVISOR_REVOKE_INVITATION: '/supervisors/general/revoke-invitation/',

  // General Supervisor Course Management Endpoints
  GENERAL_SUPERVISOR_PENDING_COURSES: '/live-education/courses/pending-for-supervisor/',
  GENERAL_SUPERVISOR_APPROVE_COURSE: '/live-education/courses/',
  GENERAL_SUPERVISOR_REJECT_COURSE: '/live-education/courses/',

  // Academic Supervisor Management Endpoints
  ACADEMIC_SUPERVISOR_DASHBOARD_STATS: '/supervisors/academic/dashboard/statistics/',
  ACADEMIC_SUPERVISOR_ASSIGNED_TEACHERS: '/supervisors/academic/assigned-teachers/',
  ACADEMIC_SUPERVISOR_TEACHER_COURSES: '/supervisors/academic/teacher-courses/',
  ACADEMIC_SUPERVISOR_TEACHER_STUDENTS: '/supervisors/academic/teacher-students/',
  ACADEMIC_SUPERVISOR_APPROVE_TEACHER: '/supervisors/academic/approve-teacher/',
  ACADEMIC_SUPERVISOR_REJECT_TEACHER: '/supervisors/academic/reject-teacher/',

  // Course Management Endpoints (New API)
  COURSES_LIST: '/live-education/courses/',
  COURSES_CREATE: '/live-education/courses/',
  COURSES_DETAIL: '/live-education/courses/',
  COURSES_UPDATE: '/live-education/courses/',
  COURSES_DELETE: '/live-education/courses/',
  COURSES_PUBLISH: '/live-education/courses/',

  // Lesson Management Endpoints
  LESSONS_LIST: '/live-education/lessons/',
  LESSONS_CREATE: '/live-education/lessons/',
  LESSONS_DETAIL: '/live-education/lessons/',
  LESSONS_UPDATE: '/live-education/lessons/',
  LESSONS_DELETE: '/live-education/lessons/',

  // Legacy Teacher Statistics (deprecated)
  SUPERVISOR_TEACHER_STATS: '/supervisors/teachers/statistics/',
  NOTIFICATIONS: '/notifications/',
  NOTIFICATION_PREFERENCES: '/notifications/preferences/',
  FAQ: '/faq/',
} as const;

// 8. Helper functions to construct URLs
export const getApiUrl = (endpoint: string): string => {
	const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
	const needsSlash = endpoint.endsWith('/') ? '' : '/';
	return `${Config.apiUrl}/${cleanEndpoint}${needsSlash}`;
};

export const getBaseUrl = (): string => {
  return Config.apiUrl;
};

// Backward-compatible helpers (legacy names)
export const getApiBaseUrl = (): string => {
  return Config.apiUrl;
};

export const getLiveKitUrl = (): string => {
  return Config.livekitUrl;
};

// Server-side only: LiveKit credentials (used by API routes)
export const getLiveKitCredentials = (): { apiKey: string; apiSecret: string } => {
  const apiKey = process.env['LIVEKIT_API_KEY'];
  const apiSecret = process.env['LIVEKIT_API_SECRET'];
  if (!apiKey || !apiSecret) {
    throw new Error('Missing LiveKit credentials (LIVEKIT_API_KEY/SECRET)');
  }
  return { apiKey, apiSecret };
};

// Note: The old API_CONFIG is deprecated in favor of the new `Config` and `Endpoints` objects.
// You will need to update imports in other files, for example:
// OLD: import { API_CONFIG } from './config'; API_CONFIG.API_URL
// NEW: import { Config } from './config'; Config.apiUrl
// OLD: API_CONFIG.ENDPOINTS.LOGIN
// NEW: Endpoints.LOGIN
// Legacy API_CONFIG export for backward compatibility
export const API_CONFIG = {
  API_URL: Config.apiUrl,
  BASE_URL: Config.apiUrl,
  ENDPOINTS: Endpoints
} as const;
