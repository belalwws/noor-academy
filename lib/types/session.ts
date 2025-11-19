export interface LiveSession {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  room_name: string;
  teacher_id: string;
  teacher_name: string;
  max_participants?: number;
  current_participants?: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface SessionParticipant {
  id: string;
  user_id: string;
  session_id: string;
  username: string;
  email: string;
  role: 'teacher' | 'student' | 'supervisor';
  joined_at: string;
  left_at?: string;
  is_active: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: Record<string, any>;
  status?: number;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string | null;
  previous?: string | null;
  page: number;
  page_size: number;
}
