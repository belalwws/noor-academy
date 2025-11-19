import { getAuthToken } from './auth';
import { Endpoints, getApiUrl, getBaseUrl, Config } from './config';
import { apiClient as newApiClient } from './apiClient';
import { logger } from './utils/logger';

/**
 * 🔄 Legacy API Service - Backward Compatibility Wrapper
 *
 * ⚠️ DEPRECATED: This file is a wrapper around the unified apiClient.
 * For new code, prefer using `apiClient` directly from './apiClient'
 *
 * Migration path:
 * - Old: apiService.get('/endpoint')
 * - New: apiClient.get('/endpoint')
 *
 * This wrapper maintains backward compatibility by:
 * 1. Converting apiClient responses to legacy ApiResponse format
 * 2. Preserving all existing method signatures
 * 3. Logging deprecation warnings in development
 */

// Initialize config and get API base URL
let API_BASE_URL: string;

// Initialize API_BASE_URL using the config
try {
  API_BASE_URL = Config.apiUrl;
} catch (error) {
  // Fallback URL for backward compatibility
  API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'https://lisan-alhekma.onrender.com/api';
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: Record<string, any>;
  status?: number; // Add status property
  // DRF pagination fields
  results?: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

class ApiService {
  /**
   * Convert apiClient response to legacy ApiResponse format
   */
  private convertToLegacyResponse<T>(apiClientResponse: any): ApiResponse<T> {
    if (apiClientResponse.success === false) {
      return {
        success: false,
        error: apiClientResponse.error || 'حدث خطأ غير متوقع',
        status: apiClientResponse.status,
        data: apiClientResponse.data,
      };
    }

    // Handle paginated responses
    if (apiClientResponse.data && typeof apiClientResponse.data === 'object') {
      if (Array.isArray(apiClientResponse.data)) {
        return {
          success: true,
          data: apiClientResponse.data as T,
          results: apiClientResponse.data as T[],
          status: apiClientResponse.status,
        };
      }

      // Check for DRF pagination format
      if ('results' in apiClientResponse.data) {
        return {
          success: true,
          data: apiClientResponse.data as T,
          results: (apiClientResponse.data as any).results,
          count: (apiClientResponse.data as any).count,
          next: (apiClientResponse.data as any).next,
          previous: (apiClientResponse.data as any).previous,
          status: apiClientResponse.status,
        };
      }
    }

    return {
      success: true,
      data: apiClientResponse.data as T,
      status: apiClientResponse.status,
    };
  }

  /**
   * Log deprecation warning in development
   */
  private logDeprecationWarning(method: string): void {
    if (process.env.NODE_ENV === 'development') {
      logger.warn(
        `⚠️ DEPRECATED: apiService.${method}() is deprecated. ` +
        `Use apiClient.${method}() instead. See client/lib/api.ts for migration guide.`
      );
    }
  }

  private getAuthHeaders(): HeadersInit {
    // Use new auth utility to get token from cookies or localStorage
    const token = getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Include credentials for cookie-based auth
    return headers;
  }

  private getAuthHeadersForUpload(): HeadersInit {
    // For file upload, don't include Content-Type (let browser set it)
    const token = getAuthToken();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      // Clone the response to prevent "body stream already read" error
      const responseClone = response.clone();
      
      const data = await responseClone.json();
      
      if (response.ok) {
        return {
          success: true,
          data,
          message: data.message
        };
      } else {
        // Handle authentication errors
        if (response.status === 401) {
          // Check if this is a logout or refresh token endpoint - don't try to refresh again
          const isLogoutOrRefresh = response.url.includes('/logout') || 
                                     response.url.includes('/token/refresh');
          
          if (isLogoutOrRefresh) {
            return {
              success: false,
              error: data.detail || data.error || 'Unauthorized',
              errors: data,
              status: response.status
            };
          }
          
          // Try to refresh token
          const { refreshAccessToken } = await import('./auth');
          const refreshSuccess = await refreshAccessToken();
          
          if (refreshSuccess) {
            // Token was refreshed successfully, but we can't retry the original request here
            // The caller should handle retry if needed
            return {
              success: false,
              error: 'TOKEN_REFRESHED', // Special error code to indicate token was refreshed
              errors: data
            };
          } else {
            // Refresh failed, clear auth and redirect
            try {
              const { store, logout } = await import('./store');
          store.dispatch(logout());
            } catch (e) {
              // Failed to dispatch logout via store
            }
          return {
            success: false,
            error: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
            errors: data
          };
          }
        }
        
        // Handle rate limiting
        if (response.status === 429) {
          return {
            success: false,
            error: data.detail || 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.',
            errors: data
          };
        }
        
        // Handle server errors
        if (response.status >= 500) {
          return {
            success: false,
            error: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.',
            errors: data
          };
        }
        

        // Handle 404 for profile images - this is a special case where 404 means "no images found" but data is still valid
        if (response.status === 404 && response.url.includes('/auth/profile/image/urls/') && data && data.data) {
          return {
            success: true,
            data: data.data || { profile_image_url: null, profile_image_thumbnail_url: null },
            message: data.message || 'No profile images found'
          };
        }

        // Handle validation errors specifically
        if (response.status === 400 && data) {

          // Check for duplicate enrollment error
          if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
            const duplicateError = data.non_field_errors.find((error: string) =>
              error.includes('unique set') || error.includes('already enrolled')
            );
            if (duplicateError) {
              return {
                success: false,
                error: 'أنت مسجل في هذه الدورة بالفعل',
                errors: data,
                validationErrors: data,
                isDuplicate: true
              };
            }
          }

          // If it's a validation error with field-specific errors
          if (typeof data === 'object' && !Array.isArray(data)) {
            const errorMessages = [];
            for (const [field, errors] of Object.entries(data)) {
              if (Array.isArray(errors)) {
                errorMessages.push(`${field}: ${errors.join(', ')}`);
              } else {
                errorMessages.push(`${field}: ${errors}`);
              }
            }

            return {
              success: false,
              error: `خطأ في البيانات: ${errorMessages.join('; ')}`,
              errors: data,
              validationErrors: data
            };
          }
        }

        return {
          success: false,
          error: data.message || data.detail || 'حدث خطأ غير متوقع',
          errors: data
        };
      }
    } catch (error) {
      // Try to get response as text for debugging
      try {
        const responseText = await response.text();
        
        // If response is empty or not JSON, handle appropriately
        if (!responseText || responseText.trim() === '') {
          return {
            success: false,
            error: 'الخادم لم يرسل أي بيانات',
            status: response.status
          };
        }
        
        // If response contains HTML (likely an error page)
        if (responseText.includes('<html>') || responseText.includes('<!DOCTYPE')) {
          return {
            success: false,
            error: 'الخادم أرسل صفحة خطأ بدلاً من البيانات المطلوبة',
            status: response.status
          };
        }
        
      } catch (textError) {
        // Error reading response as text
      }
      
      return {
        success: false,
        error: 'خطأ في تحليل الاستجابة من الخادم',
        status: response.status
      };
    }
  }

  // Auth endpoints
  async register(userData: any): Promise<ApiResponse> {
    try {
      // Use the configured API URL
      const registerUrl = `${API_BASE_URL}/auth/register/`;
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(userData),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async login(credentials: { email: string; password: string }): Promise<ApiResponse> {
    try {
      // Use the configured API URL
      const loginUrl = `${API_BASE_URL}/auth/login/`;

      // Get basic headers (no auth needed for login)
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const requestBody = JSON.stringify(credentials);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers,
        credentials: 'include', // Include cookies
        body: requestBody,
      });

      return this.handleResponse(response);
    } catch (error) {
      // Handle connection errors more gracefully
      if (error instanceof Error) {
        // Check if it's a connection refused error
        if (error.message.includes('ERR_CONNECTION_REFUSED') || 
            error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError')) {
      return {
        success: false,
            error: 'Backend server is not available. Please check if the server is running.',
          };
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async logout(refreshToken?: string): Promise<ApiResponse> {
    try {
      // Use the configured API URL
      const logoutUrl = `${API_BASE_URL}/auth/logout/`;
      
      // Get refresh token from localStorage if not provided
      const token = refreshToken || localStorage.getItem('refresh_token') || '';
      
      if (!token) {
        // Still try to logout on client side
        return {
          success: true,
          data: { message: 'Logged out locally (no refresh token to blacklist)' }
        };
      }
      
      const authHeaders = this.getAuthHeaders();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...authHeaders,
      };

      const body = JSON.stringify({ refresh: token });
      
      const response = await fetch(logoutUrl, {
        method: 'POST',
        headers,
        body,
        credentials: 'include', // Include cookies
      });

      const result = await this.handleResponse(response);
      
      return result;
    } catch (error) {
      // Don't block logout on API error - still return success
      return {
        success: true,
        data: { message: 'Logged out locally (API error)' },
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // User endpoints
  async getUserProfile(): Promise<ApiResponse> {
    const url = getApiUrl(Endpoints.USER_PROFILE);
    const options: RequestInit = {
        method: 'GET',
        headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  async updateUserProfile(profileData: any): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.USER_PROFILE), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async changePassword(passwordData: { old_password: string; new_password: string }): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.CHANGE_PASSWORD), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(passwordData),
        credentials: 'include', // Include cookies
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // 🔒 SECURE: JWT Token refresh method (server reads HttpOnly cookie)
  async refreshTokenSecure(csrfToken?: string | null): Promise<ApiResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // �� NO CSRF for now to avoid CORS issues
      // if (csrfToken) {
      //   headers['X-CSRF-Token'] = csrfToken;
      // }

      const response = await fetch(getApiUrl(Endpoints.TOKEN_REFRESH), {
        method: 'POST',
        headers,
        credentials: 'include', // 🔒 IMPORTANT: Include HttpOnly cookies
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'حدث خطأ في تحديث الجلسة'
      };
    }
  }

  // 🔄 TEMPORARY: Refresh token method with token in body (fallback until backend implements HttpOnly cookies)
  async refreshTokenWithBody(refreshToken: string, csrfToken?: string | null): Promise<ApiResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // 🔒 NO CSRF for now to avoid CORS issues
      // if (csrfToken) {
      //   headers['X-CSRF-Token'] = csrfToken;
      // }

      const response = await fetch(getApiUrl(Endpoints.TOKEN_REFRESH), {
        method: 'POST',
        headers,
        body: JSON.stringify({ refresh: refreshToken }),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'حدث خطأ في تحديث الجلسة'
      };
    }
  }

  // JWT Token refresh method
  async refreshToken(refreshToken: string): Promise<ApiResponse> {
    const url = getApiUrl(Endpoints.TOKEN_REFRESH);
    
    const options: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken
        }),
        credentials: 'include',
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data,
          status: response.status
        };
      } else {
        // Use Arabic error message if available
        const errorMessage = data.error_ar || data.detail || data.error || 'Token refresh failed';
        const requiresLogin = data.requires_login || data.code === 'token_expired' || response.status === 401;
        
        return {
          success: false,
          error: errorMessage,
          status: response.status,
          requiresLogin: requiresLogin
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error during token refresh',
        status: 0
      };
    }
  }

  // Token endpoint (alternative login using username instead of email)
  async getToken(credentials: { username: string; password: string }): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.TOKEN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Email verification endpoints
  async sendEmailVerification(email: string): Promise<ApiResponse> {
    try {
      // Use the configured API URL
      const verifyUrl = `${API_BASE_URL}/auth/email-verification/send/`;
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async confirmEmailVerification(uidb64: string, token: string): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.CONFIRM_EMAIL_VERIFICATION}/${uidb64}/${token}/`), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      const result = await this.handleResponse(response);
      
      // If successful, the API returns fresh JWT tokens
      if (result.success && result.data) {
        const data = result.data as any;
        
        // The API might return tokens in different formats
        const tokens = data.tokens || {
          access: data.access || data.access_token,
          refresh: data.refresh || data.refresh_token
        };
        
        if (tokens.access) {
          // Update the result to include properly formatted tokens
          result.data = {
            ...data,
            tokens: tokens,
            message: data.message || 'تم تأكيد البريد الإلكتروني بنجاح'
          };
        }
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Helper method to resend verification email for current user
  async resendEmailVerification(): Promise<ApiResponse> {
    try {
      // Get current user's email from auth data
      const { getAuthData } = await import('./auth');
      const authData = getAuthData();
      
      if (!authData?.user?.email) {
        return {
          success: false,
          error: 'لا يمكن العثور على البريد الإلكتروني للمستخدم الحالي'
        };
      }

      return this.sendEmailVerification(authData.user.email);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
  
  /*
  Usage Example:
  
  const apiService = new ApiService();
  
  // When you get a 401 error, use refresh token:
  const refreshToken = localStorage.getItem('refresh_token');
  if (refreshToken) {
    const result = await apiService.refreshToken(refreshToken);
    
    if (result.success && result.data) {
      // Save new tokens
      const { access, refresh } = result.data;
      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Update auth data
      const authData = getAuthData();
      if (authData) {
        saveAuthData({
          ...authData,
          token: access,
          refreshToken: refresh
        });
      }
      
      // Retry your original request with new token
    } else {
      // Refresh failed, redirect to login
      clearAuthData();
      window.location.href = '/login';
    }
  }
  */

  // 📸 Upload profile image
  async uploadProfileImage(file: File): Promise<ApiResponse> {
    try {
      // Check if we have auth data
      const { getAccessToken } = await import('./auth');
      const token = getAccessToken();
      
      if (!token) {
        return {
          success: false,
          error: 'لم يتم العثور على رمز الوصول'
        };
      }
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', file); // Try 'image' instead of 'profile_image'
      
      // Use makeSecureRequest instead of makeAuthenticatedRequest
      const result = await this.makeSecureRequest(
        `${API_BASE_URL}/auth/profile/image/upload/`,
        {
        method: 'POST',
        body: formData,
        }
      );
      
      return result;
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      };
    }
  }

  private async uploadWithFormData(file: File, token: string): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('image', file);  // Use 'image' as shown in Swagger
    
    const headers = this.getAuthHeadersForUpload();
    
    // Try the main endpoint first (from config)
    const mainEndpoint = getApiUrl(Endpoints.UPLOAD_IMAGE);
    
    let response;
    let lastError;
    
    try {
      response = await fetch(mainEndpoint, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: formData,
      });
      
      // If main endpoint worked, use it
      if (response.ok || response.status !== 500) {
        // Use main endpoint response
      } else {
        // Try alternative endpoints only if main failed
        const alternativeEndpoints = [
          getApiUrl('/auth/profile/image/upload/'),
          getApiUrl('/auth/profile/image/upload/'),
          getApiUrl('/upload-image/')
        ];
        
        for (const endpoint of alternativeEndpoints) {
          try {
            response = await fetch(endpoint, {
              method: 'POST',
              headers: headers,
              credentials: 'include',
              body: formData,
            });
            
            // If we get a non-500 error, break and use this response
            if (response.status !== 500) {
              break;
            }
            
          } catch (fetchError) {
            lastError = fetchError;
            continue;
          }
        }
      }
      
    } catch (fetchError) {
      lastError = fetchError;
      
      // Return error immediately for main endpoint failure
      throw fetchError;
    }
    
    // If all endpoints failed, throw the last error
    if (!response || response.status === 500) {
      if (lastError) throw lastError;
      throw new Error('All upload endpoints returned 500 error');
    }
    
    const result = await this.handleResponse(response);
    
    return result;
  }

  private async uploadWithBase64(file: File, token: string): Promise<ApiResponse> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const base64Content = base64Data.split(',')[1]; // Remove data:image/... prefix
          
          const payload = {
            image_data: base64Content,
            filename: file.name,
            content_type: file.type
          };
          
          const endpoints = [
            getApiUrl('/auth/profile/image/upload/'),
            getApiUrl(Endpoints.UPLOAD_IMAGE),
            getApiUrl('/auth/profile/image/upload/')
          ];
          
          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(payload),
              });
              
              if (response.status !== 500) {
                const result = await this.handleResponse(response);
                resolve(result);
                return;
              }
              
            } catch (error) {
              continue;
            }
          }
          
          // If all failed
          resolve({
            success: false,
            error: 'فشل في رفع الصورة بجميع الطرق المتاحة'
          });
          
        } catch (error) {
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
          });
        }
      };
      
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'خطأ في قراءة الملف',
        });
      };
      
      reader.readAsDataURL(file);
    });
  }

  async deleteProfileImage(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/image/delete/`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Teacher endpoints
  async registerTeacher(teacherData: any): Promise<ApiResponse> {
    try {
      const response = await apiClient.post(Endpoints.TEACHER_REGISTER, teacherData);

      return {
        success: true,
        data: response.data,
        message: 'تم التسجيل بنجاح'
      };
    } catch (error: any) {

      if (error.response) {
        // Server responded with error status
        let errorMessage = error.response.data?.message || error.response.data?.detail || 'خطأ في التسجيل';
        
        // Handle specific database constraint errors
        if (errorMessage.includes('duplicate key value violates unique constraint') && 
            errorMessage.includes('teachers_teacherprofile_user_id_key')) {
          errorMessage = 'هذا المستخدم مسجل بالفعل كمدرس. يرجى تسجيل الدخول بدلاً من إنشاء حساب جديد.';
        } else if (errorMessage.includes('duplicate key value violates unique constraint') && 
                   errorMessage.includes('email')) {
          errorMessage = 'هذا البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول.';
        } else if (errorMessage.includes('duplicate key value violates unique constraint') && 
                   errorMessage.includes('username')) {
          errorMessage = 'اسم المستخدم هذا مستخدم بالفعل. يرجى اختيار اسم مستخدم آخر.';
        }
        
        return {
          success: false,
          error: errorMessage,
          errors: error.response.data?.errors || error.response.data,
          status: error.response.status
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          error: 'خطأ في الاتصال بالخادم'
        };
      } else {
        // Other error
        return {
          success: false,
          error: error.message || 'خطأ غير متوقع'
        };
      }
    }
  }

  async getTeacherStats(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.TEACHER_STATS), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getTeacherUpcomingSessions(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.TEACHER_SESSIONS), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async uploadTeacherProfileImage(file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Get token from localStorage instead of Redux
      const token = getAuthToken();
      
      if (!token) {
        return {
          success: false,
          error: 'يجب تسجيل الدخول أولاً لرفع الصورة'
        };
      }
      
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(getApiUrl(Endpoints.TEACHER_UPLOAD_IMAGE), {
        method: 'POST',
        headers,
        body: formData,
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async deleteTeacherProfileImage(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.TEACHER_DELETE_IMAGE), {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getTeacherProfile(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.TEACHER_PROFILE), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async updateTeacherProfile(profileData: any): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.TEACHER_PROFILE), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Password reset endpoints (using email verification system)
  async sendPasswordResetEmail(email: string): Promise<ApiResponse> {
    try {
      // Use the configured API URL
      const resetUrl = `${API_BASE_URL}/auth/email-verification/send/`;
      const response = await fetch(resetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email,
          reset_password: true // Flag to indicate this is for password reset
        }),
      });

      const result = await this.handleResponse(response);
      
      if (result.success) {
        const data = result.data as any;
        result.data = {
          ...data,
          message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async resetPasswordWithToken(uidb64: string, token: string, newPassword: string): Promise<ApiResponse> {
    try {
      // First verify the token is valid
      const verificationResult = await this.confirmEmailVerification(uidb64, token);
      
      if (!verificationResult.success) {
        return {
          success: false,
          error: 'رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية'
        };
      }

      // If verification successful, reset password
      const response = await fetch(getApiUrl('/auth/reset-password/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          uidb64,
          token,
          new_password: newPassword
        }),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Alternative method using email directly (if backend supports it)
  async resetPasswordByEmail(email: string, newPassword: string, verificationCode?: string): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl('/auth/reset-password-by-email/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          new_password: newPassword,
          verification_code: verificationCode
        }),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Enhanced password reset with multiple options
  async requestPasswordReset(email: string, language: 'ar' | 'en' = 'ar'): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.FORGOT_PASSWORD), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email,
          language,
          source: 'web_app',
          timestamp: new Date().toISOString()
        }),
      });

      const result = await this.handleResponse(response);
      
      if (result.success) {
        const data = result.data as any;
        result.data = {
          ...data,
          message: language === 'ar' 
            ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
            : 'Password reset link has been sent to your email address',
          email_sent: true,
          expires_in: '30 minutes'
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Check if email exists before sending reset link
  async checkEmailExists(email: string): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl('/auth/check-email/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Send different types of email verification
  async sendCustomEmailVerification(
    email: string, 
    type: 'registration' | 'password_reset' | 'email_change' | 'security_alert' = 'registration',
    additionalData?: any
  ): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.SEND_EMAIL_VERIFICATION), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email,
          verification_type: type,
          language: 'ar',
          additional_data: additionalData,
          source: 'web_app'
        }),
      });

      const result = await this.handleResponse(response);
      
      if (result.success) {
        const messages = {
          registration: 'تم إرسال رابط تأكيد التسجيل إلى بريدك الإلكتروني',
          password_reset: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
          email_change: 'تم إرسال رابط تأكيد البريد الإلكتروني الجديد',
          security_alert: 'تم إرسال تنبيه أمني إلى بريدك الإلكتروني'
        };
        
        const data = result.data as any;
        result.data = {
          ...data,
          message: messages[type],
          verification_type: type
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Verify user identity for sensitive operations
  async verifyUserForSensitiveOperation(operation: 'password_change' | 'email_change' | 'account_deletion'): Promise<ApiResponse> {
    try {
      // Get current user's email from auth data
      const { getAuthData } = await import('./auth');
      const authData = getAuthData();
      
      if (!authData?.user?.email) {
        return {
          success: false,
          error: 'لا يمكن العثور على بيانات المستخدم'
        };
      }

      return this.sendCustomEmailVerification(
        authData.user.email, 
        'security_alert',
        { operation, timestamp: new Date().toISOString() }
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Helper method to make authenticated requests with automatic token refresh
  private async makeAuthenticatedRequest<T>(
    url: string,
    options: RequestInit,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const maxRetries = 1; // Only retry once for token refresh
    
    try {
      const response = await fetch(url, options);
      const result = await this.handleResponse<T>(response);
      
      // If we get TOKEN_REFRESHED error, retry the request once
      if (!result.success && result.error === 'TOKEN_REFRESHED' && retryCount < maxRetries) {
        // Update headers with new token
        const updatedOptions = {
          ...options,
          headers: {
            ...options.headers,
            ...this.getAuthHeaders()
          }
        };
        
        return this.makeAuthenticatedRequest<T>(url, updatedOptions, retryCount + 1);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // 🔒 SECURE: Make authenticated request with in-memory access token
  async makeSecureRequest(url: string, options: RequestInit = {}): Promise<ApiResponse> {
    try {
      // Get access token from secure in-memory storage
      const { authService } = await import('./auth/authService');
      let accessToken = authService.getAccessToken();
      
      // If no access token, try to refresh it
      if (!accessToken) {
        const refreshSuccess = await authService.refreshAccessToken();
        if (refreshSuccess) {
          accessToken = authService.getAccessToken();
        }
      }
      
      if (!accessToken) {
        return {
          success: false,
          error: 'لم يتم العثور على رمز الوصول'
        };
      }

      // Prepare headers with security (NO CSRF for now to avoid CORS)
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
      };

      // Set Content-Type for JSON requests ONLY (not for FormData)
      if (options.body && typeof options.body === 'string') {
        headers['Content-Type'] = 'application/json';
      }
      // For FormData, let the browser set the Content-Type automatically
      // This is important for file uploads

      const response = await fetch(url, { // Changed from getApiUrl(url)
        ...options,
        headers,
        credentials: 'include', // 🔒 Include cookies
      });

      // If token is expired (401), try to refresh and retry once
      if (response.status === 401) {
        try {
          const refreshSuccess = await authService.refreshAccessToken();
          if (refreshSuccess) {
            const newAccessToken = authService.getAccessToken();
            if (newAccessToken) {
              // Retry the request with new token
              const retryHeaders = {
                ...headers,
                'Authorization': `Bearer ${newAccessToken}`
              };

              const retryResponse = await fetch(url, {
                ...options,
                headers: retryHeaders,
                credentials: 'include',
              });

              return this.handleResponse(retryResponse);
            }
          }

          // Don't clear auth data here - let authService handle it

          return {
            success: false,
            error: 'انتهت صلاحية جلسة المستخدم، يرجى تسجيل الدخول مرة أخرى'
          };
        } catch (refreshError) {
          // Don't clear auth data on network errors

          return {
            success: false,
            error: 'حدث خطأ في تحديث الجلسة، يرجى تسجيل الدخول مرة أخرى'
          };
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Supervisor endpoints
  async getSupervisorTeachers(): Promise<ApiResponse> {
    const url = getApiUrl('/supervisor/teachers/');
    const options: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  async getSupervisorCourses(): Promise<ApiResponse> {
    const url = getApiUrl('/supervisor/courses/');
    const options: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  async approveTeacher(teacherId: number): Promise<ApiResponse> {
    const url = getApiUrl(`/supervisor/teachers/${teacherId}/approve/`);
    const options: RequestInit = {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  async rejectTeacher(teacherId: number): Promise<ApiResponse> {
    const url = getApiUrl(`/supervisor/teachers/${teacherId}/reject/`);
    const options: RequestInit = {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  async approveCourse(courseId: number): Promise<ApiResponse> {
    const url = getApiUrl(`/live-education/courses/${courseId}/approve/`);
    const options: RequestInit = {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  async rejectCourse(courseId: number): Promise<ApiResponse> {
    const url = getApiUrl(`/supervisor/courses/${courseId}/reject/`);
    const options: RequestInit = {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  // ==================== SUPERVISOR ENDPOINTS ====================
  // Using new supervisor API service for better organization

  async getSupervisorProfile(): Promise<ApiResponse> {
    // Import supervisor service dynamically to avoid circular dependencies
    const { supervisorApiService } = await import('./api/supervisor');
    return supervisorApiService.getProfile();
  }

  async updateSupervisorProfile(profileData: any): Promise<ApiResponse> {
    // Import supervisor service dynamically to avoid circular dependencies
    const { supervisorApiService } = await import('./api/supervisor');
    return supervisorApiService.updateProfile(profileData);
  }

  // Additional supervisor methods for backward compatibility
  async setupSupervisorPassword(passwordData: any): Promise<ApiResponse> {
    const { supervisorApiService } = await import('./api/supervisor');
    return supervisorApiService.setupPassword(passwordData);
  }

  async validateSupervisorToken(token: string): Promise<ApiResponse> {
    const { supervisorApiService } = await import('./api/supervisor');
    return supervisorApiService.validateToken(token);
  }

  async getSupervisorProfileCompletion(): Promise<ApiResponse> {
    const { supervisorApiService } = await import('./api/supervisor');
    return supervisorApiService.getProfileCompletion();
  }

  async completeSupervisorProfile(completionData: any): Promise<ApiResponse> {
    const { supervisorApiService } = await import('./api/supervisor');
    return supervisorApiService.completeProfile(completionData);
  }

  async getSupervisorProfileStatus(): Promise<ApiResponse> {
    const { supervisorApiService } = await import('./api/supervisor');
    return supervisorApiService.getProfileStatus();
  }

  async checkSupervisorCompletionRequired(): Promise<ApiResponse> {
    const { supervisorApiService } = await import('./api/supervisor');
    return supervisorApiService.checkCompletionRequired();
  }

  // ==================== GENERAL SUPERVISOR MANAGEMENT ====================

  async getGeneralSupervisorStatistics(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.GENERAL_SUPERVISOR_DASHBOARD_STATS), {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async inviteAcademicSupervisor(invitationData: { email: string; specialization: string; areas_of_responsibility: string }): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.GENERAL_SUPERVISOR_INVITE_ACADEMIC), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(invitationData),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getAcademicSupervisors(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.GENERAL_SUPERVISOR_ACADEMIC_SUPERVISORS), {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getPendingInvitations(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.GENERAL_SUPERVISOR_PENDING_INVITATIONS), {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getPendingTeachers(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.GENERAL_SUPERVISOR_PENDING_TEACHERS), {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getApprovedTeachers(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.GENERAL_SUPERVISOR_APPROVED_TEACHERS), {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async approveTeacher(teacherId: number, approvalData: { academic_supervisor_id: number; approval_notes?: string }): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.GENERAL_SUPERVISOR_APPROVE_TEACHER}${teacherId}/`), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(approvalData),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async rejectTeacher(teacherId: number, rejectionData: { rejection_reason: string }): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.GENERAL_SUPERVISOR_REJECT_TEACHER}${teacherId}/`), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(rejectionData),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async revokeInvitation(invitationId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.GENERAL_SUPERVISOR_REVOKE_INVITATION}${invitationId}/`), {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ============================================================================
  // GENERAL SUPERVISOR COURSE MANAGEMENT APIs
  // ============================================================================

  // Get Pending Courses for General Supervisor
  async getPendingCourses(params?: {
    approval_status?: string;
    course_type?: string;
    is_published?: boolean;
    ordering?: string;
    page?: number;
    search?: string;
  }): Promise<ApiResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.approval_status) queryParams.append('approval_status', params.approval_status);
      if (params?.course_type) queryParams.append('course_type', params.course_type);
      if (params?.is_published !== undefined) queryParams.append('is_published', params.is_published.toString());
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.search) queryParams.append('search', params.search);

      const url = getApiUrl(`${Endpoints.GENERAL_SUPERVISOR_PENDING_COURSES}?${queryParams.toString()}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Approve Course
  async approveCourse(courseId: string, data: { approval_notes?: string }): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.GENERAL_SUPERVISOR_APPROVE_COURSE}${courseId}/approve/`), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Reject Course
  async rejectCourse(courseId: string, data: { rejection_reason: string }): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.GENERAL_SUPERVISOR_REJECT_COURSE}${courseId}/reject/`), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ============================================================================
  // NEW COURSE MANAGEMENT APIs
  // ============================================================================

  // Get Courses List
  async getCourses(params?: {
    approval_status?: string;
    course_type?: string;
    is_published?: boolean;
    ordering?: string;
    page?: number;
    search?: string;
    submitted_to_general_supervisor?: boolean;
  }): Promise<ApiResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.approval_status) queryParams.append('approval_status', params.approval_status);
      if (params?.course_type) queryParams.append('course_type', params.course_type);
      if (params?.is_published !== undefined) queryParams.append('is_published', params.is_published.toString());
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.submitted_to_general_supervisor !== undefined) queryParams.append('submitted_to_general_supervisor', params.submitted_to_general_supervisor.toString());

      const url = getApiUrl(`${Endpoints.COURSES_LIST}?${queryParams.toString()}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Create New Course
  async createCourse(courseData: {
    title: string;
    description: string;
    learning_outcomes: string;
    course_type: string;
    subjects: string;
    max_students?: number;
    session_duration?: number;
    trial_session_url?: string;
    lessons?: Array<{
      title: string;
      description: string;
      order: number;
      duration_minutes: number;
    }> | string;
  }): Promise<ApiResponse> {
    try {
      const url = getApiUrl(Endpoints.COURSES_CREATE);

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(courseData),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Get Course Details
  async getCourseDetails(courseId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.COURSES_DETAIL}${courseId}/`), {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Update Course (Full Update)
  async updateCourse(courseId: string, courseData: {
    title?: string;
    description?: string;
    learning_outcomes?: string;
    course_type?: string;
    subjects?: string;
    trial_session_url?: string;
    teacher?: number;
    approval_status?: string;
    approved_by?: number;
    approved_at?: string;
    rejection_reason?: string;
    is_published?: boolean;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.COURSES_UPDATE}${courseId}/`), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(courseData),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Partially Update Course
  async patchCourse(courseId: string, courseData: {
    title?: string;
    description?: string;
    learning_outcomes?: string;
    course_type?: string;
    subjects?: string;
    trial_session_url?: string;
    teacher?: number;
    approval_status?: string;
    approved_by?: number;
    approved_at?: string;
    rejection_reason?: string;
    is_published?: boolean;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.COURSES_UPDATE}${courseId}/`), {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(courseData),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Delete Course
  async deleteCourse(courseId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.COURSES_DELETE}${courseId}/`), {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Publish Course
  async publishCourse(courseId: string, courseData?: any): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.COURSES_PUBLISH}${courseId}/publish/`), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: courseData ? JSON.stringify(courseData) : undefined,
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ============================================================================
  // LESSON MANAGEMENT APIs
  // ============================================================================

  // Get Lessons List
  async getLessons(params?: {
    course?: string;
    ordering?: string;
    page?: number;
  }): Promise<ApiResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.course) queryParams.append('course', params.course);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());

      const url = getApiUrl(`${Endpoints.LESSONS_LIST}?${queryParams.toString()}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Create New Lesson
  async createLesson(lessonData: {
    title: string;
    description: string;
    order: number;
    duration_minutes: number;
    course: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.LESSONS_CREATE), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(lessonData),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Get Lesson Details
  async getLessonDetails(lessonId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.LESSONS_DETAIL}${lessonId}/`), {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Update Lesson (Full Update)
  async updateLesson(lessonId: number, lessonData: {
    title: string;
    description: string;
    order: number;
    duration_minutes: number;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.LESSONS_UPDATE}${lessonId}/`), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(lessonData),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Partially Update Lesson
  async patchLesson(lessonId: number, lessonData: {
    title?: string;
    description?: string;
    order?: number;
    duration_minutes?: number;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.LESSONS_UPDATE}${lessonId}/`), {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(lessonData),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Delete Lesson
  async deleteLesson(lessonId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`${Endpoints.LESSONS_DELETE}${lessonId}/`), {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ==================== DEPRECATED LEGACY METHODS ====================
  
  /**
   * @deprecated Use getGeneralSupervisorStatistics() instead
   * Legacy teacher statistics endpoint - will be removed
   */
  async getTeacherStatistics(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(Endpoints.SUPERVISOR_TEACHER_STATS), {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Student endpoints - Get courses through enrollments
  async getStudentCourses(): Promise<ApiResponse> {
    // Since there's no /student/courses/ endpoint, we get courses through enrollments
    const enrollmentsResponse = await this.getStudentEnrollments();

    if (enrollmentsResponse.success && enrollmentsResponse.data) {
      const enrollments = enrollmentsResponse.data.results || enrollmentsResponse.data;

      // Extract course information from enrollments
      const courses = enrollments.map((enrollment: any) => ({
        id: enrollment.course,
        title: enrollment.course_title || `Course ${enrollment.course}`,
        enrollment_id: enrollment.id,
        progress_percentage: enrollment.progress_percentage || 0,
        payment_status: enrollment.payment_status,
        enrolled_at: enrollment.created_at,
        ...enrollment.course_details // If course details are included
      }));

      return {
        success: true,
        data: courses,
        message: 'Student courses retrieved through enrollments'
      };
    }

    return enrollmentsResponse;
  }

  // General courses endpoint for all users
  async getCourses(): Promise<ApiResponse> {
    const url = getApiUrl('/courses/');
    const options: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };
    return this.makeAuthenticatedRequest(url, options);
  }

  async enrollInCourse(courseId: number): Promise<ApiResponse> {
    const url = getApiUrl(`/student/courses/${courseId}/enroll/`);
    const options: RequestInit = {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };
    return this.makeAuthenticatedRequest(url, options);
  }

  // Teacher course and assignment endpoints
  async getTeacherCourses(): Promise<ApiResponse> {
    // Get teacher's courses using the correct courses endpoint (filtered by role)
    const url = getApiUrl('/live-education/courses/');
    const options: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  private getCurrentUserId(): number | null {
    try {
      const tokens = localStorage.getItem('tokens');
      if (!tokens) return null;

      const parsedTokens = JSON.parse(tokens);
      const payload = JSON.parse(atob(parsedTokens.access.split('.')[1]));
      return payload.user_id || null;
    } catch (error) {
      return null;
    }
  }

  async getTeacherAssignments(): Promise<ApiResponse> {
    // Return empty array since assignments endpoint doesn't exist yet
    return Promise.resolve({ success: true, data: [], results: [] });
  }

  async getTeacherStats(): Promise<ApiResponse> {
    const url = getApiUrl('/teachers/stats/dashboard/');
    const options: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  async getTeacherProfile(): Promise<ApiResponse> {
    const url = getApiUrl('/teachers/profiles/');
    const options: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  // Profile image management
  async uploadProfileImage(imageFile: File): Promise<ApiResponse> {
    const url = getApiUrl('/auth/profile/image/upload/');
    const formData = new FormData();
    formData.append('image', imageFile);

    const options: RequestInit = {
      method: 'POST',
      headers: this.getAuthHeadersForUpload(),
      credentials: 'include',
      body: formData,
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  async getProfileImageUrls(): Promise<ApiResponse> {
    const url = getApiUrl('/auth/profile/image/urls/');
    const options: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  async getUserProfileImageUrls(userId: number | string): Promise<ApiResponse> {
    const url = getApiUrl(`/auth/users/${userId}/profile/image/urls/`);
    const options: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  async deleteProfileImage(): Promise<ApiResponse> {
    const url = getApiUrl('/auth/profile/image/delete/');
    const options: RequestInit = {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  // Enrollment Management
  async getStudentEnrollments(): Promise<ApiResponse> {
    // First try the student API
    const studentUrl = getApiUrl('/students/enrollments/');
    const studentOptions: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    const studentResponse = await this.makeAuthenticatedRequest(studentUrl, studentOptions);

    // If student API has results, use it
    if (studentResponse.success && studentResponse.data && studentResponse.data.results && studentResponse.data.results.length > 0) {
      return studentResponse;
    }

    // If student API is empty, try admin API as fallback
    const adminUrl = getApiUrl('/enrollments/');
    const adminOptions: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    const adminResponse = await this.makeAuthenticatedRequest(adminUrl, adminOptions);

    if (adminResponse.success && adminResponse.data && adminResponse.data.results) {
      // Filter for current user's enrollments
      const currentUser = await this.getCurrentUser();
      if (currentUser.success && currentUser.data) {
        const userId = currentUser.data.id;
        const userEnrollments = adminResponse.data.results.filter((enrollment: any) =>
          enrollment.student === userId || enrollment.student?.id === userId
        );

        // Return in the same format as student API
        return {
          success: true,
          data: {
            count: userEnrollments.length,
            next: null,
            previous: null,
            results: userEnrollments
          }
        };
      }
    }

    // If both failed, return the original student API response
    return studentResponse;
  }

  // Helper method to get current user
  async getCurrentUser(): Promise<ApiResponse> {
    // Try different possible endpoints for current user
    const possibleEndpoints = [
      '/auth/profile/',
      '/auth/me/',
      '/users/me/',
      '/api/auth/profile/'
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        const url = getApiUrl(endpoint);
        const options: RequestInit = {
          method: 'GET',
          headers: this.getAuthHeaders(),
          credentials: 'include',
        };

        const response = await this.makeAuthenticatedRequest(url, options);

        if (response.success && response.data) {
          return response;
        }
      } catch (error) {
        continue;
      }
    }

    // If all endpoints failed, return a mock response with hardcoded user ID
    // Extract user ID from JWT token if possible
    const token = this.getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.user_id;

        return {
          success: true,
          data: { id: parseInt(userId) }
        };
      } catch (error) {
        // Failed to extract user ID from token
      }
    }

    return {
      success: false,
      error: 'Could not get current user'
    };
  }

  // Add method to get current user profile for debugging
  async getCurrentUserProfile(): Promise<ApiResponse> {
    const url = getApiUrl('/auth/profile/');
    const options: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    const response = await this.makeAuthenticatedRequest(url, options);

    return response;
  }

  // Add method to get all enrollments (admin view) for debugging
  async getAllEnrollments(studentId?: number): Promise<ApiResponse> {
    let url = getApiUrl('/enrollments/');
    if (studentId) {
      url += `?student=${studentId}`;
    }

    const options: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    const response = await this.makeAuthenticatedRequest(url, options);

    return response;
  }

  async createEnrollment(enrollmentData: any): Promise<ApiResponse> {
    const url = getApiUrl('/enrollments/');
    const options: RequestInit = {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(enrollmentData),
    };

    const response = await this.makeAuthenticatedRequest(url, options);

    return response;
  }

  async getEnrollmentDetails(enrollmentId: string): Promise<ApiResponse> {
    const url = getApiUrl(`/students/enrollments/${enrollmentId}/`);
    const options: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  // Booking Management
  async getStudentBookings(): Promise<ApiResponse> {
    // Use the correct API endpoint from the documentation
    const url = getApiUrl('/enrollments/bookings/');
    const options: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  // Email Verification Management
  async sendEmailVerification(): Promise<ApiResponse> {
    const url = getApiUrl('/auth/email-verification/send/');
    const options: RequestInit = {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  async confirmEmailVerification(uidb64: string, token: string): Promise<ApiResponse> {
    const url = getApiUrl(`/auth/email-verification/confirm/${uidb64}/${token}/`);
    const options: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  async createBooking(bookingData: any): Promise<ApiResponse> {
    const url = getApiUrl('/enrollments/book-session/');
    const options: RequestInit = {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(bookingData),
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  async getTeacherStudents(): Promise<ApiResponse> {
    const url = getApiUrl('/teachers/students/');
    const options: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  // Removed old createCourse method - using new API endpoint in course management section

  // Live Education API - Create Course
  async createLiveEducationCourse(courseData: any): Promise<ApiResponse> {
    const url = getApiUrl('/live-education/courses/');
    const options: RequestInit = {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(courseData),
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  // Live Education API - Get Courses
  async getLiveEducationCourses(): Promise<ApiResponse> {
    const url = getApiUrl('/live-education/courses/');
    const options: RequestInit = {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      credentials: 'include',
      cache: 'no-store'
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  async createAssignment(assignmentData: any): Promise<ApiResponse> {
    const url = getApiUrl('/teacher/assignments/');
    const options: RequestInit = {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(assignmentData),
    };

    return this.makeAuthenticatedRequest(url, options);
  }

  // Course enrollment methods
  async enrollInCourseWithPayment(enrollmentData: { course_id: number; payment_method?: string }): Promise<ApiResponse> {
    const url = getApiUrl('/student/enroll/');
    return this.makeAuthenticatedRequest(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(enrollmentData)
    });
  }

  async getCourseDetails(courseId: number): Promise<ApiResponse> {
    const url = getApiUrl(`/courses/${courseId}/`);
    return this.makeAuthenticatedRequest(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
  }

  async getCourseProgress(courseId: number): Promise<ApiResponse> {
    const url = getApiUrl(`/student/courses/${courseId}/progress/`);
    return this.makeAuthenticatedRequest(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
  }

  // Assignment methods - Placeholder since no endpoint available
  async getStudentAssignments(): Promise<ApiResponse> {
    // Return empty assignments for now
    return {
      success: true,
      data: [],
      message: 'No assignments endpoint available'
    };
  }

  async submitAssignment(assignmentId: number, submissionData: FormData): Promise<ApiResponse> {
    const url = getApiUrl(`/student/assignments/${assignmentId}/submit/`);
    return this.makeAuthenticatedRequest(url, {
      method: 'POST',
      headers: this.getAuthHeadersForUpload(), // Use proper headers for file upload
      credentials: 'include',
      body: submissionData
    });
  }

  async gradeAssignment(assignmentId: number, gradeData: { student_id: number; grade: number; feedback?: string }): Promise<ApiResponse> {
    const url = getApiUrl(`/teacher/assignments/${assignmentId}/grade/`);
    return this.makeAuthenticatedRequest(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(gradeData)
    });
  }

  // Removed old updateCourse and deleteCourse methods - using new API endpoints in course management section

  async getCourseStudents(courseId: number): Promise<ApiResponse> {
    const url = getApiUrl(`/courses/${courseId}/students/`);
    return this.makeAuthenticatedRequest(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
  }

  // Notification endpoints - Updated to use new APIs
  async getNotifications(unreadOnly: boolean = false): Promise<ApiResponse> {
    const url = new URL(getApiUrl(Endpoints.NOTIFICATIONS));
    if (unreadOnly) {
      url.searchParams.append('unread_only', 'true');
    }
    
    return this.makeAuthenticatedRequest(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    const url = getApiUrl(Endpoints.NOTIFICATIONS) + 'mark-as-read/';
    return this.makeAuthenticatedRequest(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ notification_ids: [notificationId] }),
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    const url = getApiUrl(Endpoints.NOTIFICATIONS) + 'mark-all-as-read/';
    return this.makeAuthenticatedRequest(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
  }

  async getNotificationPreferences(): Promise<ApiResponse> {
    const url = getApiUrl(Endpoints.NOTIFICATION_PREFERENCES) + 'me/';
    return this.makeAuthenticatedRequest(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
  }

  async updateNotificationPreferences(preferences: any): Promise<ApiResponse> {
    const url = getApiUrl(Endpoints.NOTIFICATION_PREFERENCES) + 'me/';
    return this.makeAuthenticatedRequest(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(preferences),
    });
  }

  // New notification methods for additional functionality
  async getNotificationById(notificationId: string): Promise<ApiResponse> {
    const url = getApiUrl(Endpoints.NOTIFICATIONS) + `${notificationId}/`;
    return this.makeAuthenticatedRequest(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
  }

  async getNotificationTemplates(): Promise<ApiResponse> {
    const url = getApiUrl(Endpoints.NOTIFICATIONS) + 'templates/';
    return this.makeAuthenticatedRequest(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
  }

  async getNotificationTemplateById(templateId: number): Promise<ApiResponse> {
    const url = getApiUrl(Endpoints.NOTIFICATIONS) + `templates/${templateId}/`;
    return this.makeAuthenticatedRequest(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
  }

  async updateNotificationPreferencesPartial(preferences: any): Promise<ApiResponse> {
    const url = getApiUrl(Endpoints.NOTIFICATION_PREFERENCES) + 'me/';
    return this.makeAuthenticatedRequest(url, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(preferences),
    });
  }

  // Generic HTTP methods - Now using unified apiClient
  async get(endpoint: string): Promise<ApiResponse> {
    this.logDeprecationWarning('get');
    try {
      // Remove leading slash if present (apiClient handles it)
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const response = await newApiClient.get(cleanEndpoint);
      return this.convertToLegacyResponse(response);
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || error?.appError?.userMessage || 'حدث خطأ غير متوقع',
        status: error?.status || 500,
        data: error?.data,
      };
    }
  }

  async post(endpoint: string, data?: any): Promise<ApiResponse> {
    this.logDeprecationWarning('post');
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const response = await newApiClient.post(cleanEndpoint, data);
      return this.convertToLegacyResponse(response);
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || error?.appError?.userMessage || 'حدث خطأ غير متوقع',
        status: error?.status || 500,
        data: error?.data,
      };
    }
  }

  async put(endpoint: string, data?: any): Promise<ApiResponse> {
    this.logDeprecationWarning('put');
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const response = await newApiClient.put(cleanEndpoint, data);
      return this.convertToLegacyResponse(response);
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || error?.appError?.userMessage || 'حدث خطأ غير متوقع',
        status: error?.status || 500,
        data: error?.data,
      };
    }
  }

  async patch(endpoint: string, data?: any): Promise<ApiResponse> {
    this.logDeprecationWarning('patch');
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const response = await newApiClient.patch(cleanEndpoint, data);
      return this.convertToLegacyResponse(response);
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || error?.appError?.userMessage || 'حدث خطأ غير متوقع',
        status: error?.status || 500,
        data: error?.data,
      };
    }
  }

  async delete(endpoint: string): Promise<ApiResponse> {
    this.logDeprecationWarning('delete');
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const response = await newApiClient.delete(cleanEndpoint);
      return this.convertToLegacyResponse(response);
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || error?.appError?.userMessage || 'حدث خطأ غير متوقع',
        status: error?.status || 500,
        data: error?.data,
      };
    }
  }

  // Supervisor Profile APIs
  async getSupervisorProfile(): Promise<ApiResponse> {
    const url = getApiUrl('/supervisors/profile/');
    return this.makeAuthenticatedRequest(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
  }

  async updateSupervisorProfile(profileData: any): Promise<ApiResponse> {
    const url = getApiUrl('/supervisors/profile/');
    return this.makeAuthenticatedRequest(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(profileData),
    });
  }

  async patchSupervisorProfile(profileData: any): Promise<ApiResponse> {
    const url = getApiUrl('/supervisors/profile/');
    return this.makeAuthenticatedRequest(url, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(profileData),
    });
  }

  async getSupervisorProfileCompletion(): Promise<ApiResponse> {
    const url = getApiUrl('/supervisors/profile/complete/');
    return this.makeAuthenticatedRequest(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
  }

  async completeSupervisorProfile(completionData: any): Promise<ApiResponse> {
    const url = getApiUrl('/supervisors/profile/complete/');
    return this.makeAuthenticatedRequest(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(completionData),
    });
  }

  async patchSupervisorProfileCompletion(completionData: any): Promise<ApiResponse> {
    const url = getApiUrl('/supervisors/profile/complete/');
    return this.makeAuthenticatedRequest(url, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(completionData),
    });
  }

  async getSupervisorProfileStatus(): Promise<ApiResponse> {
    const url = getApiUrl('/supervisors/profile/status/');
    return this.makeAuthenticatedRequest(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
  }

  async checkSupervisorProfileCompletion(): Promise<ApiResponse> {
    const url = getApiUrl('/supervisors/check-completion/');
    return this.makeAuthenticatedRequest(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
  }
}

export const apiService = new ApiService();
export const apiClient = apiService;

// Default export for backward compatibility
export default apiService;
