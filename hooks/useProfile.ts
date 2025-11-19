import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { login, updateUser } from '@/lib/store';
import apiService from '@/lib/api';
import { authService } from '@/lib/auth';
import { getSmartImageUrl, preloadImage } from '@/lib/imageUtils';

interface ProfileData {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  learning_goal: string;
  preferred_language: string;
  bio: string;
  profile_image_url: string;
  profile_image_thumbnail_url?: string;
  is_profile_public?: boolean;
  role?: string;
  date_joined?: string;
  city?: string;
  is_verified?: boolean;
}

interface UseProfileReturn {
  profileData: ProfileData;
  isLoading: boolean;
  isUploading: boolean;
  imageLoading: boolean;
  loadProfile: () => Promise<void>;
  updateProfile: () => Promise<{ success: boolean; error?: string }>;
  uploadImage: (file: File) => Promise<{ success: boolean; error?: string }>;
  deleteImage: () => Promise<{ success: boolean; error?: string }>;
  updateProfileData: (data: Partial<ProfileData>) => void;
  initializeProfile: (user: any) => void;
}

export function useProfile(): UseProfileReturn {
  const dispatch = useAppDispatch();
  const { user, tokens } = useAppSelector(state => state.auth);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    age: 0,
    gender: 'male',
    learning_goal: 'general_knowledge',
    preferred_language: 'ar',
    bio: '',
    profile_image_url: '/default-avatar.png',
    is_profile_public: false,
    role: 'طالب',
    date_joined: '',
    city: '',
    is_verified: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('=== Loading Profile Securely ===');
      
      const result = await apiService.makeSecureRequest('/api/auth/profile/', {
        method: 'GET'
      });
      
      if (result.success && result.data) {
        const fullName = result.data.full_name || 
                        `${result.data.first_name || ''} ${result.data.last_name || ''}`.trim() ||
                        profileData.full_name;
        
        const imageUrl = getSmartImageUrl(
          result.data.profile_image_url || 
          user?.profile_image_url
        );
        
        const thumbnailUrl = getSmartImageUrl(
          result.data.profile_image_thumbnail_url || 
          user?.profile_image_thumbnail_url
        );
        
        setProfileData(prev => ({
          ...prev,
          ...result.data,
          full_name: fullName,
          profile_image_url: imageUrl,
          profile_image_thumbnail_url: thumbnailUrl,
          phone: result.data.phone || '',
          age: result.data.age || 0,
          bio: result.data.bio || '',
        }));
      }
    } catch (error) {
      console.error('Profile loading error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, profileData.full_name]);

  const updateProfile = useCallback(async () => {
    try {
      const result = await apiService.updateUserProfile(profileData);
      
      if (result.success && result.data) {
        // Update user data in Redux
        if (tokens) {
          dispatch(login({
            user: { ...user, ...result.data },
            tokens: tokens
          }));
        }
        return { success: true };
      } else {
        return { success: false, error: result.error || 'حدث خطأ أثناء تحديث الملف الشخصي' };
      }
    } catch (error) {
      return { success: false, error: 'حدث خطأ أثناء تحديث الملف الشخصي' };
    }
  }, [profileData, tokens, user, dispatch]);

  const uploadImage = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      
      const result = await apiService.uploadProfileImage(file);
      
      if (result.success) {
        let newImageUrl = '';
        let newThumbnailUrl = '';
        
        if (result.data?.data?.profile_image_url) {
          newImageUrl = result.data.data.profile_image_url;
          newThumbnailUrl = result.data.data.profile_image_thumbnail_url;
        } else if (result.data?.profile_image_url) {
          newImageUrl = result.data.profile_image_url;
          newThumbnailUrl = result.data.profile_image_thumbnail_url;
        }
        
        if (newImageUrl) {
          setProfileData(prev => ({
            ...prev,
            profile_image_url: getSmartImageUrl(newImageUrl),
            profile_image_thumbnail_url: newThumbnailUrl
          }));
        
          // Update localStorage
          const authData = authService.getStoredAuthData();
          if (authData) {
            const updatedAuthData = {
              ...authData,
              user: {
                ...authData.user,
                profile_image_url: newImageUrl,
                profile_image_thumbnail_url: newThumbnailUrl
              }
            };
            authService.saveAuthData(updatedAuthData);
          }
          
          return { success: true };
        }
      }
      
      return { success: false, error: result.error || 'حدث خطأ أثناء رفع الصورة' };
    } catch (error) {
      return { success: false, error: 'حدث خطأ أثناء رفع الصورة' };
    } finally {
      setIsUploading(false);
    }
  }, []);

  const deleteImage = useCallback(async () => {
    try {
      const result = await apiService.deleteProfileImage();
      
      if (result.success) {
        await loadProfile(); // Reload profile to get updated image
        return { success: true };
      } else {
        return { success: false, error: result.error || 'حدث خطأ أثناء حذف الصورة' };
      }
    } catch (error) {
      return { success: false, error: 'حدث خطأ أثناء حذف الصورة' };
    }
  }, [loadProfile]);

  const updateProfileData = useCallback((data: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  }, []);

  const initializeProfile = useCallback((user: any) => {
    if (user) {
      const initialProfileData: ProfileData = {
        full_name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        age: user?.age || 0,
        gender: user?.gender || 'male',
        learning_goal: user?.learning_goal || 'general_knowledge',
        preferred_language: user?.preferred_language || 'ar',
        bio: user?.bio || '',
        profile_image_url: user?.profile_image_url || '',
        profile_image_thumbnail_url: user?.profile_image_thumbnail_url || '',
        is_profile_public: user?.is_profile_public || false,
        role: user?.role || 'طالب',
        date_joined: user?.date_joined || '',
        city: user?.city || '',
        is_verified: user?.is_verified || false
      };
      
      setProfileData(initialProfileData);
      
      // Preload profile image if exists
      if (user?.profile_image_url) {
        setImageLoading(true);
        preloadImage(user.profile_image_url).then(preloadedUrl => {
          if (preloadedUrl !== user.profile_image_url) {
            setProfileData(prev => ({ ...prev, profile_image_url: preloadedUrl }));
          }
          setImageLoading(false);
        }).catch(error => {
          console.warn('Profile image preload failed:', error);
          setImageLoading(false);
        });
      }
    }
  }, []);

  return {
    profileData,
    isLoading,
    isUploading,
    imageLoading,
    loadProfile,
    updateProfile,
    uploadImage,
    deleteImage,
    updateProfileData,
    initializeProfile
  };
}
