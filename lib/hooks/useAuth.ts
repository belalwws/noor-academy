// 🔒 Custom Auth Hook for Lisan-Alhekma
// Centralized authentication state management

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { login, logout, setLoading, setError } from '../store';
import { authService } from '../auth/authService';
import { User, AuthTokens, LoginCredentials } from '../types/auth';
import { apiClient } from '../apiClient';

export interface UseAuthReturn {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userRole: string;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; redirectPath?: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  getRedirectPath: (user: User) => string;
}

export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch();
  const { user, tokens, isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  const [error, setLocalError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('student');
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // دالة لاستخراج رسالة خطأ واضحة من object
  const extractErrorMessage = (errorObj: any): string => {
    if (typeof errorObj === 'string') {
      return translateLoginError(errorObj);
    }
    
    // البحث عن رسائل شائعة
    if (errorObj.detail) return translateLoginError(errorObj.detail);
    if (errorObj.message) return translateLoginError(errorObj.message);
    if (errorObj.error) return translateLoginError(errorObj.error);
    
    // معالجة أخطاء التحقق
    if (errorObj.non_field_errors && Array.isArray(errorObj.non_field_errors)) {
      return errorObj.non_field_errors.map(translateLoginError).join(', ');
    }
    
    // معالجة أخطاء الحقول
    const fieldErrors = [];
    for (const [field, errors] of Object.entries(errorObj)) {
      if (Array.isArray(errors)) {
        const fieldName = getFieldDisplayName(field);
        fieldErrors.push(`${fieldName}: ${errors.map(translateLoginError).join(', ')}`);
      } else if (typeof errors === 'string') {
        const fieldName = getFieldDisplayName(field);
        fieldErrors.push(`${fieldName}: ${translateLoginError(errors)}`);
      }
    }
    
    if (fieldErrors.length > 0) {
      return fieldErrors.join('\n');
    }
    
    return 'حدث خطأ غير متوقع';
  };

  // دالة لترجمة أخطاء تسجيل الدخول الشائعة
  const translateLoginError = (error: string): string => {
    if (!error || typeof error !== 'string') {
      return 'حدث خطأ غير متوقع';
    }
    
    const errorTranslations: { [key: string]: string } = {
      // Authentication errors
      'Invalid credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      'Invalid email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      'Unable to log in with provided credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      'No active account found with the given credentials': 'لا يوجد حساب نشط بهذه البيانات',
      'Authentication credentials were not provided': 'لم يتم توفير بيانات المصادقة',
      'Invalid token': 'رمز المصادقة غير صحيح',
      
      // Field validation errors
      'This field is required': 'هذا الحقل مطلوب',
      'Enter a valid email address': 'أدخل بريد إلكتروني صحيح',
      'This field may not be blank': 'هذا الحقل لا يمكن أن يكون فارغاً',
      'Ensure this field has no more than': 'تأكد من أن هذا الحقل لا يحتوي على أكثر من',
      'Ensure this field has at least': 'تأكد من أن هذا الحقل يحتوي على الأقل على',
      
      // Account status errors
      'User account is disabled': 'حساب المستخدم معطل',
      'Account is not active': 'الحساب غير نشط',
      'User is not active': 'المستخدم غير نشط',
      'Account has been deactivated': 'تم إلغاء تفعيل الحساب',
      
      // Rate limiting and security
      'Too many failed login attempts': 'محاولات تسجيل دخول فاشلة كثيرة جداً',
      'Account temporarily locked': 'الحساب مقفل مؤقتاً',
      'Rate limit exceeded': 'تم تجاوز الحد المسموح من المحاولات',
      
      // General errors
      'Login failed due to validation errors': 'فشل تسجيل الدخول بسبب أخطاء في البيانات',
      'Internal server error': 'حدث خطأ داخلي في الخادم',
      'Service temporarily unavailable': 'الخدمة غير متاحة مؤقتاً',
      'Network error': 'خطأ في الشبكة',
      'Connection failed': 'فشل في الاتصال',
      
      // Password errors
      'Password is too weak': 'كلمة المرور ضعيفة جداً',
      'Password must contain': 'يجب أن تحتوي كلمة المرور على',
      'Passwords do not match': 'كلمات المرور غير متطابقة',
      
      // Email errors
      'Email already exists': 'البريد الإلكتروني موجود بالفعل',
      'Invalid email format': 'تنسيق البريد الإلكتروني غير صحيح',
      
      // Common API errors
      'Bad Request': 'طلب غير صحيح',
      'Unauthorized': 'غير مصرح لك بالوصول',
      'Forbidden': 'ممنوع الوصول',
      'Not Found': 'غير موجود',
      'Method Not Allowed': 'الطريقة غير مسموحة',
      'Conflict': 'تعارض في البيانات',
      'Unprocessable Entity': 'بيانات غير قابلة للمعالجة'
    };
    
    // البحث عن ترجمة مطابقة تماماً
    if (errorTranslations[error]) {
      return errorTranslations[error];
    }
    
    // البحث عن ترجمة جزئية
    for (const [englishError, arabicError] of Object.entries(errorTranslations)) {
      if (error.toLowerCase().includes(englishError.toLowerCase())) {
        return arabicError;
      }
    }
    
    // إذا كان الخطأ يحتوي على كلمات مفتاحية معينة
    const lowerError = error.toLowerCase();
    if (lowerError.includes('password') && lowerError.includes('incorrect')) {
      return 'كلمة المرور غير صحيحة';
    }
    if (lowerError.includes('email') && lowerError.includes('invalid')) {
      return 'البريد الإلكتروني غير صحيح';
    }
    if (lowerError.includes('user') && lowerError.includes('not found')) {
      return 'المستخدم غير موجود';
    }
    if (lowerError.includes('credentials') && lowerError.includes('invalid')) {
      return 'بيانات تسجيل الدخول غير صحيحة';
    }
    
    return error; // إرجاع الخطأ الأصلي إذا لم توجد ترجمة
  };

  // دالة للحصول على اسم الحقل بالعربية
  const getFieldDisplayName = (field: string): string => {
    const fieldNames: { [key: string]: string } = {
      'email': 'البريد الإلكتروني',
      'password': 'كلمة المرور',
      'username': 'اسم المستخدم',
      'phone': 'رقم الهاتف',
      'first_name': 'الاسم الأول',
      'last_name': 'الاسم الأخير',
      'non_field_errors': 'خطأ عام'
    };
    
    return fieldNames[field] || field;
  };

  // دالة لتنسيق أخطاء التحقق
  const formatValidationErrors = (errors: any): string => {
    if (typeof errors === 'string') {
      return translateLoginError(errors);
    }
    
    if (!errors || typeof errors !== 'object') {
      return 'خطأ في البيانات المدخلة';
    }
    
    const errorMessages = [];
    
    // معالجة الأخطاء العامة
    if (errors.non_field_errors && Array.isArray(errors.non_field_errors)) {
      const translatedErrors = errors.non_field_errors.map((error: string) => translateLoginError(error));
      errorMessages.push(...translatedErrors);
    }
    
    // معالجة أخطاء الحقول المحددة
    const fieldTranslations: { [key: string]: string } = {
      'email': 'البريد الإلكتروني',
      'password': 'كلمة المرور',
      'username': 'اسم المستخدم',
      'phone': 'رقم الهاتف',
      'first_name': 'الاسم الأول',
      'last_name': 'الاسم الأخير'
    };
    
    for (const [field, fieldErrors] of Object.entries(errors)) {
      if (field !== 'non_field_errors' && fieldErrors) {
        const fieldName = fieldTranslations[field] || field;
        if (Array.isArray(fieldErrors)) {
          const translatedFieldErrors = fieldErrors.map((error: string) => translateLoginError(error));
          errorMessages.push(`${fieldName}: ${translatedFieldErrors.join(', ')}`);
        } else if (typeof fieldErrors === 'string') {
          errorMessages.push(`${fieldName}: ${translateLoginError(fieldErrors)}`);
        }
      }
    }
    
    const result = errorMessages.length > 0 ? errorMessages.join('\n') : 'خطأ في البيانات المدخلة';
    return result;
  };

  // 🔍 DETECT USER ROLE BASED ON USER DATA
  const detectUserRole = useCallback((user: User): string => {
    // 🎯 PRIMARY: Use the role field from the database if available
    if (user.role) {
      return user.role;
    }
    
    // 🔧 LEGACY FALLBACK: Check if user is staff/admin (for older accounts)
    if (user.is_superuser) {
      return 'admin';
    }
    
    if (user.is_staff) {
      // Check if this is a teacher by looking at specialization or other fields
      if (user.specialization || user.years_of_experience) {
        return 'teacher';
      } else {
        return 'supervisor';
      }
    }
    
    // 🔧 ADDITIONAL CHECKS: Look for teacher-like data in user object
    if (user.specialization || user.years_of_experience || user.qualifications) {
      return 'teacher';
    }
    
    // Default to student
    return 'student';
  }, []);

  // 🎯 GET APPROPRIATE REDIRECT PATH BASED ON USER ROLE
  const getRedirectPath = useCallback((user: User): string => {
    const role = detectUserRole(user);

    // تحديد نوع المشرف من localStorage أو URL parameters
    const supervisorType = localStorage.getItem('supervisor_type') || 'general';
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');

    // إذا كان هناك redirect parameter في URL، استخدمه
    if (redirectParam) {
      return redirectParam;
    }

    switch (role) {
      case 'admin':
        return '/dashboard/admin';
      case 'teacher':
        return '/dashboard/teacher';
      case 'general_supervisor':
        return '/dashboard/supervisor';
      case 'academic_supervisor':
        return '/dashboard/academic-supervisor';
      case 'supervisor':
        // للتوافق مع النظام القديم - توجيه المشرف حسب النوع
        if (supervisorType === 'academic') {
          return '/dashboard/academic-supervisor';
        } else {
          return '/dashboard/supervisor';
        }
      case 'student':
      default:
        return '/dashboard/student';
    }
  }, [detectUserRole]);

  // Update user role when user changes
  useEffect(() => {
    if (user) {
      const role = detectUserRole(user);
      if (role !== userRole) {
        setUserRole(role);
      }
    }
  }, [user, detectUserRole, userRole]);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch(setLoading(true));
        authService.initialize();
        
        const authData = authService.getStoredAuthData();
        if (authData) {
          let currentUser = authData.user;

          // Attempt to enrich role if missing by checking teacher profile
          if (!currentUser.role) {
            try {
              const teacherProfile = await apiClient.getTeacherProfile();
              if (teacherProfile.success) {
                currentUser = { ...currentUser, role: 'teacher' };
                authService.saveAuthData(currentUser, authData.tokens);
              }
            } catch {}
          }

          const role = detectUserRole(currentUser);
          setUserRole(role);
          
          dispatch(login({
            user: currentUser,
            tokens: authData.tokens
          }));
        }
      } catch (err) {
        setLocalError('فشل في تهيئة نظام المصادقة');
      } finally {
        dispatch(setLoading(false));
      }
    };

    // Only run once on mount and if we have stored auth data
    const hasStoredAuth = authService.getStoredAuthData();
    if (!isAuthenticated && hasStoredAuth) {
      initAuth();
    } else if (!isAuthenticated && !hasStoredAuth) {
      // No stored auth data, set loading to false immediately
      dispatch(setLoading(false));
    }
  }, [dispatch, isAuthenticated]);

  const handleLogin = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string; redirectPath?: string }> => {
    try {
      dispatch(setLoading(true));
      setLocalError(null);

      // استخدام الخدمة الموحدة الجديدة
      const response = await unifiedAuthService.login(credentials);

      if (response.success && response.data) {
        // Extract user and tokens from response.data.data (nested structure)
        const { user: receivedUser, tokens } = (response.data as any).data;
        
        // Validate we have the required data
        if (!receivedUser || !tokens) {
          throw new Error('بيانات المصادقة غير مكتملة من الخادم');
        }
        
        let currentUser: User = receivedUser;

        // Try to resolve role by checking teacher profile if role is missing
        if (!currentUser.role) {
          try {
            const teacherProfile = await apiClient.getTeacherProfile();
            if (teacherProfile.success) {
              currentUser = { ...currentUser, role: 'teacher' };
            }
          } catch {}
        }
        
        // Create auth data object
        const authData = { user: currentUser, tokens };

        // Save to auth service
        const saved = authService.saveAuthData(currentUser, tokens);
        if (!saved) {
          throw new Error('فشل في حفظ بيانات المصادقة');
        }

        // Update Redux state
        dispatch(login({ user: currentUser, tokens }));
        
        // Detect user role and get redirect path
        const role = detectUserRole(currentUser);
        setUserRole(role);
        const redirectPath = getRedirectPath(currentUser);
        
        return { success: true, redirectPath };
      }

      // معالجة محسنة للأخطاء
      let errorMessage = 'فشل في تسجيل الدخول';
      
      // أولاً: تحقق من وجود error message مباشر
      if ((response as any).error) {
        const error = (response as any).error;
        
        // إذا كان الخطأ object، حاول استخراج رسالة مفيدة
        if (typeof error === 'object' && error !== null) {
          errorMessage = extractErrorMessage(error);
        } else if (typeof error === 'string') {
          errorMessage = translateLoginError(error);
        } else {
          errorMessage = String(error);
        }
      } 
      // ثانياً: تحقق من وجود errors (validation errors)
      else if ((response as any).errors) {
        errorMessage = formatValidationErrors((response as any).errors);
      }
      // ثالثاً: تحقق من وجود data.errors أو data.error
      else if ((response as any).data) {
        const data = (response as any).data;
        
        if (data.errors) {
          errorMessage = formatValidationErrors(data.errors);
        } else if (data.error) {
          if (typeof data.error === 'object' && data.error !== null) {
            errorMessage = extractErrorMessage(data.error);
          } else {
            errorMessage = translateLoginError(String(data.error));
          }
        } else if (data.detail) {
          errorMessage = translateLoginError(data.detail);
        } else if (data.message) {
          errorMessage = translateLoginError(data.message);
        }
      }
      // رابعاً: تحقق من الخصائص المباشرة في الاستجابة
      else if ((response as any).detail) {
        errorMessage = translateLoginError((response as any).detail);
      } else if ((response as any).message) {
        errorMessage = translateLoginError((response as any).message);
      }
      
      setLocalError(errorMessage);
      return { success: false, error: errorMessage };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    authService.clearAuthData();
    dispatch(logout());
    setLocalError(null);
  };

  const handleRefreshToken = async (): Promise<boolean> => {
    try {
      return await authService.refreshAccessToken();
    } catch (err) {
      return false;
    }
  };

  const handleUpdateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Update Redux state
      dispatch(login({
        user: updatedUser,
        tokens: tokens || { access: '', refresh: '' }
      }));
    }
  };

  // 🔄 AUTOMATIC TOKEN REFRESH EFFECT
  // Note: This is a backup mechanism. The main refresh is handled by authService.scheduleTokenRefresh()
  // This effect only runs if the authService refresh fails or is not set up
  useEffect(() => {
    if (isAuthenticated && tokens?.refresh) {
      // Don't set up interval here - let authService handle it
      // This prevents duplicate refresh attempts
      
      // Only set up a backup check every 50 minutes (access token lasts 1 hour)
      // This is a safety net in case authService refresh fails
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      // Set up backup automatic refresh every 50 minutes (less frequent to avoid conflicts)
      refreshIntervalRef.current = setInterval(async () => {
        try {
          // Check if token is still valid by trying to get it
          const accessToken = authService.getAccessToken();
          if (!accessToken) {
            const success = await handleRefreshToken();
            if (!success) {
              // Check if we still have a refresh token before logging out
              const refreshToken = localStorage.getItem('refresh_token');
              if (!refreshToken) {
                // Don't logout immediately - let the next API call handle it
              }
            }
          }
        } catch (error) {
          // Don't logout on network errors
        }
      }, 50 * 60 * 1000); // 50 minutes - backup check
    }

    // Cleanup on unmount or when authentication changes
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, tokens?.refresh]); // Remove function dependencies to avoid infinite loops

  // 🔄 PAGE VISIBILITY REFRESH EFFECT
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = async () => {
      if (!document.hidden && isAuthenticated) {
        // Only check if we have a refresh token but no access token
        const accessToken = authService.getAccessToken();
        const refreshToken = localStorage.getItem('refresh_token');

        if (!accessToken && refreshToken) {
          try {
            const success = await handleRefreshToken();
            if (!success) {
              // Only logout if refresh token is also invalid
              if (!localStorage.getItem('refresh_token')) {
                handleLogout();
              }
            }
          } catch (error) {
            // Don't logout on network errors
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]); // Remove function dependencies

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    userRole,
    login: handleLogin,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    updateUser: handleUpdateUser,
    getRedirectPath
  };
};
