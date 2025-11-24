'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAuthToken, getAuthData } from '@/utils/auth';
import Config from '@/config/config';

interface LessonData {
  title: string;
  description: string;
  lesson_type: 'video_file' | 'youtube_link' | 'live_session';
  duration_minutes: number;
  is_published: boolean;
  order: number;
  youtube_url?: string;
  video_file?: File;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  course_type: 'live' | 'recorded';
  learning_path: string;
  status?: string;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  lesson_type: 'video_file' | 'youtube_link' | 'live_session';
  duration_minutes: number;
  is_published: boolean;
  order: number;
  course: string;
}

export default function CourseContentCreation() {
  const router = useRouter();
  const params = useParams();
  const courseId = params['id'] as string;
  
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonData>({
    title: '',
    description: '',
    lesson_type: 'video_file',
    duration_minutes: 30,
    is_published: false,
    order: 1,
    youtube_url: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showAddLesson, setShowAddLesson] = useState(false);

  // Load course data
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch from API
        const response = await fetch(`${Config.API_BASE_URL}/courses/${courseId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const course = await response.json();
          setCourseData(course);
        } else {
          setError('فشل في تحميل بيانات الدورة');
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

  // Load existing lessons
  useEffect(() => {
    const loadLessons = async () => {
      if (!courseId) return;

      try {
        const token = getAuthToken();

        const response = await fetch(`${Config.API_BASE_URL}/content/lessons/?course=${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setLessons(data.results || []);
        }
      } catch (error) {
        console.error('Error loading lessons:', error);
        setLessons([]);
      }
    };

    loadLessons();
  }, [courseId]);

  // Add new lesson
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentLesson.title.trim() || !currentLesson.description.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Validate YouTube URL if lesson type is youtube_link
    if (currentLesson.lesson_type === 'youtube_link' && !currentLesson.youtube_url?.trim()) {
      setError('يرجى إدخال رابط اليوتيوب');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = getAuthToken();
      const lessonData: any = {
        title: currentLesson.title,
        description: currentLesson.description,
        lesson_type: currentLesson.lesson_type,
        duration_minutes: currentLesson.duration_minutes,
        is_published: currentLesson.is_published,
        course: parseInt(courseId),
        order: lessons.length + 1
      };

      // Add required fields based on lesson type
      if (currentLesson.lesson_type === 'youtube_link') {
        lessonData.youtube_url = currentLesson.youtube_url;
      }

      console.log('Lesson data to submit:', lessonData);
      console.log('Course ID type:', typeof courseId, courseId);
      console.log('API URL:', `${Config.API_BASE_URL}/content/lessons/`);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('JSON body:', JSON.stringify(lessonData, null, 2));

      const response = await fetch(`${Config.API_BASE_URL}/content/lessons/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(lessonData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Raw error response:', errorText);

        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('Could not parse error as JSON');
        }

        console.error('Parsed API Error Response:', errorData);
        console.error('Full error details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorData
        });

        throw new Error((errorData as any).detail || (errorData as any).message || 'فشل في إضافة الدرس');
      }

      const newLesson = await response.json();
      setLessons([...lessons, newLesson]);

      // Reset form
      setCurrentLesson({
        title: '',
        description: '',
        lesson_type: 'video_file',
        duration_minutes: 30,
        is_published: false,
        order: lessons.length + 2
      });

      setSuccess('تم إضافة الدرس بنجاح!');
      setShowAddLesson(false);

    } catch (error) {
      console.error('Error adding lesson:', error);

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('❌ لا يمكن الاتصال بالخادم. يرجى التأكد من تشغيل الخادم على المنفذ 8000');
      } else {
        setError(error instanceof Error ? error.message : 'حدث خطأ في إضافة الدرس');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit course for review
  const handleSubmitForReview = async () => {
    if (lessons.length === 0) {
      setError('يجب إضافة درس واحد على الأقل قبل إرسال الدورة للمراجعة');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = getAuthToken();

      // Update course status to pending review
      const response = await fetch(`${Config.API_BASE_URL}/courses/${courseId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'pending_review',
          is_published: false
        })
      });

      if (!response.ok) {
        throw new Error('فشل في إرسال الدورة للمراجعة');
      }

      setSuccess('تم إرسال الدورة للمراجعة بنجاح! سيتم إشعارك بالنتيجة قريباً.');

      // Redirect to teacher dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard/teacher');
      }, 3000);

    } catch (error) {
      console.error('Error submitting for review:', error);

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('❌ لا يمكن الاتصال بالخادم. يرجى التأكد من تشغيل الخادم على المنفذ 8000');
      } else {
        setError(error instanceof Error ? error.message : 'حدث خطأ في إرسال الدورة للمراجعة');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
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
      <ProtectedRoute allowedRoles={['teacher']}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
            <h2 className="text-xl font-bold text-gray-800 mb-2">لم يتم العثور على الدورة</h2>
            <p className="text-gray-600 mb-4">الدورة المطلوبة غير موجودة أو تم حذفها</p>
            <button
              onClick={() => router.push('/dashboard/teacher')}
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
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4" dir="rtl">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  <i className="fas fa-book-open me-3 text-blue-600"></i>
                  إضافة محتوى الدورة
                </h1>
                <h2 className="text-xl text-gray-600">{courseData.title}</h2>
                <p className="text-gray-500 mt-1">{courseData.description}</p>
              </div>
              <div className="text-left">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {courseData.course_type === 'live' ? 'جلسات مباشرة' : 'محتوى مسجل'}
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

          {/* Lessons List */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                <i className="fas fa-list me-3 text-blue-600"></i>
                دروس الدورة ({lessons.length})
              </h3>
              <button
                onClick={() => setShowAddLesson(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <i className="fas fa-plus"></i>
                إضافة درس جديد
              </button>
            </div>

            {lessons.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-book text-gray-400 text-4xl mb-4"></i>
                <p className="text-gray-500">لم يتم إضافة أي دروس بعد</p>
                <p className="text-gray-400 text-sm">ابدأ بإضافة الدرس الأول للدورة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{lesson.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{lesson.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>
                            <i className="fas fa-clock me-1"></i>
                            {lesson.duration_minutes} دقيقة
                          </span>
                          <span>
                            <i className="fas fa-video me-1"></i>
                            {lesson.lesson_type === 'video_file' ? 'فيديو مسجل' :
                             lesson.lesson_type === 'youtube_link' ? 'رابط يوتيوب' :
                             lesson.lesson_type === 'live_session' ? 'جلسة مباشرة' : 'غير محدد'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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

          {/* Add Lesson Modal */}
          {showAddLesson && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    <i className="fas fa-plus me-3 text-blue-600"></i>
                    إضافة درس جديد
                  </h3>
                  <button
                    onClick={() => setShowAddLesson(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <form onSubmit={handleAddLesson}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عنوان الدرس *
                      </label>
                      <input
                        type="text"
                        value={currentLesson.title}
                        onChange={(e) => setCurrentLesson({...currentLesson, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أدخل عنوان الدرس"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        وصف الدرس *
                      </label>
                      <textarea
                        value={currentLesson.description}
                        onChange={(e) => setCurrentLesson({...currentLesson, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="أدخل وصف الدرس"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نوع الدرس
                        </label>
                        <select
                          value={currentLesson.lesson_type}
                          onChange={(e) => setCurrentLesson({...currentLesson, lesson_type: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="video_file">فيديو مسجل</option>
                          <option value="youtube_link">رابط يوتيوب</option>
                          <option value="live_session">جلسة مباشرة</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          المدة (بالدقائق)
                        </label>
                        <input
                          type="number"
                          value={currentLesson.duration_minutes}
                          onChange={(e) => setCurrentLesson({...currentLesson, duration_minutes: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                          max="300"
                        />
                      </div>
                    </div>

                    {/* YouTube URL field - only show for youtube_link type */}
                    {currentLesson.lesson_type === 'youtube_link' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رابط اليوتيوب *
                        </label>
                        <input
                          type="url"
                          value={currentLesson.youtube_url || ''}
                          onChange={(e) => setCurrentLesson({...currentLesson, youtube_url: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://www.youtube.com/watch?v=..."
                          required
                        />
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_published"
                        checked={currentLesson.is_published}
                        onChange={(e) => setCurrentLesson({...currentLesson, is_published: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_published" className="mr-2 block text-sm text-gray-700">
                        نشر الدرس فوراً
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddLesson(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          جاري الإضافة...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus"></i>
                          إضافة الدرس
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Submit for Review */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                <i className="fas fa-paper-plane me-3 text-blue-600"></i>
                إرسال الدورة للمراجعة
              </h3>
              <p className="text-gray-600 mb-6">
                بعد إضافة جميع الدروس، يمكنك إرسال الدورة للمشرف للمراجعة والموافقة عليها
              </p>

              {lessons.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-yellow-500 me-3"></i>
                    <span className="text-yellow-700">يجب إضافة درس واحد على الأقل قبل الإرسال للمراجعة</span>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center">
                    <i className="fas fa-check-circle text-blue-500 me-3"></i>
                    <span className="text-blue-700">الدورة جاهزة للإرسال - تم إضافة {lessons.length} درس</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => router.push('/dashboard/teacher')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <i className="fas fa-arrow-left"></i>
                  العودة للوحة التحكم
                </button>

                <button
                  onClick={handleSubmitForReview}
                  disabled={isSubmitting || lessons.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      إرسال للمراجعة
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}