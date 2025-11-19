// Enhanced image utilities with intelligent fallback and caching
import { getCachedImageUrl, cacheImageUrl } from './imageCache'

// 🎯 Smart fallback strategy for Wasabi images
// Note: Backend proxy has rate limiting (429), so we prioritize Next.js proxy
export const getProxiedImageUrl = (imageUrl: string, useBackendProxy: boolean = false): string => {
  // Check cache first
  const cached = getCachedImageUrl(imageUrl)
  if (cached) {
    return cached
  }
  if (!imageUrl || imageUrl === '/default-avatar.png') {
    return '/default-avatar.png';
  }
  
  // If it's already a proxy URL, return as is
  if (imageUrl.includes('/auth/image-proxy/')) {
    return imageUrl;
  }
  
  // Check if URL is from Wasabi
  const isWasabiUrl = imageUrl.includes('s3.wasabisys.com') || 
                      imageUrl.includes('wasabisys.com');
  
  if (isWasabiUrl) {
    // For Wasabi URLs, use backend proxy directly (more reliable)
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
    const proxyUrl = `${apiUrl}/auth/image-proxy/?url=${encodeURIComponent(imageUrl)}`;
    // Cache the proxied URL
    cacheImageUrl(imageUrl, proxyUrl)
    return proxyUrl
  }
  
  // For other external URLs, return as is (no proxy needed)
  const isExternalUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
  if (isExternalUrl) {
    // Return external URL directly
    return imageUrl
  }
  
  // For relative URLs, return as is
  return imageUrl;
};

// 🖼️ Smart image preloading with fallback
export const preloadImage = async (imageUrl: string): Promise<string> => {
  if (!imageUrl || imageUrl === '/default-avatar.png') {
    return '/default-avatar.png';
  }
  
  // If it's already a backend proxy URL, try to load it directly
  if (imageUrl.includes('/auth/image-proxy/')) {
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
        
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
      console.log('✅ Proxy URL loaded successfully');
      return imageUrl;
    } catch (error) {
      console.log('❌ Proxy URL failed, using default avatar');
      return '/default-avatar.png';
    }
  }
  
  // For Wasabi URLs, try direct URL first
  if (imageUrl.includes('s3.wasabisys.com')) {
    console.log('🎯 Wasabi URL detected, trying direct URL');
    
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
        
        // Timeout after 8 seconds
        setTimeout(() => reject(new Error('Timeout')), 8000);
      });
      console.log('✅ Direct Wasabi URL worked');
      return imageUrl;
    } catch (error) {
      console.log('❌ Direct Wasabi URL failed, using default avatar');
      return '/default-avatar.png';
    }
  }
  
  // For other URLs, try to load
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
      
      // Timeout after 8 seconds
      setTimeout(() => reject(new Error('Timeout')), 8000);
    });
    return imageUrl;
  } catch (error) {
    console.log('⚠️ Image preload failed, using default avatar');
    return '/default-avatar.png';
  }
};

// 🎨 Smart canvas conversion with fallback
export const tryCanvasImageLoad = async (imageUrl: string): Promise<string> => {
  if (!imageUrl || imageUrl === '/default-avatar.png') {
    return '/default-avatar.png';
  }
  
  // If it's already a backend proxy URL, try to load it directly
  if (imageUrl.includes('/auth/image-proxy/')) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
        
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      console.log('✅ Proxy URL canvas conversion successful');
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.log('❌ Proxy URL canvas conversion failed, using default avatar');
      return '/default-avatar.png';
    }
  }
  
  // For Wasabi URLs, try direct URL
  if (imageUrl.includes('s3.wasabisys.com')) {
    console.log('🎯 Wasabi URL detected, trying direct URL for canvas conversion');
    
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
        
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      console.log('✅ Direct Wasabi URL canvas conversion successful');
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.log('❌ Direct Wasabi URL canvas conversion failed, using default avatar');
      return '/default-avatar.png';
    }
  }
  
  // For other URLs, try to load
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
      
      // Timeout after 5 seconds
      setTimeout(() => reject(new Error('Timeout')), 5000);
    });
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.log('⚠️ Canvas conversion failed, using default avatar');
    return '/default-avatar.png';
  }
};

// 🔄 Smart URL refresh with fallback
export const refreshImageUrl = async (imageUrl: string): Promise<string> => {
  if (!imageUrl || imageUrl === '/default-avatar.png') {
    return '/default-avatar.png';
  }
  
  // If it's already a backend proxy URL, test it directly
  if (imageUrl.includes('/auth/image-proxy/')) {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('✅ Proxy URL refresh successful');
        return imageUrl;
      }
    } catch (error) {
      console.log('❌ Proxy URL refresh failed');
    }
    return '/default-avatar.png';
  }
  
  // For Wasabi URLs, try direct URL
  if (imageUrl.includes('s3.wasabisys.com')) {
    console.log('🎯 Refreshing Wasabi URL directly');
    
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('✅ Direct URL refresh successful');
        return imageUrl;
      }
    } catch (error) {
      console.log('❌ Direct URL refresh failed');
    }
    
    return '/default-avatar.png';
  }
  
  // For other URLs, test directly
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    if (response.ok) {
      return imageUrl;
    }
  } catch (error) {
    console.log('⚠️ URL refresh failed');
  }
  
  return '/default-avatar.png';
};

// 🎭 Smart avatar fallback chain
export const getSmartAvatarUrl = (imageUrl: string, fallbackUrl?: string): string => {
  if (!imageUrl || imageUrl === '/default-avatar.png') {
    return fallbackUrl || '/default-avatar.png';
  }
  
  // If it's already a backend proxy URL, return as is
  if (imageUrl.includes('/auth/image-proxy/')) {
    return imageUrl;
  }
  
  // If it's a Wasabi URL, return it directly (no proxy needed)
  if (imageUrl.includes('s3.wasabisys.com')) {
    return imageUrl;
  }
  
  // For other URLs, return as is
  return imageUrl;
};

// 🚨 Smart error handler for React
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>): void => {
  const img = event.currentTarget as HTMLImageElement;
  console.log('🚨 Image failed to load, using default avatar');
  img.src = '/default-avatar.png';
  img.onerror = null; // Prevent infinite loop
};

// 🔄 Smart image URL
export const getSmartImageUrl = (imageUrl: string): string => {
  if (!imageUrl || imageUrl === '/default-avatar.png') {
    return '/default-avatar.png';
  }
  
  // If it's already a backend proxy URL, return as is
  if (imageUrl.includes('/auth/image-proxy/')) {
    return imageUrl;
  }
  
  // For Wasabi URLs, return directly (no proxy needed)
  if (imageUrl.includes('s3.wasabisys.com')) {
    return imageUrl;
  }
  
  return imageUrl;
};
