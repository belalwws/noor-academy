/**
 * Batches API Service
 * Comprehensive API for batch management and batch resources
 * 
 * Features:
 * - Manage student groups within courses (individual: 1 student, group: up to 200 students)
 * - Upload and manage batch resources (files, materials)
 * - Download batch resources
 */

import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

// ==================== TYPES ====================

// -------- BATCH TYPES --------
export interface CreateBatchInput {
  course: string;
  name: string;
  type: 'individual' | 'group';
  status: 'active' | 'closed';
  max_students: number;
}

export interface UpdateBatchInput {
  name?: string;
  type?: 'individual' | 'group';
  status?: 'active' | 'closed';
  max_students?: number;
}

export interface Batch {
  id?: string;
  course: string;
  course_title?: string;
  name: string;
  type: 'individual' | 'group';
  status: 'active' | 'closed';
  max_students: number;
  students_count?: string | number;
  students?: BatchStudent[];
  teacher?: string;
  teacher_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BatchStudent {
  id: string;
  batch: string;
  batch_name?: string;
  student: string | number;
  student_name: string;
  student_email: string;
  status: 'active' | 'suspended' | 'completed' | 'withdrawn' | 'pending';
  added_by?: number | string;
  added_by_name?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  withdrawn_at?: string;
  notes?: string;
  joined_at?: string; // Legacy field
}

// -------- BATCH RESOURCE TYPES --------
export interface CreateBatchResourceInput {
  batch: string;
  title: string;
  description?: string;
  file: File | Blob;
  resource_type?: 'document' | 'video' | 'image' | 'audio' | 'other';
}

export interface UpdateBatchResourceInput {
  title?: string;
  description?: string;
  resource_type?: 'document' | 'video' | 'image' | 'audio' | 'other';
}

export interface BatchResource {
  id?: string;
  batch: string;
  title: string;
  description?: string;
  file_url?: string;
  file_size?: number;
  resource_type: 'document' | 'video' | 'image' | 'audio' | 'other';
  created_at?: string;
  updated_at?: string;
}

// ==================== API METHODS ====================

// -------- BATCHES API --------
export const batchesApi = {
  /**
   * Create a new batch
   * POST /batches/batches/
   */
  create: async (data: CreateBatchInput): Promise<Batch> => {
    try {
      const response = await apiClient.post<Batch>('/batches/batches/', data);
      
      // Check if response.data exists
      if (!response.data) {
        throw new Error('لم يتم إرجاع بيانات من الخادم بعد إنشاء المجموعة');
      }
      
      // Try to extract ID from Location header if not in response body
      let batchId = response.data?.id;
      if (!batchId && response.headers) {
        const locationHeader = response.headers.get('Location');
        if (locationHeader) {
          // Extract ID from Location header (e.g., /batches/batches/{id}/)
          const match = locationHeader.match(/\/batches\/batches\/([^/]+)\//);
          if (match && match[1]) {
            batchId = match[1];
            response.data.id = batchId;
          }
        }
      }
      
      // Ensure we have all required fields
      const batch: Batch = {
        ...response.data,
        id: batchId || response.data.id || '', // Use extracted ID or fallback
        course: response.data.course || data.course,
        name: response.data.name || data.name,
        type: response.data.type || data.type,
        status: response.data.status || data.status,
        max_students: response.data.max_students || data.max_students,
      };
      
      return batch;
    } catch (error: any) {
      // Re-throw with enhanced error info
      const enhancedError: any = new Error(error?.message || 'فشل في إنشاء المجموعة');
      enhancedError.data = error?.data;
      enhancedError.status = error?.status;
      enhancedError.response = error?.response;
      throw enhancedError;
    }
  },

  /**
   * List batches with optional filtering
   * GET /batches/batches/
   */
  list: async (params?: {
    course?: string;
    type?: 'individual' | 'group'; // Will be sent to backend, with client-side filtering as fallback
    status?: 'active' | 'closed';
    page?: number;
    page_size?: number;
    ordering?: string;
  }): Promise<{ results: Batch[]; count: number; next?: string; previous?: string }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.course) queryParams.append('course', params.course);
      // Try to send type parameter - if backend supports it, it will filter server-side
      // If not, we'll still filter client-side as fallback
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params?.ordering) queryParams.append('ordering', params.ordering);

      const queryString = queryParams.toString();
      const url = queryString 
        ? `/batches/batches/?${queryString}`
        : `/batches/batches/`;
      const response = await apiClient.get<{ results: Batch[]; count: number; next?: string; previous?: string }>(url);
      
      // Filter by type on client-side as fallback (in case backend doesn't support type parameter)
      // If backend already filtered by type, this will be a no-op
      let filteredResults = response.data.results;
      let filteredCount = response.data.count;
      
      if (params?.type) {
        // Double-check filtering in case backend doesn't support type parameter
        filteredResults = response.data.results.filter(batch => batch.type === params.type);
        filteredCount = filteredResults.length;
      }
      
      return {
        ...response.data,
        results: filteredResults,
        count: filteredCount
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a batch by ID
   * GET /batches/batches/{id}/
   */
  get: async (id: string): Promise<Batch> => {
    try {
      const response = await apiClient.get<Batch>(`/batches/batches/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a batch (full update)
   * PUT /batches/batches/{id}/
   */
  update: async (id: string, data: UpdateBatchInput): Promise<Batch> => {
    try {
      const response = await apiClient.put<Batch>(`/batches/batches/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Partially update a batch
   * PATCH /batches/batches/{id}/
   */
  partialUpdate: async (id: string, data: Partial<UpdateBatchInput>): Promise<Batch> => {
    try {
      const response = await apiClient.patch<Batch>(`/batches/batches/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a batch
   * DELETE /batches/batches/{id}/
   * Returns 204 No Content on success
   */
  delete: async (id: string): Promise<void> => {
    try {
      const response = await apiClient.delete(`/batches/batches/${id}/`);
      // 204 No Content means success - no body to parse
      if (response.status === 204 || response.status === 200) {
        return;
      }
    } catch (error: any) {
      // Re-throw with enhanced error info
      const enhancedError: any = new Error(error?.message || 'فشل في حذف المجموعة');
      enhancedError.data = error?.data;
      enhancedError.status = error?.status;
      enhancedError.response = error?.response;
      throw enhancedError;
    }
  },
};

// -------- BATCH STUDENTS API --------
export interface CreateBatchStudentInput {
  batch: string;
  student: string;
}

export interface UpdateBatchStudentInput {
  batch?: string;
  student?: string;
  status?: 'active' | 'suspended' | 'completed' | 'withdrawn';
}

export const batchStudentsApi = {
  /**
   * Add a student to a batch
   * POST /batches/batch-students/
   */
  create: async (data: CreateBatchStudentInput): Promise<BatchStudent> => {
    try {
      const response = await apiClient.post<BatchStudent>('/batches/batch-students/', data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * List batch students with optional filtering
   * GET /batches/batch-students/
   */
  list: async (params?: {
    batch?: string;
    student?: string;
    status?: 'active' | 'suspended' | 'completed' | 'withdrawn';
    ordering?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ results: BatchStudent[]; count: number; next?: string; previous?: string }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.batch) queryParams.append('batch', params.batch);
      if (params?.student) queryParams.append('student', params.student);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const queryString = queryParams.toString();
      const url = queryString 
        ? `/batches/batch-students/?${queryString}`
        : `/batches/batch-students/`;
      const response = await apiClient.get<{ results: BatchStudent[]; count: number; next?: string; previous?: string }>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a batch student by ID
   * GET /batches/batch-students/{id}/
   */
  get: async (id: string): Promise<BatchStudent> => {
    try {
      const response = await apiClient.get<BatchStudent>(`/batches/batch-students/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a batch student (full update)
   * PUT /batches/batch-students/{id}/
   */
  update: async (id: string, data: UpdateBatchStudentInput): Promise<BatchStudent> => {
    try {
      const response = await apiClient.put<BatchStudent>(`/batches/batch-students/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Partially update a batch student
   * PATCH /batches/batch-students/{id}/
   */
  partialUpdate: async (id: string, data: Partial<UpdateBatchStudentInput>): Promise<BatchStudent> => {
    try {
      const response = await apiClient.patch<BatchStudent>(`/batches/batch-students/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete (remove) a student from a batch
   * DELETE /batches/batch-students/{id}/
   */
  delete: async (id: string): Promise<void> => {
    try {
      const response = await apiClient.delete(`/batches/batch-students/${id}/`);
      // 204 No Content means success
      if (response.status === 204 || response.status === 200) {
        return;
      }
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Activate a student
   * POST /batches/batch-students/{id}/activate/
   */
  activate: async (id: string, data?: { notes?: string }): Promise<BatchStudent> => {
    try {
      const response = await apiClient.post<BatchStudent>(`/batches/batch-students/${id}/activate/`, data || {});
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Suspend a student
   * POST /batches/batch-students/{id}/suspend/
   */
  suspend: async (id: string, data?: { notes?: string }): Promise<BatchStudent> => {
    try {
      const response = await apiClient.post<BatchStudent>(`/batches/batch-students/${id}/suspend/`, data || {});
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Complete a student
   * POST /batches/batch-students/{id}/complete/
   */
  complete: async (id: string, data?: { notes?: string }): Promise<BatchStudent> => {
    try {
      const response = await apiClient.post<BatchStudent>(`/batches/batch-students/${id}/complete/`, data || {});
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Withdraw a student
   * POST /batches/batch-students/{id}/withdraw/
   */
  withdraw: async (id: string, data?: { notes?: string }): Promise<BatchStudent> => {
    try {
      const response = await apiClient.post<BatchStudent>(`/batches/batch-students/${id}/withdraw/`, data || {});
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// -------- BATCH RESOURCES API --------
export const batchResourcesApi = {
  /**
   * Upload a batch resource (file, document, video, etc.)
   * POST /batches/batch-resources/
   */
  create: async (data: CreateBatchResourceInput): Promise<BatchResource> => {
    try {
      const formData = new FormData();
      formData.append('batch', data.batch);
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.resource_type) formData.append('resource_type', data.resource_type);
      formData.append('file', data.file);

      const response = await apiClient.post<BatchResource>('/batches/batch-resources/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * List batch resources with optional filtering
   * GET /batches/batch-resources/
   */
  list: async (params?: {
    batch?: string;
    resource_type?: 'document' | 'video' | 'image' | 'audio' | 'other';
    page?: number;
    page_size?: number;
  }): Promise<{ results: BatchResource[]; count: number; next?: string; previous?: string }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.batch) queryParams.append('batch', params.batch);
      if (params?.resource_type) queryParams.append('resource_type', params.resource_type);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const url = `/batches/batch-resources/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<{ results: BatchResource[]; count: number; next?: string; previous?: string }>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get batch resources by batch ID
   * GET /batches/batch-resources/by_batch/
   */
  getByBatch: async (batchId: string): Promise<{ results: BatchResource[] }> => {
    try {
      const response = await apiClient.get<{ results: BatchResource[] }>(`/batches/batch-resources/by_batch/?batch=${batchId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a batch resource by ID
   * GET /batches/batch-resources/{id}/
   */
  get: async (id: string): Promise<BatchResource> => {
    try {
      const response = await apiClient.get<BatchResource>(`/batches/batch-resources/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a batch resource (full update)
   * PUT /batches/batch-resources/{id}/
   */
  update: async (id: string, data: UpdateBatchResourceInput): Promise<BatchResource> => {
    try {
      const response = await apiClient.put<BatchResource>(`/batches/batch-resources/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Partially update a batch resource
   * PATCH /batches/batch-resources/{id}/
   */
  partialUpdate: async (id: string, data: Partial<UpdateBatchResourceInput>): Promise<BatchResource> => {
    try {
      const response = await apiClient.patch<BatchResource>(`/batches/batch-resources/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a batch resource
   * DELETE /batches/batch-resources/{id}/
   */
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/batches/batch-resources/${id}/`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Download a batch resource
   * GET /batches/batch-resources/{id}/download/
   */
  download: async (id: string): Promise<Blob> => {
    try {
      logger.debug('Downloading batch resource', { id });
      
      // For blob downloads, we need to use fetch directly with proper headers
      // apiClient doesn't handle blob responses yet, so we'll use a workaround
      const response = await apiClient.get(`/batches/batch-resources/${id}/download/`, {
        responseType: 'blob'
      } as any);
      
      if (response.success === false) {
        throw new Error(response.error || `Failed to download batch resource: ${response.status}`);
      }
      
      // If response.data is already a Blob, return it
      if (response.data instanceof Blob) {
        return response.data;
      }
      
      // Otherwise, we need to fetch it directly
      // This is a workaround until apiClient supports blob responses
      const { getAuthToken } = await import('../auth');
      const { getBaseUrl } = await import('../config');
      const token = await getAuthToken();
      
      const fetchResponse = await fetch(`${getBaseUrl()}/batches/batch-resources/${id}/download/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!fetchResponse.ok) {
        throw new Error(`Failed to download batch resource: ${fetchResponse.status}`);
      }
      
      return await fetchResponse.blob();
    } catch (error: any) {
      logger.error('Failed to download batch resource:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحميل المورد');
    }
  },
};
