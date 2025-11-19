/**
 * 🎥 Live Sessions Type Definitions
 * Defines all types for the live teaching sessions feature
 */

export type SessionType = 'general' | 'course_lesson';

export interface Session {
  id: number;
  session_id: string;
  title: string;
  session_type: SessionType;
  duration_minutes: 30 | 60;
  
  // Relations
  course?: string;
  course_title?: string;
  course_details?: string;
  
  lesson?: string;
  lesson_title?: string;
  lesson_details?: string;
  
  batch?: string;
  batch_details?: string;
  
  // Creator info
  created_by: number;
  created_by_name?: string;
  created_by_details?: string;
  
  // Timestamps
  created_at: string;
  started_at?: string;
  expires_at: string;
  last_participant_left_at?: string;
  
  // Status
  is_active: boolean;
  session_status?: 'created' | 'active' | 'ended' | 'closed_automatically';
  participant_count: number;
  remaining_time?: string;
  
  // Extension tracking
  has_been_extended?: boolean;
  extension_count?: number;
}

export interface CreateSessionPayload {
  title: string;
  session_type: SessionType;
  duration_minutes: 30 | 60;
  course?: string;
  lesson?: string;
  batch?: string;
}

export interface SessionConnectionDetails {
  livekit_url?: string;
  token?: string;
  room_name?: string;
  [key: string]: any;
}

export interface SessionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Session[];
}

export interface SessionLog {
  id: number;
  session: string;
  user: number;
  user_name?: string;
  event_type: 'join' | 'leave';
  timestamp: string;
}

export interface SessionStatistics {
  session_id: string;
  total_duration_minutes: number;
  actual_duration_minutes: number;
  teacher_name: string;
  student_count: number;
  join_events: number;
  leave_events: number;
  started_at: string;
  ended_at?: string;
}

export interface LessonOption {
  id: string;
  title: string;
  unit_title?: string;
}

export interface SessionTimerState {
  remainingSeconds: number;
  isRunning: boolean;
  canExtend: boolean;
  hasBeenExtended: boolean;
}

export interface SessionError {
  detail?: string;
  error?: string;
  message?: string;
}
