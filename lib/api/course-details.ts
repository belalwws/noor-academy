import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

export interface CourseDetails {
  id: string;
  title: string;
  description: string;
  learning_outcomes: string;
  course_type: string;
  course_type_display: string;
  subjects: string;
  trial_session_url: string;
  max_students: string;
  teacher: number;
  teacher_name: string;
  teacher_email: string;
  approval_status: string;
  approval_status_display: string;
  approved_by: number;
  approved_by_name: string;
  approved_at: string;
  rejection_reason: string;
  is_published: boolean;
  lessons: Lesson[];
  enrolled_count: string;
  available_spots: string;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  order: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface CourseEditRequestDetails {
  id: number;
  course_title: string;
  teacher_name: string;
  reviewer_name: string;
  current_title: string;
  current_description: string;
  current_course_type: string;
  current_duration_weeks: number;
  current_price: string;
  title: string;
  description: string;
  learning_outcomes: string;
  subjects: string;
  trial_session_url: string;
  lessons_data: string;
  course_type: string;
  duration_weeks: number;
  session_duration: number;
  price: string;
  edit_reason: string;
  status: string;
  reviewed_at: string;
  supervisor_notes: string;
  rejection_reason: string;
  implemented_at: string;
  created_at: string;
  updated_at: string;
  course: string;
  requested_by: number;
  reviewed_by: number;
  implemented_by: number;
}

class CourseDetailsAPI {
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      logger.debug('Making course details API call:', { endpoint, method: options.method || 'GET' });

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
        logger.error(`❌ API call failed for ${endpoint}:`, response.error);
        throw new Error(response.error || `HTTP ${response.status}: Request failed`);
      }

      return response.data as T;
    } catch (error: any) {
      logger.error(`❌ API call failed for ${endpoint}:`, error);
      throw new Error(error?.appError?.userMessage || error?.message || 'API call failed');
    }
  }

  /**
   * Get detailed course information including lessons
   */
  async getCourseDetails(courseId: string): Promise<CourseDetails> {
    return this.apiCall(`/live-education/courses/${courseId}/`);
  }

  /**
   * Get detailed course edit request information
   */
  async getCourseEditRequestDetails(requestId: number): Promise<CourseEditRequestDetails> {
    return this.apiCall(`/live-education/course-edit-requests/${requestId}/`);
  }

  /**
   * Get both course details and edit request details for comparison
   */
  async getCourseComparisonData(courseId: string, requestId: number): Promise<{
    courseDetails: CourseDetails;
    editRequestDetails: CourseEditRequestDetails;
  }> {
    try {
      const [courseDetails, editRequestDetails] = await Promise.all([
        this.getCourseDetails(courseId),
        this.getCourseEditRequestDetails(requestId)
      ]);

      return {
        courseDetails,
        editRequestDetails
      };
    } catch (error: any) {
      logger.error('❌ Error fetching comparison data:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to fetch comparison data');
    }
  }
}

export const courseDetailsAPI = new CourseDetailsAPI();
