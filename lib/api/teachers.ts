/**
 * Teachers API Service
 * Handles all teacher-related API calls
 */

import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

// Types for Teacher API
export interface User {
  id: number;
  username: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: 'male' | 'female';
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  role: 'student' | 'teacher' | 'supervisor' | 'admin';
  last_login: string;
  date_joined: string;
  country_code: string;
  phone_number: string;
  age: number;
  learning_goal: 'memorize_quran' | 'learn_arabic' | 'islamic_studies';
  preferred_language: 'ar' | 'en';
  bio: string;
  is_verified: boolean;
  is_profile_complete: boolean;
  is_profile_public: boolean;
  profile_image_url: string;
  profile_image_thumbnail_url: string;
}

export interface TeacherProfile {
  id: number;
  user: User;
  specialization: 'memorize_quran' | 'learn_arabic' | 'islamic_studies';
  qualifications: string;
  biography: string;
  years_of_experience: number;
  primary_teaching_language: 'ar' | 'en';
  general_supervisor_email: string;
  general_supervisor: number;
  general_supervisor_name: string;
  academic_supervisor: number;
  academic_supervisor_name: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved: boolean;
  approved_at: string;
  approved_by: number;
  rejection_reason: string;
  can_access_platform: boolean;
  profile_image_url: string;
  profile_image_thumbnail_url: string;
  created_at: string;
  updated_at: string;
}

export interface TeachersListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TeacherProfile[];
}

export interface TeachersListParams {
  approved?: boolean;
  page?: number;
  search?: string;
  specialization?: 'memorize_quran' | 'learn_arabic' | 'islamic_studies';
}

export interface ApproveTeacherData {
  specialization?: 'memorize_quran' | 'learn_arabic' | 'islamic_studies';
  qualifications?: string;
  biography?: string;
  years_of_experience?: number;
  primary_teaching_language?: 'ar' | 'en';
  general_supervisor_email?: string;
}

export interface JoinGeneralSupervisorRequest {
  general_supervisor_email: string;
  request_message?: string;
}

// Types for Teacher APIs
export interface TeacherStudent {
  id: string;
  student: {
    id: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      get_full_name: string;
    };
    profile_image?: string;
    profile_image_thumbnail?: string;
  };
  course: {
    id: string;
    title: string;
    subject: string;
  };
  enrollment_date: string;
  status: string;
  progress?: number;
}

export interface StudentPerformance {
  student_name: string;
  course_title: string;
  total_assignments: number;
  submitted_assignments: number;
  graded_assignments: number;
  average_grade: number;
  completion_percentage: number;
  enrollment_date: string;
}

export interface TeacherStats {
  total_courses: number;
  total_students: number;
  pending_requests: number;
  pending_grading: number;
  upcoming_sessions: number;
  completion_rate: number;
  average_rating: number;
}

/**
 * Teachers API Service Class
 */
class TeachersApiService {
  /**
   * Get list of teacher profiles with filtering and search
   */
  async getTeachers(params: TeachersListParams = {}): Promise<TeachersListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.approved !== undefined) {
        queryParams.append('approved', params.approved.toString());
      }
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params.search) {
        queryParams.append('search', params.search);
      }
      if (params.specialization) {
        queryParams.append('specialization', params.specialization);
      }

      const endpoint = `/teachers/profiles/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<TeachersListResponse>(endpoint);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب المعلمين');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch teachers:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب المعلمين');
    }
  }

  /**
   * Approve a teacher profile (Legacy API - fallback)
   */
  async approveTeacher(teacherId: string | number, data: any = {}): Promise<any> {
    try {
      // Try the original endpoint that was working
      const response = await apiClient.patch(`/teachers/profiles/${teacherId}/approve/`, data);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في الموافقة على المعلم');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to approve teacher:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في الموافقة على المعلم');
    }
  }

  /**
   * Reject a teacher profile
   */
  async rejectTeacher(teacherId: string | number, rejectionReason: string): Promise<any> {
    try {
      const response = await apiClient.post(`/supervisors/general/reject-teacher/${teacherId}/`, {
        rejection_reason: rejectionReason
      });
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في رفض المعلم');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to reject teacher:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في رفض المعلم');
    }
  }

  /**
   * Get teacher profiles with filtering and search
   */
  async getTeacherProfiles(params?: {
    approved?: boolean;
    page?: number;
    search?: string;
    specialization?: string;
  }): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: TeacherProfile[];
  }> {
    try {
      logger.debug('Fetching teacher profiles', { params });
      
      const response = await apiClient.get('/teachers/profiles/', { params } as any);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب ملفات المعلمين');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch teacher profiles:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب ملفات المعلمين');
    }
  }

  /**
   * Request to join a new General Supervisor
   */
  async joinGeneralSupervisor(requestData: JoinGeneralSupervisorRequest): Promise<any> {
    try {
      logger.debug('Requesting to join General Supervisor', { requestData });
      
      const response = await apiClient.post('/teachers/join-general-supervisor/', requestData);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في طلب الانضمام للمشرف العام');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to request joining General Supervisor:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في طلب الانضمام للمشرف العام');
    }
  }

  /**
   * Get pending teachers (shortcut method)
   */
  async getPendingTeachers(params: Omit<TeachersListParams, 'approved'> = {}): Promise<TeachersListResponse> {
    return this.getTeachers({ ...params, approved: false });
  }

  /**
   * Get approved teachers (shortcut method)
   */
  async getApprovedTeachers(params: Omit<TeachersListParams, 'approved'> = {}): Promise<TeachersListResponse> {
    return this.getTeachers({ ...params, approved: true });
  }

  /**
   * Search teachers by name, qualifications, or biography
   */
  async searchTeachers(searchTerm: string, params: Omit<TeachersListParams, 'search'> = {}): Promise<TeachersListResponse> {
    return this.getTeachers({ ...params, search: searchTerm });
  }

  /**
   * Filter teachers by specialization
   */
  async getTeachersBySpecialization(
    specialization: 'memorize_quran' | 'learn_arabic' | 'islamic_studies',
    params: Omit<TeachersListParams, 'specialization'> = {}
  ): Promise<TeachersListResponse> {
    return this.getTeachers({ ...params, specialization });
  }

  /**
   * Delete a course
   * Teachers can only delete their own unpublished courses
   */
  async deleteCourse(courseId: string): Promise<{ success: boolean; message?: string }> {
    try {
      logger.debug('Deleting course', { courseId });
      
      const response = await apiClient.delete(`/live-education/courses/${courseId}/`);
      
      if (response.success === false) {
        // Handle specific error cases
        if (response.status === 403) {
          throw new Error('ليس لديك صلاحية لحذف هذه الدورة');
        } else if (response.status === 404) {
          throw new Error('الدورة غير موجودة');
        }
        throw new Error(response.error || 'حدث خطأ في حذف الدورة');
      }
      
      return {
        success: true,
        message: 'تم حذف الدورة بنجاح'
      };
    } catch (error: any) {
      logger.error('Failed to delete course:', error);
      
      // Handle specific error cases
      if (error?.status === 403) {
        throw new Error('ليس لديك صلاحية لحذف هذه الدورة');
      } else if (error?.status === 404) {
        throw new Error('الدورة غير موجودة');
      }
      
      throw new Error(error?.appError?.userMessage || error?.message || 'حدث خطأ في حذف الدورة');
    }
  }
}

// Export singleton instance
export const teachersApi = new TeachersApiService();

// Helper functions for UI
export const getSpecializationLabel = (specialization: string): string => {
  const labels = {
    'memorize_quran': 'تحفيظ القرآن الكريم',
    'learn_arabic': 'تعلم اللغة العربية',
    'islamic_studies': 'الدراسات الإسلامية'
  };
  return labels[specialization as keyof typeof labels] || specialization;
};

export const getApprovalStatusLabel = (status: string): string => {
  const labels = {
    'pending': 'قيد المراجعة',
    'approved': 'معتمد',
    'rejected': 'مرفوض'
  };
  return labels[status as keyof typeof labels] || status;
};

export const getApprovalStatusColor = (status: string): string => {
  const colors = {
    'pending': 'yellow',
    'approved': 'green',
    'rejected': 'red'
  };
  return colors[status as keyof typeof colors] || 'gray';
};

// Teachers API functions
export const teachersAPI = {
  // Students Management
  getStudents: async (courseId?: string): Promise<TeacherStudent[]> => {
    try {
      const params = courseId && courseId !== 'all' && courseId !== '' ? `?course_id=${courseId}` : '';
      const response = await apiClient.get(`/teachers/students/${params}`);
      
      // Handle different response formats
      if (response.data) {
        // If response has a results array (paginated)
        if (Array.isArray(response.data.results)) {
          return response.data.results;
        }
        // If response data is directly an array
        if (Array.isArray(response.data)) {
          return response.data;
        }
        // If response has a data property that's an array
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
      }
      
      logger.warn('Unexpected students API response format:', response);
      return [];
    } catch (error: any) {
      logger.error('Failed to fetch students:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الطلاب');
    }
  },

  getStudent: async (studentId: string): Promise<TeacherStudent> => {
    try {
      const response = await apiClient.get(`/teachers/students/${studentId}/`);
      
      // Handle different response formats
      if (response.data) {
        if (response.data.data) {
          return response.data.data;
        }
        return response.data;
      }
      
      throw new Error('No student data received');
    } catch (error: any) {
      logger.error('Failed to fetch student:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب بيانات الطالب');
    }
  },

  getStudentPerformance: async (studentId: string): Promise<StudentPerformance> => {
    try {
      const response = await apiClient.get(`/teachers/students/${studentId}/performance/`);
      
      // Handle different response formats
      if (response.data) {
        if (response.data.data) {
          return response.data.data;
        }
        return response.data;
      }
      
      throw new Error('No performance data received');
    } catch (error: any) {
      logger.error('Failed to fetch student performance:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب أداء الطالب');
    }
  },

  // Teacher Statistics
  getTeacherStats: async (): Promise<TeacherStats> => {
    const response = await apiClient.get('/teachers/stats/dashboard/');
    return response.data;
  },

  // Profile Management
  getProfile: async (): Promise<any> => {
    const response = await apiClient.get('/teachers/profile/');
    return response.data;
  },

  updateProfile: async (data: any): Promise<any> => {
    const response = await apiClient.patch('/teachers/profile/', data);
    return response.data;
  },
};
