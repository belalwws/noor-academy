# API Client Documentation

## نظرة عامة

تم توحيد جميع API Clients في مشروع واحد موحد (`apiClient.ts`) مع الحفاظ على backward compatibility للكود القديم.

## البنية

### API Clients

1. **`apiClient.ts`** - Unified API Client (الأفضل - استخدمه في الكود الجديد)
   - Unified response format
   - Error handling موحد
   - Retry logic
   - Request/Response interceptors
   - Logger integration
   - Arabic error messages

2. **`api.ts`** - Legacy Wrapper (للتوافق مع الكود القديم)
   - Wrapper حول apiClient
   - يحافظ على نفس interface
   - Deprecation warnings في development

3. **`simpleAPI.ts`** - Dev/Testing Utility
   - للاختبارات فقط
   - يستخدم apiClient داخلياً
   - Dev-only functions

## الاستخدام

### الكود الجديد - استخدم apiClient مباشرة

```typescript
import { apiClient } from '@/lib/apiClient';

// GET request
const response = await apiClient.get('/courses/');
if (response.success !== false) {
  console.log(response.data);
}

// POST request
const newCourse = await apiClient.post('/courses/', {
  title: 'New Course',
  description: 'Course description'
});

// PUT request
const updated = await apiClient.put(`/courses/${id}/`, {
  title: 'Updated Title'
});

// PATCH request
const patched = await apiClient.patch(`/courses/${id}/`, {
  title: 'Patched Title'
});

// DELETE request
await apiClient.delete(`/courses/${id}/`);
```

### الكود القديم - apiService (backward compatible)

```typescript
import apiService from '@/lib/api';

// نفس interface - يعمل بدون تغيير
const response = await apiService.get('/courses/');
if (response.success) {
  console.log(response.data);
}
```

## Response Format

### apiClient Response

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  success?: boolean;
  error?: string;
}
```

### apiService Response (Legacy)

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: Record<string, any>;
  status?: number;
  results?: T[];  // For paginated responses
  count?: number;
  next?: string | null;
  previous?: string | null;
}
```

## Error Handling

### Unified Error Handler

جميع الأخطاء تمر عبر `errorHandler` الذي يوفر:
- Error types (Network, Validation, Authentication, etc.)
- Arabic error messages للمستخدم
- Technical messages للمطور
- Error logging

```typescript
import { errorHandler, ErrorType, ErrorSeverity } from '@/lib/utils/errorHandler';

try {
  await apiClient.get('/endpoint');
} catch (error: any) {
  // error.appError.userMessage - رسالة للمستخدم بالعربية
  // error.appError.devMessage - رسالة للمطور
  // error.appError.type - نوع الخطأ
}
```

## Logger

Logger utility للـ dev-only logging:

```typescript
import { logger } from '@/lib/utils/logger';

logger.log('Info message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
logger.debug('Debug message'); // Only if NEXT_PUBLIC_DEBUG=true

// API-specific logging
logger.request('GET', '/endpoint', data);
logger.response('GET', '/endpoint', 200, data);
logger.apiError('GET', '/endpoint', error);
```

## Retry Logic

apiClient يتضمن retry logic تلقائياً:
- Retries على network errors
- Retries على 5xx errors
- Exponential backoff
- Max 3 retries

## Interceptors

يمكن إضافة interceptors للـ requests/responses:

```typescript
// Request interceptor
apiClient.addRequestInterceptor((config) => {
  // Modify request config
  return config;
});

// Response interceptor
apiClient.addResponseInterceptor((response) => {
  // Modify response
  return response;
});

// Error interceptor
apiClient.addErrorInterceptor((error) => {
  // Handle error
  return error;
});
```

## Migration Guide

### من apiService إلى apiClient

```typescript
// قبل
import apiService from '@/lib/api';
const response = await apiService.get('/courses/');
if (response.success) {
  console.log(response.data);
}

// بعد
import { apiClient } from '@/lib/apiClient';
const response = await apiClient.get('/courses/');
if (response.success !== false) {
  console.log(response.data);
}
```

### من fetch مباشر إلى apiClient

```typescript
// قبل
const response = await fetch(`${API_URL}/courses/`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// بعد
const response = await apiClient.get('/courses/');
const data = response.data;
```

## Configuration

### Base URL

يتم الحصول على base URL من config:

```typescript
import { getBaseUrl } from '@/lib/config';

const baseUrl = getBaseUrl(); // من NEXT_PUBLIC_API_URL
```

### Timeout

Default timeout: 30 seconds
يمكن تغييره في apiClient config

## Best Practices

1. **استخدم apiClient في الكود الجديد**
   ```typescript
   import { apiClient } from '@/lib/apiClient';
   ```

2. **استخدم error handling موحد**
   ```typescript
   try {
     const response = await apiClient.get('/endpoint');
     // Handle success
   } catch (error: any) {
     // error.appError.userMessage للمستخدم
     // error.appError.devMessage للمطور
   }
   ```

3. **استخدم logger بدلاً من console.log**
   ```typescript
   import { logger } from '@/lib/utils/logger';
   logger.debug('Debug message');
   ```

4. **لا تستخدم fetch مباشر**
   - استخدم apiClient دائماً
   - يحصل على token refresh تلقائياً
   - error handling موحد

5. **استخدم TypeScript types**
   ```typescript
   interface Course {
     id: string;
     title: string;
   }
   
   const response = await apiClient.get<Course[]>('/courses/');
   const courses: Course[] = response.data;
   ```

## API Services في lib/api/

جميع API services في `lib/api/` يجب أن تستخدم `apiClient` بدلاً من fetch مباشر:

```typescript
// قبل
private async makeRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${this.getApiUrl()}${endpoint}`, {
    headers: this.getAuthHeaders()
  });
  // ...
}

// بعد
import { apiClient } from '../apiClient';

private async makeRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await apiClient.get<T>(endpoint);
  return {
    success: true,
    data: response.data,
    status: response.status
  };
}
```

## Troubleshooting

### Token Refresh Issues

apiClient يتعامل مع token refresh تلقائياً. إذا واجهت مشاكل:
1. تحقق من أن refresh token موجود في localStorage
2. تحقق من أن authService يعمل بشكل صحيح
3. راجع logs في development mode

### Network Errors

apiClient يتضمن retry logic للـ network errors. إذا استمرت المشاكل:
1. تحقق من الاتصال بالإنترنت
2. تحقق من أن API server يعمل
3. راجع error messages في logger

### CORS Issues

إذا واجهت CORS errors:
1. تحقق من إعدادات CORS في backend
2. تأكد من أن credentials: 'include' موجود
3. تحقق من أن headers صحيحة

## Examples

### Example 1: Get Courses

```typescript
import { apiClient } from '@/lib/apiClient';

async function getCourses() {
  try {
    const response = await apiClient.get('/courses/');
    if (response.success !== false) {
      return response.data;
    }
  } catch (error: any) {
    console.error('Error:', error.appError?.userMessage);
    throw error;
  }
}
```

### Example 2: Create Course

```typescript
import { apiClient } from '@/lib/apiClient';

async function createCourse(courseData: { title: string; description: string }) {
  try {
    const response = await apiClient.post('/courses/', courseData);
    if (response.success !== false) {
      return response.data;
    }
  } catch (error: any) {
    console.error('Error:', error.appError?.userMessage);
    throw error;
  }
}
```

### Example 3: Update Course

```typescript
import { apiClient } from '@/lib/apiClient';

async function updateCourse(id: string, courseData: Partial<Course>) {
  try {
    const response = await apiClient.patch(`/courses/${id}/`, courseData);
    if (response.success !== false) {
      return response.data;
    }
  } catch (error: any) {
    console.error('Error:', error.appError?.userMessage);
    throw error;
  }
}
```

### Example 4: Delete Course

```typescript
import { apiClient } from '@/lib/apiClient';

async function deleteCourse(id: string) {
  try {
    await apiClient.delete(`/courses/${id}/`);
    return true;
  } catch (error: any) {
    console.error('Error:', error.appError?.userMessage);
    throw error;
  }
}
```

## Summary

- ✅ **apiClient** - Unified API Client (استخدمه في الكود الجديد)
- ✅ **api.ts** - Legacy wrapper (للتوافق مع الكود القديم)
- ✅ **simpleAPI.ts** - Dev/testing utility
- ✅ **Error handling** موحد مع Arabic messages
- ✅ **Logger** للـ dev-only logging
- ✅ **Retry logic** تلقائي
- ✅ **Interceptors** للـ customization
- ✅ **Backward compatibility** محفوظة

