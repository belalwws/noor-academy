/**
 * Knowledge Lab API Service
 * Handles all API calls for Knowledge Lab features including Lesson Exercises
 */

import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: any;
  status?: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================
// Knowledge Lab Types
// ============================================

export interface KnowledgeLab {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  cover_image?: string;
  objective: string;
  topics: string;
  teacher: number;
  teacher_name: string;
  teacher_id?: string;
  content_type: number;
  object_id: string;
  course_title?: string;
  is_standalone: boolean;
  country?: string;
  subject?: string;
  academic_year?: string;
  price: string;
  platform_commission_percentage?: string;
  final_price?: string;
  status: 'pending' | 'approved' | 'rejected';
  status_display: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  questions_count?: string;
  created_at: string;
  updated_at: string;
}

export interface ApproveKnowledgeLabInput {
  platform_commission_percentage?: string;
  notes?: string;
}

export interface RejectKnowledgeLabInput {
  platform_commission_percentage?: string;
  rejection_reason: string;
}

export interface ListKnowledgeLabsParams {
  is_standalone?: boolean;
  ordering?: string;
  page?: number;
  search?: string;
  status?: 'pending' | 'approved' | 'rejected';
  teacher?: number;
}

// ============================================
// Lesson Exercise Types
// ============================================

export interface LessonExerciseQuestion {
  id: string;
  question_type: 'multiple_choice' | 'true_false';
  question_type_display: string;
  text: string;
  options: string;
  points: number;
  order: number;
}

export interface LessonExercise {
  id: string;
  knowledge_lab: string;
  lesson_content_type: number;
  lesson_object_id: string;
  lesson_title: string;
  title: string;
  questions: LessonExerciseQuestion[];
  time_limit: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLessonExerciseRequest {
  knowledge_lab: string;
  lesson_content_type: number;
  lesson_object_id: string;
  title: string;
  question_ids: string[];
  time_limit: number;
}

export interface UpdateLessonExerciseRequest extends Partial<CreateLessonExerciseRequest> {}

// ============================================
// Lesson Exam Types
// ============================================

export interface LessonExamQuestion {
  id: string;
  question_type: 'multiple_choice' | 'true_false';
  question_type_display: string;
  text: string;
  options: string;
  points: number;
  order: number;
}

export interface LessonExam {
  id: string;
  knowledge_lab: string;
  lesson_content_type: number;
  lesson_object_id: string;
  lesson_title: string;
  title: string;
  questions: LessonExamQuestion[];
  time_limit: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLessonExamRequest {
  knowledge_lab: string;
  lesson_content_type: number;
  lesson_object_id: string;
  title: string;
  question_ids: string[];
  time_limit: number;
}

export interface UpdateLessonExamRequest extends Partial<CreateLessonExamRequest> {}

// ============================================
// Unit Exercise Types
// ============================================

export interface UnitExerciseQuestion {
  id: string;
  question_type: 'multiple_choice' | 'true_false';
  question_type_display: string;
  text: string;
  options: string;
  points: number;
  order: number;
}

export interface UnitExercise {
  id: string;
  knowledge_lab: string;
  unit_content_type: number;
  unit_object_id: string;
  unit_title: string;
  title: string;
  questions: UnitExerciseQuestion[];
  time_limit: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUnitExerciseRequest {
  knowledge_lab: string;
  unit_content_type: number;
  unit_object_id: string;
  title: string;
  question_ids: string[];
  time_limit: number;
}

export interface UpdateUnitExerciseRequest extends Partial<CreateUnitExerciseRequest> {}

// ============================================
// Unit Exam Types
// ============================================

export interface UnitExamQuestion {
  id: string;
  question_type: 'multiple_choice' | 'true_false';
  question_type_display: string;
  text: string;
  options: string;
  points: number;
  order: number;
}

export interface UnitExam {
  id: string;
  knowledge_lab: string;
  unit_content_type: number;
  unit_object_id: string;
  unit_title: string;
  title: string;
  questions: UnitExamQuestion[];
  time_limit: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUnitExamRequest {
  knowledge_lab: string;
  unit_content_type: number;
  unit_object_id: string;
  title: string;
  question_ids: string[];
  time_limit: number;
}

export interface UpdateUnitExamRequest extends Partial<CreateUnitExamRequest> {}

// ============================================
// Course Exam Types
// ============================================

export interface CourseExamQuestion {
  id: string;
  question_type: 'multiple_choice' | 'true_false';
  question_type_display: string;
  text: string;
  options: string;
  points: number;
  order: number;
}

export interface CourseExam {
  id: string;
  knowledge_lab: string;
  title: string;
  description: string;
  questions: CourseExamQuestion[];
  time_limit: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseExamRequest {
  knowledge_lab: string;
  title: string;
  description: string;
  question_ids: string[];
  time_limit: number;
}

export interface UpdateCourseExamRequest extends Partial<CreateCourseExamRequest> {}

// ============================================
// Course Review Exercise Types
// ============================================

export interface CourseReviewExerciseQuestion {
  id: string;
  question_type: 'multiple_choice' | 'true_false';
  question_type_display: string;
  text: string;
  options: string;
  points: number;
  order: number;
}

export interface CourseReviewExercise {
  id: string;
  knowledge_lab: string;
  title: string;
  description: string;
  questions: CourseReviewExerciseQuestion[];
  created_at: string;
  updated_at: string;
}

export interface CreateCourseReviewExerciseRequest {
  knowledge_lab: string;
  title: string;
  description: string;
  question_ids: string[];
}

export interface UpdateCourseReviewExerciseRequest extends Partial<CreateCourseReviewExerciseRequest> {}

// ============================================
// Student Attempt Types
// ============================================

export interface StudentAttempt {
  id: string;
  student: string;
  student_name: string;
  knowledge_lab: string;
  knowledge_lab_title: string;
  attempt_type: 'lesson_exercise' | 'lesson_exam' | 'unit_exercise' | 'unit_exam' | 'course_exam' | 'course_review';
  attempt_type_display: string;
  content_type: number;
  object_id: string;
  answers: string;
  score: string;
  points_earned: number;
  total_points: number;
  started_at: string;
  completed_at: string | null;
  time_taken: number;
}

export interface CreateStudentAttemptRequest {
  knowledge_lab: string;
  attempt_type: 'lesson_exercise' | 'lesson_exam' | 'unit_exercise' | 'unit_exam' | 'course_exam' | 'course_review';
  exercise_type?: string;
  exercise_id: string;
}

export interface SubmitAnswersRequest {
  answers: Array<{
    question_id: string;
    selected_answer: string[];
  }>;
}

// ============================================
// API Service Class
// ============================================

class KnowledgeLabApiService {
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      logger.debug(`Making ${method} request to ${endpoint}`, { body });

      let response: any;

      switch (method) {
        case 'GET':
          response = await apiClient.get<T>(endpoint);
          break;
        case 'POST':
          response = await apiClient.post<T>(endpoint, body);
          break;
        case 'PUT':
          response = await apiClient.put<T>(endpoint, body);
          break;
        case 'PATCH':
          response = await apiClient.patch<T>(endpoint, body);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(endpoint);
          break;
      }

      if (response.success === false) {
        logger.error(`API Error for ${method} ${endpoint}:`, {
          status: response.status,
          error: response.error,
        });

        return {
          success: false,
          error: response.error || 'حدث خطأ غير متوقع',
          errors: response.error,
          status: response.status,
        };
      }

      // Handle 204 No Content for DELETE requests
      if (response.status === 204 || response.data === null) {
        return {
          success: true,
          data: null as unknown as T,
          status: response.status || 204,
        };
      }

      return {
        success: true,
        data: response.data as T,
        status: response.status,
      };
    } catch (error: any) {
      logger.error(`Network error for ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: error?.appError?.userMessage || error?.message || 'خطأ في الاتصال بالشبكة',
      };
    }
  }

  // ============================================
  // Lesson Exercise APIs
  // ============================================

  /**
   * Create a new Lesson Exercise
   * POST /knowledge-lab/lesson-exercises/
   */
  async createLessonExercise(
    data: CreateLessonExerciseRequest
  ): Promise<ApiResponse<LessonExercise>> {
    return this.makeRequest<LessonExercise>('/knowledge-lab/lesson-exercises/', 'POST', data);
  }

  /**
   * List Lesson Exercises
   * GET /knowledge-lab/lesson-exercises/
   */
  async listLessonExercises(params?: {
    knowledge_lab?: string;
    ordering?: string;
    page?: number;
  }): Promise<ApiResponse<PaginatedResponse<LessonExercise>>> {
    const queryParams = new URLSearchParams();
    if (params?.knowledge_lab) {
      queryParams.append('knowledge_lab', params.knowledge_lab);
    }
    if (params?.ordering) {
      queryParams.append('ordering', params.ordering);
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/knowledge-lab/lesson-exercises/${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<PaginatedResponse<LessonExercise>>(endpoint, 'GET');
  }

  /**
   * Get Lesson Exercise Details
   * GET /knowledge-lab/lesson-exercises/{id}/
   */
  async getLessonExercise(id: string): Promise<ApiResponse<LessonExercise>> {
    return this.makeRequest<LessonExercise>(`/knowledge-lab/lesson-exercises/${id}/`, 'GET');
  }

  /**
   * Update Lesson Exercise (Full Update)
   * PUT /knowledge-lab/lesson-exercises/{id}/
   */
  async updateLessonExercise(
    id: string,
    data: CreateLessonExerciseRequest
  ): Promise<ApiResponse<LessonExercise>> {
    return this.makeRequest<LessonExercise>(`/knowledge-lab/lesson-exercises/${id}/`, 'PUT', data);
  }

  /**
   * Partially Update Lesson Exercise
   * PATCH /knowledge-lab/lesson-exercises/{id}/
   */
  async patchLessonExercise(
    id: string,
    data: UpdateLessonExerciseRequest
  ): Promise<ApiResponse<LessonExercise>> {
    return this.makeRequest<LessonExercise>(`/knowledge-lab/lesson-exercises/${id}/`, 'PATCH', data);
  }

  /**
   * Delete Lesson Exercise
   * DELETE /knowledge-lab/lesson-exercises/{id}/
   */
  async deleteLessonExercise(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/knowledge-lab/lesson-exercises/${id}/`, 'DELETE');
  }

  // ============================================
  // Lesson Exam APIs
  // ============================================

  /**
   * Create a new Lesson Exam
   * POST /knowledge-lab/lesson-exams/
   */
  async createLessonExam(
    data: CreateLessonExamRequest
  ): Promise<ApiResponse<LessonExam>> {
    return this.makeRequest<LessonExam>('/knowledge-lab/lesson-exams/', 'POST', data);
  }

  /**
   * List Lesson Exams
   * GET /knowledge-lab/lesson-exams/
   */
  async listLessonExams(params?: {
    knowledge_lab?: string;
    ordering?: string;
    page?: number;
  }): Promise<ApiResponse<PaginatedResponse<LessonExam>>> {
    const queryParams = new URLSearchParams();
    if (params?.knowledge_lab) {
      queryParams.append('knowledge_lab', params.knowledge_lab);
    }
    if (params?.ordering) {
      queryParams.append('ordering', params.ordering);
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/knowledge-lab/lesson-exams/${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<PaginatedResponse<LessonExam>>(endpoint, 'GET');
  }

  /**
   * Get Lesson Exam Details
   * GET /knowledge-lab/lesson-exams/{id}/
   */
  async getLessonExam(id: string): Promise<ApiResponse<LessonExam>> {
    return this.makeRequest<LessonExam>(`/knowledge-lab/lesson-exams/${id}/`, 'GET');
  }

  /**
   * Update Lesson Exam (Full Update)
   * PUT /knowledge-lab/lesson-exams/{id}/
   */
  async updateLessonExam(
    id: string,
    data: CreateLessonExamRequest
  ): Promise<ApiResponse<LessonExam>> {
    return this.makeRequest<LessonExam>(`/knowledge-lab/lesson-exams/${id}/`, 'PUT', data);
  }

  /**
   * Partially Update Lesson Exam
   * PATCH /knowledge-lab/lesson-exams/{id}/
   */
  async patchLessonExam(
    id: string,
    data: UpdateLessonExamRequest
  ): Promise<ApiResponse<LessonExam>> {
    return this.makeRequest<LessonExam>(`/knowledge-lab/lesson-exams/${id}/`, 'PATCH', data);
  }

  /**
   * Delete Lesson Exam
   * DELETE /knowledge-lab/lesson-exams/{id}/
   */
  async deleteLessonExam(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/knowledge-lab/lesson-exams/${id}/`, 'DELETE');
  }

  // ============================================
  // Unit Exercise APIs
  // ============================================

  /**
   * Create a new Unit Exercise
   * POST /knowledge-lab/unit-exercises/
   */
  async createUnitExercise(
    data: CreateUnitExerciseRequest
  ): Promise<ApiResponse<UnitExercise>> {
    return this.makeRequest<UnitExercise>('/knowledge-lab/unit-exercises/', 'POST', data);
  }

  /**
   * List Unit Exercises
   * GET /knowledge-lab/unit-exercises/
   */
  async listUnitExercises(params?: {
    knowledge_lab?: string;
    ordering?: string;
    page?: number;
  }): Promise<ApiResponse<PaginatedResponse<UnitExercise>>> {
    const queryParams = new URLSearchParams();
    if (params?.knowledge_lab) {
      queryParams.append('knowledge_lab', params.knowledge_lab);
    }
    if (params?.ordering) {
      queryParams.append('ordering', params.ordering);
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/knowledge-lab/unit-exercises/${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<PaginatedResponse<UnitExercise>>(endpoint, 'GET');
  }

  /**
   * Get Unit Exercise Details
   * GET /knowledge-lab/unit-exercises/{id}/
   */
  async getUnitExercise(id: string): Promise<ApiResponse<UnitExercise>> {
    return this.makeRequest<UnitExercise>(`/knowledge-lab/unit-exercises/${id}/`, 'GET');
  }

  /**
   * Update Unit Exercise (Full Update)
   * PUT /knowledge-lab/unit-exercises/{id}/
   */
  async updateUnitExercise(
    id: string,
    data: CreateUnitExerciseRequest
  ): Promise<ApiResponse<UnitExercise>> {
    return this.makeRequest<UnitExercise>(`/knowledge-lab/unit-exercises/${id}/`, 'PUT', data);
  }

  /**
   * Partially Update Unit Exercise
   * PATCH /knowledge-lab/unit-exercises/{id}/
   */
  async patchUnitExercise(
    id: string,
    data: UpdateUnitExerciseRequest
  ): Promise<ApiResponse<UnitExercise>> {
    return this.makeRequest<UnitExercise>(`/knowledge-lab/unit-exercises/${id}/`, 'PATCH', data);
  }

  /**
   * Delete Unit Exercise
   * DELETE /knowledge-lab/unit-exercises/{id}/
   */
  async deleteUnitExercise(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/knowledge-lab/unit-exercises/${id}/`, 'DELETE');
  }

  // ============================================
  // Unit Exam APIs
  // ============================================

  /**
   * Create a new Unit Exam
   * POST /knowledge-lab/unit-exams/
   */
  async createUnitExam(
    data: CreateUnitExamRequest
  ): Promise<ApiResponse<UnitExam>> {
    return this.makeRequest<UnitExam>('/knowledge-lab/unit-exams/', 'POST', data);
  }

  /**
   * List Unit Exams
   * GET /knowledge-lab/unit-exams/
   */
  async listUnitExams(params?: {
    knowledge_lab?: string;
    ordering?: string;
    page?: number;
  }): Promise<ApiResponse<PaginatedResponse<UnitExam>>> {
    const queryParams = new URLSearchParams();
    if (params?.knowledge_lab) {
      queryParams.append('knowledge_lab', params.knowledge_lab);
    }
    if (params?.ordering) {
      queryParams.append('ordering', params.ordering);
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/knowledge-lab/unit-exams/${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<PaginatedResponse<UnitExam>>(endpoint, 'GET');
  }

  /**
   * Get Unit Exam Details
   * GET /knowledge-lab/unit-exams/{id}/
   */
  async getUnitExam(id: string): Promise<ApiResponse<UnitExam>> {
    return this.makeRequest<UnitExam>(`/knowledge-lab/unit-exams/${id}/`, 'GET');
  }

  /**
   * Update Unit Exam (Full Update)
   * PUT /knowledge-lab/unit-exams/{id}/
   */
  async updateUnitExam(
    id: string,
    data: CreateUnitExamRequest
  ): Promise<ApiResponse<UnitExam>> {
    return this.makeRequest<UnitExam>(`/knowledge-lab/unit-exams/${id}/`, 'PUT', data);
  }

  /**
   * Partially Update Unit Exam
   * PATCH /knowledge-lab/unit-exams/{id}/
   */
  async patchUnitExam(
    id: string,
    data: UpdateUnitExamRequest
  ): Promise<ApiResponse<UnitExam>> {
    return this.makeRequest<UnitExam>(`/knowledge-lab/unit-exams/${id}/`, 'PATCH', data);
  }

  /**
   * Delete Unit Exam
   * DELETE /knowledge-lab/unit-exams/{id}/
   */
  async deleteUnitExam(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/knowledge-lab/unit-exams/${id}/`, 'DELETE');
  }

  // ============================================
  // Course Exam APIs
  // ============================================

  /**
   * Create a new Course Exam
   * POST /knowledge-lab/course-exams/
   */
  async createCourseExam(
    data: CreateCourseExamRequest
  ): Promise<ApiResponse<CourseExam>> {
    return this.makeRequest<CourseExam>('/knowledge-lab/course-exams/', 'POST', data);
  }

  /**
   * List Course Exams
   * GET /knowledge-lab/course-exams/
   */
  async listCourseExams(params?: {
    knowledge_lab?: string;
    ordering?: string;
    page?: number;
  }): Promise<ApiResponse<PaginatedResponse<CourseExam>>> {
    const queryParams = new URLSearchParams();
    if (params?.knowledge_lab) {
      queryParams.append('knowledge_lab', params.knowledge_lab);
    }
    if (params?.ordering) {
      queryParams.append('ordering', params.ordering);
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/knowledge-lab/course-exams/${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<PaginatedResponse<CourseExam>>(endpoint, 'GET');
  }

  /**
   * Get Course Exam Details
   * GET /knowledge-lab/course-exams/{id}/
   */
  async getCourseExam(id: string): Promise<ApiResponse<CourseExam>> {
    return this.makeRequest<CourseExam>(`/knowledge-lab/course-exams/${id}/`, 'GET');
  }

  /**
   * Update Course Exam (Full Update)
   * PUT /knowledge-lab/course-exams/{id}/
   */
  async updateCourseExam(
    id: string,
    data: CreateCourseExamRequest
  ): Promise<ApiResponse<CourseExam>> {
    return this.makeRequest<CourseExam>(`/knowledge-lab/course-exams/${id}/`, 'PUT', data);
  }

  /**
   * Partially Update Course Exam
   * PATCH /knowledge-lab/course-exams/{id}/
   */
  async patchCourseExam(
    id: string,
    data: UpdateCourseExamRequest
  ): Promise<ApiResponse<CourseExam>> {
    return this.makeRequest<CourseExam>(`/knowledge-lab/course-exams/${id}/`, 'PATCH', data);
  }

  /**
   * Delete Course Exam
   * DELETE /knowledge-lab/course-exams/{id}/
   */
  async deleteCourseExam(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/knowledge-lab/course-exams/${id}/`, 'DELETE');
  }

  // ============================================
  // Course Review Exercise APIs
  // ============================================

  /**
   * Create a new Course Review Exercise
   * POST /knowledge-lab/course-review-exercises/
   */
  async createCourseReviewExercise(
    data: CreateCourseReviewExerciseRequest
  ): Promise<ApiResponse<CourseReviewExercise>> {
    return this.makeRequest<CourseReviewExercise>('/knowledge-lab/course-review-exercises/', 'POST', data);
  }

  /**
   * List Course Review Exercises
   * GET /knowledge-lab/course-review-exercises/
   */
  async listCourseReviewExercises(params?: {
    knowledge_lab?: string;
    ordering?: string;
    page?: number;
  }): Promise<ApiResponse<PaginatedResponse<CourseReviewExercise>>> {
    const queryParams = new URLSearchParams();
    if (params?.knowledge_lab) {
      queryParams.append('knowledge_lab', params.knowledge_lab);
    }
    if (params?.ordering) {
      queryParams.append('ordering', params.ordering);
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/knowledge-lab/course-review-exercises/${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<PaginatedResponse<CourseReviewExercise>>(endpoint, 'GET');
  }

  /**
   * Get Course Review Exercise Details
   * GET /knowledge-lab/course-review-exercises/{id}/
   */
  async getCourseReviewExercise(id: string): Promise<ApiResponse<CourseReviewExercise>> {
    return this.makeRequest<CourseReviewExercise>(`/knowledge-lab/course-review-exercises/${id}/`, 'GET');
  }

  /**
   * Update Course Review Exercise (Full Update)
   * PUT /knowledge-lab/course-review-exercises/{id}/
   */
  async updateCourseReviewExercise(
    id: string,
    data: CreateCourseReviewExerciseRequest
  ): Promise<ApiResponse<CourseReviewExercise>> {
    return this.makeRequest<CourseReviewExercise>(`/knowledge-lab/course-review-exercises/${id}/`, 'PUT', data);
  }

  /**
   * Partially Update Course Review Exercise
   * PATCH /knowledge-lab/course-review-exercises/{id}/
   */
  async patchCourseReviewExercise(
    id: string,
    data: UpdateCourseReviewExerciseRequest
  ): Promise<ApiResponse<CourseReviewExercise>> {
    return this.makeRequest<CourseReviewExercise>(`/knowledge-lab/course-review-exercises/${id}/`, 'PATCH', data);
  }

  /**
   * Delete Course Review Exercise
   * DELETE /knowledge-lab/course-review-exercises/{id}/
   */
  async deleteCourseReviewExercise(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/knowledge-lab/course-review-exercises/${id}/`, 'DELETE');
  }

  // ============================================
  // Student Attempt APIs
  // ============================================

  /**
   * Start a new Student Attempt
   * POST /knowledge-lab/attempts/
   */
  async startStudentAttempt(
    data: CreateStudentAttemptRequest
  ): Promise<ApiResponse<StudentAttempt>> {
    return this.makeRequest<StudentAttempt>('/knowledge-lab/attempts/', 'POST', data);
  }

  /**
   * List Student Attempts
   * GET /knowledge-lab/attempts/
   */
  async listStudentAttempts(params?: {
    attempt_type?: 'lesson_exercise' | 'lesson_exam' | 'unit_exercise' | 'unit_exam' | 'course_exam' | 'course_review';
    knowledge_lab?: string;
    student?: string;
    ordering?: string;
    page?: number;
  }): Promise<ApiResponse<PaginatedResponse<StudentAttempt>>> {
    const queryParams = new URLSearchParams();
    if (params?.attempt_type) queryParams.append('attempt_type', params.attempt_type);
    if (params?.knowledge_lab) queryParams.append('knowledge_lab', params.knowledge_lab);
    if (params?.student) queryParams.append('student', params.student);
    if (params?.ordering) queryParams.append('ordering', params.ordering);
    if (params?.page) queryParams.append('page', params.page.toString());

    const queryString = queryParams.toString();
    const endpoint = `/knowledge-lab/attempts/${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<PaginatedResponse<StudentAttempt>>(endpoint, 'GET');
  }

  /**
   * Get Student Attempt Details
   * GET /knowledge-lab/attempts/{id}/
   */
  async getStudentAttempt(id: string): Promise<ApiResponse<StudentAttempt>> {
    return this.makeRequest<StudentAttempt>(`/knowledge-lab/attempts/${id}/`, 'GET');
  }

  /**
   * Submit Student Answers
   * POST /knowledge-lab/attempts/{id}/submit_answers/
   */
  async submitStudentAnswers(
    id: string,
    data: SubmitAnswersRequest
  ): Promise<ApiResponse<{ answers: string }>> {
    return this.makeRequest<{ answers: string }>(`/knowledge-lab/attempts/${id}/submit_answers/`, 'POST', data);
  }

  // ============================================
  // Knowledge Lab Management APIs
  // ============================================

  /**
   * List Knowledge Labs
   * GET /knowledge-lab/labs/
   */
  async listLabs(params?: ListKnowledgeLabsParams): Promise<ApiResponse<PaginatedResponse<KnowledgeLab>>> {
    const queryParams = new URLSearchParams();
    if (params?.is_standalone !== undefined) {
      queryParams.append('is_standalone', params.is_standalone.toString());
    }
    if (params?.ordering) {
      queryParams.append('ordering', params.ordering);
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.teacher) {
      queryParams.append('teacher', params.teacher.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/knowledge-lab/labs/${queryString ? `?${queryString}` : ''}`;

    const response = await this.makeRequest<PaginatedResponse<KnowledgeLab>>(endpoint, 'GET');
    
    // Handle direct array response (if API returns array instead of paginated response)
    if (response.success && response.data && !response.data.results && Array.isArray(response.data)) {
      return {
        ...response,
        data: {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data,
        },
      };
    }
    
    return response;
  }

  /**
   * Get Knowledge Lab Details
   * GET /knowledge-lab/labs/{id}/
   */
  async getLab(id: string): Promise<ApiResponse<KnowledgeLab>> {
    return this.makeRequest<KnowledgeLab>(`/knowledge-lab/labs/${id}/`, 'GET');
  }

  /**
   * Approve Knowledge Lab
   * POST /knowledge-lab/labs/{id}/approve/
   */
  async approveLab(id: string, data: ApproveKnowledgeLabInput): Promise<ApiResponse<KnowledgeLab>> {
    return this.makeRequest<KnowledgeLab>(`/knowledge-lab/labs/${id}/approve/`, 'POST', data);
  }

  /**
   * Reject Knowledge Lab
   * POST /knowledge-lab/labs/{id}/reject/
   */
  async rejectLab(id: string, data: RejectKnowledgeLabInput): Promise<ApiResponse<KnowledgeLab>> {
    return this.makeRequest<KnowledgeLab>(`/knowledge-lab/labs/${id}/reject/`, 'POST', data);
  }
}

// Export singleton instance
export const knowledgeLabApi = new KnowledgeLabApiService();

