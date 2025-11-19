// 🔒 Simplified Authentication Service
// This service provides a clean, simple authentication flow without conflicts

import { User, AuthTokens } from '../types/auth';
import { store } from '../store';

class SimpleAuthService {
  private static instance: SimpleAuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;
  private isInitialized = false;
  private refreshTimeoutId: NodeJS.Timeout | null = null;
  private tokenCheckIntervalId: NodeJS.Timeout | null = null;
  private visibilityHandler: (() => void) | null = null;
  private focusHandler: (() => void) | null = null;

  private constructor() {}

  static getInstance(): SimpleAuthService {
    if (!SimpleAuthService.instance) {
      SimpleAuthService.instance = new SimpleAuthService();
    }
    return SimpleAuthService.instance;
  }

  // Initialize from localStorage
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    try {
      const userStr = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (userStr && accessToken && refreshToken) {
        this.user = JSON.parse(userStr);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        
        // Check if access token is expired and refresh immediately if needed
        if (this.isTokenExpired(this.accessToken)) {
          console.log('🔄 Access token expired on initialization, refreshing...');
          this.refreshAccessTokenWithRetry().then((success) => {
            if (success) {
              // Update Redux store after successful refresh
              store.dispatch({
                type: 'auth/login',
                payload: {
                  user: this.user,
                  tokens: {
                    access: this.accessToken,
                    refresh: this.refreshToken
                  }
                }
              });
            }
          });
        } else {
          // Update Redux store with user data
          store.dispatch({
            type: 'auth/login',
            payload: {
              user: this.user,
              tokens: {
                access: this.accessToken,
                refresh: this.refreshToken
              }
            }
          });
        }
        
        // Check if token needs refresh and schedule auto-refresh
        this.scheduleTokenRefresh();
        this.startTokenCheckInterval();
        this.setupVisibilityListener();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
    }
  }

  // Schedule automatic token refresh
  private scheduleTokenRefresh(): void {
    // Clear existing timeout
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
    
    // Don't schedule refresh if tokens are cleared (user logged out)
    if (!this.accessToken || !this.refreshToken) {
      console.log('⚠️ Cannot schedule token refresh: tokens are missing');
      return;
    }
    
    try {
      const parts = this.accessToken.split('.');
      if (parts.length !== 3) return;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = payload.exp;
      const issuedAt = payload.iat || expirationTime - 3600; // Default to 1 hour if iat missing
      const timeUntilExpiry = expirationTime - currentTime;
      const tokenLifetime = expirationTime - issuedAt; // Total token lifetime in seconds
      
      // If token is expired, refresh immediately
      if (timeUntilExpiry <= 0) {
        console.log('🔄 Token expired, refreshing immediately...');
        this.refreshAccessTokenWithRetry();
        return;
      }
      
      // Only refresh if token expires in less than 5 minutes
      if (timeUntilExpiry <= 300) {
        console.log('🔄 Token expires very soon, refreshing immediately...');
        this.refreshAccessTokenWithRetry();
        return;
      }
      
      // Calculate dynamic buffer: 20% of token lifetime, but at least 15 minutes and at most 20 minutes
      // More aggressive refresh to prevent token expiration
      const dynamicBuffer = Math.min(
        Math.max(Math.floor(tokenLifetime * 0.20), 900), // At least 15 minutes (900 seconds)
        1200 // At most 20 minutes (1200 seconds)
      );
      
      // Schedule refresh with dynamic buffer
      const refreshTime = Math.max(timeUntilExpiry - dynamicBuffer, 300) * 1000; // At least 5 minutes
      
      const minutesUntilRefresh = Math.floor(refreshTime / 1000 / 60);
      const secondsUntilRefresh = Math.floor((refreshTime / 1000) % 60);
      console.log(`⏰ Scheduling token refresh in ${minutesUntilRefresh}m ${secondsUntilRefresh}s (buffer: ${Math.floor(dynamicBuffer / 60)}m)`);
      
      this.refreshTimeoutId = setTimeout(async () => {
        console.log('🔄 Scheduled token refresh triggered');
        const success = await this.refreshAccessTokenWithRetry();
        if (success) {
          // Schedule next refresh
          this.scheduleTokenRefresh();
        } else {
          // If refresh failed, try again in 30 seconds (shorter retry for faster recovery)
          console.warn('⚠️ Token refresh failed, retrying in 30 seconds...');
          this.refreshTimeoutId = setTimeout(() => {
            this.scheduleTokenRefresh();
          }, 30000);
        }
      }, refreshTime);
      
    } catch (error) {
      console.error('❌ Error scheduling token refresh:', error);
      // Retry in 2 minutes if scheduling fails (shorter than before)
      this.refreshTimeoutId = setTimeout(() => {
        this.scheduleTokenRefresh();
      }, 2 * 60 * 1000);
    }
  }

  // Start periodic token check (every 1 minute - more aggressive to catch expiration)
  private startTokenCheckInterval(): void {
    // Clear existing interval
    if (this.tokenCheckIntervalId) {
      clearInterval(this.tokenCheckIntervalId);
      this.tokenCheckIntervalId = null;
    }
    
    // Don't start if tokens are missing
    if (!this.accessToken || !this.refreshToken) {
      console.log('⚠️ Cannot start token check interval: tokens are missing');
      return;
    }
    
    // Check token validity every 1 minute (more frequent to catch expiration early)
    this.tokenCheckIntervalId = setInterval(() => {
      // Don't check if tokens are cleared (user logged out)
      if (!this.accessToken || !this.refreshToken) {
        // Clear interval if tokens are missing
        if (this.tokenCheckIntervalId) {
          clearInterval(this.tokenCheckIntervalId);
          this.tokenCheckIntervalId = null;
        }
        return;
      }
      
      try {
        // Check if token is expired or expiring soon (within 10 minutes)
        if (this.isTokenExpired(this.accessToken)) {
          console.log('🔄 Token expired, refreshing...');
          this.refreshAccessTokenWithRetry().then((success) => {
            if (success) {
              // Re-schedule after successful refresh
              this.scheduleTokenRefresh();
            }
          });
        } else if (this.isTokenExpiringSoon(this.accessToken)) {
          // Token is expiring soon (within 10 minutes), refresh proactively
          console.log('🔄 Token expiring soon, refreshing proactively...');
          this.refreshAccessTokenWithRetry().then((success) => {
            if (success) {
              // Re-schedule after successful refresh
              this.scheduleTokenRefresh();
            }
          });
        } else {
          // Re-schedule refresh to ensure it's always scheduled (even if timeout was cleared)
          // This ensures refresh works even after long periods of inactivity
          if (!this.refreshTimeoutId) {
            console.log('🔄 Re-scheduling token refresh (timeout was missing)...');
            this.scheduleTokenRefresh();
          }
        }
      } catch (error) {
        console.error('❌ Error in token check interval:', error);
        // Re-schedule refresh on error to ensure it continues working
        if (!this.refreshTimeoutId) {
          this.scheduleTokenRefresh();
        }
      }
    }, 60 * 1000); // Check every 1 minute (more aggressive)
  }

  // Setup visibility change listener to refresh token when user returns
  private setupVisibilityListener(): void {
    if (typeof window === 'undefined') return;
    
    // Remove existing listeners first
    this.removeVisibilityListeners();
    
    // Create new handlers
    this.visibilityHandler = () => {
      if (!document.hidden && this.accessToken && this.refreshToken) {
        // User returned to tab, check if token needs refresh
        console.log('👁️ Tab became visible, checking token...');
        
        if (this.isTokenExpired(this.accessToken)) {
          console.log('🔄 Token expired while away, refreshing...');
          this.refreshAccessTokenWithRetry();
        } else {
          // Re-schedule refresh based on current token
          this.scheduleTokenRefresh();
        }
      }
    };
    
    this.focusHandler = () => {
      if (this.accessToken && this.refreshToken) {
        console.log('👁️ Window focused, checking token...');
        
        if (this.isTokenExpired(this.accessToken)) {
          console.log('🔄 Token expired, refreshing...');
          this.refreshAccessTokenWithRetry();
        } else {
          this.scheduleTokenRefresh();
        }
      }
    };
    
    // Add listeners
    document.addEventListener('visibilitychange', this.visibilityHandler);
    window.addEventListener('focus', this.focusHandler);
  }

  // Remove visibility listeners
  private removeVisibilityListeners(): void {
    if (typeof window === 'undefined') return;
    
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
    
    if (this.focusHandler) {
      window.removeEventListener('focus', this.focusHandler);
      this.focusHandler = null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!(this.user && this.accessToken && this.refreshToken);
  }

  // Get access token
  // Returns the current access token if valid, null otherwise
  // Does NOT clear tokens or log out user - just returns null
  getAccessToken(): string | null {
    if (!this.accessToken) return null;
    
    // Check if token is expired
    // Only return null if expired - don't clear anything
    if (this.isTokenExpired(this.accessToken)) {
      return null;
    }
    
    return this.accessToken;
  }

  // Check if token is expired
  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is actually expired (not just expires soon)
      // Only consider it expired if it's already past expiration time
      return !payload?.exp || payload.exp <= currentTime;
    } catch (error) {
      return true;
    }
  }

  // Check if token is expiring soon (within 10 minutes)
  private isTokenExpiringSoon(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload?.exp ? payload.exp - currentTime : -1;
      
      // Consider it expiring soon if it expires in less than 10 minutes
      // This gives us more time to refresh before expiration
      return timeUntilExpiry > 0 && timeUntilExpiry < 600; // 10 minutes
    } catch (error) {
      return true;
    }
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  // Get user data
  getUser(): User | null {
    return this.user;
  }

  // Save authentication data
  saveAuthData(user: User, tokens: AuthTokens): boolean {
    try {
      this.user = user;
      this.accessToken = tokens.access;
      this.refreshToken = tokens.refresh;

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('tokens', JSON.stringify(tokens));

      
      // Update Redux store with user data
      store.dispatch({
        type: 'auth/login',
        payload: {
          user: this.user,
          tokens: {
            access: this.accessToken,
            refresh: this.refreshToken
          }
        }
      });
      
      // Schedule token refresh and start monitoring
      this.scheduleTokenRefresh();
      this.startTokenCheckInterval();
      this.setupVisibilityListener();
      
      return true;
    } catch (error) {
      console.error('❌ Error saving auth data:', error);
      return false;
    }
  }

  // Clear authentication data
  async clearAuthData(): Promise<void> {
    try {
      // Clear timers FIRST to prevent any scheduled refreshes
      if (this.refreshTimeoutId) {
        clearTimeout(this.refreshTimeoutId);
        this.refreshTimeoutId = null;
      }
      if (this.tokenCheckIntervalId) {
        clearInterval(this.tokenCheckIntervalId);
        this.tokenCheckIntervalId = null;
      }
      
      // Remove event listeners to prevent refresh attempts
      this.removeVisibilityListeners();
      
      // Get refresh token before clearing
      const refreshTokenToBlacklist = this.refreshToken;
      
      // Clear in-memory data FIRST to prevent refresh attempts
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;

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
      
      // Also use TokenSecurity to clear tokens
      try {
        const { TokenSecurity } = await import('../security/tokenSecurity');
        TokenSecurity.clearStoredTokens();
      } catch (e) {
        console.warn('⚠️ Failed to use TokenSecurity.clearStoredTokens:', e);
      }
      
      // Clear Redux store
      try {
        store.dispatch({
          type: 'auth/logout'
        });
      } catch (e) {
        console.warn('⚠️ Failed to dispatch logout to Redux:', e);
      }
      
      // Call logout API to blacklist refresh token on server
      // Do this AFTER clearing local data to prevent refresh attempts
      if (refreshTokenToBlacklist) {
        try {
          const { apiClient } = await import('../api');
          const logoutResult = await apiClient.logout(refreshTokenToBlacklist);
          
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
      
      // Dispatch events to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authStateChanged'));
        window.dispatchEvent(new Event('storage')); // For cross-tab sync
      }

    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
      // Ensure local data is cleared even if there's an error
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      
      // Clear all auth keys even on error
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
          // Ignore errors during cleanup
        }
      });
    }
  }

  // Check if refresh token is expired
  // Returns true ONLY if token is actually expired (past expiration time)
  // Does NOT return true if token is just expiring soon
  private isRefreshTokenExpired(refreshToken: string): boolean {
    try {
      const parts = refreshToken.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if refresh token is expired (refresh tokens usually last 7-30 days)
      // Only consider it expired if it's ACTUALLY past expiration time
      // Give a 5-minute grace period to handle clock skew
      const timeUntilExpiry = payload?.exp ? payload.exp - currentTime : -1;
      const isExpired = !payload?.exp || payload.exp <= (currentTime - 300); // 5-minute grace period
      const expiresSoon = timeUntilExpiry > 0 && timeUntilExpiry < 3600; // Less than 1 hour
      
      if (process.env.NODE_ENV === 'development' && expiresSoon && !isExpired) {
        console.warn('⚠️ Refresh token expires soon (but not expired yet):', {
          expiresIn: Math.floor(timeUntilExpiry / 60) + ' minutes',
          expiresAt: new Date(payload.exp * 1000).toISOString()
        });
      }
      
      return isExpired;
    } catch (error) {
      // If we can't parse it, don't consider it expired - might be a parsing issue
      // Only return true if we're absolutely sure it's invalid
      console.error('❌ Error parsing refresh token:', error);
      return false; // Don't clear tokens if we can't parse - might be temporary issue
    }
  }

  // Refresh access token with retry mechanism
  // Only retries on network errors, not on authentication errors
  private async refreshAccessTokenWithRetry(maxRetries: number = 3): Promise<boolean> {
    // Don't attempt refresh if tokens are cleared (user logged out)
    if (!this.refreshToken || !this.accessToken) {
      console.log('⚠️ Tokens are missing, cannot refresh');
      return false;
    }
    
    let lastError: any = null;
    let wasBlacklisted = false;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const success = await this.refreshAccessToken();
        if (success) {
          if (attempt > 1) {
            console.log(`✅ Token refreshed successfully after ${attempt} attempts`);
          }
          return true;
        }
      } catch (error: any) {
        // Catch blacklisted token error
        lastError = error;
        if (error?.blacklisted || 
            error?.message?.toLowerCase().includes('blacklisted') ||
            error?.detail?.toLowerCase().includes('blacklisted') ||
            error?.code?.toLowerCase().includes('blacklisted')) {
          console.log('⚠️ Token is blacklisted, stopping retry');
          wasBlacklisted = true;
          break;
        }
      }
      
      // Check if we should continue retrying
      // Don't retry if tokens were cleared (user was logged out or token was blacklisted)
      if (!this.refreshToken) {
        console.log('⚠️ Refresh token cleared, stopping retry');
        return false;
      }
      
      // Check if the error was due to blacklisted token
      // If so, don't retry - user needs to login again
      if (lastError && (
        lastError.blacklisted ||
        lastError.message?.toLowerCase().includes('blacklisted') ||
        lastError.detail?.toLowerCase().includes('blacklisted') ||
        lastError.code?.toLowerCase().includes('blacklisted')
      )) {
        console.log('⚠️ Token is blacklisted, stopping retry');
        wasBlacklisted = true;
        break;
      }
      
      // If this is not the last attempt, wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.min(Math.pow(2, attempt - 1) * 1000, 5000); // Max 5 seconds
        console.log(`⚠️ Token refresh failed (attempt ${attempt}/${maxRetries}), retrying in ${waitTime / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    // If token was blacklisted, don't retry later
    if (wasBlacklisted) {
      console.warn('⚠️ Token refresh failed due to blacklisted token, will not retry');
      return false;
    }
    
    // If we get here, all retries failed
    // But don't clear tokens - might be temporary network issue
    // The token check interval will try again later
    console.warn(`⚠️ Token refresh failed after ${maxRetries} attempts, will retry on next check interval`);
    return false;
  }

  // Refresh access token
  async refreshAccessToken(): Promise<boolean> {
    // Don't attempt refresh if tokens are cleared (user logged out)
    if (!this.refreshToken || !this.accessToken) {
      console.error('❌ No refresh token available or tokens were cleared');
      return false;
    }

    // Check if refresh token itself is expired before attempting refresh
    // Only clear if it's ACTUALLY expired (not just expiring soon)
    if (this.isRefreshTokenExpired(this.refreshToken)) {
      // Double-check: verify it's really expired by checking the actual expiration time
      try {
        const parts = this.refreshToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = payload?.exp ? payload.exp - currentTime : -1;
          
          // Only clear if token is ACTUALLY expired (past expiration time)
          // Give a 5-minute grace period to handle clock skew
          if (timeUntilExpiry < -300) { // Expired more than 5 minutes ago
            console.error('❌ Refresh token is expired (more than 5 minutes), cannot refresh access token');
      await this.clearAuthData();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return false;
          } else if (timeUntilExpiry < 0) {
            // Expired but within grace period - try to refresh anyway
            console.warn('⚠️ Refresh token expired but within grace period, attempting refresh...');
          }
        }
      } catch (error) {
        console.error('❌ Error parsing refresh token, cannot refresh');
        return false;
      }
    }

    try {
      // Check if tokens were cleared before making request
      if (!this.refreshToken || !this.accessToken) {
        console.log('⚠️ Tokens were cleared before refresh request, aborting');
        return false;
      }

      console.log('🔄 Attempting to refresh access token...');
      
      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      // Check if tokens were cleared during the request (user logged out)
      if (!this.refreshToken || !this.accessToken) {
        console.log('⚠️ Tokens were cleared during refresh request, aborting');
        return false;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.access) {
          // Double-check tokens weren't cleared during response processing
          if (!this.refreshToken) {
            console.log('⚠️ Tokens were cleared during refresh response, aborting');
            return false;
          }
          console.log('✅ Token refreshed successfully');
          this.accessToken = data.access;
          
          // Update refresh token if provided (token rotation)
          if (data.refresh) {
            this.refreshToken = data.refresh;
            localStorage.setItem('refresh_token', data.refresh);
          }
          
          // Update tokens in localStorage
          const newTokens = {
            access: data.access,
            refresh: data.refresh || this.refreshToken
          };
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('tokens', JSON.stringify(newTokens));
          
          // Update Redux store
          store.dispatch({
            type: 'auth/setTokens',
            payload: newTokens
          });
          
          // Schedule next refresh
          this.scheduleTokenRefresh();
          
          return true;
        } else {
          console.error('❌ No access token in refresh response');
        }
      } else {
        // Handle error response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || 'Token refresh failed';
        const errorCode = errorData.code || '';
        
        console.error('❌ Token refresh failed:', response.status, errorMessage);
        
        // Only clear tokens if refresh token is expired (401/403) AND error message confirms it
        if (response.status === 401 || response.status === 403) {
          const isTokenExpired = errorMessage.toLowerCase().includes('expired') || 
                                errorMessage.toLowerCase().includes('token_expired') ||
                                errorMessage.toLowerCase().includes('token has expired');
          
          const isTokenBlacklisted = errorMessage.toLowerCase().includes('blacklisted') ||
                                    errorMessage.toLowerCase().includes('blacklist') ||
                                    errorCode.toLowerCase().includes('blacklisted');
          
          const isTokenInvalid = errorMessage.toLowerCase().includes('invalid') || 
                                errorMessage.toLowerCase().includes('token_not_valid') ||
                                errorMessage.toLowerCase().includes('token is invalid') ||
                                errorCode.toLowerCase().includes('token_not_valid');
          
          // If token is blacklisted, clear immediately and don't retry
          if (isTokenBlacklisted) {
            console.error('❌ Refresh token is blacklisted (user logged out), clearing auth data');
            // Clear tokens immediately - user was logged out
            // Store error info before clearing
            const blacklistError = {
              message: errorMessage,
              detail: errorMessage,
              code: errorCode,
              blacklisted: true
            };
            await this.clearAuthData();
            // Redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            // Throw error so retry mechanism knows it was blacklisted
            throw blacklistError;
          }
          
          // Only clear if we're CERTAIN the token is expired (not just invalid)
          if (isTokenExpired && (response.status === 401 || errorMessage.toLowerCase().includes('expired'))) {
            console.error('❌ Refresh token expired, clearing auth data');
            // Refresh token expired, need to login again
            await this.clearAuthData();
            // Redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return false; // Don't retry if token is expired
          } else if (isTokenInvalid) {
            // Token is invalid but not expired - might be blacklisted or corrupted
            // Check if it's a clear "blacklisted" error
            if (isTokenBlacklisted || errorCode === 'token_not_valid') {
              console.error('❌ Refresh token is invalid/blacklisted, clearing auth data');
              await this.clearAuthData();
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
              return false;
            }
            // Otherwise, might be temporary issue - don't clear, just return false
            console.warn('⚠️ Token refresh returned 401/403 with invalid token, will retry later');
            return false; // Retry later
          } else {
            // 401/403 but not clearly expired/invalid - might be temporary server issue
            console.warn('⚠️ Token refresh returned 401/403 but error message unclear, will retry later');
            return false; // Retry later
          }
        }
      }

      return false;
    } catch (error: any) {
      // Distinguish between network errors and other errors
      const isNetworkError = error instanceof TypeError && 
                            (error.message.includes('fetch') || 
                             error.message.includes('network') ||
                             error.message.includes('Failed to fetch') ||
                             error.message.includes('ERR_CONNECTION_REFUSED') ||
                             error.message.includes('ERR_INTERNET_DISCONNECTED'));
      
      if (isNetworkError) {
        console.warn('⚠️ Network error during token refresh, will retry later:', error.message);
      // Don't clear tokens on network errors - allow retry
        // Keep user logged in and retry when network is back
        return false;
      } else {
        console.error('❌ Unexpected error during token refresh:', error);
        // Don't clear tokens on unexpected errors either - might be temporary
      return false;
      }
    }
  }

  // Get valid access token (with auto-refresh)
  // Attempts to refresh token if needed, but never clears tokens or logs out user
  async getValidAccessToken(): Promise<string | null> {
    // First check if we have a valid token
    const currentToken = this.getAccessToken();
    
    // If token is valid and not expiring soon (within 10 minutes), return it
    if (currentToken && !this.isTokenExpired(currentToken) && !this.isTokenExpiringSoon(currentToken)) {
      return currentToken;
    }
    
    // If token is expired or expiring soon, try to refresh immediately
    // Only attempt refresh if we have a refresh token
    if (this.refreshToken) {
      // Check if refresh token is actually expired before attempting
      if (!this.isRefreshTokenExpired(this.refreshToken)) {
        // If token is expired or expiring soon, refresh synchronously
        if (this.isTokenExpired(this.accessToken || '') || this.isTokenExpiringSoon(this.accessToken || '')) {
          console.log('🔄 Token expired or expiring soon, refreshing immediately...');
          const refreshSuccess = await this.refreshAccessTokenWithRetry();
          if (refreshSuccess) {
            return this.getAccessToken();
          }
        }
        
        // Return current token even if refresh is in progress
        // This allows API calls to proceed while refresh happens in background
        return this.accessToken;
      } else {
        // Refresh token is expired - but don't clear here, let the refresh function handle it
        console.warn('⚠️ Refresh token expired, cannot refresh access token');
        return this.accessToken; // Return current token anyway - might still work for a bit
      }
    }
    
    // No refresh token - return current token if available
    return this.accessToken;
  }

  // Get stored auth data
  getStoredAuthData(): { user: User; tokens: AuthTokens } | null {
    if (!this.isAuthenticated()) return null;
    
    return {
      user: this.user!,
      tokens: {
        access: this.accessToken!,
        refresh: this.refreshToken!
      }
    };
  }
}

export const simpleAuthService = SimpleAuthService.getInstance();
