// 🔒 Enhanced Authentication Service for Lisan-Alhekma
// Following security best practices and clean architecture

import { User, AuthTokens, AuthData, LoginCredentials, ApiResponse, TokenRefreshResponse } from '../types/auth';
import TokenSecurity from '../security/tokenSecurity';

class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private isRefreshing = false; // Flag to prevent concurrent refresh attempts

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // 🔒 SECURITY: Initialize auth service
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    try {
      const authData = this.getStoredAuthData();
      if (authData?.tokens?.refresh) {
        this.scheduleTokenRefresh(authData.tokens.refresh);
      }
      this.isInitialized = true;
    } catch (error) {
    }
  }

  // 🔒 SECURITY: Save auth data securely
  saveAuthData(user: User, tokens: AuthTokens): boolean {
    try {
      const data = { user, tokens };

      // Validate data structure with detailed diagnostics
      const isValid = this.validateAuthData(data);
      if (!isValid) {
        return false;
      }

      // 🔒 SECURITY: Check environment security
      if (!TokenSecurity.isSecureEnvironment()) {
        TokenSecurity.logSecurityEvent('INSECURE_ENVIRONMENT_WARNING');
      }

      // 🔒 SECURITY: Validate tokens before storage
      if (!TokenSecurity.validateTokens(tokens)) {
        TokenSecurity.logSecurityEvent('INVALID_TOKENS_REJECTED');
        return false;
      }

      // Store in memory
      this.accessToken = tokens.access;

      // 🔒 SECURITY: Use enhanced secure storage
      const secureStorageSuccess = TokenSecurity.secureStoreTokens(tokens);
      if (!secureStorageSuccess) {
        return false;
      }

      // ✅ Backward compatibility: store legacy keys used by scattered code
      try {
        localStorage.setItem('tokens', JSON.stringify(tokens));
        localStorage.setItem('token', tokens.access);
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
      } catch (e) {
      }

      // Store user data separately
      localStorage.setItem('user', JSON.stringify(user));


      // Schedule automatic token refresh
      this.scheduleTokenRefresh(tokens.refresh);

      // Log successful authentication
      TokenSecurity.logSecurityEvent('AUTH_DATA_SAVED', {
        userId: user.id,
        tokenExpiration: TokenSecurity.getTokenExpiration(tokens.access)
      });

      // 🔔 Dispatch auth state change event for UI components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authStateChanged'));
        window.dispatchEvent(new Event('storage')); // For cross-tab sync
      }

      return true;
    } catch (error: any) {
      TokenSecurity.logSecurityEvent('AUTH_SAVE_ERROR', { error: error?.message || 'Unknown error' });
      return false;
    }
  }

  // 🔒 SECURITY: Get stored auth data with validation
  getStoredAuthData(): AuthData | null {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;

      const user = JSON.parse(userStr) as User;

      // Validate user data structure
      if (!this.validateUser(user)) {
        this.clearAuthData();
        return null;
      }

      // 🔒 SECURITY: Use enhanced secure token retrieval
      const tokens = TokenSecurity.secureRetrieveTokens();
      if (!tokens) {
        return null;
      }

      // 🔒 SECURITY: Validate retrieved tokens
      if (!TokenSecurity.validateTokens(tokens)) {
        TokenSecurity.logSecurityEvent('INVALID_STORED_TOKENS');
        this.clearAuthData();
        return null;
      }

      // Update in-memory access token if valid
      if (!TokenSecurity.isTokenExpired(tokens.access)) {
        this.accessToken = tokens.access;
      }

      TokenSecurity.logSecurityEvent('AUTH_DATA_RETRIEVED', {
        userId: user.id,
        tokenValid: !TokenSecurity.isTokenExpired(tokens.access)
      });


      return {
        user,
        tokens
      };
    } catch (error: any) {
      TokenSecurity.logSecurityEvent('AUTH_RETRIEVAL_ERROR', { error: error?.message });
      this.clearAuthData();
      return null;
    }
  }

  // 🔒 SECURITY: Check authentication status
  isAuthenticated(): boolean {
    try {
      const userStr = localStorage.getItem('user');
      const refreshToken = localStorage.getItem('refresh_token');
      
      return !!(userStr && refreshToken);
    } catch (error) {
      return false;
    }
  }

  // 🔒 SECURITY: Check if token is expired
  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '==='.slice((base64.length + 3) % 4);
      const json = (typeof window !== 'undefined' && typeof window.atob === 'function')
        ? decodeURIComponent(encodeURIComponent(window.atob(padded)))
        : Buffer.from(padded, 'base64').toString('utf-8');
      const payload = JSON.parse(json);
      const currentTime = Math.floor(Date.now() / 1000);
      // Check if token is actually expired (not just expires soon)
      // Only consider it expired if it's already past expiration time
      // This allows the token to be used until it actually expires
      return !payload?.exp || payload.exp <= currentTime;
    } catch (error) {
      return true; // Assume expired if can't parse
    }
  }

  // 🔒 SECURITY: Get access token for API requests
  getAccessToken(): string | null {
    // First try in-memory token if not expired
    if (this.accessToken && !this.isTokenExpired(this.accessToken)) {
      return this.accessToken;
    }

    // Clear expired token from memory
    if (this.accessToken && this.isTokenExpired(this.accessToken)) {
      this.accessToken = null;
    }
    
    // Fallback to storage if in-memory is empty
    try {
      // Preferred: secure storage
      const secure = TokenSecurity.secureRetrieveTokens();
      if (secure?.access && !this.isTokenExpired(secure.access)) {
        this.accessToken = secure.access;
        return this.accessToken;
      }

      // Legacy: tokens JSON
      const tokensStr = localStorage.getItem('tokens');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr) as AuthTokens;
        if (tokens.access && !this.isTokenExpired(tokens.access)) {
          this.accessToken = tokens.access;
          return this.accessToken;
        } else if (tokens.access && this.isTokenExpired(tokens.access)) {
        }
      }

      // If no valid access token, check if we have refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        // Don't automatically refresh here to avoid infinite loops
        // Let the calling code handle refresh if needed
      }
    } catch (error) {
    }

    return this.accessToken;
  }

  // 🔒 SECURITY: Get valid access token with automatic refresh
  async getValidAccessToken(): Promise<string | null> {
    // First try to get current token
    const currentToken = this.getAccessToken();

    // If we have a valid token, return it
    if (currentToken && !this.isTokenExpired(currentToken)) {
      return currentToken;
    }

    // If token is expired or missing, try to refresh
    const refreshSuccess = await this.refreshAccessToken();

    if (refreshSuccess) {
      return this.getAccessToken();
    }

    // If refresh failed, return null
    return null;
  }

  // 🔒 SECURITY: Refresh access token
  async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        return false;
      }

      // Check if we're already refreshing to avoid duplicate requests
      if (this.isRefreshing) {
        // Wait for the existing refresh to complete
        await new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!this.isRefreshing) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 100);
          // Timeout after 5 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve(false);
          }, 5000);
        });
        // Check if we have a valid token now
        const currentToken = this.getAccessToken();
        return currentToken !== null && !this.isTokenExpired(currentToken);
      }

      this.isRefreshing = true;

      try {
        // Dynamic import to avoid circular dependencies
        const { apiClient } = await import('../api');

        const response = await apiClient.refreshToken(refreshToken);

        if (response.success && response.data) {
          const tokenData = response.data as TokenRefreshResponse;
          this.accessToken = tokenData.access;
          
          // Update localStorage with new tokens
          const newTokens = {
            access: tokenData.access,
            refresh: tokenData.refresh || refreshToken
          };
          
          // Use secure storage
          TokenSecurity.secureStoreTokens(newTokens);
          
          // Also update legacy keys for compatibility
          localStorage.setItem('tokens', JSON.stringify(newTokens));
          localStorage.setItem('token', tokenData.access);
          localStorage.setItem('access_token', tokenData.access);
          
          // Update refresh token if provided
          if (tokenData.refresh) {
            localStorage.setItem('refresh_token', tokenData.refresh);
            this.scheduleTokenRefresh(tokenData.refresh);
          } else {
            this.scheduleTokenRefresh(refreshToken);
          }
          
          // Update Redux store with new tokens
          try {
            const { store, setTokens } = await import('../store');
            store.dispatch(setTokens(newTokens));
          } catch (storeError) {
            // Store might not be available, ignore
          }
          
          // 🔔 Dispatch auth state change event after token refresh
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('authStateChanged'));
          }
          
          return true;
        }

        // Only clear auth and redirect for authentication errors (401/403)
        // This means the refresh token itself is invalid or expired
        const requiresLogin = response.status === 401 || response.status === 403;
        
        if (requiresLogin) {
          // Only redirect if we're sure the token is expired (not just a network error)
          const errorDetail = (response as any).error || (response as any).data?.detail || '';
          const isTokenExpired = errorDetail.includes('expired') || 
                                errorDetail.includes('invalid') || 
                                errorDetail.includes('token_not_valid');
          
          if (isTokenExpired) {
            // Skip logout API call to avoid infinite loop when refresh token is expired
            await this.clearAuthData(true);
            
            // Redirect to login page with message
            if (typeof window !== 'undefined' && 
                !window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register')) {
              // Use error message from API (Arabic if available) or default
              const errorMessage = errorDetail || 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى';
              sessionStorage.setItem('login_message', errorMessage);
              
              // Redirect to login
              window.location.href = '/login';
            }
          }
        } else {
          // For other errors (network issues, server errors), just clear the expired access token
          // Keep the refresh token for retry later
          this.clearExpiredToken();
        }
        
        return false;
      } finally {
        // Always reset isRefreshing flag in finally block to ensure it's reset even on errors
        this.isRefreshing = false;
      }
    } catch (error: any) {
      // Only clear auth data and redirect if it's a clear authentication error
      // Network errors should not clear tokens - allow retry
      const isAuthError = error?.response?.status === 401 || 
                         error?.response?.status === 403 || 
                         (error?.message && (error.message.includes('401') || error.message.includes('403')));
      
      if (isAuthError) {
        // Check if error message indicates token expiration
        const errorMessage = error?.message || error?.response?.data?.detail || '';
        const isTokenExpired = errorMessage.includes('expired') || 
                              errorMessage.includes('invalid') || 
                              errorMessage.includes('token_not_valid');
        
        if (isTokenExpired) {
          // Skip logout API call to avoid infinite loop when refresh token is expired
          await this.clearAuthData(true);
          
          if (typeof window !== 'undefined' && 
              !window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register')) {
            sessionStorage.setItem('login_message', 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
            window.location.href = '/login';
          }
        } else {
          // Auth error but not token expiration - might be network issue
          this.clearExpiredToken();
        }
      } else {
        // Network error or other non-auth error - keep refresh token for retry
        this.clearExpiredToken();
      }
      
      return false;
    }
  }

  // 🔒 SECURITY: Clear expired access token only (keep refresh token)
  clearExpiredToken(): void {
    this.accessToken = null;

    // Clear only access token from localStorage, keep refresh token
    const tokens = localStorage.getItem('tokens');
    if (tokens) {
      try {
        const parsedTokens = JSON.parse(tokens);
        const newTokens = {
          access: '',
          refresh: parsedTokens.refresh || ''
        };
        localStorage.setItem('tokens', JSON.stringify(newTokens));
      } catch (error) {
      }
    }

  }

  // 🔒 SECURITY: Clear all auth data (complete logout)
  async clearAuthData(skipLogoutApi: boolean = false): Promise<void> {
    try {
      // Get refresh token before clearing
      const refreshToken = localStorage.getItem('refresh_token') || 
                          localStorage.getItem('refreshToken') ||
                          localStorage.getItem('tokens') ? JSON.parse(localStorage.getItem('tokens') || '{}').refresh : null;
      
      // Clear refresh timer FIRST
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
      
      // Clear memory
      this.accessToken = null;

      // 🔒 SECURITY: Use enhanced secure token clearing
      TokenSecurity.clearStoredTokens();

      // Clear ALL possible localStorage keys related to auth
      const authKeys = [
        'user',
        'access_token',
        'refresh_token',
        'tokens',
        'token',
        'refreshToken',
        'auth_tokens',
        'token_expires_at',
        'auth_timestamp',
        'teacher_access_token',
        'teacher_refresh_token',
        'csrf_token',
        'csrfToken'
      ];
      
      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`⚠️ Failed to remove ${key} from localStorage:`, e);
        }
      });
      
      // Call logout API to blacklist refresh token on server
      // Skip API call if token is already expired to avoid infinite loop
      if (refreshToken && !skipLogoutApi) {
        try {
          const { apiClient } = await import('../api');
          const logoutResult = await apiClient.logout(refreshToken);
          
          if (logoutResult.success) {
            console.log('✅ Logout API called successfully');
          } else {
            console.warn('⚠️ Logout API returned failure');
          }
        } catch (apiError) {
          console.error('❌ Error calling logout API:', apiError);
          // Continue with local logout even if API fails
        }
      }

      // Log security event
      TokenSecurity.logSecurityEvent('AUTH_DATA_CLEARED');

      // 🔔 Dispatch auth state change event for UI components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authStateChanged'));
        window.dispatchEvent(new Event('storage')); // For cross-tab sync
      }

    } catch (error: any) {
      console.error('❌ Error clearing auth data:', error);
      TokenSecurity.logSecurityEvent('AUTH_CLEAR_ERROR', { error: error?.message });
      
      // Ensure tokens are cleared even on error
      TokenSecurity.clearStoredTokens();
      const authKeys = ['user', 'access_token', 'refresh_token', 'tokens', 'token', 'refreshToken'];
      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore errors during cleanup
        }
      });
    }
  }

  // 🔒 SECURITY: Schedule automatic token refresh
  private scheduleTokenRefresh(_refreshToken: string): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Get token expiration time and schedule refresh 10 minutes before expiry
    try {
      const accessToken = this.getAccessToken();
      if (accessToken) {
        const expirationDate = TokenSecurity.getTokenExpiration(accessToken);
        if (expirationDate && expirationDate instanceof Date) {
          // Calculate time until 10 minutes before expiry
          const now = Date.now();
          const expirationTime = expirationDate.getTime();
          const tenMinutesBeforeExpiry = expirationTime - (10 * 60 * 1000); // 10 minutes buffer
               const timeUntilRefresh = Math.max(tenMinutesBeforeExpiry - now, 60000); // At least 1 minute
               
               // Don't schedule if token is already expired or expires very soon
               if (timeUntilRefresh <= 0 || expirationTime <= now) {
                 // Try to refresh immediately
                 this.refreshAccessToken().then((success) => {
                   if (success) {
                     const newRefreshToken = localStorage.getItem('refresh_token');
                     if (newRefreshToken) {
                       this.scheduleTokenRefresh(newRefreshToken);
                     }
                   }
                 });
                 return;
               }
               
               this.refreshTimer = setTimeout(async () => {
            try {
              const success = await this.refreshAccessToken();
              if (success) {
                // Schedule next refresh
                const newRefreshToken = localStorage.getItem('refresh_token');
                if (newRefreshToken) {
                  this.scheduleTokenRefresh(newRefreshToken);
                }
              } else {
                // Check if refresh token still exists before retrying
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                  // Wait 5 minutes before retrying (not 2 minutes to avoid too many requests)
                  setTimeout(() => {
                    const retryRefreshToken = localStorage.getItem('refresh_token');
                    if (retryRefreshToken) {
                      this.scheduleTokenRefresh(retryRefreshToken);
                    }
                  }, 5 * 60 * 1000); // 5 minutes
                }
              }
            } catch (error) {
              // Error during token refresh - will retry on next API call
            }
          }, timeUntilRefresh);
          
          return;
        }
      }
    } catch (error) {
      // Error calculating token expiration - use fallback
    }
    
    // Fallback: Refresh token every 50 minutes (access token lasts 1 hour)
    const refreshInterval = 50 * 60 * 1000; // 50 minutes

    this.refreshTimer = setTimeout(async () => {
      try {
        const success = await this.refreshAccessToken();
        if (success) {
          // Schedule next refresh
          const newRefreshToken = localStorage.getItem('refresh_token');
          if (newRefreshToken) {
            this.scheduleTokenRefresh(newRefreshToken);
          }
        } else {
          // Check if refresh token still exists before retrying
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            // Wait 5 minutes before retrying
            setTimeout(() => {
              const retryRefreshToken = localStorage.getItem('refresh_token');
              if (retryRefreshToken) {
                this.scheduleTokenRefresh(retryRefreshToken);
              }
            }, 5 * 60 * 1000); // 5 minutes
          }
        }
      } catch (error) {
        // Error during token refresh - will retry on next API call
      }
    }, refreshInterval);
  }

  // 🔒 VALIDATION: Validate auth data structure
  private validateAuthData(data: any): data is AuthData {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    return (
      data.user !== null &&
      data.user !== undefined &&
      data.tokens !== null &&
      data.tokens !== undefined &&
      this.validateUser(data.user) &&
      this.validateTokens(data.tokens)
    );
  }

  // 🔒 VALIDATION: Validate user data structure
  private validateUser(user: any): user is User {
    // تحقق أساسي من وجود المستخدم
    if (!user || typeof user !== 'object') {
      return false;
    }

    // السماح بالمرور إذا توفر أي مُعرّف أساسي
    const hasIdentifier = (user.id != null || user.pk != null ||
                           (typeof user.email === 'string' && user.email.length > 0) ||
                           (typeof user.username === 'string' && user.username.length > 0));
    if (!hasIdentifier) {
      return false;
    }

    // ملاحظات فقط في حال نقص بعض الحقول (لا تمنع الحفظ)
    if (!user.id && !user.pk) {
    }
    if (!user.email) {
    }
    if (!user.username) {
    }

    return true;
  }

  // 🔒 VALIDATION: Validate tokens structure
  private validateTokens(tokens: any): tokens is AuthTokens {

    const isValid = (
      tokens &&
      typeof tokens === 'object' &&
      typeof tokens.access === 'string' &&
      typeof tokens.refresh === 'string' &&
      tokens.access.length > 0 &&
      tokens.refresh.length > 0
    );

    if (!isValid) {
      // Tokens validation failed
    }

    return isValid;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Legacy exports for backward compatibility
export const saveAuthData = (data: AuthData) => authService.saveAuthData(data.user, data.tokens);
export const getAuthData = () => authService.getStoredAuthData();
export const isAuthenticated = () => authService.isAuthenticated();
export const getAccessToken = () => authService.getAccessToken();
export const getAuthToken = () => authService.getAccessToken(); // Legacy
export const clearAuthData = () => authService.clearAuthData();
export const refreshAccessToken = () => authService.refreshAccessToken();
export const initializeAuth = () => authService.initialize();
