import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, BookOpen, Clock, Users, Star, Calendar, User, Mail, Award, ChevronDown, ChevronUp, FileText, CheckCircle, AlertTriangle, RefreshCw, Play, FlaskConical, UserCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { simpleAuthService } from '@/lib/auth/simpleAuth';
import { getAuthToken } from '@/lib/auth';
import { batchesApi } from '@/lib/api/batches';
import { knowledgeLabApi } from '@/lib/api/knowledge-lab';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

interface Lesson {
  id: number | string;
  title: string;
  description: string;
  order: number;
  duration_minutes?: number;
  video_duration?: number;
  video_url?: string;
  bunny_video_id?: string;
  unit_title?: string;
  created_at: string;
  updated_at: string;
}

interface CourseDetails {
  id: string;
  title: string;
  description: string;
  learning_outcomes: string;
  course_type: 'individual' | 'family' | 'group_private' | 'group_public';
  course_type_display: string;
  subjects: string;
  trial_session_url: string;
  max_students: string;
  teacher: number;
  teacher_name: string;
  teacher_email: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_status_display: string;
  approved_by: number;
  approved_by_name: string;
  approved_at: string;
  rejection_reason: string;
  is_published: boolean;
  lessons: Lesson[];
  units?: any[];
  total_lessons?: number;
  enrolled_count: string;
  available_spots: string;
  created_at: string;
  updated_at: string;
}

interface CourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  onApprove?: (course: any, notes?: string) => void;
  onReject?: (course: any, reason?: string) => void;
}

export const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  isOpen,
  onClose,
  course,
  onApprove,
  onReject,
}) => {
  const router = useRouter();
  const [showLessons, setShowLessons] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [platformCommission, setPlatformCommission] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [expandedVideos, setExpandedVideos] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Batches and Knowledge Lab states
  const [batches, setBatches] = useState<any[]>([]);
  const [knowledgeLab, setKnowledgeLab] = useState<any | null>(null);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingKnowledgeLab, setLoadingKnowledgeLab] = useState(false);
  const [showBatches, setShowBatches] = useState(false);
  const [showKnowledgeLab, setShowKnowledgeLab] = useState(false);

  useEffect(() => {
    console.log('🚀 CourseDetailsModal: useEffect triggered!', { isOpen, courseId: course?.id });
    
    // Reset courseDetails when modal closes or course changes
      if (!isOpen || !course?.id) {
        console.log('⚠️ CourseDetailsModal: Modal closed or no course ID', { isOpen, courseId: course?.id });
      setCourseDetails(null);
        return;
      }
    
    const loadCourseWithLessons = async () => {
      // Reset courseDetails to null first to clear previous course data
      setCourseDetails(null);
      
      console.log('✅ CourseDetailsModal: Starting to load course details for:', course.id);
      console.log('🎯 CourseDetailsModal: Course data:', course);
      
      try {
        // Initialize simpleAuthService if not already initialized
        simpleAuthService.initialize();
        
        // Get a valid access token (will refresh if needed)
        let validToken = await simpleAuthService.getValidAccessToken();
        
        // Fallback to getAuthToken if simpleAuthService fails
        if (!validToken) {
          console.warn('⚠️ CourseDetailsModal: simpleAuthService failed, trying getAuthToken fallback');
          validToken = getAuthToken();
        }
        
        if (!validToken) {
          console.error('❌ CourseDetailsModal: Failed to get valid access token');
          setCourseDetails({
            ...course,
            lessons: course.lessons || [],
            total_lessons: (course.lessons || []).length
          });
          return;
        }
        
        console.log('✅ CourseDetailsModal: Got valid access token');
        
        // Check if it's a recorded course or live course
        const isRecordedCourse = 'units_count' in course || 'total_lessons' in course || 'price' in course;
        const isLiveCourse = !isRecordedCourse;
        
        console.log('🔍 CourseDetailsModal: Course type detection:', {
          isRecordedCourse,
          isLiveCourse,
          hasUnitsCount: 'units_count' in course,
          hasTotalLessons: 'total_lessons' in course,
          hasPrice: 'price' in course,
          courseKeys: Object.keys(course)
        });
        
        if (isLiveCourse) {
          // For live courses, fetch lessons from content API
          console.log('🔍 CourseDetailsModal: Fetching live course lessons...');
          
          // Fetch lessons for this course from content API (lessons moved to content_courses app)
          // Use unit__course filter instead of course to properly filter by course ID
          const lessonsUrl = `${API_BASE_URL}/content/lessons/?unit__course=${course.id}`;
          console.log('🌐 CourseDetailsModal: Fetching lessons -> GET', lessonsUrl);
          
          const lessonsResponse = await fetch(lessonsUrl, {
            headers: {
              'Authorization': `Bearer ${validToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('📡 CourseDetailsModal: Lessons Response Status:', lessonsResponse.status);
          
          let lessons = [];
          if (lessonsResponse.ok) {
            const lessonsData = await lessonsResponse.json();
            console.log('✅ CourseDetailsModal: Lessons Data:', lessonsData);
            lessons = lessonsData.results || lessonsData || [];
            console.log('📚 CourseDetailsModal: Lessons count:', lessons.length);
            console.log('🔍 CourseDetailsModal: Course ID being fetched:', course.id);
            
            if (lessons.length > 0) {
              console.log('📖 CourseDetailsModal: Lessons in live course:');
              lessons.forEach((lesson: any, idx: number) => {
                console.log(`  ${idx + 1}. ${lesson.title}`, {
                  id: lesson.id,
                  order: lesson.order,
                  duration_minutes: lesson.duration_minutes,
                  unit: lesson.unit,
                  unit_type: typeof lesson.unit
                });
              });
            } else {
              console.warn(`⚠️ CourseDetailsModal: No lessons found for course ${course.id}`);
            }
          } else {
            console.error('❌ CourseDetailsModal: Lessons API failed with status:', lessonsResponse.status);
            const errorText = await lessonsResponse.text();
            console.error('❌ Error response:', errorText);
          }
          
          console.log('🔍 CourseDetailsModal: Setting courseDetails with course.id:', course.id, 'and', lessons.length, 'lessons');
          setCourseDetails({
            ...course,
            lessons: lessons,
            total_lessons: lessons.length
          });
        } else if (isRecordedCourse) {
          console.log('🔍 CourseDetailsModal: Fetching course units with lessons...');
          console.log('🔍 CourseDetailsModal: Course ID type:', typeof course.id, 'Value:', course.id);
          
          // First, get units list for this course
          const unitsListUrl = `${API_BASE_URL}/recorded-courses/units/?course=${course.id}`;
          console.log('🔍 CourseDetailsModal: Fetching units list from API:', unitsListUrl);
          
          const unitsListResponse = await fetch(unitsListUrl, {
            headers: {
              'Authorization': `Bearer ${validToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('🔍 CourseDetailsModal: Units List API Response status:', unitsListResponse.status);
          
          if (unitsListResponse.ok) {
            const unitsListData = await unitsListResponse.json();
            console.log('🔍 CourseDetailsModal: Units List API response:', unitsListData);
            console.log('🔍 CourseDetailsModal: Total units found:', unitsListData.count);
            console.log('🔍 CourseDetailsModal: Units array:', unitsListData.results);
            
            // ⚠️ CRITICAL CHECK
            if (unitsListData.count === 0 || !unitsListData.results || unitsListData.results.length === 0) {
              console.error('❌❌❌ CourseDetailsModal: NO UNITS FOUND IN DATABASE! ❌❌❌');
              console.error('📌 Course ID:', course.id);
              console.error('📌 Course Title:', course.title);
              console.error('📌 This means:');
              console.error('   1. الدورة لم يتم إنشاء وحدات لها في قاعدة البيانات');
              console.error('   2. أو الوحدات تم حذفها');
              console.error('   3. أو الوحدات مرتبطة بـ course ID مختلف');
              console.error('📌 Solution: افحص قاعدة البيانات مباشرة أو أعد رفع الدورة');
              
              // Set empty lessons
              setCourseDetails({
                ...course,
                lessons: [],
                units: [],
                total_lessons: 0
              });
              return;
            }
            
            // Now get detailed unit info with lessons for each unit
            const allLessons = [];
            const unitsWithLessons = [];
            
            console.log('� CourseDetailsModal: Processing', unitsListData.results?.length || 0, 'units...');
            
            for (const unit of unitsListData.results || []) {
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('🔍 CourseDetailsModal: Processing unit:', {
                id: unit.id,
                title: unit.title,
                order: unit.order,
                course: unit.course
              });
              
              // Use GET /recorded-courses/units/{id}/ API to get unit with lessons
              const unitDetailsUrl = `${API_BASE_URL}/recorded-courses/units/${unit.id}/`;
              console.log('🌐 CourseDetailsModal: API Call -> GET', unitDetailsUrl);
              
              const unitDetailsResponse = await fetch(unitDetailsUrl, {
                headers: {
                  'Authorization': `Bearer ${validToken}`,
                  'Content-Type': 'application/json',
                },
              });
              
              console.log('📡 CourseDetailsModal: Response Status:', unitDetailsResponse.status, unitDetailsResponse.statusText);
              
              if (unitDetailsResponse.ok) {
                const unitDetailsData = await unitDetailsResponse.json();
                console.log('✅ CourseDetailsModal: Unit Details Response:', unitDetailsData);
                console.log('� CourseDetailsModal: Unit has', unitDetailsData.lessons?.length || 0, 'lessons');
                
                if (unitDetailsData.lessons && unitDetailsData.lessons.length > 0) {
                  console.log('� CourseDetailsModal: Lessons in this unit:');
                  unitDetailsData.lessons.forEach((lesson: any, idx: number) => {
                    console.log(`  ${idx + 1}. ${lesson.title}`, {
                      id: lesson.id,
                      order: lesson.order,
                      bunny_video_id: lesson.bunny_video_id,
                      video_duration: lesson.video_duration,
                      video_url: lesson.video_url
                    });
                  });
                }
                
                unitsWithLessons.push(unitDetailsData);
                allLessons.push(...(unitDetailsData.lessons || []));
              } else {
                const errorText = await unitDetailsResponse.text();
                console.error('❌ CourseDetailsModal: Unit details API failed!');
                console.error('   Status:', unitDetailsResponse.status);
                console.error('   Error:', errorText);
              }
            }
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('� CourseDetailsModal: SUMMARY');
            console.log('   Total Units:', unitsWithLessons.length);
            console.log('   Total Lessons:', allLessons.length);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🗂️ All Units with Lessons:', unitsWithLessons);
            console.log('� All Lessons:', allLessons);
            
            setCourseDetails({
              ...course,
              lessons: allLessons,
              units: unitsWithLessons,
              total_lessons: allLessons.length
            });
          } else {
            console.error('🔍 CourseDetailsModal: Units List API call failed with status:', unitsListResponse.status);
            const errorText = await unitsListResponse.text();
            console.error('🔍 CourseDetailsModal: Units List API Error response:', errorText);
            // Fallback to course prop if API call fails
            setCourseDetails({
              ...course,
              lessons: course.lessons || [],
              total_lessons: (course.lessons || []).length
            });
          }
        } else {
          console.log('🔍 CourseDetailsModal: Live course, using data directly');
          // For live courses, use data directly
          setCourseDetails({
            ...course,
            lessons: course.lessons || [],
            total_lessons: (course.lessons || []).length
          });
        }
      } catch (error) {
        console.error('🔍 CourseDetailsModal: Error loading course details:', error);
        // Fallback to course prop with default lessons array
        setCourseDetails({
          ...course,
          lessons: course.lessons || [],
          total_lessons: (course.lessons || []).length
        });
      }
    };
    
    loadCourseWithLessons();
  }, [isOpen, course?.id]);

  // Load batches and knowledge lab for approved live courses
  useEffect(() => {
    const loadBatchesAndKnowledgeLab = async () => {
      if (!isOpen || !course?.id) {
        setBatches([]);
        setKnowledgeLab(null);
        return;
      }

      // Only load for approved live courses
      const isLiveCourse = !('units_count' in course || 'total_lessons' in course || 'price' in course);
      const isApproved = course.approval_status === 'approved';

      if (isLiveCourse && isApproved) {
        try {
          // Initialize simpleAuthService if not already initialized
          simpleAuthService.initialize();
          
          // Get a valid access token (will refresh if needed)
          let validToken = await simpleAuthService.getValidAccessToken();
          
          // Fallback to getAuthToken if simpleAuthService fails
          if (!validToken) {
            console.warn('⚠️ CourseDetailsModal: simpleAuthService failed, trying getAuthToken fallback');
            validToken = getAuthToken();
          }
          
          if (!validToken) {
            console.error('❌ CourseDetailsModal: Failed to get valid access token for batches');
            return;
          }

          // Load batches
          setLoadingBatches(true);
          try {
            const batchesResponse = await batchesApi.list({ course: course.id });
            setBatches(batchesResponse.results || []);
          } catch (error) {
            console.error('Error loading batches:', error);
            setBatches([]);
          } finally {
            setLoadingBatches(false);
          }

          // Load knowledge lab - fetch all labs and filter by object_id
          setLoadingKnowledgeLab(true);
          try {
            // Get teacher ID from course
            const teacherId = course.teacher || (typeof course.teacher === 'object' ? course.teacher?.id : null);
            
            // Fetch labs for this teacher
            const labsResponse = await knowledgeLabApi.listLabs({ 
              teacher: teacherId,
              is_standalone: false // Only get labs linked to courses
            });
            const labs = labsResponse.data?.results || [];
            
            // Filter labs by object_id matching course.id
            const courseLab = labs.find((lab: any) => lab.object_id === course.id);
            
            if (courseLab) {
              setKnowledgeLab(courseLab);
            } else {
              setKnowledgeLab(null);
            }
          } catch (error) {
            console.error('Error loading knowledge lab:', error);
            setKnowledgeLab(null);
          } finally {
            setLoadingKnowledgeLab(false);
          }
        } catch (error) {
          console.error('Error loading batches/knowledge lab:', error);
        }
      } else {
        setBatches([]);
        setKnowledgeLab(null);
      }
    };

    loadBatchesAndKnowledgeLab();
  }, [isOpen, course?.id, course?.approval_status]);
  
  // Reset courseDetails when course changes
  useEffect(() => {
    if (course?.id) {
      setCourseDetails(null);
      setShowLessons(false);
    }
  }, [course?.id]);

  // No longer needed - we use the course prop data directly
  // const loadCourseDetails = async () => { ... }

  const handleApprove = async () => {
    console.log('🔵 handleApprove called!', { courseId: course?.id, hasOnApprove: !!onApprove, approvalNotes });
    
    if (!course?.id) {
      console.error('❌ No course ID!');
      return;
    }
    
    if (!onApprove) {
      console.error('❌ No onApprove callback!');
      return;
    }
    
    setSubmitting(true);
    try {
      console.log('📤 Calling onApprove with:', { course, approvalNotes });
      // Call parent callback - it handles the API call
      await onApprove(course, approvalNotes);
      console.log('✅ onApprove completed successfully');
      
      // Reset form state
      setShowApprovalForm(false);
      setApprovalNotes('');
      setPlatformCommission('');
    } catch (error) {
      console.error('❌ خطأ في الموافقة على الدورة:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!course?.id || !rejectionReason.trim() || !onReject) return;
    
    setSubmitting(true);
    try {
      // Call parent callback - it handles the API call
      await onReject(course, rejectionReason);
      
      // Reset form state
      setShowRejectionForm(false);
      setRejectionReason('');
    } catch (error) {
      console.error('❌ خطأ في رفض الدورة:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'معلقة';
      case 'approved': return 'موافق عليها';
      case 'rejected': return 'مرفوضة';
      case 'under_review': return 'قيد المراجعة';
      default: return 'غير محددة';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop - Solid Dark Background */}
      <div 
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
      />
      
      {/* Modal - Solid White Background */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-300 dark:border-slate-700 w-full max-w-[92vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 text-white p-3 sm:p-4 rounded-t-xl sm:rounded-t-2xl z-10 shadow-md">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-3 pr-10">
            <div className="p-2 bg-white/20 rounded-full">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1">
                {courseDetails?.title || course?.title || 'تفاصيل الدورة'}
              </h2>
              <div className="flex items-center gap-3 text-amber-100 text-xs">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {courseDetails?.teacher_name 
                    || course?.teacher_name 
                    || (course?.teacher && typeof course.teacher === 'object' 
                      ? (course.teacher.user?.full_name || course.teacher.user?.username || course.teacher.full_name || course.teacher.username || 'غير محدد')
                      : 'غير محدد')
                  }
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(courseDetails?.approval_status || course?.approval_status || 'pending')}`}>
                  {getStatusText(courseDetails?.approval_status || course?.approval_status || 'pending')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Solid White Background */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-white dark:bg-slate-900">
          {/* Course Overview */}
          {course && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6"
            >
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="bg-gray-50/80 dark:bg-slate-800/80 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-slate-700"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                معلومات أساسية
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">الوصف</p>
                  <p className="text-gray-900 dark:text-slate-100 text-sm line-clamp-3">
                    {courseDetails?.description || course?.description || 'لا يوجد وصف متاح'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">نوع الدورة</p>
                    <p className="text-sm text-gray-900 dark:text-slate-100">
                      {courseDetails?.course_type_display || course?.course_type_display || 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">المواضيع</p>
                    <p className="text-sm text-gray-900 dark:text-slate-100">
                      {courseDetails?.subjects || course?.subjects || 'غير محدد'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">عدد الطلاب المسموح</p>
                    <p className="text-sm text-gray-900 dark:text-slate-100 flex items-center gap-1">
                      <Users className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      {courseDetails?.max_students || course?.max_students || 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">الطلاب المسجلين</p>
                    <p className="text-sm text-gray-900 dark:text-slate-100 flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      {courseDetails?.enrolled_count || course?.enrolled_count || '0'}
                    </p>
                  </div>
                </div>

                {courseDetails?.learning_outcomes && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">أهداف التعلم</p>
                    <p className="text-sm text-gray-900 dark:text-slate-100 line-clamp-2">{courseDetails.learning_outcomes}</p>
                  </div>
                )}

                {courseDetails?.trial_session_url && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">رابط الجلسة التجريبية</p>
                    <a 
                      href={courseDetails.trial_session_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline truncate block"
                    >
                      {courseDetails.trial_session_url}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Teacher Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                معلومات المعلم
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">الاسم</p>
                  <p className="text-gray-900 dark:text-slate-100">
                    {courseDetails?.teacher_name 
                      || course?.teacher_name 
                      || (course?.teacher && typeof course.teacher === 'object' 
                        ? (course.teacher.user?.full_name || course.teacher.user?.username || course.teacher.full_name || course.teacher.username || 'غير محدد')
                        : 'غير محدد')
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">البريد الإلكتروني</p>
                  <p className="text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    {courseDetails?.teacher_email || course?.teacher_email || 'غير محدد'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">معرف المعلم</p>
                  <p className="text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    {courseDetails?.teacher 
                      ? (typeof courseDetails.teacher === 'object' ? (courseDetails.teacher as any).id || (courseDetails.teacher as any).user?.id || 'غير محدد' : courseDetails.teacher)
                      : course?.teacher 
                        ? (typeof course.teacher === 'object' ? (course.teacher as any).id || (course.teacher as any).user?.id || 'غير محدد' : course.teacher)
                        : 'غير محدد'
                    }
                  </p>
                </div>

                {courseDetails?.created_at && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">تاريخ الإنشاء</p>
                    <p className="text-gray-900 dark:text-slate-100 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      {new Date(courseDetails.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
          )}

          {/* Learning Outcomes - Only show if we have courseDetails */}
          {courseDetails?.learning_outcomes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-700/30"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                نواتج التعلم
              </h3>
              <p className="text-sm text-gray-700 dark:text-slate-300 line-clamp-3">{courseDetails.learning_outcomes}</p>
            </motion.div>
          )}

          {/* Approval Status Information - Only show if we have courseDetails */}
          {courseDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-700"
            >
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                حالة الموافقة
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">الحالة</p>
                  <p className="text-sm text-gray-900">{courseDetails.approval_status_display}</p>
                </div>
                
                {courseDetails.approval_status === 'approved' && courseDetails.approved_by_name && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">وافق عليه</p>
                    <p className="text-gray-900">{courseDetails.approved_by_name}</p>
                  </div>
                )}
                
                {courseDetails.approval_status === 'approved' && courseDetails.approved_at && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">تاريخ الموافقة</p>
                    <p className="text-gray-900">{new Date(courseDetails.approved_at).toLocaleDateString('ar-SA')}</p>
                  </div>
                )}
                
                {courseDetails.approval_status === 'rejected' && courseDetails.rejection_reason && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">سبب الرفض</p>
                    <p className="text-red-600">{courseDetails.rejection_reason}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">منشور</p>
                  <p className={`font-medium ${courseDetails.is_published ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                    {courseDetails.is_published ? 'نعم' : 'لا'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Course Lessons - Only show if we have courseDetails or course */}
          {(courseDetails || course) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  دروس الدورة ({courseDetails?.lessons?.length || 0})
                </h3>
                <button
                  onClick={() => {
                    console.log('🔍 CourseDetailsModal: Toggle lessons. Current courseDetails:', courseDetails);
                    console.log('🔍 CourseDetailsModal: Lessons data:', courseDetails?.lessons);
                    setShowLessons(!showLessons);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                >
                  {showLessons ? 'إخفاء الدروس' : 'عرض الدروس'}
                  {showLessons ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {showLessons && (
                <div className="space-y-2">
                {(() => {
                  console.log('🔍 CourseDetailsModal: Rendering lessons. courseDetails:', courseDetails);
                  console.log('🔍 CourseDetailsModal: lessons array:', courseDetails?.lessons);
                  console.log('🔍 CourseDetailsModal: lessons length:', courseDetails?.lessons?.length);
                  return null;
                })()}
                {courseDetails?.lessons && courseDetails.lessons.length > 0 ? (
                  courseDetails.lessons.map((lesson, index) => {
                    console.log(`🔍 CourseDetailsModal: Rendering lesson ${index}:`, lesson);
                    const lessonId = String(lesson.id);
                    const isVideoExpanded = expandedVideos[lessonId] || false;
                    
                    return (
                      <div key={lesson.id} className="bg-gray-50 dark:bg-slate-800 rounded-lg overflow-hidden">
                        <div className="flex items-start gap-3 p-3">
                          <div className="flex items-center justify-center w-6 h-6 bg-amber-600 dark:bg-amber-700 text-white rounded-full text-xs font-bold shrink-0">
                            {lesson.order || index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100">{lesson.title}</h4>
                              {lesson.unit_title && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded">({lesson.unit_title})</span>}
                            </div>
                            {lesson.description && (
                              <p className="text-xs text-gray-600 dark:text-slate-400 mb-1.5 line-clamp-1">{lesson.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-[10px] text-gray-500 dark:text-slate-400 mb-1.5">
                              {lesson.video_duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {Math.round(lesson.video_duration / 60)} دقيقة
                                </span>
                              )}
                              {lesson.bunny_video_id && (
                                <span className="text-amber-600 dark:text-amber-400">
                                  ✅ مرفوع
                                </span>
                              )}
                              <span className="text-[10px] text-gray-500">
                                تم الإنشاء: {new Date(lesson.created_at).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                            
                            {/* Video Preview Button */}
                            {lesson.video_url && (
                              <button
                                onClick={() => setExpandedVideos(prev => ({
                                  ...prev,
                                  [lessonId]: !prev[lessonId]
                                }))}
                                className="flex items-center gap-1.5 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              >
                                {isVideoExpanded ? (
                                  <>
                                    <ChevronUp className="w-3 h-3" />
                                    إخفاء الفيديو
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4" />
                                    معاينة الفيديو
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Video Player */}
                        {isVideoExpanded && lesson.video_url && (
                          <div className="px-4 pb-4">
                            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                              <iframe
                                src={`${lesson.video_url}?autoplay=false&preload=true`}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                allowFullScreen
                                title={lesson.title}
                                sandbox="allow-same-origin allow-scripts allow-presentation"
                                onError={() => {
                                  console.error('❌ Video iframe failed to load:', lesson.video_url);
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                              <span>Video ID: {lesson.bunny_video_id || 'N/A'}</span>
                              <a
                                href={lesson.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                فتح في نافذة جديدة
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="font-medium mb-2">لا توجد دروس في هذه الدورة</p>
                    <p className="text-sm">هذه الدورة لم يتم إضافة وحدات أو دروس لها بعد.</p>
                    <p className="text-xs mt-2 text-blue-600">
                      الوحدات: {courseDetails?.units?.length || 0} | 
                      إجمالي الدروس: {courseDetails?.total_lessons || 0}
                    </p>
                  </div>
                )}
              </div>
            )}
            </motion.div>
          )}

          {/* Batches Section - Only for approved live courses */}
          {course?.approval_status === 'approved' && !('units_count' in course || 'price' in course) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  المجموعات ({batches.length})
                </h3>
                <button
                  onClick={() => setShowBatches(!showBatches)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {showBatches ? 'إخفاء المجموعات' : 'عرض المجموعات'}
                  {showBatches ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {showBatches && (
                <div className="space-y-2">
                  {loadingBatches ? (
                    <div className="text-center py-8 text-gray-500">
                      <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
                      <p className="text-sm">جاري تحميل المجموعات...</p>
                    </div>
                  ) : batches.length > 0 ? (
                    batches.map((batch: any) => (
                      <div key={batch.id} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 dark:bg-blue-700 text-white rounded-full text-xs font-bold shrink-0">
                            <UserCircle className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100">{batch.name || 'مجموعة بدون اسم'}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded ${
                                batch.status === 'active' 
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' 
                                  : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300'
                              }`}>
                                {batch.status === 'active' ? 'نشطة' : 'مغلقة'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {batch.max_students || 0} طالب
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {batch.created_at ? new Date(batch.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                              </span>
                            </div>
                            {batch.type && (
                              <span className="text-[10px] text-gray-500 mt-1 block">
                                النوع: {batch.type === 'individual' ? 'فردية' : batch.type === 'group' ? 'مجموعة' : batch.type}
                              </span>
                            )}
                            <div className="mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/interface-batch/${batch.id}`)}
                                className="text-xs px-2 py-1 h-auto bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                              >
                                <ExternalLink className="w-3 h-3 ml-1" />
                                فتح المجموعة
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="font-medium mb-2">لا توجد مجموعات لهذه الدورة</p>
                      <p className="text-sm">المعلم لم ينشئ مجموعات لهذه الدورة بعد.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Knowledge Lab Section - Only for approved live courses */}
          {course?.approval_status === 'approved' && !('units_count' in course || 'price' in course) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-purple-600" />
                  مختبر المعرفة
                </h3>
                <button
                  onClick={() => setShowKnowledgeLab(!showKnowledgeLab)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  {showKnowledgeLab ? 'إخفاء المختبر' : 'عرض المختبر'}
                  {showKnowledgeLab ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {showKnowledgeLab && (
                <div className="space-y-2">
                  {loadingKnowledgeLab ? (
                    <div className="text-center py-8 text-gray-500">
                      <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
                      <p className="text-sm">جاري تحميل مختبر المعرفة...</p>
                    </div>
                  ) : knowledgeLab ? (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-lg shrink-0">
                          <FlaskConical className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">{knowledgeLab.title || 'مختبر المعرفة'}</h4>
                          {knowledgeLab.description && (
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{knowledgeLab.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                            <span className={`px-2 py-0.5 rounded ${
                              knowledgeLab.status === 'approved' 
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' 
                                : knowledgeLab.status === 'pending'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            }`}>
                              {knowledgeLab.status === 'approved' ? 'معتمد' : knowledgeLab.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                            </span>
                            {knowledgeLab.created_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(knowledgeLab.created_at).toLocaleDateString('ar-SA')}
                              </span>
                            )}
                          </div>
                          {knowledgeLab.objective && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">الهدف:</p>
                              <p className="text-xs text-gray-700 line-clamp-2">{knowledgeLab.objective}</p>
                            </div>
                          )}
                          <div className="mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/knowledge-lab/${knowledgeLab.id}/manage`)}
                              className="text-xs px-3 py-1.5 h-auto bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                            >
                              <ExternalLink className="w-3 h-3 ml-1" />
                              فتح مختبر المعرفة
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FlaskConical className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="font-medium mb-2">لا يوجد مختبر معرفة لهذه الدورة</p>
                      <p className="text-sm">المعلم لم ينشئ مختبر معرفة لهذه الدورة بعد.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Approval/Rejection Forms */}
          {showApprovalForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-amber-200 dark:border-amber-700 rounded-lg mt-4 p-4"
            >
              <div className="space-y-3">
                {/* Notes Section */}
                <div>
                  <label className="text-sm text-gray-700 dark:text-slate-300 mb-1 block">
                    ملاحظات <span className="text-gray-400">(اختيارية)</span>
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 dark:bg-slate-800 resize-none"
                    rows={3}
                    placeholder="ملاحظات..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleApprove}
                    disabled={submitting}
                    className="flex-1 h-9 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        جاري...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        موافقة
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowApprovalForm(false)}
                    variant="outline"
                    className="h-9 px-4 text-sm"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {showRejectionForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-red-300 rounded-xl overflow-hidden mt-4 shadow-lg"
            >
              {/* Header Section */}
              <div className="bg-gradient-to-r from-red-600 to-rose-600 p-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">رفض الدورة</h3>
                    <p className="text-red-100 text-[9px] mt-0.5">
                      سيتم إخطار المعلم بالسبب
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-4 space-y-4 bg-white">
                {/* Reason Section */}
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-700 mb-1">
                    <FileText className="w-3 h-3 text-red-600" />
                    سبب الرفض <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-red-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                    rows={2}
                    placeholder="اذكر سبب الرفض..."
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleReject}
                    disabled={submitting || !rejectionReason.trim()}
                    className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-2 text-xs font-semibold transition-all rounded-md disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        جاري...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <X className="w-3 h-3" />
                        رفض
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowRejectionForm(false)}
                    variant="outline"
                    className="px-3 py-2 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Actions */}
        {course?.approval_status === 'pending' && !showApprovalForm && !showRejectionForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-0 bg-white dark:bg-slate-900 border-t-2 border-gray-300 dark:border-slate-700 p-4 rounded-b-xl shadow-lg"
          >
            <div className="flex items-center justify-between gap-3">
              {/* Info Section */}
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <AlertTriangle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span>
                  يرجى مراجعة جميع تفاصيل الدورة قبل اتخاذ القرار
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowRejectionForm(true)}
                  variant="outline"
                  className="px-3 py-2 text-xs border border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-all rounded-lg font-semibold"
                >
                  <span className="flex items-center gap-1">
                    <X className="w-3 h-3" />
                    رفض
                  </span>
                </Button>
                <Button
                  onClick={() => setShowApprovalForm(true)}
                  className="px-4 py-2 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all rounded-lg font-semibold"
                >
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    موافقة
                  </span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailsModal;

