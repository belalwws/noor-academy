'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface ProfileImageProps {
  displayImageUrl: string | null;
  originalImageUrl: string | null;
  isLoading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fallbackIcon?: React.ReactNode;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  displayImageUrl,
  originalImageUrl,
  isLoading = false,
  className = '',
  size = 'md',
  fallbackIcon
}) => {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(displayImageUrl);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-10 h-10',
    lg: 'w-8 h-8'
  };

  const handleImageError = () => {
    // If we're currently showing the proxied URL and have an original URL, try the original
    if (currentSrc === displayImageUrl && originalImageUrl && originalImageUrl !== currentSrc) {
      setCurrentSrc(originalImageUrl);
    } else {
      setImageError(true);
    }
  };

  // Reset error state when URLs change
  React.useEffect(() => {
    setImageError(false);
    setCurrentSrc(displayImageUrl);
  }, [displayImageUrl, originalImageUrl]);

  const shouldShowImage = (currentSrc || originalImageUrl) && !imageError && !isLoading;

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-lg relative ${className}`}>
      {isLoading ? (
        <div className="w-full h-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
          <Spinner size={size === 'lg' ? 'lg' : 'md'} tone="contrast" className={iconSizes[size]} />
        </div>
      ) : shouldShowImage ? (
        <img
          src={currentSrc || originalImageUrl || ''}
          alt="الصورة الشخصية"
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : null}
      
      {/* Fallback Avatar */}
      <div className={`absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center ${shouldShowImage ? 'hidden' : ''}`}>
        {fallbackIcon || <User className={`${iconSizes[size]} text-white`} />}
      </div>
    </div>
  );
};

export default ProfileImage;
