import { apiClient } from '@/lib/apiClient';
import { logger } from '@/lib/utils/logger';

export interface CourseImageUploadResponse {
  success: boolean;
  message: string;
  data: {
    profile_image_url: string;
    profile_image_thumbnail_url?: string;
  };
}

/**
 * Upload a course image (thumbnail or cover) and get the URL
 * FAKE UPLOAD - Returns a fake URL for testing purposes
 */
export async function uploadCourseImage(imageFile: File): Promise<string> {
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

  logger.debug('Fake uploading course image', { fileName: imageFile.name, fileSize: imageFile.size });

  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate a fake URL based on file name and timestamp
  const timestamp = Date.now();
  const fileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fakeUrl = `https://s3.wasabisys.com/lisan-alhekma/courses/images/${timestamp}_${fileName}`;

  logger.debug('Fake upload completed, returning URL:', fakeUrl);

  return fakeUrl;
}

