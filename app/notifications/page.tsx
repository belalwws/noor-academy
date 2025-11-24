'use client';

import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Check, X, Bell, AlertCircle, MessageSquare, BookOpen, Users, Star } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function NotificationsPage() {
  const { notifications: apiNotifications, markAsRead, markAllAsRead, isLoading } = useNotifications();

  // Use only API notifications, no fallback
  const notifications = apiNotifications;
  
  // Debug logging
  console.log('🔔 NotificationsPage: isLoading:', isLoading);
  console.log('🔔 NotificationsPage: notifications count:', notifications.length);
  console.log('🔔 NotificationsPage: notifications:', notifications);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-r-4 border-red-500 bg-red-50';
      case 'medium':
        return 'border-r-4 border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-r-4 border-blue-500 bg-blue-50';
      default:
        return 'border-r-4 border-gray-300 bg-gray-50';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityDisplayName = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عاجل';
      case 'medium':
        return 'مهم';
      case 'low':
        return 'عادي';
      default:
        return 'غير محدد';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course_request_created':
      case 'course_request_approved':
      case 'course_request_rejected':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'teacher_approved':
      case 'teacher_rejected':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'rating':
        return <Star className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4" dir="rtl">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">الإشعارات</h1>
                  <p className="text-gray-600">
                    {notifications.filter(n => !n.is_read).length} إشعار غير مقروء من أصل {notifications.length}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleMarkAllAsRead}
                disabled={isLoading || notifications.filter(n => !n.is_read).length === 0}
                className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white"
              >
                <Check className="w-4 h-4 ml-2" />
                تعليم الكل كمقروء
              </Button>
            </div>
          </div>

          {/* Content */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-600">جاري تحميل الإشعارات...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <Bell className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد إشعارات</h3>
                  <p className="text-gray-600 mb-6">ستظهر الإشعارات الجديدة هنا عند وصولها</p>
                  <Link href="/dashboard/supervisor">
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                      العودة إلى لوحة التحكم
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl transition-all duration-200 hover:shadow-md ${getPriorityClass(notification.priority)} ${
                        !notification.is_read ? 'shadow-sm' : 'opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="mt-1">
                            {getNotificationIcon(notification.notification_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                              <Badge className={getPriorityBadgeClass(notification.priority)}>
                                {getPriorityDisplayName(notification.priority)}
                              </Badge>
                            </div>
                            <p className="text-gray-700 mb-3">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {new Date(notification.created_at).toLocaleDateString('ar-SA', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {notification.action_url && (
                                <Link href={notification.action_url}>
                                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                                    {notification.action_text || 'عرض التفاصيل'}
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                        {!notification.is_read && (
                          <Button
                            onClick={() => handleMarkAsRead(notification.id)}
                            size="sm"
                            variant="ghost"
                            disabled={isLoading}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
