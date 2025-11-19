/**
 * Notification Service
 * Handles real-time notifications and events
 */

// import { notificationApi } from './api/notifications';

export interface NotificationEvent {
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  action_url?: string;
  action_text?: string;
  related_object_type?: string;
  related_object_id?: string;
}

class NotificationService {
  private listeners: Array<(event: NotificationEvent) => void> = [];

  /**
   * Subscribe to notification events
   */
  subscribe(listener: (event: NotificationEvent) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Emit a notification event
   */
  emit(event: NotificationEvent) {
    console.log('🔔 Notification Event:', event);
    this.listeners.forEach(listener => listener(event));
  }

  /**
   * Send notification to API
   */
  async sendNotification(event: NotificationEvent) {
    try {
      console.log('📤 Sending notification to API:', event);
      // This would typically call the backend API to create a notification
      // For now, we'll just emit the event locally
      this.emit(event);
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
    }
  }

  /**
   * Course-related notification events
   */
  courseEvents = {
    created: (courseId: string, courseTitle: string) => {
      this.sendNotification({
        type: 'course_created',
        title: 'دورة جديدة تم إنشاؤها',
        message: `تم إنشاء دورة جديدة: "${courseTitle}"`,
        priority: 'medium',
        action_url: `/course/${courseId}`,
        action_text: 'عرض الدورة',
        related_object_type: 'course',
        related_object_id: courseId
      });
    },

    approved: (courseId: string, courseTitle: string) => {
      this.sendNotification({
        type: 'course_approved',
        title: 'تم اعتماد الدورة',
        message: `تم اعتماد الدورة: "${courseTitle}"`,
        priority: 'high',
        action_url: `/course/${courseId}`,
        action_text: 'عرض الدورة',
        related_object_type: 'course',
        related_object_id: courseId
      });
    },

    rejected: (courseId: string, courseTitle: string) => {
      this.sendNotification({
        type: 'course_rejected',
        title: 'تم رفض الدورة',
        message: `تم رفض الدورة: "${courseTitle}"`,
        priority: 'high',
        action_url: `/course/${courseId}`,
        action_text: 'عرض الدورة',
        related_object_type: 'course',
        related_object_id: courseId
      });
    },

    enrollment: (courseId: string, courseTitle: string, studentName: string) => {
      this.sendNotification({
        type: 'course_enrollment',
        title: 'تسجيل جديد في الدورة',
        message: `تم تسجيل ${studentName} في الدورة: "${courseTitle}"`,
        priority: 'medium',
        action_url: `/course/${courseId}`,
        action_text: 'عرض الدورة',
        related_object_type: 'course',
        related_object_id: courseId
      });
    }
  };

  /**
   * Teacher-related notification events
   */
  teacherEvents = {
    approved: (teacherId: string, teacherName: string) => {
      this.sendNotification({
        type: 'teacher_approved',
        title: 'تم اعتماد مدرس جديد',
        message: `تم اعتماد المدرس: ${teacherName}`,
        priority: 'high',
        action_url: `/dashboard/supervisor`,
        action_text: 'عرض المدرسين',
        related_object_type: 'teacher',
        related_object_id: teacherId
      });
    },

    rejected: (teacherId: string, teacherName: string) => {
      this.sendNotification({
        type: 'teacher_rejected',
        title: 'تم رفض طلب مدرس',
        message: `تم رفض طلب المدرس: ${teacherName}`,
        priority: 'medium',
        action_url: `/dashboard/supervisor`,
        action_text: 'عرض المدرسين',
        related_object_type: 'teacher',
        related_object_id: teacherId
      });
    }
  };

  /**
   * System-related notification events
   */
  systemEvents = {
    maintenance: (message: string) => {
      this.sendNotification({
        type: 'system_maintenance',
        title: 'صيانة النظام',
        message: message,
        priority: 'high',
        action_url: '/dashboard',
        action_text: 'عرض لوحة التحكم'
      });
    },

    update: (version: string) => {
      this.sendNotification({
        type: 'system_update',
        title: 'تحديث النظام',
        message: `تم تحديث النظام إلى الإصدار ${version}`,
        priority: 'low',
        action_url: '/dashboard',
        action_text: 'عرض التحديثات'
      });
    }
  };
}

// Create singleton instance
export const notificationService = new NotificationService();

// Export for easy access
export default notificationService;
