/**
 * API Helper Functions
 * Utility functions for API calls and data processing
 */

import { getAuthToken } from '@/lib/auth';
import { getBaseUrl } from '@/lib/config';

// ================== AUTH HELPERS ==================

/**
 * Get authentication headers for API calls
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Get API URL from config (unified)
 * ⚠️ DEPRECATED: Use getBaseUrl() from '@/lib/config' directly
 * This function is kept for backward compatibility
 */
export function getApiUrl(): string {
  return getBaseUrl();
}

/**
 * Make authenticated fetch request
 * ⚠️ DEPRECATED: Use apiClient from '@/lib/apiClient' instead
 * This function is kept for backward compatibility
 */
export async function makeAuthenticatedRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await getAuthHeaders();
  const apiUrl = getBaseUrl();
  
  return fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: 'include',
  });
}

/**
 * Make fetch request with optional authentication
 * If token is available, it will be included; otherwise request proceeds without auth
 * ⚠️ DEPRECATED: Use apiClient from '@/lib/apiClient' instead
 */
export async function makeOptionalAuthRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiUrl = getBaseUrl();
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add authorization header only if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });
}

/**
 * Make authenticated fetch request with JSON response
 * ⚠️ DEPRECATED: Use apiClient from '@/lib/apiClient' instead
 * This function is kept for backward compatibility
 */
export async function makeAuthenticatedJsonRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await makeAuthenticatedRequest(endpoint, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    // Use logger instead of console.error
    const { logger } = await import('@/lib/utils/logger');
    logger.error(`API Error [${response.status}]:`, errorText);
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }
  
  return response.json();
}

// ================== DATA PROCESSING HELPERS ==================

/**
 * Extract array data from API response
 * Handles both direct arrays and paginated responses
 */
export function extractArrayData<T>(data: any): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data && typeof data === 'object') {
    // Check for paginated response
    if (data.results && Array.isArray(data.results)) {
      return data.results;
    }
    
    // Check for wrapped response
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
  }
  
  return [];
}

/**
 * Extract single item data from API response
 * Handles wrapped responses
 */
export function extractItemData<T>(data: any): T | null {
  if (data && typeof data === 'object') {
    // Check for wrapped response
    if (data.data && typeof data.data === 'object') {
      return data.data;
    }
  }
  
  return data;
}

// ================== ERROR HANDLING HELPERS ==================

/**
 * Parse API error response
 */
export async function parseApiError(response: Response): Promise<string> {
  try {
    const errorData = await response.json();
    
    // Handle validation errors
    if (errorData.errors && typeof errorData.errors === 'object') {
      const errorMessages = Object.values(errorData.errors).flat();
      return errorMessages.join(', ');
    }
    
    // Handle detail error
    if (errorData.detail) {
      return errorData.detail;
    }
    
    // Handle message error
    if (errorData.message) {
      return errorData.message;
    }
    
    // Handle non_field_errors
    if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
      return errorData.non_field_errors.join(', ');
    }
    
    return 'حدث خطأ غير معروف';
  } catch (error) {
    // If JSON parsing fails, return status text
    return response.statusText || `خطأ ${response.status}`;
  }
}

/**
 * Get user-friendly error message based on status code
 */
export function getStatusErrorMessage(status: number): string {
  const statusMessages: Record<number, string> = {
    400: 'خطأ في البيانات المرسلة',
    401: 'انتهت صلاحية جلسة المستخدم. يرجى تسجيل الدخول مرة أخرى',
    403: 'ليس لديك صلاحية للوصول لهذا المورد',
    404: 'المورد المطلوب غير موجود',
    409: 'تعارض في البيانات',
    422: 'خطأ في صيغة البيانات',
    429: 'تم تجاوز الحد المسموح من الطلبات',
    500: 'خطأ داخلي في الخادم',
    502: 'خطأ في الاتصال بالخادم',
    503: 'الخدمة غير متاحة مؤقتاً',
    504: 'انتهت مهلة الاتصال بالخادم'
  };
  
  return statusMessages[status] || `خطأ غير معروف (${status})`;
}

// ================== VALIDATION HELPERS ==================

/**
 * Validate required fields
 */
export function validateRequiredFields(data: Record<string, any>, requiredFields: string[]): string[] {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors.push(`الحقل "${field}" مطلوب`);
    }
  }
  
  return errors;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Saudi Arabia)
 */
export function validateSaudiPhone(phone: string): boolean {
  const phoneRegex = /^(05|5)[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// ================== FORMATTING HELPERS ==================

/**
 * Format date to Arabic locale
 */
export function formatArabicDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Format datetime to Arabic locale
 */
export function formatArabicDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Format time to Arabic locale
 */
export function formatArabicTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Format number to Arabic numerals
 */
export function formatArabicNumber(num: number): string {
  return num.toLocaleString('ar-SA');
}

// ================== URL HELPERS ==================

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Extract ID from URL or return as-is if already an ID
 */
export function extractId(urlOrId: string): string {
  // If it's already just an ID (no slashes), return as-is
  if (!urlOrId.includes('/')) {
    return urlOrId;
  }
  
  // Extract ID from URL
  const parts = urlOrId.split('/');
  return parts[parts.length - 1] || parts[parts.length - 2];
}

// ================== RETRY HELPERS ==================

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// ================== CACHE HELPERS ==================

/**
 * Simple in-memory cache for API responses
 */
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
}

export const apiCache = new SimpleCache();

/**
 * Cached API request
 */
export async function cachedRequest<T>(
  key: string,
  requestFn: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000
): Promise<T> {
  // Check cache first
  const cached = apiCache.get(key);
  if (cached !== null) {
    return cached;
  }
  
  // Make request and cache result
  const result = await requestFn();
  apiCache.set(key, result, ttlMs);
  
  return result;
}

// ================== EXPORTS ==================

export default {
  // Auth helpers
  getAuthHeaders,
  getApiUrl,
  makeAuthenticatedRequest,
  makeAuthenticatedJsonRequest,
  
  // Data processing
  extractArrayData,
  extractItemData,
  
  // Error handling
  parseApiError,
  getStatusErrorMessage,
  
  // Validation
  validateRequiredFields,
  validateEmail,
  validateSaudiPhone,
  
  // Formatting
  formatArabicDate,
  formatArabicDateTime,
  formatArabicTime,
  formatArabicNumber,
  
  // URL helpers
  buildQueryString,
  extractId,
  
  // Retry helpers
  retryWithBackoff,
  
  // Cache helpers
  apiCache,
  cachedRequest
};
