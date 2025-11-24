'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAuthToken } from '@/utils/auth';
import Config from '@/config/config';

interface CourseData {
  id: string;
  title: string;
  description: string;
  course_type: 'live' | 'recorded';
  learning_path: string;
  level: string;
  status: string;
  instructor_name?: string;
  created_at?: string;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  lesson_type: 'video_file' | 'live_session' | 'text' | 'quiz';
  duration_minutes: number;
  is_published: boolean;
  order: number;
}

export default function CourseReview() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState<string>('');

  // Load course data and lessons
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push('/login');
          return;
        }

        // Load course data
        const courseResponse = await fetch(`${Config.API_BASE_URL}/api/courses/${courseId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (courseResponse.ok) {
          const course = await courseResponse.json();
          setCourseData(course);
        } else {
          setError('فشل في تحميل بيانات الدورة');
        }

        // Load lessons
        const lessonsResponse = await fetch(`${Config.API_BASE_URL}/api/content/lessons/?course=${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (lessonsResponse.ok) {
          const data = await lessonsResponse.json();
          setLessons(data.results || []);
        }

      } catch (error) {
        console.error('Error loading course:', error);
        setError('حدث خطأ في تحميل بيانات الدورة');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      loadCourseData();
    }
  }, [courseId, router]);

  // Approve course
  const handleApprove = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const token = getAuthToken();
      
      const response = await fetch(`${Config.API_BASE_URL}/api/courses/${courseId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'approved',
          is_published: true,
          review_notes: reviewNotes
        })
      });

      if (!response.ok) {
        throw new Error('فشل في الموافقة على الدورة');
      }

      setSuccess('تم الموافقة على الدورة بنجاح! سيتم إشعار المدرس.');
      
      setTimeout(() => {
        router.push('/dashboard/supervisor');
      }, 3000);

    } catch (error) {
      console.error('Error approving course:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ في الموافقة على الدورة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reject course
  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      setError('يرجى إضافة ملاحظات الرفض');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = getAuthToken();
      
      const response = await fetch(`${Config.API_BASE_URL}/api/courses/${courseId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'rejected',
          is_published: false,
          review_notes: reviewNotes
        })
      });

      if (!response.ok) {
        throw new Error('فشل في رفض الدورة');
      }

      setSuccess('تم رفض الدورة. سيتم إشعار المدرس بالملاحظات.');
      
      setTimeout(() => {
        router.push('/dashboard/supervisor');
      }, 3000);

    } catch (error) {
      console.error('Error rejecting course:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ في رفض الدورة');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات الدورة...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!courseData) {
    return (
      <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
            <h2 className="text-xl font-bold text-gray-800 mb-2">لم يتم العثور على الدورة</h2>
            <p className="text-gray-600 mb-4">الدورة المطلوبة غير موجودة أو تم حذفها</p>
            <button
              onClick={() => router.push('/dashboard/supervisor')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              العودة للوحة التحكم
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4" dir="rtl">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  <i className="fas fa-clipboard-check me-3 text-blue-600"></i>
                  مراجعة الدورة
                </h1>
                <h2 className="text-xl text-gray-600">{courseData.title}</h2>
                <p className="text-gray-500 mt-1">المدرس: {courseData.instructor_name || 'غير محدد'}</p>
              </div>
              <div className="text-left">
                <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  في انتظار المراجعة
                </span>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle text-red-500 me-3"></i>
                <div className="text-red-700">{error}</div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <i className="fas fa-check-circle text-blue-500 me-3"></i>
                <div className="text-blue-700">{success}</div>
              </div>
            </div>
          )}

          {/* Course Details */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              <i className="fas fa-info-circle me-3 text-blue-600"></i>
              تفاصيل الدورة
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                  <p className="text-gray-900">{courseData.title}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <p className="text-gray-900">{courseData.description}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">المستوى</label>
                  <p className="text-gray-900">
                    {courseData.level === 'beginner' ? 'مبتدئ' : 
                     courseData.level === 'intermediate' ? 'متوسط' : 
                     courseData.level === 'advanced' ? 'متقدم' : courseData.level}
                  </p>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع الدورة</label>
                  <p className="text-gray-900">
                    {courseData.course_type === 'live' ? 'جلسات مباشرة' : 'محتوى مسجل'}
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">مسار التعلم</label>
                  <p className="text-gray-900">
                    {courseData.learning_path === 'individual' ? 'فردي' : 
                     courseData.learning_path === 'group_continuous' ? 'جماعي مستمر' : 
                     courseData.learning_path === 'training' ? 'دورة تدريبية' : courseData.learning_path}
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الإنشاء</label>
                  <p className="text-gray-900">
                    {courseData.created_at ? new Date(courseData.created_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              <i className="fas fa-list me-3 text-blue-600"></i>
              محتوى الدورة ({lessons.length} درس)
            </h3>

            {lessons.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
                <p className="text-gray-500">لم يتم إضافة أي دروس لهذه الدورة</p>
                <p className="text-gray-400 text-sm">يجب على المدرس إضافة محتوى قبل المراجعة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                            {index + 1}
                          </span>
                          <h4 className="font-semibold text-gray-800">{lesson.title}</h4>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{lesson.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            <i className="fas fa-clock me-1"></i>
                            {lesson.duration_minutes} دقيقة
                          </span>
                          <span>
                            <i className="fas fa-video me-1"></i>
                            {lesson.lesson_type === 'video_file' ? 'فيديو مسجل' : 
                             lesson.lesson_type === 'live_session' ? 'جلسة مباشرة' : 
                             lesson.lesson_type === 'text' ? 'نص' : 'اختبار'}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          lesson.is_published ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {lesson.is_published ? 'منشور' : 'مسودة'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Notes */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              <i className="fas fa-comment-alt me-3 text-purple-600"></i>
              ملاحظات المراجعة
            </h3>
            
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="أضف ملاحظاتك حول الدورة (اختياري للموافقة، مطلوب للرفض)"
            />
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => router.push('/dashboard/supervisor')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <i className="fas fa-arrow-left"></i>
                العودة للوحة التحكم
              </button>
              
              <button
                onClick={handleReject}
                disabled={isSubmitting || lessons.length === 0}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الرفض...
                  </>
                ) : (
                  <>
                    <i className="fas fa-times"></i>
                    رفض الدورة
                  </>
                )}
              </button>
              
              <button
                onClick={handleApprove}
                disabled={isSubmitting || lessons.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الموافقة...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    الموافقة على الدورة
                  </>
                )}
              </button>
            </div>
            
            {lessons.length === 0 && (
              <div className="mt-4 text-center">
                <p className="text-red-600 text-sm">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  لا يمكن الموافقة على دورة بدون محتوى
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
