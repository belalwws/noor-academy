'use client';

import React, { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface CourseNotificationsProps {
  className?: string;
}

const CourseNotifications: React.FC<CourseNotificationsProps> = ({ className = '' }) => {
  const { notifications, markAsRead, isLoading } = useNotifications();
  const [courseNotifications, setCourseNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Filter notifications related to courses
    const filtered = notifications.filter(notification => 
      notification.notification_type === 'course_approved' ||
      notification.notification_type === 'course_rejected' ||
      notification.notification_type === 'course_pending' ||
      notification.notification_type === 'course_published' ||
      notification.notification_type === 'course_updated'
    );
    setCourseNotifications(filtered);
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course_approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'course_rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'course_pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'course_published':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'course_approved':
        return 'bg-green-50 border-green-200';
      case 'course_rejected':
        return 'bg-red-50 border-red-200';
      case 'course_pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'course_published':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'course_approved':
        return 'تم قبول الدورة';
      case 'course_rejected':
        return 'تم رفض الدورة';
      case 'course_pending':
        return 'الدورة قيد المراجعة';
      case 'course_published':
        return 'تم نشر الدورة';
      default:
        return 'إشعار الدورة';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  if (courseNotifications.length === 0) {
    return null;
  }

  return (
    <Card className={`${className} mb-6`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="h-5 w-5 text-green-600" />
          إشعارات الدورات
          {courseNotifications.filter(n => !n.is_read).length > 0 && (
            <Badge className="bg-red-500 text-white">
              {courseNotifications.filter(n => !n.is_read).length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {courseNotifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${getNotificationColor(notification.notification_type)} ${
                !notification.is_read ? 'shadow-md' : 'opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getNotificationIcon(notification.notification_type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {getNotificationTitle(notification.notification_type)}
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        {new Date(notification.created_at).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {notification.priority === 'high' && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          عاجل
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {!notification.is_read && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      تعليم كمقروء
                    </Button>
                  )}
                  {notification.action_url && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => window.location.href = notification.action_url!}
                      className="text-xs bg-green-600 hover:bg-green-700"
                    >
                      {notification.action_text || 'عرض'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {courseNotifications.length > 5 && (
            <div className="text-center pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/notifications'}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                عرض جميع الإشعارات ({courseNotifications.length})
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseNotifications;
