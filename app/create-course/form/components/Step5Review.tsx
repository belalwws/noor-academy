'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Play, 
  CheckCircle, 
  Calendar,
  Globe,
  Shield,
  Eye,
  DollarSign
} from 'lucide-react';
import type { CourseFormData, Unit, Lesson } from '../types';
import UnitsSection from '@/components/UnitsSection';
import CourseInfo from '@/components/CourseInfo';

interface Step5ReviewProps {
  formData: CourseFormData;
  courseType?: string;
}

export function Step5Review({ formData, courseType }: Step5ReviewProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  // Transform formData to match Course interface for CourseHero
  const learningOutcomes = formData.learning_outcomes?.split('\n').filter(outcome => outcome.trim()) || [];
  const topics = formData.topics?.split('\n').filter(topic => topic.trim()) || [];
  
  // Transform units and lessons to match UnitsSection interface
  const transformedUnits = formData.units.map((unit: Unit) => {
    const unitLessons = formData.lessons
      .filter((l: Lesson) => l.unitId === unit.id)
      .sort((a, b) => a.order - b.order)
      .map((lesson: Lesson) => ({
        ...lesson,
        id: lesson.id,
        unit: unit.id,
        duration_minutes: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add video information for recorded courses
        video_url: lesson.videoUploadUrl || '',
        bunny_video_id: lesson.bunnyVideoId || '',
        video_duration: undefined,
        video_size: undefined,
      }));
    
    return {
      id: unit.id,
      course: '',
      title: unit.title,
      description: unit.description,
      order: unit.order,
      lessons: unitLessons,
      lesson_count: unitLessons.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  // Get teacher name from localStorage
  const [teacherName, setTeacherName] = useState('المعلم');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setTeacherName(user.full_name || user.first_name || user.username || 'المعلم');
        }
      } catch (error) {
        console.error('Error loading teacher name:', error);
      }
    }
  }, []);

  // Transform course for CourseHero
  const courseForDisplay = {
    id: 'preview',
    title: formData.title,
    description: formData.description,
    learning_outcomes: formData.learning_outcomes,
    course_type: courseType === 'recorded' ? 'public-group' : 'individual',
    course_type_display: courseType === 'recorded' ? 'دورة مسجلة' : 'دورة مباشرة',
    subjects: formData.topics,
    trial_session_url: formData.intro_session_id || undefined,
    max_students: '0',
    teacher: 0,
    teacher_name: teacherName,
    enrolled_count: 0,
    approval_status: 'pending',
    approval_status_display: 'معاينة',
    is_published: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lessons: formData.lessons,
    thumbnail: formData.thumbnailPreview,
    cover_image: formData.coverImagePreview,
  };

  const handleLessonClick = (lessonId: string | number) => {
    const lesson = formData.lessons.find((l: Lesson) => l.id === lessonId);
    if (lesson) {
      setSelectedLesson({
        ...lesson,
        duration_minutes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  // Function to extract YouTube video ID and get thumbnail
  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/.*[?&]v=([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
      }
    }
    return null;
  };

  const thumbnailUrl = formData.intro_session_id 
    ? getYouTubeThumbnail(formData.intro_session_id) 
    : formData.thumbnailPreview;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          معاينة الدورة
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          هذه هي الطريقة التي ستظهر بها الدورة للطلاب
        </p>
      </div>

      {/* Preview Container - Similar to course/[id]/page.tsx */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Course Hero Section */}
        <div className="bg-white dark:bg-slate-900">
          {/* Navigation Breadcrumb */}
          <div className="bg-gray-50 dark:bg-slate-800 border-b">
            <div className="max-w-7xl mx-auto px-6 py-3">
              <nav className="text-sm text-gray-600 dark:text-slate-400">
                <span>{courseType === 'recorded' ? 'الدورات المسجلة' : 'التعليم المباشر'}</span>
                <span className="mx-2">›</span>
                <span>الدورات</span>
                <span className="mx-2">›</span>
                <span className="text-gray-900 dark:text-slate-100 font-medium">{courseForDisplay.course_type_display}</span>
              </nav>
            </div>
          </div>

          {/* Main Hero Section */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Content - Main Course Info */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Course Title */}
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
                    {formData.title}
                  </h1>
                  <p className="text-lg text-gray-700 dark:text-slate-300 leading-relaxed mb-4">
                    {formData.description}
                  </p>
                </div>

                {/* Course Stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>0 طالب مسجل</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>تاريخ البدء: {formData.start_date ? new Date(formData.start_date).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
                  </div>
                </div>

                {/* Course Type Badge */}
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 text-sm font-medium">
                    <Shield className="w-3 h-3 ml-1" />
                    {courseForDisplay.course_type_display}
                  </Badge>
                  <Badge variant="outline" className="text-gray-600 dark:text-slate-400">
                    <Globe className="w-3 h-3 ml-1" />
                    العربية
                  </Badge>
                </div>

                {/* Learning Outcomes */}
                {learningOutcomes.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">ما سيتعلمه الطالب</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {learningOutcomes.slice(0, 6).map((outcome, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-slate-300 text-sm">{outcome}</span>
                        </div>
                      ))}
                    </div>
                    {learningOutcomes.length > 6 && (
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                        عرض المزيد ({learningOutcomes.length - 6} عنصر إضافي)
                      </button>
                    )}
                  </div>
                )}

                {/* Teacher Info */}
                <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">المعلم</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{teacherName.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{teacherName}</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">معلم معتمد</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Course Preview & Pricing */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  
                  {/* Course Preview Image/Video */}
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                    <div className="aspect-video relative">
                      {thumbnailUrl ? (
                        <img 
                          src={thumbnailUrl} 
                          alt="معاينة الدورة" 
                          className="w-full h-full object-cover"
                        />
                      ) : formData.coverImagePreview ? (
                        <img 
                          src={formData.coverImagePreview} 
                          alt="معاينة الدورة" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <div className="text-center">
                            <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
                            <p className="text-white text-sm font-medium">معاينة الدورة</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Play Button Overlay if intro session exists */}
                      {formData.intro_session_id && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-black/50 text-white text-xs">
                        {formData.lessons.length} درس
                      </Badge>
                    </div>
                  </div>

                  {/* Pricing & Info */}
                  <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 space-y-4">
                    {courseType === 'recorded' && formData.price ? (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {parseFloat(formData.price).toLocaleString('ar-SA')} ر.س
                        </div>
                        <div className="text-sm text-gray-600 dark:text-slate-400">
                          سعر الدورة (بعد إضافة نسبة المنصة)
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">مجاني</div>
                        <div className="text-sm text-gray-600 dark:text-slate-400">للطلاب المسجلين</div>
                      </div>
                    )}

                    {/* Course Stats */}
                    <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-slate-400">الوحدات:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formData.units.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-slate-400">الدروس:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formData.lessons.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-slate-400">تاريخ البدء:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formData.start_date ? new Date(formData.start_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-slate-400">تاريخ الانتهاء:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formData.end_date ? new Date(formData.end_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content Section */}
        <div className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">              
              {/* Uploaded Videos Summary for Recorded Courses */}
              {courseType === 'recorded' && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5 text-blue-600" />
                    الفيديوهات المرفوعة
                  </h3>
                  
                  {(() => {
                    // Debug: Log lesson data to console with full object inspection
                    console.log('🔍 Review - Lessons formData FULL:', JSON.stringify(formData.lessons, null, 2));
                    console.log('🔍 Review - Lessons data:');
                    formData.lessons.forEach((l: any) => {
                      console.log(`  📝 ${l.title}:`, {
                        id: l.id,
                        videoUploaded: l.videoUploaded,
                        bunnyVideoId: l.bunnyVideoId,
                        videoUploadUrl: l.videoUploadUrl,
                        videoFileName: l.videoFileName,
                        hasAnyVideoData: !!(l.videoUploaded || l.bunnyVideoId || l.videoUploadUrl),
                        allKeys: Object.keys(l)
                      });
                    });
                    
                    const uploadedLessons = formData.lessons.filter((lesson: any) => 
                      lesson.videoUploaded || lesson.bunnyVideoId || lesson.videoUploadUrl
                    );
                    const totalLessons = formData.lessons.length;
                    
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                            تم رفع {uploadedLessons.length} من {totalLessons} درس
                          </span>
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            {totalLessons > 0 ? Math.round((uploadedLessons.length / totalLessons) * 100) : 0}%
                          </span>
                        </div>
                        
                        {uploadedLessons.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">الدروس المرفوعة:</h4>
                            <div className="space-y-1">
                              {uploadedLessons.map((lesson: any) => (
                                <div key={lesson.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-700 rounded">
                                  <CheckCircle className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">{lesson.title}</span>
                                  {lesson.videoFileName && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      ({lesson.videoFileName})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {uploadedLessons.length < totalLessons && (
                          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <span className="text-sm text-amber-700 dark:text-amber-400">
                              ⚠️ يرجى رفع فيديوهات باقي الدروس قبل نشر الدورة
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
              
              <CourseInfo course={courseForDisplay} />
              
              {transformedUnits.length > 0 ? (
                <UnitsSection
                  units={transformedUnits}
                  onLessonClick={handleLessonClick}
                  selectedLesson={selectedLesson}
                />
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">لا توجد وحدات متاحة</h3>
                  <p className="text-gray-600 dark:text-slate-400">لم يتم إضافة وحدات لهذه الدورة بعد</p>
                </div>
              )}
            </div>

            {/* Right Sidebar - Additional Info */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6 space-y-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">معلومات الدورة</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">نوع الدورة</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{courseForDisplay.course_type_display}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">حالة التسجيل</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formData.accepting_applications ? 'مفتوح للتسجيل' : 'مغلق للتسجيل'}
                    </p>
                  </div>
                  
                  {formData.intro_session_id && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">الجلسة التعريفية</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm break-all">
                        {formData.intro_session_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

