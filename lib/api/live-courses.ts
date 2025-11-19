/**
 * Live Courses API Service
 * Updated API for Live Courses System using /live-courses/ endpoints
 */

import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

export interface LiveCourse {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  cover_image?: string;
  learning_outcomes: string;
  topics: string;
  intro_session_id?: string;
  teacher: number;
  teacher_name: string;
  teacher_id: string;
  teacher_email: string;
  status: 'pending' | 'approved' | 'rejected';
  approval_status: string;
  approval_status_display: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  start_date: string;
  end_date: string;
  accepting_applications: boolean;
  is_hidden: boolean;
  batches_count: string;
  total_students: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateCourseInput {
  title: string;
  description: string;
  thumbnail?: string;
  cover_image?: string;
  learning_outcomes: string;
  topics: string;
  intro_session_id?: string;
  start_date: string;
  end_date: string;
  accepting_applications: boolean;
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {}

export const liveCoursesApi = {
  // List courses with filters
  list: async (params?: {
    page?: number;
    approval_status?: 'pending' | 'approved' | 'rejected';
    course_type?: string;
    is_published?: boolean;
    ordering?: string;
    search?: string;
    status?: string;
    submitted_to_general_supervisor?: boolean;
  }): Promise<PaginatedResponse<LiveCourse>> => {
    try {
      logger.debug('Listing live courses', { params });
      
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.approval_status) queryParams.append('approval_status', params.approval_status);
      if (params?.course_type) queryParams.append('course_type', params.course_type);
      if (params?.is_published !== undefined) queryParams.append('is_published', params.is_published.toString());
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.submitted_to_general_supervisor !== undefined) {
        queryParams.append('submitted_to_general_supervisor', params.submitted_to_general_supervisor.toString());
      }

      const url = `/live-courses/courses/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<PaginatedResponse<LiveCourse>>(url);
      
      if (response.success === false) {
        throw new Error(response.error || 'Failed to list live courses');
      }
      
      return response.data as PaginatedResponse<LiveCourse>;
    } catch (error: any) {
      logger.error('Failed to list live courses:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to list live courses');
    }
  },

  // Get single course
  get: async (id: string): Promise<LiveCourse> => {
    try {
      logger.debug('Getting live course', { id });
      
      const response = await apiClient.get<LiveCourse>(`/live-courses/courses/${id}/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'Failed to get live course');
      }
      
      return response.data as LiveCourse;
    } catch (error: any) {
      logger.error('Failed to get live course:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to get live course');
    }
  },

  // Create new course
  create: async (data: CreateCourseInput): Promise<LiveCourse> => {
    try {
      logger.debug('Creating live course', { data });
      
      const response = await apiClient.post<LiveCourse>('/live-courses/courses/', data);
      
      if (response.success === false) {
        throw new Error(response.error || 'Failed to create live course');
      }
      
      return response.data as LiveCourse;
    } catch (error: any) {
      logger.error('Failed to create live course:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to create live course');
    }
  },

  // Update course
  update: async (id: string, data: UpdateCourseInput): Promise<LiveCourse> => {
    try {
      logger.debug('Updating live course', { id, data });
      
      const response = await apiClient.put<LiveCourse>(`/live-courses/courses/${id}/`, data);
      
      if (response.success === false) {
        throw new Error(response.error || 'Failed to update live course');
      }
      
      return response.data as LiveCourse;
    } catch (error: any) {
      logger.error('Failed to update live course:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to update live course');
    }
  },

  // Partial update
  partialUpdate: async (id: string, data: Partial<UpdateCourseInput>): Promise<LiveCourse> => {
    try {
      logger.debug('Partially updating live course', { id, data });
      
      const response = await apiClient.patch<LiveCourse>(`/live-courses/courses/${id}/`, data);
      
      if (response.success === false) {
        throw new Error(response.error || 'Failed to partially update live course');
      }
      
      return response.data as LiveCourse;
    } catch (error: any) {
      logger.error('Failed to partially update live course:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to partially update live course');
    }
  },

  // Delete course
  delete: async (id: string): Promise<void> => {
    try {
      logger.debug('Deleting live course', { id });
      
      const response = await apiClient.delete(`/live-courses/courses/${id}/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'Failed to delete live course');
      }
    } catch (error: any) {
      logger.error('Failed to delete live course:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to delete live course');
    }
  },

  // Approve course (Supervisor only)
  approve: async (id: string): Promise<LiveCourse> => {
    try {
      logger.debug('Approving live course', { id });
      
      const response = await apiClient.post<LiveCourse>(`/live-courses/courses/${id}/approve/`, {});
      
      if (response.success === false) {
        throw new Error(response.error || 'Failed to approve live course');
      }
      
      return response.data as LiveCourse;
    } catch (error: any) {
      logger.error('Failed to approve live course:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to approve live course');
    }
  },

  // Reject course (Supervisor only)
  reject: async (id: string, rejection_reason: string): Promise<LiveCourse> => {
    try {
      logger.debug('Rejecting live course', { id, rejection_reason });
      
      const response = await apiClient.post<LiveCourse>(`/live-courses/courses/${id}/reject/`, { rejection_reason });
      
      if (response.success === false) {
        throw new Error(response.error || 'Failed to reject live course');
      }
      
      return response.data as LiveCourse;
    } catch (error: any) {
      logger.error('Failed to reject live course:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to reject live course');
    }
  },
};

export default liveCoursesApi;

