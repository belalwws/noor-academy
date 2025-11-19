/**
 * useProfileV2 - Modern Profile Management Hook
 * Uses the new profile API service (profile.ts)
 * Replaces the old useProfile with better TypeScript support
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getProfile,
  updateProfile,
  patchProfile,
  changePassword,
  uploadProfileImage,
  deleteProfileImage,
  getProfileImageUrls,
  sendEmailVerification,
  getUserStats,
  type UserProfile,
  type ProfileUpdateData,
  type ChangePasswordData,
  validateImageFile,
} from '@/lib/api/profile';
import { toast } from 'sonner';

interface UseProfileReturn {
  // Data
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  imageUrls: {
    profile_image_url: string | null;
    profile_image_thumbnail_url: string | null;
  };
  stats: any;
  
  // Actions
  loadProfile: () => Promise<void>;
  updateFullProfile: (data: ProfileUpdateData) => Promise<UserProfile | null>;
  updatePartialProfile: (data: Partial<ProfileUpdateData>) => Promise<UserProfile | null>;
  updatePassword: (data: ChangePasswordData) => Promise<boolean>;
  uploadImage: (file: File) => Promise<boolean>;
  deleteImage: () => Promise<boolean>;
  refreshImageUrls: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  loadStats: () => Promise<any>;
}

export function useProfileV2(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<{
    profile_image_url: string | null;
    profile_image_thumbnail_url: string | null;
  }>({ profile_image_url: null, profile_image_thumbnail_url: null });
  const [stats, setStats] = useState<any>(null);

  // 📥 Load profile on mount
  const loadProfile = useCallback(async () => {
    try {
      console.log('🔄 Loading profile...');
      setLoading(true);
      setError(null);
      
      const data = await getProfile();
      console.log('✅ Profile loaded:', data);
      setProfile(data);
      
      // Load signed image URLs if profile has images
      if (data.profile_image_url) {
        console.log('🖼️ Loading image URLs...');
        const urls = await getProfileImageUrls();
        if (urls.success && urls.data) {
          console.log('✅ Image URLs loaded:', urls.data);
          setImageUrls(urls.data);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ في تحميل الملف الشخصي';
      console.error('❌ Profile load error:', err);
      setError(message);
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🚀 Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ♻️ Auto-refresh image URLs every 50 minutes (before 1-hour expiry)
  useEffect(() => {
    if (!profile?.profile_image_url) return;

    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing image URLs...');
      refreshImageUrls();
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [profile?.profile_image_url]);

  // 📝 Update full profile (PUT)
  const updateFullProfile = useCallback(async (data: ProfileUpdateData): Promise<UserProfile | null> => {
    try {
      console.log('📝 Updating full profile...', data);
      setLoading(true);
      
      const updated = await updateProfile(data);
      console.log('✅ Profile updated:', updated);
      
      setProfile(updated);
      toast.success('✅ تم تحديث الملف الشخصي بنجاح');
      
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في تحديث الملف الشخصي';
      console.error('❌ Update error:', err);
      toast.error(`❌ ${message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 📝 Update partial profile (PATCH)
  const updatePartialProfile = useCallback(async (data: Partial<ProfileUpdateData>): Promise<UserProfile | null> => {
    try {
      console.log('📝 Updating partial profile...', data);
      setLoading(true);
      
      const updated = await patchProfile(data);
      console.log('✅ Profile patched:', updated);
      
      setProfile(updated);
      toast.success('✅ تم تحديث البيانات بنجاح');
      
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في تحديث البيانات';
      console.error('❌ Patch error:', err);
      toast.error(`❌ ${message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔐 Change password
  const updatePassword = useCallback(async (data: ChangePasswordData): Promise<boolean> => {
    try {
      console.log('🔐 Changing password...');
      setLoading(true);
      
      const result = await changePassword(data);
      console.log('✅ Password changed:', result);
      
      toast.success('✅ تم تغيير كلمة المرور بنجاح');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في تغيير كلمة المرور';
      console.error('❌ Password change error:', err);
      toast.error(`❌ ${message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 📤 Upload profile image
  const uploadImage = useCallback(async (file: File): Promise<boolean> => {
    try {
      // Validate file first
      const validation = validateImageFile(file);
      if (!validation.valid) {
        console.error('❌ Image validation failed:', validation.error);
        toast.error(`❌ ${validation.error}`);
        return false;
      }

      console.log('📤 Uploading image:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      setLoading(true);
      toast.loading('📤 جاري رفع الصورة...', { id: 'upload-image' });
      
      const result = await uploadProfileImage(file);
      
      if (result.success && result.data) {
        console.log('✅ Image uploaded:', result.data);
        
        // Update profile with new image URLs
        if (profile) {
          setProfile({
            ...profile,
            profile_image_url: result.data.profile_image_url,
            profile_image_thumbnail_url: result.data.profile_image_thumbnail_url,
          });
        }
        
        // Load new signed URLs
        const urls = await getProfileImageUrls();
        if (urls.success && urls.data) {
          console.log('✅ New image URLs loaded:', urls.data);
          setImageUrls(urls.data);
        }
        
        toast.success('✅ تم رفع الصورة بنجاح', { id: 'upload-image' });
        return true;
      }
      
      toast.error('❌ فشل في رفع الصورة', { id: 'upload-image' });
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في رفع الصورة';
      console.error('❌ Upload error:', err);
      toast.error(`❌ ${message}`, { id: 'upload-image' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // 🗑️ Delete profile image
  const deleteImage = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🗑️ Deleting image...');
      setLoading(true);
      toast.loading('🗑️ جاري حذف الصورة...', { id: 'delete-image' });
      
      const result = await deleteProfileImage();
      
      if (result.success) {
        console.log('✅ Image deleted');
        
        // Update profile to remove image URLs
        if (profile) {
          setProfile({
            ...profile,
            profile_image_url: null,
            profile_image_thumbnail_url: null,
          });
        }
        
        setImageUrls({
          profile_image_url: null,
          profile_image_thumbnail_url: null,
        });
        
        toast.success('✅ تم حذف الصورة بنجاح', { id: 'delete-image' });
        return true;
      }
      
      toast.error('❌ فشل في حذف الصورة', { id: 'delete-image' });
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في حذف الصورة';
      console.error('❌ Delete error:', err);
      toast.error(`❌ ${message}`, { id: 'delete-image' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // 🔄 Refresh image URLs (signed URLs expire after 1 hour)
  const refreshImageUrls = useCallback(async () => {
    try {
      console.log('🔄 Refreshing image URLs...');
      const urls = await getProfileImageUrls();
      if (urls.success && urls.data) {
        console.log('✅ Image URLs refreshed:', urls.data);
        setImageUrls(urls.data);
      }
    } catch (err) {
      console.error('❌ Failed to refresh image URLs:', err);
    }
  }, []);

  // ✉️ Send email verification
  const sendVerificationEmail = useCallback(async () => {
    if (!profile?.email) {
      toast.error('❌ البريد الإلكتروني غير موجود');
      return;
    }

    try {
      console.log('✉️ Sending verification email to:', profile.email);
      setLoading(true);
      
      await sendEmailVerification(profile.email);
      console.log('✅ Verification email sent');
      
      toast.success('✅ تم إرسال رابط التحقق إلى بريدك الإلكتروني');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في إرسال رابط التحقق';
      console.error('❌ Verification email error:', err);
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // 📊 Load user stats
  const loadStats = useCallback(async () => {
    try {
      console.log('📊 Loading user stats...');
      const data = await getUserStats();
      console.log('✅ Stats loaded:', data);
      setStats(data);
      return data;
    } catch (err) {
      console.error('❌ Stats load error:', err);
      throw err;
    }
  }, []);

  return {
    // Data
    profile,
    loading,
    error,
    imageUrls,
    stats,
    
    // Actions
    loadProfile,
    updateFullProfile,
    updatePartialProfile,
    updatePassword,
    uploadImage,
    deleteImage,
    refreshImageUrls,
    sendVerificationEmail,
    loadStats,
  };
}
