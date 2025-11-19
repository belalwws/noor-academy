import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

// Types for Live Education Courses
export interface LiveEducationCourse {
  id: string;
  title: string;
  description: string;
  learning_outcomes: string[];
  subjects: string;
  course_type: 'individual' | 'family' | 'group_private' | 'group_public';
  course_type_display: string;
  max_students: number;
  current_enrollments: number;
  available_spots: number;
  trial_session_url: string;
  is_published: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_status_display: string;
  teacher: {
    id: string;
    user: {
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      email: string;
    };
    specialization?: string;
    bio?: string;
    experience_years?: number;
  };
  lessons: {
    id: string;
    title: string;
    order: number;
    duration_minutes?: number;
  }[];
  created_at: string;
  updated_at: string;
  enrollment_status?: 'not_enrolled' | 'pending' | 'approved' | 'rejected' | 'completed';
}

export interface CourseListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: LiveEducationCourse[];
}

export interface CourseFilters {
  course_type?: 'individual' | 'family' | 'group_private' | 'group_public';
  approval_status?: 'pending' | 'approved' | 'rejected';
  is_published?: boolean;
  search?: string;
  teacher?: string;
  page?: number;
  ordering?: 'created_at' | '-created_at' | 'title' | '-title' | 'max_students' | '-max_students';
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  learning_outcomes: string[];
  subjects: string;
  course_type: 'individual' | 'family' | 'group_private' | 'group_public';
  trial_session_url: string;
  lessons: {
    title: string;
    order: number;
    duration_minutes?: number;
  }[];
}

class LiveEducationAPI {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    try {
      logger.debug('Making live education API request:', { endpoint, method: options.method || 'GET' });

      let response;
      const method = options.method || 'GET';
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      switch (method) {
        case 'GET':
          response = await apiClient.get<T>(cleanEndpoint);
          break;
        case 'POST':
          const postBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.post<T>(cleanEndpoint, postBody);
          break;
        case 'PUT':
          const putBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.put<T>(cleanEndpoint, putBody);
          break;
        case 'PATCH':
          const patchBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.patch<T>(cleanEndpoint, patchBody);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(cleanEndpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (response.success === false) {
        logger.error(`API Error [${response.status}]:`, response.error);
        
        if (response.status === 403) {
          throw new Error('ليس لديك صلاحية للوصول لهذا المورد');
        } else if (response.status === 404) {
          throw new Error('الكورس غير موجود');
        } else if (response.status === 400) {
          throw new Error(response.error || 'خطأ في البيانات المرسلة');
        }
        
        throw new Error(response.error || `خطأ في الخادم: ${response.status}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null;
      }

      return response.data as T;
    } catch (error: any) {
      logger.error('Live education API request failed:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في الطلب');
    }
  }

  /**
   * Get all courses with optional filters
   */
  async getCourses(filters?: CourseFilters): Promise<CourseListResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/live-education/courses/${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  /**
   * Get published and approved courses for students
   */
  async getPublishedCourses(filters?: Omit<CourseFilters, 'is_published' | 'approval_status'>): Promise<CourseListResponse> {
    return this.getCourses({
      ...filters,
      is_published: true,
      approval_status: 'approved',
    });
  }

  /**
   * Get specific course details
   */
  async getCourse(id: string): Promise<LiveEducationCourse> {
    return this.makeRequest(`/live-education/courses/${id}/`);
  }

  /**
   * Create new course (for teachers)
   */
  async createCourse(data: CreateCourseRequest): Promise<LiveEducationCourse> {
    return this.makeRequest('/live-education/courses/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update course (for teachers - own courses only)
   */
  async updateCourse(id: string, data: Partial<CreateCourseRequest>): Promise<LiveEducationCourse> {
    return this.makeRequest(`/live-education/courses/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete course (for teachers - own courses only)
   */
  async deleteCourse(id: string): Promise<void> {
    return this.makeRequest(`/live-education/courses/${id}/`, {
      method: 'DELETE',
    });
  }

  /**
   * Get teacher's own courses
   */
  async getMyCourses(filters?: Omit<CourseFilters, 'teacher'>): Promise<CourseListResponse> {
    return this.getCourses(filters);
  }

  /**
   * Get student's enrolled courses
   */
  async getMyEnrolledCourses(status?: 'pending' | 'approved' | 'rejected' | 'completed'): Promise<CourseListResponse> {
    const endpoint = `/live-education/courses/my-enrolled/${status ? `?status=${status}` : ''}`;
    return this.makeRequest(endpoint);
  }

  /**
   * Enroll in a course (for students)
   */
  async enrollInCourse(courseId: string, notes?: string): Promise<any> {
    return this.makeRequest(`/live-education/courses/${courseId}/enroll/`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  /**
   * Search courses by title or subjects
   */
  async searchCourses(query: string, filters?: Omit<CourseFilters, 'search'>): Promise<CourseListResponse> {
    return this.getCourses({
      ...filters,
      search: query,
    });
  }

  /**
   * Get courses by type
   */
  async getCoursesByType(courseType: 'individual' | 'family' | 'group_private' | 'group_public', filters?: Omit<CourseFilters, 'course_type'>): Promise<CourseListResponse> {
    return this.getCourses({
      ...filters,
      course_type: courseType,
    });
  }
}

// Export singleton instance
export const liveEducationAPI = new LiveEducationAPI();
export default liveEducationAPI;
