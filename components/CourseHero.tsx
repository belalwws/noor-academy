'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Play, 
  CheckCircle, 
  Calendar,
  Globe,
  Shield,
  Clock,
  User
} from 'lucide-react';
import { getProxiedImageUrl } from '@/lib/imageUtils';

interface Course {
  id: string;
  title: string;
  description: string;
  learning_outcomes: string;
  course_type: 'individual' | 'family' | 'private-group' | 'public-group';
  course_type_display: string;
  subjects: string;
  trial_session_url?: string;
  intro_session_id?: string;
  thumbnail?: string;
  cover_image?: string;
  max_students: string;
  teacher: number;
  teacher_name: string;
  teacher_email?: string;
  teacher_profile_image_url?: string;
  teacher_profile_image_thumbnail_url?: string;
  enrolled_count: number;
  approval_status: string;
  approval_status_display: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
  lessons?: any[];
  units?: any[];
  price?: string;
  final_price?: string | number;
  accepting_applications?: boolean;
}

interface CourseHeroProps {
  course: Course;
  isEnrolled: boolean;
  enrolling: boolean;
  onEnroll: () => void;
  totalVideoDuration?: number; // Total duration in seconds for recorded courses
  isRecordedCourse?: boolean; // Whether this is a recorded course
  courseId?: string; // Course ID for navigation
}

export default function CourseHero({
  course,
  isEnrolled,
  enrolling,
  onEnroll,
  totalVideoDuration,
  isRecordedCourse: isRecordedCourseProp,
  courseId
}: CourseHeroProps) {
  const router = useRouter();
  
  // Debug: Log received course data
  console.log('📚 CourseHero - Received course:', course);
  console.log('📚 CourseHero - Course title:', course?.title);
  console.log('📚 CourseHero - Course description:', course?.description);
  console.log('📚 CourseHero - Course subjects:', course?.subjects);
  console.log('📚 CourseHero - Course learning_outcomes:', course?.learning_outcomes);
  
  // Safely parse subjects and learning outcomes
  const subjects = (() => {
    if (!course?.subjects) return [];
    if (typeof course.subjects === 'string') {
      return course.subjects.split('\n').filter(subject => subject.trim());
    }
    if (Array.isArray(course.subjects)) {
      return course.subjects.filter(subject => subject && String(subject).trim());
    }
    return [];
  })();
  
  const learningOutcomes = (() => {
    if (!course?.learning_outcomes) return [];
    if (typeof course.learning_outcomes === 'string') {
      return course.learning_outcomes.split('\n').filter(outcome => outcome.trim());
    }
    if (Array.isArray(course.learning_outcomes)) {
      return course.learning_outcomes.filter(outcome => outcome && String(outcome).trim());
    }
    return [];
  })();

  console.log('📚 CourseHero - Parsed subjects:', subjects);
  console.log('📚 CourseHero - Parsed learningOutcomes:', learningOutcomes);

  // Function to extract YouTube video ID and get thumbnail
  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null;
    
    // Extract video ID from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/.*[?&]v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        const videoId = match[1];
        // Return high quality thumbnail
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    return null;
  };

  // Check if this is a recorded course (use prop if provided, otherwise check course type)
  const isRecordedCourse = isRecordedCourseProp !== undefined 
    ? isRecordedCourseProp 
    : course?.course_type_display === 'دورة مسجلة';
  
  // For recorded courses, use cover_image or thumbnail
  // For live courses, use YouTube thumbnail from trial_session_url
  const thumbnailUrl = isRecordedCourse 
    ? (course?.cover_image || course?.thumbnail)
    : getYouTubeThumbnail(course?.trial_session_url || '');
  
  // Format price for recorded courses
  const formatPrice = (price: string | undefined) => {
    if (!price || price === '-' || price === '0') return 'مجاني';
    try {
      const numPrice = parseFloat(price);
      return `${numPrice.toLocaleString('ar-EG')} ج.م`;
    } catch {
      return price;
    }
  };

  // Format duration for recorded courses
  const formatDuration = (totalSeconds: number | undefined) => {
    if (!totalSeconds || totalSeconds === 0) return null;
    const totalMinutes = Math.round(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return minutes > 0 ? `${hours} ساعة ${minutes} دقيقة` : `${hours} ساعة`;
    } else {
      return `${minutes} دقيقة`;
    }
  };
  
  // Debug logging
  console.log('🎥 CourseHero - Is recorded course:', isRecordedCourse);
  console.log('🎥 CourseHero - Course trial session URL:', course?.trial_session_url);
  console.log('🖼️ CourseHero - Course cover image:', course?.cover_image);
  console.log('🖼️ CourseHero - Course thumbnail:', course?.thumbnail);
  console.log('🖼️ CourseHero - Generated thumbnail URL:', thumbnailUrl);
  console.log('💰 CourseHero - Course price:', course?.price);

  return (
    <div className="bg-white dark:bg-slate-800 transition-colors duration-300">
      {/* Navigation Breadcrumb */}
      <div className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <nav className="text-sm text-gray-600 dark:text-slate-400">
            {isRecordedCourse ? (
              <>
                <span>الدورات المسجلة</span>
            <span className="mx-2">›</span>
                <span className="text-gray-900 dark:text-slate-200 font-medium">{course.course_type_display}</span>
              </>
            ) : (
              <>
            <span>الدورات</span>
            <span className="mx-2">›</span>
                <span className="text-gray-900 dark:text-slate-200 font-medium">الدورات المباشرة</span>
              </>
            )}
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
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-slate-100 leading-tight mb-4 transition-colors duration-300">
                {course.title}
              </h1>
              <p className="text-lg text-gray-700 dark:text-slate-300 leading-relaxed mb-4 transition-colors duration-300">
                {course.description}
              </p>
            </div>

            {/* Course Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-slate-400">
              {!isRecordedCourse && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{course.enrolled_count} طالب مسجل</span>
                </div>
              )}
              {isRecordedCourse && course.units && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.units.length} وحدة</span>
                </div>
              )}
              {isRecordedCourse && course.lessons && (
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  <span>{course.lessons.length} درس</span>
                </div>
              )}
              {isRecordedCourse && totalVideoDuration && totalVideoDuration > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>المدة الإجمالية: {formatDuration(totalVideoDuration)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>آخر تحديث: {new Date(course.updated_at || course.created_at).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>

            {/* Course Type Badge */}
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 text-sm font-medium border-orange-200 dark:border-orange-800">
                <Shield className="w-3 h-3 ml-1" />
                {course.course_type_display}
              </Badge>
              <Badge variant="outline" className="text-gray-600 dark:text-slate-400 border-gray-300 dark:border-slate-600">
                <Globe className="w-3 h-3 ml-1" />
                العربية
              </Badge>
            </div>

            {/* Learning Outcomes */}
            {learningOutcomes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">ما سيتعلمه الطالب</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {learningOutcomes.slice(0, 6).map((outcome, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-slate-300 text-sm">{outcome}</span>
                    </div>
                  ))}
                </div>
                {learningOutcomes.length > 6 && (
                  <button className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium transition-colors">
                    عرض المزيد ({learningOutcomes.length - 6} عنصر إضافي)
                  </button>
                )}
              </div>
            )}


            {/* Teacher Info */}
            <div className="border-t border-gray-200 dark:border-slate-700 pt-6 transition-colors duration-300">
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">المعلم</h3>
              <div className="flex items-center gap-4">
                {(() => {
                  const teacherImage = course.teacher_profile_image_thumbnail_url || 
                                       course.teacher_profile_image_url;
                  console.log('🖼️ CourseHero - Teacher image:', {
                    thumbnail: course.teacher_profile_image_thumbnail_url,
                    full: course.teacher_profile_image_url,
                    selected: teacherImage,
                    teacherName: course.teacher_name
                  });
                  return teacherImage && teacherImage !== '/default-avatar.png' ? (
                    <img
                      src={getProxiedImageUrl(teacherImage, false)}
                      alt={course.teacher_name}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-orange-200 dark:border-orange-800 shadow-lg"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        console.error('❌ CourseHero - Backend proxy failed, showing fallback:', e);
                        const img = e.currentTarget as HTMLImageElement;
                        img.style.display = 'none';
                        const fallback = img.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null;
                })()}
                <div className={`w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 dark:from-orange-600 dark:to-yellow-600 rounded-full flex items-center justify-center shadow-lg ${(() => {
                  const teacherImage = course.teacher_profile_image_thumbnail_url || 
                                       course.teacher_profile_image_url;
                  return teacherImage && teacherImage !== '/default-avatar.png' ? 'hidden' : '';
                })()}`}>
                  <span className="text-xl font-bold text-white">{course.teacher_name.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-slate-100">{course.teacher_name}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Course Preview & Enrollment */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              
              {/* Course Preview Image/Video */}
              <div className="relative bg-gray-900 dark:bg-slate-900 rounded-lg overflow-hidden">
                <div className="aspect-video relative">
                  {thumbnailUrl ? (
                    <>
                      <img 
                        src={thumbnailUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.style.display = 'none';
                          const fallback = img.parentElement?.querySelector('.fallback-content') as HTMLElement;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                      
                      {/* Hidden fallback content */}
                      <div className="fallback-content hidden absolute inset-0 bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
                        <div className="text-center text-white">
                          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-80" />
                          <p className="text-lg font-semibold">{course.title}</p>
                        </div>
                      </div>
                      
                      {/* Play Button Overlay for live courses */}
                      {!isRecordedCourse && course.trial_session_url && (
                        <div 
                          className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer hover:bg-black/40 transition-all duration-300"
                          onClick={() => window.open(course.trial_session_url, '_blank')}
                        >
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 text-orange-600 ml-1" fill="currentColor" />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
                      <div className="text-center text-white">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-80" />
                        <p className="text-lg font-semibold line-clamp-2 px-4">{course.title}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Badge for number of lessons */}
                  {course.lessons && course.lessons.length > 0 && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-black/50 text-white text-xs backdrop-blur-sm">
                        {course.lessons.length} درس
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Price (for recorded courses) */}
              {isRecordedCourse && (course.final_price || course.price) && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-slate-300 font-medium">السعر:</span>
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {formatPrice(course.final_price || course.price)}
                    </span>
                  </div>
                </div>
              )}

              {/* Enrollment Button */}
              <div className="space-y-3">
                {course.accepting_applications !== false && (
                  <Button
                    onClick={() => {
                      // If enrolled in recorded course, navigate to recorded content page
                      if (isEnrolled && isRecordedCourse && courseId) {
                        console.log('🎓 User is enrolled in recorded course, navigating to content page:', `/course/${courseId}/recorded-content`);
                        router.push(`/course/${courseId}/recorded-content`);
                      } else {
                        // Otherwise, use the default enrollment handler
                        console.log('🎓 Using default enrollment handler');
                        onEnroll();
                      }
                    }}
                    disabled={enrolling}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-colors duration-300"
                    style={{ transform: 'none' }}
                  >
                    {enrolling ? (
                      <>جاري التسجيل...</>
                    ) : isEnrolled ? (
                      <>
                        <CheckCircle className="w-5 h-5 ml-2" />
                        {isRecordedCourse ? 'متابعة التعلم' : 'مسجل في الدورة'}
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 ml-2" />
                        {isRecordedCourse ? 'اشترك في الدورة' : 'سجل في الدورة'}
                      </>
                    )}
                  </Button>
                )}

                {!course.accepting_applications && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800 font-medium">التسجيل غير متاح حالياً</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

