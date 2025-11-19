/**
 * Live Education API Service
 * Comprehensive API functions for Live Education System
 */

import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';
import type {
  LiveCourse,
  CreateCourseInput,
  UpdateCourseInput,
  Lesson,
  CreateLessonInput,
  BatchStudent,
  AddStudentToBatchInput,
  StudentStatusUpdateInput,
  BatchHistory,
  CourseApplication,
  Enrollment,
  CreateEnrollmentInput,
  PendingStudent,
  FamilyEnrollmentRequest,
  PaginatedResponse,
  LiveSession,
  CreateLiveSessionInput,
  CourseStatistics,
  PaymentStatusInfo,
  UploadPaymentReceiptInput,
  ReviewPaymentInput,
  CourseEnrollmentInfo,
  CourseEnrollmentDetails,
  PendingStudentInfo
} from '../types/live-education';

// ==================== COURSES ====================

export const liveEducationApi = {
  // Courses
  courses: {
    list: async (params?: { 
      page?: number; 
      ordering?: string;
      status?: string;
      teacher?: number;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.teacher) queryParams.append('teacher', params.teacher.toString());
      
      const url = `/live-courses/courses/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      try {
        logger.debug('Listing courses', { params });
        const response = await apiClient.get<PaginatedResponse<LiveCourse>>(url);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب الدورات');
        }
        return response.data as PaginatedResponse<LiveCourse>;
      } catch (error: any) {
        logger.error('Failed to list courses:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الدورات');
      }
    },

    get: async (id: string) => {
      try {
        logger.debug('Getting course', { id });
        const response = await apiClient.get<LiveCourse>(`/live-courses/courses/${id}/`);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب الدورة');
        }
        return response.data as LiveCourse;
      } catch (error: any) {
        logger.error('Failed to get course:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الدورة');
      }
    },

    create: async (data: CreateCourseInput) => {
      try {
        logger.debug('Creating course', { data });
        const response = await apiClient.post<LiveCourse>(`/live-courses/courses/`, data);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في إنشاء الدورة');
        }
        return response.data as LiveCourse;
      } catch (error: any) {
        logger.error('Failed to create course:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إنشاء الدورة');
      }
    },

    update: async (id: string, data: UpdateCourseInput) => {
      try {
        logger.debug('Updating course', { id, data });
        const response = await apiClient.put<LiveCourse>(`/live-courses/courses/${id}/`, data);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في تحديث الدورة');
        }
        return response.data as LiveCourse;
      } catch (error: any) {
        logger.error('Failed to update course:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحديث الدورة');
      }
    },

    partialUpdate: async (id: string, data: Partial<UpdateCourseInput>) => {
      try {
        logger.debug('Partially updating course', { id, data });
        const response = await apiClient.patch<LiveCourse>(`/live-courses/courses/${id}/`, data);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في تحديث الدورة');
        }
        return response.data as LiveCourse;
      } catch (error: any) {
        logger.error('Failed to partially update course:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحديث الدورة');
      }
    },

    delete: async (id: string) => {
      try {
        logger.debug('Deleting course', { id });
        const response = await apiClient.delete(`/live-courses/courses/${id}/`);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في حذف الدورة');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to delete course:', error);
        // Preserve original error information
        const err: any = new Error(error?.appError?.userMessage || error?.message || 'فشل في حذف الدورة');
        err.status = error?.status;
        err.originalError = error?.originalError || error;
        err.appError = error?.appError;
        err.data = error?.data;
        throw err;
      }
    },

    publish: async (id: string) => {
      try {
        logger.debug('Publishing course', { id });
        const response = await apiClient.post(`/live-courses/courses/${id}/publish/`, {});
        if (response.success === false) {
          throw new Error(response.error || 'فشل في نشر الدورة');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to publish course:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في نشر الدورة');
      }
    },

    approve: async (id: string, data?: { notes?: string; rejection_reason?: string }) => {
      try {
        logger.debug('Approving course', { id, data });
        const response = await apiClient.post(`/live-courses/courses/${id}/approve/`, data || {});
        if (response.success === false) {
          throw new Error(response.error || 'فشل في الموافقة على الدورة');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to approve course:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في الموافقة على الدورة');
      }
    },

    openApplications: async (id: string, data?: { accepting_applications: boolean }) => {
      try {
        logger.debug('Opening applications', { id, data });
        const response = await apiClient.post(`/live-courses/courses/${id}/open-applications/`, data || {});
        if (response.success === false) {
          throw new Error(response.error || 'فشل في فتح التقديمات');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to open applications:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في فتح التقديمات');
      }
    },

    getAcademicSupervisor: async (id: string) => {
      try {
        logger.debug('Getting academic supervisor', { id });
        const response = await apiClient.get<{
          name: string;
          email: string;
          phone: string;
          country: string;
          specialization: string;
        }>(`/live-courses/courses/${id}/academic-supervisor/`);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب المشرف الأكاديمي');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to get academic supervisor:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب المشرف الأكاديمي');
      }
    },

    closeApplications: async (id: string) => {
      try {
        logger.debug('Closing applications', { id });
        const response = await apiClient.post(`/live-courses/courses/${id}/close-applications/`, {});
        if (response.success === false) {
          throw new Error(response.error || 'فشل في إغلاق التقديمات');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to close applications:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إغلاق التقديمات');
      }
    },

    toggleVisibility: async (id: string, isHidden: boolean) => {
      try {
        logger.debug('Toggling course visibility', { id, isHidden });
        const response = await apiClient.post(`/live-courses/courses/${id}/toggle_visibility/`, {
          is_hidden: isHidden
        });
        if (response.success === false) {
          throw new Error(response.error || 'فشل في تغيير حالة إخفاء الدورة');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to toggle course visibility:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تغيير حالة إخفاء الدورة');
      }
    },
  },

  // Lessons
  lessons: {
    list: async (params?: { 
      course?: string; 
      ordering?: string;
      page?: number;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.course) queryParams.append('course', params.course);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());
      
      const url = `/live-education/lessons/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      try {
        logger.debug('Listing lessons', { params });
        const response = await apiClient.get<PaginatedResponse<Lesson>>(url);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب الدروس');
        }
        return response.data as PaginatedResponse<Lesson>;
      } catch (error: any) {
        logger.error('Failed to list lessons:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الدروس');
      }
    },

    get: async (id: string) => {
      try {
        logger.debug('Getting lesson', { id });
        const response = await apiClient.get<Lesson>(`/live-education/lessons/${id}/`);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب الدرس');
        }
        return response.data as Lesson;
      } catch (error: any) {
        logger.error('Failed to get lesson:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الدرس');
      }
    },

    create: async (data: CreateLessonInput) => {
      try {
        logger.debug('Creating lesson', { data });
        const response = await apiClient.post<Lesson>(`/live-education/lessons/`, data);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في إنشاء الدرس');
        }
        return response.data as Lesson;
      } catch (error: any) {
        logger.error('Failed to create lesson:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إنشاء الدرس');
      }
    },

    update: async (id: string, data: Partial<CreateLessonInput>) => {
      try {
        logger.debug('Updating lesson', { id, data });
        const response = await apiClient.put<Lesson>(`/live-education/lessons/${id}/`, data);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في تحديث الدرس');
        }
        return response.data as Lesson;
      } catch (error: any) {
        logger.error('Failed to update lesson:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحديث الدرس');
      }
    },

    delete: async (id: string) => {
      try {
        logger.debug('Deleting lesson', { id });
        const response = await apiClient.delete(`/live-education/lessons/${id}/`);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في حذف الدرس');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to delete lesson:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في حذف الدرس');
      }
    },
  },

  // ⚠️ DEPRECATED: Batches API moved to dedicated batchesApi in @/lib/api/batches.ts
  // Please use: import { batchesApi, batchResourcesApi } from '@/lib/api/batches'
  // The old endpoints in /live-courses/batches/ are deprecated and should not be used

  // Batch Students
  batchStudents: {
    list: async (params?: { 
      batch?: string; 
      student?: string | number;
      status?: 'active' | 'suspended' | 'completed' | 'withdrawn';
      ordering?: string;
      page?: number;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.batch) queryParams.append('batch', params.batch);
      if (params?.student) queryParams.append('student', params.student.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());
      
      const queryString = queryParams.toString();
      const url = `/live-courses/batch-students/${queryString ? '?' + queryString : ''}`;
      try {
        logger.debug('Listing batch students', { params });
        const response = await apiClient.get<PaginatedResponse<BatchStudent>>(url);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب طلاب المجموعة');
        }
        return response.data as PaginatedResponse<BatchStudent>;
      } catch (error: any) {
        logger.error('Failed to list batch students:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب طلاب المجموعة');
      }
    },

    get: async (id: string) => {
      try {
        logger.debug('Getting batch student', { id });
        const response = await apiClient.get<BatchStudent>(`/live-courses/batch-students/${id}/`);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب طالب المجموعة');
        }
        return response.data as BatchStudent;
      } catch (error: any) {
        logger.error('Failed to get batch student:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب طالب المجموعة');
      }
    },

    add: async (data: AddStudentToBatchInput) => {
      try {
        logger.debug('Adding student to batch', { data });
        const response = await apiClient.post<BatchStudent>(`/live-courses/batch-students/`, data);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في إضافة الطالب للمجموعة');
        }
        return response.data as BatchStudent;
      } catch (error: any) {
        logger.error('Failed to add student to batch:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إضافة الطالب للمجموعة');
      }
    },

    activate: async (id: string, data?: StudentStatusUpdateInput) => {
      try {
        logger.debug('Activating batch student', { id, data });
        const response = await apiClient.post(`/live-courses/batch-students/${id}/activate/`, data || {});
        if (response.success === false) {
          throw new Error(response.error || 'فشل في تفعيل الطالب');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to activate batch student:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تفعيل الطالب');
      }
    },

    suspend: async (id: string, data?: StudentStatusUpdateInput) => {
      try {
        logger.debug('Suspending batch student', { id, data });
        const response = await apiClient.post(`/live-courses/batch-students/${id}/suspend/`, data || {});
        if (response.success === false) {
          throw new Error(response.error || 'فشل في تعليق الطالب');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to suspend batch student:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تعليق الطالب');
      }
    },

    complete: async (id: string, data?: StudentStatusUpdateInput) => {
      try {
        logger.debug('Completing batch student', { id, data });
        const response = await apiClient.post(`/live-courses/batch-students/${id}/complete/`, data || {});
        if (response.success === false) {
          throw new Error(response.error || 'فشل في إكمال الطالب');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to complete batch student:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إكمال الطالب');
      }
    },

    withdraw: async (id: string, data?: StudentStatusUpdateInput) => {
      try {
        logger.debug('Withdrawing batch student', { id, data });
        const response = await apiClient.post(`/live-courses/batch-students/${id}/withdraw/`, data || {});
        if (response.success === false) {
          throw new Error(response.error || 'فشل في سحب الطالب');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to withdraw batch student:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في سحب الطالب');
      }
    },

    remove: async (id: string) => {
      try {
        logger.debug('Removing batch student', { id });
        const response = await apiClient.delete(`/live-courses/batch-students/${id}/`);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في إزالة الطالب');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to remove batch student:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إزالة الطالب');
      }
    },
  },

  // Batch History
  batchHistory: {
    list: async (params?: { 
      action?: 'added' | 'removed' | 'moved';
      from_batch?: string;
      to_batch?: string;
      ordering?: string;
      page?: number;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.action) queryParams.append('action', params.action);
      if (params?.from_batch) queryParams.append('from_batch', params.from_batch);
      if (params?.to_batch) queryParams.append('to_batch', params.to_batch);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());
      
      const queryString = queryParams.toString();
      const url = `/live-education/batch-history${queryString ? '?' + queryString : ''}`;
      try {
        logger.debug('Listing batch history', { params });
        const response = await apiClient.get<PaginatedResponse<BatchHistory>>(url);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب تاريخ المجموعة');
        }
        return response.data as PaginatedResponse<BatchHistory>;
      } catch (error: any) {
        logger.error('Failed to list batch history:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب تاريخ المجموعة');
      }
    },
  },

  // Applications
  applications: {
    list: async (params?: { 
      course?: string;
      status?: string;
      student?: number;
      page?: number;
      ordering?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.course) queryParams.append('course', params.course);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.student) queryParams.append('student', params.student.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      
      const url = `/live-courses/applications/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      try {
        logger.debug('Listing applications', { params });
        const response = await apiClient.get<PaginatedResponse<CourseApplication>>(url);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب التقديمات');
        }
        return response.data as PaginatedResponse<CourseApplication>;
      } catch (error: any) {
        logger.error('Failed to list applications:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب التقديمات');
      }
    },

    get: async (id: string) => {
      try {
        logger.debug('Getting application', { id });
        const response = await apiClient.get<CourseApplication>(`/live-courses/applications/${id}/`);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب التقديم');
        }
        return response.data as CourseApplication;
      } catch (error: any) {
        logger.error('Failed to get application:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب التقديم');
      }
    },

    apply: async (data: CreateEnrollmentInput) => {
      try {
        logger.debug('Applying for course', { data });
        const response = await apiClient.post<CourseApplication>(`/live-courses/applications/`, data);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في التقديم');
        }
        return response.data as CourseApplication;
      } catch (error: any) {
        logger.error('Failed to apply:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في التقديم');
      }
    },

    review: async (id: string, data: { 
      status: 'ready_for_teacher' | 'rejected';
      learning_type?: 'individual' | 'group';
      rejection_reason?: string;
    }) => {
      try {
        logger.debug('Reviewing application', { id, data });
        const response = await apiClient.post(`/live-courses/applications/${id}/review_application/`, data);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في مراجعة التقديم');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to review application:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في مراجعة التقديم');
      }
    },

    approve: async (id: string, learningType?: 'individual' | 'group') => {
      try {
        logger.debug('Approving application', { id, learningType });
        const response = await apiClient.post(`/live-courses/applications/${id}/review_application/`, { 
          status: 'ready_for_teacher',
          learning_type: learningType || 'individual'
        });
        if (response.success === false) {
          throw new Error(response.error || 'فشل في الموافقة على التقديم');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to approve application:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في الموافقة على التقديم');
      }
    },

    reject: async (id: string, reason: string) => {
      try {
        logger.debug('Rejecting application', { id, reason });
        const response = await apiClient.post(`/live-courses/applications/${id}/review_application/`, { 
          status: 'rejected', 
          rejection_reason: reason 
        });
        if (response.success === false) {
          throw new Error(response.error || 'فشل في رفض التقديم');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to reject application:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في رفض التقديم');
      }
    },
  },

  // Enrollments
  enrollments: {
    list: async (params?: { 
      course?: string;
      status?: string;
      student?: number;
      page?: number;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.course) queryParams.append('course', params.course);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.student) queryParams.append('student', params.student.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      
      const url = `/live-education/enrollments/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      try {
        logger.debug('Listing enrollments', { params });
        const response = await apiClient.get<PaginatedResponse<Enrollment>>(url);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب التسجيلات');
        }
        return response.data as PaginatedResponse<Enrollment>;
      } catch (error: any) {
        logger.error('Failed to list enrollments:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب التسجيلات');
      }
    },

    get: async (id: string) => {
      try {
        logger.debug('Getting enrollment', { id });
        const response = await apiClient.get<Enrollment>(`/live-education/enrollments/${id}/`);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب التسجيل');
        }
        return response.data as Enrollment;
      } catch (error: any) {
        logger.error('Failed to get enrollment:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب التسجيل');
      }
    },

    create: async (data: CreateEnrollmentInput) => {
      try {
        logger.debug('Creating enrollment', { data });
        const response = await apiClient.post<Enrollment>(`/live-education/enrollments/`, data);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في إنشاء التسجيل');
        }
        return response.data as Enrollment;
      } catch (error: any) {
        logger.error('Failed to create enrollment:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إنشاء التسجيل');
      }
    },

    verifyPayment: async (enrollmentId: string, data: { receipt_image: File; education_type: 'individual' | 'group'; notes?: string }) => {
      try {
        logger.debug('Verifying payment', { enrollmentId, education_type: data.education_type });
        
        const formData = new FormData();
        formData.append('receipt_image', data.receipt_image);
        formData.append('education_type', data.education_type);
        if (data.notes) formData.append('notes', data.notes);

        const response = await apiClient.post(`/live-education/enrollments/${enrollmentId}/verify-payment/`, formData);
        
        if (response.success === false) {
          throw new Error(response.error || 'فشل في التحقق من الدفع');
        }
        
        return response.data;
      } catch (error: any) {
        logger.error('Failed to verify payment:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في التحقق من الدفع');
      }
    },

    updatePaymentStatus: async (enrollmentId: string, data: { payment_status: 'approved' | 'rejected'; rejection_reason?: string }) => {
      try {
        logger.debug('Updating payment status', { enrollmentId, data });
        const response = await apiClient.post(`/live-education/enrollments/${enrollmentId}/update-payment/`, data);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في تحديث حالة الدفع');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to update payment status:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحديث حالة الدفع');
      }
    },

    getPendingStudents: async (params?: { course?: string }) => {
      try {
        const queryParams = new URLSearchParams();
        if (params?.course) queryParams.append('course', params.course);
        
        const queryString = queryParams.toString();
        const url = `/live-courses/enrollments/pending_students${queryString ? '?' + queryString : ''}`;
        
        logger.debug('Getting pending students', { params });
        const response = await apiClient.get<PendingStudent[]>(url);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب الطلاب المعلقين');
        }
        return response.data as PendingStudent[];
      } catch (error: any) {
        logger.error('Failed to get pending students:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الطلاب المعلقين');
      }
    },
  },

  // Family Enrollments
  familyEnrollments: {
    create: async (data: FamilyEnrollmentRequest) => {
      try {
        logger.debug('Creating family enrollment', { data });
        const response = await apiClient.post(`/live-education/family-requests/`, data);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في إنشاء طلب العائلة');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to create family enrollment:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إنشاء طلب العائلة');
      }
    },
  },

  // Live Sessions
  sessions: {
    list: async (params?: { 
      batch?: string;
      status?: string;
      page?: number;
    }) => {
      try {
        const queryParams = new URLSearchParams();
        if (params?.batch) queryParams.append('batch', params.batch);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.page) queryParams.append('page', params.page.toString());
        
        const url = `/live-education/sessions/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        logger.debug('Listing sessions', { params });
        const response = await apiClient.get<PaginatedResponse<LiveSession>>(url);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب الجلسات');
        }
        return response.data as PaginatedResponse<LiveSession>;
      } catch (error: any) {
        logger.error('Failed to list sessions:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الجلسات');
      }
    },

    get: async (id: string) => {
      try {
        logger.debug('Getting session', { id });
        const response = await apiClient.get<LiveSession>(`/live-education/sessions/${id}/`);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب الجلسة');
        }
        return response.data as LiveSession;
      } catch (error: any) {
        logger.error('Failed to get session:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الجلسة');
      }
    },

    create: async (data: CreateLiveSessionInput) => {
      try {
        logger.debug('Creating session', { data });
        const response = await apiClient.post<LiveSession>(`/live-education/sessions/`, data);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في إنشاء الجلسة');
        }
        return response.data as LiveSession;
      } catch (error: any) {
        logger.error('Failed to create session:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إنشاء الجلسة');
      }
    },

    start: async (id: string) => {
      try {
        logger.debug('Starting session', { id });
        const response = await apiClient.post(`/live-education/sessions/${id}/start/`, {});
        if (response.success === false) {
          throw new Error(response.error || 'فشل في بدء الجلسة');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to start session:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في بدء الجلسة');
      }
    },

    end: async (id: string) => {
      try {
        logger.debug('Ending session', { id });
        const response = await apiClient.post(`/live-education/sessions/${id}/end/`, {});
        if (response.success === false) {
          throw new Error(response.error || 'فشل في إنهاء الجلسة');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to end session:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إنهاء الجلسة');
      }
    },
  },

  // Statistics
  statistics: {
    getCourseStats: async (courseId: string) => {
      try {
        logger.debug('Getting course statistics', { courseId });
        const response = await apiClient.get<CourseStatistics>(
          `/live-education/courses/${courseId}/statistics/`
        );
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب إحصائيات الدورة');
        }
        return response.data as CourseStatistics;
      } catch (error: any) {
        logger.error('Failed to get course statistics:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب إحصائيات الدورة');
      }
    },
  },

  // Payment Management
  payments: {
    list: async (params?: { 
      course?: string;
      learning_type?: 'individual' | 'group';
      status?: 'pending_review' | 'paid' | 'rejected';
      page?: number;
      ordering?: string;
    }) => {
      try {
        const queryParams = new URLSearchParams();
        if (params?.course) queryParams.append('course', params.course);
        if (params?.learning_type) queryParams.append('learning_type', params.learning_type);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.ordering) queryParams.append('ordering', params.ordering);
        
        const queryString = queryParams.toString();
        const url = `/live-education/payments${queryString ? '?' + queryString : ''}`;
        
        logger.debug('Listing payments', { params });
        const response = await apiClient.get<PaginatedResponse<PaymentStatusInfo>>(url);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب المدفوعات');
        }
        return response.data as PaginatedResponse<PaymentStatusInfo>;
      } catch (error: any) {
        logger.error('Failed to list payments:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب المدفوعات');
      }
    },

    get: async (id: string) => {
      try {
        logger.debug('Getting payment', { id });
        const response = await apiClient.get<PaymentStatusInfo>(`/live-education/payments/${id}/`);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب المدفوعة');
        }
        return response.data as PaymentStatusInfo;
      } catch (error: any) {
        logger.error('Failed to get payment:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب المدفوعة');
      }
    },

    upload: async (data: UploadPaymentReceiptInput) => {
      try {
        logger.debug('Uploading payment receipt', { data });
        const response = await apiClient.post(`/live-education/payments/`, data);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في رفع إيصال الدفع');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to upload payment receipt:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في رفع إيصال الدفع');
      }
    },

    review: async (id: string, data: ReviewPaymentInput) => {
      try {
        logger.debug('Reviewing payment', { id, data });
        const response = await apiClient.post(`/live-education/payments/${id}/review_payment/`, data);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في مراجعة الدفع');
        }
        return response.data;
      } catch (error: any) {
        logger.error('Failed to review payment:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في مراجعة الدفع');
      }
    },
  },

  // Course Enrollments (New structure)
  courseEnrollments: {
    list: async (params?: { 
      course?: string;
      current_batch?: string;
      status?: 'pending_payment' | 'paid_no_batch' | 'enrolled' | 'completed' | 'withdrawn';
      page?: number;
      ordering?: string;
    }) => {
      try {
        const queryParams = new URLSearchParams();
        if (params?.course) queryParams.append('course', params.course);
        if (params?.current_batch) queryParams.append('current_batch', params.current_batch);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.ordering) queryParams.append('ordering', params.ordering);
        
        const url = `/live-education/enrollments/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        logger.debug('Listing course enrollments', { params });
        const response = await apiClient.get<PaginatedResponse<CourseEnrollmentInfo>>(url);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب تسجيلات الدورة');
        }
        return response.data as PaginatedResponse<CourseEnrollmentInfo>;
      } catch (error: any) {
        logger.error('Failed to list course enrollments:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب تسجيلات الدورة');
      }
    },

    get: async (id: string) => {
      try {
        logger.debug('Getting course enrollment', { id });
        const response = await apiClient.get<CourseEnrollmentDetails>(`/live-education/enrollments/${id}/`);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب تفاصيل التسجيل');
        }
        return response.data as CourseEnrollmentDetails;
      } catch (error: any) {
        logger.error('Failed to get course enrollment:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب تفاصيل التسجيل');
      }
    },

    getPendingStudents: async (params?: { 
      course?: string;
      current_batch?: string;
      page?: number;
    }) => {
      try {
        const queryParams = new URLSearchParams();
        if (params?.course) queryParams.append('course', params.course);
        if (params?.current_batch) queryParams.append('current_batch', params.current_batch);
        if (params?.page) queryParams.append('page', params.page.toString());
        
        const queryString = queryParams.toString();
        const url = `/live-courses/enrollments/pending_students${queryString ? '?' + queryString : ''}`;
        
        logger.debug('Getting pending students', { params });
        const response = await apiClient.get<PaginatedResponse<PendingStudentInfo>>(url);
        if (response.success === false) {
          throw new Error(response.error || 'فشل في جلب الطلاب المعلقين');
        }
        return response.data as PaginatedResponse<PendingStudentInfo>;
      } catch (error: any) {
        logger.error('Failed to get pending students:', error);
        throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الطلاب المعلقين');
      }
    },
  },
};

export default liveEducationApi;

