import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';
import { getBaseUrl } from '../config';

// Types
export interface SessionData {
  id: string;
  session_id: string;
  title: string;
  session_type: 'general' | 'course_lesson' | 'meeting';
  duration_minutes: number;
  course?: string;
  lesson?: string;
  created_by_name: string;
  course_title?: string;
  lesson_title?: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  participant_count: number;
  remaining_time: string;
  is_expired: boolean;
}

export interface CreateSessionRequest {
  title: string;
  session_type: 'general' | 'course_lesson' | 'meeting';
  duration_minutes: 2 | 5 | 30 | 60;
  course?: string;
  lesson?: string;
  batch?: string;
}

export interface CreateSessionResponse {
  id: string;
  session_id: string;
  title: string;
  session_type: string;
  duration_minutes: number;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface JoinSessionResponse {
  token: string;
  room_name: string;
  participant_name: string;
  session_title: string;
  remaining_time: string;
}

export interface LiveSessionInfo {
  session_id: string;
  title: string;
  is_live: boolean;
  started_at: string;
  duration_minutes: number;
  remaining_time: string;
  current_participants: number;
  max_participants: number;
  course_id?: string | number;
  course_title?: string;
  lesson_id?: string | number;
  lesson_title?: string;
  participants: Array<{
    name: string;
    role: string;
    joined_at: string;
  }>;
  livekit_url: string;
}

export interface ConnectionDetails {
  livekit_url: string;
  api_key: string;
  instructions: string;
}

// API Class
class SessionsAPI {
  /**
   * إنشاء جلسة جديدة
   */
  async createSession(sessionData: CreateSessionRequest): Promise<CreateSessionResponse> {
    try {
      logger.debug('📤 Creating session', { sessionData });
      
      const response = await apiClient.post<CreateSessionResponse>('/sessions/', sessionData);

      if (response.success === false) {
        logger.error('❌ Session creation failed:', {
          status: response.status,
          error: response.error
        });
        
        throw new Error(response.error || 'فشل في إنشاء الجلسة');
      }

      logger.debug('✅ Session created successfully');
      return response.data as CreateSessionResponse;
    } catch (error: any) {
      logger.error('Failed to create session:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إنشاء الجلسة');
    }
  }

  /**
   * إنشاء جلسة كورس بسرعة
   */
  async createCourseSession(courseId: string, title: string, duration: number): Promise<CreateSessionResponse> {
    return this.createSession({
      title,
      session_type: 'course_lesson',
      duration_minutes: duration as 2 | 5 | 30 | 60,
      course: courseId,
    });
  }

  /**
   * إنشاء جلسة عامة للمشرفين
   */
  async createGeneralSession(title: string, duration: number): Promise<CreateSessionResponse> {
    return this.createSession({
      title,
      session_type: 'general',
      duration_minutes: duration as 2 | 5 | 30 | 60,
    });
  }

  /**
   * الحصول على قائمة الجلسات
   */
  async getSessions(): Promise<SessionData[]> {
    try {
      logger.debug('Getting sessions');
      
      const response = await apiClient.get<SessionData[] | { results: SessionData[] }>('/sessions/');

      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب الجلسات');
      }

      const data = response.data as any;
      return data.results || data;
    } catch (error: any) {
      logger.error('Failed to get sessions:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الجلسات');
    }
  }

  /**
   * الحصول على تفاصيل جلسة واحدة
   */
  async getSession(sessionId: string): Promise<SessionData> {
    try {
      logger.debug('Getting session', { sessionId });
      
      const response = await apiClient.get<SessionData>(`/sessions/${sessionId}/`);

      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب تفاصيل الجلسة');
      }

      return response.data as SessionData;
    } catch (error: any) {
      logger.error('Failed to get session:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب تفاصيل الجلسة');
    }
  }

  /**
   * الانضمام للجلسة
   */
  async joinSession(sessionId: string): Promise<JoinSessionResponse> {
    try {
      logger.debug('Joining session', { sessionId });
      
      const response = await apiClient.post<JoinSessionResponse>(`/sessions/${sessionId}/join/`, {});

      if (response.success === false) {
        throw new Error(response.error || 'فشل في الانضمام للجلسة');
      }

      return response.data as JoinSessionResponse;
    } catch (error: any) {
      logger.error('Failed to join session:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في الانضمام للجلسة');
    }
  }

  /**
   * مغادرة الجلسة
   */
  async leaveSession(sessionId: string): Promise<{ message: string }> {
    try {
      logger.debug('Leaving session', { sessionId });
      
      const response = await apiClient.post<{ message: string }>(`/sessions/${sessionId}/leave/`, {});

      if (response.success === false) {
        throw new Error(response.error || 'فشل في مغادرة الجلسة');
      }

      return response.data as { message: string };
    } catch (error: any) {
      logger.error('Failed to leave session:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في مغادرة الجلسة');
    }
  }

  /**
   * تحديث حالة الجلسة
   */
  async updateSessionStatus(sessionId: string, isActive: boolean): Promise<SessionData> {
    try {
      logger.debug('Updating session status', { sessionId, isActive });
      
      const response = await apiClient.patch<SessionData>(`/sessions/${sessionId}/status/`, { is_active: isActive });

      if (response.success === false) {
        throw new Error(response.error || 'فشل في تحديث حالة الجلسة');
      }

      return response.data as SessionData;
    } catch (error: any) {
      logger.error('Failed to update session status:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحديث حالة الجلسة');
    }
  }

  /**
   * الحصول على الجلسات المباشرة
   */
  async getLiveSessions(params?: { course?: string | number }): Promise<{
    live_sessions: Array<{
      id: string;
      session_id: string;
      title: string;
      course: string | null;
      course_id?: string | number | null;
      course_title?: string | null;
      lesson_id?: string | number | null;
      lesson_title?: string | null;
      teacher: string;
      started_at: string;
      duration_minutes: number;
      remaining_time: string;
      current_participants: number;
      max_participants: number;
      can_join: boolean;
    }>;
    total_count: number;
  }> {
    try {
      logger.debug('Getting live sessions', { params });
      
      const url = params?.course !== undefined 
        ? `/sessions/live-sessions/?course=${params.course}` 
        : '/sessions/live-sessions/';
      
      const response = await apiClient.get<{
        live_sessions: Array<{
          id: string;
          session_id: string;
          title: string;
          course: string | null;
          course_id?: string | number | null;
          course_title?: string | null;
          lesson_id?: string | number | null;
          lesson_title?: string | null;
          teacher: string;
          started_at: string;
          duration_minutes: number;
          remaining_time: string;
          current_participants: number;
          max_participants: number;
          can_join: boolean;
        }>;
        total_count: number;
      }>(url);

      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب الجلسات المباشرة');
      }

      return response.data as any;
    } catch (error: any) {
      logger.error('Failed to get live sessions:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الجلسات المباشرة');
    }
  }

  /**
   * الحصول على معلومات الجلسة المباشرة
   */
  async getLiveSessionInfo(sessionId: string): Promise<LiveSessionInfo> {
    try {
      logger.debug('Getting live session info', { sessionId });
      
      const response = await apiClient.get<LiveSessionInfo>(`/sessions/${sessionId}/live/`);

      if (response.success === false) {
        throw new Error(response.error || 'الجلسة غير نشطة أو منتهية الصلاحية');
      }

      return response.data as LiveSessionInfo;
    } catch (error: any) {
      logger.error('Failed to get live session info:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'الجلسة غير نشطة أو منتهية الصلاحية');
    }
  }

  /**
   * الحصول على تفاصيل الاتصال
   */
  async getConnectionDetails(): Promise<ConnectionDetails> {
    try {
      logger.debug('Getting connection details');
      
      const response = await apiClient.get<ConnectionDetails>('/sessions/connection-details/');

      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب تفاصيل الاتصال');
      }

      return response.data as ConnectionDetails;
    } catch (error: any) {
      logger.error('Failed to get connection details:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب تفاصيل الاتصال');
    }
  }

  /**
   * حذف جلسة
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      logger.debug('Deleting session', { sessionId });
      
      const response = await apiClient.delete(`/sessions/${sessionId}/`);

      if (response.success === false) {
        throw new Error(response.error || 'فشل في حذف الجلسة');
      }
    } catch (error: any) {
      logger.error('Failed to delete session:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في حذف الجلسة');
    }
  }
}

// Export singleton instance
export const sessionsAPI = new SessionsAPI();

// Export helper functions
export const createCourseSession = (courseId: string, title: string, duration: number) => 
  sessionsAPI.createCourseSession(courseId, title, duration);

export const createGeneralSession = (title: string, duration: number) => 
  sessionsAPI.createGeneralSession(title, duration);

export const joinSession = (sessionId: string) => 
  sessionsAPI.joinSession(sessionId);

export const getLiveSessions = () => 
  sessionsAPI.getLiveSessions();

export const getLiveSessionsByCourse = (courseId: string | number) =>
  sessionsAPI.getLiveSessions({ course: courseId });

export default sessionsAPI;
