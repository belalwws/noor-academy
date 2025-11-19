import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';
import type {
  LiveCourseEditRequest,
  LiveCourseEditRequestListResponse,
  CreateLiveCourseEditRequestData,
  ReviewLiveCourseEditRequestData,
  CompareEditRequestResponse
} from '../types/live-course-edit-requests';

export class LiveCourseEditRequestsAPI {
  /**
   * Create a new edit request for a live course
   * POST /live-courses/edit-requests/
   */
  static async createEditRequest(
    courseId: string,
    data: CreateLiveCourseEditRequestData
  ): Promise<LiveCourseEditRequest> {
    try {
      logger.debug('🔍 Creating live course edit request', { courseId, fields: Object.keys(data) });
      
      // The API expects course_id in the request body
      const requestData = {
        ...data,
        course_id: courseId
      };
      
      logger.debug('📤 Sending edit request data:', requestData);
      
      const response = await apiClient.post<LiveCourseEditRequest>(
        '/live-courses/edit-requests/',
        requestData
      );

      if (response.success === false) {
        logger.error('🔍 Error creating edit request:', {
          error: response.error,
          originalError: response.originalError,
          status: response.status
        });
        throw new Error(response.error || 'فشل في إنشاء طلب تعديل الدورة');
      }

      logger.debug('✅ Edit request created successfully', { id: response.data?.id });
      return response.data as LiveCourseEditRequest;
    } catch (error: any) {
      logger.error('Failed to create edit request:', {
        error,
        message: error?.message,
        appError: error?.appError,
        originalError: error?.originalError
      });
      
      // Try to extract detailed error message
      let errorMessage = 'فشل في إنشاء طلب تعديل الدورة';
      
      if (error?.appError?.userMessage) {
        errorMessage = error.appError.userMessage;
      } else if (error?.originalError?.detail) {
        // Django REST Framework validation errors
        if (typeof error.originalError.detail === 'string') {
          errorMessage = error.originalError.detail;
        } else if (Array.isArray(error.originalError.detail)) {
          errorMessage = error.originalError.detail.map((e: any) => e.toString()).join(', ');
        } else if (typeof error.originalError.detail === 'object') {
          // Field-specific errors
          const fieldErrors = Object.entries(error.originalError.detail)
            .map(([field, errors]: [string, any]) => {
              const errorList = Array.isArray(errors) ? errors : [errors];
              return `${field}: ${errorList.join(', ')}`;
            })
            .join('; ');
          errorMessage = fieldErrors || errorMessage;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * List all edit requests
   * GET /live-courses/edit-requests/
   */
  static async listEditRequests(params?: {
    course?: string;
    status?: 'pending' | 'approved' | 'rejected';
    ordering?: string;
    page?: number;
  }): Promise<LiveCourseEditRequestListResponse> {
    try {
      logger.debug('🔍 Fetching edit requests', { params });
      
      const queryParams = new URLSearchParams();
      if (params?.course) queryParams.append('course', params.course);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());

      const url = `/live-courses/edit-requests/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<LiveCourseEditRequestListResponse>(url);

      if (response.success === false) {
        logger.error('🔍 Error fetching edit requests:', response.error);
        throw new Error(response.error || 'فشل في جلب طلبات التعديل');
      }

      logger.debug('✅ Edit requests fetched', { count: response.data?.results?.length || 0 });
      return response.data as LiveCourseEditRequestListResponse;
    } catch (error: any) {
      logger.error('Failed to fetch edit requests:', error);
      throw new Error(
        error?.appError?.userMessage || 
        error?.message || 
        'فشل في جلب طلبات التعديل'
      );
    }
  }

  /**
   * Get edit request details
   * GET /live-courses/edit-requests/{id}/
   */
  static async getEditRequest(id: string): Promise<LiveCourseEditRequest> {
    try {
      logger.debug('🔍 Fetching edit request details', { id });
      
      const response = await apiClient.get<LiveCourseEditRequest>(
        `/live-courses/edit-requests/${id}/`
      );

      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب تفاصيل طلب التعديل');
      }

      return response.data as LiveCourseEditRequest;
    } catch (error: any) {
      logger.error('Failed to fetch edit request details:', error);
      throw new Error(
        error?.appError?.userMessage || 
        error?.message || 
        'فشل في جلب تفاصيل طلب التعديل'
      );
    }
  }

  /**
   * Compare changes (diff view)
   * GET /live-courses/edit-requests/{id}/compare/
   */
  static async compareEditRequest(id: string): Promise<CompareEditRequestResponse> {
    try {
      logger.debug('🔍 Fetching edit request comparison', { id });
      
      const response = await apiClient.get<CompareEditRequestResponse>(
        `/live-courses/edit-requests/${id}/compare/`
      );

      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب مقارنة التغييرات');
      }

      return response.data as CompareEditRequestResponse;
    } catch (error: any) {
      logger.error('Failed to fetch comparison:', error);
      throw new Error(
        error?.appError?.userMessage || 
        error?.message || 
        'فشل في جلب مقارنة التغييرات'
      );
    }
  }

  /**
   * Review edit request (Supervisor only)
   * POST /live-courses/edit-requests/{id}/review/
   */
  static async reviewEditRequest(
    id: string,
    data: ReviewLiveCourseEditRequestData
  ): Promise<LiveCourseEditRequest> {
    try {
      logger.debug('🔍 Reviewing edit request', { id, action: data.action });
      
      const response = await apiClient.post<LiveCourseEditRequest>(
        `/live-courses/edit-requests/${id}/review/`,
        data
      );

      if (response.success === false) {
        throw new Error(response.error || 'فشل في مراجعة طلب التعديل');
      }

      logger.debug('✅ Edit request reviewed', { id, action: data.action });
      return response.data as LiveCourseEditRequest;
    } catch (error: any) {
      logger.error('Failed to review edit request:', error);
      throw new Error(
        error?.appError?.userMessage || 
        error?.message || 
        'فشل في مراجعة طلب التعديل'
      );
    }
  }
}

// Export as default instance
export const liveCourseEditRequestsApi = LiveCourseEditRequestsAPI;

