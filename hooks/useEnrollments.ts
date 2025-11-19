import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

interface CourseEnrollment {
  id: string;
  course: string;
  course_title: string;
  student: string;
  student_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  status_display: string;
  enrolled_at: string;
  approved_at?: string;
  notes?: string;
  is_family_enrollment?: string;
  family_name?: string;
  family_enrollment?: string;
  general_supervisor_approved: boolean;
  general_supervisor_approved_at?: string;
}

interface UseEnrollmentsOptions {
  userRole?: 'supervisor' | 'teacher' | 'student';
  courseId?: string;
  autoLoad?: boolean;
}

interface EnrollmentFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  ordering?: 'approved_at' | '-approved_at' | 'enrolled_at' | '-enrolled_at';
  page?: number;
}

export function useEnrollments(options: UseEnrollmentsOptions = {}) {
  const { userRole = 'supervisor', courseId, autoLoad = true } = options;
  
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const loadEnrollments = useCallback(async (filters: EnrollmentFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      
      if (userRole === 'supervisor') {
        // Supervisors see pending enrollments or all enrollments
        if (filters.status === 'pending') {
          response = await apiClient.getPendingEnrollments();
        } else {
          const apiFilters: any = { ...filters };
          if (courseId) {
            apiFilters.course = courseId;
          }
          response = await apiClient.getEnrollments(apiFilters);
        }
      } else if (userRole === 'teacher' && courseId) {
        // Teachers see enrollments for their courses
        response = await apiClient.getCourseEnrollments(courseId, filters);
      } else if (userRole === 'student') {
        // Students see their own enrollments
        response = await apiClient.getMyEnrollments(filters);
      } else {
        throw new Error('Invalid configuration');
      }

      setEnrollments(response.data.results || []);
      setTotalCount(response.data.count || 0);
    } catch (error: any) {
      console.error('Failed to load enrollments:', error);
      const errorMessage = error.status === 403 
        ? 'ليس لديك صلاحية لعرض التسجيلات'
        : 'فشل في تحميل التسجيلات';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userRole, courseId]);

  const enrollInCourse = useCallback(async (courseId: string, notes?: string) => {
    try {
      const response = await apiClient.enrollInCourse(courseId, notes);
      toast.success('تم التسجيل بنجاح! سيتم مراجعة طلبك قريباً');
      
      // Reload enrollments if showing student's own enrollments
      if (userRole === 'student') {
        await loadEnrollments();
      }
      
      return response.data;
    } catch (error: any) {
      let errorMessage = 'حدث خطأ أثناء التسجيل';
      
      if (error.status === 400) {
        if (error.data?.detail?.includes('already enrolled')) {
          errorMessage = 'أنت مسجل بالفعل في هذه الدورة';
        } else if (error.data?.detail?.includes('capacity')) {
          errorMessage = 'الدورة مكتملة العدد';
        }
      } else if (error.status === 403) {
        errorMessage = 'يجب تسجيل الدخول كطالب للتسجيل في الدورات';
      } else if (error.status === 401) {
        errorMessage = 'يرجى تسجيل الدخول أولاً';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }, [userRole, loadEnrollments]);

  const approveEnrollment = useCallback(async (enrollmentId: string, notes?: string) => {
    try {
      await apiClient.approveEnrollment(enrollmentId, notes);
      toast.success('تم قبول التسجيل بنجاح');
      await loadEnrollments();
    } catch (error: any) {
      const errorMessage = error.status === 403 
        ? 'ليس لديك صلاحية لقبول التسجيلات'
        : 'فشل في قبول التسجيل';
      toast.error(errorMessage);
      throw error;
    }
  }, [loadEnrollments]);

  const rejectEnrollment = useCallback(async (enrollmentId: string, notes?: string) => {
    try {
      await apiClient.rejectEnrollment(enrollmentId, notes);
      toast.success('تم رفض التسجيل');
      await loadEnrollments();
    } catch (error: any) {
      const errorMessage = error.status === 403 
        ? 'ليس لديك صلاحية لرفض التسجيلات'
        : 'فشل في رفض التسجيل';
      toast.error(errorMessage);
      throw error;
    }
  }, [loadEnrollments]);

  const cancelEnrollment = useCallback(async (enrollmentId: string) => {
    try {
      await apiClient.cancelEnrollment(enrollmentId);
      toast.success('تم إلغاء التسجيل');
      await loadEnrollments();
    } catch (error: any) {
      const errorMessage = error.status === 403 
        ? 'لا يمكن إلغاء هذا التسجيل'
        : 'فشل في إلغاء التسجيل';
      toast.error(errorMessage);
      throw error;
    }
  }, [loadEnrollments]);

  const getEnrollmentById = useCallback(async (enrollmentId: string) => {
    try {
      const response = await apiClient.getEnrollment(enrollmentId);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.status === 404 
        ? 'التسجيل غير موجود'
        : 'فشل في تحميل بيانات التسجيل';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const refreshEnrollments = useCallback((filters?: EnrollmentFilters) => {
    return loadEnrollments(filters);
  }, [loadEnrollments]);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadEnrollments();
    }
  }, [autoLoad, loadEnrollments]);

  return {
    // State
    enrollments,
    loading,
    error,
    totalCount,
    currentPage,
    
    // Actions
    loadEnrollments,
    enrollInCourse,
    approveEnrollment,
    rejectEnrollment,
    cancelEnrollment,
    getEnrollmentById,
    refreshEnrollments,
    
    // Pagination
    setCurrentPage,
    
    // Utilities
    getStatusBadgeClass: (status: string) => {
      switch (status) {
        case 'pending': return 'bg-warning text-dark';
        case 'approved': return 'bg-success text-white';
        case 'rejected': return 'bg-danger text-white';
        case 'completed': return 'bg-info text-white';
        default: return 'bg-secondary text-white';
      }
    },
    
    formatDate: (dateString: string) => {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
}

export default useEnrollments;
