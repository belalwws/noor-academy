// Re-export everything from authService first
export * from './authService';

import { useAppDispatch, useAppSelector } from '../hooks';
import { useRouter } from 'next/navigation';
import { logout as reduxLogout, login as reduxLogin } from '../store';
import { authService } from './authService';

// Explicitly export authService for direct imports
export { authService };

/**
 * Save authentication data to localStorage and Redux store
 */
export async function saveAuthData(authData: {
  user: any;
  tokens: { access: string; refresh: string };
  csrfToken?: string;
}): Promise<void> {
  try {
    console.log('💾 Saving auth data:', {
      userKeys: authData.user ? Object.keys(authData.user) : [],
      tokensKeys: authData.tokens ? Object.keys(authData.tokens) : []
    });

    // Save to localStorage using authService
    const saved = authService.saveAuthData(authData.user, authData.tokens);

    if (!saved) {
      console.error('❌ Failed to save auth data - authService returned false');
      throw new Error('فشل في حفظ بيانات المصادقة');
    }

    console.log('✅ Auth data saved successfully');
  } catch (error) {
    console.error('❌ Failed to save auth data:', error);
    throw error;
  }
}

/**
 * Custom React hook for authentication
 * Provides access to user state, authentication status, and auth actions
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, tokens } = useAppSelector(state => state.auth);

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      return await authService.refreshAccessToken();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  };

  const logout = (): void => {
    authService.clearAuthData();
    dispatch(reduxLogout());
    // Use setTimeout to avoid setState during render
    setTimeout(() => {
      router.push('/login');
    }, 0);
  };

  return {
    user,
    isAuthenticated,
    tokens,
    refreshAccessToken,
    logout,
  };
}
