/**
 * 🚀 Unified API Client for Rushd Academy System
 * Uses native fetch API - no external dependencies
 * Includes Rate Limiting for frontend request management
 * Unified error handling and logging
 */

import { getBaseUrl } from './config';
import { getAccessToken as getAccessTokenFromService } from './auth';
import { logger } from './utils/logger';
import { errorHandler, ErrorType, ErrorSeverity } from './utils/errorHandler';
// Rate limiting disabled

/**
 * API Client configuration
 */
interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

/**
 * Request configuration interface
 */
interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

/**
 * Unified API Response interface
 */
interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  success?: boolean;
  error?: string;
}

/**
 * Request/Response Interceptor types
 */
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
type ErrorInterceptor = (error: any) => any | Promise<any>;

/**
 * API Client class
 */
class ApiClient {
  private config: ApiClientConfig;
  private refreshTokenPromise: Promise<boolean> | null = null;
  private lastRefreshTime: number = 0;
  private readonly REFRESH_COOLDOWN = 5000; // 5 seconds cooldown
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  // Interceptors
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let result = config;
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  /**
   * Apply error interceptors
   */
  private async applyErrorInterceptors(error: any): Promise<any> {
    let result = error;
    for (const interceptor of this.errorInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryRequest<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    retries: number = this.MAX_RETRIES
  ): Promise<ApiResponse<T>> {
    try {
      return await requestFn();
    } catch (error: any) {
      // Only retry on network errors or 5xx errors
      const shouldRetry = 
        retries > 0 && 
        (error.name === 'AbortError' || 
         error.name === 'TypeError' ||
         (error.status && error.status >= 500));

      if (shouldRetry) {
        const delay = this.RETRY_DELAY * (this.MAX_RETRIES - retries + 1);
        logger.warn(`Retrying request after ${delay}ms (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Get auth token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    // 1) Try centralized auth service (new flow)
    try {
      const svcToken = getAccessTokenFromService?.();
      if (svcToken) {
        // Also store in legacy key for compatibility
        localStorage.setItem('token', svcToken);
        localStorage.setItem('access_token', svcToken);
        // Try to get refresh token from auth service too
        try {
          const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('refresh_token');
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('refresh_token', refreshToken);
          }
        } catch (_) { /* ignore */ }
        return svcToken;
      }
    } catch (_) { /* ignore */ }

    // 2) Legacy key fallback
    const legacy = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (legacy) {
      // Also store in legacy key for compatibility
      localStorage.setItem('token', legacy);
      localStorage.setItem('access_token', legacy);
      // Try to get refresh token from legacy too
      try {
        const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('refresh_token');
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('refresh_token', refreshToken);
        }
      } catch (_) { /* ignore */ }
      return legacy;
    }

    // 3) New storage structure { tokens: { access, refresh } }
    try {
      const tokensStr = localStorage.getItem('tokens');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        if (tokens?.access) {
          // Also store in legacy key for compatibility
          localStorage.setItem('token', tokens.access);
          localStorage.setItem('access_token', tokens.access);
          if (tokens.refresh) {
            localStorage.setItem('refreshToken', tokens.refresh);
            localStorage.setItem('refresh_token', tokens.refresh);
          }
          return tokens.access;
        }
      }
    } catch (_) { /* ignore */ }

    // No token found - silent fail (don't log in production)
    return null;
  }

  /**
   * Create request headers
   */
  private async createHeaders(customHeaders: Record<string, string> = {}, skipAuth: boolean = false): Promise<Record<string, string>> {
    const headers = {
      ...this.config.headers,
      ...customHeaders,
    };

    // Don't add Authorization header for auth endpoints or if explicitly skipped
    if (!skipAuth) {
      // Try to get valid token from simpleAuth first (with auto-refresh)
      try {
        const { simpleAuthService } = await import('./auth/simpleAuth');
        // Ensure simpleAuth is initialized
        if (!simpleAuthService.isAuthenticated()) {
          simpleAuthService.initialize();
        }
        const validToken = await simpleAuthService.getValidAccessToken();
        if (validToken) {
          headers['Authorization'] = `Bearer ${validToken}`;
        } else {
          // Fallback to getAuthToken if simpleAuth doesn't have a valid token
          const token = this.getAuthToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }
      } catch (error) {
        // If simpleAuth is not available, fallback to getAuthToken
        const token = this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }

    return headers;
  }

  /**
   * Handle fetch with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Handle token refresh with cooldown protection (internal use)
   * Uses authService to avoid duplicate refresh logic
   */
  private async refreshTokenInternal(): Promise<boolean> {
    const now = Date.now();
    
    // If we're already refreshing or recently refreshed, return the existing promise
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }
    
    // If we refreshed recently, don't refresh again (cooldown protection)
    if (now - this.lastRefreshTime < this.REFRESH_COOLDOWN) {
      return true; // Assume token is still valid
    }

    // Use authService for token refresh to avoid duplicate logic
    this.refreshTokenPromise = (async () => {
      try {
        const { authService } = await import('./auth/authService');
        const success = await authService.refreshAccessToken();
        this.lastRefreshTime = Date.now();
        return success;
      } catch (error) {
        // Fallback to direct refresh if authService fails
        return await this.performTokenRefreshFallback();
      }
    })();
    
    try {
      const result = await this.refreshTokenPromise;
      return result;
    } finally {
      this.refreshTokenPromise = null;
    }
  }

  /**
   * Fallback token refresh (only used if authService is not available)
   */
  private async performTokenRefreshFallback(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.config.baseURL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access) {
          // Update tokens in localStorage
          localStorage.setItem('token', data.access);
          localStorage.setItem('access_token', data.access);
          
          // Update refresh token if provided
          if (data.refresh) {
            localStorage.setItem('refreshToken', data.refresh);
            localStorage.setItem('refresh_token', data.refresh);
          }
          
          // Update tokens object if it exists
          try {
            const tokensStr = localStorage.getItem('tokens');
            if (tokensStr) {
              const tokens = JSON.parse(tokensStr);
              tokens.access = data.access;
              if (data.refresh) {
                tokens.refresh = data.refresh;
              }
              localStorage.setItem('tokens', JSON.stringify(tokens));
            } else {
              localStorage.setItem('tokens', JSON.stringify({
                access: data.access,
                refresh: data.refresh || refreshToken
              }));
            }
          } catch (e) {
            // Ignore errors updating tokens object
          }
          
          return true;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || 'Token refresh failed';
        
        // If refresh token is expired (401 or 403), check if it's actually expired
        if (response.status === 401 || response.status === 403) {
          const isTokenExpired = errorMessage.includes('expired') || 
                                errorMessage.includes('invalid') || 
                                errorMessage.includes('token_not_valid');
          
          if (isTokenExpired) {
            await this.handleTokenExpired();
          }
          return false;
        }
      }
    } catch (error) {
      // Don't handle token expiration on network errors
    }

    return false;
  }

  /**
   * Handle expired tokens - only clear auth data if refresh token is actually expired
   * Don't logout user unnecessarily - try refresh first
   */
  private async handleTokenExpired(): Promise<void> {
    // Only redirect if we're not already on the login/register page
    if (typeof window !== 'undefined' && 
        !window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/register') &&
        !window.location.pathname.includes('/forgot-password') &&
        !window.location.pathname.includes('/reset-password')) {
      
      // Try to refresh token first before clearing auth data
      // Only clear if refresh token is actually expired (not just access token)
      try {
        // Try simpleAuth first (more reliable)
        const { simpleAuthService } = await import('./auth/simpleAuth');
        if (!simpleAuthService.isAuthenticated()) {
          simpleAuthService.initialize();
        }
        const refreshSuccess = await simpleAuthService.refreshAccessToken();
        
        // If refresh succeeded, don't clear auth data - user can continue
        if (refreshSuccess) {
          console.log('✅ Token refreshed successfully after 401 error');
          return; // Don't logout - refresh worked
        }
        
        // Fallback to authService if simpleAuth fails
        const { authService } = await import('./auth/authService');
        const fallbackRefreshSuccess = await authService.refreshAccessToken();
        
        if (fallbackRefreshSuccess) {
          console.log('✅ Token refreshed successfully using fallback method');
          return; // Don't logout - refresh worked
        }
        
        // If refresh failed, it means refresh token is expired - safe to logout
        console.log('❌ Refresh token expired, clearing auth data');
      } catch (e) {
        // If we can't import authService or refresh fails, assume refresh token is expired
        console.error('❌ Error refreshing token, clearing auth data', e);
      }
      
      // Only clear auth data if refresh token is actually expired
      // Clear all auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      localStorage.removeItem('tokens');
      localStorage.removeItem('user');
      
      // Clear authService if available
      try {
        import('./auth/authService').then(({ authService }) => {
          authService.clearAuthData(true).catch(() => {}); // Skip API call to avoid loop
        }).catch(() => {});
      } catch (e) {
        // Ignore if authService is not available
      }
      
      // Set login message
      sessionStorage.setItem('login_message', 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  }

  /**
   * Get Arabic error message from error
   */
  private getArabicErrorMessage(error: any, status?: number): string {
    if (error?.userMessage) {
      return error.userMessage;
    }

    if (status) {
      const httpError = errorHandler.handleHttpError(status, error?.data || error);
      return httpError.userMessage;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى';
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return 'خطأ في الاتصال بالخادم. تحقق من الاتصال بالإنترنت';
      }
    }

    return error?.message || 'حدث خطأ غير متوقع';
  }

  /**
   * Make HTTP request with rate limiting, retry, and interceptors
   */
  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    // Rate limiting disabled - no restrictions

    const url = `${this.config.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const timeout = config.timeout || this.config.timeout;
    const method = config.method || 'GET';

    // Check if this is an authentication endpoint (login/register/refresh)
    // These endpoints don't require Authorization headers and shouldn't trigger token refresh
    const isAuthEndpoint = url.includes('/auth/login/') || 
                           url.includes('/auth/register/') || 
                           url.includes('/auth/token/refresh/');

    // Apply request interceptors
    let finalConfig = await this.applyRequestInterceptors(config);

    const requestOptions: RequestInit = {
      method,
      headers: await this.createHeaders(finalConfig.headers, isAuthEndpoint),
    };

    // If we don't currently have an access token, proactively try to refresh it
    // BUT skip this for auth endpoints (login/register) - they don't need tokens
    if (!isAuthEndpoint) {
      try {
        const currentToken = this.getAuthToken();
        if (!currentToken) {
          const refreshed = await this.refreshTokenInternal();
          if (refreshed) {
            // Rebuild headers to include the fresh token
            requestOptions.headers = await this.createHeaders(config.headers, isAuthEndpoint);
          }
        }
      } catch (_) {
        // ignore; request will proceed and 401 will be handled below as well
      }
    }

    if (finalConfig.body && method !== 'GET') {
      // Handle FormData separately - don't stringify it
      if (finalConfig.body instanceof FormData) {
        requestOptions.body = finalConfig.body;
        // Remove Content-Type header for FormData - let browser set it with boundary
        if (requestOptions.headers) {
          const headers = requestOptions.headers as Record<string, string>;
          delete headers['Content-Type'];
        }
      } else {
        requestOptions.body = typeof finalConfig.body === 'string' 
          ? finalConfig.body 
          : JSON.stringify(finalConfig.body);
      }
    }

    // Log request
    logger.request(method, url, finalConfig.body);

    // Retry wrapper
    const makeRequest = async (): Promise<ApiResponse<T>> => {
      try {
        let response = await this.fetchWithTimeout(url, requestOptions, timeout);

      // Handle 401 errors (token refresh)
      if (response.status === 401) {
        // Don't refresh if this is an authentication endpoint (login/register/refresh)
        // These endpoints don't require tokens and 401 means invalid credentials, not expired token
        // isAuthEndpoint is already defined in the outer scope
        if (isAuthEndpoint) {
          // For auth endpoints, 401 means invalid credentials - don't try to refresh
          // Just read the error message and throw
          try {
            const errorText = await response.text();
            let errorData = {};
            try {
              errorData = JSON.parse(errorText);
            } catch (e) {
              // Can't parse JSON - use error text as message
            }
            const errorMessage = errorData.detail || errorData.message || errorData.error || 'Authentication failed';
            const err: any = new Error(errorMessage);
            err.status = 401;
            err.statusText = 'Unauthorized';
            err.data = errorData;
            throw err;
          } catch (e: any) {
            // If reading response fails, throw generic error
            if (e.status === 401) throw e; // Re-throw if it's already our error
            const err: any = new Error('Authentication failed');
            err.status = 401;
            err.statusText = 'Unauthorized';
            throw err;
          }
        }
        
        if (!isAuthEndpoint) {
          const refreshed = await this.refreshTokenInternal();
          if (refreshed) {
            // Retry request with new token (only once to avoid infinite loops)
            // Don't skip auth here since we already know it's not an auth endpoint
            requestOptions.headers = await this.createHeaders(config.headers, false);
            response = await this.fetchWithTimeout(url, requestOptions, timeout);
            
            // If still 401 after refresh, check if refresh token is expired
            if (response.status === 401) {
              // Try to get error message from response
              try {
                const errorText = await response.text();
                let errorData = {};
                try {
                  errorData = JSON.parse(errorText);
                } catch (e) {
                  // Can't parse JSON - use empty object
                }
                const errorMessage = errorData.detail || errorData.message || '';
                const isTokenExpired = errorMessage.includes('expired') || 
                                      errorMessage.includes('invalid') || 
                                      errorMessage.includes('token_not_valid');
                
                if (isTokenExpired) {
                  // Refresh token is expired - handle token expiration
                  await this.handleTokenExpired();
                }
              } catch (e) {
                // Can't parse error - assume token expired for safety
                await this.handleTokenExpired();
              }
              
              const err: any = new Error('Authentication failed');
              err.status = 401;
              err.statusText = 'Unauthorized';
              throw err;
            }
          } else {
            // Refresh failed, but don't logout immediately
            // Only logout if refresh token is actually expired
            const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken');
            if (!refreshToken) {
              // No refresh token - must logout (unless this is an auth endpoint)
              const isAuthEndpoint = url.includes('/auth/login/') || 
                                     url.includes('/auth/register/') || 
                                     url.includes('/auth/token/refresh/');
              if (!isAuthEndpoint) {
                await this.handleTokenExpired();
              }
            }
            
            const err: any = new Error('Authentication failed');
            err.status = 401;
            err.statusText = 'Unauthorized';
            throw err;
          }
        } else {
          // This is a refresh token request that failed
          // Check if refresh token is expired before logging out
          // Note: response body was already consumed above, so we can't read it again
          // We'll rely on the error handling in performTokenRefresh
          // Don't handle token expiration here - let performTokenRefresh handle it
          // This prevents duplicate logout attempts
          
          const err: any = new Error('Refresh token expired');
          err.status = 401;
          err.statusText = 'Unauthorized';
          throw err;
        }
      }

      // Handle 204 No Content (common for DELETE requests) - no body to read
      if (response.status === 204 || response.status === 205) {
        return {
          data: null as unknown as T,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      }

      let data: T;
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      // Check if there's actually content to read
      // Some responses may have Content-Type but no body (e.g., 204 with headers)
      const hasBody = contentLength !== '0' && response.body !== null;
      
      if (hasBody && contentType && contentType.includes('application/json')) {
        try {
          const text = await response.text();
          data = text ? JSON.parse(text) : (null as unknown as T);
        } catch (e) {
          // If JSON parsing fails, return empty data
          data = null as unknown as T;
        }
      } else if (hasBody) {
        try {
          const text = await response.text();
          data = (text || null) as unknown as T;
        } catch (e) {
          data = null as unknown as T;
        }
      } else {
        // No body to read
        data = null as unknown as T;
      }

        if (!response.ok) {
          // Use error handler for unified error handling
          const appError = errorHandler.handleHttpError(response.status, data, { url, method });
          
          // Log error
          logger.apiError(method, url, appError);

          // Build rich error object with server response data
          // Use appError.userMessage directly for better error messages
          const err: any = new Error(appError.userMessage || this.getArabicErrorMessage(appError, response.status));
          err.status = response.status;
          err.statusText = response.statusText;
          err.data = data;
          err.url = url;
          err.appError = appError;
          throw err;
        }

        // Log successful response
        logger.response(method, url, response.status, data);

        const apiResponse: ApiResponse<T> = {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          success: true,
        };

        // Apply response interceptors
        return await this.applyResponseInterceptors(apiResponse);
      } catch (error: any) {
        // Apply error interceptors
        const processedError = await this.applyErrorInterceptors(error);

        // Handle AbortError specifically
        if (processedError instanceof Error && processedError.name === 'AbortError') {
          const networkError = errorHandler.handleNetworkError(processedError, { url, method });
          const abortError = new Error(networkError.userMessage);
          abortError.name = 'AbortError';
          throw abortError;
        }

        // Handle network errors
        if (processedError instanceof TypeError || processedError.name === 'TypeError') {
          const networkError = errorHandler.handleNetworkError(processedError, { url, method });
          logger.apiError(method, url, networkError);
          const err = new Error(networkError.userMessage);
          err.name = 'NetworkError';
          throw err;
        }
        
        throw processedError;
      }
    };

    // Execute with retry logic
    return this.retryRequest(makeRequest);
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: data });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body: data });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Refresh token method (public API for authService)
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.config.baseURL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.access) {
        // Backend returns both access and refresh tokens
        const result = {
          data: {
            access: data.access,
            refresh: data.refresh || refreshToken // Use new refresh if provided, otherwise keep old one
          },
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          success: true
        } as any;
        
        return result;
      } else {
        return {
          data: data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          success: false,
          error: data.detail || data.message || 'فشل تحديث الرمز المميز'
        } as any;
      }
    } catch (error: any) {
      return {
        data: null,
        status: 500,
        statusText: 'Internal Error',
        headers: new Headers(),
        success: false,
        error: error?.message || 'حدث خطأ أثناء تحديث الرمز المميز'
      } as any;
    }
  }

  /**
   * Logout method (blacklist refresh token)
   */
  async logout(refreshToken: string): Promise<ApiResponse<any>> {
    try {
      // Try to call logout endpoint if it exists
      const response = await fetch(`${this.config.baseURL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        return {
          data: await response.json().catch(() => ({})),
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          success: true
        } as any;
      } else {
        return {
          data: await response.json().catch(() => ({})),
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          success: false
        } as any;
      }
    } catch (error) {
      // If logout endpoint doesn't exist or fails, return success anyway
      // The tokens will be cleared locally
      return {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        success: true
      } as any;
    }
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(_endpoint?: string) {
    return { remaining: Infinity, resetTime: null }; // Rate limiting disabled
  }

  /**
   * Check if request can be made without actually making it
   */
  canMakeRequest(_endpoint?: string): boolean {
    return true; // Always allow requests
  }

  /**
   * Wait for available request slot
   */
  async waitForAvailableSlot(_endpoint?: string, _maxWaitMs: number = 5000): Promise<boolean> {
    return true; // Always available
  }

  /**
   * Clear rate limiter data (useful for testing or logout)
   */
  clearRateLimiter(): void {
    // Rate limiting disabled - nothing to clear
  }

  /**
   * Teacher-specific API methods
   */
  async getTeacherCourses() {
    return this.get('/live-courses/courses/');
  }

  async getLiveEducationCourses() {
    return this.get('/live-courses/courses/');
  }

  async getTeacherProfile() {
    return this.get('/teachers/profiles/');
  }

  async getTeacherStats() {
    return this.get('/teachers/stats/dashboard/');
  }

  async getProfileImageUrls() {
    return this.get('/auth/profile/image/urls/');
  }

  /**
   * Supervisor-specific API methods
   */
  async getPendingCourses(params?: { 
    approval_status?: string; 
    course_type?: string; 
    search?: string; 
  }) {
    const queryParams = new URLSearchParams({
      approval_status: 'pending',
      ...params
    });
    return this.get(`/live-education/courses/pending-for-supervisor/?${queryParams}`);
  }

  async approveCourse(courseId: string, approvalNotes?: string) {
    return this.post(`/live-education/courses/${courseId}/approve/`, {
      approval_notes: approvalNotes
    });
  }

  async rejectCourse(courseId: string, rejectionReason: string) {
    return this.post(`/live-education/courses/${courseId}/reject/`, {
      rejection_reason: rejectionReason
    });
  }

  async getAllCourses(params?: {
    approval_status?: string;
    course_type?: string;
    is_published?: boolean;
    search?: string;
    page?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.get(`/live-education/courses/?${queryParams}`);
  }

  /**
   * Course Enrollment API methods
   */
  
  // Get all enrollments with filters
  async getEnrollments(params?: {
    course?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'completed';
    ordering?: 'approved_at' | '-approved_at' | 'enrolled_at' | '-enrolled_at';
    page?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.get(`/live-education/enrollments/?${queryParams}`);
  }

  // Get pending enrollments
  async getPendingEnrollments() {
    return this.get('/live-education/enrollments/pending/');
  }

  // Get specific enrollment details
  async getEnrollment(id: string) {
    return this.get(`/live-education/enrollments/${id}/`);
  }

  // Create new enrollment (enroll in course)
  async enrollInCourse(courseId: string, notes?: string) {
    return this.post('/live-education/enrollments/', {
      course: courseId,
      notes: notes
    });
  }

  // Update enrollment (for supervisors/admins)
  async updateEnrollment(id: string, data: {
    status?: 'pending' | 'approved' | 'rejected' | 'completed';
    notes?: string;
    general_supervisor_approved?: boolean;
  }) {
    return this.patch(`/live-education/enrollments/${id}/`, data);
  }

  // Cancel enrollment (for students)
  async cancelEnrollment(id: string) {
    return this.delete(`/live-education/enrollments/${id}/`);
  }

  // Approve enrollment (for supervisors)
  async approveEnrollment(id: string, notes?: string) {
    return this.updateEnrollment(id, {
      status: 'approved',
      general_supervisor_approved: true,
      ...(notes && { notes })
    });
  }

  // Reject enrollment (for supervisors)
  async rejectEnrollment(id: string, notes?: string) {
    return this.updateEnrollment(id, {
      status: 'rejected',
      general_supervisor_approved: false,
      ...(notes && { notes })
    });
  }

  // Get enrollments for a specific course
  async getCourseEnrollments(courseId: string, params?: {
    status?: 'pending' | 'approved' | 'rejected' | 'completed';
    ordering?: 'approved_at' | '-approved_at' | 'enrolled_at' | '-enrolled_at';
    page?: number;
  }) {
    return this.getEnrollments({
      ...params,
      course: courseId
    });
  }

  // Get student's own enrollments
  async getMyEnrollments(params?: {
    status?: 'pending' | 'approved' | 'rejected' | 'completed';
    ordering?: 'approved_at' | '-approved_at' | 'enrolled_at' | '-enrolled_at';
    page?: number;
  }) {
    return this.getEnrollments(params);
  }

  /**
   * Login method
   */
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<any>> {
    return this.post('/auth/login/', credentials);
  }

  /**
   * Register method
   */
  async register(userData: any): Promise<ApiResponse<any>> {
    return this.post('/auth/register/', userData);
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(email: string): Promise<ApiResponse<any>> {
    return this.post('/auth/email-verification/send/', { email });
  }
}

/**
 * Create API client instance
 */
export const apiClient = new ApiClient({
  baseURL: getBaseUrl(),
  timeout: 30000, // Increased to 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Health check endpoint for testing
 */
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  try {
    const response = await apiClient.get('/health/');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error('Health check failed');
  }
};

/**
 * Utility function to create API URLs
 */
export const createApiUrl = (endpoint: string): string => {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Export default instance
 */
export default apiClient;
