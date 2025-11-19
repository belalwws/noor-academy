/**
 * 🚨 نظام معالجة الأخطاء المتقدم
 * يفصل بين رسائل المطور (console) ورسائل المستخدم (UI)
 */

// ===== أنواع الأخطاء =====
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION', 
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// ===== واجهة الخطأ =====
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  userMessage: string;    // رسالة للمستخدم (عربي، مفهوم)
  devMessage: string;     // رسالة للمطور (تقنية، مفصلة)
  originalError?: any;    // الخطأ الأصلي
  context?: any;          // سياق إضافي
  timestamp: Date;
  errorId: string;        // معرف فريد للخطأ
}

// ===== رسائل المستخدم المترجمة =====
const USER_MESSAGES = {
  // أخطاء الشبكة
  NETWORK_CONNECTION: 'يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى',
  NETWORK_TIMEOUT: 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى',
  NETWORK_OFFLINE: 'لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال',

  // أخطاء المصادقة
  INVALID_CREDENTIALS: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  ACCOUNT_LOCKED: 'تم قفل حسابك مؤقتاً. يرجى المحاولة لاحقاً',
  ACCOUNT_INACTIVE: 'حسابك غير مفعل. يرجى التواصل مع الدعم الفني',
  SESSION_EXPIRED: 'انتهت جلسة العمل. يرجى تسجيل الدخول مرة أخرى',

  // أخطاء التحقق من البيانات
  REQUIRED_FIELD: 'يرجى ملء جميع الحقول المطلوبة',
  INVALID_EMAIL: 'يرجى إدخال بريد إلكتروني صحيح',
  WEAK_PASSWORD: 'كلمة المرور ضعيفة. استخدم كلمة مرور أقوى',
  PASSWORD_MISMATCH: 'كلمات المرور غير متطابقة',
  INVALID_PHONE: 'يرجى إدخال رقم هاتف صحيح',

  // أخطاء التسجيل
  EMAIL_EXISTS: 'البريد الإلكتروني مستخدم بالفعل. جرب بريد آخر أو سجل الدخول',
  USERNAME_EXISTS: 'اسم المستخدم مستخدم بالفعل. جرب اسم آخر',
  REGISTRATION_FAILED: 'فشل في إنشاء الحساب. يرجى المحاولة لاحقاً',

  // أخطاء الخادم
  SERVER_ERROR: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً',
  SERVICE_UNAVAILABLE: 'الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً',
  MAINTENANCE: 'الموقع تحت الصيانة. يرجى المحاولة لاحقاً',

  // أخطاء عامة
  UNKNOWN_ERROR: 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً',
  PERMISSION_DENIED: 'ليس لديك صلاحية للوصول لهذه الصفحة',
  RATE_LIMITED: 'تم تجاوز الحد المسموح من المحاولات. يرجى الانتظار قليلاً'
};

// ===== فئة معالج الأخطاء =====
class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * إنشاء خطأ جديد
   */
  createError(
    type: ErrorType,
    severity: ErrorSeverity,
    userMessage: string,
    devMessage: string,
    originalError?: any,
    context?: any
  ): AppError {
    const error: AppError = {
      type,
      severity,
      userMessage,
      devMessage,
      originalError,
      context,
      timestamp: new Date(),
      errorId: this.generateErrorId()
    };

    // حفظ الخطأ في السجل
    this.errorLog.push(error);

    // طباعة رسالة المطور في الكونسول
    this.logToConsole(error);

    return error;
  }

  /**
   * معالجة خطأ HTTP
   */
  handleHttpError(
    status: number,
    responseData: any,
    context?: any
  ): AppError {
    let type = ErrorType.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let userMessage = USER_MESSAGES.UNKNOWN_ERROR;
    let devMessage = `HTTP ${status} Error`;

    // تحديد نوع الخطأ حسب status code
    if (status >= 400 && status < 500) {
      type = ErrorType.VALIDATION;
      severity = ErrorSeverity.LOW;

      if (status === 401) {
        type = ErrorType.AUTHENTICATION;
        userMessage = USER_MESSAGES.INVALID_CREDENTIALS;
        devMessage = 'Authentication failed';
      } else if (status === 403) {
        type = ErrorType.AUTHORIZATION;
        userMessage = USER_MESSAGES.PERMISSION_DENIED;
        devMessage = 'Authorization failed';
      } else if (status === 429) {
        userMessage = USER_MESSAGES.RATE_LIMITED;
        devMessage = 'Rate limit exceeded';
      }
    } else if (status >= 500) {
      type = ErrorType.SERVER;
      severity = ErrorSeverity.HIGH;
      userMessage = USER_MESSAGES.SERVER_ERROR;
      devMessage = 'Server error';
    }

    // تحليل محتوى الاستجابة للحصول على تفاصيل أكثر
    if (responseData) {
      // استخراج رسالة الخطأ من responseData
      let extractedMessage = '';
      
      // 1. محاولة استخراج من detail (array أو string)
      if (responseData.detail) {
        if (Array.isArray(responseData.detail)) {
          // إذا كان detail array، استخرج الرسائل من كل عنصر
          extractedMessage = responseData.detail
            .map((item: any) => {
              if (typeof item === 'string') {
                return item;
              } else if (item && typeof item === 'object') {
                // ErrorDetail object: {string: "...", code: "..."}
                return item.string || item.message || JSON.stringify(item);
              }
              return String(item);
            })
            .filter((msg: string) => msg && msg.trim())
            .join(', ');
        } else if (typeof responseData.detail === 'string') {
          extractedMessage = responseData.detail;
        }
      }
      
      // 2. محاولة استخراج من error
      if (!extractedMessage && responseData.error) {
        if (typeof responseData.error === 'string') {
          extractedMessage = responseData.error;
        } else if (Array.isArray(responseData.error)) {
          extractedMessage = responseData.error
            .map((item: any) => {
              if (typeof item === 'string') return item;
              if (item && typeof item === 'object') {
                return item.string || item.message || JSON.stringify(item);
              }
              return String(item);
            })
            .filter((msg: string) => msg && msg.trim())
            .join(', ');
        }
      }
      
      // 3. محاولة استخراج من message
      if (!extractedMessage && responseData.message) {
        extractedMessage = typeof responseData.message === 'string' 
          ? responseData.message 
          : String(responseData.message);
      }
      
      // 4. إذا تم استخراج رسالة، استخدمها
      if (extractedMessage) {
        const errorText = extractedMessage.toLowerCase();
        
        // معالجة أخطاء محددة
        if (errorText.includes('egressserviceclient') || errorText.includes('egress')) {
          userMessage = 'خدمة التسجيل غير متاحة حالياً. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني.';
          devMessage = 'EgressServiceClient not available';
        } else if (errorText.includes('recording already in progress') || errorText.includes('تسجيل قيد التشغيل')) {
          userMessage = 'يوجد تسجيل قيد التشغيل بالفعل';
          devMessage = 'Recording already in progress';
        } else if (errorText.includes('recording service unavailable') || errorText.includes('خدمة التسجيل غير متاحة')) {
          userMessage = 'خدمة التسجيل غير متاحة حالياً. يرجى المحاولة لاحقاً.';
          devMessage = 'Recording service unavailable';
        } else if (errorText.includes('email') && errorText.includes('exists')) {
          userMessage = USER_MESSAGES.EMAIL_EXISTS;
          devMessage = 'Email already exists';
        } else if (errorText.includes('username') && errorText.includes('exists')) {
          userMessage = USER_MESSAGES.USERNAME_EXISTS;
          devMessage = 'Username already exists';
        } else if (errorText.includes('password')) {
          if (errorText.includes('weak') || errorText.includes('common')) {
            userMessage = USER_MESSAGES.WEAK_PASSWORD;
            devMessage = 'Password validation failed';
          }
        } else {
          // استخدام الرسالة المستخرجة مباشرة إذا لم تكن هناك معالجة خاصة
          userMessage = extractedMessage;
          devMessage = extractedMessage;
        }
      } else {
        // إذا لم يتم استخراج رسالة، استخدم JSON.stringify للبحث
        const errorText = JSON.stringify(responseData).toLowerCase();
        
        if (errorText.includes('email') && errorText.includes('exists')) {
          userMessage = USER_MESSAGES.EMAIL_EXISTS;
          devMessage = 'Email already exists';
        } else if (errorText.includes('username') && errorText.includes('exists')) {
          userMessage = USER_MESSAGES.USERNAME_EXISTS;
          devMessage = 'Username already exists';
        } else if (errorText.includes('password')) {
          if (errorText.includes('weak') || errorText.includes('common')) {
            userMessage = USER_MESSAGES.WEAK_PASSWORD;
            devMessage = 'Password validation failed';
          }
        }
      }
    }

    return this.createError(
      type,
      severity,
      userMessage,
      devMessage,
      responseData,
      { status, ...context }
    );
  }

  /**
   * معالجة خطأ الشبكة
   */
  handleNetworkError(error: any, context?: any): AppError {
    let userMessage = USER_MESSAGES.NETWORK_CONNECTION;
    let devMessage = 'Network error';

    if (error.name === 'AbortError') {
      userMessage = USER_MESSAGES.NETWORK_TIMEOUT;
      devMessage = 'Request timeout';
    } else if (!navigator.onLine) {
      userMessage = USER_MESSAGES.NETWORK_OFFLINE;
      devMessage = 'Device is offline';
    }

    return this.createError(
      ErrorType.NETWORK,
      ErrorSeverity.MEDIUM,
      userMessage,
      devMessage,
      error,
      context
    );
  }

  /**
   * معالجة خطأ التحقق من البيانات
   */
  handleValidationError(
    field: string,
    value: any,
    rule: string,
    context?: any
  ): AppError {
    let userMessage = USER_MESSAGES.REQUIRED_FIELD;
    let devMessage = `Validation failed for field: ${field}`;

    // رسائل مخصصة حسب نوع التحقق
    switch (rule) {
      case 'required':
        userMessage = `${this.getFieldNameInArabic(field)} مطلوب`;
        break;
      case 'email':
        userMessage = USER_MESSAGES.INVALID_EMAIL;
        break;
      case 'password':
        userMessage = USER_MESSAGES.WEAK_PASSWORD;
        break;
      case 'phone':
        userMessage = USER_MESSAGES.INVALID_PHONE;
        break;
    }

    return this.createError(
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      userMessage,
      devMessage,
      { field, value, rule },
      context
    );
  }

  /**
   * طباعة الخطأ في الكونسول
   */
  private logToConsole(error: AppError): void {
    const style = this.getConsoleStyle(error.severity);
    
    console.group(`🚨 ${error.type} Error [${error.errorId}]`);
    console.log(`%c${error.devMessage}`, style);
    console.log('User Message:', error.userMessage);
    console.log('Severity:', error.severity);
    console.log('Timestamp:', error.timestamp.toISOString());
    
    if (error.originalError) {
      console.log('Original Error:', error.originalError);
    }
    
    if (error.context) {
      console.log('Context:', error.context);
    }
    
    console.groupEnd();
  }

  /**
   * الحصول على نمط CSS للكونسول حسب شدة الخطأ
   */
  private getConsoleStyle(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'color: #FFA500; font-weight: bold;';
      case ErrorSeverity.MEDIUM:
        return 'color: #FF6B35; font-weight: bold;';
      case ErrorSeverity.HIGH:
        return 'color: #FF0000; font-weight: bold;';
      case ErrorSeverity.CRITICAL:
        return 'color: #8B0000; font-weight: bold; background: #FFE4E1;';
      default:
        return 'color: #666; font-weight: bold;';
    }
  }

  /**
   * ترجمة أسماء الحقول للعربية
   */
  private getFieldNameInArabic(field: string): string {
    const translations: { [key: string]: string } = {
      'first_name': 'الاسم الأول',
      'last_name': 'الاسم الأخير',
      'username': 'اسم المستخدم',
      'email': 'البريد الإلكتروني',
      'password': 'كلمة المرور',
      'password2': 'تأكيد كلمة المرور',
      'phone': 'رقم الهاتف',
      'age': 'العمر',
      'gender': 'الجنس'
    };
    
    return translations[field] || field;
  }

  /**
   * إنشاء معرف فريد للخطأ
   */
  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * الحصول على سجل الأخطاء
   */
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  /**
   * مسح سجل الأخطاء
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }
}

// تصدير مثيل واحد من معالج الأخطاء
export const errorHandler = ErrorHandler.getInstance();
export default errorHandler;
