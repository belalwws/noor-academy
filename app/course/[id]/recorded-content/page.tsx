'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import VideoPlayer from '@/components/course/VideoPlayer';
import CourseSidebar from '@/components/course/CourseSidebar';
import LessonTabs from '@/components/course/LessonTabs';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

interface Lesson {
  id: number;
  title: string;
  description: string;
  order: number;
  duration_minutes?: number;
  video_duration?: number;
  video_url?: string;
  bunny_video_id?: string;
  unit_title?: string;
  is_completed?: boolean;
}

interface Unit {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  learning_outcomes?: string;
  teacher_name?: string;
  total_lessons?: number;
  units?: Unit[];
}

function RecordedCourseContent() {
  const router = useRouter();
  const params = useParams();
  const courseId = params['id'] as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // يبدأ مفتوح by default

  // تحميل بيانات الدورة
  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');

        if (!token) {
          toast.error('يجب تسجيل الدخول أولاً');
          router.push('/login');
          return;
        }

        // تحميل بيانات الدورة
        const courseResponse = await fetch(
          `${API_BASE_URL}/recorded-courses/courses/${courseId}/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!courseResponse.ok) {
          throw new Error('فشل في تحميل بيانات الدورة');
        }

        const courseData = await courseResponse.json();
        setCourse(courseData);

        // تحميل الوحدات مع الدروس
        const unitsResponse = await fetch(
          `${API_BASE_URL}/recorded-courses/units/?course=${courseId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (unitsResponse.ok) {
          const unitsData = await unitsResponse.json();

          // تحميل تفاصيل كل وحدة
          const detailedUnits = await Promise.all(
            (unitsData.results || []).map(async (unit: any) => {
              const unitDetailResponse = await fetch(
                `${API_BASE_URL}/recorded-courses/units/${unit.id}/`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );

              if (unitDetailResponse.ok) {
                return await unitDetailResponse.json();
              }
              return unit;
            })
          );

          // تحميل حالة الـ completion من localStorage
          const courseProgressKey = `course_progress_${courseId}`;
          const courseProgress = JSON.parse(localStorage.getItem(courseProgressKey) || '{}');
          
          // تحديث حالة الـ completion للدروس
          const updatedUnits = detailedUnits.map((unit: Unit) => ({
            ...unit,
            lessons: unit.lessons.map((lesson: Lesson) => {
              const lessonProgress = courseProgress[lesson.id];
              if (lessonProgress) {
                return { ...lesson, is_completed: lessonProgress.completed };
              }
              // Fallback: تحقق من المفتاح القديم
              const oldKey = `lesson_completion_${lesson.id}`;
              const oldProgress = localStorage.getItem(oldKey);
              if (oldProgress) {
                try {
                  const parsed = JSON.parse(oldProgress);
                  return { ...lesson, is_completed: parsed.completed };
                } catch {
                  return lesson;
                }
              }
              return lesson;
            })
          }));

          setUnits(updatedUnits);

          // تحميل أول درس تلقائياً
          if (updatedUnits.length > 0) {
            for (const unit of updatedUnits) {
              if (unit.lessons && unit.lessons.length > 0) {
                const firstLesson = unit.lessons[0];
                // تحديث حالة الـ completion للدرس الحالي
                const lessonProgress = courseProgress[firstLesson.id];
                if (lessonProgress) {
                  setCurrentLesson({ ...firstLesson, is_completed: lessonProgress.completed });
                } else {
                  setCurrentLesson(firstLesson);
                }
                break;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading course:', error);
        toast.error('حدث خطأ في تحميل بيانات الدورة');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [courseId, router]);

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    // التمرير للأعلى على الموبايل
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLessonComplete = async (lessonId?: number) => {
    const targetLessonId = lessonId || currentLesson?.id;
    if (!targetLessonId) return;

    // البحث عن الدرس الحالي لمعرفة حالته
    let currentLessonState: Lesson | null = null;
    for (const unit of units) {
      const foundLesson = unit.lessons.find(l => l.id === targetLessonId);
      if (foundLesson) {
        currentLessonState = foundLesson;
        break;
      }
    }
    
    // إذا لم يتم العثور على الدرس في units، استخدم currentLesson
    if (!currentLessonState && currentLesson && currentLesson.id === targetLessonId) {
      currentLessonState = currentLesson;
    }

    const isCurrentlyCompleted = currentLessonState?.is_completed || false;
    const newCompletedState = !isCurrentlyCompleted;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('يجب تسجيل الدخول أولاً');
        return;
      }

      // تحديث الـ state فوراً (optimistic update)
      setUnits(prevUnits => 
        prevUnits.map(unit => ({
          ...unit,
          lessons: unit.lessons.map(lesson => 
            lesson.id === targetLessonId 
              ? { ...lesson, is_completed: newCompletedState }
              : lesson
          )
        }))
      );

      // تحديث currentLesson إذا كان هو اللي اتعمل toggle
      if (currentLesson && currentLesson.id === targetLessonId) {
        setCurrentLesson({ ...currentLesson, is_completed: newCompletedState });
      }

      // حفظ محلي في localStorage (API endpoint غير متوفر حالياً)
      const storageKey = `lesson_completion_${targetLessonId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        completed: newCompletedState,
        timestamp: new Date().toISOString(),
        courseId: courseId
      }));

      // حفظ في localStorage للـ course ككل
      const courseProgressKey = `course_progress_${courseId}`;
      const courseProgress = JSON.parse(localStorage.getItem(courseProgressKey) || '{}');
      courseProgress[targetLessonId] = {
        completed: newCompletedState,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(courseProgressKey, JSON.stringify(courseProgress));

      toast.success(newCompletedState ? 'تم إكمال الدرس بنجاح' : 'تم إلغاء إكمال الدرس');
      
      // إذا كان من الفيديو وتم الإكمال، انتقل للدرس التالي
      if (!lessonId && currentLesson && newCompletedState) {
        handleNextLesson();
      }
    } catch (error) {
      console.error('Error toggling lesson completion:', error);
      toast.error('حدث خطأ أثناء حفظ حالة الدرس');
    }
  };

  const handleNextLesson = () => {
    if (!currentLesson || units.length === 0) return;

    // البحث عن الدرس التالي
    for (const unit of units) {
      const lessons = unit.lessons || [];
      const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);

      if (currentIndex !== -1) {
        // التحقق من وجود درس تالي في نفس الوحدة
        if (currentIndex < lessons.length - 1) {
          handleLessonClick(lessons[currentIndex + 1]);
          return;
        }

        // التحقق من وجود وحدة تالية
        const currentUnitIndex = units.findIndex(u => u.id === unit.id);
        if (currentUnitIndex < units.length - 1) {
          for (let i = currentUnitIndex + 1; i < units.length; i++) {
            if (units[i].lessons && units[i].lessons.length > 0) {
              handleLessonClick(units[i].lessons[0]);
              return;
            }
          }
        }
      }
    }

    toast.info('تم إكمال جميع دروس الدورة');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">جاري تحميل الدورة...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-4">لم يتم العثور على الدورة</p>
          <button
            onClick={() => router.push('/dashboard/student')}
            className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 pt-16" onClick={() => setSidebarCollapsed(true)} />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed right-0 top-16 bottom-0 w-[85vw] max-w-[380px] z-50 transition-transform duration-300 ${
        sidebarCollapsed ? 'translate-x-full' : 'translate-x-0'
      }`}>
        <CourseSidebar
          units={units}
          currentLessonId={currentLesson?.id}
          onLessonClick={(lesson) => {
            handleLessonClick(lesson);
            setSidebarCollapsed(true);
          }}
          isCollapsed={false}
          onToggleCollapse={() => setSidebarCollapsed(true)}
          onLessonComplete={handleLessonComplete}
        />
      </div>
      
      {/* Mobile Menu Button - يظهر فقط لما الـ sidebar مغلق */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="lg:hidden fixed bottom-6 right-6 z-30 w-16 h-16 bg-gradient-primary rounded-full shadow-2xl flex items-center justify-center hover:shadow-primary/50 transition-all active:scale-95"
        >
          <div className="relative">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {/* Badge للإشارة لوجود محتوى */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
        </button>
      )}

      <div className="flex min-h-screen pt-16">
        {/* Desktop Sidebar - Fixed */}
        <div 
          className={`hidden lg:block lg:fixed lg:right-0 lg:top-16 lg:bottom-0 lg:overflow-hidden z-30 transition-all duration-300 ${
            sidebarCollapsed ? 'lg:w-[60px]' : 'lg:w-[380px]'
          }`}
        >
          <CourseSidebar
            units={units}
            currentLessonId={currentLesson?.id}
            onLessonClick={handleLessonClick}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onLessonComplete={handleLessonComplete}
          />
        </div>

        {/* Main Content - Dynamic Width */}
        <div 
          className={`w-full transition-all duration-300 ${
            sidebarCollapsed ? 'lg:mr-[60px]' : 'lg:mr-[380px]'
          }`}
        >
          {/* شريط العنوان */}
          <div className="sticky top-16 z-20 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-md">
            <div className="px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between">
              <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent line-clamp-1">
                {course.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm text-slate-600 dark:text-slate-400">
                  {currentLesson ? `الدرس ${units.flatMap(u => u.lessons).findIndex(l => l.id === currentLesson.id) + 1}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* محتوى الدورة */}
          <div className="flex flex-col bg-slate-900">
            {/* مشغل الفيديو مع إطار */}
            <div className="relative bg-slate-900">
              {/* شريط علوي للفيديو */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary z-10"></div>
              
              {currentLesson && currentLesson.bunny_video_id ? (
                <VideoPlayer
                  lessonId={currentLesson.id}
                  videoId={currentLesson.bunny_video_id}
                  lessonTitle={currentLesson.title}
                  onEnded={handleNextLesson}
                  onComplete={handleLessonComplete}
                />
              ) : (
                <div className="w-full aspect-video bg-gradient-primary flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">مرحباً بك في الدورة</h3>
                    <p className="text-white/90">اختر درساً من القائمة للبدء</p>
                  </div>
                </div>
              )}
              
              {/* شريط سفلي للفيديو */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E9A821] via-[#FFB347] to-[#E9A821] z-10"></div>
            </div>

            {/* التبويبات والمحتوى */}
            {currentLesson && (
              <LessonTabs
                lesson={currentLesson}
                course={course}
                onComplete={handleLessonComplete}
                onNext={handleNextLesson}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecordedCourseContentPage() {
  return (
    <ProtectedRoute>
      <RecordedCourseContent />
    </ProtectedRoute>
  );
}
