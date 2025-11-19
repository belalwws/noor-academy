'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, Clock, AlertCircle, Video, Sparkles } from 'lucide-react';
import { sessionService } from '@/lib/services/sessionService';
import { toast } from 'sonner';

interface Lesson {
  id: string;
  title: string;
  order: number;
  duration_minutes?: number;
}

interface Course {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  batchId: string;
  onSessionCreated?: (sessionId: string) => void;
}

export default function CreateSessionModal({
  isOpen,
  onClose,
  courseId,
  batchId,
  onSessionCreated,
}: CreateSessionModalProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [duration, setDuration] = useState<30 | 60>(30);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCourse, setIsFetchingCourse] = useState(false);

  // Load course data when modal opens
  useEffect(() => {
    if (isOpen && courseId) {
      fetchCourseData();
    }
  }, [isOpen, courseId]);

  // Auto-fill title when lesson is selected (optional)
  useEffect(() => {
    if (selectedLessonId && course) {
      const lesson = course.lessons.find((l) => l.id === selectedLessonId);
      if (lesson && !sessionTitle) {
        // Only auto-fill if title is empty
        setSessionTitle(`حصة: ${lesson.title}`);
      }
    }
  }, [selectedLessonId, course]);

  const fetchCourseData = async () => {
    try {
      setIsFetchingCourse(true);
      
      // 1. Get course basic info from live-education API
      const { liveEducationApi } = await import('@/lib/api/live-education');
      const courseData = await liveEducationApi.courses.get(courseId);
      
      console.log('📦 Course Data from API:', courseData);
      
      // 2. Get lessons from content API (same as CourseDetailsModal)
      const { getAuthToken } = await import('@/lib/auth');
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة');
      }
      
      console.log('🌐 Fetching lessons -> GET http://localhost:8000/api/content/lessons/?unit__course=' + courseId);
      
      const lessonsResponse = await fetch(
        `http://localhost:8000/api/content/lessons/?unit__course=${courseId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('📡 Lessons Response Status:', lessonsResponse.status);
      
      let lessons: any[] = [];
      
      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json();
        console.log('✅ Lessons Data:', lessonsData);
        lessons = lessonsData.results || [];
        console.log('📚 Lessons count:', lessons.length);
      } else {
        console.warn('⚠️ Could not fetch lessons, continuing without them');
      }
      
      // Convert to Course type
      const course: Course = {
        id: courseData.id,
        title: courseData.title,
        lessons: lessons.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          order: lesson.order || 0,
          duration_minutes: lesson.duration_minutes ?? undefined
        }))
      };
      
      console.log('✅ Converted course:', course);
      console.log('✅ Converted lessons:', course.lessons);
      
      setCourse(course);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('فشل في تحميل بيانات الكورس');
    } finally {
      setIsFetchingCourse(false);
    }
  };

  const handleCreateSession = async () => {
    if (!sessionTitle.trim()) {
      toast.error('يرجى إدخال عنوان الجلسة');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        title: sessionTitle,
        session_type: 'course_lesson' as const,
        duration_minutes: duration,
        course: courseId,
        batch: batchId,
      };

      // Add lesson if selected
      if (selectedLessonId) {
        payload.lesson = selectedLessonId;
      }

      console.log('🚀 Creating session with payload:', payload);

      const session = await sessionService.createSession(payload);
      
      console.log('✅ Session created:', session);
      toast.success('تم إنشاء الجلسة بنجاح!');

      // Reset form
      setSelectedLessonId('');
      setSessionTitle('');
      setDuration(30);

      // Close modal
      onClose();

      // Notify parent
      if (onSessionCreated) {
        // Use session_id or id as fallback
        const sessionId = session.session_id || session.id || session.sessionId;
        onSessionCreated(sessionId);
      }
    } catch (error: any) {
      console.error('❌ Error creating session:', error);
      toast.error(error.message || 'فشل في إنشاء الجلسة');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[calc(100vh-120px)] overflow-hidden mt-16 md:mt-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold mb-0.5">إنشاء جلسة مباشرة</h2>
                <p className="text-amber-100 text-xs">
                  ابدأ حصة تفاعلية جديدة مع طلابك
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              style={{ transform: 'none' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
          {isFetchingCourse ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-200 border-t-amber-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">جاري تحميل بيانات الكورس...</p>
            </div>
          ) : !course ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                خطأ في تحميل الكورس
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                لم يتم العثور على بيانات الكورس
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Course Info */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">الكورس</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{course.title}</p>
              </div>

              {/* Lesson Selection - Optional */}
              {course.lessons && course.lessons.length > 0 && (
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    اختر الدرس (اختياري)
                  </label>
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    disabled={isLoading}
                  >
                    <option value="">-- بدون درس محدد --</option>
                    {course.lessons
                      .sort((a, b) => a.order - b.order)
                      .map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.order}. {lesson.title}
                          {lesson.duration_minutes
                            ? ` (${lesson.duration_minutes} دقيقة)`
                            : ''}
                        </option>
                      ))}
                  </select>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    يمكنك إنشاء جلسة بدون تحديد درس معين
                  </p>
                </div>
              )}

              {/* Session Title */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  عنوان الجلسة *
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="مثال: حصة تحفيظ سورة البقرة"
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  disabled={isLoading}
                />
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  {selectedLessonId 
                    ? 'يمكنك تعديل العنوان بعد اختيار الدرس'
                    : 'أدخل عنواناً واضحاً ومميزاً للجلسة'}
                </p>
              </div>

              {/* Duration */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  مدة الجلسة *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDuration(30)}
                    disabled={isLoading}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      duration === 30
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:border-amber-300 dark:hover:border-amber-600'
                    }`}
                    style={{ transform: 'none' }}
                  >
                    <div className="text-xl font-bold mb-0.5">30</div>
                    <div className="text-xs">دقيقة</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuration(60)}
                    disabled={isLoading}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      duration === 60
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:border-amber-300 dark:hover:border-amber-600'
                    }`}
                    style={{ transform: 'none' }}
                  >
                    <div className="text-xl font-bold mb-0.5">60</div>
                    <div className="text-xs">دقيقة</div>
                  </button>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-1 text-xs">
                      ⚠️ تنبيه مهم
                    </h4>
                    <ul className="text-[10px] text-amber-700 dark:text-amber-300 space-y-0.5">
                      <li>
                        • المؤقت سيبدأ تلقائياً عند دخول المعلم + طالب واحد على
                        الأقل
                      </li>
                      <li>• يمكنك تمديد الجلسة لمدة 10 دقائق إضافية (مرة واحدة)</li>
                      <li>• الجلسة ستنتهي تلقائياً عند مغادرة جميع المشاركين</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-800">
          <div className="flex gap-2">
            <button
              onClick={handleCreateSession}
              disabled={
                isLoading ||
                !sessionTitle.trim() ||
                isFetchingCourse
              }
              className="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm"
              style={{ transform: 'none' }}
            >
              {isLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Video className="inline-block w-4 h-4 ml-2" />
                  إنشاء الجلسة
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-medium disabled:opacity-50 text-sm"
              style={{ transform: 'none' }}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
