'use client';

// نظام Rate Limiting بسيط جداً - بدون تعقيدات
export type UserRole = 'anonymous' | 'student' | 'teacher' | 'supervisor' | 'general_supervisor' | 'academic_supervisor' | 'admin';

// حدود الطلبات لكل دور (طلبات كل 10 دقائق)
const RATE_LIMITS: Record<UserRole, number> = {
  anonymous: 50,
  student: 150,
  teacher: 300,
  supervisor: 800,
  general_supervisor: 800,
  academic_supervisor: 800,
  admin: 1500,
};

// نافذة زمنية 10 دقائق
const WINDOW_SIZE = 10 * 60 * 1000;

class UltraSimpleRateLimiter {
  private getStorageKey(endpoint?: string): string {
    return `ultra_rate_${endpoint || 'default'}`;
  }

  private getUserRole(): UserRole {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.role || 'anonymous';
      }
    } catch (error) {
      // تجاهل الأخطاء
    }
    return 'anonymous';
  }

  private getRequestCount(endpoint?: string): number {
    try {
      const key = this.getStorageKey(endpoint);
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        const now = Date.now();
        
        // إذا انتهت النافذة الزمنية، ابدأ من جديد
        if (now - parsed.startTime > WINDOW_SIZE) {
          localStorage.removeItem(key);
          return 0;
        }
        
        return parsed.count || 0;
      }
    } catch (error) {
      // تجاهل الأخطاء
    }
    return 0;
  }

  private incrementCount(endpoint?: string): void {
    try {
      const key = this.getStorageKey(endpoint);
      const now = Date.now();
      const currentCount = this.getRequestCount(endpoint);
      
      const data = {
        count: currentCount + 1,
        startTime: currentCount === 0 ? now : this.getStartTime(endpoint) || now,
        lastRequest: now
      };
      
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      // تجاهل الأخطاء
    }
  }

  private getStartTime(endpoint?: string): number | null {
    try {
      const key = this.getStorageKey(endpoint);
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.startTime || null;
      }
    } catch (error) {
      // تجاهل الأخطاء
    }
    return null;
  }

  public canMakeRequest(endpoint?: string): boolean {
    const role = this.getUserRole();
    const limit = RATE_LIMITS[role];
    const currentCount = this.getRequestCount(endpoint);
    
    return currentCount < limit;
  }

  public makeRequest(endpoint?: string): boolean {
    if (!this.canMakeRequest(endpoint)) {
      return false;
    }
    
    this.incrementCount(endpoint);
    return true;
  }

  public getStatus(endpoint?: string) {
    const role = this.getUserRole();
    const limit = RATE_LIMITS[role];
    const currentCount = this.getRequestCount(endpoint);
    const startTime = this.getStartTime(endpoint);
    
    let resetTime = null;
    if (startTime) {
      resetTime = startTime + WINDOW_SIZE;
    }
    
    return {
      role,
      limit,
      current: currentCount,
      remaining: Math.max(0, limit - currentCount),
      resetTime,
      windowSize: WINDOW_SIZE,
    };
  }

  public cleanup(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      for (const key of keys) {
        if (key.startsWith('ultra_rate_')) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              if (now - parsed.startTime > WINDOW_SIZE) {
                localStorage.removeItem(key);
              }
            } catch (e) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      // تجاهل الأخطاء
    }
  }
}

// إنشاء instance واحد
export const ultraSimpleRateLimiter = new UltraSimpleRateLimiter();

// تنظيف دوري كل 10 دقائق
if (typeof window !== 'undefined') {
  setInterval(() => {
    ultraSimpleRateLimiter.cleanup();
  }, 10 * 60 * 1000);
}

// دوال مساعدة
export const canMakeRequest = (endpoint?: string): boolean => {
  return ultraSimpleRateLimiter.canMakeRequest(endpoint);
};

export const makeRequest = (endpoint?: string): boolean => {
  return ultraSimpleRateLimiter.makeRequest(endpoint);
};

export const getRequestStatus = (endpoint?: string) => {
  return ultraSimpleRateLimiter.getStatus(endpoint);
};

// دوال فارغة للتوافق
export const isFrozen = (endpoint?: string): boolean => {
  return false; // لا تجميد في النظام البسيط
};

export const getFreezeEndTime = (endpoint?: string): number | null => {
  return null; // لا تجميد في النظام البسيط
};
