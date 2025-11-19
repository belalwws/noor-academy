// Types for Live Course Creation

export interface Unit {
  id: string;
  title: string;
  description: string;
  order: number;
  apiId?: string; // API ID if unit is saved to backend
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  learning_outcomes: string;
  order: number;
  // For recorded courses - video upload
  videoFile?: File | null;
  videoFileName?: string;
  videoUploadUrl?: string;
  videoUploaded?: boolean;
  bunnyVideoId?: string;
  apiId?: string; // API ID after creation
}

export interface KnowledgeLabData {
  enabled: boolean;
  title: string;
  description: string;
  objective: string;
  topics: string;
  country: string;
  subject: string;
  academic_year: string;
  thumbnail: File | null;
  thumbnailPreview?: string;
  cover_image: File | null;
  coverImagePreview?: string;
}

export interface CourseFormData {
  // Step 1: Basic Info
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  accepting_applications: boolean;
  price?: string; // For recorded courses only
  thumbnail: File | null;
  thumbnailPreview?: string;
  cover_image: File | null;
  coverImagePreview?: string;
  
  // Step 2: Learning Details
  learning_outcomes: string;
  topics: string;
  intro_session_id: string;
  
  // Step 3: Units
  units: Unit[];
  
  // Step 4: Lessons
  lessons: Lesson[];
  
  // Step 6: Knowledge Lab (optional)
  knowledgeLab?: KnowledgeLabData;
}

export interface StepConfig {
  id: number;
  title: string;
  icon: any;
}

export interface StepProps {
  formData: CourseFormData;
  updateFormData: (field: keyof CourseFormData, value: any) => void;
  courseType?: string;
}

// API Response Types
export interface CourseApiResponse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  cover_image: string;
  learning_outcomes: string;
  topics: string;
  intro_session_id: string;
  teacher: number;
  teacher_name: string;
  teacher_id: string;
  status: string;
  approval_status: string;
  approval_status_display: string;
  start_date: string;
  end_date: string;
  accepting_applications: boolean;
  is_hidden: boolean;
  batches_count: string;
  total_students: string;
  created_at: string;
  updated_at: string;
}

export interface UnitApiResponse {
  id: string;
  course: string;
  title: string;
  description: string;
  order: number;
}

export interface LessonApiResponse {
  id: string;
  unit: string;
  title: string;
  description: string;
  learning_outcomes: string;
  order: number;
}

