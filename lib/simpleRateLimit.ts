'use client';

// نظام Rate Limiting بسيط وعادل
export type UserRole = 'anonymous' | 'student' | 'teacher' | 'supervisor' | 'general_supervisor' | 'academic_supervisor' | 'admin';

// حدود الطلبات لكل دور (طلبات/دقيقة)
const RATE_LIMITS: Record<UserRole, number> = {
  anonymous: 30,
  student: 100,
  teacher: 200,
  supervisor: 500,
  general_supervisor: 500,
  academic_supervisor: 500,
  admin: 1000,
};

// مدة النافذة الزمنية (5 دقائق بدلاً من دقيقة واحدة)
const WINDOW_SIZE = 5 * 60 * 1000; // 5 دقائق
const FREEZE_DURATION = 2 * 60 * 1000; // دقيقتان تجميد

interface RequestRecord {
  timestamp: number;
  endpoint: string;
}

class SimpleRateLimiter {
  private getStorageKey(endpoint?: string): string {
    return `simple_rate_limit_${endpoint || 'default'}`;
  }

  private getFreezeKey(endpoint?: string): string {
    return `simple_freeze_${endpoint || 'default'}`;
  }

  private getUserRole(): UserRole {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.role || 'anonymous';
      }
    } catch (error) {
      console.warn('Could not get user role:', error);
    }
    return 'anonymous';
  }

  private getRequests(endpoint?: string): RequestRecord[] {
    try {
      const key = this.getStorageKey(endpoint);
      const data = localStorage.getItem(key);
      if (data) {
        const requests = JSON.parse(data) as RequestRecord[];
        const now = Date.now();
        // احتفظ فقط بالطلبات في النافزة الزمنية الحالية
        const validRequests = requests.filter(req => (now - req.timestamp) < WINDOW_SIZE);
        
        // احفظ البيانات المنظفة
        localStorage.setItem(key, JSON.stringify(validRequests));
        return validRequests;
      }
    } catch (error) {
      console.warn('Could not get requests:', error);
    }
    return [];
  }

  private addRequest(endpoint?: string): void {
    try {
      const key = this.getStorageKey(endpoint);
      const requests = this.getRequests(endpoint);
      const newRequest: RequestRecord = {
        timestamp: Date.now(),
        endpoint: endpoint || 'default'
      };
      
      requests.push(newRequest);
      localStorage.setItem(key, JSON.stringify(requests));
    } catch (error) {
      console.warn('Could not add request:', error);
    }
  }

  public isFrozen(endpoint?: string): boolean {
    try {
      const freezeKey = this.getFreezeKey(endpoint);
      const freezeTime = localStorage.getItem(freezeKey);
      if (freezeTime) {
        const freezeEnd = parseInt(freezeTime);
        if (Date.now() < freezeEnd) {
          return true;
        } else {
          // انتهى التجميد، احذف المفتاح
          localStorage.removeItem(freezeKey);
        }
      }
    } catch (error) {
      console.warn('Could not check freeze status:', error);
    }
    return false;
  }

  public getFreezeEndTime(endpoint?: string): number | null {
    try {
      const freezeKey = this.getFreezeKey(endpoint);
      const freezeTime = localStorage.getItem(freezeKey);
      if (freezeTime) {
        const freezeEnd = parseInt(freezeTime);
        if (Date.now() < freezeEnd) {
          return freezeEnd;
        } else {
          localStorage.removeItem(freezeKey);
        }
      }
    } catch (error) {
      console.warn('Could not get freeze end time:', error);
    }
    return null;
  }

  private setFreeze(endpoint?: string): void {
    try {
      const freezeKey = this.getFreezeKey(endpoint);
      const freezeEnd = Date.now() + FREEZE_DURATION;
      localStorage.setItem(freezeKey, freezeEnd.toString());
      console.warn(`🚫 User frozen for ${FREEZE_DURATION / 60000} minutes due to rate limit exceeded`);
    } catch (error) {
      console.warn('Could not set freeze:', error);
    }
  }

  public canMakeRequest(endpoint?: string): boolean {
    // تحقق من التجميد أولاً
    if (this.isFrozen(endpoint)) {
      return false;
    }

    const role = this.getUserRole();
    const limit = RATE_LIMITS[role];
    const requests = this.getRequests(endpoint);

    // احسب الطلبات في النافذة الزمنية الكاملة
    const currentCount = requests.length;

    // إذا تجاوز الحد، ارفض
    if (currentCount >= limit) {
      return false;
    }

    return true;
  }

  public makeRequest(endpoint?: string): boolean {
    // تحقق من التجميد
    if (this.isFrozen(endpoint)) {
      return false;
    }

    const role = this.getUserRole();
    const limit = RATE_LIMITS[role];
    const requests = this.getRequests(endpoint);
    
    // احسب الطلبات في النافذة الزمنية الكاملة
    const currentCount = requests.length;
    
    // إذا تجاوز الحد، جمد المستخدم
    if (currentCount >= limit) {
      this.setFreeze(endpoint);
      return false;
    }

    // أضف الطلب
    this.addRequest(endpoint);
    return true;
  }

  public getStatus(endpoint?: string) {
    const role = this.getUserRole();
    const limit = RATE_LIMITS[role];
    const requests = this.getRequests(endpoint);
    const now = Date.now();
    
    // احسب متى ستنتهي النافذة الزمنية
    const oldestRequest = requests.length > 0 ? Math.min(...requests.map(r => r.timestamp)) : now;
    const resetTime = oldestRequest + WINDOW_SIZE;
    
    return {
      role,
      limit,
      current: requests.length,
      remaining: Math.max(0, limit - requests.length),
      resetTime,
      isFrozen: this.isFrozen(endpoint),
      freezeEndTime: this.getFreezeEndTime(endpoint),
    };
  }

  // تنظيف البيانات القديمة
  public cleanup(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      for (const key of keys) {
        if (key.startsWith('simple_rate_limit_')) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const requests = JSON.parse(data) as RequestRecord[];
              const validRequests = requests.filter(req => (now - req.timestamp) < WINDOW_SIZE);
              
              if (validRequests.length === 0) {
                localStorage.removeItem(key);
              } else if (validRequests.length !== requests.length) {
                localStorage.setItem(key, JSON.stringify(validRequests));
              }
            } catch (e) {
              // بيانات فاسدة، احذفها
              localStorage.removeItem(key);
            }
          }
        }
        
        // تنظيف التجميد المنتهي
        if (key.startsWith('simple_freeze_')) {
          const freezeTime = localStorage.getItem(key);
          if (freezeTime && parseInt(freezeTime) < now) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Could not cleanup rate limit data:', error);
    }
  }
}

// إنشاء instance واحد
export const simpleRateLimiter = new SimpleRateLimiter();

// تنظيف دوري كل 5 دقائق
if (typeof window !== 'undefined') {
  setInterval(() => {
    simpleRateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

// دوال مساعدة
export const canMakeRequest = (endpoint?: string): boolean => {
  return simpleRateLimiter.canMakeRequest(endpoint);
};

export const makeRequest = (endpoint?: string): boolean => {
  return simpleRateLimiter.makeRequest(endpoint);
};

export const getRequestStatus = (endpoint?: string) => {
  return simpleRateLimiter.getStatus(endpoint);
};

export const isFrozen = (endpoint?: string): boolean => {
  return simpleRateLimiter.isFrozen(endpoint);
};

export const getFreezeEndTime = (endpoint?: string): number | null => {
  return simpleRateLimiter.getFreezeEndTime(endpoint);
};
