import { useState, useEffect, useCallback } from 'react';
import { getApiUrl, Endpoints } from '@/lib/config';
import { useAppSelector } from '@/lib/hooks';

interface ProfileImageUrls {
  profile_image_url: string | null;
  profile_image_thumbnail_url: string | null;
  expires_in: number;
}

interface UseProfileImagesReturn {
  imageUrls: ProfileImageUrls | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refresh: () => void;
}

interface UseProfileImagesOptions {
  refreshOnFocus?: boolean; // Auto-refresh when page gains focus
  refreshInterval?: number; // Auto-refresh interval in milliseconds
}

export function useProfileImages(options: UseProfileImagesOptions = {}): UseProfileImagesReturn {
  const { refreshOnFocus = true, refreshInterval } = options;
  
  // Get tokens and user from Redux store
  const { tokens, user } = useAppSelector(state => state.auth);
  
  const [imageUrls, setImageUrls] = useState<ProfileImageUrls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Guard against duplicate effects in React Strict Mode (dev only)
  const hasFetchedOnceRef = (typeof window !== 'undefined') ? (window as any).__profileImagesFetchedRef || { current: false } : { current: false };
  if (typeof window !== 'undefined' && !(window as any).__profileImagesFetchedRef) {
    (window as any).__profileImagesFetchedRef = hasFetchedOnceRef;
  }

  const fetchImageUrls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get authentication token and user ID from Redux store
      if (!tokens?.access || !user?.id) {
        console.log('No authentication token or user ID found, skipping signed URLs fetch');
        setImageUrls(null);
        return;
      }

      // Only log detailed fetch info in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Fetching signed URLs from API:', {
          endpoint: getApiUrl(Endpoints.GET_IMAGE_URLS),
          userId: user.id,
          hasToken: !!tokens.access,
          tokenLength: tokens.access?.length
        });
      }

      const response = await fetch(getApiUrl(Endpoints.GET_IMAGE_URLS), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.access}`,
        },
        // Add cache control to prevent unnecessary requests
        cache: 'no-cache'
      });
      
      // Only log detailed response info for non-404 errors
      if (response.status !== 404) {
        console.log('🔍 API Response Status:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
      }

      if (!response.ok) {
        if (response.status === 404) {
          // No images found - this is normal for users without uploaded images
          // Only log in development mode to reduce console noise
          if (process.env.NODE_ENV === 'development') {
            console.log('ℹ️ No profile images found, using default avatar');
          }
          setImageUrls({
            profile_image_url: null,
            profile_image_thumbnail_url: null,
            expires_in: 0,
          });
          return;
        }
        if (response.status === 401) {
          console.log('Authentication failed for signed URLs, will use original image URLs');
          setImageUrls(null);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Only log detailed response data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 API Response Data:', {
          success: data.success,
          hasData: !!data.data,
          rawData: data.data,
          errorMessage: data.error || data.message
        });
      }

      if (data.success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Signed URLs fetched successfully:', data.data);

          // Log raw URLs before cleaning
          console.log('🔍 Raw URLs before cleaning:', {
            profile_image_url: data.data.profile_image_url,
            profile_image_thumbnail_url: data.data.profile_image_thumbnail_url,
            profile_image_url_type: typeof data.data.profile_image_url,
            profile_image_url_length: data.data.profile_image_url?.length
          });
        }
        
        // Clean URLs by removing backticks, quotes, and trimming whitespace
        const cleanProfileImageUrl = data.data.profile_image_url ?
          data.data.profile_image_url.toString().replace(/^[`'"]+|[`'"]+$/g, '').trim() : null;
        const cleanThumbnailUrl = data.data.profile_image_thumbnail_url ?
          data.data.profile_image_thumbnail_url.toString().replace(/^[`'"]+|[`'"]+$/g, '').trim() : null;

        const cleanedData = {
          ...data.data,
          profile_image_url: cleanProfileImageUrl,
          profile_image_thumbnail_url: cleanThumbnailUrl
        };
        
        console.log('🔍 Cleaned URLs after processing:', {
          profile_image_url: cleanedData.profile_image_url,
          profile_image_thumbnail_url: cleanedData.profile_image_thumbnail_url,
          expires_in: cleanedData.expires_in
        });
        
        setImageUrls(cleanedData);
      } else {
        console.log('❌ Failed to fetch signed URLs, will use original image URLs:', data.error || data.message);
        setImageUrls(null);
      }
    } catch (err) {
      // Handle connection errors gracefully
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || 
            err.message.includes('ERR_CONNECTION_REFUSED') ||
            err.message.includes('NetworkError')) {
          console.log('🌐 Connection error - server may be offline, using original image URLs');
          // Don't set error for connection issues, just use original URLs
          setImageUrls(null);
          return;
        }
        console.log('Error fetching signed URLs, will use original image URLs:', err.message);
        setError(err.message);
      } else {
        console.log('Unknown error fetching signed URLs, will use original image URLs');
        setError('Unknown error occurred');
      }
      // Don't clear existing URLs on connection errors
      if (err instanceof Error && 
          !err.message.includes('Failed to fetch') && 
          !err.message.includes('ERR_CONNECTION_REFUSED') &&
          !err.message.includes('NetworkError')) {
      setImageUrls(null);
      }
    } finally {
      setLoading(false);
    }
  }, [tokens?.access, user?.id]); // Depend on both access token and user ID

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Debounced refresh function
  const debouncedRefresh = useCallback(() => {
    const timeoutId = setTimeout(() => {
      refresh();
    }, 1000); // 1 second delay
    
    return () => clearTimeout(timeoutId);
  }, [refresh]);

  // Initial fetch
  useEffect(() => {
    // Avoid duplicate initial calls in React Strict Mode
    if (!hasFetchedOnceRef.current) {
      hasFetchedOnceRef.current = true;
    fetchImageUrls();
    }
  }, [fetchImageUrls]);

  // Auto-refresh URLs before they expire (refresh 5 minutes before expiry)
  useEffect(() => {
    if (!imageUrls?.expires_in) return;

    const refreshTime = (imageUrls.expires_in - 300) * 1000; // 5 minutes before expiry
    if (refreshTime <= 0) return;

    const timeoutId = setTimeout(() => {
      fetchImageUrls();
    }, refreshTime);

    return () => clearTimeout(timeoutId);
  }, [imageUrls?.expires_in, fetchImageUrls]);

  // Refresh on page focus (when user returns to the page)
  useEffect(() => {
    if (!refreshOnFocus) return;

    let lastFocusTime = 0;
    const FOCUS_THROTTLE = 60000; // 1 minute instead of 30 seconds

    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFocusTime > FOCUS_THROTTLE) {
        debouncedRefresh();
        lastFocusTime = now;
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now();
        if (now - lastFocusTime > FOCUS_THROTTLE) {
          debouncedRefresh();
          lastFocusTime = now;
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshOnFocus, debouncedRefresh]);

  // Optional: Periodic refresh interval
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      debouncedRefresh();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, debouncedRefresh]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    fetchImageUrls();
  }, [refreshTrigger, fetchImageUrls]);

  return {
    imageUrls,
    loading,
    error,
    refetch: fetchImageUrls,
    refresh,
  };
}
