import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

export interface StudentEnrollment {
  id?: string;
  student_name: string;
  student_email: string;
  course_title: string;
  teacher_name: string;
  enrollment_status: string;
  enrollment_id?: string;
  course_id?: string;
  student_id?: string;
  enrollment_date?: string;
}

export interface Student {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_joined: string;
  is_active: boolean;
  courses_count?: number;
  enrollments?: CourseEnrollment[];
}

export interface CourseEnrollment {
  id: string;
  student: Student;
  course: {
    id: string;
    title: string;
    teacher_name: string;
  };
  enrollment_date: string;
  status: 'active' | 'completed' | 'dropped';
}

export interface AllStudentsResponse {
  count: number;
  results: Student[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  learning_outcomes: string;
  course_type: string;
  course_type_display: string;
  subjects: string;
  max_students: number;
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  teacher_specialization: string;
  approval_status: string;
  approval_status_display: string;
  is_published: boolean;
  approved_by_name: string;
  approved_at: string;
  rejection_reason: string;
  enrolled_count: number;
  available_spots: string;
  created_at: string;
  updated_at: string;
}

export interface CoursesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Course[];
}

export interface PendingCourse {
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

export interface PendingCoursesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PendingCourse[];
}

export class GeneralSupervisorAPI {
  // Get all students in the system
  static async getAllStudents(): Promise<AllStudentsResponse> {
    try {
      logger.debug('Getting all students');
      const response = await apiClient.get<AllStudentsResponse>('/supervisors/general/all-students/');
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب الطلاب');
      }

      const data = response.data as any;
      logger.debug('Students response data:', data);
      
      // Handle different response formats
      if (data.data && data.data.results && !data.results) {
        // Handle nested data.results format
        return {
          count: data.data.count || 0,
          results: data.data.results || []
        };
      } else if (data.data && !data.results) {
        return {
          count: data.count || 0,
          results: data.data || []
        };
      }
      
      return data as AllStudentsResponse;
    } catch (error: any) {
      logger.error('Failed to get all students:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الطلاب');
    }
  }

  // Get all courses by assigned teachers (Academic Supervisor endpoint)
  static async getAllCourses(): Promise<Course[]> {
    try {
      logger.debug('Fetching teacher courses');
      const response = await apiClient.get<Course[]>('/supervisors/academic/teacher-courses/');
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب دورات المعلمين');
      }

      const data = response.data as Course[];
      logger.debug('Teacher courses fetched:', data?.length || 0);
      return data;
    } catch (error: any) {
      logger.error('Failed to get all courses:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب دورات المعلمين');
    }
  }

  // Get pending courses for General Supervisor
  static async getPendingCourses(params?: {
    page?: number;
    search?: string;
    course_type?: string;
    approval_status?: 'pending' | 'approved' | 'rejected' | 'under_review';
    is_published?: boolean;
    ordering?: string;
  }): Promise<PendingCoursesResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.course_type) queryParams.append('course_type', params.course_type);
      if (params?.approval_status) queryParams.append('approval_status', params.approval_status);
      if (params?.is_published !== undefined) queryParams.append('is_published', params.is_published.toString());
      if (params?.ordering) queryParams.append('ordering', params.ordering);

      const url = `/live-education/courses/pending-for-supervisor/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      logger.debug('Fetching pending courses', { params });

      const response = await apiClient.get<PendingCoursesResponse>(url);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب الدورات المعلقة');
      }

      const data = response.data as PendingCoursesResponse;
      logger.debug('Pending courses fetched:', { count: data.results?.length || 0, approval_status: params?.approval_status });
      
      return data;
    } catch (error: any) {
      logger.error('Failed to get pending courses:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الدورات المعلقة');
    }
  }

  // Get all courses for General Supervisor with comprehensive filtering
  static async getAllCoursesForSupervisor(params?: {
    page?: number;
    search?: string;
    course_type?: 'individual' | 'family' | 'group_private' | 'group_public';
    approval_status?: 'pending' | 'approved' | 'rejected' | 'under_review';
    is_published?: boolean;
    ordering?: string;
  }): Promise<PendingCoursesResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.course_type) queryParams.append('course_type', params.course_type);
      if (params?.approval_status) queryParams.append('approval_status', params.approval_status);
      if (params?.is_published !== undefined) queryParams.append('is_published', params.is_published.toString());
      if (params?.ordering) queryParams.append('ordering', params.ordering);

      const url = `/live-education/courses/pending-for-supervisor/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      logger.debug('Fetching all courses for supervisor', { params });

      const response = await apiClient.get<PendingCoursesResponse>(url);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب الدورات');
      }

      const data = response.data as PendingCoursesResponse;
      logger.debug('Courses fetched:', { count: data.results?.length || 0 });
      
      return data;
    } catch (error: any) {
      logger.error('Failed to get all courses for supervisor:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الدورات');
    }
  }

  // Get pending teachers for General Supervisor
  static async getPendingTeachers(): Promise<any[]> {
    try {
      logger.debug('Fetching pending teachers');
      const response = await apiClient.get<any[]>('/supervisors/general/pending-teachers/');
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب المعلمين المعلقين');
      }

      const data = response.data as any[];
      logger.debug('Pending teachers fetched:', { count: data?.length || 0 });
      
      return data;
    } catch (error: any) {
      logger.error('Failed to get pending teachers:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب المعلمين المعلقين');
    }
  }

  // Force delete a course (General Supervisor only)
  static async forceDeleteCourse(courseId: string): Promise<void> {
    try {
      logger.debug('Force deleting course', { courseId });
      const response = await apiClient.delete(`/live-education/courses/${courseId}/force_delete/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في حذف الدورة');
      }

      logger.debug('Course deleted successfully');
    } catch (error: any) {
      logger.error('Failed to force delete course:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في حذف الدورة');
    }
  }

  // Remove student from course (General Supervisor only)
  static async removeStudentFromCourse(enrollmentId: string): Promise<void> {
    try {
      logger.debug('Removing student from course', { enrollmentId });
      const response = await apiClient.delete(`/live-education/enrollments/${enrollmentId}/remove_student/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في إزالة الطالب');
      }

      logger.debug('Student removed successfully');
    } catch (error: any) {
      logger.error('Failed to remove student from course:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إزالة الطالب');
    }
  }
}
