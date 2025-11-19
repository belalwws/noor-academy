import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

// Helper function removed - apiClient handles authentication automatically

export interface SupervisorProfileData {
  id?: number;
  username: string;
  full_name?: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  role: string;
  last_login?: string;
  date_joined: string;
  country_code: string;
  phone_number: string;
  age: number;
  learning_goal?: string;
  preferred_language: string;
  bio: string;
  is_verified: boolean;
  is_profile_complete: boolean;
  is_profile_public?: boolean;
  profile_image_url: string;
  profile_image_thumbnail_url: string;
  // Additional fields that might come from other endpoints
  department?: string;
  specialization?: string;
  areas_of_responsibility?: string;
  experience?: string;
  achievements?: string;
}

export interface ProfileCompletionStatus {
  is_complete: boolean;
  completion_percentage: number;
  missing_fields: string[];
  required_fields: string[];
}

export interface ProfileAPIResponse {
  success: boolean;
  message: string;
  data: {
    completion_percentage: number;
    is_completed: boolean;
    is_complete?: boolean;
    missing_fields: string[];
    required_fields?: string[];
  };
}

export class SupervisorProfileAPI {
  // Get profile completion status from main profile endpoint
  static async getProfileStatus(): Promise<ProfileCompletionStatus> {
    logger.debug('🔄 Fetching profile completion status from /supervisors/profile/');
    
    try {
      const response = await apiClient.get('/supervisors/profile/');

      if (response.success === false) {
        logger.error('❌ Profile status error:', response.error);
        throw new Error(response.error || 'Failed to fetch profile status');
      }

      const response_data = response.data as any;
      logger.debug('✅ Profile status response received');
      
      // Extract completion status from the nested data object
      const profileData = response_data.data || response_data;
      logger.debug('📊 Extracted profile data');
    
      return {
        is_complete: profileData.is_completed || profileData.is_complete || false,
        completion_percentage: profileData.completion_percentage || 0,
        missing_fields: profileData.missing_fields || [],
        required_fields: profileData.required_fields || []
      };
    } catch (error: any) {
      logger.error('Failed to get profile status:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to fetch profile status');
    }
  }

  // Get profile completion status from status endpoint (fallback)
  static async getProfileStatusFromStatusEndpoint(): Promise<ProfileCompletionStatus> {
    try {
      const response = await apiClient.get('/supervisors/profile/status/');

      if (response.success === false) {
        throw new Error(response.error || 'Failed to get profile status');
      }

      return response.data as ProfileCompletionStatus;
    } catch (error: any) {
      logger.error('Failed to get profile status from status endpoint:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to get profile status');
    }
  }

  // Get profile data from /auth/profile/ endpoint - REAL DATA
  static async getProfileData(): Promise<SupervisorProfileData> {
    logger.debug('🔄 Fetching REAL profile data from /auth/profile/');
    
    try {
      const response = await apiClient.get('/auth/profile/');

      if (response.success === false) {
        logger.error('❌ Profile data error:', response.error);
        throw new Error(response.error || 'Failed to get profile data');
      }

      const profileData = response.data as any;
      logger.debug('✅ REAL Profile data from /auth/profile/ received');
      
      // Map the REAL API response to our interface - NO FAKE DATA
      const mappedData: SupervisorProfileData = {
        id: profileData.id,
        username: profileData.username,
        full_name: profileData.full_name,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        gender: profileData.gender,
        is_active: profileData.is_active,
        is_staff: profileData.is_staff,
        is_superuser: profileData.is_superuser,
        role: profileData.role,
        last_login: profileData.last_login,
        date_joined: profileData.date_joined,
        country_code: profileData.country_code,
        phone_number: profileData.phone_number,
        age: profileData.age,
        learning_goal: profileData.learning_goal,
        preferred_language: profileData.preferred_language,
        bio: profileData.bio,
        is_verified: profileData.is_verified,
        is_profile_complete: profileData.is_profile_complete,
        is_profile_public: profileData.is_profile_public,
        profile_image_url: profileData.profile_image_url,
        profile_image_thumbnail_url: profileData.profile_image_thumbnail_url,
        // These might not exist in /auth/profile/ but we keep them optional
        department: profileData.department,
        specialization: profileData.specialization,
        areas_of_responsibility: profileData.areas_of_responsibility,
        experience: profileData.experience,
        achievements: profileData.achievements
      };
      
      logger.debug('🗂️ Mapped REAL profile data (NO FAKE DATA)');
      return mappedData;
    } catch (error: any) {
      logger.error('Failed to get profile data:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to get profile data');
    }
  }

  // Get profile completion data from complete endpoint (fallback)
  static async getProfileDataFromCompleteEndpoint(): Promise<SupervisorProfileData> {
    try {
      const response = await apiClient.get('/supervisors/profile/complete/');

      if (response.success === false) {
        throw new Error(response.error || 'Failed to get profile data');
      }

      return response.data as SupervisorProfileData;
    } catch (error: any) {
      logger.error('Failed to get profile data from complete endpoint:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to get profile data');
    }
  }

  // Complete supervisor profile (PUT - full update)
  static async completeProfile(data: SupervisorProfileData): Promise<SupervisorProfileData> {
    logger.debug('🔍 Completing supervisor profile');

    try {
      const response = await apiClient.put('/supervisors/profile/complete/', data);

      if (response.success === false) {
        logger.error('❌ Profile completion error:', response.error);
        throw new Error(response.error || 'Failed to complete profile');
      }

      logger.debug('✅ Profile completed successfully');
      return response.data as SupervisorProfileData;
    } catch (error: any) {
      logger.error('Failed to complete profile:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to complete profile');
    }
  }

  // Partially update supervisor profile (PATCH - partial update)
  static async updateProfile(data: Partial<SupervisorProfileData>): Promise<SupervisorProfileData> {
    logger.debug('🔍 Updating supervisor profile via /auth/profile/');

    try {
      const response = await apiClient.patch('/auth/profile/', data);

      if (response.success === false) {
        logger.error('❌ Profile update error:', response.error);
        throw new Error(response.error || 'Failed to update profile');
      }

      logger.debug('✅ Profile updated successfully');
      return response.data as SupervisorProfileData;
    } catch (error: any) {
      logger.error('Failed to update profile:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to update profile');
    }
  }

  // Check if profile completion is required
  static async checkCompletionRequirement(): Promise<{ requires_completion: boolean }> {
    try {
      const response = await apiClient.get('/supervisors/check-completion/');

      if (response.success === false) {
        throw new Error(response.error || 'Failed to check completion requirement');
      }

      return response.data as { requires_completion: boolean };
    } catch (error: any) {
      logger.error('Failed to check completion requirement:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'Failed to check completion requirement');
    }
  }
}

