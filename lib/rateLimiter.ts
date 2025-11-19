/**
 * Rate Limiter للفرونت إند
 * يحدد عدد الطلبات المسموح بها لكل مستخدم حسب دوره
 */

export type UserRole = 'anonymous' | 'student' | 'teacher' | 'supervisor' | 'general_supervisor' | 'academic_supervisor' | 'admin';

// حدود الطلبات لكل دور (طلب/دقيقة)
const RATE_LIMITS: Record<UserRole, number> = {
  anonymous: 30,              // مستخدم غير مسجل: 30 طلب/دقيقة
  student: 100,               // الطالب: 100 طلب/دقيقة
  teacher: 200,               // المعلم: 200 طلب/دقيقة
  supervisor: 500,            // المشرف (قديم): 500 طلب/دقيقة
  general_supervisor: 500,    // المشرف العام: 500 طلب/دقيقة
  academic_supervisor: 500,   // المشرف الأكاديمي: 500 طلب/دقيقة
  admin: 1000,                // المشرف العام/الأدمن: 1000 طلب/دقيقة
};

interface RequestRecord {
  timestamp: number;
  count: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord[]> = new Map();
  private readonly windowMs = 60 * 1000; // نافذة زمنية: دقيقة واحدة

  /**
   * تحديد دور المستخدم من البيانات المخزنة
   */
  private getUserRole(): UserRole {
    try {
      // محاولة الحصول على بيانات المستخدم من localStorage
      const authData = localStorage.getItem('auth');
      if (!authData) return 'anonymous';

      const parsedAuth = JSON.parse(authData);
      const user = parsedAuth?.user;
      
      if (!user) return 'anonymous';

      // تحديد الدور بناءً على خصائص المستخدم
      if (user.is_superuser || user.role === 'admin') return 'admin';

      // دعم الأدوار الجديدة مباشرة
      if (user.role === 'general_supervisor') return 'general_supervisor';
      if (user.role === 'academic_supervisor') return 'academic_supervisor';

      // تحديد نوع المشرف (للتوافق مع النظام القديم)
      if (user.role === 'supervisor' || user.is_supervisor) {
        const supervisorType = localStorage.getItem('supervisor_type') || 'general';
        return supervisorType === 'academic' ? 'academic_supervisor' : 'supervisor';
      }

      if (user.role === 'teacher' || user.is_teacher) return 'teacher';
      if (user.role === 'student' || user.is_student) return 'student';
      
      return 'anonymous';
    } catch (error) {
      console.warn('خطأ في تحديد دور المستخدم:', error);
      return 'anonymous';
    }
  }

  /**
   * تنظيف الطلبات القديمة من الذاكرة
   */
  private cleanOldRequests(key: string): void {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // إزالة الطلبات الأقدم من النافذة الزمنية
    const validRequests = requests.filter(
      req => now - req.timestamp < this.windowMs
    );
    
    if (validRequests.length === 0) {
      this.requests.delete(key);
    } else {
      this.requests.set(key, validRequests);
    }
  }

  /**
   * حساب عدد الطلبات الحالية في النافذة الزمنية
   */
  private getCurrentRequestCount(key: string): number {
    this.cleanOldRequests(key);
    const requests = this.requests.get(key) || [];
    return requests.reduce((total, req) => total + req.count, 0);
  }

  /**
   * تسجيل طلب جديد
   */
  private recordRequest(key: string): void {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // البحث عن طلب في نفس الثانية
    const existingRequest = requests.find(
      req => Math.floor(req.timestamp / 1000) === Math.floor(now / 1000)
    );
    
    if (existingRequest) {
      existingRequest.count++;
    } else {
      requests.push({ timestamp: now, count: 1 });
    }
    
    this.requests.set(key, requests);
  }

  /**
   * فحص ما إذا كان الطلب مسموح أم لا
   */
  public canMakeRequest(endpoint?: string): boolean {
    const userRole = this.getUserRole();
    const limit = RATE_LIMITS[userRole];

    // إنشاء مفتاح فريد للمستخدم (يمكن إضافة endpoint للتحكم الدقيق)
    const key = `${userRole}${endpoint ? `_${endpoint}` : ''}`;

    // فحص إذا كان المستخدم مجمد
    if (this.isFrozen(key)) {
      return false;
    }

    const currentCount = this.getCurrentRequestCount(key);

    if (currentCount >= limit) {
      console.warn(`تم تجاوز حد الطلبات للدور ${userRole}: ${currentCount}/${limit}`);
      // تجميد المستخدم لمدة دقيقة
      this.setFreezeTime(key);
      return false;
    }

    this.recordRequest(key);
    return true;
  }

  /**
   * تجميد المستخدم لمدة دقيقة عند تجاوز الحد
   */
  private setFreezeTime(key: string): void {
    const freezeKey = `freeze_${key}`;
    const freezeTime = Date.now() + (60 * 1000); // دقيقة واحدة
    localStorage.setItem(freezeKey, freezeTime.toString());
  }

  /**
   * فحص إذا كان المستخدم مجمد
   */
  private isFrozen(key: string): boolean {
    const freezeKey = `freeze_${key}`;
    const freezeTime = localStorage.getItem(freezeKey);

    if (!freezeTime) return false;

    const now = Date.now();
    const freezeUntil = parseInt(freezeTime);

    if (now < freezeUntil) {
      return true;
    } else {
      // انتهت فترة التجميد
      localStorage.removeItem(freezeKey);
      return false;
    }
  }

  /**
   * الحصول على وقت انتهاء التجميد
   */
  public getFreezeEndTime(endpoint?: string): number | null {
    const userRole = this.getUserRole();
    const key = `${userRole}${endpoint ? `_${endpoint}` : ''}`;
    const freezeKey = `freeze_${key}`;
    const freezeTime = localStorage.getItem(freezeKey);

    if (!freezeTime) return null;

    const freezeUntil = parseInt(freezeTime);
    const now = Date.now();

    return freezeUntil > now ? freezeUntil : null;
  }

  /**
   * الحصول على معلومات حالة الطلبات
   */
  public getRequestStatus(endpoint?: string): {
    role: UserRole;
    limit: number;
    current: number;
    remaining: number;
    resetTime: number;
  } {
    const userRole = this.getUserRole();
    const limit = RATE_LIMITS[userRole];
    const key = `${userRole}${endpoint ? `_${endpoint}` : ''}`;
    const current = this.getCurrentRequestCount(key);
    
    // حساب وقت إعادة التعيين (بداية الدقيقة القادمة)
    const now = Date.now();
    const resetTime = now + (this.windowMs - (now % this.windowMs));
    
    return {
      role: userRole,
      limit,
      current,
      remaining: Math.max(0, limit - current),
      resetTime,
    };
  }

  /**
   * انتظار حتى يصبح الطلب متاحاً
   */
  public async waitForAvailableSlot(endpoint?: string, maxWaitMs: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      if (this.canMakeRequest(endpoint)) {
        return true;
      }
      
      // انتظار 100ms قبل المحاولة مرة أخرى
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  }

  /**
   * تنظيف جميع البيانات المخزنة
   */
  public clear(): void {
    this.requests.clear();
  }

  /**
   * الحصول على رسالة خطأ مناسبة عند تجاوز الحد
   */
  public getRateLimitMessage(): string {
    const status = this.getRequestStatus();
    const resetMinutes = Math.ceil((status.resetTime - Date.now()) / 60000);
    
    return `تم تجاوز حد الطلبات المسموح (${status.current}/${status.limit}). يرجى المحاولة مرة أخرى خلال ${resetMinutes} دقيقة.`;
  }
}

// إنشاء instance واحد للاستخدام في جميع أنحاء التطبيق
export const rateLimiter = new RateLimiter();

// دالة مساعدة للتحقق السريع
export const canMakeRequest = (endpoint?: string): boolean => {
  return rateLimiter.canMakeRequest(endpoint);
};

// دالة مساعدة للحصول على حالة الطلبات
export const getRequestStatus = (endpoint?: string) => {
  return rateLimiter.getRequestStatus(endpoint);
};

// دالة مساعدة للانتظار
export const waitForAvailableSlot = (endpoint?: string, maxWaitMs?: number): Promise<boolean> => {
  return rateLimiter.waitForAvailableSlot(endpoint, maxWaitMs);
};
