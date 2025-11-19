/**
 * Direct REST API calls for General Supervisor Dashboard
 * These functions use the unified apiClient
 */

import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';
import { getBaseUrl } from '../config';

// Types for direct API calls
export interface DirectCourseItem {
  id: string;
  title: string;
  description?: string;
  course_type: string;
  course_type_display: string;
  max_students: number;
  teacher: number;
  teacher_name: string;
  teacher_email?: string;
  enrolled_count: number;
  approval_status: string;
  approval_status_display: string;
  subjects?: string;
  learning_outcomes?: string;
  created_at: string;
  updated_at?: string;
}

export interface DirectFamilyRequestMember {
  id: number;
  student_id: string;
  student_name: string;
  relationship: 'parent' | 'child' | 'spouse' | 'sibling' | 'other';
  notes: string;
  added_at: string;
}

export interface DirectFamilyRequest {
  id: string;
  family_name: string;
  course: string;
  course_title: string;
  course_type: string;
  status: 'pending' | 'approved' | 'rejected';
  status_display: string;
  submitted_by: string;
  submitted_by_name: string;
  requested_members: DirectFamilyRequestMember[];
  member_count: string;
  supervisor_notes: string;
  rejection_reason: string;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseActionPayload {
  approval_notes?: string;
  rejection_reason?: string;
}

export interface FamilyRequestActionPayload {
  supervisor_notes?: string;
  rejection_reason?: string;
}

export interface AcademicSupervisor {
  id: number;
  user_name: string;
  user_email: string;
  department: string;
  specialization: string;
  areas_of_responsibility: string;
  completion_percentage: number;
  created_at: string;
  parent_supervisor_name: string;
}

/**
 * Direct API class for REST calls
 */
class DirectAPIService {
  private async makeAuthenticatedRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
    try {
      const method = options.method || 'GET';
      let response;
      
      switch (method) {
        case 'GET':
          response = await apiClient.get<T>(endpoint);
          break;
        case 'POST':
          const postBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.post<T>(endpoint, postBody);
          break;
        case 'PUT':
          const putBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.put<T>(endpoint, putBody);
          break;
        case 'PATCH':
          const patchBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.patch<T>(endpoint, patchBody);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (response.success === false) {
        return {
          ok: false,
          status: response.status,
          error: response.error || 'Unknown error'
        };
      }

      return {
        ok: true,
        status: response.status,
        data: response.data
      };
    } catch (error: any) {
      logger.error('Request failed:', error);
      return {
        ok: false,
        status: error?.status || 500,
        error: error?.appError?.userMessage || error?.message || 'Network error'
      };
    }
  }

  // ================== COURSES APIs ==================

  /**
   * GET /live-education/courses/
   * Load all courses and filter for pending ones
   */
  async loadAllCourses(): Promise<DirectCourseItem[]> {
    try {
      logger.debug('🔍 Loading all courses...');
      
      const response = await this.makeAuthenticatedRequest<DirectCourseItem[] | { results: DirectCourseItem[] }>('/live-education/courses/');
      
      if (!response.ok || !response.data) {
        logger.error('❌ Failed to load courses:', response.status);
        return [];
      }

      const data = response.data;
      const courses = Array.isArray(data) ? data : data.results || [];
      
      logger.debug('✅ Loaded courses:', courses.length);
      return courses;
    } catch (error) {
      logger.error('❌ Error loading courses:', error);
      return [];
    }
  }

  /**
   * GET /live-education/courses/ with pending filter
   * Load only pending courses for supervisor approval
   */
  async loadPendingCourses(): Promise<DirectCourseItem[]> {
    try {
      logger.debug('🔍 Loading pending courses...');
      
      const allCourses = await this.loadAllCourses();
      
      // Filter for pending courses
      const pendingCourses = allCourses.filter(course => 
        course.approval_status === 'pending' || course.approval_status === 'under_review'
      );
      
      logger.debug('✅ Found pending courses:', pendingCourses.length);
      return pendingCourses;
    } catch (error) {
      logger.error('❌ Error loading pending courses:', error);
      return [];
    }
  }

  /**
   * POST /courses/courses/{courseId}/approve/
   * Approve a course with optional notes
   */
  async approveCourse(courseId: string, payload: CourseActionPayload): Promise<boolean> {
    try {
      logger.debug('🔍 Approving course:', courseId);
      
      const response = await this.makeAuthenticatedRequest(
        `/courses/courses/${courseId}/approve/`,
        {
          method: 'POST',
          body: JSON.stringify({
            approval_notes: payload.approval_notes || ''
          }),
        }
      );

      if (response.ok) {
        logger.debug('✅ Course approved successfully');
        return true;
      } else {
        logger.error('❌ Failed to approve course:', response.status);
        return false;
      }
    } catch (error) {
      logger.error('❌ Error approving course:', error);
      return false;
    }
  }

  /**
   * POST /courses/courses/{courseId}/reject/
   * Reject a course with mandatory reason
   */
  async rejectCourse(courseId: string, payload: CourseActionPayload): Promise<boolean> {
    try {
      logger.debug('🔍 Rejecting course:', courseId);
      
      if (!payload.rejection_reason?.trim()) {
        logger.error('❌ Rejection reason is required');
        return false;
      }

      const response = await this.makeAuthenticatedRequest(
        `/courses/courses/${courseId}/reject/`,
        {
          method: 'POST',
          body: JSON.stringify({
            rejection_reason: payload.rejection_reason
          }),
        }
      );

      if (response.ok) {
        logger.debug('✅ Course rejected successfully');
        return true;
      } else {
        logger.error('❌ Failed to reject course:', response.status);
        return false;
      }
    } catch (error) {
      logger.error('❌ Error rejecting course:', error);
      return false;
    }
  }

  // ================== FAMILY REQUESTS APIs ==================

  /**
   * GET /live-education/family-requests/
   * Load all family requests
   */
  async loadFamilyRequests(): Promise<DirectFamilyRequest[]> {
    try {
      logger.debug('🔍 Loading family requests...');
      
      const response = await this.makeAuthenticatedRequest<DirectFamilyRequest[] | { results: DirectFamilyRequest[] }>('/live-education/family-requests/');
      
      if (!response.ok || !response.data) {
        logger.error('❌ Failed to load family requests:', response.status);
        return [];
      }

      const data = response.data;
      const requests = Array.isArray(data) ? data : data.results || [];
      
      logger.debug('✅ Loaded family requests:', requests.length);
      return requests;
    } catch (error) {
      logger.error('❌ Error loading family requests:', error);
      return [];
    }
  }

  /**
   * GET /live-education/family-requests/ with pending filter
   * Load only pending family requests
   */
  async loadPendingFamilyRequests(): Promise<DirectFamilyRequest[]> {
    try {
      logger.debug('🔍 Loading pending family requests...');
      
      const allRequests = await this.loadFamilyRequests();
      
      // Filter for pending requests
      const pendingRequests = allRequests.filter(request => 
        request.status === 'pending'
      );
      
      logger.debug('✅ Found pending family requests:', pendingRequests.length);
      return pendingRequests;
    } catch (error) {
      logger.error('❌ Error loading pending family requests:', error);
      return [];
    }
  }

  /**
   * POST /live-education/family-requests/{requestId}/approve/
   * Approve a family request with optional notes
   */
  async approveFamilyRequest(requestId: string, payload: FamilyRequestActionPayload): Promise<boolean> {
    try {
      logger.debug('🔍 Approving family request:', requestId);
      
      const response = await this.makeAuthenticatedRequest(
        `/live-education/family-requests/${requestId}/approve/`,
        {
          method: 'POST',
          body: JSON.stringify({
            supervisor_notes: payload.supervisor_notes || ''
          }),
        }
      );

      if (response.ok) {
        logger.debug('✅ Family request approved successfully');
        return true;
      } else {
        logger.error('❌ Failed to approve family request:', response.status);
        return false;
      }
    } catch (error) {
      logger.error('❌ Error approving family request:', error);
      return false;
    }
  }

  /**
   * POST /live-education/family-requests/{requestId}/reject/
   * Reject a family request with mandatory reason
   */
  async rejectFamilyRequest(requestId: string, payload: FamilyRequestActionPayload): Promise<boolean> {
    try {
      logger.debug('🔍 Rejecting family request:', requestId);
      
      if (!payload.rejection_reason?.trim()) {
        logger.error('❌ Rejection reason is required');
        return false;
      }

      const response = await this.makeAuthenticatedRequest(
        `/live-education/family-requests/${requestId}/reject/`,
        {
          method: 'POST',
          body: JSON.stringify({
            rejection_reason: payload.rejection_reason
          }),
        }
      );

      if (response.ok) {
        logger.debug('✅ Family request rejected successfully');
        return true;
      } else {
        logger.error('❌ Failed to reject family request:', response.status);
        return false;
      }
    } catch (error) {
      logger.error('❌ Error rejecting family request:', error);
      return false;
    }
  }

  // ================== ACADEMIC SUPERVISORS APIs ==================

  /**
   * GET /supervisors/general/academic-supervisors/
   * Load academic supervisors under this general supervisor
   */
  async loadAcademicSupervisors(): Promise<AcademicSupervisor[]> {
    try {
      logger.debug('🔍 Loading academic supervisors...');
      
      const response = await this.makeAuthenticatedRequest<AcademicSupervisor[] | { results: AcademicSupervisor[] }>('/supervisors/general/academic-supervisors/');
      
      if (!response.ok || !response.data) {
        logger.error('❌ Failed to load academic supervisors:', response.status);
        return [];
      }

      const data = response.data;
      const supervisors = Array.isArray(data) ? data : data.results || [];
      
      logger.debug('✅ Loaded academic supervisors:', supervisors.length);
      return supervisors;
    } catch (error) {
      logger.error('❌ Error loading academic supervisors:', error);
      return [];
    }
  }

  // ================== UTILITY FUNCTIONS ==================

  /**
   * Get course type display name in Arabic
   */
  getCourseTypeDisplay(courseType: string): string {
    const typeMap: Record<string, string> = {
      'individual': 'فردي',
      'family': 'عائلي',
      'group_private': 'مجموعة خاصة',
      'group_public': 'مجموعة عامة'
    };
    return typeMap[courseType] || courseType;
  }

  /**
   * Get relationship display name in Arabic
   */
  getRelationshipDisplay(relationship: string): string {
    const relationshipMap: Record<string, string> = {
      'parent': 'والد/والدة',
      'child': 'طفل',
      'spouse': 'زوج/زوجة',
      'sibling': 'أخ/أخت',
      'other': 'أخرى'
    };
    return relationshipMap[relationship] || relationship;
  }

  /**
   * Get status display name in Arabic
   */
  getStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'معلق',
      'approved': 'معتمد',
      'rejected': 'مرفوض',
      'under_review': 'قيد المراجعة'
    };
    return statusMap[status] || status;
  }

  /**
   * Format date to Arabic locale
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Format datetime to Arabic locale
   */
  formatDateTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }
}

// Export singleton instance
export const directAPI = new DirectAPIService();
export default directAPI;

// Export utility functions for easy access
export const {
  getCourseTypeDisplay,
  getRelationshipDisplay,
  getStatusDisplay,
  formatDate,
  formatDateTime
} = directAPI;
