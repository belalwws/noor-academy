/**
 * 🎥 Live Sessions Service
 * Handles all API calls for live teaching sessions
 */

import {
  Session,
  CreateSessionPayload,
  SessionListResponse,
  SessionConnectionDetails,
  SessionError,
} from '@/types/session';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

class SessionService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * 📋 Get all sessions (with pagination)
   */
  async getSessions(page = 1): Promise<SessionListResponse> {
    try {
      const response = await fetch(`${API_URL}/sessions/?page=${page}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error: SessionError = await response.json();
        throw new Error(error.detail || error.error || 'فشل في جلب الجلسات');
      }

      return await response.json();
    } catch (error: any) {
      // Don't log connection refused errors repeatedly
      if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
        // Server connection issue, re-throw silently
        throw error;
      }
      console.error('❌ Error fetching sessions:', error);
      throw error;
    }
  }

  /**
   * 🎬 Create a new session
   * - General sessions: Only supervisors
   * - Course sessions: Only course teacher
   */
  async createSession(payload: CreateSessionPayload): Promise<Session> {
    try {
      console.log('🚀 Creating session with payload:', payload);

      const response = await fetch(`${API_URL}/sessions/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      console.log('📡 Response status:', response.status);
      console.log('📦 Response data:', data);

      if (!response.ok) {
        // Log detailed error for debugging
        console.error('❌ Backend error response:', {
          status: response.status,
          data: data,
          payload: payload
        });
        
        // Handle permission errors
        if (response.status === 403) {
          throw new Error(
            data.detail ||
              'ليس لديك صلاحية لإنشاء هذا النوع من الجلسات'
          );
        }
        
        // Handle validation errors (400)
        if (response.status === 400) {
          // Extract field-specific errors
          const errorMessages = [];
          for (const [field, errors] of Object.entries(data)) {
            if (Array.isArray(errors)) {
              errorMessages.push(`${field}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              errorMessages.push(`${field}: ${errors}`);
            }
          }
          
          if (errorMessages.length > 0) {
            throw new Error(errorMessages.join('\n'));
          }
        }
        
        throw new Error(
          data.detail || data.error || 'فشل في إنشاء الجلسة'
        );
      }

      console.log('✅ Session created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      throw error;
    }
  }

  /**
   * 🔗 Get connection details for joining a session
   */
  async getConnectionDetails(
    sessionId: string
  ): Promise<SessionConnectionDetails> {
    try {
      const response = await fetch(
        `${API_URL}/sessions/connection-details/?session_id=${sessionId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const error: SessionError = await response.json();
        throw new Error(
          error.detail || error.error || 'فشل في جلب تفاصيل الاتصال'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error getting connection details:', error);
      throw error;
    }
  }

  /**
   * 🔍 Get a single session by ID
   */
  async getSession(sessionId: string): Promise<Session> {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error: SessionError = await response.json();
        throw new Error(error.detail || error.error || 'فشل في جلب الجلسة');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching session:', error);
      throw error;
    }
  }

  /**
   * ⏱️ Extend session duration (+10 minutes, one-time only)
   */
  async extendSession(sessionId: string): Promise<Session> {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/extend/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error: SessionError = await response.json();
        throw new Error(
          error.detail || error.error || 'فشل في تمديد الجلسة'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error extending session:', error);
      throw error;
    }
  }

  /**
   * 🛑 Close a session manually
   */
  async closeSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/close/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error: SessionError = await response.json();
        throw new Error(error.detail || error.error || 'فشل في إغلاق الجلسة');
      }
    } catch (error) {
      console.error('❌ Error closing session:', error);
      throw error;
    }
  }

  /**
   * 🗑️ Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error: SessionError = await response.json();
        throw new Error(error.detail || error.error || 'فشل في حذف الجلسة');
      }
    } catch (error) {
      console.error('❌ Error deleting session:', error);
      throw error;
    }
  }

  /**
   * 📊 Get live session info (real-time data)
   */
  async getLiveSessionInfo(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/live/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error: SessionError = await response.json();
        throw new Error(
          error.detail || error.error || 'فشل في جلب معلومات الجلسة'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error getting live session info:', error);
      throw error;
    }
  }

  /**
   * 📝 Get session logs (join/leave events)
   */
  async getSessionLogs(sessionId: string, page = 1): Promise<any> {
    try {
      const response = await fetch(
        `${API_URL}/sessions/${sessionId}/logs/?page=${page}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const error: SessionError = await response.json();
        throw new Error(
          error.detail || error.error || 'فشل في جلب سجلات الجلسة'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error getting session logs:', error);
      throw error;
    }
  }

  /**
   * 🔄 Update session status
   */
  async updateSessionStatus(
    sessionId: string,
    isActive: boolean
  ): Promise<Session> {
    try {
      const response = await fetch(
        `${API_URL}/sessions/${sessionId}/status/`,
        {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ is_active: isActive }),
        }
      );

      if (!response.ok) {
        const error: SessionError = await response.json();
        throw new Error(
          error.detail || error.error || 'فشل في تحديث حالة الجلسة'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error updating session status:', error);
      throw error;
    }
  }

  /**
   * 👥 Join a session (records join event)
   */
  async joinSession(sessionId: string): Promise<SessionConnectionDetails> {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/join/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        // Try to parse error as JSON, fallback to text if it fails
        let errorMessage = 'فشل في الانضمام للجلسة';
        try {
          const error: SessionError = await response.json();
          errorMessage = error.detail || error.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), get text
          const text = await response.text();
          errorMessage = `خطأ من الخادم (${response.status}): ${text.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      // Don't log connection errors repeatedly
      if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
        // Server connection issue, re-throw with user-friendly message
        throw new Error('الخادم غير متاح. يرجى التأكد من تشغيل الخادم.');
      }
      console.error('❌ Error joining session:', error);
      throw error;
    }
  }

  /**
   * 🚪 Leave a session (records leave event)
   */
  async leaveSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/leave/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error: SessionError = await response.json();
        throw new Error(error.detail || error.error || 'فشل في مغادرة الجلسة');
      }
    } catch (error) {
      console.error('❌ Error leaving session:', error);
      throw error;
    }
  }

  /**
   * 📊 Get active sessions only
   */
  async getActiveSessions(): Promise<Session[]> {
    try {
      // Use the main getSessions endpoint and filter for active sessions
      const response = await this.getSessions(1);
      
      // Filter only active sessions
      const activeSessions = response.results.filter(
        (session) => session.is_active
      );
      
      return activeSessions;
    } catch (error) {
      console.error('❌ Error fetching active sessions:', error);
      return [];
    }
  }

  /**
   * 🎓 Get sessions for a specific course (including newly created ones)
   */
  async getCourseActiveSessions(courseId: string): Promise<Session[]> {
    try {
      // Get all sessions for the course (fetch all pages)
      let allSessions: Session[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await this.getSessions(page);
        allSessions = allSessions.concat(response.results || []);
        
        // Check if there are more pages
        hasMore = !!response.next && response.results && response.results.length > 0;
        page++;
        
        // Safety limit: don't fetch more than 10 pages
        if (page > 10) {
          console.warn('⚠️ Reached page limit (10) for course sessions');
          break;
        }
      }
      
      console.log('📦 getCourseActiveSessions - All sessions fetched:', allSessions.length);
      console.log('📦 getCourseActiveSessions - Course ID:', courseId);
      
      // Filter sessions for this course (include both active and newly created)
      const courseSessions = allSessions.filter(
        (session) => {
          const matches = session.course === courseId;
          if (matches) {
            console.log('✅ Session matches course:', {
              session_id: session.session_id,
              course: session.course,
              batch: session.batch,
              title: session.title
            });
          }
          return matches;
        }
      );
      
      console.log('📦 getCourseActiveSessions - Filtered course sessions:', courseSessions.length);
      return courseSessions;
    } catch (error: any) {
      // Don't log connection errors repeatedly
      if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
        // Server connection issue, return empty array silently
        console.log('⚠️ Connection error in getCourseActiveSessions (silent)');
        return [];
      }
      console.error('❌ Error fetching course sessions:', error);
      return [];
    }
  }

  /**
   * 👨‍🏫 Check if teacher has active session
   */
  async hasActiveSession(): Promise<boolean> {
    try {
      const activeSessions = await this.getActiveSessions();
      return activeSessions.length > 0;
    } catch (error) {
      console.error('❌ Error checking active sessions:', error);
      return false;
    }
  }
}

export const sessionService = new SessionService();
