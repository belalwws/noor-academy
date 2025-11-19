/**
 * Simple API Client - Dev/Testing Utility
 * ⚠️ DEPRECATED: This is a simplified wrapper for testing purposes.
 * For production code, use apiClient from './apiClient'
 * 
 * This file is kept for backward compatibility and testing.
 * All functions now use the unified apiClient internally.
 */

import { apiClient } from './apiClient';
import { logger } from './utils/logger';

// Get correct API base URL (for reference only)
const getAPIUrl = () => {
  // Use environment API URL with fallback
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
  if (process.env.NODE_ENV === 'development') {
    logger.debug('[SimpleAPI] Resolved API_BASE_URL:', apiUrl);
  }
  return apiUrl;
};

/**
 * Simple fetch wrapper - Now uses unified apiClient
 */
async function simpleFetch(endpoint: string, options: RequestInit = {}) {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('🔄 Simple API Request:', endpoint);
  }
  
  try {
    // Use unified apiClient
    const method = options.method || 'GET';
    let response;
    
    switch (method) {
      case 'GET':
        response = await apiClient.get(endpoint);
        break;
      case 'POST':
        const postBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
        response = await apiClient.post(endpoint, postBody);
        break;
      case 'PUT':
        const putBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
        response = await apiClient.put(endpoint, putBody);
        break;
      case 'PATCH':
        const patchBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
        response = await apiClient.patch(endpoint, patchBody);
        break;
      case 'DELETE':
        response = await apiClient.delete(endpoint);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    return {
      success: response.success !== false,
      data: response.data,
      status: response.status
    };
    
  } catch (error: any) {
    logger.error('❌ Simple API Error:', error);
    
    // More detailed error handling
    let errorMessage = 'Network error';
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = 'خطأ في الاتصال بالخادم. تحقق من الاتصال بالإنترنت.';
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.appError?.userMessage) {
      errorMessage = error.appError.userMessage;
    }
    
    return {
      success: false,
      error: errorMessage,
      status: error?.status || 0
    };
  }
}

/**
 * Simple Login Function - Now uses unified apiClient
 */
export async function simpleLogin(credentials: { email: string; password: string }) {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('🔑 Simple Login attempt:', { email: credentials.email });
  }
  
  try {
    // Use unified apiClient directly
    const response = await apiClient.post('/auth/login/', credentials);
    
    if (response.success !== false && response.data) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('✅ Login successful');
      }
      return {
        success: true,
        data: response.data,
        user: response.data?.user,
        tokens: response.data?.tokens || response.data?.token
      };
    } else {
      return {
        success: false,
        error: getArabicErrorMessage(response.error || 'فشل في تسجيل الدخول')
      };
    }
  } catch (error: any) {
    logger.error('❌ Login exception:', error);
    return {
      success: false,
      error: getArabicErrorMessage(error?.appError?.userMessage || error?.message || 'خطأ في الشبكة')
    };
  }
}

/**
 * Simple Register Function - Now uses unified apiClient
 */
export async function simpleRegister(userData: any) {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('📝 Simple Register attempt:', { email: userData.email });
  }
  
  try {
    // Use unified apiClient directly - try the standard endpoint first
    const response = await apiClient.post('/auth/register/', userData);
    
    if (response.success !== false && response.data) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('✅ Registration successful');
      }
      return {
        success: true,
        data: response.data,
        user: response.data?.user,
        tokens: response.data?.tokens || response.data?.token
      };
    } else {
      return {
        success: false,
        error: getArabicErrorMessage(response.error || 'فشل في إنشاء الحساب')
      };
    }
  } catch (error: any) {
    logger.error('❌ Registration exception:', error);
    return {
      success: false,
      error: getArabicErrorMessage(error?.appError?.userMessage || error?.message || 'خطأ في الشبكة')
    };
  }
}

/**
 * Convert error messages to Arabic
 */
function getArabicErrorMessage(error: string): string {
  if (error.includes('Failed to fetch') || error.includes('NetworkError')) {
    return 'خطأ في الاتصال بالخادم. تحقق من الاتصال بالإنترنت أو جرب لاحقاً.';
  }
  
  if (error.includes('CORS') || error.includes('Access-Control-Allow-Origin')) {
    return 'مشكلة في إعدادات الخادم (CORS). الخادم لا يسمح بالطلبات من هذا المصدر.';
  }
  
  if (error.includes('502') || error.includes('Bad Gateway')) {
    return 'الخادم غير متاح حالياً (502). حاول مرة أخرى بعد قليل.';
  }
  
  if (error.includes('503') || error.includes('Service Unavailable')) {
    return 'الخدمة غير متاحة مؤقتاً (503). حاول مرة أخرى لاحقاً.';
  }
  
  if (error.includes('404') || error.includes('Not Found')) {
    return 'الخدمة المطلوبة غير موجودة (404). قد يكون هناك مشكلة في إعدادات الخادم.';
  }
  
  if (error.includes('401') || error.includes('Invalid credentials')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  }
  
  if (error.includes('400') || error.includes('Bad Request')) {
    return 'خطأ في البيانات المدخلة';
  }
  
  if (error.includes('500') || error.includes('Server Error')) {
    return 'خطأ في الخادم. حاول مرة أخرى لاحقاً.';
  }
  
  if (error.includes('signal is aborted') || error.includes('AbortError')) {
    return 'انتهت مهلة الطلب. حاول مرة أخرى.';
  }
  
  if (error.includes('جميع endpoints التسجيل غير متاحة')) {
    return 'جميع خدمات التسجيل غير متاحة حالياً. قد يكون الخادم معطل أو في صيانة. حاول مرة أخرى لاحقاً.';
  }
  
  return error;
}

/**
 * Test API Connection - Dev only
 */
export async function testSimpleAPI() {
  if (process.env.NODE_ENV !== 'development') {
    logger.warn('testSimpleAPI is only available in development mode');
    return false;
  }
  
  logger.debug('🧪 Testing Simple API...');
  
  try {
    // Test health endpoint
    const response = await apiClient.get('/health/');
    if (response.success !== false) {
      logger.debug('✅ API connection works!');
      return true;
    }
    return false;
  } catch (error) {
    logger.error('❌ Simple API Test failed:', error);
    return false;
  }
}

/**
 * Test Login Endpoint Specifically - Dev only
 */
export async function testLoginEndpoint() {
  if (process.env.NODE_ENV !== 'development') {
    logger.warn('testLoginEndpoint is only available in development mode');
    return { success: false, error: 'Not available in production' };
  }
  
  logger.debug('🔐 Testing Login Endpoint...');
  
  const testCredentials = {
    email: 'test@example.com',
    password: 'testpassword'
  };
  
  try {
    const response = await apiClient.post('/auth/login/', testCredentials);
    return {
      success: response.success !== false,
      data: response.data,
      error: response.error,
      status: response.status
    };
  } catch (error: any) {
    logger.error('❌ Login endpoint test failed:', error);
    return { 
      success: false, 
      error: error?.appError?.userMessage || error?.message || 'Unknown error' 
    };
  }
}

/**
 * Test Register Endpoint Specifically - Dev only
 */
export async function testRegisterEndpoint() {
  if (process.env.NODE_ENV !== 'development') {
    logger.warn('testRegisterEndpoint is only available in development mode');
    return { success: false, error: 'Not available in production' };
  }
  
  logger.debug('📝 Testing Register Endpoint...');
  
  const testUserData = {
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser123',
    email: 'test@example.com',
    password: 'TestPassword123',
    password2: 'TestPassword123',
    country_code: '+966',
    phone_number: '501234567',
    gender: 'male',
    age: 25,
    learning_goal: 'memorize_quran',
    preferred_language: 'ar',
    accept_terms: true
  };
  
  try {
    // Test standard register endpoint
    const response = await apiClient.post('/auth/register/', testUserData);
    
    return {
      success: response.success !== false,
      endpoint: '/auth/register/',
      result: {
        data: response.data,
        error: response.error,
        status: response.status
      }
    };
  } catch (error: any) {
    logger.error('❌ Register endpoint test failed:', error);
    return { 
      success: false, 
      error: error?.appError?.userMessage || error?.message || 'Unknown error' 
    };
  }
}

