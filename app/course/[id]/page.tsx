'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { logger } from '@/lib/utils/logger';
import { recordedCoursesApi, RecordedCourseDetail } from '@/lib/api/recorded-courses';
// ProtectedRoute removed - course viewing is now public
import FamilyEnrollmentModal from '@/components/FamilyEnrollmentModal';
import CourseEnrollmentModal from '@/components/CourseEnrollmentModal';
import ErrorModal from '@/components/ErrorModal';
import RegisterPromptModal from '@/components/RegisterPromptModal';
import CourseHero from '@/components/CourseHero';
import CourseInfo from '@/components/CourseInfo';
import LessonsSection from '@/components/LessonsSection';
import UnitsSection from '@/components/UnitsSection';

interface Lesson {
  id: string | number;
  title: string;
  description: string;
  order: number;
  unit?: string; // UUID of the unit
  learning_outcomes?: string;
  duration_minutes?: number | null;
  objectives?: string;
  materials?: string;
  homework?: string;
  sessions_count?: number;
  created_at: string;
  updated_at: string;
  video_url?: string;
  bunny_video_id?: string;
  video_duration?: number;
  video_size?: number;
}

interface Unit {
  id: string;
  course: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  lesson_count: number;
  created_at: string;
  updated_at: string;
}

interface FamilyMember {
  student_name: string;
  student_email: string;
  relationship: string;
  notes: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  learning_outcomes: string;
  topics?: string;
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
  teacher_id?: string;
  teacher_email?: string;
  teacher_profile_image_url?: string;
  teacher_profile_image_thumbnail_url?: string;
  enrolled_count: number;
  approval_status: string;
  approval_status_display: string;
  status?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  is_published: boolean;
  is_hidden?: boolean;
  start_date?: string;
  end_date?: string;
  accepting_applications?: boolean;
  price?: string;
  final_price?: string | number;
  batches_count?: string;
  total_students?: string;
  batches?: string;
  created_at: string;
  updated_at?: string;
  lessons?: Lesson[];
  units?: Unit[];
}

const CourseDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  
  // Main states
  const [course, setCourse] = useState<Course | null>(null);
  const [recordedCourse, setRecordedCourse] = useState<RecordedCourseDetail | null>(null);
  const [isRecordedCourse, setIsRecordedCourse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [totalVideoDuration, setTotalVideoDuration] = useState<number>(0); // Total duration in seconds
  
  // Enrollment modal states
  const [showFamilyEnrollModal, setShowFamilyEnrollModal] = useState(false);
  const [showCourseEnrollModal, setShowCourseEnrollModal] = useState(false);
  const [showRegisterPromptModal, setShowRegisterPromptModal] = useState(false);
  
  // Debug: Log modal states
  console.log('🔍 Modal states:', { showFamilyEnrollModal, showCourseEnrollModal });
  
  // Error modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    title: string;
    message: string;
    details?: string[];
  } | null>(null);

  // Fetch course data from API
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching course with ID:', params['id']);
        
        // Token is optional - allow viewing courses without authentication
        const token = localStorage.getItem('access_token');
        
        // Get API URL for logging
        const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'https://lisan-alhekma.onrender.com/api';
        
        // Try to fetch from live courses first
        let courseResponse: Response | null = null;
        let isRecorded = false;
        
        try {
          const endpoint = `/live-courses/courses/${params['id']}/`;
          const fullUrl = `${apiUrl}${endpoint}`;
          console.log('🌐 Trying live courses API:', fullUrl);
          console.log('🔑 Token present:', !!token);
          
          // Use optional auth request - allows viewing courses without login
          const { makeOptionalAuthRequest } = await import('@/lib/api/helpers');
          courseResponse = await makeOptionalAuthRequest(endpoint);
          console.log('📡 Live courses response status:', courseResponse.status);
          
          if (courseResponse.status === 404) {
            // Course not found in live courses, try recorded courses
            console.log('🔄 Course not found in live courses, trying recorded courses...');
            isRecorded = true;
          }
        } catch (liveError) {
          console.log('🔄 Error fetching from live courses, trying recorded courses...', liveError);
          isRecorded = true;
        }
        
        // If not found in live courses, try recorded courses
        if (isRecorded || !courseResponse || courseResponse.status === 404) {
          try {
            console.log('📚 Fetching from recorded courses API...');
            const recordedCourseData = await recordedCoursesApi.get(params['id'] as string);
            console.log('✅ Recorded course data loaded:', recordedCourseData);
            console.log('💰 Course pricing:', { 
              price: recordedCourseData.price, 
              final_price: recordedCourseData.final_price,
              platform_commission: recordedCourseData.platform_commission_percentage 
            });
            console.log('📦 Units in recorded course:', recordedCourseData.units?.length || 0);
            console.log('🔒 Course visibility:', { is_hidden: recordedCourseData.is_hidden, status: recordedCourseData.status });
            
            // Check if course is hidden
            if (recordedCourseData.is_hidden) {
              console.error('❌ Course is hidden (is_hidden=true)');
              toast.error('الدورة غير متاحة حالياً');
              setLoading(false);
              return;
            }
            
            // Check if course is approved
            if (recordedCourseData.status !== 'approved') {
              console.error('❌ Course is not approved:', recordedCourseData.status);
              toast.error('الدورة لم تُعتمد بعد');
              setLoading(false);
              return;
            }
            
            setIsRecordedCourse(true);
            setRecordedCourse(recordedCourseData);
            
            // Extract all lessons from units
            const allLessonsFromUnits: Lesson[] = [];
            if (recordedCourseData.units && recordedCourseData.units.length > 0) {
              recordedCourseData.units.forEach((unit: any) => {
                if (unit.lessons && unit.lessons.length > 0) {
                  unit.lessons.forEach((lesson: any) => {
                    allLessonsFromUnits.push({
                      id: lesson.id,
                      title: lesson.title,
                      description: lesson.description,
                      order: lesson.order,
                      unit: unit.id,
                      learning_outcomes: lesson.learning_outcomes || '',
                      video_url: lesson.video_url,
                      created_at: lesson.created_at,
                      updated_at: lesson.updated_at,
                    });
                  });
                }
              });
            }
            
            console.log('📚 Total lessons extracted:', allLessonsFromUnits.length);
            
            // Transform recorded course to Course interface for compatibility
            const transformedCourse: Course = {
              id: recordedCourseData.id,
              title: recordedCourseData.title || '',
              description: recordedCourseData.description || '',
              learning_outcomes: recordedCourseData.learning_outcomes || '',
              topics: recordedCourseData.topics || '',
              course_type: 'individual' as any, // Recorded courses are typically individual
              course_type_display: 'دورة مسجلة',
              subjects: recordedCourseData.topics || '',
              intro_session_id: recordedCourseData.intro_session_id,
              thumbnail: recordedCourseData.thumbnail,
              cover_image: recordedCourseData.cover_image,
              max_students: '0', // Recorded courses don't have max students limit
              teacher: recordedCourseData.teacher,
              teacher_name: recordedCourseData.teacher_name || '',
              teacher_id: recordedCourseData.teacher_id,
              teacher_email: recordedCourseData.teacher_email,
              teacher_profile_image_url: recordedCourseData.teacher_profile_image_url,
              teacher_profile_image_thumbnail_url: recordedCourseData.teacher_profile_image_thumbnail_url,
              enrolled_count: 0, // TODO: Get enrolled count from API if available
              approval_status: recordedCourseData.status || 'pending',
              approval_status_display: recordedCourseData.approval_status_display || 
                                      (recordedCourseData.status === 'approved' ? 'معتمدة' : 
                                       recordedCourseData.status === 'pending' ? 'قيد الانتظار' : 
                                       recordedCourseData.status === 'rejected' ? 'مرفوضة' : 
                                       'قيد الانتظار'),
              status: recordedCourseData.status,
              approved_by: recordedCourseData.approved_by,
              approved_at: recordedCourseData.approved_at,
              rejection_reason: recordedCourseData.rejection_reason,
              is_published: recordedCourseData.status === 'approved' && !recordedCourseData.is_hidden,
              is_hidden: recordedCourseData.is_hidden,
              start_date: recordedCourseData.start_date,
              end_date: recordedCourseData.end_date,
              accepting_applications: recordedCourseData.accepting_applications,
              price: recordedCourseData.price, // Original price
              final_price: recordedCourseData.final_price, // Final price with platform commission
              batches_count: undefined,
              total_students: undefined,
              batches: undefined,
              created_at: recordedCourseData.created_at || '',
              updated_at: recordedCourseData.updated_at,
              lessons: allLessonsFromUnits, // All lessons from all units
              units: recordedCourseData.units?.map((unit: any) => ({
                id: unit.id,
                course: unit.course,
                title: unit.title,
                description: unit.description,
                order: unit.order,
                lessons: unit.lessons?.map((lesson: any) => ({
                  id: lesson.id,
                  title: lesson.title,
                  description: lesson.description,
                  order: lesson.order,
                  unit: unit.id,
                  learning_outcomes: lesson.learning_outcomes || '',
                  video_url: lesson.video_url,
                  bunny_video_id: lesson.bunny_video_id,
                  video_duration: lesson.video_duration,
                  video_size: lesson.video_size,
                  created_at: lesson.created_at,
                  updated_at: lesson.updated_at,
                })) || [],
                lesson_count: unit.lessons?.length || unit.lesson_count || 0,
                created_at: unit.created_at || '',
                updated_at: unit.updated_at || '',
              })) || [],
            };
            
            console.log('✅ Transformed recorded course:', {
              id: transformedCourse.id,
              title: transformedCourse.title,
              unitsCount: transformedCourse.units?.length || 0,
              lessonsCount: transformedCourse.lessons?.length || 0,
              status: transformedCourse.status,
            });
            
            // Calculate total video duration from all lessons
            let totalDuration = 0;
            if (transformedCourse.units && transformedCourse.units.length > 0) {
              transformedCourse.units.forEach((unit) => {
                if (unit.lessons && unit.lessons.length > 0) {
                  unit.lessons.forEach((lesson) => {
                    if (lesson.video_duration && typeof lesson.video_duration === 'number') {
                      totalDuration += lesson.video_duration;
                    }
                  });
                }
              });
            }
            setTotalVideoDuration(totalDuration);
            console.log('✅ Total video duration calculated:', totalDuration, 'seconds');
            
            setCourse(transformedCourse);
            setIsRecordedCourse(true); // Set isRecordedCourse before checking enrollment
            
            // Check enrollment status for recorded courses
            await checkEnrollmentStatus(transformedCourse.id, true);
            
            setLoading(false);
            return;
          } catch (recordedError: any) {
            console.error('❌ Error fetching recorded course:', recordedError);
            console.error('❌ Error details:', recordedError?.response || recordedError?.data);
            
            if (recordedError?.response?.status === 404 || 
                recordedError?.data?.detail?.includes('Not found') ||
                recordedError?.message?.includes('404')) {
              toast.error('الدورة غير موجودة');
              setLoading(false);
              return;
            }
            
            // If we get here and live course also failed, show error
            if (!courseResponse || courseResponse.status === 404) {
              toast.error('الدورة غير موجودة في الدورات المباشرة أو المسجلة');
              setLoading(false);
              return;
            }
            
            throw recordedError;
          }
        }
        
        // Continue with live course processing if found
        if (!courseResponse || !courseResponse.ok) {
          // Try to get error details from response
          let errorDetails = '';
          try {
            const errorText = await courseResponse?.clone().text() || '';
            errorDetails = errorText;
            console.error('❌ Error response body:', errorText);
            
            // Try to parse as JSON for structured error messages
            try {
              const errorJson = JSON.parse(errorText);
              console.error('❌ Error JSON:', errorJson);
              if (errorJson.detail) {
                errorDetails = errorJson.detail;
              } else if (errorJson.message) {
                errorDetails = errorJson.message;
              }
            } catch {
              // Not JSON, use text as-is
            }
          } catch (e) {
            console.error('❌ Could not read error response:', e);
          }
          
          if (courseResponse?.status === 401) {
            console.warn('⚠️ Unauthorized - this should not happen for public course viewing');
            // Don't redirect - allow public viewing. Show error instead.
            toast.error('حدث خطأ في تحميل الدورة. يرجى المحاولة مرة أخرى.');
            setLoading(false);
            return;
          } else if (courseResponse?.status === 404) {
            console.error('❌ Course not found (404) in both APIs');
            toast.error('الدورة غير موجودة');
            return;
          } else if (courseResponse?.status === 403) {
            console.error('❌ Forbidden (403)');
            toast.error('ليس لديك صلاحية لعرض هذه الدورة');
            return;
          } else {
            console.error(`❌ Unexpected error (${courseResponse?.status})`);
            throw new Error(`حدث خطأ في تحميل الدورة (${courseResponse?.status})`);
          }
        }

        const courseData: any = await courseResponse.json();
        console.log('✅ Course data loaded (RAW):', JSON.stringify(courseData, null, 2));
        console.log('📋 Available fields:', Object.keys(courseData));
        
        // Fetch units with lessons
        let units: Unit[] = [];
        let allLessons: Lesson[] = [];
        try {
          const { makeOptionalAuthRequest } = await import('@/lib/api/helpers');
          const unitsResponse = await makeOptionalAuthRequest(
            `/content/units/?course=${params['id']}`,
            {
              method: 'GET',
            }
          );
          
          if (unitsResponse.ok) {
            const unitsData = await unitsResponse.json();
            console.log('📦 Units data (RAW):', JSON.stringify(unitsData, null, 2));
            
            units = Array.isArray(unitsData) ? unitsData : (unitsData.results || []);
            console.log('✅ Units loaded:', units);
            console.log('📊 Units count:', units.length);
            
            // Log each unit with its lessons
            units.forEach((unit: Unit, index: number) => {
              console.log(`📚 Unit ${index + 1}:`, {
                id: unit.id,
                title: unit.title,
                lessonsCount: unit.lessons?.length || 0,
                lessons: unit.lessons
              });
            });
            
            // Flatten all lessons from all units for the LessonsSection component
            allLessons = units.flatMap(unit => 
              (unit.lessons || []).map((lesson: any) => ({
                ...lesson,
                unit: unit.id
              }))
            );
            console.log('✅ All lessons flattened:', allLessons);
            console.log('📊 Total lessons count:', allLessons.length);
          } else {
            const errorText = await unitsResponse.text();
            console.warn('⚠️ Failed to load units:', unitsResponse.status);
            console.warn('⚠️ Error details:', errorText);
          }
        } catch (unitsError) {
          console.error('❌ Error fetching units:', unitsError);
        }
        
        // Transform course data to match expected interface
        const transformedCourse: Course = {
          id: courseData.id,
          title: courseData.title || '',
          description: courseData.description || '',
          learning_outcomes: courseData.learning_outcomes || '',
          topics: courseData.topics || '',
          course_type: (courseData.course_type || 'individual') as any,
          course_type_display: courseData.course_type_display || 'مباشر',
          subjects: courseData.topics || courseData.subjects || '',
          intro_session_id: courseData.intro_session_id,
          thumbnail: courseData.thumbnail,
          cover_image: courseData.cover_image,
          max_students: courseData.batches_count?.toString() || courseData.max_students?.toString() || '0',
          teacher: typeof courseData.teacher === 'object' ? (courseData.teacher?.id || 0) : (courseData.teacher || 0),
          teacher_name: courseData.teacher_name || '',
          teacher_id: courseData.teacher_id,
          teacher_email: courseData.teacher_email,
          teacher_profile_image_url: courseData.teacher_profile_image_url || (typeof courseData.teacher === 'object' ? (courseData.teacher?.profile_image_url || courseData.teacher?.user?.profile_image_url) : null),
          teacher_profile_image_thumbnail_url: courseData.teacher_profile_image_thumbnail_url || (typeof courseData.teacher === 'object' ? (courseData.teacher?.profile_image_thumbnail_url || courseData.teacher?.user?.profile_image_thumbnail_url) : null),
          enrolled_count: parseInt(courseData.total_students || '0'),
          approval_status: courseData.approval_status || courseData.status || 'pending',
          approval_status_display: courseData.approval_status_display || 
                                  (courseData.status === 'approved' ? 'مقبولة' : 
                                   courseData.status === 'pending' ? 'قيد الانتظار' : 
                                   courseData.status === 'rejected' ? 'مرفوضة' : 
                                   courseData.status || 'قيد الانتظار'),
          status: courseData.status,
          approved_by: courseData.approved_by,
          approved_at: courseData.approved_at,
          rejection_reason: courseData.rejection_reason,
          is_published: courseData.is_published !== undefined ? courseData.is_published : (courseData.status === 'approved'),
          is_hidden: courseData.is_hidden,
          start_date: courseData.start_date,
          end_date: courseData.end_date,
          accepting_applications: courseData.accepting_applications,
          batches_count: courseData.batches_count?.toString(),
          total_students: courseData.total_students?.toString(),
          batches: courseData.batches?.toString(),
          created_at: courseData.created_at || '',
          updated_at: courseData.updated_at,
          lessons: allLessons,
          units: units,
        };
        
        console.log('✅ Transformed course data:', transformedCourse);
        console.log('📊 Course summary:', {
          hasTitle: !!transformedCourse.title,
          hasDescription: !!transformedCourse.description,
          hasLearningOutcomes: !!transformedCourse.learning_outcomes && transformedCourse.learning_outcomes !== transformedCourse.description,
          hasSubjects: !!transformedCourse.subjects && transformedCourse.subjects !== transformedCourse.description,
          hasTrialSession: !!transformedCourse.trial_session_url,
          hasLessons: (transformedCourse.lessons?.length ?? 0) > 0,
          lessonsCount: transformedCourse.lessons?.length ?? 0,
        });
        
        setCourse(transformedCourse);
        
        // Check if user is already enrolled (for live courses)
        await checkEnrollmentStatus(transformedCourse.id, false);
      } catch (error: any) {
        console.error('❌ Error fetching course:', error);
        
        if (error?.response?.status === 401) {
          console.warn('⚠️ Unauthorized - this should not happen for public course viewing');
          // Don't redirect - allow public viewing. Show error instead.
          toast.error('حدث خطأ في تحميل الدورة. يرجى المحاولة مرة أخرى.');
          setLoading(false);
          return;
        } else if (error?.response?.status === 404) {
          toast.error('الدورة غير موجودة');
        } else if (error?.response?.status === 403) {
          toast.error('ليس لديك صلاحية لعرض هذه الدورة');
        } else {
          toast.error(error?.message || 'حدث خطأ في تحميل الدورة');
        }
      } finally {
        setLoading(false);
      }
    };

    if (params['id']) {
      fetchCourse();
    }
  }, [params['id']]);

  const handleEnroll = async () => {
    console.log('🎓 handleEnroll called');
    if (!course) {
      console.log('❌ No course found');
      return;
    }
    
    // Check if user is actually authenticated (not just token exists)
    try {
      const { simpleAuthService } = await import('@/lib/auth/simpleAuth');
      simpleAuthService.initialize();
      
      const isAuthenticated = simpleAuthService.isAuthenticated();
      const accessToken = simpleAuthService.getAccessToken();
      
      console.log('🔑 Auth check:', { 
        isAuthenticated,
        hasValidToken: !!accessToken,
        hasUser: !!simpleAuthService.getUser()
      });
      
      if (!isAuthenticated || !accessToken) {
        // User is not logged in or token is invalid - show register prompt modal
        console.log('👤 User not authenticated or token invalid, showing register prompt modal');
        setShowRegisterPromptModal(true);
        return;
      }
      
      console.log('📚 Course type:', course.course_type);
      
      // User is authenticated - redirect to enrollment page
      console.log('🔄 Redirecting to enrollment page');
      router.push(`/course/${params['id']}/enroll`);
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      // On error, show register modal to be safe
      setShowRegisterPromptModal(true);
    }
  };

  const checkEnrollmentStatus = async (courseId: string, isRecorded?: boolean) => {
    try {
      // Determine if this is a recorded course
      // Priority: parameter > state > course data
      const currentCourse = course || recordedCourse;
      const isRecordedType = isRecorded !== undefined 
        ? isRecorded 
        : isRecordedCourse || currentCourse?.course_type_display === 'دورة مسجلة';
      
      console.log('🔍 Checking enrollment status:', {
        courseId,
        isRecordedType,
        isRecordedCourse,
        courseTypeDisplay: currentCourse?.course_type_display,
      });
      
      if (isRecordedType) {
        // For recorded courses, check enrollment using recorded-courses enrollments API
        const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        
        if (!token) {
          console.log('❌ No token found, user is not authenticated');
          setIsEnrolled(false);
          return;
        }
        
        try {
          // Fetch enrollments for the current student
          // Backend automatically filters by current user's student_profile
          const response = await fetch(
            `${API_BASE_URL}/recorded-courses/enrollments/`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            const enrollments = data.results || [];
            
            console.log('📋 All enrollments for current student:', {
              enrollmentsCount: enrollments.length,
              enrollments: enrollments.map((e: any) => ({
                id: e.id,
                course: typeof e.course === 'string' ? e.course : e.course?.id || e.course,
                status: e.status,
                courseTitle: e.course_title,
              })),
            });
            
            // Check if there's an active enrollment for this course
            const hasActiveEnrollment = enrollments.some((enrollment: any) => {
              // Extract course ID from enrollment
              let enrollmentCourseId: string | null = null;
              
              if (typeof enrollment.course === 'string') {
                enrollmentCourseId = enrollment.course;
              } else if (enrollment.course && typeof enrollment.course === 'object') {
                enrollmentCourseId = enrollment.course.id || enrollment.course;
              } else if (enrollment.course) {
                enrollmentCourseId = String(enrollment.course);
              }
              
              // Normalize course IDs for comparison (remove any whitespace, convert to lowercase)
              const normalizedEnrollmentCourseId = enrollmentCourseId?.toString().trim().toLowerCase() || '';
              const normalizedCourseId = courseId?.toString().trim().toLowerCase() || '';
              
              const courseMatches = normalizedEnrollmentCourseId === normalizedCourseId;
              const isActive = enrollment.status === 'active';
              
              const matches = courseMatches && isActive;
              
              console.log('🔍 Checking enrollment:', {
                enrollmentId: enrollment.id,
                enrollmentCourseId: enrollmentCourseId,
                enrollmentCourseIdNormalized: normalizedEnrollmentCourseId,
                courseId: courseId,
                courseIdNormalized: normalizedCourseId,
                courseMatches,
                status: enrollment.status,
                isActive,
                match: matches,
                courseTitle: enrollment.course_title,
              });
              
              return matches;
            });
            
            setIsEnrolled(hasActiveEnrollment);
            console.log('📋 Recorded course enrollment status:', hasActiveEnrollment ? '✅ Enrolled' : '❌ Not enrolled', {
              courseId,
              enrollmentsCount: enrollments.length,
              hasActiveEnrollment,
            });
            
            if (!hasActiveEnrollment && enrollments.length > 0) {
              console.warn('⚠️ User has enrollments but not for this course:', {
                courseId,
                enrollments: enrollments.map((e: any) => ({
                  id: e.id,
                  course: typeof e.course === 'string' ? e.course : e.course?.id || e.course,
                  status: e.status,
                  courseTitle: e.course_title,
                })),
              });
            }
          } else if (response.status === 404 || response.status === 403) {
            // No enrollments found or not authorized - user is not enrolled
            console.log('📋 No enrollments found or not authorized (404/403)');
            setIsEnrolled(false);
          } else {
            console.error('❌ Failed to check recorded course enrollment:', response.status, response.statusText);
            setIsEnrolled(false);
          }
        } catch (error) {
          console.error('❌ Error checking recorded course enrollment:', error);
          setIsEnrolled(false);
        }
        return;
      }
      
      // For live courses, use the existing enrollment check
      // Only check enrollment if user is authenticated
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        console.log('📋 No token found, skipping enrollment check');
        setIsEnrolled(false);
        return;
      }
      
      const { makeOptionalAuthRequest } = await import('@/lib/api/helpers');
      const response = await makeOptionalAuthRequest(
        `/live-education/enrollments/?course=${courseId}`,
        {
        method: 'GET',
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const isEnrolled = data.results && data.results.length > 0;
        setIsEnrolled(isEnrolled);
        console.log('📋 Enrollment status:', isEnrolled ? 'Enrolled' : 'Not enrolled');
      }
    } catch (error) {
      console.error('❌ Error checking enrollment status:', error);
    }
  };

  const handleFamilyEnrollSubmit = async (familyName: string, members: FamilyMember[], notes: string) => {
    if (!course) return;
    
    // Validation
    if (!familyName.trim()) {
      toast.error('يرجى إدخال اسم العائلة');
      return;
    }
    
    const validMembers = members.filter(member => 
      member.student_name.trim() && member.student_email.trim()
    );
    
    if (validMembers.length === 0) {
      toast.error('يرجى إدخال بيانات عضو واحد على الأقل');
      return;
    }
    
    if (validMembers.length > 5) {
      toast.error('الحد الأقصى 5 أعضاء للعائلة الواحدة');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (validMembers.some(member => !emailRegex.test(member.student_email))) {
      toast.error('يرجى إدخال عناوين بريد إلكتروني صحيحة لجميع أعضاء العائلة');
      return;
    }
    
    try {
      setEnrolling(true);
      const loadingToast = toast.loading('جاري تسجيل طلب التعليم العائلي...');
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.dismiss(loadingToast);
        toast.error('يرجى تسجيل الدخول أولاً');
        return;
      }
      
      // Prepare family enrollment request
      const familyRequest = {
        family_name: familyName.trim(),
        course: course.id,
        requested_members: validMembers.map(member => ({
          student_name: member.student_name.trim(),
          student_email: member.student_email.trim(),
          relationship: member.relationship,
          notes: member.notes.trim() || ""
        }))
      };
      
      logger.debug('Submitting family enrollment request', { familyRequest });
      const response = await apiClient.post('/live-education/family-requests/', familyRequest);
      
      toast.dismiss(loadingToast);
      
      if (response.success) {
        const familyRequestData = response.data;
        logger.debug('Family enrollment request successful', { familyRequestData });
        
        toast.success('تم إرسال طلب التسجيل العائلي بنجاح! 🎉', {
          duration: 6000,
          description: `تم تسجيل ${validMembers.length} أعضاء من عائلة "${familyName}". سيتم مراجعة طلبكم قريباً`
        });
        
        // Mark as enrolled and close modal
        setIsEnrolled(true);
        setShowFamilyEnrollModal(false);
      } else {
        const errorData = response.error || response.data || { detail: 'حدث خطأ غير متوقع' };
        logger.error('Family enrollment request failed', { error: errorData, status: response.status });
        
        if (response.status === 401) {
          showErrorModalWithDetails(
            'انتهت صلاحية الجلسة',
            'انتهت صلاحية جلسة العمل الخاصة بك. يرجى تسجيل الدخول مرة أخرى للمتابعة.',
            ['تأكد من تسجيل الدخول بشكل صحيح', 'إذا استمرت المشكلة، امسح الكوكيز وأعد المحاولة']
          );
          setTimeout(() => router.push('/login'), 3000);
        } else if (response.status === 400) {
          const errorDetails: string[] = [];
          let mainMessage = 'يرجى تصحيح الأخطاء التالية:';
          
          // Handle family_name errors
          if (errorData.family_name) {
            if (Array.isArray(errorData.family_name)) {
              errorData.family_name.forEach((error: string) => {
                const translatedError = translateErrorMessage(error);
                errorDetails.push(`اسم العائلة: ${translatedError}`);
              });
            } else {
              const translatedError = translateErrorMessage(errorData.family_name);
              errorDetails.push(`اسم العائلة: ${translatedError}`);
            }
          }
          
          // Handle requested_members errors
          if (errorData.requested_members) {
            if (Array.isArray(errorData.requested_members)) {
              errorData.requested_members.forEach((memberError: any, index: number) => {
                if (typeof memberError === 'object' && memberError !== null) {
                  // Handle object errors for specific members
                  Object.keys(memberError).forEach(field => {
                    const fieldErrors = Array.isArray(memberError[field]) ? memberError[field] : [memberError[field]];
                    fieldErrors.forEach((error: string) => {
                      const translatedError = translateErrorMessage(error);
                      errorDetails.push(`عضو ${index + 1} - ${getFieldDisplayName(field)}: ${translatedError}`);
                    });
                  });
                } else {
                  errorDetails.push(`بيانات الأعضاء: ${memberError}`);
                }
              });
            } else {
              errorDetails.push(`بيانات الأعضاء: ${errorData.requested_members}`);
            }
          }
          
          // Handle other field errors
          Object.keys(errorData).forEach(key => {
            if (key !== 'family_name' && key !== 'requested_members' && key !== 'detail') {
              const fieldError = errorData[key];
              if (Array.isArray(fieldError)) {
                fieldError.forEach((error: string) => {
                  const translatedError = translateErrorMessage(error);
                  errorDetails.push(`${getFieldDisplayName(key)}: ${translatedError}`);
                });
              } else if (fieldError) {
                const translatedError = translateErrorMessage(fieldError);
                errorDetails.push(`${getFieldDisplayName(key)}: ${translatedError}`);
              }
            }
          });
          
          // Handle general detail
          if (errorData.detail) {
            const translatedDetail = translateErrorMessage(errorData.detail);
            errorDetails.push(translatedDetail);
          }
          
          if (errorDetails.length === 0) {
            errorDetails.push('يرجى التحقق من صحة البيانات المدخلة');
          }
          
          showErrorModalWithDetails(
            'خطأ في البيانات',
            mainMessage,
            errorDetails
          );
        } else if (response.status === 403) {
          showErrorModalWithDetails(
            'غير مسموح',
            'ليس لديك صلاحية للتسجيل في هذه الدورة.',
            ['تأكد من أنك مسجل دخول بحساب صحيح', 'اتصل بالدعم الفني إذا كنت تعتقد أن هذا خطأ']
          );
        } else if (response.status === 404) {
          showErrorModalWithDetails(
            'الدورة غير موجودة',
            'الدورة التي تحاول التسجيل فيها غير موجودة أو تم حذفها.',
            ['تأكد من صحة رابط الدورة', 'جرب تحديث الصفحة', 'اتصل بالدعم الفني إذا استمرت المشكلة']
          );
        } else {
          showErrorModalWithDetails(
            'خطأ في الخادم',
            'حدث خطأ غير متوقع أثناء إرسال طلب التسجيل.',
            ['جرب مرة أخرى بعد قليل', 'تأكد من اتصال الإنترنت', 'اتصل بالدعم الفني إذا استمرت المشكلة']
          );
        }
      }
    } catch (error) {
      console.error('❌ Error submitting family request:', error);
      toast.error('حدث خطأ في إرسال طلب التسجيل العائلي');
    } finally {
      setEnrolling(false);
    }
  };

  const getFieldDisplayName = (fieldName: string): string => {
    const fieldTranslations: { [key: string]: string } = {
      'student_name': 'الاسم الكامل',
      'student_email': 'البريد الإلكتروني',
      'relationship': 'صلة القرابة',
      'notes': 'ملاحظات',
      'family_name': 'اسم العائلة',
      'requested_members': 'بيانات الأعضاء',
      'course': 'الدورة',
      'non_field_errors': 'أخطاء عامة'
    };
    
    return fieldTranslations[fieldName] || fieldName;
  };

  const translateErrorMessage = (errorMessage: string): string => {
    const errorTranslations: { [key: string]: string } = {
      'Student is already part of another family': 'هذا الطالب مسجل بالفعل في عائلة أخرى',
      'This field is required.': 'هذا الحقل مطلوب',
      'Enter a valid email address.': 'يرجى إدخال عنوان بريد إلكتروني صحيح',
      'This email is already registered.': 'هذا البريد الإلكتروني مسجل بالفعل',
      'Invalid email format.': 'تنسيق البريد الإلكتروني غير صحيح',
      'Name must be at least 2 characters long.': 'الاسم يجب أن يكون حرفين على الأقل',
      'Family name already exists.': 'اسم العائلة موجود بالفعل',
      'Maximum 5 family members allowed.': 'الحد الأقصى 5 أعضاء للعائلة الواحدة',
      'Course is full.': 'الدورة ممتلئة',
      'Course not available for enrollment.': 'الدورة غير متاحة للتسجيل',
      'Invalid course ID.': 'معرف الدورة غير صحيح',
      'Enrollment period has ended.': 'انتهت فترة التسجيل',
      'Student already enrolled in this course.': 'الطالب مسجل بالفعل في هذه الدورة',
      'Family already enrolled in this course.': 'العائلة مسجلة بالفعل في هذه الدورة',
      'Invalid relationship type.': 'نوع صلة القرابة غير صحيح',
      'Notes too long.': 'الملاحظات طويلة جداً',
      'Invalid family name format.': 'تنسيق اسم العائلة غير صحيح',
      'Student email already exists in this family.': 'البريد الإلكتروني موجود بالفعل في هذه العائلة',
      'Duplicate student names in family.': 'أسماء مكررة في العائلة',
      'Family name cannot be empty.': 'اسم العائلة لا يمكن أن يكون فارغاً',
      'At least one family member required.': 'مطلوب عضو واحد على الأقل في العائلة'
    };
    
    // Check for exact match first
    if (errorTranslations[errorMessage]) {
      return errorTranslations[errorMessage];
    }
    
    // Check for partial matches
    for (const [english, arabic] of Object.entries(errorTranslations)) {
      if (errorMessage.includes(english)) {
        return errorMessage.replace(english, arabic);
      }
    }
    
    // Return original message if no translation found
    return errorMessage;
  };

  const showErrorModalWithDetails = (title: string, message: string, details?: string[]) => {
    setErrorDetails({ title, message, details });
    setShowErrorModal(true);
  };


  const handleLessonClick = async (lessonId: string | number) => {
    try {
      console.log('🔍 Fetching lesson details for ID:', lessonId);
      console.log('🔍 Is recorded course:', isRecordedCourse);
      console.log('🔍 Current selectedLesson before:', selectedLesson);
      
      // First try to find in local lessons array
      const localLesson = course?.lessons?.find(l => l.id === lessonId);
      if (localLesson) {
        console.log('✅ Lesson found locally:', localLesson);
        setSelectedLesson(localLesson);
        return;
      }
      
      // If not found locally, fetch from API
      // Use different endpoint for recorded courses
      const endpoint = isRecordedCourse 
        ? `/recorded-courses/lessons/${lessonId}/`
        : `/content/lessons/${lessonId}/`;
      
      const { makeOptionalAuthRequest } = await import('@/lib/api/helpers');
      const response = await makeOptionalAuthRequest(endpoint, {
        method: 'GET',
      });
      
      console.log('🔍 API Response:', response);
      
      if (response.ok) {
        const lessonData = await response.json();
        console.log('✅ Lesson data loaded:', lessonData);
        
        // Transform lesson data to match our interface
        const transformedLesson: Lesson = {
          id: lessonData.id,
          title: lessonData.title || '',
          description: lessonData.description || '',
          order: lessonData.order || 0,
          unit: lessonData.unit,
          learning_outcomes: lessonData.learning_outcomes || '',
          video_url: lessonData.video_url,
          bunny_video_id: lessonData.bunny_video_id,
          video_duration: lessonData.video_duration,
          video_size: lessonData.video_size,
          created_at: lessonData.created_at || '',
          updated_at: lessonData.updated_at || '',
        };
        
        setSelectedLesson(transformedLesson);
        console.log('🔍 selectedLesson state updated to:', transformedLesson);
      } else {
        console.error('❌ Error fetching lesson:', response.status);
        toast.error('فشل في جلب تفاصيل الدرس');
      }
    } catch (error: any) {
      console.error('❌ Error fetching lesson:', error);
      
      // For recorded courses, if API fails, try to get from units
      if (isRecordedCourse && course?.units) {
        for (const unit of course.units) {
          const lesson = unit.lessons?.find((l: any) => l.id === lessonId);
          if (lesson) {
            console.log('✅ Found lesson in units:', lesson);
            setSelectedLesson(lesson);
            return;
          }
        }
      }
      
      toast.error('حدث خطأ في جلب تفاصيل الدرس');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 dark:border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-300 text-lg">جاري تحميل الدورة...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">الدورة غير موجودة</h1>
          <p className="text-gray-600 dark:text-slate-400 mb-6">الدورة التي تبحث عنها غير موجودة أو تم حذفها</p>
          <button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            العودة للصفحة السابقة
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-yellow-50/20 to-orange-50/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20 transition-colors duration-300">
        <main>
          {/* Course Hero Section */}
          <CourseHero
            course={course}
            isEnrolled={isEnrolled}
            enrolling={enrolling}
            onEnroll={handleEnroll}
            totalVideoDuration={isRecordedCourse ? totalVideoDuration : undefined}
            isRecordedCourse={isRecordedCourse}
            courseId={params['id'] as string}
          />

          {/* Course Content */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <CourseInfo course={course} />
                {course.units && course.units.length > 0 ? (
                  <UnitsSection
                    units={course.units}
                    onLessonClick={handleLessonClick}
                    selectedLesson={selectedLesson}
                    isRecordedCourse={isRecordedCourse}
                  />
                ) : (
                  <LessonsSection
                    lessons={course.lessons || []}
                    onLessonClick={handleLessonClick}
                    selectedLesson={selectedLesson}
                    isRecordedCourse={isRecordedCourse}
                  />
                )}
              </div>

              {/* Right Sidebar - Additional Info */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">

                  {/* Course Details Card */}
                  <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 transition-colors duration-300">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-4">تفاصيل الدورة</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">نوع الدورة</span>
                        <span className="font-medium text-gray-900 dark:text-slate-200">{course.course_type_display}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">عدد الدروس</span>
                        <span className="font-medium text-gray-900 dark:text-slate-200">{course.lessons?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">الطلاب المسجلين</span>
                        <span className="font-medium text-gray-900 dark:text-slate-200">{course.enrolled_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">المدة</span>
                        <span className="font-medium text-gray-900 dark:text-slate-200">
                          {isRecordedCourse && totalVideoDuration > 0 ? (() => {
                            const totalMinutes = Math.round(totalVideoDuration / 60);
                            const hours = Math.floor(totalMinutes / 60);
                            const minutes = totalMinutes % 60;
                            if (hours > 0) {
                              return minutes > 0 ? `${hours} ساعة ${minutes} دقيقة` : `${hours} ساعة`;
                            } else {
                              return `${minutes} دقيقة`;
                            }
                          })() : 'محددة حسب الدروس'}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </main>

      {/* Family Enrollment Modal */}
      <FamilyEnrollmentModal
        isOpen={showFamilyEnrollModal}
        onClose={() => setShowFamilyEnrollModal(false)}
        onSubmit={handleFamilyEnrollSubmit}
        courseTitle={course?.title}
        enrolling={enrolling}
      />

      {/* Course Enrollment Modal */}
      {course && (
        <CourseEnrollmentModal
          isOpen={showCourseEnrollModal}
          onClose={() => {
            console.log('🚪 Closing course enrollment modal');
            setShowCourseEnrollModal(false);
          }}
          course={course}
          onSuccess={() => {
            console.log('✅ Enrollment successful');
            setIsEnrolled(true);
            setShowCourseEnrollModal(false);
          }}
        />
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorDetails?.title || ''}
        message={errorDetails?.message || ''}
        details={errorDetails?.details}
        onLogin={() => router.push('/login')}
        showLoginButton={errorDetails?.title === 'انتهت صلاحية الجلسة'}
      />

      {/* Register Prompt Modal */}
      <RegisterPromptModal
        isOpen={showRegisterPromptModal}
        onClose={() => setShowRegisterPromptModal(false)}
        courseTitle={course?.title}
      />
      </div>
  );
};

export default CourseDetailsPage;
