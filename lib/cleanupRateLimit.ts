'use client';

// تنظيف جميع بيانات Rate Limiting من localStorage
export function cleanupAllRateLimitData() {
  if (typeof window === 'undefined') return;
  
  try {
    const keys = Object.keys(localStorage);
    let cleanedCount = 0;
    
    for (const key of keys) {
      if (
        key.startsWith('rate_limit_') ||
        key.startsWith('simple_rate_limit_') ||
        key.startsWith('simple_freeze_') ||
        key.startsWith('ultra_rate_') ||
        key.startsWith('freeze_')
      ) {
        localStorage.removeItem(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 تم تنظيف ${cleanedCount} عنصر من بيانات Rate Limiting`);
    }
  } catch (error) {
    console.warn('خطأ في تنظيف بيانات Rate Limiting:', error);
  }
}

// تشغيل التنظيف عند تحميل الملف
if (typeof window !== 'undefined') {
  cleanupAllRateLimitData();
}
