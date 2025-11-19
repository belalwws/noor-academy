import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { ProfileImageAPI } from '@/lib/api/profile-image';

export const useProfileImage = () => {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load profile image URLs
  const loadProfileImages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ProfileImageAPI.getProfileImageUrls();
      
      if (response.success && response.data) {
        setProfileImageUrl(response.data.profile_image_url);
        setThumbnailUrl(response.data.profile_image_thumbnail_url);
      } else {
        setProfileImageUrl(null);
        setThumbnailUrl(null);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في تحميل الصور الشخصية';
      setError(errorMessage);
      console.error('Error loading profile images:', err);
      
      // Don't show toast for "no images found" error
      if (!errorMessage.includes('لا توجد صور')) {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upload profile image
  const uploadProfileImage = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Validate file first
      const validation = ProfileImageAPI.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await ProfileImageAPI.uploadProfileImage(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success && response.data) {
        setProfileImageUrl(response.data.profile_image_url);
        setThumbnailUrl(response.data.profile_image_thumbnail_url);
        toast.success('تم رفع الصورة الشخصية بنجاح');
        
        // Reset progress after a short delay
        setTimeout(() => setUploadProgress(0), 1000);
        
        return response;
      } else {
        throw new Error(response.message || 'فشل في رفع الصورة');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في رفع الصورة الشخصية';
      setError(errorMessage);
      toast.error(errorMessage);
      setUploadProgress(0);
      console.error('Error uploading profile image:', err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Delete profile image
  const deleteProfileImage = useCallback(async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await ProfileImageAPI.deleteProfileImage();
      
      if (response.success) {
        setProfileImageUrl(null);
        setThumbnailUrl(null);
        toast.success('تم حذف الصورة الشخصية بنجاح');
        return response;
      } else {
        throw new Error(response.message || 'فشل في حذف الصورة');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في حذف الصورة الشخصية';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error deleting profile image:', err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Get proxied image URL
  const getProxiedImageUrl = useCallback((imageUrl: string | null) => {
    if (!imageUrl) return null;
    return ProfileImageAPI.getProxiedImageUrl(imageUrl);
  }, []);

  // Create image preview
  const createImagePreview = useCallback(async (file: File) => {
    try {
      return await ProfileImageAPI.createImagePreview(file);
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في إنشاء معاينة الصورة';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Validate image file
  const validateImageFile = useCallback((file: File) => {
    const validation = ProfileImageAPI.validateImageFile(file);
    if (!validation.isValid && validation.error) {
      setError(validation.error);
      toast.error(validation.error);
    }
    return validation;
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load images on mount
  useEffect(() => {
    loadProfileImages();
  }, [loadProfileImages]);

  // Computed values
  const hasProfileImage = !!profileImageUrl;
  const displayImageUrl = getProxiedImageUrl(profileImageUrl);
  const displayThumbnailUrl = getProxiedImageUrl(thumbnailUrl);

  return {
    // State
    profileImageUrl,
    thumbnailUrl,
    isLoading,
    isUploading,
    isDeleting,
    error,
    uploadProgress,
    
    // Actions
    loadProfileImages,
    uploadProfileImage,
    deleteProfileImage,
    getProxiedImageUrl,
    createImagePreview,
    validateImageFile,
    clearError,
    
    // Computed values
    hasProfileImage,
    displayImageUrl,
    displayThumbnailUrl,
  };
};
