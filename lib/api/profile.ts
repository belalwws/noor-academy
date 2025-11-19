/**
 * Profile API Service
 * Handles all profile-related API calls including image management
 */

import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

export interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: 'male' | 'female';
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  role: 'student' | 'teacher' | 'supervisor' | 'admin';
  last_login: string;
  date_joined: string;
  country_code: string;
  phone_number: string;
  age: number;
  preferred_language: 'ar' | 'en';
  bio: string;
  is_verified: boolean;
  is_profile_complete: boolean;
  is_profile_public: boolean;
  profile_image_url: string | null;
  profile_image_thumbnail_url: string | null;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  gender?: 'male' | 'female';
  country_code?: string;
  phone_number?: string;
  age?: number;
  preferred_language?: 'ar' | 'en';
  bio?: string;
  is_profile_public?: boolean;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

export interface ProfileImageResponse {
  success: boolean;
  message: string;
  data?: {
    profile_image_url: string;
    profile_image_thumbnail_url: string;
  };
  errors?: Record<string, string[]>;
}

export interface ProfileImageUrlsResponse {
  success: boolean;
  message: string;
  data: {
    profile_image_url: string | null;
    profile_image_thumbnail_url: string | null;
    expires_in?: number;
  };
}

/**
 * Get user profile
 */
export async function getProfile(): Promise<UserProfile> {
  try {
    logger.debug('Getting user profile');
    
    const response = await apiClient.get<UserProfile>('/auth/profile/');

    if (response.success === false) {
      throw new Error(response.error || 'فشل في تحميل بيانات الملف الشخصي');
    }

    return response.data as UserProfile;
  } catch (error: any) {
    logger.error('Failed to get profile:', error);
    throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحميل بيانات الملف الشخصي');
  }
}

/**
 * Update user profile (full update)
 */
export async function updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
  try {
    logger.debug('Updating profile', { data });
    
    const response = await apiClient.put<UserProfile>('/auth/profile/', data);

    if (response.success === false) {
      throw new Error(response.error || 'فشل في تحديث الملف الشخصي');
    }

    return response.data as UserProfile;
  } catch (error: any) {
    logger.error('Failed to update profile:', error);
    throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحديث الملف الشخصي');
  }
}

/**
 * Patch user profile (partial update)
 */
export async function patchProfile(data: Partial<ProfileUpdateData>): Promise<UserProfile> {
  try {
    logger.debug('Patching profile', { data });
    
    const response = await apiClient.patch<UserProfile>('/auth/profile/', data);

    if (response.success === false) {
      throw new Error(response.error || 'فشل في تحديث الملف الشخصي');
    }

    return response.data as UserProfile;
  } catch (error: any) {
    logger.error('Failed to patch profile:', error);
    throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحديث الملف الشخصي');
  }
}

/**
 * Change user password
 */
export async function changePassword(data: ChangePasswordData): Promise<{ message: string }> {
  try {
    logger.debug('Changing password');
    
    const response = await apiClient.post<{ message: string }>('/auth/profile/change-password/', data);

    if (response.success === false) {
      throw new Error(response.error || 'فشل في تغيير كلمة المرور');
    }

    return response.data as { message: string };
  } catch (error: any) {
    logger.error('Failed to change password:', error);
    throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تغيير كلمة المرور');
  }
}

/**
 * Upload profile image
 * Max size: 5MB
 * Formats: JPEG, PNG, WebP
 */
export async function uploadProfileImage(file: File): Promise<ProfileImageResponse> {
  try {
    logger.debug('Uploading profile image', { fileName: file.name, fileSize: file.size });
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiClient.post<ProfileImageResponse>('/auth/profile/image/upload/', formData);

    if (response.success === false) {
      throw new Error(response.error || 'فشل في رفع الصورة');
    }

    return response.data as ProfileImageResponse;
  } catch (error: any) {
    logger.error('Failed to upload profile image:', error);
    throw new Error(error?.appError?.userMessage || error?.message || 'فشل في رفع الصورة');
  }
}

/**
 * Delete profile image
 */
export async function deleteProfileImage(): Promise<{ success: boolean; message: string }> {
  try {
    logger.debug('Deleting profile image');
    
    const response = await apiClient.delete<{ success: boolean; message: string }>('/auth/profile/image/delete/');

    if (response.success === false) {
      throw new Error(response.error || 'فشل في حذف الصورة');
    }

    return response.data as { success: boolean; message: string };
  } catch (error: any) {
    logger.error('Failed to delete profile image:', error);
    throw new Error(error?.appError?.userMessage || error?.message || 'فشل في حذف الصورة');
  }
}

/**
 * Get profile image signed URLs (expire after 1 hour)
 */
export async function getProfileImageUrls(): Promise<ProfileImageUrlsResponse> {
  try {
    logger.debug('Getting profile image URLs');
    
    const response = await apiClient.get<ProfileImageUrlsResponse>('/auth/profile/image/urls/');

    // Even if 404 (no images), return the data
    if (response.success === false && response.status !== 404) {
      throw new Error(response.error || 'فشل في جلب روابط الصورة');
    }

    return response.data as ProfileImageUrlsResponse;
  } catch (error: any) {
    logger.error('Failed to get profile image URLs:', error);
    throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب روابط الصورة');
  }
}

/**
 * Send email verification link
 */
export async function sendEmailVerification(email: string): Promise<{ message: string }> {
  try {
    logger.debug('Sending email verification', { email });
    
    const response = await apiClient.post<{ message: string }>('/auth/email-verification/send/', { email });

    if (response.success === false) {
      throw new Error(response.error || 'فشل في إرسال رابط التحقق');
    }

    return response.data as { message: string };
  } catch (error: any) {
    logger.error('Failed to send email verification:', error);
    throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إرسال رابط التحقق');
  }
}

/**
 * Confirm email address
 */
export async function confirmEmail(uidb64: string, token: string): Promise<{ access: string; refresh: string }> {
  try {
    logger.debug('Confirming email', { uidb64 });
    
    const response = await apiClient.get<{ access: string; refresh: string }>(
      `/auth/email-verification/confirm/${uidb64}/${token}/`
    );

    if (response.success === false) {
      throw new Error(response.error || 'فشل في تأكيد البريد الإلكتروني');
    }

    return response.data as { access: string; refresh: string };
  } catch (error: any) {
    logger.error('Failed to confirm email:', error);
    throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تأكيد البريد الإلكتروني');
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  try {
    logger.debug('Requesting password reset', { email });
    
    const response = await apiClient.post<{ message: string }>('/auth/password-reset/', { email });

    if (response.success === false) {
      throw new Error(response.error || 'فشل في إرسال رابط إعادة التعيين');
    }

    return response.data as { message: string };
  } catch (error: any) {
    logger.error('Failed to request password reset:', error);
    throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إرسال رابط إعادة التعيين');
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  uidb64: string,
  token: string,
  new_password: string
): Promise<{ message: string }> {
  try {
    logger.debug('Resetting password', { uidb64 });
    
    const response = await apiClient.post<{ message: string }>('/auth/reset-password/', {
      uidb64,
      token,
      new_password
    });

    if (response.success === false) {
      throw new Error(response.error || 'فشل في إعادة تعيين كلمة المرور');
    }

    return response.data as { message: string };
  } catch (error: any) {
    logger.error('Failed to reset password:', error);
    throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إعادة تعيين كلمة المرور');
  }
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'يجب أن تكون الصورة بصيغة JPEG أو PNG أو WebP' };
  }

  // Check file size (5MB = 5 * 1024 * 1024 bytes)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'حجم الصورة يجب أن لا يتجاوز 5 ميجابايت' };
  }

  return { valid: true };
}

/**
 * Get user stats (basic statistics)
 */
export async function getUserStats(): Promise<any> {
  try {
    logger.debug('Getting user stats');
    
    const response = await apiClient.get<any>('/auth/stats/');

    if (response.success === false) {
      throw new Error(response.error || 'فشل في تحميل الإحصائيات');
    }

    return response.data;
  } catch (error: any) {
    logger.error('Failed to get user stats:', error);
    throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحميل الإحصائيات');
  }
}
