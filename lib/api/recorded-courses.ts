/**
 * Recorded Courses API Service
 * Handles all recorded course-related API calls
 */

import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

// ==================== TYPES ====================

export interface RecordedCourse {
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
  teacher_email: string;
  teacher_id?: string;
  teacher_profile_image_url?: string;
  teacher_profile_image_thumbnail_url?: string;
  price: string;
  platform_commission_percentage?: string;
  final_price?: string;
  status: 'pending' | 'approved' | 'rejected';
  approval_status: string;
  approval_status_display: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  start_date: string;
  end_date: string;
  accepting_applications: boolean;
  is_hidden?: boolean;
  units_count?: string;
  total_lessons?: string;
  created_at: string;
  updated_at?: string;
}

export interface RecordedCourseDetail extends RecordedCourse {
  units: RecordedUnit[];
}

export interface RecordedUnit {
  id?: string; // Optional for create response
  course: string;
  course_title?: string;
  title: string;
  description: string;
  order: number;
  lessons?: RecordedLesson[];
  lesson_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RecordedUnitDetail extends RecordedUnit {
  id: string; // Required in detail response
  lessons: RecordedLesson[];
  lesson_count: number;
  course_title: string;
  created_at: string;
  updated_at: string;
}

export interface RecordedLesson {
  id: string;
  unit: string;
  title: string;
  description: string;
  learning_outcomes: string;
  order: number;
  video_url?: string;
  bunny_video_id?: string;
  video_duration?: number;
  video_size?: number;
  created_at: string;
  updated_at: string;
  upload_url?: string; // Upload URL returned from createVideo endpoint
}

export interface CreateRecordedUnitInput {
  course: string;
  title: string;
  description: string;
  order: number;
}

export interface UpdateRecordedUnitInput {
  course?: string;
  title?: string;
  description?: string;
  order?: number;
}

export interface CreateRecordedLessonVideoInput {
  unit: string;
  title: string;
  description: string;
  learning_outcomes: string;
  order: number;
  video_url?: string;
}

export interface UpdateRecordedLessonInput {
  unit?: string;
  title?: string;
  description?: string;
  learning_outcomes?: string;
  order?: number;
  video_url?: string;
}

export interface AttachVideoInput {
  unit?: string;
  title?: string;
  description?: string;
  learning_outcomes?: string;
  order?: number;
  video_url?: string;
}

export interface ListRecordedUnitsParams {
  course?: string;
  ordering?: string;
  page?: number;
  search?: string;
}

export interface ListRecordedLessonsParams {
  unit?: string;
  unit__course?: string;
  ordering?: string;
  page?: number;
  search?: string;
}

export interface CreateRecordedCourseInput {
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
  price: string;
}

export interface UpdateRecordedCourseInput {
  title?: string;
  description?: string;
  thumbnail?: string;
  cover_image?: string;
  learning_outcomes?: string;
  topics?: string;
  intro_session_id?: string;
  price?: string;
  platform_commission_percentage?: string;
  rejection_reason?: string;
  start_date?: string;
  end_date?: string;
  accepting_applications?: boolean;
}

export interface ApproveRecordedCourseInput {
  platform_commission_percentage?: string;
  notes?: string;
  rejection_reason?: string;
}

export interface RejectRecordedCourseInput {
  platform_commission_percentage?: string;
  notes?: string;
  rejection_reason: string;
}

export interface ToggleApplicationsInput {
  accepting_applications: boolean;
}

export interface ToggleVisibilityInput {
  is_hidden: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ListRecordedCoursesParams {
  accepting_applications?: boolean;
  ordering?: string;
  page?: number;
  search?: string;
  status?: 'pending' | 'approved' | 'rejected';
  teacher?: number;
}

// ==================== API SERVICE ====================

class RecordedCoursesApiService {
  /**
   * List recorded courses
   * GET /recorded-courses/courses/
   */
  async list(params?: ListRecordedCoursesParams): Promise<PaginatedResponse<RecordedCourse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.accepting_applications !== undefined) {
        queryParams.append('accepting_applications', params.accepting_applications.toString());
      }
      if (params?.ordering) {
        queryParams.append('ordering', params.ordering);
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      if (params?.status) {
        queryParams.append('status', params.status);
      }
      if (params?.teacher) {
        queryParams.append('teacher', params.teacher.toString());
      }

      const queryString = queryParams.toString() ? '?' + queryParams.toString() : '';
      const url = `/recorded-courses/courses/${queryString}`;
      const response = await apiClient.get<PaginatedResponse<RecordedCourse>>(url);
      return response.data;
    } catch (error) {
      logger.error('❌ Error listing recorded courses:', error);
      throw error;
    }
  }

  /**
   * Get recorded course details
   * GET /recorded-courses/courses/{id}/
   */
  async get(id: string): Promise<RecordedCourseDetail> {
    try {
      const response = await apiClient.get<RecordedCourseDetail>(`/recorded-courses/courses/${id}/`);
      return response.data;
    } catch (error) {
      logger.error(`❌ Error getting recorded course ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create recorded course
   * POST /recorded-courses/courses/
   */
  async create(data: CreateRecordedCourseInput): Promise<RecordedCourse> {
    try {
      logger.debug('📤 Creating recorded course:', data);
      const response = await apiClient.post<RecordedCourse>('/recorded-courses/courses/', data);
      logger.debug('✅ Recorded course created - Full response:', response);
      logger.debug('✅ Recorded course data:', response.data);
      logger.debug('✅ Recorded course ID:', response.data?.id);
      
      // Ensure we have an id - if not, try to extract from Location header or response
      if (!response.data?.id) {
        logger.warn('⚠️ ID not found in response.data, checking response object...');
        logger.debug('Response object keys:', Object.keys(response));
        logger.debug('Response data keys:', response.data ? Object.keys(response.data) : 'No data');
        logger.debug('Full response.data:', response.data);
        logger.debug('Response status:', response.status);
        logger.debug('Response headers:', response.headers);
        
        // Try to get ID from response location header or other sources
        const locationHeader = (response.headers as any)?.location || response.headers?.get?.('location');
        logger.debug('Location header:', locationHeader);
        
        if (locationHeader) {
          const locationMatch = locationHeader.match(/\/([^\/]+)\/?$/);
          if (locationMatch) {
            (response.data as any).id = locationMatch[1];
            logger.debug('✅ Extracted ID from Location header:', locationMatch[1]);
          }
        } else {
          // If no location header, maybe the backend returns the full object but with different field
          // Let's try to find any UUID-like field
          const dataValues = Object.values(response.data || {});
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          
          for (const value of dataValues) {
            if (typeof value === 'string' && uuidPattern.test(value)) {
              (response.data as any).id = value;
              logger.debug('✅ Found UUID in response data:', value);
              break;
            }
          }
        }
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error creating recorded course:', error);
      throw error;
    }
  }

  /**
   * Update recorded course
   * PUT /recorded-courses/courses/{id}/
   */
  async update(id: string, data: UpdateRecordedCourseInput): Promise<RecordedCourseDetail> {
    try {
      const response = await apiClient.put<RecordedCourseDetail>(`/recorded-courses/courses/${id}/`, data);
      return response.data;
    } catch (error) {
      logger.error(`❌ Error updating recorded course ${id}:`, error);
      throw error;
    }
  }

  /**
   * Partially update recorded course
   * PATCH /recorded-courses/courses/{id}/
   */
  async partialUpdate(id: string, data: Partial<UpdateRecordedCourseInput>): Promise<RecordedCourseDetail> {
    try {
      const response = await apiClient.patch<RecordedCourseDetail>(`/recorded-courses/courses/${id}/`, data);
      return response.data;
    } catch (error) {
      logger.error(`❌ Error partially updating recorded course ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete recorded course
   * DELETE /recorded-courses/courses/{id}/
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/recorded-courses/courses/${id}/`);
    } catch (error) {
      logger.error(`❌ Error deleting recorded course ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get academic supervisor info for course
   * GET /recorded-courses/courses/{id}/academic-supervisor/
   */
  async getAcademicSupervisor(id: string): Promise<RecordedCourse> {
    try {
      const response = await apiClient.get<RecordedCourse>(`/recorded-courses/courses/${id}/academic-supervisor/`);
      return response.data;
    } catch (error) {
      logger.error(`❌ Error getting academic supervisor for course ${id}:`, error);
      throw error;
    }
  }

  /**
   * Approve recorded course (General Supervisors only)
   * POST /recorded-courses/courses/{id}/approve/
   * 
   * Approves a recorded course and sets platform commission.
   * Returns the updated course with all details including units.
   */
  async approve(id: string, data: ApproveRecordedCourseInput): Promise<RecordedCourseDetail> {
    try {
      // Clean up data - remove undefined values
      const cleanData: any = {};
      if (data.platform_commission_percentage !== undefined && data.platform_commission_percentage !== null && data.platform_commission_percentage !== '') {
        cleanData.platform_commission_percentage = data.platform_commission_percentage;
      }
      if (data.notes !== undefined && data.notes !== null && data.notes.trim()) {
        cleanData.notes = data.notes.trim();
      }
      if (data.rejection_reason !== undefined && data.rejection_reason !== null && data.rejection_reason.trim()) {
        cleanData.rejection_reason = data.rejection_reason.trim();
      }
      
      logger.debug(`📤 Approving recorded course ${id}:`, cleanData);
      logger.debug(`📤 Full URL: /recorded-courses/courses/${id}/approve/`);
      
      const response = await apiClient.post<RecordedCourseDetail>(`/recorded-courses/courses/${id}/approve/`, cleanData);
      logger.debug('✅ Recorded course approved:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error(`❌ Error approving recorded course ${id}:`, error);
      logger.error(`❌ Error response:`, error.response);
      logger.error(`❌ Error data:`, error.data);
      throw error;
    }
  }

  /**
   * Reject recorded course (General Supervisors only)
   * POST /recorded-courses/courses/{id}/reject/
   * 
   * Rejects a recorded course with a rejection reason.
   * Returns the updated course with all details including units.
   */
  async reject(id: string, data: RejectRecordedCourseInput): Promise<RecordedCourseDetail> {
    try {
      // Clean up data - remove undefined values
      const cleanData: any = {
        rejection_reason: data.rejection_reason?.trim() || ''
      };
      
      if (data.platform_commission_percentage !== undefined && data.platform_commission_percentage !== null && data.platform_commission_percentage !== '') {
        cleanData.platform_commission_percentage = data.platform_commission_percentage;
      }
      if (data.notes !== undefined && data.notes !== null && data.notes.trim()) {
        cleanData.notes = data.notes.trim();
      }
      
      logger.debug(`📤 Rejecting recorded course ${id}:`, cleanData);
      logger.debug(`📤 Full URL: /recorded-courses/courses/${id}/reject/`);
      
      const response = await apiClient.post<RecordedCourseDetail>(`/recorded-courses/courses/${id}/reject/`, cleanData);
      logger.debug('✅ Recorded course rejected:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error(`❌ Error rejecting recorded course ${id}:`, error);
      logger.error(`❌ Error response:`, error.response);
      logger.error(`❌ Error data:`, error.data);
      throw error;
    }
  }

  /**
   * Toggle course applications (General Supervisors only)
   * POST /recorded-courses/courses/{id}/toggle_applications/
   */
  async toggleApplications(id: string, data: ToggleApplicationsInput): Promise<RecordedCourseDetail> {
    try {
      const response = await apiClient.post<RecordedCourseDetail>(
        `/recorded-courses/courses/${id}/toggle_applications/`,
        data
      );
      return response.data;
    } catch (error) {
      logger.error(`❌ Error toggling applications for course ${id}:`, error);
      throw error;
    }
  }

  /**
   * Toggle course visibility (General Supervisors only)
   * POST /recorded-courses/courses/{id}/toggle_visibility/
   * 
   * Toggles the visibility (is_hidden) of a recorded course.
   * When is_hidden=true, course is hidden from students.
   * When is_hidden=false, course is visible to students.
   */
  async toggleVisibility(id: string, data: ToggleVisibilityInput): Promise<RecordedCourseDetail> {
    try {
      logger.debug(`📤 Sending toggle visibility request for course ${id}:`, data);
      logger.debug(`📤 Endpoint: POST /recorded-courses/courses/${id}/toggle_visibility/`);
      
      const response = await apiClient.post<RecordedCourseDetail>(
        `/recorded-courses/courses/${id}/toggle_visibility/`,
        data
      );
      
      logger.debug('✅ Toggle visibility response received');
      logger.debug('✅ Response is_hidden value:', response.data?.is_hidden);
      logger.debug('✅ Full response:', response.data);
      
      return response.data;
    } catch (error: any) {
      logger.error(`❌ Error toggling visibility for course ${id}:`, error);
      logger.error('❌ Error response status:', error.response?.status);
      logger.error('❌ Error response data:', error.response?.data);
      throw error;
    }
  }

  /**
   * Upload image and get URL
   * Helper method to upload thumbnail or cover_image
   */
  async uploadImage(file: File): Promise<string> {
    try {
      // Check if there's an image upload endpoint
      // For now, we'll convert to base64 or use a data URL
      // TODO: Implement proper image upload endpoint when available
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Return as data URL for now
          // In production, you should upload to a CDN/storage service
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (error) {
      logger.error('❌ Error uploading image:', error);
      throw error;
    }
  }

  // ==================== UNITS APIs ====================

  /**
   * List recorded course units
   * GET /recorded-courses/units/
   */
  async listUnits(params?: ListRecordedUnitsParams): Promise<PaginatedResponse<RecordedUnit>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.course) {
        queryParams.append('course', params.course);
      }
      if (params?.ordering) {
        queryParams.append('ordering', params.ordering);
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.search) {
        queryParams.append('search', params.search);
      }

      const queryString = queryParams.toString() ? '?' + queryParams.toString() : '';
      const url = `/recorded-courses/units/${queryString}`;
      const response = await apiClient.get<PaginatedResponse<RecordedUnit>>(url);
      return response.data;
    } catch (error) {
      logger.error('❌ Error listing recorded units:', error);
      throw error;
    }
  }

  /**
   * Get recorded unit details
   * GET /recorded-courses/units/{id}/
   */
  async getUnit(id: string): Promise<RecordedUnitDetail> {
    try {
      const response = await apiClient.get<RecordedUnitDetail>(`/recorded-courses/units/${id}/`);
      return response.data;
    } catch (error) {
      logger.error(`❌ Error getting recorded unit ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create recorded unit
   * POST /recorded-courses/units/
   */
  async createUnit(data: CreateRecordedUnitInput): Promise<RecordedUnit> {
    try {
      logger.debug('📤 Creating recorded unit:', data);
      const response = await apiClient.post<RecordedUnit>('/recorded-courses/units/', data);
      logger.debug('✅ Recorded unit created:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error creating recorded unit:', error);
      throw error;
    }
  }

  /**
   * Update recorded unit
   * PUT /recorded-courses/units/{id}/
   */
  async updateUnit(id: string, data: UpdateRecordedUnitInput): Promise<RecordedUnitDetail> {
    try {
      const response = await apiClient.put<RecordedUnitDetail>(`/recorded-courses/units/${id}/`, data);
      return response.data;
    } catch (error) {
      logger.error(`❌ Error updating recorded unit ${id}:`, error);
      throw error;
    }
  }

  /**
   * Partially update recorded unit
   * PATCH /recorded-courses/units/{id}/
   */
  async partialUpdateUnit(id: string, data: Partial<UpdateRecordedUnitInput>): Promise<RecordedUnitDetail> {
    try {
      const response = await apiClient.patch<RecordedUnitDetail>(`/recorded-courses/units/${id}/`, data);
      return response.data;
    } catch (error) {
      logger.error(`❌ Error partially updating recorded unit ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete recorded unit
   * DELETE /recorded-courses/units/{id}/
   */
  async deleteUnit(id: string): Promise<void> {
    try {
      await apiClient.delete(`/recorded-courses/units/${id}/`);
    } catch (error) {
      logger.error(`❌ Error deleting recorded unit ${id}:`, error);
      throw error;
    }
  }

  // ==================== LESSONS APIs ====================

  /**
   * List recorded lessons
   * GET /recorded-courses/lessons/
   */
  async listLessons(params?: ListRecordedLessonsParams): Promise<PaginatedResponse<RecordedLesson>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.unit) {
        queryParams.append('unit', params.unit);
      }
      if (params?.unit__course) {
        queryParams.append('unit__course', params.unit__course);
      }
      if (params?.ordering) {
        queryParams.append('ordering', params.ordering);
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.search) {
        queryParams.append('search', params.search);
      }

      const queryString = queryParams.toString() ? '?' + queryParams.toString() : '';
      const url = `/recorded-courses/lessons/${queryString}`;
      const response = await apiClient.get<PaginatedResponse<RecordedLesson>>(url);
      return response.data;
    } catch (error) {
      logger.error('❌ Error listing recorded lessons:', error);
      throw error;
    }
  }

  /**
   * Get recorded lesson details
   * GET /recorded-courses/lessons/{id}/
   */
  async getLesson(id: string): Promise<RecordedLesson> {
    try {
      const response = await apiClient.get<RecordedLesson>(`/recorded-courses/lessons/${id}/`);
      return response.data;
    } catch (error) {
      logger.error(`❌ Error getting recorded lesson ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get HLS URL for direct playback
   * GET /recorded-courses/lessons/{id}/hls-url/
   */
  async getLessonHlsUrl(id: string): Promise<{ hls_url: string } & RecordedLesson> {
    try {
      const response = await apiClient.get<{ hls_url: string } & RecordedLesson>(`/recorded-courses/lessons/${id}/hls-url/`);
      return response.data;
    } catch (error) {
      logger.error(`❌ Error getting HLS URL for lesson ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create video in Bunny Stream (Required for Lessons)
   * POST /recorded-courses/lessons/create-video/
   * 
   * This is the ONLY way to create recorded lessons.
   * Direct lesson creation is disabled because recorded lessons MUST have a video.
   * 
   * Workflow:
   * 1. Call this endpoint to create video and get upload URL
   * 2. Upload video file to the returned URL
   * 3. Call 'attachVideo' endpoint to link video to a lesson
   */
  async createVideo(data: CreateRecordedLessonVideoInput): Promise<any> {
    try {
      logger.debug('📤 Creating video in Bunny Stream:', data);
      const response = await apiClient.post<any>('/recorded-courses/lessons/create-video/', data);
      logger.debug('✅ Video created in Bunny Stream:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error creating video in Bunny Stream:', error);
      throw error;
    }
  }

  /**
   * Create recorded lesson
   * POST /recorded-courses/lessons/
   */
  async createLesson(data: CreateRecordedLessonVideoInput): Promise<RecordedLesson> {
    try {
      logger.debug('📤 Creating recorded lesson:', data);
      const response = await apiClient.post<RecordedLesson>('/recorded-courses/lessons/', data);
      logger.debug('✅ Recorded lesson created:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error creating recorded lesson:', error);
      throw error;
    }
  }

  /**
   * Update recorded lesson
   * PUT /recorded-courses/lessons/{id}/
   */
  async updateLesson(id: string, data: UpdateRecordedLessonInput): Promise<RecordedLesson> {
    try {
      const response = await apiClient.put<RecordedLesson>(`/recorded-courses/lessons/${id}/`, data);
      return response.data;
    } catch (error) {
      logger.error(`❌ Error updating recorded lesson ${id}:`, error);
      throw error;
    }
  }

  /**
   * Partially update recorded lesson
   * PATCH /recorded-courses/lessons/{id}/
   */
  async partialUpdateLesson(id: string, data: Partial<UpdateRecordedLessonInput>): Promise<RecordedLesson> {
    try {
      const response = await apiClient.patch<RecordedLesson>(`/recorded-courses/lessons/${id}/`, data);
      return response.data;
    } catch (error) {
      logger.error(`❌ Error partially updating recorded lesson ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete recorded lesson
   * DELETE /recorded-courses/lessons/{id}/
   */
  async deleteLesson(id: string): Promise<void> {
    try {
      await apiClient.delete(`/recorded-courses/lessons/${id}/`);
    } catch (error) {
      logger.error(`❌ Error deleting recorded lesson ${id}:`, error);
      throw error;
    }
  }

  /**
   * Attach video to lesson
   * POST /recorded-courses/lessons/{id}/attach-video/
   */
  async attachVideo(id: string, data: { video_id: string }): Promise<RecordedLesson> {
    try {
      logger.debug(`📤 Attaching video to lesson ${id}:`, data);
      const response = await apiClient.post<RecordedLesson>(`/recorded-courses/lessons/${id}/attach-video/`, data);
      logger.debug('✅ Video attached to lesson:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error(`❌ Error attaching video to lesson ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete video from lesson
   * DELETE /recorded-courses/lessons/{id}/delete-video/
   * 
   * Warning: This will delete the video permanently from Bunny Stream.
   * Use this if you want to replace the video with a new one.
   * After deletion, you can attach a new video using 'attachVideo' endpoint.
   */
  async deleteVideo(id: string): Promise<void> {
    try {
      logger.debug(`📤 Deleting video from lesson ${id}`);
      await apiClient.delete(`/recorded-courses/lessons/${id}/delete-video/`);
      logger.debug('✅ Video deleted from lesson');
    } catch (error) {
      logger.error(`❌ Error deleting video from lesson ${id}:`, error);
      throw error;
    }
  }

  /**
   * Upload video file to lesson (via server proxy)
   * POST /recorded-courses/lessons/{id}/upload-video-file/
   */
  async uploadVideoFile(id: string, videoFile: File): Promise<RecordedLesson> {
    try {
      logger.debug(`📤 Uploading video file for lesson ${id}...`);
      logger.debug(`📤 File name: ${videoFile.name}`);
      logger.debug(`📤 File size: ${(videoFile.size / (1024 * 1024)).toFixed(2)} MB`);
      logger.debug(`📤 File type: ${videoFile.type}`);
      
      const formData = new FormData();
      formData.append('video_file', videoFile);
      
      logger.debug(`📤 Sending request to: /recorded-courses/lessons/${id}/upload-video-file/`);
      
      const response = await apiClient.post<RecordedLesson>(
        `/recorded-courses/lessons/${id}/upload-video-file/`,
        formData
      );
      
      logger.debug('✅ Video file uploaded successfully:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error(`❌ Error uploading video file for lesson ${id}:`, error);
      logger.error(`❌ Error message:`, error?.message);
      logger.error(`❌ Error data:`, error?.data);
      logger.error(`❌ Error status:`, error?.status);
      
      // Provide more detailed error message
      const errorMessage = error?.data?.error || error?.message || 'فشل رفع الفيديو';
      const detailedError = new Error(errorMessage);
      (detailedError as any).data = error?.data;
      (detailedError as any).status = error?.status;
      throw detailedError;
    }
  }

  /**
   * Upload video directly (recommended method)
   * POST /recorded-courses/lessons/upload-video/
   * 
   * This is the recommended way to upload videos as it handles:
   * 1. Creating lesson in database
   * 2. Creating video in Bunny Stream
   * 3. Uploading video file securely
   * 4. Linking video to lesson
   */
  async uploadVideo(data: {
    unit: string;
    title: string;
    description: string;
    learning_outcomes?: string;
    order: number;
    video: File;
    video_url?: string;
  }): Promise<RecordedLesson> {
    try {
      logger.debug(`📤 Uploading video (all-in-one method)...`);
      logger.debug(`📤 Lesson: ${data.title}`);
      logger.debug(`📤 File: ${data.video.name} (${(data.video.size / (1024 * 1024)).toFixed(2)} MB)`);
      
      const formData = new FormData();
      formData.append('unit', data.unit);
      formData.append('title', data.title);
      formData.append('description', data.description);
      if (data.learning_outcomes) {
        formData.append('learning_outcomes', data.learning_outcomes);
      }
      formData.append('order', data.order.toString());
      formData.append('video', data.video);
      if (data.video_url) {
        formData.append('video_url', data.video_url);
      }
      
      logger.debug(`📤 Sending request to: /recorded-courses/lessons/upload-video/`);
      
      const response = await apiClient.post<RecordedLesson>(
        '/recorded-courses/lessons/upload-video/',
        formData
      );
      
      logger.debug('✅ Video uploaded successfully (all-in-one):', response.data);
      return response.data;
    } catch (error: any) {
      logger.error(`❌ Error uploading video (all-in-one):`, error);
      logger.error(`❌ Error details:`, {
        message: error?.message,
        data: error?.data,
        status: error?.status,
      });
      
      const errorMessage = error?.data?.error || error?.message || 'فشل رفع الفيديو';
      const detailedError = new Error(errorMessage);
      (detailedError as any).data = error?.data;
      (detailedError as any).status = error?.status;
      throw detailedError;
    }
  }
}

// Export singleton instance
export const recordedCoursesApi = new RecordedCoursesApiService();

// Export default
export default recordedCoursesApi;

