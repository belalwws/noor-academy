/**
 * Knowledge Lab Types
 * TypeScript interfaces for Knowledge Lab system
 */

// ============================================
// Knowledge Lab
// ============================================

export interface KnowledgeLab {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  cover_image: string | null;
  objective: string;
  topics: string;
  is_standalone: boolean;
  course_type: 'live' | 'recorded' | null;
  course_id: string | null;
  country: string | null;
  subject: string | null;
  academic_year: string | null;
  price: string | null;
  status: 'pending' | 'approved' | 'rejected';
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateKnowledgeLabRequest {
  title: string;
  description: string;
  thumbnail?: string;
  cover_image?: string;
  objective: string;
  topics?: string;
  is_standalone: boolean;
  course_type?: 'live' | 'recorded';
  course_id?: string;
  country?: string;
  subject?: string;
  academic_year?: string;
  price?: number;
}

// ============================================
// Questions
// ============================================

export type QuestionType = 'multiple_choice' | 'true_false';

export interface Question {
  id: string;
  quiz?: string; // Knowledge Lab ID (UUID) - optional for backward compatibility
  knowledge_lab?: string; // Knowledge Lab ID (UUID)
  question_type: QuestionType;
  question_type_display: string;
  question_text?: string; // Legacy field name
  text?: string; // API field name
  choices?: string; // JSON string of choices - legacy
  options?: any; // JSON array of options - new format
  correct_answer: string | string[]; // Can be string or array
  points: number;
  order: number;
  explanation?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedQuestionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Question[];
}

export interface CreateQuestionRequest {
  quiz: string; // Knowledge Lab ID (UUID)
  question_type: QuestionType;
  question_text: string;
  choices: string; // JSON string like '["A", "B", "C", "D"]'
  correct_answer: string;
  points: number;
  order?: number;
  explanation?: string;
}

// ============================================
// Exercises
// ============================================

export type ExerciseLevel = 'lesson' | 'unit' | 'course';
export type ExerciseType = 'practice' | 'quiz' | 'exam';

// ============================================
// Student Attempts
// ============================================

export interface StudentAnswer {
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
  points_earned: number;
}

export interface ExerciseAttempt {
  id: string;
  exercise_id: string;
  student_id: string;
  started_at: string;
  completed_at: string | null;
  score: number;
  total_points: number;
  percentage: number;
  passed: boolean;
  time_taken: number; // in seconds
  answers: StudentAnswer[];
}

export interface SubmitExerciseRequest {
  exercise_id: string;
  answers: {
    question_id: string;
    selected_option_id: string;
  }[];
}

// ============================================
// Analytics
// ============================================

export interface QuestionAnalytics {
  question_id: string;
  total_attempts: number;
  correct_attempts: number;
  incorrect_attempts: number;
  success_rate: number;
  average_time: number;
}

export interface ExerciseAnalytics {
  exercise_id: string;
  total_attempts: number;
  completed_attempts: number;
  average_score: number;
  pass_rate: number;
  average_time: number;
  question_analytics: QuestionAnalytics[];
}

export interface LabAnalytics {
  lab_id: string;
  total_students: number;
  total_exercises: number;
  total_questions: number;
  total_attempts: number;
  average_completion_rate: number;
  exercise_analytics: ExerciseAnalytics[];
}

// ============================================
// Enrollment
// ============================================

export interface LabEnrollment {
  id: string;
  lab_id: string;
  student_id: string;
  enrolled_at: string;
  last_activity: string | null;
  progress: number; // percentage
  completed_exercises: number;
  total_exercises: number;
}

// ============================================
// Form States
// ============================================

export interface KnowledgeLabFormData {
  title: string;
  description: string;
  thumbnail: string;
  cover_image: string;
  objective: string;
  topics: string;
  is_standalone: boolean;
  course_type: string | null;
  course_id: string | null;
  country: string;
  subject: string;
  academic_year: string;
  price: string;
}

export interface QuestionFormData {
  question_text: string;
  question_type: QuestionType;
  points: number;
  choices: string;
  correct_answer: string;
  order?: number;
  explanation: string;
}

export interface ExerciseFormData {
  title: string;
  description: string;
  exercise_type: ExerciseType;
  level: ExerciseLevel;
  level_id: string;
  time_limit: string;
  passing_score: string;
  max_attempts: string;
  selected_questions: string[];
  is_published: boolean;
}
