/**
 * Recording API Service
 * 📹 Session Recording - Record live sessions and store on WASABI
 */

import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

export interface Recording {
  id: number;
  session: number;
  session_title?: string;
  session_id: string;
  batch?: string;
  batch_id?: number;
  batch_name?: string;
  egress_id?: string;
  recording_url?: string;
  wasabi_key?: string;
  duration: number;
  duration_formatted: string;
  file_size: number;
  file_size_formatted: string;
  content_type?: string;
  status: 'processing' | 'uploading' | 'available' | 'expired' | 'failed';
  error_message?: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  uploaded_at?: string;
  expires_at?: string;
  retention_days?: number;
  thumbnail_url?: string;
  is_public?: boolean;
  view_count: number;
  is_available?: string;
  is_expired?: string;
}

export interface RecordingListResponse {
  count?: number;
  next?: string;
  previous?: string;
  results?: Recording[];
  recordings?: Recording[]; // Backend may return 'recordings' instead of 'results'
  session_id?: string;
  session_title?: string;
}

export interface RecordingUrlResponse {
  url: string;
  expires_in?: number;
}

export interface StartRecordingRequest {
  session_id: string;
  layout?: 'grid' | 'speaker' | 'single';
}

export interface StopRecordingRequest {
  title?: string;
  session_type?: 'general' | 'lecture' | 'discussion';
  duration_minutes?: number;
  course?: string;
  lesson?: string;
  expires_at?: string;
  is_active?: boolean;
}

export class RecordingService {
  /**
   * POST /sessions/{id}/recordings/start/
   * Start recording a live session (teacher only)
   */
  async startRecording(sessionId: string, layout: 'grid' | 'speaker' | 'single' = 'grid'): Promise<Recording> {
    try {
      logger.debug('Starting recording', { sessionId, layout });
      
      const response = await apiClient.post<Recording>(
        `/sessions/${sessionId}/start-recording/`,
        { session_id: sessionId, layout }
      );

      if (response.success === false) {
        // Extract error message from response
        let errorMessage = 'فشل بدء التسجيل';
        
        if (response.error) {
          errorMessage = response.error;
        } else if (response.data && typeof response.data === 'object') {
          // Check for error or detail fields in response data
          const data = response.data as any;
          if (data.error) {
            errorMessage = data.error;
          } else if (data.detail) {
            errorMessage = Array.isArray(data.detail) 
              ? data.detail.map((d: any) => d.toString()).join(', ')
              : data.detail.toString();
          } else if (data.message) {
            errorMessage = data.message;
          }
        }
        
        // Check for specific error messages and provide user-friendly translations
        if (errorMessage.includes('EgressServiceClient') || errorMessage.includes('egress')) {
          errorMessage = 'خدمة التسجيل غير متاحة حالياً. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني.';
        } else if (errorMessage.includes('Recording already in progress')) {
          errorMessage = 'يوجد تسجيل قيد التشغيل بالفعل';
        } else if (errorMessage.includes('Recording service unavailable')) {
          errorMessage = 'خدمة التسجيل غير متاحة حالياً. يرجى المحاولة لاحقاً.';
        }
        
        throw new Error(errorMessage);
      }

      // Backend returns { message: '...', recording: {...} }
      // Extract recording from response.data.recording if it exists
      const responseData = response.data as any;
      if (responseData.recording) {
        return responseData.recording as Recording;
      }
      
      // Fallback to response.data directly if recording field doesn't exist
      return response.data as Recording;
    } catch (error: any) {
      logger.error('Failed to start recording:', error);
      
      // Extract user-friendly error message
      let errorMessage = 'فشل بدء التسجيل';
      
      if (error?.appError?.userMessage) {
        errorMessage = error.appError.userMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.data?.detail) {
        const detail = error.data.detail;
        errorMessage = Array.isArray(detail) 
          ? detail.map((d: any) => d.toString()).join(', ')
          : detail.toString();
      }
      
      // Check for specific error messages and provide user-friendly translations
      if (errorMessage.includes('EgressServiceClient') || errorMessage.includes('egress')) {
        errorMessage = 'خدمة التسجيل غير متاحة حالياً. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني.';
      } else if (errorMessage.includes('Recording already in progress')) {
        errorMessage = 'يوجد تسجيل قيد التشغيل بالفعل';
      } else if (errorMessage.includes('Recording service unavailable')) {
        errorMessage = 'خدمة التسجيل غير متاحة حالياً. يرجى المحاولة لاحقاً.';
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * POST /sessions/{id}/recordings/{recording_id}/stop/
   * Stop an active recording (teacher only)
   */
  async stopRecording(sessionId: string, recordingId: number, data?: StopRecordingRequest): Promise<Recording> {
    try {
      logger.debug('Stopping recording', { sessionId, recordingId, data });
      
      const response = await apiClient.post<any>(
        `/sessions/${sessionId}/recordings/${recordingId}/stop/`,
        data || {}
      );

      if (response.success === false) {
        throw new Error(response.error || 'فشل إيقاف التسجيل');
      }

      // Backend returns { message: '...', recording_id: ..., recording: {...} }
      // The backend now returns the recording object directly, so use it
      const responseData = response.data as any;
      
      // If recording object is returned directly, use it (preferred)
      if (responseData.recording) {
        return responseData.recording as Recording;
      }
      
      // Fallback: if only recording_id is returned, try to fetch it
      // (This should rarely happen now, but kept for backward compatibility)
      if (responseData.recording_id) {
        try {
          return await this.getRecording(sessionId, responseData.recording_id);
        } catch (error) {
          // If getRecording fails, return a basic recording object with the ID
          logger.warn('Failed to fetch recording details, using basic info', { error });
          return {
            id: responseData.recording_id,
            session: 0,
            session_id: sessionId,
            status: 'uploading' as const,
            duration: 0,
            duration_formatted: '0:00',
            file_size: 0,
            file_size_formatted: '0 B',
            view_count: 0,
            created_at: new Date().toISOString(),
          } as Recording;
        }
      }
      
      // Last resort: try to get recording by original ID
      try {
        return await this.getRecording(sessionId, recordingId);
      } catch (error) {
        // If all else fails, throw the original error
        throw new Error('فشل إيقاف التسجيل: لم يتم الحصول على بيانات التسجيل');
      }
    } catch (error: any) {
      logger.error('Failed to stop recording:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل إيقاف التسجيل');
    }
  }

  /**
   * GET /sessions/{id}/recordings/
   * List Session Recordings - Get all recordings for a session
   */
  async listRecordings(sessionId: string, page: number = 1): Promise<RecordingListResponse> {
    try {
      logger.debug('Listing recordings', { sessionId, page });
      
      const response = await apiClient.get<RecordingListResponse>(
        `/sessions/${sessionId}/recordings/?page=${page}`
      );

      if (response.success === false) {
        throw new Error(response.error || 'فشل جلب التسجيلات');
      }

      return response.data as RecordingListResponse;
    } catch (error: any) {
      logger.error('Failed to list recordings:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل جلب التسجيلات');
    }
  }

  /**
   * POST /sessions/{id}/recordings/{recording_id}/retry-upload/
   * Retry Upload Recording - Retry uploading a recording that is stuck
   */
  async retryUploadRecording(sessionId: string, recordingId: number): Promise<{ message: string; recording_id: number; status: string }> {
    try {
      logger.debug('Retrying upload for recording', { sessionId, recordingId });
      
      const response = await apiClient.post<{ message: string; recording_id: number; status: string }>(
        `/sessions/${sessionId}/recordings/${recordingId}/retry-upload/`
      );

      if (response.success === false) {
        throw new Error(response.error || 'فشل إعادة محاولة الرفع');
      }

      return response.data;
    } catch (error: any) {
      logger.error('Failed to retry upload:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل إعادة محاولة الرفع');
    }
  }

  /**
   * GET /sessions/{id}/recordings/{recording_id}/
   * Get Recording Details - Get detailed information about a recording
   */
  async getRecording(sessionId: string, recordingId: number): Promise<Recording> {
    try {
      logger.debug('Getting recording', { sessionId, recordingId });
      
      const response = await apiClient.get<Recording>(
        `/sessions/${sessionId}/recordings/${recordingId}/`
      );

      if (response.success === false) {
        throw new Error(response.error || 'فشل جلب تفاصيل التسجيل');
      }

      return response.data as Recording;
    } catch (error: any) {
      logger.error('Failed to get recording:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل جلب تفاصيل التسجيل');
    }
  }

  /**
   * GET /sessions/{id}/recordings/{recording_id}/url/
   * Get Recording URL - Get presigned URL to access/download recording
   */
  async getRecordingUrl(sessionId: string, recordingId: number): Promise<RecordingUrlResponse> {
    try {
      logger.debug('Getting recording URL', { sessionId, recordingId });
      
      const response = await apiClient.get<RecordingUrlResponse>(
        `/sessions/${sessionId}/recordings/${recordingId}/url/`
      );

      if (response.success === false) {
        throw new Error(response.error || 'فشل الحصول على رابط التسجيل');
      }

      return response.data as RecordingUrlResponse;
    } catch (error: any) {
      logger.error('Failed to get recording URL:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل الحصول على رابط التسجيل');
    }
  }

  /**
   * DELETE /sessions/{id}/recordings/{recording_id}/
   * Delete Recording - Delete a recording (teacher only)
   */
  async deleteRecording(sessionId: string, recordingId: number): Promise<void> {
    try {
      logger.debug('Deleting recording', { sessionId, recordingId });
      
      const response = await apiClient.delete(
        `/sessions/${sessionId}/recordings/${recordingId}/`
      );

      if (response.success === false) {
        throw new Error(response.error || 'فشل حذف التسجيل');
      }
    } catch (error: any) {
      logger.error('Failed to delete recording:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل حذف التسجيل');
    }
  }
}

export const recordingService = new RecordingService();