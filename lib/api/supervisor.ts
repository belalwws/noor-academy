/**
 * Supervisor API Service
 * Handles all supervisor-related API calls including shared operations
 * for both General and Academic supervisors
 */

import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

export interface SupervisorProfile {
  user: {
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
    role: string;
    last_login: string;
    date_joined: string;
    country_code: string;
    phone_number: string;
    age: number;
    learning_goal: string;
    preferred_language: string;
    bio: string;
    is_verified: boolean;
    is_profile_complete: boolean;
    is_profile_public: boolean;
    profile_image_url: string;
    profile_image_thumbnail_url: string;
  };
  supervisor_type: 'general' | 'academic';
  supervisor_type_display: string;
  parent_supervisor_name?: string;
  academic_supervisors_count?: string;
  department: string;
  specialization: string;
  areas_of_responsibility: string;
  profile_image_url: string;
  profile_image_thumbnail_url: string;
  completion_percentage: number;
  profile_completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SupervisorProfileUpdate {
  supervisor_type?: 'general' | 'academic';
  department?: string;
  specialization?: string;
  areas_of_responsibility?: string;
  profile_image_url?: string;
  profile_image_thumbnail_url?: string;
}

export interface SupervisorProfileCompletion {
  department: string;
  specialization: string;
  areas_of_responsibility: string;
}

export interface SupervisorPasswordSetup {
  token: string;
  password: string;
  password2: string;
}

export interface GeneralSupervisorStatistics {
  total_academic_supervisors: number;
  total_teachers: number;
  pending_teachers: number;
  approved_teachers: number;
  pending_invitations: number;
  total_students: number;
  active_courses: number;
}

export interface AcademicSupervisorListItem {
  id: number;
  user_name: string;
  user_email: string;
  department: string;
  specialization: string;
  areas_of_responsibility: string;
  completion_percentage: number;
  created_at: string;
}

export interface SupervisorInvitation {
  id: string;
  email: string;
  token: string;
  supervisor_type: 'general' | 'academic';
  supervisor_type_display: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  status_display: string;
  invited_by_email: string;
  parent_supervisor_name?: string;
  invited_at: string;
  expires_at: string;
  accepted_at?: string;
  supervisor_user?: number;
}

export interface TeacherListItem {
  id: number;
  user_name: string;
  user_email: string;
  specialization: string;
  specialization_display: string;
  approval_status: string;
  approval_status_display: string;
  academic_supervisor?: number;
  academic_supervisor_name?: string;
  years_of_experience: number;
  created_at: string;
  approved_at?: string;
}

export interface InviteAcademicSupervisorRequest {
  email: string;
  specialization: string;
  areas_of_responsibility: string;
}

export interface ApproveTeacherRequest {
  academic_supervisor_id: number;
  approval_notes: string;
}

export interface RejectTeacherRequest {
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

class SupervisorApiService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      logger.debug('Making supervisor API request:', { endpoint, method: options.method || 'GET' });

      let response;
      const method = options.method || 'GET';
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const fullEndpoint = `/supervisors${cleanEndpoint}`;
      
      switch (method) {
        case 'GET':
          response = await apiClient.get<T>(fullEndpoint);
          break;
        case 'POST':
          const postBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.post<T>(fullEndpoint, postBody);
          break;
        case 'PUT':
          const putBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.put<T>(fullEndpoint, putBody);
          break;
        case 'PATCH':
          const patchBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.patch<T>(fullEndpoint, patchBody);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(fullEndpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (response.success === false) {
        logger.error('Supervisor API request failed:', { status: response.status, error: response.error });
        return {
          success: false,
          error: response.error || 'Unknown error',
          status: response.status,
        };
      }

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      logger.error('Supervisor API request failed:', error);
      return {
        success: false,
        error: error?.appError?.userMessage || error?.message || 'Network error',
        status: error?.status || 500,
      };
    }
  }

  // ==================== SHARED SUPERVISOR OPERATIONS ====================

  /**
   * Setup supervisor password using invitation token
   * POST /supervisors/setup-password/
   */
  async setupPassword(passwordData: SupervisorPasswordSetup): Promise<ApiResponse> {
    return this.makeRequest('/setup-password/', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  /**
   * Validate supervisor invitation token
   * GET /supervisors/validate-token/{token}/
   */
  async validateToken(token: string): Promise<ApiResponse> {
    return this.makeRequest(`/validate-token/${token}/`, {
      method: 'GET',
    });
  }

  /**
   * Get supervisor profile
   * GET /supervisors/profile/
   */
  async getProfile(): Promise<ApiResponse<SupervisorProfile>> {
    return this.makeRequest<SupervisorProfile>('/profile/');
  }

  /**
   * Update supervisor profile (full update)
   * PUT /supervisors/profile/
   */
  async updateProfile(profileData: SupervisorProfileUpdate): Promise<ApiResponse<SupervisorProfile>> {
    return this.makeRequest<SupervisorProfile>('/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  /**
   * Partially update supervisor profile
   * PATCH /supervisors/profile/
   */
  async partialUpdateProfile(profileData: Partial<SupervisorProfileUpdate>): Promise<ApiResponse<SupervisorProfile>> {
    return this.makeRequest<SupervisorProfile>('/profile/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  /**
   * Get profile completion data
   * GET /supervisors/profile/complete/
   */
  async getProfileCompletion(): Promise<ApiResponse<SupervisorProfileCompletion>> {
    return this.makeRequest<SupervisorProfileCompletion>('/profile/complete/');
  }

  /**
   * Complete supervisor profile
   * PUT /supervisors/profile/complete/
   */
  async completeProfile(completionData: SupervisorProfileCompletion): Promise<ApiResponse<SupervisorProfileCompletion>> {
    return this.makeRequest<SupervisorProfileCompletion>('/profile/complete/', {
      method: 'PUT',
      body: JSON.stringify(completionData),
    });
  }

  /**
   * Partially complete supervisor profile
   * PATCH /supervisors/profile/complete/
   */
  async partialCompleteProfile(completionData: Partial<SupervisorProfileCompletion>): Promise<ApiResponse<SupervisorProfileCompletion>> {
    return this.makeRequest<SupervisorProfileCompletion>('/profile/complete/', {
      method: 'PATCH',
      body: JSON.stringify(completionData),
    });
  }

  /**
   * Get profile completion status
   * GET /supervisors/profile/status/
   */
  async getProfileStatus(): Promise<ApiResponse> {
    return this.makeRequest('/profile/status/');
  }

  /**
   * Check if profile completion is required
   * GET /supervisors/check-completion/
   */
  async checkCompletionRequired(): Promise<ApiResponse> {
    return this.makeRequest('/check-completion/');
  }

  // ==================== GENERAL SUPERVISOR MANAGEMENT ====================

  /**
   * Get dashboard statistics for General Supervisor
   * GET /supervisors/general/dashboard/statistics/
   */
  async getGeneralSupervisorStatistics(): Promise<ApiResponse<GeneralSupervisorStatistics>> {
    return this.makeRequest<GeneralSupervisorStatistics>('/general/dashboard/statistics/');
  }

  /**
   * Invite Academic Supervisor
   * POST /supervisors/general/invite-academic/
   */
  async inviteAcademicSupervisor(invitationData: InviteAcademicSupervisorRequest): Promise<ApiResponse> {
    return this.makeRequest('/general/invite-academic/', {
      method: 'POST',
      body: JSON.stringify(invitationData),
    });
  }

  /**
   * Get list of Academic Supervisors under this General Supervisor
   * GET /supervisors/general/academic-supervisors/
   */
  async getAcademicSupervisors(): Promise<ApiResponse<AcademicSupervisorListItem[]>> {
    return this.makeRequest<AcademicSupervisorListItem[]>('/general/academic-supervisors/');
  }

  /**
   * Get list of pending Academic Supervisor invitations
   * GET /supervisors/general/pending-invitations/
   */
  async getPendingInvitations(): Promise<ApiResponse<SupervisorInvitation[]>> {
    return this.makeRequest<SupervisorInvitation[]>('/general/pending-invitations/');
  }

  /**
   * Get list of pending teacher applications
   * GET /supervisors/general/pending-teachers/
   */
  async getPendingTeachers(): Promise<ApiResponse<TeacherListItem[]>> {
    return this.makeRequest<TeacherListItem[]>('/general/pending-teachers/');
  }

  /**
   * Get list of approved teachers
   * GET /supervisors/general/approved-teachers/
   */
  async getApprovedTeachers(): Promise<ApiResponse<TeacherListItem[]>> {
    return this.makeRequest<TeacherListItem[]>('/general/approved-teachers/');
  }

  /**
   * Approve a teacher and assign to Academic Supervisor
   * POST /supervisors/general/approve-teacher/{id}/
   */
  async approveTeacher(teacherId: number, approvalData: ApproveTeacherRequest): Promise<ApiResponse> {
    return this.makeRequest(`/general/approve-teacher/${teacherId}/`, {
      method: 'POST',
      body: JSON.stringify(approvalData),
    });
  }

  /**
   * Reject a teacher application
   * POST /supervisors/general/reject-teacher/{id}/
   */
  async rejectTeacher(teacherId: number, rejectionData: RejectTeacherRequest): Promise<ApiResponse> {
    return this.makeRequest(`/general/reject-teacher/${teacherId}/`, {
      method: 'POST',
      body: JSON.stringify(rejectionData),
    });
  }

  /**
   * Revoke a pending Academic Supervisor invitation
   * DELETE /supervisors/general/revoke-invitation/{id}/
   */
  async revokeInvitation(invitationId: string): Promise<ApiResponse> {
    return this.makeRequest(`/general/revoke-invitation/${invitationId}/`, {
      method: 'DELETE',
    });
  }

  // ==================== LEGACY COMPATIBILITY ====================
  
  /**
   * Legacy method for backward compatibility
   * @deprecated Use getProfile() instead
   */
  async getSupervisorProfile(): Promise<ApiResponse<SupervisorProfile>> {
    logger.warn('getSupervisorProfile() is deprecated, use getProfile() instead');
    return this.getProfile();
  }

  // ===== Live Education Course Management Methods =====

  /**
   * Get course statistics for supervisors
   */
  async getCourseStatistics(): Promise<ApiResponse> {
    try {
      logger.debug('Getting course statistics');
      const response = await apiClient.get('/live-education/courses/statistics/');
      if (response.success === false) {
        return {
          success: false,
          error: response.error || 'فشل في جلب إحصائيات الدورات',
          status: 500,
        };
      }
      return {
        success: true,
        data: response.data,
        status: 200,
      };
    } catch (error: any) {
      logger.error('Failed to get course statistics:', error);
      return {
        success: false,
        error: error?.appError?.userMessage || error?.message || 'فشل في جلب إحصائيات الدورات',
        status: 500,
      };
    }
  }

  /**
   * Approve a course (General Supervisors only)
   */
  async approveCourse(courseId: string, data?: { rejection_reason?: string }): Promise<ApiResponse> {
    try {
      logger.debug('Approving course', { courseId, data });
      const response = await apiClient.post(`/live-education/courses/${courseId}/approve/`, data || {});
      if (response.success === false) {
        return {
          success: false,
          error: response.error || 'فشل في الموافقة على الدورة',
          status: 500,
        };
      }
      return {
        success: true,
        data: response.data,
        status: 200,
      };
    } catch (error: any) {
      logger.error('Failed to approve course:', error);
      return {
        success: false,
        error: error?.appError?.userMessage || error?.message || 'فشل في الموافقة على الدورة',
        status: 500,
      };
    }
  }

  /**
   * Reject a course (General Supervisors only)
   */
  async rejectCourse(courseId: string, rejectionReason: string): Promise<ApiResponse> {
    try {
      logger.debug('Rejecting course', { courseId, rejectionReason });
      const response = await apiClient.post(`/live-education/courses/${courseId}/reject/`, { 
        rejection_reason: rejectionReason 
      });
      if (response.success === false) {
        return {
          success: false,
          error: response.error || 'فشل في رفض الدورة',
          status: 500,
        };
      }
      return {
        success: true,
        data: response.data,
        status: 200,
      };
    } catch (error: any) {
      logger.error('Failed to reject course:', error);
      return {
        success: false,
        error: error?.appError?.userMessage || error?.message || 'فشل في رفض الدورة',
        status: 500,
      };
    }
  }

  /**
   * Publish an approved course (Teachers and Supervisors)
   */
  async publishCourse(courseId: string, courseData: {
    title?: string;
    description?: string;
    course_type?: string;
    trial_session_url?: string;
  }): Promise<ApiResponse> {
    try {
      logger.debug('Publishing course', { courseId, courseData });
      const response = await apiClient.post(`/live-education/courses/${courseId}/publish/`, courseData);
      if (response.success === false) {
        return {
          success: false,
          error: response.error || 'فشل في نشر الدورة',
          status: 500,
        };
      }
      return {
        success: true,
        data: response.data,
        status: 200,
      };
    } catch (error: any) {
      logger.error('Failed to publish course:', error);
      return {
        success: false,
        error: error?.appError?.userMessage || error?.message || 'فشل في نشر الدورة',
        status: 500,
      };
    }
  }

  // ===== Teacher Management Methods =====

  /**
   * Get list of teacher profiles with filtering
   */
  async getTeacherProfiles(params?: {
    approved?: boolean;
    page?: number;
    search?: string;
    specialization?: string;
  }): Promise<ApiResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.approved !== undefined) searchParams.append('approved', params.approved.toString());
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.search) searchParams.append('search', params.search);
      if (params?.specialization) searchParams.append('specialization', params.specialization);

      const url = `/teachers/profiles/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      
      logger.debug('Getting teacher profiles', { params });
      const response = await apiClient.get(url);
      if (response.success === false) {
        return {
          success: false,
          error: response.error || 'فشل في جلب ملفات المعلمين',
          status: 500,
        };
      }
      return {
        success: true,
        data: response.data,
        status: 200,
      };
    } catch (error: any) {
      logger.error('Failed to get teacher profiles:', error);
      return {
        success: false,
        error: error?.appError?.userMessage || error?.message || 'فشل في جلب ملفات المعلمين',
        status: 500,
      };
    }
  }

  /**
   * Approve a teacher profile
   */
  async approveTeacherProfile(teacherId: string, approvalData: {
    specialization?: string;
    qualifications?: string;
    biography?: string;
    years_of_experience?: number;
    primary_teaching_language?: string;
    general_supervisor_email?: string;
  }): Promise<ApiResponse> {
    try {
      logger.debug('Approving teacher profile', { teacherId, approvalData });
      const response = await apiClient.patch(`/teachers/profiles/${teacherId}/approve/`, approvalData);
      if (response.success === false) {
        return {
          success: false,
          error: response.error || 'فشل في الموافقة على ملف المعلم',
          status: 500,
        };
      }
      return {
        success: true,
        data: response.data,
        status: 200,
      };
    } catch (error: any) {
      logger.error('Failed to approve teacher profile:', error);
      return {
        success: false,
        error: error?.appError?.userMessage || error?.message || 'فشل في الموافقة على ملف المعلم',
        status: 500,
      };
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use updateProfile() instead
   */
  async updateSupervisorProfile(profileData: SupervisorProfileUpdate): Promise<ApiResponse<SupervisorProfile>> {
    logger.warn('updateSupervisorProfile() is deprecated, use updateProfile() instead');
    return this.updateProfile(profileData);
  }

  /**
   * Legacy method for teacher statistics
   * @deprecated Use getGeneralSupervisorStatistics() instead
   */
  async getTeacherStatistics(): Promise<ApiResponse> {
    logger.warn('getTeacherStatistics() is deprecated, use getGeneralSupervisorStatistics() instead');
    return this.makeRequest('/teachers/statistics/');
  }
}

// Export singleton instance
export const supervisorApiService = new SupervisorApiService();

// Export default for convenience
export default supervisorApiService;
