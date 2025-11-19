/**
 * Live Education Types
 * Complete type definitions for Live Education System
 */

// ==================== ENUMS ====================

export type CourseStatus = 'pending' | 'approved' | 'rejected' | 'published';
export type CourseType = 'individual' | 'family' | 'private-group' | 'public-group';
export type BatchType = 'individual' | 'group';
export type StudentStatus = 'pending' | 'active' | 'suspended' | 'completed' | 'withdrawn';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type PaymentReviewStatus = 'pending_review' | 'paid' | 'rejected';
export type LearningType = 'individual' | 'group';
export type EnrollmentStatus = 'pending_payment' | 'paid_no_batch' | 'enrolled' | 'completed' | 'withdrawn';

// ==================== COURSE ====================

export interface LiveCourse {
  id: string;
  title: string;
  description: string;
  learning_outcomes?: string;
  subjects?: string;
  course_type?: CourseType;
  course_type_display?: string;
  teacher: number;
  teacher_name: string;
  teacher_id?: string;
  teacher_email?: string;
  status: CourseStatus;
  approval_status?: string;
  approval_status_display?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  start_date?: string;
  end_date?: string;
  accepting_applications: boolean;
  is_published?: boolean;
  trial_session_url?: string;
  max_students?: string | number;
  batches_count: string | number;
  total_students: string | number;
  enrolled_count?: number;
  created_at: string;
  updated_at: string;
  batches?: string | Batch[];
  lessons?: Lesson[];
}

export interface CreateCourseInput {
  title: string;
  description: string;
  learning_outcomes?: string;
  subjects?: string;
  course_type?: CourseType;
  start_date?: string;
  end_date?: string;
  trial_session_url?: string;
  max_students?: number;
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {
  rejection_reason?: string;
  accepting_applications?: boolean;
}

// ==================== LESSON ====================

export interface Lesson {
  id: string;
  course: string;
  course_title?: string;
  title: string;
  description: string;
  order: number;
  duration_minutes?: number | null;
  objectives?: string;
  materials?: string;
  homework?: string;
  sessions_count?: number | string;
  created_at: string;
  updated_at: string;
}

export interface CreateLessonInput {
  course: string;
  title: string;
  description: string;
  order: number;
  duration_minutes?: number;
  objectives?: string;
  materials?: string;
  homework?: string;
  sessions_count?: number;
}

// ==================== BATCH (المجموعة) ====================

export interface Batch {
  id: string;
  name: string;
  course: string;
  course_title?: string;
  course_description?: string; // API field
  teacher?: string; // Teacher ID
  teacher_name?: string; // API field
  batch_type?: BatchType; // Legacy field
  type?: BatchType; // API field: 'individual' | 'group'
  max_students: number;
  current_students?: number; // Legacy field
  students_count?: number | string; // API field
  is_full?: boolean;
  description?: string;
  schedule?: string;
  meeting_link?: string;
  start_date?: string; // API field
  end_date?: string; // API field
  duration?: string; // API field
  level?: string; // API field
  status: 'active' | 'closed' | 'inactive' | 'completed'; // API uses 'active' | 'closed'
  created_at: string;
  updated_at?: string;
  students?: BatchStudent[];
}

export interface CreateBatchInput {
  name: string;
  course: string;
  batch_type?: BatchType; // Legacy field
  type?: BatchType; // API field: 'individual' | 'group'
  status?: 'active' | 'closed'; // API field
  max_students?: number; // Default: 200 for group, 1 for individual
  description?: string;
  schedule?: string;
  meeting_link?: string;
}

export interface UpdateBatchInput extends Partial<CreateBatchInput> {
  status?: 'active' | 'closed' | 'inactive' | 'completed';
}

// ==================== BATCH STUDENT ====================

export interface BatchStudent {
  id: string;
  batch: string;
  batch_name?: string;
  student: string | number; // API returns UUID string
  student_name: string;
  student_email: string;
  status: StudentStatus;
  joined_at?: string; // Legacy field
  created_at?: string; // API field
  added_by?: number; // API field
  added_by_name?: string; // API field
  completed_at?: string;
  withdrawn_at?: string;
  notes?: string;
  payment_status?: PaymentStatus;
  updated_at?: string;
}

export interface AddStudentToBatchInput {
  batch: string;
  student: string | number; // API accepts UUID string
  notes?: string;
}

export interface StudentStatusUpdateInput {
  notes?: string;
  reason?: string;
  batch?: string; // Optional for some endpoints
  student?: string; // Optional for some endpoints
  status?: string; // Optional for some endpoints
}

// ==================== BATCH HISTORY ====================

export interface BatchHistory {
  id: string;
  course?: string; // API field
  course_title?: string; // API field
  student: string | number; // API returns UUID string
  student_name: string;
  from_batch?: string;
  from_batch_name?: string;
  to_batch?: string; // API field (optional for removed)
  to_batch_name?: string; // API field
  action: 'added' | 'removed' | 'moved'; // API field
  performed_by?: number; // API field
  performed_by_name?: string; // API field
  moved_by?: number; // Legacy field
  moved_by_name?: string; // Legacy field
  reason?: string;
  timestamp?: string; // API field
  moved_at?: string; // Legacy field
}

// ==================== ENROLLMENT & APPLICATION ====================

export interface CourseApplication {
  id: string;
  student: string;
  student_name: string;
  student_email: string;
  course: string;
  course_title: string;
  preferred_type: 'individual' | 'group';
  notes?: string;
  status: ApplicationStatus;
  accepted_by?: number;
  accepted_by_name?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student: number;
  student_name: string;
  student_email: string;
  course: string;
  course_title: string;
  batch?: string;
  batch_name?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  enrolled_at: string;
  payment_status: PaymentStatus;
  payment_verified: boolean;
  education_type?: 'individual' | 'group';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEnrollmentInput {
  course: string;
  preferred_type?: 'individual' | 'group';
  notes?: string;
}

export interface VerifyPaymentInput {
  enrollment: string;
  receipt_image: File;
  education_type: 'individual' | 'group';
  notes?: string;
}

export interface PendingStudent {
  id: string;
  student_id: number;
  student_name: string;
  student_email: string;
  enrollment_id: string;
  payment_status: PaymentStatus;
  applied_at: string;
  notes?: string;
}

// ==================== FAMILY ENROLLMENT ====================

export interface FamilyMember {
  student_name: string;
  student_email: string;
  relationship: string;
  notes: string;
}

export interface FamilyEnrollmentRequest {
  family_name: string;
  course: string;
  requested_members: FamilyMember[];
}

// ==================== PAYMENT STATUS ====================

export interface PaymentStatusInfo {
  id: string;
  course: string;
  course_title: string;
  student: string;
  student_name: string;
  student_email: string;
  status: PaymentReviewStatus;
  status_display: string;
  learning_type: LearningType;
  learning_type_display: string;
  receipt_url: string;
  student_notes?: string;
  reviewed_by?: number;
  reviewed_by_name?: string;
  rejection_reason?: string;
  uploaded_at: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadPaymentReceiptInput {
  course_id: string;
  learning_type: LearningType;
  receipt_url: string;
  student_notes?: string;
}

export interface ReviewPaymentInput {
  status: 'paid' | 'rejected';
  rejection_reason?: string;
}

// ==================== COURSE ENROLLMENT ====================

export interface CourseEnrollmentInfo {
  id: string;
  student_name: string;
  course_title: string;
  status: EnrollmentStatus;
  learning_type?: string;
  learning_type_display?: string;
  current_batch?: string;
  enrolled_at: string;
}

export interface CourseEnrollmentDetails {
  id: string;
  course: string;
  course_title: string;
  student: string;
  student_name: string;
  student_email: string;
  status: EnrollmentStatus;
  status_display: string;
  current_batch?: string;
  current_batch_name?: string;
  payment_info?: PaymentStatusInfo;
  enrolled_at: string;
  updated_at: string;
}

export interface PendingStudentInfo {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  learning_type?: string;
  learning_type_display?: string;
  student_notes?: string;
  enrolled_at: string;
}

// ==================== API RESPONSES ====================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
  non_field_errors?: string[];
}

// ==================== LIVE SESSION ====================

export interface LiveSession {
  id: string;
  batch: string;
  lesson?: string;
  title: string;
  description?: string;
  meeting_link: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  recording_url?: string;
  attendance_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLiveSessionInput {
  batch: string;
  lesson?: string;
  title: string;
  description?: string;
  meeting_link: string;
  scheduled_at: string;
  duration_minutes: number;
}

// ==================== STATISTICS ====================

export interface CourseStatistics {
  total_students: number;
  active_students: number;
  pending_students: number;
  total_batches: number;
  total_lessons: number;
  total_sessions: number;
  completion_rate: number;
  payment_completion_rate: number;
}

export interface BatchStatistics {
  total_students: number;
  active_students: number;
  attendance_rate: number;
  completion_rate: number;
  total_sessions: number;
}

