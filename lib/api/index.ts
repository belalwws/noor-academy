/**
 * API Index - Central export for all API services
 * This file provides easy access to all API services and utilities
 */

// Import types used locally in this file (re-exports do not bring them into local scope)
import type { InviteAcademicSupervisorData, ApproveTeacherData, RejectTeacherData } from './generalSupervisor';

// Import runtime instances and helpers for local usage in this module
import { generalSupervisorApi } from './generalSupervisor';
import { enrollmentAPI } from './enrollments';
import { directAPI } from './directAPI';
import { notificationApi } from './notifications';
// Note: Some helpers from './helpers' are deprecated in favor of apiClient
// Only non-deprecated helpers are exported
import {
  extractArrayData,
  extractItemData,
  parseApiError,
  getStatusErrorMessage,
  validateRequiredFields,
  validateEmail,
  validateSaudiPhone,
  formatArabicDate,
  formatArabicDateTime,
  formatArabicTime,
  formatArabicNumber,
  buildQueryString,
  extractId,
  retryWithBackoff,
  apiCache,
  cachedRequest
} from './helpers';

// ================== MAIN API SERVICES ==================

// General Supervisor API (SDK/Service Wrapper)
export { 
  generalSupervisorApi,
  type GeneralSupervisorStatistics,
  type AcademicSupervisorListItem,
  type SupervisorInvitation,
  type TeacherListItem,
  type InviteAcademicSupervisorData,
  type ApproveTeacherData,
  type RejectTeacherData,
  type LiveEducationCourseItem,
  type CourseDetails,
  type CourseApprovalResponse,
  type CourseRejectionResponse,
  type PendingCoursesResponse,
  type CourseEnrollment
} from './generalSupervisor';

// Enrollment API (SDK/Service Wrapper)
export { 
  enrollmentAPI,
  type CourseEnrollment as EnrollmentCourseEnrollment,
  type EnrollmentResponse,
  type CreateEnrollmentRequest,
  type UpdateEnrollmentRequest,
  type EnrollmentFilters
} from './enrollments';

// Notification API (SDK/Service Wrapper)
export { 
  notificationApi,
  type Notification,
  type NotificationTemplate,
  type NotificationPreferences
} from './notifications';

// Direct API (REST calls)
export { 
  directAPI,
  type DirectCourseItem,
  type DirectFamilyRequest,
  type DirectFamilyRequestMember,
  type CourseActionPayload,
  type FamilyRequestActionPayload,
  getCourseTypeDisplay,
  getRelationshipDisplay,
  getStatusDisplay,
  formatDate,
  formatDateTime
} from './directAPI';

// API Helpers (Non-deprecated only)
// Note: getAuthHeaders, getApiUrl, makeAuthenticatedRequest, makeAuthenticatedJsonRequest
// are deprecated. Use apiClient from '../apiClient' instead.
export { 
  extractArrayData,
  extractItemData,
  parseApiError,
  getStatusErrorMessage,
  validateRequiredFields,
  validateEmail,
  validateSaudiPhone,
  formatArabicDate,
  formatArabicDateTime,
  formatArabicTime,
  formatArabicNumber,
  buildQueryString,
  extractId,
  retryWithBackoff,
  apiCache,
  cachedRequest
} from './helpers';

// ================== CONVENIENCE EXPORTS ==================

/**
 * All API services in one object for easy destructuring
 */
export const apiServices = {
  generalSupervisor: generalSupervisorApi,
  enrollment: enrollmentAPI,
  direct: directAPI,
  notification: notificationApi
};

/**
 * Quick access functions for common operations
 */
export const quickAPI = {
  // Statistics
  async getDashboardStats() {
    return generalSupervisorApi.getDashboardStatistics();
  },
  
  // Academic Supervisors
  async getAcademicSupervisors() {
    return generalSupervisorApi.getAcademicSupervisors();
  },
  
  // Invitations
  async getPendingInvitations() {
    return generalSupervisorApi.getPendingInvitations();
  },
  
  async inviteAcademicSupervisor(data: InviteAcademicSupervisorData) {
    return generalSupervisorApi.inviteAcademicSupervisor(data);
  },
  
  async revokeInvitation(invitationId: number) {
    return generalSupervisorApi.revokeInvitation(invitationId);
  },
  
  // Teachers
  async getPendingTeachers() {
    return generalSupervisorApi.getPendingTeachers();
  },
  
  async getApprovedTeachers() {
    return generalSupervisorApi.getApprovedTeachers();
  },
  
  async approveTeacher(relationshipId: number, payload: ApproveTeacherData) {
    return generalSupervisorApi.approveTeacher(relationshipId, payload);
  },
  
  async rejectTeacher(relationshipId: number, payload: RejectTeacherData) {
    return generalSupervisorApi.rejectTeacher(relationshipId, payload);
  },
  
  // Courses (Direct API)
  async getPendingCourses() {
    return directAPI.loadPendingCourses();
  },
  
  async approveCourse(courseId: string, notes?: string) {
    return directAPI.approveCourse(courseId, { approval_notes: notes });
  },
  
  async rejectCourse(courseId: string, reason: string) {
    return directAPI.rejectCourse(courseId, { rejection_reason: reason });
  },
  
  // Family Requests (Direct API)
  async getPendingFamilyRequests() {
    return directAPI.loadPendingFamilyRequests();
  },
  
  async approveFamilyRequest(requestId: string, notes?: string) {
    return directAPI.approveFamilyRequest(requestId, { supervisor_notes: notes });
  },
  
  async rejectFamilyRequest(requestId: string, reason: string) {
    return directAPI.rejectFamilyRequest(requestId, { rejection_reason: reason });
  },
  
  // Enrollments
  async getPendingEnrollments() {
    return enrollmentAPI.getPendingEnrollments();
  },
  
  async approveEnrollment(enrollmentId: string, notes?: string) {
    return enrollmentAPI.approveEnrollment(enrollmentId, notes);
  },
  
  async rejectEnrollment(enrollmentId: string, reason?: string) {
    return enrollmentAPI.rejectEnrollment(enrollmentId, reason);
  }
};

// ================== CONSTANTS ==================

/**
 * API endpoint constants
 */
export const API_ENDPOINTS = {
  // General Supervisor
  DASHBOARD_STATISTICS: '/supervisors/general/dashboard/statistics/',
  ACADEMIC_SUPERVISORS: '/supervisors/general/academic-supervisors/',
  PENDING_INVITATIONS: '/supervisors/general/pending-invitations/',
  PENDING_TEACHERS: '/supervisors/general/pending-teachers/',
  APPROVED_TEACHERS: '/supervisors/general/approved-teachers/',
  INVITE_ACADEMIC: '/supervisors/general/invite-academic/',
  REVOKE_INVITATION: '/supervisors/general/revoke-invitation/',
  TEACHER_APPROVE: '/supervisors/general/teacher-relationships/{id}/approve/',
  TEACHER_REJECT: '/supervisors/general/teacher-relationships/{id}/reject/',
  
  // Courses
  COURSES: '/live-education/courses/',
  COURSE_APPROVE: '/courses/courses/{id}/approve/',
  COURSE_REJECT: '/courses/courses/{id}/reject/',
  
  // Family Requests
  FAMILY_REQUESTS: '/live-education/family-requests/',
  FAMILY_REQUEST_APPROVE: '/live-education/family-requests/{id}/approve/',
  FAMILY_REQUEST_REJECT: '/live-education/family-requests/{id}/reject/',
  
  // Enrollments
  ENROLLMENTS: '/live-education/enrollments/',
  ENROLLMENT_PENDING: '/live-education/enrollments/pending/',
  ENROLLMENT_APPROVE: '/live-education/enrollments/{id}/approve/',
  ENROLLMENT_REJECT: '/live-education/enrollments/{id}/reject/'
};

/**
 * Status constants
 */
export const API_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  UNDER_REVIEW: 'under_review',
  COMPLETED: 'completed'
} as const;

/**
 * Course type constants
 */
export const COURSE_TYPES = {
  INDIVIDUAL: 'individual',
  FAMILY: 'family',
  GROUP_PRIVATE: 'group_private',
  GROUP_PUBLIC: 'group_public'
} as const;

/**
 * Relationship constants
 */
export const RELATIONSHIPS = {
  PARENT: 'parent',
  CHILD: 'child',
  SPOUSE: 'spouse',
  SIBLING: 'sibling',
  OTHER: 'other'
} as const;

// ================== DEFAULT EXPORT ==================

export default {
  // Services
  ...apiServices,
  
  // Quick API
  quick: quickAPI,
  
  // Helpers (Non-deprecated only)
  helpers: {
    extractArrayData,
    extractItemData,
    parseApiError,
    getStatusErrorMessage,
    validateRequiredFields,
    validateEmail,
    validateSaudiPhone,
    formatArabicDate,
    formatArabicDateTime,
    formatArabicTime,
    formatArabicNumber,
    buildQueryString,
    extractId,
    retryWithBackoff,
    apiCache,
    cachedRequest
  },
  
  // Constants
  endpoints: API_ENDPOINTS,
  status: API_STATUS,
  courseTypes: COURSE_TYPES,
  relationships: RELATIONSHIPS
};
