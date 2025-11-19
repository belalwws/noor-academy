import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

// Types for Course Enrollment
export interface CourseEnrollment {
  id: string;
  course: string;
  course_title: string;
  student: string;
  student_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  status_display: string;
  enrolled_at: string;
  approved_at?: string;
  notes?: string;
  is_family_enrollment?: string;
  family_name?: string;
  family_enrollment?: string;
  general_supervisor_approved: boolean;
  general_supervisor_approved_at?: string;
}

export interface EnrollmentResponse {
  count: number;
  next?: string;
  previous?: string;
  results: CourseEnrollment[];
}

export interface CreateEnrollmentRequest {
  course: string;
  notes?: string;
}

export interface UpdateEnrollmentRequest {
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  notes?: string;
  general_supervisor_approved?: boolean;
}

export interface EnrollmentFilters {
  course?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  ordering?: 'approved_at' | '-approved_at' | 'enrolled_at' | '-enrolled_at';
  page?: number;
}

class EnrollmentAPI {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    try {
      logger.debug('Making enrollment API request:', { endpoint, method: options.method || 'GET' });

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
          throw new Error('التسجيل غير موجود');
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
      logger.error('Enrollment API request failed:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في الطلب');
    }
  }

  /**
   * Get all course enrollments with optional filters
   */
  async getEnrollments(filters?: EnrollmentFilters): Promise<EnrollmentResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/live-education/enrollments/${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  /**
   * Get pending enrollments that require approval
   */
  async getPendingEnrollments(): Promise<EnrollmentResponse> {
    return this.makeRequest('/live-education/enrollments/pending/');
  }

  /**
   * Get specific enrollment details
   */
  async getEnrollment(id: string): Promise<CourseEnrollment> {
    return this.makeRequest(`/live-education/enrollments/${id}/`);
  }

  /**
   * Create new enrollment (enroll in course)
   */
  async createEnrollment(data: CreateEnrollmentRequest): Promise<CourseEnrollment> {
    return this.makeRequest('/live-education/enrollments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update enrollment (for supervisors/admins)
   */
  async updateEnrollment(id: string, data: UpdateEnrollmentRequest): Promise<CourseEnrollment> {
    return this.makeRequest(`/live-education/enrollments/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Cancel enrollment (for students)
   */
  async cancelEnrollment(id: string): Promise<void> {
    return this.makeRequest(`/live-education/enrollments/${id}/`, {
      method: 'DELETE',
    });
  }

  /**
   * Approve enrollment (for supervisors)
   */
  async approveEnrollment(id: string, notes?: string): Promise<CourseEnrollment> {
    const data = await this.makeRequest(`/live-education/enrollments/${id}/approve/`, {
      method: 'POST',
      body: JSON.stringify({ ...(notes ? { notes } : {}) }),
    });
    return (data as any).enrollment ?? data;
  }

  /**
   * Reject enrollment (for supervisors)
   */
  async rejectEnrollment(id: string, notes?: string): Promise<CourseEnrollment> {
    const data = await this.makeRequest(`/live-education/enrollments/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ notes: notes || 'تم الرفض من قبل المشرف العام' }),
    });
    return (data as any).enrollment ?? data;
  }

  /**
   * Get enrollments for a specific course
   */
  async getCourseEnrollments(courseId: string, filters?: Omit<EnrollmentFilters, 'course'>): Promise<EnrollmentResponse> {
    return this.getEnrollments({
      ...filters,
      course: courseId,
    });
  }

  /**
   * Get student's own enrollments
   */
  async getMyEnrollments(filters?: Omit<EnrollmentFilters, 'course'>): Promise<EnrollmentResponse> {
    return this.getEnrollments(filters);
  }
}

// Export singleton instance
export const enrollmentAPI = new EnrollmentAPI();
export default enrollmentAPI;
