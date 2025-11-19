import React from 'react';
import { ProfileCompletionStatus } from '@/lib/api/supervisor-profile';

interface ProfileCompletionStatusProps {
  status: ProfileCompletionStatus | null;
  isLoading?: boolean;
}

export const ProfileCompletionStatusComponent: React.FC<ProfileCompletionStatusProps> = ({ 
  status, 
  isLoading = false 
}) => {
  // Return empty fragment - no content displayed
  return null;
};
