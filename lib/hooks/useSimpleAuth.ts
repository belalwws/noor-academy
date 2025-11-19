// 🔒 Simplified Authentication Hook
// This hook provides a clean, simple authentication flow without conflicts

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { simpleAuthService } from '../auth/simpleAuth';
import { User, AuthTokens, LoginCredentials } from '../types/auth';

export interface UseSimpleAuthReturn {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; redirectPath?: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}

export const useSimpleAuth = (): UseSimpleAuthReturn => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    simpleAuthService.initialize();
    const authData = simpleAuthService.getStoredAuthData();
    if (authData) {
      setUser(authData.user);
      setTokens(authData.tokens);
      setIsAuthenticated(true);
    } else {
      // Clear state if no auth data
      setUser(null);
      setTokens(null);
      setIsAuthenticated(false);
    }
    
    // Listen for storage changes (login/logout in other tabs or components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'tokens' || e.key === 'access_token') {
        console.log('🔄 Auth storage changed, updating state...');
        const updatedAuthData = simpleAuthService.getStoredAuthData();
        if (updatedAuthData) {
          setUser(updatedAuthData.user);
          setTokens(updatedAuthData.tokens);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setTokens(null);
          setIsAuthenticated(false);
        }
      }
    };
    
    // Custom event for auth changes within same tab
    const handleAuthChange = () => {
      console.log('🔄 Auth state changed, updating...');
      const updatedAuthData = simpleAuthService.getStoredAuthData();
      if (updatedAuthData) {
        setUser(updatedAuthData.user);
        setTokens(updatedAuthData.tokens);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setTokens(null);
        setIsAuthenticated(false);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string; redirectPath?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.user && data.tokens) {
        const success = simpleAuthService.saveAuthData(data.user, data.tokens);
        if (success) {
          setUser(data.user);
          setTokens(data.tokens);
          setIsAuthenticated(true);
          
          // Force immediate UI update by dispatching event multiple times
          // This ensures all components receive the update
          setTimeout(() => window.dispatchEvent(new Event('authStateChanged')), 0);
          setTimeout(() => window.dispatchEvent(new Event('authStateChanged')), 100);
          setTimeout(() => window.dispatchEvent(new Event('authStateChanged')), 200);
          
          // Determine redirect path based on user role
          const redirectPath = getRedirectPath(data.user);
          return { success: true, redirectPath };
        } else {
          throw new Error('فشل في حفظ بيانات المصادقة');
        }
      } else {
        const errorMessage = data.detail || data.error || 'فشل في تسجيل الدخول';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Clear auth data from service (now calls logout API)
      await simpleAuthService.clearAuthData();
      
      // Clear local state
      setUser(null);
      setTokens(null);
      setIsAuthenticated(false);
      setError(null);
      
      // Clear any other auth-related data
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('tokens');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('authStateChanged'));
      
      // Redirect to login page
      router.push('/login');
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still redirect even if there's an error
      router.push('/login');
    }
  }, [router]);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const success = await simpleAuthService.refreshAccessToken();
      if (success) {
        const authData = simpleAuthService.getStoredAuthData();
        if (authData) {
          setTokens(authData.tokens);
        }
      }
      return success;
    } catch (err) {
      console.error('Token refresh failed:', err);
      return false;
    }
  }, []);

  // Update user function
  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [user]);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    updateUser,
  };
};

// Helper function to determine redirect path
function getRedirectPath(user: User): string {
  const role = user.role || 'student';
  
  switch (role) {
    case 'student':
      return '/dashboard/student';
    case 'teacher':
      return '/dashboard/teacher';
    case 'supervisor':
      return '/dashboard/supervisor';
    case 'admin':
      return '/dashboard/admin';
    default:
      return '/dashboard';
  }
}
