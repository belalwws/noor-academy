export interface CourseEditRequest {
  id: number;
  course_title: string;
  teacher_name: string;
  reviewer_name?: string;
  current_title: string;
  current_description: string;
  current_course_type: string;
  current_duration_weeks: number;
  title: string;
  description: string;
  learning_outcomes: string;
  subjects: string;
  trial_session_url: string;
  lessons_data: string;
  course_type: 'individual' | 'family' | 'group_private' | 'group_public';
  duration_weeks: number;
  session_duration: number;
  edit_reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  reviewed_at?: string;
  supervisor_notes?: string;
  rejection_reason?: string;
  implemented_at?: string;
  created_at: string;
  updated_at: string;
  course: string;
  requested_by: number;
  reviewed_by?: number;
  implemented_by?: number;
}

export interface CourseEditRequestResponse {
  count: number;
  next?: string;
  previous?: string;
  results: CourseEditRequest[];
}

export interface CreateCourseEditRequestData {
  course: string;
  title: string;
  description: string;
  learning_outcomes: string;
  subjects: string;
  trial_session_url: string;
  edit_reason: string;
  course_type: 'individual' | 'family' | 'group_private' | 'group_public';
  duration_weeks: number;
  session_duration: number;
  lessons_data: string;
}

export interface UpdateCourseEditRequestData {
  title: string;
  description: string;
  learning_outcomes: string;
  subjects: string;
  trial_session_url: string;
  lessons_data: string;
  course_type: 'individual' | 'family' | 'group_private' | 'group_public';
  duration_weeks: number;
  session_duration: number;
  edit_reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  reviewed_at?: string;
  supervisor_notes?: string;
  rejection_reason?: string;
  implemented_at?: string;
  course: string;
  reviewed_by?: number;
  implemented_by?: number;
}

export interface ApproveRequestData {
  notes: string;
}

export interface RejectRequestData {
  reason: string;
  notes: string;
}

export interface ImplementChangesData {
  title: string;
  description: string;
  learning_outcomes: string;
  subjects: string;
  trial_session_url: string;
  lessons_data: string;
  course_type: 'individual' | 'family' | 'group_private' | 'group_public';
  duration_weeks: number;
  session_duration: number;
  edit_reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  reviewed_at?: string;
  supervisor_notes?: string;
  rejection_reason?: string;
  implemented_at?: string;
  course: string;
  reviewed_by?: number;
  implemented_by?: number;
}
