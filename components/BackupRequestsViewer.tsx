'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, RefreshCw, Eye } from 'lucide-react';
import { CustomCourseRequest } from '@/lib/types/custom-course-requests';

export default function BackupRequestsViewer() {
  const [backupRequests, setBackupRequests] = useState<CustomCourseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBackupRequests();
  }, []);

  const loadBackupRequests = () => {
    try {
      const stored = localStorage.getItem('custom_course_requests_backup');
      const requests = stored ? JSON.parse(stored) : [];
      setBackupRequests(requests);
    } catch (error) {
      console.error('Error loading backup requests:', error);
      setBackupRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearBackupRequests = () => {
    localStorage.removeItem('custom_course_requests_backup');
    setBackupRequests([]);
  };

  const retryRequest = async (request: CustomCourseRequest) => {
    try {
      // Try to send the request again
      const { CustomCourseRequestsAPI } = await import('@/lib/api/custom-course-requests');
      
      const requestData = {
        subject: request.subject,
        current_level: request.current_level,
        learning_goals: request.learning_goals,
        available_time: request.available_time,
        preferred_course_type: request.preferred_course_type,
        expected_budget: request.expected_budget,
        additional_details: request.additional_details
      };

      await CustomCourseRequestsAPI.createCustomCourseRequest(requestData);
      
      // Remove from backup if successful
      const updatedRequests = backupRequests.filter(r => r.id !== request.id);
      setBackupRequests(updatedRequests);
      localStorage.setItem('custom_course_requests_backup', JSON.stringify(updatedRequests));
      
      alert('تم إرسال الطلب بنجاح!');
    } catch (error) {
      console.error('Retry failed:', error);
      alert('فشل في إعادة إرسال الطلب. يرجى المحاولة مرة أخرى لاحقاً.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (backupRequests.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          لا توجد طلبات محفوظة محلياً. جميع الطلبات تم إرسالها بنجاح للخادم.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">الطلبات المحفوظة محلياً</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBackupRequests}
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearBackupRequests}
          >
            <Trash2 className="w-4 h-4 ml-2" />
            مسح الكل
          </Button>
        </div>
      </div>

      <Alert>
        <AlertDescription>
          هذه الطلبات تم حفظها محلياً بسبب مشاكل في الاتصال بالخادم. يمكنك إعادة إرسالها عند توفر الاتصال.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {backupRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{request.subject}</CardTitle>
                <Badge variant="outline">{request.status_display}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>المستوى:</strong> {request.level_display}
                </div>
                <div>
                  <strong>نوع الدورة:</strong> {request.course_type_display}
                </div>
                <div>
                  <strong>أهداف التعلم:</strong> {request.learning_goals}
                </div>
                <div>
                  <strong>الأوقات المتاحة:</strong> {request.available_time}
                </div>
                {request.additional_details && (
                  <div>
                    <strong>تفاصيل إضافية:</strong> {request.additional_details}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  تم الحفظ في: {new Date(request.created_at).toLocaleString('ar-SA')}
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => retryRequest(request)}
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  إعادة إرسال
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
