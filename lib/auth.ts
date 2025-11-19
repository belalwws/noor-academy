// 🔒 Legacy Auth Module - DEPRECATED
// This file is kept for backward compatibility only
// New code should use lib/auth/authService.ts and lib/hooks/useAuth.ts

import { authService } from './auth/authService';
import { simpleAuthService } from './auth/simpleAuth';
import { User, AuthTokens, AuthData } from './types/auth';

// Re-export from new auth service for backward compatibility
export const saveAuthData = (data: any) => {
  // Convert old format to new format if needed
  const convertedData: AuthData = {
    user: data.user,
    tokens: data.tokens || {
      access: data.token || data.tokens?.access,
      refresh: data.refreshToken || data.tokens?.refresh
    }
  };
  return authService.saveAuthData(convertedData.user, convertedData.tokens);
};

export const getAuthData = () => authService.getStoredAuthData();
export const isAuthenticated = () => authService.isAuthenticated();
export const getAccessToken = () => authService.getAccessToken();
export const getAuthToken = () => {
  // Try simple auth first
  const simpleToken = simpleAuthService.getAccessToken();
  if (simpleToken) return simpleToken;
  
  // Fallback to legacy auth service
  return authService.getAccessToken();
};
export const clearAuthData = () => authService.clearAuthData();
export const refreshAccessToken = () => authService.refreshAccessToken();
export const initializeAuth = () => authService.initialize();

// Export types for backward compatibility
export type { User, AuthTokens, AuthData };
