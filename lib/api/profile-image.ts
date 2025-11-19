import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

// Types for Profile Image APIs
export interface ProfileImageUploadResponse {
  success: boolean;
  message: string;
  data: {
    profile_image_url: string;
    profile_image_thumbnail_url: string;
  };
}

export interface ProfileImageDeleteResponse {
  success: boolean;
  message: string;
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

export interface ProfileImageError {
  success: false;
  message: string;
  errors?: {
    image?: string[];
  };
}

export class ProfileImageAPI {
  private static async apiCall<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    try {
      logger.debug(`Making ${method} request to ${endpoint}`);

      let response: any;

      switch (method) {
        case 'GET':
          response = await apiClient.get<T>(endpoint);
          break;
        case 'POST':
          response = await apiClient.post<T>(endpoint, body);
          break;
        case 'PUT':
          response = await apiClient.put<T>(endpoint, body);
          break;
        case 'PATCH':
          response = await apiClient.patch<T>(endpoint, body);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(endpoint);
          break;
      }

      if (response.success === false) {
        throw new Error(response.error || `HTTP ${response.status}`);
      }

      return response.data as T;
    } catch (error: any) {
      logger.error(`API call failed for ${method} ${endpoint}:`, error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في العملية');
    }
  }

  /**
   * Upload a profile image
   * @param imageFile - The image file to upload (JPEG, PNG, WebP)
   * @returns Promise with upload response
   */
  static async uploadProfileImage(imageFile: File): Promise<ProfileImageUploadResponse> {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error('نوع الملف غير مدعوم. يرجى استخدام JPEG أو PNG أو WebP');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      throw new Error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
    }

    logger.debug('Uploading profile image', { fileName: imageFile.name, fileSize: imageFile.size });

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await apiClient.post<ProfileImageUploadResponse>('/auth/profile/image/upload/', formData);

      if (response.success === false) {
        // Handle specific error cases
        if (response.status === 429) {
          throw new Error('تم تجاوز الحد المسموح. يمكنك رفع 5 صور فقط في الساعة');
        }
        throw new Error(response.error || 'خطأ في رفع الصورة');
      }

      return response.data as ProfileImageUploadResponse;
    } catch (error: any) {
      logger.error('Failed to upload profile image:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'خطأ في رفع الصورة');
    }
  }

  /**
   * Delete the current profile image
   * @returns Promise with deletion response
   */
  static async deleteProfileImage(): Promise<ProfileImageDeleteResponse> {
    try {
      logger.debug('Deleting profile image');
      
      return await this.apiCall<ProfileImageDeleteResponse>('/auth/profile/image/delete/', 'DELETE');
    } catch (error: any) {
      if (error.message.includes('404') || error?.status === 404) {
        throw new Error('لا توجد صورة شخصية للحذف');
      }
      logger.error('Failed to delete profile image:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في حذف الصورة');
    }
  }

  /**
   * Get signed URLs for profile images
   * @returns Promise with image URLs
   */
  static async getProfileImageUrls(): Promise<ProfileImageUrlsResponse> {
    try {
      logger.debug('Getting profile image URLs');
      
      const response = await apiClient.get<ProfileImageUrlsResponse>('/auth/profile/image/urls/');
      
      if (response.success === false && response.status === 404) {
        // Return empty URLs if no images found
        return {
          success: false,
          message: 'لا توجد صور شخصية',
          data: {
            profile_image_url: null,
            profile_image_thumbnail_url: null,
          }
        };
      }

      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب روابط الصورة');
      }

      return response.data as ProfileImageUrlsResponse;
    } catch (error: any) {
      if (error.message.includes('404') || error?.status === 404) {
        // Return empty URLs if no images found
        return {
          success: false,
          message: 'لا توجد صور شخصية',
          data: {
            profile_image_url: null,
            profile_image_thumbnail_url: null,
          }
        };
      }
      logger.error('Failed to get profile image URLs:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب روابط الصورة');
    }
  }

  /**
   * Get proxied image URL to avoid CORS issues
   * @param imageUrl - The original image URL
   * @returns Proxied image URL
   */
  static getProxiedImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    
    const encodedUrl = encodeURIComponent(imageUrl);
    // Remove /api from the base URL for image proxy
    const baseUrl = process.env['NEXT_PUBLIC_API_URL']?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}/auth/image-proxy/?url=${encodedUrl}`;
  }

  /**
   * Validate image file before upload
   * @param file - The file to validate
   * @returns Validation result
   */
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'نوع الملف غير مدعوم. يرجى استخدام JPEG أو PNG أو WebP'
      };
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت'
      };
    }

    return { isValid: true };
  }

  /**
   * Create image preview URL for display
   * @param file - The image file
   * @returns Promise with preview URL
   */
  static createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('فشل في إنشاء معاينة الصورة'));
        }
      };
      reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
      reader.readAsDataURL(file);
    });
  }
}
