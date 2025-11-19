export interface CustomCourseRequest {
  id: number;
  subject: string;
  current_level: 'beginner' | 'intermediate' | 'advanced';
  level_display: string;
  learning_goals: string;
  available_time: string;
  preferred_course_type: 'individual' | 'family' | 'group_private' | 'group_public';
  course_type_display: string;
  expected_budget: string;
  additional_details: string;
  status: 'pending' | 'approved' | 'rejected';
  status_display: string;
  supervisor_notes: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  reviewed_by_name: string;
  created_course_title: string;
  created_course_id: number;
  created_at: string;
  updated_at: string;
  reviewed_at: string;
}

export interface CustomCourseRequestResponse {
  count: number;
  next?: string;
  previous?: string;
  results: CustomCourseRequest[];
}

export interface CreateCustomCourseRequestData {
  subject: string;
  current_level: 'beginner' | 'intermediate' | 'advanced';
  learning_goals: string;
  available_time: string;
  preferred_course_type: 'individual' | 'family' | 'group_private' | 'group_public';
  expected_budget?: string; // Optional for API compatibility
  additional_details: string;
}

export interface ApproveCustomCourseRequestData {
  notes: string;
}

export interface RejectCustomCourseRequestData {
  notes: string;
}
