// Enrollment API Service
import apiService from '../api';
import { logger } from '../utils/logger';

export interface EnrollmentData {
  student: number;
  course: number;
  schedule?: string;
  payment_status: string;
  progress_percentage?: number;
  payment_method?: string;
  amount_paid?: string;
  notes?: string;
}

export interface Enrollment {
  id: string;
  student: number;
  student_name: string;
  course: number;
  course_title: string;
  schedule: string;
  schedule_teacher_name: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  payment_status: string;
  enrollment_date: string;
  completion_date?: string;
  progress_percentage: number;
  payment_method: string;
  amount_paid: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface StudentCourse {
  id: number;
  title: string;
  description: string;
  instructor_name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  enrolled_count: number;
  computed_max_students: number;
  is_enrolled: boolean;
  created_at: string;
}

export interface StudentEnrollment {
  id: number;
  course: number;
  course_title: string;
  course_description: string;
  instructor_name: string;
  enrolled_at: string;
  completed: boolean;
  completion_date?: string;
  progress_percentage: number;
}

export interface TeacherStats {
  total_courses: number;
  total_students: number;
  pending_assignments: number;
  completed_sessions: number;
  average_rating: number;
  recent_activity: Array<{
    [key: string]: string;
  }>;
}

class EnrollmentService {
  // Get all enrollments (admin/teacher view)
  async getEnrollments(page?: number) {
    try {
      const params = page ? { page } : {};
      const response = await apiService.get('/api/enrollments/', { params });
      return response.data;
    } catch (error) {
      logger.error('❌ Error fetching enrollments:', error);
      throw error;
    }
  }

  // Create new enrollment
  async createEnrollment(enrollmentData: EnrollmentData) {
    try {
      logger.debug('📝 Creating enrollment:', enrollmentData);
      const response = await apiService.post('/api/enrollments/', enrollmentData);
      logger.debug('✅ Enrollment created successfully:', response.data);
      return response.data;
    } catch (error) {
      logger.error('❌ Error creating enrollment:', error);
      throw error;
    }
  }

  // Get enrollment details
  async getEnrollmentDetails(enrollmentId: string) {
    try {
      const response = await apiService.get(`/api/enrollments/${enrollmentId}/`);
      return response.data;
    } catch (error) {
      logger.error('❌ Error fetching enrollment details:', error);
      throw error;
    }
  }

  // Get available courses for students
  async getAvailableCourses(page?: number): Promise<{ count: number; results: StudentCourse[] }> {
    try {
      const params = page ? { page } : {};
      logger.debug('🔍 Fetching courses from /api/courses/...');
      const response = await apiService.get('/api/courses/', { params });

      logger.debug('📡 API Response:', response.data);

      // Handle different response formats
      if (response.data.results) {
        // Paginated response
        logger.debug('✅ Found paginated courses:', response.data.results.length);
        return {
          count: response.data.count || response.data.results.length,
          results: response.data.results
        };
      } else if (Array.isArray(response.data)) {
        // Direct array response
        logger.debug('✅ Found direct array courses:', response.data.length);
        return {
          count: response.data.length,
          results: response.data
        };
      } else if (response.data.status === 'success' && response.data.data) {
        // Success wrapper response
        logger.debug('✅ Found wrapped courses:', response.data.data.length);
        return {
          count: response.data.data.length,
          results: response.data.data
        };
      } else {
        logger.debug('⚠️ No courses found in response');
        return {
          count: 0,
          results: []
        };
      }
    } catch (error) {
      logger.error('❌ Error fetching available courses:', error);
      throw error;
    }
  }

  // Get course details for students
  async getCourseDetails(courseId: number) {
    try {
      logger.debug(`🔍 Fetching course details for ID: ${courseId}`);
      const response = await apiService.get(`/api/courses/${courseId}/`);
      logger.debug('📡 Course details response:', response.data);
      return response.data;
    } catch (error) {
      logger.error('❌ Error fetching course details:', error);
      throw error;
    }
  }

  // Get course content with lessons
  async getCourseContent(courseId?: number) {
    try {
      const url = courseId ? `/api/content/course-content/${courseId}/` : '/api/content/course-content/';
      logger.debug(`🔍 Fetching course content from: ${url}`);
      const response = await apiService.get(url);
      logger.debug('📡 Course content response:', response.data);
      return response.data;
    } catch (error) {
      logger.error('❌ Error fetching course content:', error);
      throw error;
    }
  }

  // Get teacher statistics
  async getTeacherStats() {
    try {
      logger.debug('🔍 Fetching teacher statistics...');
      const response = await apiService.get('/teachers/profiles/stats/');
      logger.debug('📡 Teacher stats response:', response.data);
      return response.data;
    } catch (error) {
      logger.error('❌ Error fetching teacher statistics:', error);
      throw error;
    }
  }

  // Get student's enrollments
  async getStudentEnrollments(page?: number): Promise<{ count: number; results: StudentEnrollment[] }> {
    try {
      const params = page ? { page } : {};
      const response = await apiService.get('/api/students/enrollments/', { params });
      return response.data;
    } catch (error) {
      logger.error('❌ Error fetching student enrollments:', error);
      throw error;
    }
  }

  // Get specific enrollment details for student
  async getStudentEnrollmentDetails(enrollmentId: string) {
    try {
      const response = await apiService.get(`/api/students/enrollments/${enrollmentId}/`);
      return response.data;
    } catch (error) {
      logger.error('❌ Error fetching student enrollment details:', error);
      throw error;
    }
  }

  // Get student notifications
  async getStudentNotifications() {
    try {
      const response = await apiService.get('/api/students/notifications/');
      return response.data;
    } catch (error) {
      logger.error('❌ Error fetching student notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string) {
    try {
      const response = await apiService.post(`/api/students/notifications/${notificationId}/mark_read/`);
      return response.data;
    } catch (error) {
      logger.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    try {
      const response = await apiService.post('/api/students/notifications/mark_all_read/');
      return response.data;
    } catch (error) {
      logger.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get student progress
  async getStudentProgress() {
    try {
      const response = await apiService.get('/api/students/progress/');
      return response.data;
    } catch (error) {
      logger.error('❌ Error fetching student progress:', error);
      throw error;
    }
  }

  // Get specific progress details
  async getProgressDetails(progressId: string) {
    try {
      const response = await apiService.get(`/api/students/progress/${progressId}/`);
      return response.data;
    } catch (error) {
      logger.error('❌ Error fetching progress details:', error);
      throw error;
    }
  }

  // Student assignments
  async getStudentAssignments() {
    try {
      const response = await apiService.get('/api/students/assignments/');
      return response.data;
    } catch (error) {
      logger.error('❌ Error fetching student assignments:', error);
      throw error;
    }
  }

  // Submit assignment
  async submitAssignment(assignmentData: any) {
    try {
      const response = await apiService.post('/api/students/assignments/', assignmentData);
      return response.data;
    } catch (error) {
      logger.error('❌ Error submitting assignment:', error);
      throw error;
    }
  }

  // Get assignment submission details
  async getAssignmentDetails(assignmentId: string) {
    try {
      const response = await apiService.get(`/api/students/assignments/${assignmentId}/`);
      return response.data;
    } catch (error) {
      logger.error('❌ Error fetching assignment details:', error);
      throw error;
    }
  }

  // Update assignment submission
  async updateAssignment(assignmentId: string, assignmentData: any) {
    try {
      const response = await apiService.put(`/api/students/assignments/${assignmentId}/`, assignmentData);
      return response.data;
    } catch (error) {
      logger.error('❌ Error updating assignment:', error);
      throw error;
    }
  }

  // Delete assignment submission
  async deleteAssignment(assignmentId: string) {
    try {
      const response = await apiService.delete(`/api/students/assignments/${assignmentId}/`);
      return response.data;
    } catch (error) {
      logger.error('❌ Error deleting assignment:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const enrollmentService = new EnrollmentService();
export default enrollmentService;
