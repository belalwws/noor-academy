'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BookOpen, Users, AlertCircle, MessageSquare, Star, Check, X, Eye } from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';

interface SupervisorNotificationsProps {
  className?: string;
}

export default function SupervisorNotifications({ className = '' }: SupervisorNotificationsProps) {
  const { notifications: apiNotifications, markAsRead, markAllAsRead, isLoading } = useNotifications();
  
  // Use only API notifications, no fallback
  const notifications = apiNotifications;
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const recentNotifications = notifications.slice(0, 5);

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

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            الإشعارات
            {unreadNotifications.length > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadNotifications.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Link href="/notifications">
              <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                <Eye className="w-4 h-4 ml-2" />
                عرض الكل
              </Button>
            </Link>
            {unreadNotifications.length > 0 && (
              <Button 
                onClick={handleMarkAllAsRead}
                size="sm"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white"
              >
                <Check className="w-4 h-4 ml-2" />
                تعليم الكل كمقروء
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600">جاري تحميل الإشعارات...</p>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">لا توجد إشعارات</h4>
            <p className="text-gray-600">ستظهر الإشعارات الجديدة هنا عند وصولها</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 rounded-xl transition-all duration-200 hover:shadow-md ${getPriorityClass(notification.priority)} ${
                  !notification.is_read ? 'shadow-sm' : 'opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 text-sm">{notification.title}</h4>
                        <Badge className={`${getPriorityBadgeClass(notification.priority)} text-xs`}>
                          {getPriorityDisplayName(notification.priority)}
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm mb-2 line-clamp-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleDateString('ar-SA', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {notification.action_url && (
                          <Link href={notification.action_url}>
                            <Button size="sm" variant="outline" className="text-xs text-blue-600 border-blue-600 hover:bg-blue-50">
                              {notification.action_text || 'عرض'}
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
                      className="text-blue-600 hover:bg-blue-50 p-1"
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
  );
}
