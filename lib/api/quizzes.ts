/**
 * Quizzes API Service
 * Comprehensive API for quiz and question management for teachers
 * 
 * Features:
 * - Create and manage quizzes for recorded lessons and live batches
 * - Create and manage quiz questions
 * - View quiz results and statistics
 */

import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

// ==================== TYPES ====================

export type QuizType = 'recorded_lesson' | 'live_batch';
export type QuestionType = 'multiple_choice' | 'true_false' | 'drag_drop';

// -------- QUIZ TYPES --------
export interface CreateQuizInput {
  title: string;
  description?: string;
  quiz_type: QuizType;
  recorded_lesson?: string; // UUID - required if quiz_type is 'recorded_lesson'
  live_batch?: string; // UUID - required if quiz_type is 'live_batch'
  max_questions?: number;
  allow_retake?: boolean;
  passing_score?: number;
  time_limit?: number; // in seconds
}

export interface UpdateQuizInput extends Partial<CreateQuizInput> {
  is_active?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  quiz_type: QuizType;
  quiz_type_display?: string;
  recorded_lesson?: string;
  lesson_title?: string;
  live_batch?: string;
  batch_name?: string;
  teacher?: number;
  teacher_name?: string;
  max_questions?: number;
  allow_retake: boolean;
  passing_score: number;
  time_limit: number;
  is_active: boolean;
  questions?: QuizQuestion[];
  total_questions?: number;
  total_attempts?: number;
  created_at: string;
  updated_at: string;
}

export interface QuizListItem {
  id: string;
  title: string;
  quiz_type: QuizType;
  quiz_type_display?: string;
  teacher_name?: string;
  total_questions: number;
  allow_retake: boolean;
  passing_score: number;
  time_limit: number;
  is_active: boolean;
  created_at: string;
}

// -------- QUESTION TYPES --------
export interface CreateQuestionInput {
  quiz: string; // UUID
  question_type: QuestionType;
  question_text: string;
  choices?: string; // JSON string for multiple choice options
  correct_answer: string;
  points?: number;
  order?: number;
  explanation?: string;
}

export interface UpdateQuestionInput extends Partial<CreateQuestionInput> {}

export interface QuizQuestion {
  id: string;
  quiz: string;
  question_type: QuestionType;
  question_type_display?: string;
  question_text: string;
  choices?: string; // JSON string
  correct_answer: string;
  points: number;
  order: number;
  explanation?: string;
  created_at: string;
  updated_at: string;
}

// -------- QUIZ RESULTS TYPES --------
export interface QuizResults extends Quiz {
  // Quiz with all attempts/results included
  attempts?: QuizAttempt[];
}

export interface QuizAttempt {
  id: string;
  quiz: string;
  quiz_title?: string;
  student: string;
  student_name?: string;
  student_email?: string;
  attempt_number: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  status_display?: string;
  started_at: string;
  completed_at?: string;
  time_taken?: number; // in seconds
  total_questions: number;
  correct_answers: number;
  score: number | string; // Backend returns it as string (decimal), we convert to number
  total_points: number;
  earned_points: number;
  passed: boolean;
  answers?: QuizAnswer[];
  created_at?: string;
  updated_at?: string;
}

export interface QuizAnswer {
  id: string;
  attempt: string;
  question: string;
  question_text?: string;
  selected_answer: string;
  selected_answer_text?: string;
  is_correct: boolean;
  points_earned: number;
  correct_answer?: string;
  explanation?: string;
  answered_at?: string;
  time_taken?: number;
}

// -------- QUIZ STATISTICS TYPES --------
export interface QuizStatistics extends Quiz {
  // Quiz with statistics included
  average_score?: number;
  pass_rate?: number;
  total_attempts?: number;
  total_students?: number;
  question_statistics?: QuestionStatistics[];
}

export interface QuestionStatistics {
  question_id: string;
  question_text: string;
  total_answers: number;
  correct_answers: number;
  incorrect_answers: number;
  accuracy_percentage: number;
}

// ==================== API METHODS ====================

// -------- QUIZ API --------
export const quizzesApi = {
  /**
   * Create a new quiz
   * POST /quizzes/teacher/quizzes/
   */
  create: async (data: CreateQuizInput): Promise<Quiz> => {
    try {
      logger.debug('Creating quiz', { data });
      const response = await apiClient.post<Quiz>('/quizzes/teacher/quizzes/', data);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في إنشاء الاختبار');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to create quiz:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إنشاء الاختبار');
    }
  },

  /**
   * List quizzes with optional filtering
   * GET /quizzes/teacher/quizzes/
   */
  list: async (params?: {
    is_active?: boolean;
    live_batch?: string;
    recorded_lesson?: string;
    quiz_type?: QuizType;
    search?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ results: QuizListItem[]; count: number; next?: string; previous?: string }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
      if (params?.live_batch) queryParams.append('live_batch', params.live_batch);
      if (params?.recorded_lesson) queryParams.append('recorded_lesson', params.recorded_lesson);
      if (params?.quiz_type) queryParams.append('quiz_type', params.quiz_type);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const queryString = queryParams.toString();
      const url = queryString 
        ? `/quizzes/teacher/quizzes/?${queryString}`
        : `/quizzes/teacher/quizzes/`;
      logger.debug('Fetching quizzes', { url, params });
      const response = await apiClient.get<{ results: QuizListItem[]; count: number; next?: string; previous?: string }>(url);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب الاختبارات');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch quizzes:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الاختبارات');
    }
  },

  /**
   * Get a quiz by ID
   * GET /quizzes/teacher/quizzes/{id}/
   */
  get: async (id: string): Promise<Quiz> => {
    try {
      logger.debug('Fetching quiz', { id });
      const response = await apiClient.get<Quiz>(`/quizzes/teacher/quizzes/${id}/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب الاختبار');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch quiz:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الاختبار');
    }
  },

  /**
   * Update a quiz (full update)
   * PUT /quizzes/teacher/quizzes/{id}/
   */
  update: async (id: string, data: UpdateQuizInput): Promise<Quiz> => {
    try {
      logger.debug('Updating quiz', { id, data });
      const response = await apiClient.put<Quiz>(`/quizzes/teacher/quizzes/${id}/`, data);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في تحديث الاختبار');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to update quiz:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحديث الاختبار');
    }
  },

  /**
   * Partially update a quiz
   * PATCH /quizzes/teacher/quizzes/{id}/
   */
  partialUpdate: async (id: string, data: Partial<UpdateQuizInput>): Promise<Quiz> => {
    try {
      logger.debug('Partially updating quiz', { id, data });
      const response = await apiClient.patch<Quiz>(`/quizzes/teacher/quizzes/${id}/`, data);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في تحديث الاختبار');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to partially update quiz:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحديث الاختبار');
    }
  },

  /**
   * Delete a quiz
   * DELETE /quizzes/teacher/quizzes/{id}/
   * Returns 204 No Content on success
   */
  delete: async (id: string): Promise<void> => {
    try {
      logger.debug('Deleting quiz', { id });
      const response = await apiClient.delete(`/quizzes/teacher/quizzes/${id}/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في حذف الاختبار');
      }
    } catch (error: any) {
      logger.error('Failed to delete quiz:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في حذف الاختبار');
    }
  },

  /**
   * Get quiz results (all student attempts)
   * GET /quizzes/teacher/quizzes/{id}/results/
   */
  getResults: async (id: string): Promise<QuizResults> => {
    try {
      logger.debug('Fetching quiz results', { id });
      const response = await apiClient.get<QuizResults>(`/quizzes/teacher/quizzes/${id}/results/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب نتائج الاختبار');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch quiz results:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب نتائج الاختبار');
    }
  },

  /**
   * Get quiz statistics
   * GET /quizzes/teacher/quizzes/{id}/statistics/
   */
  getStatistics: async (id: string): Promise<QuizStatistics> => {
    try {
      logger.debug('Fetching quiz statistics', { id });
      const response = await apiClient.get<QuizStatistics>(`/quizzes/teacher/quizzes/${id}/statistics/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب إحصائيات الاختبار');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch quiz statistics:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب إحصائيات الاختبار');
    }
  },

  /**
   * List quizzes available for student
   * GET /quizzes/student/quizzes/
   */
  listStudent: async (params?: {
    quiz_type?: QuizType;
    live_batch?: string;
    recorded_lesson?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ results: Quiz[]; count: number; next?: string; previous?: string }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.quiz_type) queryParams.append('quiz_type', params.quiz_type);
      if (params?.live_batch) queryParams.append('live_batch', params.live_batch);
      if (params?.recorded_lesson) queryParams.append('recorded_lesson', params.recorded_lesson);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const queryString = queryParams.toString();
      const url = queryString 
        ? `/quizzes/student/quizzes/?${queryString}`
        : `/quizzes/student/quizzes/`;
      logger.debug('Fetching student quizzes', { url, params });
      const response = await apiClient.get<{ results: Quiz[]; count: number; next?: string; previous?: string }>(url);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب اختبارات الطالب');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch student quizzes:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب اختبارات الطالب');
    }
  },

  /**
   * Get a quiz by ID (student view)
   * GET /quizzes/student/quizzes/{id}/
   */
  getStudent: async (id: string): Promise<Quiz> => {
    try {
      logger.debug('Fetching student quiz', { id });
      const response = await apiClient.get<Quiz>(`/quizzes/student/quizzes/${id}/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب اختبار الطالب');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch student quiz:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب اختبار الطالب');
    }
  },

  /**
   * Start a quiz attempt
   * POST /quizzes/student/quizzes/{id}/start-attempt/
   */
  startAttempt: async (id: string): Promise<Quiz> => {
    try {
      logger.debug('Starting quiz attempt', { id });
      const response = await apiClient.post<Quiz>(`/quizzes/student/quizzes/${id}/start-attempt/`, {});
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في بدء محاولة الاختبار');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to start quiz attempt:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في بدء محاولة الاختبار');
    }
  },

  /**
   * Submit quiz answers
   * POST /quizzes/student/quizzes/{id}/submit/
   */
  submitQuiz: async (id: string, payload: { answers: Array<{ question_id: string; selected_answer: string; time_taken?: number | null }> }): Promise<Quiz> => {
    try {
      logger.debug('Submitting quiz', { id, payload });
      const response = await apiClient.post<Quiz>(`/quizzes/student/quizzes/${id}/submit/`, payload);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في إرسال الاختبار');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to submit quiz:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إرسال الاختبار');
    }
  },

  /**
   * Get my attempts for a quiz
   * GET /quizzes/student/quizzes/{id}/my-attempts/
   */
  getMyAttempts: async (id: string): Promise<QuizAttempt[]> => {
    try {
      logger.debug('Fetching my attempts', { id });
      const response = await apiClient.get<QuizAttempt[]>(`/quizzes/student/quizzes/${id}/my-attempts/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب محاولاتي');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch my attempts:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب محاولاتي');
    }
  },
};

// -------- QUESTION API --------
export const quizQuestionsApi = {
  /**
   * Create a new question
   * POST /quizzes/teacher/questions/
   */
  create: async (data: CreateQuestionInput): Promise<QuizQuestion> => {
    try {
      logger.debug('Creating question', { data });
      const response = await apiClient.post<QuizQuestion>('/quizzes/teacher/questions/', data);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في إنشاء السؤال');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to create question:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إنشاء السؤال');
    }
  },

  /**
   * List questions with optional filtering
   * GET /quizzes/teacher/questions/
   */
  list: async (params?: {
    quiz?: string;
    question_type?: QuestionType;
    ordering?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ results: QuizQuestion[]; count: number; next?: string; previous?: string }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.quiz) queryParams.append('quiz', params.quiz);
      if (params?.question_type) queryParams.append('question_type', params.question_type);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const queryString = queryParams.toString();
      const url = queryString 
        ? `/quizzes/teacher/questions/?${queryString}`
        : `/quizzes/teacher/questions/`;
      logger.debug('Fetching questions', { url, params });
      const response = await apiClient.get<{ results: QuizQuestion[]; count: number; next?: string; previous?: string }>(url);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب الأسئلة');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch questions:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الأسئلة');
    }
  },

  /**
   * Get a question by ID
   * GET /quizzes/teacher/questions/{id}/
   */
  get: async (id: string): Promise<QuizQuestion> => {
    try {
      logger.debug('Fetching question', { id });
      const response = await apiClient.get<QuizQuestion>(`/quizzes/teacher/questions/${id}/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب السؤال');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch question:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب السؤال');
    }
  },

  /**
   * Update a question (full update)
   * PUT /quizzes/teacher/questions/{id}/
   */
  update: async (id: string, data: UpdateQuestionInput): Promise<QuizQuestion> => {
    try {
      logger.debug('Updating question', { id, data });
      const response = await apiClient.put<QuizQuestion>(`/quizzes/teacher/questions/${id}/`, data);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في تحديث السؤال');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to update question:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحديث السؤال');
    }
  },

  /**
   * Partially update a question
   * PATCH /quizzes/teacher/questions/{id}/
   */
  partialUpdate: async (id: string, data: Partial<UpdateQuestionInput>): Promise<QuizQuestion> => {
    try {
      logger.debug('Partially updating question', { id, data });
      const response = await apiClient.patch<QuizQuestion>(`/quizzes/teacher/questions/${id}/`, data);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في تحديث السؤال');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to partially update question:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحديث السؤال');
    }
  },

  /**
   * Delete a question
   * DELETE /quizzes/teacher/questions/{id}/
   * Returns 204 No Content on success
   */
  delete: async (id: string): Promise<void> => {
    try {
      logger.debug('Deleting question', { id });
      const response = await apiClient.delete(`/quizzes/teacher/questions/${id}/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في حذف السؤال');
      }
    } catch (error: any) {
      logger.error('Failed to delete question:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في حذف السؤال');
    }
  },
};

// -------- QUIZ ATTEMPTS API --------
export const quizAttemptsApi = {
  /**
   * List quiz attempts with filtering
   * GET /quizzes/attempts/
   */
  list: async (params?: {
    quiz?: string;
    student?: string;
    status?: 'in_progress' | 'completed' | 'abandoned';
    passed?: boolean;
    ordering?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ 
    results: QuizAttempt[]; 
    count: number; 
    next?: string; 
    previous?: string 
  }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.quiz) queryParams.append('quiz', params.quiz);
      if (params?.student) queryParams.append('student', params.student);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.passed !== undefined) queryParams.append('passed', params.passed.toString());
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const url = `/quizzes/attempts/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      logger.debug('Fetching quiz attempts', { url, params });
      
      const response = await apiClient.get<{ 
        results: QuizAttempt[]; 
        count: number; 
        next?: string; 
        previous?: string 
      }>(url);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب محاولات الاختبار');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch quiz attempts:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب محاولات الاختبار');
    }
  },

  /**
   * Get a specific quiz attempt details
   * GET /quizzes/attempts/{id}/
   */
  get: async (id: string): Promise<QuizAttempt> => {
    try {
      logger.debug('Fetching quiz attempt', { id });
      const response = await apiClient.get<QuizAttempt>(`/quizzes/attempts/${id}/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب محاولة الاختبار');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch quiz attempt:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب محاولة الاختبار');
    }
  },

  /**
   * Get attempts for a specific quiz (for teachers)
   * GET /quizzes/attempts/?quiz={quizId}
   */
  getByQuiz: async (quizId: string, params?: {
    status?: 'in_progress' | 'completed' | 'abandoned';
    passed?: boolean;
    ordering?: string;
    page?: number;
  }): Promise<{ 
    results: QuizAttempt[]; 
    count: number; 
    next?: string; 
    previous?: string 
  }> => {
    try {
      logger.debug('Fetching attempts for quiz', { quizId, params });
      return await quizAttemptsApi.list({ ...params, quiz: quizId });
    } catch (error: any) {
      logger.error('Failed to fetch attempts for quiz:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب محاولات الاختبار');
    }
  },

  /**
   * Get attempts for a specific student (for teachers)
   * GET /quizzes/attempts/?student={studentId}
   */
  getByStudent: async (studentId: string, params?: {
    quiz?: string;
    status?: 'in_progress' | 'completed' | 'abandoned';
    passed?: boolean;
    ordering?: string;
    page?: number;
  }): Promise<{ 
    results: QuizAttempt[]; 
    count: number; 
    next?: string; 
    previous?: string 
  }> => {
    try {
      logger.debug('Fetching attempts for student', { studentId, params });
      return await quizAttemptsApi.list({ ...params, student: studentId });
    } catch (error: any) {
      logger.error('Failed to fetch attempts for student:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب محاولات الطالب');
    }
  },
};

// -------- QUIZ RESULTS API (TEACHER) --------
export const quizResultsApi = {
  /**
   * Get quiz results (all student attempts for a quiz)
   * GET /quizzes/teacher/quizzes/{quizId}/results/
   */
  getQuizResults: async (quizId: string): Promise<{
    id: string;
    title: string;
    description: string;
    quiz_type: string;
    quiz_type_display: string;
    total_questions: number;
    total_attempts: number;
    passing_score: number;
    questions: QuizQuestion[];
    created_at: string;
    updated_at: string;
  }> => {
    try {
      logger.debug('Fetching quiz results', { quizId });
      const response = await apiClient.get<any>(`/quizzes/teacher/quizzes/${quizId}/results/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب نتائج الاختبار');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch quiz results:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب نتائج الاختبار');
    }
  },

  /**
   * Get quiz statistics
   * GET /quizzes/teacher/quizzes/{quizId}/statistics/
   */
  getQuizStatistics: async (quizId: string): Promise<{
    id: string;
    title: string;
    description: string;
    quiz_type: string;
    quiz_type_display: string;
    total_questions: number;
    total_attempts: number;
    passing_score: number;
    average_score?: number;
    pass_rate?: number;
    questions: QuizQuestion[];
    created_at: string;
    updated_at: string;
  }> => {
    try {
      logger.debug('Fetching quiz statistics', { quizId });
      const response = await apiClient.get<any>(`/quizzes/teacher/quizzes/${quizId}/statistics/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب إحصائيات الاختبار');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch quiz statistics:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب إحصائيات الاختبار');
    }
  },
};

