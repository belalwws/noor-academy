import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

// Types for Academic Supervisor Profile
export interface AcademicSupervisorProfileData {
  id?: number;
  // Personal Information
  first_name?: string;
  last_name?: string;
  full_name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  country_code?: string;
  age?: number;
  gender?: string;
  bio?: string;
  
  // Professional Information
  department?: string;
  specialization?: string;
  academic_degree?: string;
  years_of_experience?: number;
  areas_of_responsibility?: string;
  experience?: string;
  achievements?: string;
  technical_skills?: string;
  
  // System Information
  role?: string;
  is_active?: boolean;
  is_verified?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  date_joined?: string;
  last_login?: string;
  preferred_language?: string;
  learning_goal?: string;
  profile_image_url?: string;
  profile_image_thumbnail_url?: string;
  
  // Academic Supervisor Specific
  assigned_teachers_count?: number;
  supervised_courses_count?: number;
  is_profile_complete?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileStatus {
  is_complete: boolean;
  completion_percentage: number;
  missing_fields: string[];
  required_fields: string[];
}

export interface DashboardStats {
  supervisor_info: {
    id: number;
    type: string;
    user_email: string;
  };
  teachers: {
    total_assigned: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  courses: {
    total: number;
    pending: number;
    approved: number;
    published: number;
  };
  students: {
    total_enrolled: number;
    active_enrollments: number;
  };
  summary: {
    active_sessions: number;
    average_rating: number;
  };
}

export interface Teacher {
  id: number;
  user_name: string;
  user_email: string;
  specialization: string;
  specialization_display: string;
  approval_status: string;
  approval_status_display: string;
  academic_supervisor: string;
  academic_supervisor_name: string;
  years_of_experience: number;
  created_at: string;
  approved_at: string;
  relationship_id: string;
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

export interface Student {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_age: number;
  student_education_level: string;
  student_learning_goals: string;
  course_id: string;
  course_title: string;
  course_type: string;
  course_type_display: string;
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  status: string;
  status_display: string;
  enrolled_at: string;
  approved_at: string;
  approved_by_name: string;
  is_family_enrollment: string;
  family_representative: string;
}

export class AcademicSupervisorProfileAPI {
  private static async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      logger.debug('Making academic supervisor API call:', { endpoint, method: options.method || 'GET' });

      let response;
      const method = options.method || 'GET';
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      switch (method) {
        case 'GET':
          response = await apiClient.get<T>(cleanEndpoint);
          break;
        case 'POST':
          const postBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.post<T>(cleanEndpoint, postBody);
          break;
        case 'PUT':
          const putBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.put<T>(cleanEndpoint, putBody);
          break;
        case 'PATCH':
          const patchBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
          response = await apiClient.patch<T>(cleanEndpoint, patchBody);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(cleanEndpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (response.success === false) {
        logger.error('Academic supervisor API call failed:', { status: response.status, error: response.error });
        throw new Error(response.error || `HTTP ${response.status}: Request failed`);
      }

      return response.data as T;
    } catch (error: any) {
      logger.error('Academic supervisor API call error:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'API call failed');
    }
  }

  // Profile Management - Use the dedicated status API
  static async getProfileStatus(): Promise<ProfileStatus> {
    const data = await this.apiCall<any>('/supervisors/profile/');
    
    // Handle both direct response and nested data
    const profileData = data.data || data;
    
    return {
      is_complete: profileData.is_completed || profileData.is_complete || false,
      completion_percentage: profileData.completion_percentage || 0,
      missing_fields: profileData.missing_fields || [],
      required_fields: profileData.required_fields || []
    };
  }

  static async getProfileData(): Promise<AcademicSupervisorProfileData> {
    return await this.apiCall<AcademicSupervisorProfileData>('/auth/profile/');
  }

  // Update profile using PATCH /supervisors/profile/complete/ for partial updates
  static async updateProfile(data: Partial<AcademicSupervisorProfileData>): Promise<AcademicSupervisorProfileData> {
    return await this.apiCall<AcademicSupervisorProfileData>('/supervisors/profile/complete/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Complete profile (PUT - Full completion)
  static async completeProfile(profileData: Partial<AcademicSupervisorProfileData>): Promise<AcademicSupervisorProfileData> {
    return await this.apiCall<AcademicSupervisorProfileData>('/supervisors/profile/complete/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Partially complete profile (PATCH - Partial update)
  static async partiallyCompleteProfile(profileData: Partial<AcademicSupervisorProfileData>): Promise<AcademicSupervisorProfileData> {
    return await this.apiCall<AcademicSupervisorProfileData>('/supervisors/profile/complete/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // Get profile completion status
  static async getProfileCompletionStatus(): Promise<ProfileStatus> {
    return await this.apiCall<ProfileStatus>('/supervisors/profile/status/');
  }

  // Check profile completion requirement
  static async checkCompletionRequirement(): Promise<{ requires_completion: boolean; completion_percentage: number }> {
    return await this.apiCall<{ requires_completion: boolean; completion_percentage: number }>('/supervisors/check-completion/');
  }

  // Dashboard Data
  static async getDashboardStats(): Promise<DashboardStats> {
    return await this.apiCall<DashboardStats>('/supervisors/academic/dashboard/statistics/');
  }

  static async getAssignedTeachers(): Promise<Teacher[]> {
    const response = await this.apiCall<{ results?: Teacher[]; data?: Teacher[] } | Teacher[]>('/supervisors/academic/assigned-teachers/');
    
    if (Array.isArray(response)) {
      return response;
    } else if (response.results && Array.isArray(response.results)) {
      return response.results;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  }

  static async getTeacherCourses(): Promise<Course[]> {
    const response = await this.apiCall<{ results?: Course[]; data?: Course[] } | Course[]>('/supervisors/academic/teacher-courses/');
    
    if (Array.isArray(response)) {
      return response;
    } else if (response.results && Array.isArray(response.results)) {
      return response.results;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  }

  static async getTeacherStudents(): Promise<Student[]> {
    const response = await this.apiCall<{ results?: Student[]; data?: Student[] } | Student[]>('/supervisors/academic/teacher-students/');
    
    if (Array.isArray(response)) {
      return response;
    } else if (response.results && Array.isArray(response.results)) {
      return response.results;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  }
}
