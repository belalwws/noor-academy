import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';
import {
  CourseEditRequest,
  CourseEditRequestResponse,
  CreateCourseEditRequestData,
  UpdateCourseEditRequestData,
  ApproveRequestData,
  RejectRequestData,
  ImplementChangesData
} from '@/lib/types/course-edit-requests';

export class CourseEditRequestsAPI {
  // Get all course edit requests
  static async listCourseEditRequests(page: number = 1): Promise<CourseEditRequestResponse> {
    try {
      logger.debug('🔍 Fetching course edit requests', { page });
      
      const response = await apiClient.get<CourseEditRequestResponse>(`/live-education/course-edit-requests/?page=${page}`);

      if (response.success === false) {
        logger.error('🔍 Error fetching course edit requests:', response.error);
        throw new Error(response.error || 'Failed to fetch course edit requests');
      }

      logger.debug('🔍 Course edit requests fetched', { count: response.data?.results?.length || 0 });
      return response.data as CourseEditRequestResponse;
    } catch (error: any) {
      logger.error('Failed to fetch course edit requests:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to fetch course edit requests');
    }
  }

  // Get specific course edit request details
  static async getCourseEditRequestDetails(id: number): Promise<CourseEditRequest> {
    try {
      logger.debug('🔍 Fetching course edit request details', { id });
      
      const response = await apiClient.get<CourseEditRequest>(`/live-education/course-edit-requests/${id}/`);

      if (response.success === false) {
        throw new Error(response.error || 'Failed to fetch course edit request');
      }

      return response.data as CourseEditRequest;
    } catch (error: any) {
      logger.error('Failed to fetch course edit request details:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to fetch course edit request');
    }
  }

  // Create new course edit request
  static async createCourseEditRequest(data: CreateCourseEditRequestData): Promise<CourseEditRequest> {
    try {
      logger.debug('🔍 Creating course edit request', { fields: Object.keys(data) });
      
      const response = await apiClient.post<CourseEditRequest>('/live-education/course-edit-requests/', data);

      if (response.success === false) {
        logger.error('🔍 Error creating course edit request:', response.error);
        throw new Error(response.error || 'فشل في إنشاء طلب تعديل الدورة');
      }

      return response.data as CourseEditRequest;
    } catch (error: any) {
      logger.error('Failed to create course edit request:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إنشاء طلب تعديل الدورة');
    }
  }

  // Update course edit request
  static async updateCourseEditRequest(id: number, data: UpdateCourseEditRequestData): Promise<CourseEditRequest> {
    try {
      logger.debug('🔍 Updating course edit request', { id });
      
      const response = await apiClient.put<CourseEditRequest>(`/live-education/course-edit-requests/${id}/`, data);

      if (response.success === false) {
        throw new Error(response.error || 'Failed to update course edit request');
      }

      return response.data as CourseEditRequest;
    } catch (error: any) {
      logger.error('Failed to update course edit request:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to update course edit request');
    }
  }

  // Delete course edit request
  static async deleteCourseEditRequest(id: number): Promise<void> {
    try {
      logger.debug('🔍 Deleting course edit request', { id });
      
      const response = await apiClient.delete(`/live-education/course-edit-requests/${id}/`);

      if (response.success === false) {
        throw new Error(response.error || 'Failed to delete course edit request');
      }
    } catch (error: any) {
      logger.error('Failed to delete course edit request:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to delete course edit request');
    }
  }

  // Approve course edit request (Supervisors only)
  static async approveCourseEditRequest(id: number, data: ApproveRequestData): Promise<CourseEditRequest> {
    try {
      logger.debug('🔍 Approving course edit request', { id });
      
      const response = await apiClient.post<CourseEditRequest>(`/live-education/course-edit-requests/${id}/approve/`, data);

      if (response.success === false) {
        throw new Error(response.error || 'Failed to approve course edit request');
      }

      return response.data as CourseEditRequest;
    } catch (error: any) {
      logger.error('Failed to approve course edit request:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to approve course edit request');
    }
  }

  // Reject course edit request (Supervisors only)
  static async rejectCourseEditRequest(id: number, data: RejectRequestData): Promise<CourseEditRequest> {
    try {
      logger.debug('🔍 Rejecting course edit request', { id });
      
      const response = await apiClient.post<CourseEditRequest>(`/live-education/course-edit-requests/${id}/reject/`, data);

      if (response.success === false) {
        throw new Error(response.error || 'Failed to reject course edit request');
      }

      return response.data as CourseEditRequest;
    } catch (error: any) {
      logger.error('Failed to reject course edit request:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to reject course edit request');
    }
  }

  // Implement course changes (Supervisors only)
  static async implementCourseChanges(id: number, data: ImplementChangesData): Promise<CourseEditRequest> {
    try {
      logger.debug('🔍 Implementing course changes', { id });
      
      const response = await apiClient.post<CourseEditRequest>(`/live-education/course-edit-requests/${id}/implement_changes/`, data);

      if (response.success === false) {
        throw new Error(response.error || 'Failed to implement course changes');
      }

      return response.data as CourseEditRequest;
    } catch (error: any) {
      logger.error('Failed to implement course changes:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to implement course changes');
    }
  }

  // Preview course changes
  static async previewCourseChanges(id: number): Promise<any> {
    try {
      logger.debug('🔍 Previewing course changes', { id });
      
      const response = await apiClient.get(`/live-education/course-edit-requests/${id}/preview_changes/`);

      if (response.success === false) {
        throw new Error(response.error || 'Failed to preview course changes');
      }

      return response.data;
    } catch (error: any) {
      logger.error('Failed to preview course changes:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to preview course changes');
    }
  }
}
