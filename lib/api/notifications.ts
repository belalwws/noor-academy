/**
 * Notification API Service
 * Handles all notification-related API calls using the new notification system
 */

import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';
import { getBaseUrl, Endpoints } from '../config';

export interface Notification {
  id: string;
  recipient_name: string;
  notification_type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  action_url?: string;
  action_text?: string;
  created_at: string;
  read_at?: string;
  related_object_type?: string;
  related_object_id?: string;
  expires_at?: string;
}

export interface NotificationTemplate {
  id: number;
  notification_type: string;
  title_template: string;
  message_template: string;
  default_priority: 'low' | 'medium' | 'high';
  default_action_text: string;
  target_roles: string;
  expires_after_hours: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: number;
  user: number;
  in_app_enabled: boolean;
  email_enabled: boolean;
  course_notifications: boolean;
  assignment_notifications: boolean;
  meeting_notifications: boolean;
  system_notifications: boolean;
  performance_notifications: boolean;
  email_frequency: 'immediate' | 'daily' | 'weekly';
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  results?: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

class NotificationApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      logger.debug('🔔 Making request to:', endpoint);
      
      let response;
      const method = options.method || 'GET';
      const cleanEndpoint = endpoint.startsWith('http') 
        ? endpoint.replace(getBaseUrl(), '') 
        : endpoint.startsWith('/') 
          ? endpoint 
          : `/${endpoint}`;
      
      switch (method) {
        case 'GET':
          response = await apiClient.get<T>(cleanEndpoint);
          break;
        case 'POST':
          const postBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.post<T>(cleanEndpoint, postBody);
          break;
        case 'PUT':
          const putBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.put<T>(cleanEndpoint, putBody);
          break;
        case 'PATCH':
          const patchBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.patch<T>(cleanEndpoint, patchBody);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(cleanEndpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (response.success === false) {
        logger.error('🔔 Response error:', response.error);
        return {
          success: false,
          error: response.error || 'Unknown error',
        };
      }

      // Handle paginated responses
      const data = response.data as any;
      return {
        success: true,
        data: data,
        results: data?.results,
        count: data?.count,
        next: data?.next,
        previous: data?.previous,
      };
    } catch (error: any) {
      logger.error('🔔 Request error:', error);
      return {
        success: false,
        error: error?.appError?.userMessage || error?.message || 'Unknown error',
      };
    }
  }

  // Get all notifications for the current user
  async getNotifications(unreadOnly: boolean = false): Promise<ApiResponse<Notification[]>> {
    let endpoint = Endpoints.NOTIFICATIONS;
    if (unreadOnly) {
      endpoint += endpoint.includes('?') ? '&unread_only=true' : '?unread_only=true';
    }
    
    return this.makeRequest<Notification[]>(endpoint, {
      method: 'GET',
    });
  }

  // Mark specific notifications as read
  async markNotificationsAsRead(notificationIds: string[]): Promise<ApiResponse> {
    return this.makeRequest(Endpoints.NOTIFICATIONS + 'mark-as-read/', {
      method: 'POST',
      body: JSON.stringify({ notification_ids: notificationIds }),
    });
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    return this.makeRequest(Endpoints.NOTIFICATIONS + 'mark-all-as-read/', {
      method: 'POST',
    });
  }

  // Get a specific notification by ID
  async getNotificationById(notificationId: string): Promise<ApiResponse<Notification>> {
    return this.makeRequest<Notification>(Endpoints.NOTIFICATIONS + `${notificationId}/`, {
      method: 'GET',
    });
  }

  // Get notification templates
  async getNotificationTemplates(): Promise<ApiResponse<NotificationTemplate[]>> {
    return this.makeRequest<NotificationTemplate[]>(Endpoints.NOTIFICATIONS + 'templates/', {
      method: 'GET',
    });
  }

  // Get a specific notification template by ID
  async getNotificationTemplateById(templateId: number): Promise<ApiResponse<NotificationTemplate>> {
    return this.makeRequest<NotificationTemplate>(Endpoints.NOTIFICATIONS + `templates/${templateId}/`, {
      method: 'GET',
    });
  }

  // Get current user notification preferences
  async getNotificationPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return this.makeRequest<NotificationPreferences>(Endpoints.NOTIFICATION_PREFERENCES + 'me/', {
      method: 'GET',
    });
  }

  // Update notification preferences (PUT - full update)
  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> {
    return this.makeRequest<NotificationPreferences>(Endpoints.NOTIFICATION_PREFERENCES + 'me/', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Update notification preferences (PATCH - partial update)
  async updateNotificationPreferencesPartial(preferences: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> {
    return this.makeRequest<NotificationPreferences>(Endpoints.NOTIFICATION_PREFERENCES + 'me/', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }
}

// Export singleton instance
export const notificationApi = new NotificationApiService();
