'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Users,
  Calendar,
  BookOpen,
  Eye,
  AlertCircle,
  X,
  GraduationCap,
  UserCheck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { simpleAuthService } from '@/lib/auth/simpleAuth';
import { generalSupervisorApi } from '@/lib/api/generalSupervisor';

interface Course {
  id: string;
  title: string;
  course_type: 'individual' | 'family' | 'group_private' | 'group_public';
  course_type_display: string;
  max_students: string;
  teacher: number;
  teacher_name: string;
  enrolled_count: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'under_review';
  approval_status_display: string;
  is_published: boolean;
  created_at: string;
}

interface CoursesResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results?: Course[];
  // Alternative format
  success?: boolean;
  data?: Course[];
}

interface CoursesTabProps {
  onShowCourseDetails: (course: Course) => void;
  onShowApproval: (course: Course) => void;
  onShowRejection: (course: Course) => void;
  onShowDelete: (course: Course) => void;
  onCourseDeletedRef?: React.MutableRefObject<((courseId: string) => void) | null>;
}

const CoursesTab: React.FC<CoursesTabProps> = ({ onShowCourseDetails, onShowApproval, onShowRejection, onShowDelete, onCourseDeletedRef }) => {
  // States for different course types
  const [pendingCourses, setPendingCourses] = useState<Course[]>([]);
  const [approvedCourses, setApprovedCourses] = useState<Course[]>([]);
  const [rejectedCourses, setRejectedCourses] = useState<Course[]>([]);
  
  // Debug logging
  console.log('🔄 CoursesTab render - Pending courses:', pendingCourses.length);
  console.log('🔄 CoursesTab render - Approved courses:', approvedCourses.length);
  console.log('🔄 CoursesTab render - Rejected courses:', rejectedCourses.length);
  
  // Loading states
  const [pendingLoading, setPendingLoading] = useState(false);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [rejectedLoading, setRejectedLoading] = useState(false);
  
  // Page state (keeping for potential future use)
  const [currentPage] = useState(1);

  // Fetch courses by approval status - Using generalSupervisorApi for pending
  const fetchCourses = async (
    approvalStatus: 'pending' | 'approved' | 'rejected',
    setLoading: (loading: boolean) => void,
    setCourses: (courses: Course[]) => void
  ) => {
    console.log(`🚀 fetchCourses called for ${approvalStatus}`);
    console.log(`📌 setLoading function:`, setLoading);
    console.log(`📌 setCourses function:`, setCourses);
    
    try {
      setLoading(true);
      console.log(`✅ Loading state set to true for ${approvalStatus}`);
      
      let coursesArray: any[] = [];
      
      if (approvalStatus === 'pending') {
        // Use generalSupervisorApi which works correctly
        console.log(`📞 Using generalSupervisorApi.getPendingCoursesForMe() for pending courses`);
        coursesArray = await generalSupervisorApi.getPendingCoursesForMe();
        console.log(`✅ Received ${coursesArray.length} pending courses from API`);
      } else {
        // For approved/rejected, use the general courses API
        const token = await simpleAuthService.getValidAccessToken();
        
        if (!token) {
          toast({
            title: "خطأ في المصادقة",
            description: "لم يتم العثور على رمز المصادقة",
            variant: "destructive",
          });
          return;
        }

        const params = new URLSearchParams({
          approval_status: approvalStatus,
          page: currentPage.toString(),
          submitted_to_general_supervisor: 'true',
        });
        
        const apiUrl = `${process.env['NEXT_PUBLIC_API_URL']}/live-courses/courses/?${params}`;
        console.log(`🌐 API Call for ${approvalStatus}: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: CoursesResponse = await response.json();
        
        // Handle multiple response formats
        if ((data as any).success && (data as any).data && Array.isArray((data as any).data)) {
          coursesArray = (data as any).data;
        } else if (data.results && Array.isArray(data.results)) {
          coursesArray = data.results;
        } else if ((data as any).data && Array.isArray((data as any).data)) {
          coursesArray = (data as any).data;
        } else if (Array.isArray(data)) {
          coursesArray = data as any[];
        }
      }
      
      console.log(`✅ ${approvalStatus} courses - Raw API response:`, coursesArray.length);
      console.log(`📊 Sample course structure:`, coursesArray[0]);
      
      // Normalize and map course data to match Course interface
      coursesArray = coursesArray.map((course: any) => {
        // Normalize approval_status based on the endpoint we fetched from
        // If approval_status is missing/undefined, set it based on the approvalStatus parameter
        if (!course.approval_status || course.approval_status === undefined || course.approval_status === null) {
          course.approval_status = approvalStatus; // 'pending', 'approved', or 'rejected'
        }
        
        // Normalize teacher_name - handle different structures
        if (!course.teacher_name) {
          if (course.teacher && typeof course.teacher === 'object') {
            if (course.teacher.user) {
              course.teacher_name = course.teacher.user.full_name || 
                                   course.teacher.user.username || 
                                   course.teacher.user_name ||
                                   'غير معروف';
            } else if (course.teacher.full_name) {
              course.teacher_name = course.teacher.full_name;
            } else if (course.teacher.username) {
              course.teacher_name = course.teacher.username;
            }
          } else if (typeof course.teacher === 'string') {
            course.teacher_name = course.teacher;
          } else {
            course.teacher_name = 'غير معروف';
          }
        }
        
        // Normalize other fields
        if (!course.course_type_display) {
          course.course_type_display = course.course_type || 'غير محدد';
        }
        
        if (!course.approval_status_display) {
          const statusLabels: Record<string, string> = {
            'pending': 'قيد المراجعة',
            'approved': 'معتمد',
            'rejected': 'مرفوض',
            'under_review': 'قيد المراجعة'
          };
          course.approval_status_display = statusLabels[course.approval_status] || 'غير محدد';
        }
        
        // Ensure numeric fields are strings if needed
        if (course.max_students !== undefined && typeof course.max_students !== 'string') {
          course.max_students = String(course.max_students);
        }
        
        if (course.enrolled_count !== undefined && typeof course.enrolled_count !== 'string') {
          course.enrolled_count = String(course.enrolled_count || 0);
        }
        
        return course;
      });
      
      console.log(`✅ ${approvalStatus} courses - After normalization:`, coursesArray.length);
      console.log(`📊 Sample normalized course:`, coursesArray[0]);
      
      // Apply filtering
      let filteredCourses: any[] = [];
      
      if (approvalStatus === 'pending') {
        // For pending, accept all courses
        filteredCourses = coursesArray.filter((course: any) => 
          !course.approval_status || course.approval_status === 'pending' || course.approval_status === undefined
        );
      } else {
        filteredCourses = coursesArray.filter((course: any) => 
          course.approval_status === approvalStatus
        );
      }
      
      console.log(`✅ ${approvalStatus} courses - After filtering:`, filteredCourses.length);
      
      // Log course details
      if (filteredCourses.length > 0) {
        console.log(`📋 ${approvalStatus.toUpperCase()} COURSES DETAILS:`);
        filteredCourses.forEach((course: any, index: number) => {
          console.log(`  🎓 Course ${index + 1}:`, {
            id: course.id,
            title: course.title,
            approval_status: course.approval_status,
            teacher_name: course.teacher_name
          });
        });
      }
      
      // Call setCourses
      console.log(`📊 About to call setCourses for ${approvalStatus} with ${filteredCourses.length} courses`);
      setCourses(filteredCourses);
      console.log(`✅ setCourses called successfully for ${approvalStatus} with ${filteredCourses.length} courses`);
      
    } catch (error) {
      console.error(`❌ Error loading ${approvalStatus} courses:`, error);
      toast({
        title: "خطأ في تحميل الدورات",
        description: `فشل في تحميل الدورات ${approvalStatus === 'pending' ? 'المعلقة' : approvalStatus === 'approved' ? 'المقبولة' : 'المرفوضة'}`,
        variant: "destructive",
      });
      setCourses([]);
    } finally {
      setLoading(false);
      console.log(`✅ Loading state set to false for ${approvalStatus}`);
    }
  };

  // Show course details
  const showCourseDetails = (course: Course) => {
    onShowCourseDetails(course);
  };


  // Expose method to remove course from lists via ref
  const removeCourseFromList = useCallback((courseId: string) => {
    console.log('🗑️ Removing course from list:', courseId);
    // Remove from pending courses
    setPendingCourses(prev => {
      const filtered = prev.filter(course => course.id !== courseId);
      console.log('🗑️ Pending courses after removal:', filtered.length, 'from', prev.length);
      return filtered;
    });
    // Remove from approved courses
    setApprovedCourses(prev => {
      const filtered = prev.filter(course => course.id !== courseId);
      console.log('🗑️ Approved courses after removal:', filtered.length, 'from', prev.length);
      return filtered;
    });
    // Remove from rejected courses
    setRejectedCourses(prev => {
      const filtered = prev.filter(course => course.id !== courseId);
      console.log('🗑️ Rejected courses after removal:', filtered.length, 'from', prev.length);
      return filtered;
    });
  }, []);
  
  // Update course visibility in lists
  const updateCourseVisibility = useCallback((courseId: string, isHidden: boolean) => {
    console.log('👁️ Updating course visibility:', courseId, 'isHidden:', isHidden);
    // Update in pending courses
    setPendingCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, is_hidden: isHidden } : course
    ));
    // Update in approved courses
    setApprovedCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, is_hidden: isHidden } : course
    ));
    // Update in rejected courses
    setRejectedCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, is_hidden: isHidden } : course
    ));
  }, []);

  // Expose the functions to parent via ref
  useEffect(() => {
    if (onCourseDeletedRef) {
      // Store both functions in the ref
      (onCourseDeletedRef as any).current = {
        remove: removeCourseFromList,
        updateVisibility: updateCourseVisibility
      };
      console.log('✅ Exposed removeCourseFromList and updateCourseVisibility to parent via ref');
    }
  }, [onCourseDeletedRef, removeCourseFromList, updateCourseVisibility]);

  // Load all course types
  const loadAllCourses = () => {
    console.log('🚀 loadAllCourses called');
    console.log('🚀 Calling fetchCourses for pending with setPendingCourses:', setPendingCourses);
    console.log('🚀 Calling fetchCourses for approved with setApprovedCourses:', setApprovedCourses);
    console.log('🚀 Calling fetchCourses for rejected with setRejectedCourses:', setRejectedCourses);
    
    // Clear existing data first
    setPendingCourses([]);
    setApprovedCourses([]);
    setRejectedCourses([]);
    
    // Fetch each type with a small delay to avoid race conditions
    fetchCourses('pending', setPendingLoading, setPendingCourses);
    setTimeout(() => fetchCourses('approved', setApprovedLoading, setApprovedCourses), 100);
    setTimeout(() => fetchCourses('rejected', setRejectedLoading, setRejectedCourses), 200);
  };

  // Initial load
  useEffect(() => {
    loadAllCourses();
  }, []);

  // Get status badge color with dark mode support
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700';
      case 'approved':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'under_review':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  // Get course type icon
  const getCourseTypeIcon = (courseType: string) => {
    switch (courseType) {
      case 'individual':
        return '👤';
      case 'family':
        return '👨‍👩‍👧‍👦';
      case 'group_private':
        return '👥';
      case 'group_public':
        return '🏛️';
      default:
        return '📚';
    }
  };

  // Course card component with modern clean design
  const CourseCard: React.FC<{ course: Course; index?: number }> = ({ course, index = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <Card className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-700/60 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Animated background gradient on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-amber-50/40 via-orange-50/20 to-amber-50/40 dark:from-amber-900/10 dark:via-orange-900/5 dark:to-amber-900/10 transition-opacity duration-500"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0, 0.3, 0],
            x: [0, 20, 0],
            y: [0, 15, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-300/20 to-orange-300/15 dark:from-amber-600/15 dark:to-orange-700/10 rounded-full blur-2xl"
        />
        
        {/* Status indicator bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
          course.approval_status === 'pending' 
            ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400' 
            : course.approval_status === 'approved'
            ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400'
            : 'bg-gradient-to-r from-red-400 via-rose-500 to-red-400'
        }`} />
        
        <CardHeader className="py-6 px-6 relative z-10 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Course icon with glow effect */}
              <motion.div
                whileHover={{ rotate: 5 }}
                className="relative flex-shrink-0"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.4, 0.6, 0.4]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 dark:from-amber-500 dark:to-orange-700 rounded-xl blur-lg"
                />
                <div className="relative w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">{getCourseTypeIcon(course.course_type)}</span>
                </div>
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors duration-300 leading-tight">
                  {course.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                  <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <span className="truncate font-medium">المعلم: {course.teacher_name}</span>
                </div>
              </div>
            </div>
            
            <Badge className={`${getStatusBadgeColor(course.approval_status)} border shadow-sm flex-shrink-0 text-xs font-semibold px-3 py-1`}>
              {course.approval_status_display}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pb-6 relative z-10 flex-1 flex flex-col">
          <div className="space-y-3 mb-5">
            <div className="grid grid-cols-2 gap-3">
              <motion.div 
                whileHover={{ y: -2 }}
                className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm p-3.5 rounded-xl border border-gray-200/40 dark:border-slate-700/40 hover:border-amber-300/60 dark:hover:border-amber-700/40 transition-colors duration-200"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">النوع</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-tight">{course.course_type_display}</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }}
                className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm p-3.5 rounded-xl border border-gray-200/40 dark:border-slate-700/40 hover:border-blue-300/60 dark:hover:border-blue-700/40 transition-colors duration-200"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">الحد الأقصى</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-tight">{course.max_students} طالب</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }}
                className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm p-3.5 rounded-xl border border-gray-200/40 dark:border-slate-700/40 hover:border-purple-300/60 dark:hover:border-purple-700/40 transition-colors duration-200"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">تاريخ الإنشاء</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-tight">{new Date(course.created_at).toLocaleDateString('ar-SA')}</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }}
                className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm p-3.5 rounded-xl border border-gray-200/40 dark:border-slate-700/40 hover:border-blue-300/60 dark:hover:border-blue-700/40 transition-colors duration-200"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">المسجلين</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-tight">{course.enrolled_count} طالب</p>
              </motion.div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2 text-xs">
              <motion.div
                animate={{
                  scale: course.is_published ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 2, repeat: course.is_published ? Infinity : 0 }}
                className={`w-2 h-2 rounded-full ${
                  course.is_published 
                    ? 'bg-blue-500 dark:bg-blue-400 shadow-sm shadow-blue-500/50' 
                    : 'bg-gray-400 dark:bg-gray-500'
                }`}
              />
              <span className="text-gray-600 dark:text-slate-400 font-medium">
                {course.is_published ? 'منشورة' : 'غير منشورة'}
              </span>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <motion.div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => showCourseDetails(course)}
                  className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-amber-400 dark:hover:border-amber-600 hover:text-amber-700 dark:hover:text-amber-400 text-xs px-3 py-1.5 h-auto"
                >
                  <Eye className="w-3.5 h-3.5 ml-1.5" />
                  التفاصيل
                </Button>
              </motion.div>
              
              {/* Actions based on course status */}
              {course.approval_status === 'pending' && (
                <>
                  <motion.div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 text-white border-0 shadow-md hover:shadow-lg text-xs px-3 py-1.5 h-auto font-semibold"
                      onClick={() => onShowApproval(course)}
                    >
                      <CheckCircle className="w-3.5 h-3.5 ml-1.5" />
                      قبول
                    </Button>
                  </motion.div>
                  <motion.div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 dark:from-red-600 dark:to-rose-700 text-white border-0 shadow-md hover:shadow-lg text-xs px-3 py-1.5 h-auto font-semibold"
                      onClick={() => onShowRejection(course)}
                    >
                      <XCircle className="w-3.5 h-3.5 ml-1.5" />
                      رفض
                    </Button>
                  </motion.div>
                </>
              )}
              
              {/* Toggle visibility button for all statuses */}
              <motion.div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={course.is_hidden 
                    ? "border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-600 text-xs px-3 py-1.5 h-auto"
                    : "border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-400 dark:hover:border-amber-600 text-xs px-3 py-1.5 h-auto"}
                  onClick={() => onShowDelete(course)}
                >
                  <Eye className="w-3.5 h-3.5 ml-1.5" />
                  {course.is_hidden ? 'إظهار' : 'إخفاء'}
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Courses Tabs */}
      <Tabs defaultValue="pending" className="w-full" dir="rtl">
        <TabsList className="inline-flex h-14 w-full items-center justify-start rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-2 gap-2 border-2 border-amber-200/50 dark:border-amber-800/40 shadow-lg overflow-hidden">
          <TabsTrigger 
            value="pending" 
            className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap text-xs sm:text-sm">معلقة ({pendingCourses.length})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="approved" 
            className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-blue-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-blue-50/60 dark:data-[state=inactive]:hover:bg-blue-950/30 data-[state=inactive]:hover:text-blue-700 dark:data-[state=inactive]:hover:text-blue-400"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap text-xs sm:text-sm">مقبولة ({approvedCourses.length})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="rejected" 
            className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:via-rose-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-red-50/60 dark:data-[state=inactive]:hover:bg-red-950/30 data-[state=inactive]:hover:text-red-700 dark:data-[state=inactive]:hover:text-red-400"
          >
            <XCircle className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap text-xs sm:text-sm">مرفوضة ({rejectedCourses.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Pending Courses */}
        <TabsContent value="pending" className="space-y-6 mt-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-gradient-to-r from-amber-50/80 to-orange-50/60 dark:from-amber-900/20 dark:to-orange-900/10 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-700/30 shadow-md"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              الدورات المعلقة ({pendingCourses.length})
            </h3>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  console.log('🔄 Manual refresh for PENDING courses');
                  fetchCourses('pending', setPendingLoading, setPendingCourses);
                }}
                variant="outline"
                size="sm"
                className="bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 shadow-sm"
                disabled={pendingLoading}
              >
                <RefreshCw className={`w-4 h-4 ml-1 ${pendingLoading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </motion.div>
          </motion.div>
          
          {pendingLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 dark:from-amber-600/20 dark:to-orange-700/20 rounded-full blur-2xl"
                />
                <RefreshCw className="w-12 h-12 animate-spin text-amber-600 dark:text-amber-400 mx-auto mb-4 relative z-10" />
              </div>
              <p className="text-gray-600 dark:text-slate-400 font-medium">جاري تحميل الدورات المعلقة...</p>
            </motion.div>
          ) : pendingCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="text-center py-12 bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-slate-800/80 dark:to-slate-900/80 border-2 border-gray-200/50 dark:border-slate-700/30 rounded-2xl shadow-lg">
                <CardContent>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block mb-4"
                  >
                    <AlertCircle className="w-16 h-16 text-amber-500 dark:text-amber-400 mx-auto" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">لا توجد دورات معلقة</h3>
                  <p className="text-gray-600 dark:text-slate-400">لا توجد دورات في انتظار الموافقة حالياً</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <AnimatePresence>
                {pendingCourses.map((course, index) => (
                  <CourseCard key={course.id} course={course} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>

        {/* Approved Courses */}
        <TabsContent value="approved" className="space-y-6 mt-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-gradient-to-r from-blue-50/80 to-blue-50/60 dark:from-blue-900/20 dark:to-blue-900/10 p-4 rounded-2xl border border-blue-200/50 dark:border-blue-700/30 shadow-md"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              الدورات المقبولة ({approvedCourses.length})
            </h3>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  console.log('🔄 Manual refresh for APPROVED courses');
                  fetchCourses('approved', setApprovedLoading, setApprovedCourses);
                }}
                variant="outline"
                size="sm"
                className="bg-white dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm"
                disabled={approvedLoading}
              >
                <RefreshCw className={`w-4 h-4 ml-1 ${approvedLoading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </motion.div>
          </motion.div>
          
          {approvedLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-400/20 dark:from-blue-600/20 dark:to-blue-700/20 rounded-full blur-2xl"
                />
                <RefreshCw className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4 relative z-10" />
              </div>
              <p className="text-gray-600 dark:text-slate-400 font-medium">جاري تحميل الدورات المقبولة...</p>
            </motion.div>
          ) : approvedCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="text-center py-12 bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-slate-800/80 dark:to-slate-900/80 border-2 border-gray-200/50 dark:border-slate-700/30 rounded-2xl shadow-lg">
                <CardContent>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block mb-4"
                  >
                    <CheckCircle className="w-16 h-16 text-blue-500 dark:text-blue-400 mx-auto" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">لا توجد دورات مقبولة</h3>
                  <p className="text-gray-600 dark:text-slate-400">لا توجد دورات تم قبولها حالياً</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <AnimatePresence>
                {approvedCourses.map((course, index) => (
                  <CourseCard key={course.id} course={course} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>

        {/* Rejected Courses */}
        <TabsContent value="rejected" className="space-y-6 mt-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-gradient-to-r from-red-50/80 to-rose-50/60 dark:from-red-900/20 dark:to-rose-900/10 p-4 rounded-2xl border border-red-200/50 dark:border-red-700/30 shadow-md"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 dark:from-red-600 dark:to-rose-700 rounded-xl flex items-center justify-center shadow-lg">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              الدورات المرفوضة ({rejectedCourses.length})
            </h3>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  console.log('🔄 Manual refresh for REJECTED courses');
                  fetchCourses('rejected', setRejectedLoading, setRejectedCourses);
                }}
                variant="outline"
                size="sm"
                className="bg-white dark:bg-slate-800 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm"
                disabled={rejectedLoading}
              >
                <RefreshCw className={`w-4 h-4 ml-1 ${rejectedLoading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </motion.div>
          </motion.div>
          
          {rejectedLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-rose-400/20 dark:from-red-600/20 dark:to-rose-700/20 rounded-full blur-2xl"
                />
                <RefreshCw className="w-12 h-12 animate-spin text-red-600 dark:text-red-400 mx-auto mb-4 relative z-10" />
              </div>
              <p className="text-gray-600 dark:text-slate-400 font-medium">جاري تحميل الدورات المرفوضة...</p>
            </motion.div>
          ) : rejectedCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="text-center py-12 bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-slate-800/80 dark:to-slate-900/80 border-2 border-gray-200/50 dark:border-slate-700/30 rounded-2xl shadow-lg">
                <CardContent>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block mb-4"
                  >
                    <XCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">لا توجد دورات مرفوضة</h3>
                  <p className="text-gray-600 dark:text-slate-400">لا توجد دورات تم رفضها حالياً</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <AnimatePresence>
                {rejectedCourses.map((course, index) => (
                  <CourseCard key={course.id} course={course} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>




    </div>
  );
};

export default CoursesTab;
