// Types for Live Course Edit Requests API (/live-courses/edit-requests/)

export interface LiveCourseEditRequest {
  id: string;
  course: string;
  course_title: string;
  requested_by: number;
  teacher_name: string;
  teacher_email: string;
  status: 'pending' | 'approved' | 'rejected';
  status_display: string;
  old_data: string; // JSON string
  new_data: string; // JSON string
  changes_summary: string;
  teacher_notes: string;
  reviewed_by?: number;
  reviewer_name?: string;
  supervisor_notes?: string;
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
  updated_at: string;
}

export interface LiveCourseEditRequestListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: LiveCourseEditRequest[];
}

export interface CreateLiveCourseEditRequestData {
  title?: string;
  description?: string;
  learning_outcomes?: string;
  topics?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  teacher_notes?: string;
}

export interface ReviewLiveCourseEditRequestData {
  action: 'approve' | 'reject';
  supervisor_notes?: string;
  rejection_reason?: string;
}

export interface CompareEditRequestResponse {
  [key: string]: {
    old: any;
    new: any;
  };
}


