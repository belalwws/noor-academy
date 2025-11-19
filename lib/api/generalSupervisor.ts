/**
 * General Supervisor API Service
 * Handles all general supervisor-related API calls
 */

import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

// Course-related types
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
  notes: string;
  is_family_enrollment?: string;
  family_name?: string;
  family_enrollment?: string;
  general_supervisor_approved: boolean;
  general_supervisor_approved_at?: string;
}

export interface LiveEducationCourseItem {
  id: string;
  title: string;
  description: string;
  course_type: string;
  course_type_display: string;
  max_students: number;
  teacher: number;
  teacher_name: string;
  enrolled_count: number;
  approval_status: string;
  approval_status_display: string;
  subjects?: string;
  learning_outcomes?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseDetails extends LiveEducationCourseItem {
  lessons: string[];
  requirements?: string;
  target_audience?: string;
}

export interface CourseApprovalResponse {
  success: boolean;
  message: string;
  course: LiveEducationCourseItem;
}

export interface CourseRejectionResponse {
  success: boolean;
  message: string;
  course: LiveEducationCourseItem;
}

export interface PendingCoursesResponse {
  success: boolean;
  count: number;
  data: LiveEducationCourseItem[];
}

// Types for General Supervisor API
export interface GeneralSupervisorStatistics {
  total_academic_supervisors: number;
  active_academic_supervisors: number;
  pending_invitations: number;
  total_teachers: number;
  total_students: number;
  recent_activities: Array<{
    [key: string]: string;
  }>;
}

// Legacy alias for backward compatibility
export interface DashboardStatistics extends GeneralSupervisorStatistics {}

export interface AcademicSupervisorListItem {
  id: number;
  user_name: string;
  user_email: string;
  department: string;
  specialization: string;
  areas_of_responsibility: string;
  completion_percentage: number;
  created_at: string;
  parent_supervisor_name: string | null;
}

// Legacy alias for backward compatibility
export interface AcademicSupervisor extends AcademicSupervisorListItem {}

export interface SupervisorInvitation {
  id: string;
  email: string;
  token: string;
  supervisor_type: 'general' | 'academic';
  supervisor_type_display: string;
  status: 'pending' | 'accepted' | 'expired';
  status_display: string;
  invited_by_email: string;
  parent_supervisor_name: string;
  invited_at: string;
  expires_at: string;
  accepted_at: string | null;
  supervisor_user: number | null;
}

// Legacy alias for backward compatibility
export interface PendingInvitation extends SupervisorInvitation {}

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
  relationship_id?: number | null;
}

// Legacy alias for backward compatibility
export interface TeacherApplication extends TeacherListItem {}

export interface InviteAcademicSupervisorData {
  email: string;
  specialization: string;
  areas_of_responsibility: string;
}

export interface ApproveTeacherData {
  academic_supervisor_id?: number;
  approval_notes?: string;
}

export interface RejectTeacherData {
  rejection_reason: string;
}

export interface SupervisorProfileMin {
  id: number;
  user: number;
  user_name?: string;
  user_email?: string;
}

export interface GeneralSupervisorProfile {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  specialization: string;
  years_of_experience: number;
  biography: string;
  created_at: string;
  updated_at: string;
}

/**
 * General Supervisor API Service Class
 */
class GeneralSupervisorApiService {
  /**
   * Get dashboard statistics - Fixed according to API documentation
   */
  async getDashboardStatistics(): Promise<GeneralSupervisorStatistics> {
    try {
      logger.debug('🔍 Fetching dashboard statistics...');
      const response = await apiClient.get('/supervisors/general/dashboard/statistics/');
      
      logger.debug('✅ Dashboard statistics response received');
      
      // Handle different response formats
      const responseData = response.data as any;
      
      // If response has data property, use it
      if (responseData && responseData.data) {
        return responseData.data;
      }
      
      // If response is direct object with expected properties
      if (responseData && typeof responseData.total_academic_supervisors !== 'undefined') {
        return responseData;
      }
      
      // Return default values if no valid data
      logger.warn('⚠️ No valid statistics data found, using defaults');
      return {
        total_academic_supervisors: 0,
        active_academic_supervisors: 0,
        pending_invitations: 0,
        total_teachers: 0,
        total_students: 0,
        recent_activities: []
      };
    } catch (error: any) {
      logger.error('❌ Error fetching dashboard statistics:', error);

      // If 403, return default values
      if (error.message?.includes('403') || error.status === 403) {
        logger.warn('General Supervisor API not accessible, using default values...');
        return {
          total_academic_supervisors: 0,
          active_academic_supervisors: 0,
          pending_invitations: 0,
          total_teachers: 0,
          total_students: 0,
          recent_activities: []
        };
      }

      throw error;
    }
  }

  /**
   * Invite Academic Supervisor with fallback
   */
  async inviteAcademicSupervisor(data: InviteAcademicSupervisorData, retryCount = 0): Promise<any> {
    const maxRetries = 2;
    
    try {
      logger.debug('🔍 Inviting academic supervisor', { attempt: retryCount + 1, maxRetries: maxRetries + 1 });
      
      const response = await apiClient.post('/supervisors/general/invite-academic/', data);
      
      logger.debug('✅ Academic supervisor invitation response', { status: response.status });
      
      return {
        success: true,
        message: response.data?.message || 'تم إرسال الدعوة بنجاح',
        data: response.data
      };
    } catch (error: any) {
      logger.error('❌ Error inviting academic supervisor:', error);

      // Handle AbortError specifically with retry logic
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        if (retryCount < maxRetries) {
          logger.debug(`🔄 Retrying invitation (${retryCount + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return this.inviteAcademicSupervisor(data, retryCount + 1);
        }
        throw new Error('تم إلغاء الطلب - يرجى المحاولة مرة أخرى. تأكد من اتصال الإنترنت.');
      }

      // If 403, show user-friendly message
      if (error.message?.includes('403') || error.status === 403) {
        throw new Error('ليس لديك صلاحية لدعوة المشرفين الأكاديميين. هذه الميزة متاحة للمشرف العام فقط.');
      }

      // If validation error, preserve the error structure
      if (error.message === 'Validation error' && error.errors) {
        const validationError = new Error('Validation error');
        (validationError as any).errors = error.errors;
        throw validationError;
      }

      // Handle specific error messages
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  }

  /**
   * Get list of Academic Supervisors - Fixed according to API documentation
   */
  async getAcademicSupervisors(): Promise<AcademicSupervisorListItem[]> {
    try {
      logger.debug('🔍 Fetching academic supervisors...');
      const response = await apiClient.get('/supervisors/general/academic-supervisors/');
      
      logger.debug('✅ Academic supervisors response received');
      
      // Handle different response formats
      const responseData = response.data as any;
      
      // If response has data property, use it
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }
      
      // If response is direct array
      if (Array.isArray(responseData)) {
        return responseData;
      }
      
      // If response has results property (paginated)
      if (responseData && responseData.results && Array.isArray(responseData.results)) {
        return responseData.results;
      }
      
      logger.debug('⚠️ No valid academic supervisors data found');
      return [];
    } catch (error: any) {
      logger.error('❌ Error fetching academic supervisors:', error);

      // If 403, return empty array
      if (error.message?.includes('403') || error.status === 403) {
        logger.debug('Academic supervisors API not accessible, returning empty list...');
        return [];
      }

      throw error;
    }
  }

  /**
   * Get pending invitations - Fixed according to API documentation
   */
  async getPendingInvitations(): Promise<SupervisorInvitation[]> {
    try {
      logger.debug('🔍 Fetching pending invitations...');
      const response = await apiClient.get('/supervisors/general/pending-invitations/');
      
      logger.debug('✅ Pending invitations response:', response.data);
      
      // Handle different response formats
      const responseData = response.data as any;
      
      // If response has data property, use it
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }
      
      // If response is direct array
      if (Array.isArray(responseData)) {
        return responseData;
      }
      
      // If response has results property (paginated)
      if (responseData && responseData.results && Array.isArray(responseData.results)) {
        return responseData.results;
      }
      
      logger.debug('⚠️ No valid pending invitations data found');
      return [];
    } catch (error: any) {
      logger.error('❌ Error fetching pending invitations:', error);

      // If 403, return empty array
      if (error.message?.includes('403') || error.status === 403) {
        logger.debug('Pending invitations API not accessible, returning empty list...');
        return [];
      }

      throw error;
    }
  }

  /**
   * Get pending teacher applications - Fixed according to API documentation
   */
  async getPendingTeachers(): Promise<TeacherListItem[]> {
    try {
      logger.debug('🔍 Fetching pending teachers...');
      const response = await apiClient.get('/supervisors/general/pending-teachers/');
      
      logger.debug('✅ Pending teachers response:', response.data);
      
      // Handle different response formats
      const responseData = response.data as any;
      
      // If response has data property, use it
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }
      
      // If response is direct array
      if (Array.isArray(responseData)) {
        return responseData;
      }
      
      // If response has results property (paginated)
      if (responseData && responseData.results && Array.isArray(responseData.results)) {
        return responseData.results;
      }
      
      logger.debug('⚠️ No valid pending teachers data found');
      return [];
    } catch (error) {
      logger.error('❌ Error fetching pending teachers:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get approved teachers - Fixed according to API documentation
   */
  async getApprovedTeachers(): Promise<TeacherListItem[]> {
    try {
      logger.debug('🔍 Fetching approved teachers...');
      const response = await apiClient.get('/supervisors/general/approved-teachers/');
      
      logger.debug('✅ Approved teachers response:', response.data);
      
      // Handle different response formats
      const responseData = response.data as any;
      
      // If response has data property, use it
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }
      
      // If response is direct array
      if (Array.isArray(responseData)) {
        return responseData;
      }
      
      // If response has results property (paginated)
      if (responseData && responseData.results && Array.isArray(responseData.results)) {
        return responseData.results;
      }
      
      logger.debug('⚠️ No valid approved teachers data found');
      return [];
    } catch (error) {
      logger.error('❌ Error fetching approved teachers:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Approve a teacher - Fixed endpoint according to API documentation
   */
  async approveTeacher(teacherId: number, payload: { academic_supervisor_id?: number; approval_notes?: string }): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      logger.debug('🔍 Approving teacher:', teacherId, payload);
      const response = await apiClient.post(`/supervisors/general/approve-teacher/${teacherId}/`, payload);
      logger.debug('✅ Teacher approved:', response.data);
      
      // Return success with message
      return { 
        success: true, 
        message: response.data?.message || 'تم اعتماد المعلم بنجاح'
      };
    } catch (error: any) {
      logger.error('❌ Error approving teacher:', error);
      return { 
        success: false, 
        error: error.message || 'حدث خطأ في اعتماد المدرس' 
      };
    }
  }

  /**
   * Reject a teacher - Fixed endpoint according to API documentation
   */
  async rejectTeacher(teacherId: number, payload: { rejection_reason: string }): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      logger.debug('🔍 Rejecting teacher:', teacherId, payload);
      const response = await apiClient.post(`/supervisors/general/reject-teacher/${teacherId}/`, payload);
      logger.debug('✅ Teacher rejected:', response.data);
      
      // Return success with message
      return { 
        success: true, 
        message: response.data?.message || 'تم رفض المعلم بنجاح'
      };
    } catch (error: any) {
      logger.error('❌ Error rejecting teacher:', error);
      return { 
        success: false, 
        error: error.message || 'حدث خطأ في رفض المدرس' 
      };
    }
  }

  /**
   * Activate all approved teachers
   */
  async activateApprovedTeachers(): Promise<{ success: boolean; activated_count?: number; error?: string; message?: string }> {
    try {
      logger.debug('🔍 Activating approved teachers...');
      const response = await apiClient.post('/supervisors/general/activate-approved-teachers/');
      logger.debug('✅ Teachers activated:', response.data);
      
      // Return success with message
      return { 
        success: true, 
        activated_count: response.data?.data?.activated_count || 0,
        message: response.data?.message || 'تم تفعيل المدرسين بنجاح'
      };
    } catch (error: any) {
      logger.error('❌ Error activating teachers:', error);
      return { 
        success: false, 
        error: error.message || 'حدث خطأ في تفعيل المدرسين' 
      };
    }
  }

  /**
   * Revoke invitation - Enhanced debugging
   */
  async revokeInvitation(invitationId: number): Promise<any> {
    try {
      logger.debug('🔍 Revoking invitation via generalSupervisorApi:', invitationId);
      logger.debug('🔍 Invitation ID type:', typeof invitationId);
      
      if (!invitationId || isNaN(invitationId)) {
        throw new Error(`Invalid invitation ID: ${invitationId}`);
      }
      
      const endpoint = `/supervisors/general/revoke-invitation/${invitationId}/`;
      logger.debug('🔍 Using endpoint:', endpoint);

      const response = await apiClient.delete(endpoint);
      logger.debug('✅ Revoke invitation response:', response);
      logger.debug('✅ Response status:', response.status);
      logger.debug('✅ Response data:', response.data);
      
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error revoking invitation:', error);
      logger.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        response: error.response?.data,
        invitationId: invitationId,
        endpoint: `/supervisors/general/revoke-invitation/${invitationId}/`,
        errorType: typeof error,
        fullError: error
      });
      
      // Re-throw with more context
      const enhancedError = new Error(`Failed to revoke invitation ${invitationId}: ${error.message}`);
      (enhancedError as any).status = error.status;
      (enhancedError as any).originalError = error;
      throw enhancedError;
    }
  }

  /**
   * Get teacher statistics (Legacy)
   */
  async getTeacherStatistics(): Promise<DashboardStatistics> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: DashboardStatistics;
      }>('/supervisors/teachers/statistics/');
      return (response.data as any)?.data || {
        total_academic_supervisors: 0,
        active_academic_supervisors: 0,
        pending_invitations: 0,
        total_teachers: 0,
        total_students: 0,
        recent_activities: []
      };
    } catch (error) {
      logger.error('Error fetching teacher statistics:', error);
      throw error;
    }
  }

  /**
   * Get supervisor profile
   */
  async getMyProfile(): Promise<SupervisorProfileMin | null> {
    try {
      const response = await apiClient.get<SupervisorProfileMin | { success: boolean; data: SupervisorProfileMin }>(
        '/supervisors/profile/'
      );
      // Some endpoints are wrapped, some are not
      const data: any = (response.data as any)?.data || response.data;
      return data as SupervisorProfileMin;
    } catch (error) {
      logger.error('Error fetching supervisor profile:', error);
      return null;
    }
  }

  /**
   * Get pending courses for supervisor - Fixed according to API documentation
   */
  async getPendingCoursesForMe(): Promise<LiveEducationCourseItem[]> {
    try {
      logger.debug('🔍 Fetching pending courses for General Supervisor...');
      
      // Use the correct endpoint from API documentation with query parameters
      const response = await apiClient.get('/live-courses/courses/?approval_status=pending&submitted_to_general_supervisor=true');
      
      logger.debug('✅ Pending courses response:', response.data);
      
      // Handle multiple response formats:
      // 1. {success: true, count: X, data: [...]}
      // 2. {results: [...]}
      // 3. {data: [...]}
      // 4. Direct array [...]
      const responseData = response.data as any;
      let coursesArray: LiveEducationCourseItem[] = [];
      
      if (responseData && responseData.success && responseData.data && Array.isArray(responseData.data)) {
        // Format: {success: true, count: X, data: [...]}
        coursesArray = responseData.data;
        logger.debug(`✅ Found ${responseData.count || coursesArray.length} pending courses in data field`);
      } else if (responseData && responseData.results && Array.isArray(responseData.results)) {
        // Format: {results: [...]}
        coursesArray = responseData.results;
        logger.debug(`✅ Found ${responseData.count || coursesArray.length} pending courses in results field`);
      } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
        // Format: {data: [...]}
        coursesArray = responseData.data;
        logger.debug(`✅ Found ${coursesArray.length} pending courses in data field`);
      } else if (Array.isArray(responseData)) {
        // Format: Direct array
        coursesArray = responseData;
        logger.debug(`✅ Found ${coursesArray.length} pending courses as direct array`);
      }
      
      if (coursesArray.length > 0) {
        // Normalize approval_status for courses that might not have it
        coursesArray = coursesArray.map((course: any) => {
          if (!course.approval_status || course.approval_status === undefined) {
            course.approval_status = 'pending';
          }
          return course;
        });
        logger.debug(`✅ Returning ${coursesArray.length} pending courses`);
        return coursesArray;
      }
      
      logger.debug('⚠️ No pending courses found or invalid response format');
      logger.debug('📊 Response structure:', JSON.stringify(responseData, null, 2));
      return [];
      
    } catch (error) {
      logger.error('❌ Error fetching pending courses for supervisor:', error);
      return [];
    }
  }

  /**
   * Get all courses for supervisor - All courses created by teachers
   */
  async getAllCoursesForSupervisor(): Promise<LiveEducationCourseItem[]> {
    try {
      logger.debug('🔍 Fetching all courses for General Supervisor...');
      
      // Use the main courses endpoint with supervisor permissions
      const response = await apiClient.get('/live-courses/courses/');
      
      logger.debug('✅ All courses response:', response.data);
      
      // Handle paginated response structure
      const responseData = response.data as any;
      if (responseData && responseData.results && Array.isArray(responseData.results)) {
        logger.debug(`✅ Found ${responseData.count} total courses`);
        return responseData.results;
      }
      
      // Handle direct array response
      if (Array.isArray(responseData)) {
        logger.debug(`✅ Found ${responseData.length} total courses`);
        return responseData;
      }
      
      logger.debug('⚠️ No courses found or invalid response format');
      return [];
      
    } catch (error) {
      logger.error('❌ Error fetching all courses for supervisor:', error);
      return [];
    }
  }

  /**
   * Approve a course as General Supervisor - Fixed according to API documentation
   */
  async approveCourse(courseId: string, approvalNotes?: string): Promise<CourseApprovalResponse> {
    try {
      logger.debug(`🔍 Approving course ${courseId}...`);
      
      const response = await apiClient.post<CourseApprovalResponse>(`/live-courses/courses/${courseId}/approve/`, {
        approval_notes: approvalNotes || ''
      });
      
      logger.debug('✅ Course approved:', response.data);
      return response.data;
      
    } catch (error) {
      logger.error('❌ Error approving course:', error);
      throw error;
    }
  }

  /**
   * Reject a course as General Supervisor - Fixed according to API documentation
   */
  async rejectCourse(courseId: string, rejectionReason: string): Promise<CourseRejectionResponse> {
    try {
      logger.debug(`🔍 Rejecting course ${courseId}...`);
      
      if (!rejectionReason || rejectionReason.trim().length < 3) {
        throw new Error('Rejection reason is required');
      }
      
      const response = await apiClient.post<CourseRejectionResponse>(`/live-courses/courses/${courseId}/reject/`, {
        rejection_reason: rejectionReason.trim()
      });
      
      logger.debug('✅ Course rejected:', response.data);
      return response.data;
      
    } catch (error) {
      logger.error('❌ Error rejecting course:', error);
      throw error;
    }
  }

  /**
   * Get course details for review
   */
  async getCourseDetails(courseId: string): Promise<CourseDetails> {
    try {
      logger.debug(`🔍 Fetching course details for ${courseId}...`);
      
      const response = await apiClient.get<CourseDetails>(`/live-courses/courses/${courseId}/`);
      
      logger.debug('✅ Course details:', response.data);
      return response.data;
      
    } catch (error) {
      logger.error('❌ Error fetching course details:', error);
      throw error;
    }
  }

  // ==================== ENROLLMENT MANAGEMENT ====================

  /**
   * Get all course enrollments
   */
  async getEnrollments(params?: {
    course?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'completed';
    ordering?: string;
    page?: number;
  }): Promise<{ count: number; results: CourseEnrollment[] }> {
    try {
      logger.debug('🔍 Fetching enrollments...', params);
      
      const queryParams = new URLSearchParams();
      if (params?.course) queryParams.append('course', params.course);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());
      
      const url = `/live-education/enrollments/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<{ count: number; results: CourseEnrollment[] }>(url);
      
      logger.debug('✅ Enrollments loaded:', response.data);
      return response.data;
      
    } catch (error) {
      logger.error('❌ Error fetching enrollments:', error);
      throw error;
    }
  }

  /**
   * Get pending enrollments that need approval
   */
  async getPendingEnrollments(): Promise<CourseEnrollment[]> {
    try {
      logger.debug('🔍 Fetching pending enrollments...');
      
      // Use the base enrollments endpoint with status filter
      const response = await apiClient.get<CourseEnrollment[] | { count: number; results: CourseEnrollment[] }>('/live-education/enrollments/', {
        params: {
          status: 'pending_payment'
        }
      });
      
      logger.debug('✅ Pending enrollments loaded:', response.data);
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
        return (response.data as { results: CourseEnrollment[] }).results || [];
      }
      
      return [];
      
    } catch (error) {
      logger.error('❌ Error fetching pending enrollments:', error);
      throw error;
    }
  }

  /**
   * Get enrollment details
   */
  async getEnrollmentDetails(enrollmentId: string): Promise<CourseEnrollment> {
    try {
      logger.debug(`🔍 Fetching enrollment details for ${enrollmentId}...`);
      
      const response = await apiClient.get<CourseEnrollment>(`/live-education/enrollments/${enrollmentId}/`);
      
      logger.debug('✅ Enrollment details:', response.data);
      return response.data;
      
    } catch (error) {
      logger.error('❌ Error fetching enrollment details:', error);
      throw error;
    }
  }

  /**
   * Approve an enrollment
   */
  async approveEnrollment(enrollmentId: string, notes?: string): Promise<CourseEnrollment> {
    try {
      logger.debug(`✅ Approving enrollment ${enrollmentId}...`);
      
      const response = await apiClient.post<CourseEnrollment>(`/live-education/enrollments/${enrollmentId}/approve/`, {
        notes: notes || ''
      });
      
      logger.debug('✅ Enrollment approved:', response.data);
      return response.data;
      
    } catch (error) {
      logger.error('❌ Error approving enrollment:', error);
      throw error;
    }
  }

  /**
   * Reject an enrollment
   */
  async rejectEnrollment(enrollmentId: string, reason: string): Promise<CourseEnrollment> {
    try {
      logger.debug(`❌ Rejecting enrollment ${enrollmentId}...`);
      
      if (!reason.trim()) {
        throw new Error('Rejection reason is required');
      }
      
      const response = await apiClient.post<CourseEnrollment>(`/live-education/enrollments/${enrollmentId}/reject/`, {
        rejection_reason: reason.trim()
      });
      
      logger.debug('✅ Enrollment rejected:', response.data);
      return response.data;
      
    } catch (error) {
      logger.error('❌ Error rejecting enrollment:', error);
      throw error;
    }
  }
    /**
   * Get live sessions count for supervisor
   */
    async getLiveSessionsCount(): Promise<number> {
      try {
        logger.debug('🔍 Fetching live sessions count...');
        
        // Use sessions API to get live sessions
        const response = await apiClient.get('/sessions/live-sessions/');
        
        logger.debug('✅ Live sessions response:', response.data);
        
        // Handle different response formats
        const responseData = response.data as any;
        
        // If response has total_count property
        if (responseData && typeof responseData.total_count === 'number') {
          return responseData.total_count;
        }
        
        // If response has live_sessions array
        if (responseData && responseData.live_sessions && Array.isArray(responseData.live_sessions)) {
          return responseData.live_sessions.length;
        }
        
        // If response is direct array
        if (Array.isArray(responseData)) {
          return responseData.length;
        }
        
        logger.debug('⚠️ No valid live sessions data found');
        return 0;
        
      } catch (error) {
        logger.error('❌ Error fetching live sessions count:', error);
        return 0;
      }
    }
}

// Export singleton instance
export const generalSupervisorApi = new GeneralSupervisorApiService();

// Helper functions
export const getSpecializationLabel = (specialization: string): string => {
  const labels = {
    'memorize_quran': 'تحفيظ القرآن الكريم',
    'learn_arabic': 'تعلم اللغة العربية',
    'islamic_studies': 'الدراسات الإسلامية'
  };
  return labels[specialization as keyof typeof labels] || specialization;
};

export const getStatusLabel = (status: string): string => {
  const labels = {
    'pending': 'قيد المراجعة',
    'approved': 'معتمد',
    'rejected': 'مرفوض',
    'accepted': 'مقبول',
    'expired': 'منتهي الصلاحية'
  };
  return labels[status as keyof typeof labels] || status;
};

export const getStatusColor = (status: string): string => {
  const colors = {
    'pending': 'yellow',
    'approved': 'green',
    'rejected': 'red',
    'accepted': 'green',
    'expired': 'gray'
  };
  return colors[status as keyof typeof colors] || 'gray';
};
