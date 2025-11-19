/**
 * Academic Supervisor API Service
 * Handles all academic supervisor-related API calls
 */
import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';
import { Endpoints, getBaseUrl } from '../config';

// ============================================================================
// INTERFACES
// ============================================================================

export interface AcademicSupervisorStatistics {
  supervisor_info: {
    id: number;
    type: string;
    user_email: string;
  };
  teachers: {
    total_assigned: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  courses: {
    total: number;
    pending: number;
    approved: number;
    published: number;
  };
  students: {
    total_enrolled: number;
    active_enrollments: number;
  };
  summary: {
    active_sessions: number;
    average_rating: number;
  };
}

export interface TeacherProfile {
  id: number;
  user_name: string;
  user_email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  specialization: 'memorize_quran' | 'arabic_language' | 'islamic_studies' | 'quran_studies' | string;
  specialization_display: string;
  approval_status: 'pending' | 'approved' | 'rejected' | string;
  approval_status_display: string;
  academic_supervisor: string;
  academic_supervisor_name: string;
  years_of_experience: number;
  qualifications?: string;
  biography?: string;
  primary_teaching_language?: string;
  created_at: string;
  approved_at?: string;
  relationship_id?: string | null;
}

export interface CourseItem {
  id: string;
  title: string;
  description: string;
  learning_outcomes?: string;
  course_type: string;
  course_type_display: string;
  subjects?: string;
  max_students: number;

  // Teacher information
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  teacher_specialization: string;

  // Course status and approval
  approval_status: 'pending' | 'approved' | 'rejected' | 'under_review' | string;
  approval_status_display: string;
  is_published: boolean;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;

  // Enrollment statistics
  enrolled_count: number;
  available_spots: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface StudentEnrollment {
  id: string;

  // Student information
  student_id: string;
  student_name: string;
  student_email: string;
  student_age?: number;
  student_education_level?: string;
  student_learning_goals?: string;

  // Course information
  course_id: string;
  course_title: string;
  course_type: string;
  course_type_display: string;

  // Teacher information
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;

  // Enrollment details
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | string;
  status_display: string;
  enrolled_at: string;
  approved_at?: string;
  approved_by_name?: string;

  // Family enrollment (if applicable)
  is_family_enrollment: boolean;
  family_representative?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApproveTeacherData {
  academic_supervisor_id?: number;
  approval_notes?: string;
}

export interface RejectTeacherData {
  rejection_reason: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: Record<string, any>;
  status?: number;
}

// ============================================================================
// API SERVICE CLASS
// ============================================================================

class AcademicSupervisorApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      logger.debug('🔍 Making API request:', {
        endpoint,
        method: options.method || 'GET'
      });

      let response;
      const method = options.method || 'GET';
      const cleanEndpoint = endpoint.startsWith('http') 
        ? endpoint.replace(getBaseUrl(), '') 
        : endpoint.startsWith('/') 
          ? endpoint 
          : `/${endpoint}`;
      
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
        logger.error('❌ API request failed:', {
          status: response.status,
          error: response.error
        });
        return {
          success: false,
          error: response.error || 'Unknown error',
          status: response.status,
        };
      }

      logger.debug('📡 API response success:', response.status);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      logger.error('❌ API request failed with exception:', error);
      return {
        success: false,
        error: error?.appError?.userMessage || error?.message || 'Network error',
        status: error?.status || 500,
      };
    }
  }

  // ==================== DASHBOARD STATISTICS ====================

  /**
   * Get dashboard statistics for Academic Supervisor
   * GET /supervisors/academic/dashboard/statistics/
   */
  async getDashboardStatistics(): Promise<AcademicSupervisorStatistics> {
    logger.debug('🔍 Making request to /dashboard/statistics/');
    const response = await this.makeRequest<AcademicSupervisorStatistics>(Endpoints.ACADEMIC_SUPERVISOR_DASHBOARD_STATS);

    if (!response.success) {
      logger.error('❌ Failed to load dashboard statistics:', response.error);
      return {
        supervisor_info: {
          id: 0,
          type: "academic_supervisor",
          user_email: ""
        },
        teachers: {
          total_assigned: 0,
          approved: 0,
          pending: 0,
          rejected: 0
        },
        courses: {
          total: 0,
          pending: 0,
          approved: 0,
          published: 0
        },
        students: {
          total_enrolled: 0,
          active_enrollments: 0
        },
        summary: {
          active_sessions: 0,
          average_rating: 0
        }
      };
    }

    logger.debug('✅ Dashboard statistics loaded successfully');
    // Return the actual data from the API response
    return response.data || {
      supervisor_info: {
        id: 0,
        type: "academic_supervisor",
        user_email: ""
      },
      teachers: {
        total_assigned: 0,
        approved: 0,
        pending: 0,
        rejected: 0
      },
      courses: {
        total: 0,
        pending: 0,
        approved: 0,
        published: 0
      },
      students: {
        total_enrolled: 0,
        active_enrollments: 0
      },
      summary: {
        active_sessions: 0,
        average_rating: 0
      }
    };
  }

  // ==================== TEACHER MANAGEMENT ====================

  /**
   * Get list of teachers assigned to this Academic Supervisor
   * GET /supervisors/academic/assigned-teachers/
   */
  async getTeachers(): Promise<TeacherProfile[]> {
    logger.debug('🔍 Making request to /assigned-teachers/');
    const response = await this.makeRequest<TeacherProfile[]>(Endpoints.ACADEMIC_SUPERVISOR_ASSIGNED_TEACHERS);

    if (!response.success) {
      logger.error('❌ Failed to load teachers:', response.error);
      return [];
    }

    logger.debug('✅ Teachers loaded successfully:', response.data?.length || 0);
    
    // Return the actual data array from the API response
    return response.data || [];
  }

  /**
   * Get list of assigned teachers (alias for getTeachers)
   * GET /supervisors/academic/assigned-teachers/
   */
  async getAssignedTeachers(): Promise<TeacherProfile[]> {
    return this.getTeachers();
  }

  /**
   * Get list of pending teacher applications (filtered from assigned teachers)
   */
  async getPendingTeachers(): Promise<TeacherProfile[]> {
    const teachers = await this.getTeachers();
    return teachers.filter(teacher => teacher.approval_status === 'pending');
  }

  /**
   * Get list of approved teachers (filtered from assigned teachers)
   */
  async getApprovedTeachers(): Promise<TeacherProfile[]> {
    const teachers = await this.getTeachers();
    return teachers.filter(teacher => teacher.approval_status === 'approved');
  }

  /**
   * Approve a teacher
   * POST /supervisors/academic/approve-teacher/{id}/
   */
  async approveTeacher(teacherId: number, approvalData: ApproveTeacherData): Promise<ApiResponse> {
    return this.makeRequest(`/approve-teacher/${teacherId}/`, {
      method: 'POST',
      body: JSON.stringify(approvalData),
    });
  }

  /**
   * Reject a teacher application
   * POST /supervisors/academic/reject-teacher/{id}/
   */
  async rejectTeacher(teacherId: number, rejectionData: RejectTeacherData): Promise<ApiResponse> {
    return this.makeRequest(`/reject-teacher/${teacherId}/`, {
      method: 'POST',
      body: JSON.stringify(rejectionData),
    });
  }

  /**
   * Get teacher profile details
   * GET /supervisors/academic/teacher/{id}/
   */
  async getTeacherProfile(teacherId: number): Promise<TeacherProfile | null> {
    const response = await this.makeRequest<TeacherProfile>(`/teacher/${teacherId}/`);
    return response.data || null;
  }

  // ==================== COURSE MANAGEMENT ====================

  /**
   * Get list of courses created by teachers assigned to this Academic Supervisor
   * GET /supervisors/academic/teacher-courses/
   */
  async getTeacherCourses(): Promise<CourseItem[]> {
    logger.debug('🔍 Making request to /supervisors/academic/teacher-courses/');
    const response = await this.makeRequest<CourseItem[]>(Endpoints.ACADEMIC_SUPERVISOR_TEACHER_COURSES);

    if (!response.success) {
      logger.error('❌ Failed to load teacher courses:', response.error);
      return [];
    }

    logger.debug('✅ Teacher courses loaded successfully');
    return response.data || [];
  }

  /**
   * Get list of courses under this Academic Supervisor (alias for getTeacherCourses)
   */
  async getCourses(): Promise<CourseItem[]> {
    return this.getTeacherCourses();
  }

  // ==================== STUDENT MANAGEMENT ====================

  /**
   * Get list of students enrolled in courses by teachers assigned to this Academic Supervisor
   * GET /supervisors/academic/teacher-students/
   */
  async getTeacherStudents(): Promise<StudentEnrollment[]> {
    logger.debug('🔍 Making request to /supervisors/academic/teacher-students/');
    const response = await this.makeRequest<StudentEnrollment[]>(Endpoints.ACADEMIC_SUPERVISOR_TEACHER_STUDENTS);

    if (!response.success) {
      logger.error('❌ Failed to load teacher students:', response.error);
      return [];
    }

    logger.debug('✅ Teacher students loaded successfully');
    return response.data || [];
  }

  /**
   * Get list of students under this Academic Supervisor (alias for getTeacherStudents)
   */
  async getStudents(): Promise<StudentEnrollment[]> {
    return this.getTeacherStudents();
  }

  /**
   * Get list of pending courses for approval
   * GET /supervisors/academic/pending-courses/
   */
  async getPendingCourses(): Promise<CourseItem[]> {
    const response = await this.makeRequest<CourseItem[]>('/pending-courses/');
    return response.data || [];
  }

  /**
   * Get list of active courses
   * GET /supervisors/academic/active-courses/
   */
  async getActiveCourses(): Promise<CourseItem[]> {
    const response = await this.makeRequest<CourseItem[]>('/active-courses/');
    return response.data || [];
  }

  /**
   * Approve a course
   * POST /live-education/courses/{id}/approve/
   */
  async approveCourse(courseId: string, approvalNotes?: string): Promise<any> {
    const response = await this.makeRequest(`/live-education/courses/${courseId}/approve/`, {
      method: 'POST',
      body: JSON.stringify({
        approval_notes: approvalNotes
      })
    });
    return response.data;
  }

  /**
   * Reject a course
   * POST /live-education/courses/{id}/reject/
   */
  async rejectCourse(courseId: string, rejectionReason: string): Promise<any> {
    const response = await this.makeRequest(`/live-education/courses/${courseId}/reject/`, {
      method: 'POST',
      body: JSON.stringify({
        rejection_reason: rejectionReason
      })
    });
    return response.data;
  }

  /**
   * Toggle course visibility (hide/show course)
   * POST /live-courses/courses/{id}/toggle_visibility/
   */
  async toggleCourseVisibility(courseId: string): Promise<ApiResponse> {
    return this.makeRequest(`/live-courses/courses/${courseId}/toggle_visibility/`, {
      method: 'POST',
      body: JSON.stringify({})
    });
  }

  /**
   * Toggle course applications (enable/disable registrations)
   * POST /live-courses/courses/{id}/toggle_applications/
   */
  async toggleCourseApplications(courseId: string): Promise<ApiResponse> {
    return this.makeRequest(`/live-courses/courses/${courseId}/toggle_applications/`, {
      method: 'POST',
      body: JSON.stringify({})
    });
  }

  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Get Academic Supervisor profile
   * GET /supervisors/academic/profile/
   */
  async getProfile(): Promise<any> {
    const response = await this.makeRequest('/profile/');
    return response.data || null;
  }

  /**
   * Update Academic Supervisor profile
   * PATCH /supervisors/academic/profile/
   */
  async updateProfile(profileData: any): Promise<ApiResponse> {
    return this.makeRequest('/profile/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // ==================== REPORTS AND ANALYTICS ====================

  /**
   * Get teacher performance report
   * GET /supervisors/academic/reports/teachers/
   */
  async getTeacherReport(): Promise<any> {
    const response = await this.makeRequest('/reports/teachers/');
    return response.data || [];
  }

  /**
   * Get course performance report
   * GET /supervisors/academic/reports/courses/
   */
  async getCourseReport(): Promise<any> {
    const response = await this.makeRequest('/reports/courses/');
    return response.data || [];
  }

  /**
   * Get student enrollment statistics
   * GET /supervisors/academic/reports/students/
   */
  async getStudentReport(): Promise<any> {
    const response = await this.makeRequest('/reports/students/');
    return response.data || [];
  }
}

// Export singleton instance
export const academicSupervisorApi = new AcademicSupervisorApiService();

// Export default for convenience
export default academicSupervisorApi;
