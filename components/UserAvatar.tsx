'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { useProfileImages } from '@/hooks/use-profile-images';
import { getSmartAvatarUrl, preloadImage } from '@/lib/imageUtils';

interface UserAvatarProps {
  user?: {
    full_name?: string;
    username?: string;
    profile_image_url?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
  useSignedUrls?: boolean;
  signedImageUrl?: string | null;
}

const UserAvatarComponent: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  showName = false,
  className = '',
  useSignedUrls = true,
  signedImageUrl
}) => {
  // Always call the hook, but conditionally use its results
  const { imageUrls, loading: signedUrlsLoading, error: signedUrlsError } = useProfileImages({
    refreshOnFocus: false // Disable auto-refresh when used as prop
  });

  // Determine if we should use the hook results
  const shouldUseHookResults = useSignedUrls && !signedImageUrl && !user?.profile_image_url?.startsWith('https://s3.eu-central-1.wasabisys.com');

  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get the appropriate image URL
  const imageUrl = useMemo(() => {
    // Only log detailed resolution info in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 UserAvatar - Image URL Resolution:', {
        useSignedUrls,
        signedImageUrl,
        userProfileImageUrl: user?.profile_image_url,
        hookImageUrl: imageUrls?.profile_image_url,
        signedUrlsLoading,
        signedUrlsError
      });
    }

    // Helper function to clean URLs
    const cleanUrl = (url: string | null | undefined): string => {
      if (!url) return '';
      return url.toString().replace(/^[`'"]+|[`'"]+$/g, '').trim();
    };

    if (useSignedUrls) {
      // Use provided signedImageUrl first, then fallback to hook
      if (signedImageUrl) {
        const cleanedUrl = cleanUrl(signedImageUrl);
        if (cleanedUrl) {
          console.log('✅ UserAvatar - Using provided signedImageUrl:', cleanedUrl);
          return cleanedUrl;
        }
      }

      // Check if user.profile_image_url is already a signed URL (from hook)
      if (user?.profile_image_url && user.profile_image_url.includes('wasabisys.com')) {
        const cleanedUrl = cleanUrl(user.profile_image_url);
        if (cleanedUrl) {
          console.log('✅ UserAvatar - Using user signed URL:', cleanedUrl);
          return cleanedUrl;
        }
      }

      // Use hook signed URL only if we should use hook results
      if (shouldUseHookResults && imageUrls?.profile_image_url) {
        const cleanedUrl = cleanUrl(imageUrls.profile_image_url);
        if (cleanedUrl) {
          console.log('✅ UserAvatar - Using hook signed URL:', cleanedUrl);
          return cleanedUrl;
        }
      }

      // If no signed URLs available, fallback to user's original image
      if (user?.profile_image_url) {
        const cleanedUrl = cleanUrl(user.profile_image_url);
        if (cleanedUrl) {
          // Only log fallback in development mode to reduce console noise
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ UserAvatar - Fallback to original user URL:', cleanedUrl);
          }
          return cleanedUrl;
        }
      }
    } else {
      // Not using signed URLs, use user's original image
      if (user?.profile_image_url) {
        const cleanedUrl = cleanUrl(user.profile_image_url);
        if (cleanedUrl) {
          console.log('✅ UserAvatar - Using original user URL (no signed URLs):', cleanedUrl);
          return cleanedUrl;
        }
      }
    }
    console.log('❌ UserAvatar - No image URL found, using empty string');
    return '';
  }, [useSignedUrls, signedImageUrl, shouldUseHookResults, imageUrls?.profile_image_url, user?.profile_image_url]);

  // Generate initials from user name
  const initials = useMemo(() => {
    if (!user?.full_name) return '?';
    return user.full_name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user?.full_name]);

  // Avatar size configurations
  const avatarSize = useMemo(() => {
    switch (size) {
      case 'sm':
        return { container: 'w-8 h-8', text: 'text-xs' };
      case 'md':
        return { container: 'w-12 h-12', text: 'text-sm' };
      case 'lg':
        return { container: 'w-16 h-16', text: 'text-lg' };
      case 'xl':
        return { container: 'w-20 h-20', text: 'text-xl' };
      default:
        return { container: 'w-12 h-12', text: 'text-sm' };
    }
  }, [size]);

  // Avatar color based on user initials
  const avatarColor = useMemo(() => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500'
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  }, [initials]);

  // Load and preload image
  useEffect(() => {
    // Only log detailed useEffect info in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 UserAvatar - useEffect triggered with imageUrl:', imageUrl);
    }

    if (!imageUrl) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ UserAvatar - No imageUrl provided, using default avatar');
      }
      setImageSrc('/default-avatar.png');
      setIsLoading(false);
      return;
    }

    // Clean the image URL - remove whitespace, backticks and extra spaces
    const cleanImageUrl = imageUrl.toString().trim().replace(/^[`'"]+|[`'"]+$/g, '');
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 UserAvatar - Cleaned imageUrl:', { original: imageUrl, cleaned: cleanImageUrl });
    }

    if (!cleanImageUrl) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ UserAvatar - Cleaned imageUrl is empty, using default avatar');
      }
      setImageSrc('/default-avatar.png');
      setIsLoading(false);
      return;
    }

    // Reset states when image URL changes
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 UserAvatar - Resetting states and starting image load');
    }
    setImageError(false);
    setIsLoading(true);

    // For Wasabi URLs, try direct first, then proxy if needed
    if (cleanImageUrl.includes('wasabisys.com')) {
      console.log('🔍 UserAvatar - Wasabi URL detected, trying direct load first:', cleanImageUrl);

      // Try direct load first
      const testImage = new Image();
      testImage.crossOrigin = 'anonymous';

      testImage.onload = () => {
        console.log('✅ UserAvatar - Direct Wasabi URL loaded successfully:', cleanImageUrl);
        setImageSrc(cleanImageUrl);
        setIsLoading(false);
        setImageError(false);
      };

      testImage.onerror = () => {
        console.log('⚠️ UserAvatar - Direct Wasabi URL failed, trying proxy:', cleanImageUrl);
        // Fallback to proxy
        const proxyUrl = getSmartAvatarUrl(cleanImageUrl);
        preloadImage(proxyUrl)
          .then((loadedUrl) => {
            console.log('✅ UserAvatar - Proxy URL loaded successfully:', loadedUrl);
            setImageSrc(loadedUrl);
            setIsLoading(false);
            setImageError(false);
          })
          .catch((error) => {
            console.error('❌ UserAvatar - Proxy URL also failed:', error);
            setImageSrc('/default-avatar.png');
            setIsLoading(false);
            setImageError(true);
          });
      };

      testImage.src = cleanImageUrl;
      return;
    }

    // Use smart avatar URL function for other URLs
    const finalUrl = getSmartAvatarUrl(cleanImageUrl);
    console.log('🔍 UserAvatar - Using smart avatar URL:', { original: cleanImageUrl, final: finalUrl });

    // Preload the image with fallback
    console.log('🔄 UserAvatar - Starting image preload...');
    preloadImage(finalUrl)
      .then((loadedUrl) => {
        console.log('✅ UserAvatar - Image preload successful:', loadedUrl);
        setImageSrc(loadedUrl);
        setIsLoading(false);
        setImageError(false);
      })
      .catch((error) => {
        console.error('❌ UserAvatar - Failed to load image:', error);
        console.log('🔄 UserAvatar - Falling back to default avatar');
        setImageSrc('/default-avatar.png');
        setIsLoading(false);
        setImageError(true);
      });
  }, [imageUrl]);

  const shouldShowImage = !isLoading && imageSrc && !imageError && imageSrc !== '/default-avatar.png';

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div
        className={`relative rounded-full ${avatarSize.container} ${!shouldShowImage ? avatarColor : ''
          } flex items-center justify-center overflow-hidden`}
      >
        {isLoading ? (
          <div className="animate-pulse w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full" />
        ) : shouldShowImage ? (
          <img
            src={imageSrc}
            alt={user?.full_name || 'User Avatar'}
            className="w-full h-full object-cover border-2 border-gray-200 dark:border-gray-600"
            onError={(e) => {
              console.log('❌ UserAvatar - Image failed to load, trying fallback strategies');
              const imgElement = e.currentTarget as HTMLImageElement;
              const currentSrc = imgElement.src;

              // If it's already the default avatar, don't try again
              if (currentSrc.includes('/default-avatar.png')) {
                console.log('❌ UserAvatar - Default avatar also failed, showing initials');
                setImageError(true);
                return;
              }

              // If it's a Wasabi URL and not proxied, try backend proxy
              if (currentSrc.includes('wasabisys.com') && !currentSrc.includes('/auth/image-proxy/')) {
                console.log('⚠️ UserAvatar - Trying backend proxy for failed Wasabi URL');
                const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
                const proxyUrl = `${apiUrl}/auth/image-proxy/?url=${encodeURIComponent(currentSrc)}`;
                setImageSrc(proxyUrl);
                return;
              }

              // Final fallback to default avatar
              console.log('❌ UserAvatar - All strategies failed, using default avatar');
              setImageSrc('/default-avatar.png');
              setImageError(true);
            }}
            loading="lazy"
          />
        ) : (
          <span className={`text-white font-bold ${avatarSize.text}`}>
            {initials}
          </span>
        )}
      </div>
      {showName && user?.full_name && (
        <span className="mt-2 text-sm font-medium text-center">
          {user.full_name}
        </span>
      )}
    </div>
  );
};

const UserAvatar = memo(UserAvatarComponent);
export default UserAvatar;
