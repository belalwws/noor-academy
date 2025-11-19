import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

// Types for Notes
export interface PrivateNote {
  id: string;
  course: {
    id: string;
    title: string;
  };
  teacher: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
      get_full_name: string;
    };
  };
  student: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
      get_full_name: string;
    };
  };
  note_type: 'performance' | 'behavior' | 'progress' | 'reminder' | 'general';
  title: string;
  content: string;
  is_active: boolean;
  is_important: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseNote {
  id: string;
  course: {
    id: string;
    title: string;
  };
  teacher: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
      get_full_name: string;
    };
  };
  note_type: 'announcement' | 'reminder' | 'assignment' | 'schedule' | 'general';
  title: string;
  content: string;
  is_active: boolean;
  is_important: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePrivateNoteData {
  course: string;
  student: string;
  note_type: string;
  title: string;
  content: string;
  is_important?: boolean;
}

export interface CreateCourseNoteData {
  course_id?: string;
  course?: string;
  note_type: string;
  title: string;
  content: string;
  is_important?: boolean;
  is_pinned?: boolean;
}

// Notes API functions
export const notesAPI = {
  // Private Notes
  getPrivateNotes: async (): Promise<PrivateNote[]> => {
    const response = await apiClient.get('/notes/private/');
    const data = response.data as any;
    // Unwrap paginated results if present
    if (Array.isArray(data)) return data as PrivateNote[];
    if (Array.isArray(data?.results)) return data.results as PrivateNote[];
    if (Array.isArray(data?.data)) return data.data as PrivateNote[];
    return [];
  },

  getPrivateNote: async (id: string): Promise<PrivateNote> => {
    const response = await apiClient.get(`/notes/private/${id}/`);
    return response.data;
  },

  createPrivateNote: async (data: CreatePrivateNoteData): Promise<PrivateNote> => {
    const response = await apiClient.post('/notes/private/', data);
    return response.data;
  },

  updatePrivateNote: async (id: string, data: Partial<CreatePrivateNoteData>): Promise<PrivateNote> => {
    const response = await apiClient.put(`/notes/private/${id}/`, data);
    return response.data;
  },

  partialUpdatePrivateNote: async (id: string, data: Partial<CreatePrivateNoteData>): Promise<PrivateNote> => {
    const response = await apiClient.patch(`/notes/private/${id}/`, data);
    return response.data;
  },

  deletePrivateNote: async (id: string): Promise<void> => {
    await apiClient.delete(`/notes/private/${id}/`);
  },

  // Course Notes
  getCourseNotes: async (courseId?: string): Promise<{ success: boolean; data: CourseNote[] }> => {
    try {
      const url = courseId ? `/notes/course/by_course/?course_id=${courseId}` : '/notes/course/';
      const response = await apiClient.get(url);
      return { success: true, data: response.data || [] };
    } catch (error: any) {
      logger.error('Failed to fetch course notes:', error);
      return { success: false, data: [] };
    }
  },

  getCourseNote: async (id: string): Promise<CourseNote> => {
    const response = await apiClient.get(`/notes/course/${id}/`);
    return response.data;
  },

  createCourseNote: async (data: CreateCourseNoteData): Promise<{ success: boolean; data?: CourseNote }> => {
    try {
      const response = await apiClient.post('/notes/course/', data);
      return { success: true, data: response.data };
    } catch (error: any) {
      logger.error('Failed to create course note:', error);
      return { success: false };
    }
  },

  updateCourseNote: async (id: string, data: Partial<CreateCourseNoteData>): Promise<CourseNote> => {
    const response = await apiClient.put(`/notes/course/${id}/`, data);
    return response.data;
  },

  partialUpdateCourseNote: async (id: string, data: Partial<CreateCourseNoteData>): Promise<CourseNote> => {
    const response = await apiClient.patch(`/notes/course/${id}/`, data);
    return response.data;
  },

  deleteCourseNote: async (id: string): Promise<void> => {
    await apiClient.delete(`/notes/course/${id}/`);
  },

  toggleCourseNotePin: async (id: string): Promise<{ message: string; is_pinned: boolean }> => {
    const response = await apiClient.post(`/notes/course/${id}/toggle_pin/`);
    return response.data;
  },

  getCourseNotesByCourse: async (courseId: string): Promise<CourseNote[]> => {
    const response = await apiClient.get(`/notes/course/by_course/?course_id=${courseId}`);
    return response.data;
  },
};

// Announcement Notes API (Batch-level announcements)
export interface AnnouncementNote {
  id: string;
  batch: string;
  batch_name: string;
  course_title: string;
  title: string;
  content: string;
  creator_name: string;
  creator_type: 'teacher' | 'student';
  is_important: boolean;
  is_pinned: boolean;
  has_attachment: boolean;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  attachment_size?: number;
  visible_students_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementNoteData {
  batch: string;
  title: string;
  content: string;
  is_important?: boolean;
  is_pinned?: boolean;
  attachment_file?: File;
}

// Performance Notes API (Teacher-Student Private Notes within Batch)
export interface PerformanceNote {
  id: string;
  batch: string;
  teacher: number;
  student: string;
  title: string;
  content: string;
  attachment_url?: string;
  attachment_type?: 'image' | 'pdf' | 'document';
  attachment_name?: string;
  attachment_size?: number;
  is_active: boolean;
  is_important: boolean;
  created_at: string;
  updated_at: string;
  teacher_name: string;
  student_name: string;
  batch_name: string;
  course_title: string;
  has_attachment?: string;
}

export interface PerformanceNoteListItem {
  id: string;
  title: string;
  is_important: boolean;
  has_attachment: string;
  created_at: string;
  teacher_name: string;
  student_name: string;
  batch_name: string;
  course_title: string;
}

export interface CreatePerformanceNoteData {
  batch: string;
  student: string;
  title: string;
  content: string;
  is_important?: boolean;
  attachment_file?: File;
}

export interface UpdatePerformanceNoteData {
  batch?: string;
  teacher?: number;
  student?: string;
  title?: string;
  content?: string;
  attachment_file?: File;
  is_active?: boolean;
  is_important?: boolean;
}

// Performance Notes API
export const performanceNotesAPI = {
  // List performance notes (filtered by batch_id and/or student_id)
  list: async (params?: { 
    batch_id?: string; 
    student_id?: string;
    page?: number;
  }): Promise<{ 
    count: number;
    next: string | null;
    previous: string | null;
    results: PerformanceNoteListItem[];
  }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.batch_id) {
        queryParams.append('batch_id', params.batch_id);
      }
      if (params?.student_id) {
        queryParams.append('student_id', params.student_id);
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      const url = queryParams.toString() 
        ? `/notes/performance/?${queryParams.toString()}`
        : '/notes/performance/';
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch performance notes:', error);
      return { count: 0, next: null, previous: null, results: [] };
    }
  },

  // Get single performance note with full details
  get: async (id: string): Promise<PerformanceNote> => {
    const response = await apiClient.get(`/notes/performance/${id}/`);
    return response.data;
  },

  // Create performance note
  create: async (data: CreatePerformanceNoteData): Promise<PerformanceNote> => {
    const formData = new FormData();
    formData.append('batch', data.batch);
    formData.append('student', data.student);
    formData.append('title', data.title);
    formData.append('content', data.content);
    
    if (data.is_important !== undefined) {
      formData.append('is_important', data.is_important.toString());
    }
    
    if (data.attachment_file) {
      formData.append('attachment_file', data.attachment_file);
    }
    
    const response = await apiClient.post('/notes/performance/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update performance note (PUT)
  update: async (id: string, data: UpdatePerformanceNoteData): Promise<PerformanceNote> => {
    const formData = new FormData();
    
    if (data.batch) formData.append('batch', data.batch);
    if (data.teacher !== undefined) formData.append('teacher', data.teacher.toString());
    if (data.student) formData.append('student', data.student);
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active.toString());
    }
    if (data.is_important !== undefined) {
      formData.append('is_important', data.is_important.toString());
    }
    if (data.attachment_file) {
      formData.append('attachment_file', data.attachment_file);
    }
    
    const response = await apiClient.put(`/notes/performance/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Partial update performance note (PATCH)
  partialUpdate: async (id: string, data: Partial<UpdatePerformanceNoteData>): Promise<PerformanceNote> => {
    const formData = new FormData();
    
    if (data.batch) formData.append('batch', data.batch);
    if (data.teacher !== undefined) formData.append('teacher', data.teacher.toString());
    if (data.student) formData.append('student', data.student);
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active.toString());
    }
    if (data.is_important !== undefined) {
      formData.append('is_important', data.is_important.toString());
    }
    if (data.attachment_file) {
      formData.append('attachment_file', data.attachment_file);
    }
    
    const response = await apiClient.patch(`/notes/performance/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete performance note (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notes/performance/${id}/`);
  },
};

export const announcementNotesAPI = {
  // List announcement notes (filtered by batch_id if provided)
  list: async (params?: { batch_id?: string }): Promise<AnnouncementNote[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.batch_id) {
        queryParams.append('batch_id', params.batch_id);
      }
      const url = queryParams.toString() 
        ? `/notes/announcement/?${queryParams.toString()}`
        : '/notes/announcement/';
      const response = await apiClient.get(url);
      const data = response.data as any;
      // Unwrap paginated results if present
      if (Array.isArray(data)) return data as AnnouncementNote[];
      if (Array.isArray(data?.results)) return data.results as AnnouncementNote[];
      if (Array.isArray(data?.data)) return data.data as AnnouncementNote[];
      return [];
    } catch (error: any) {
      logger.error('Failed to fetch announcement notes:', error);
      return [];
    }
  },

  // Get single announcement note
  get: async (id: string): Promise<AnnouncementNote> => {
    const response = await apiClient.get(`/notes/announcement/${id}/`);
    return response.data;
  },

  // Create announcement note
  create: async (data: CreateAnnouncementNoteData): Promise<AnnouncementNote> => {
    // Validate required fields
    if (!data.batch || !data.title) {
      throw new Error('Batch and title are required');
    }
    
    const formData = new FormData();
    formData.append('batch', data.batch);
    formData.append('title', data.title);
    
    // Ensure content is always sent - use empty string if undefined or null
    const contentValue = data.content ?? '';
    formData.append('content', contentValue);
    
    if (data.is_important !== undefined) {
      formData.append('is_important', data.is_important.toString());
    }
    if (data.is_pinned !== undefined) {
      formData.append('is_pinned', data.is_pinned.toString());
    }
    if (data.attachment_file) {
      formData.append('attachment_file', data.attachment_file);
    }
    
    const response = await apiClient.post('/notes/announcement/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Update announcement note
  update: async (id: string, data: Partial<CreateAnnouncementNoteData>): Promise<AnnouncementNote> => {
    const formData = new FormData();
    if (data.batch) formData.append('batch', data.batch);
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    if (data.is_important !== undefined) {
      formData.append('is_important', data.is_important.toString());
    }
    if (data.is_pinned !== undefined) {
      formData.append('is_pinned', data.is_pinned.toString());
    }
    if (data.attachment_file) {
      formData.append('attachment_file', data.attachment_file);
    }
    
    const response = await apiClient.put(`/notes/announcement/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Partial update announcement note
  partialUpdate: async (id: string, data: Partial<CreateAnnouncementNoteData>): Promise<AnnouncementNote> => {
    const formData = new FormData();
    if (data.batch) formData.append('batch', data.batch);
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    if (data.is_important !== undefined) {
      formData.append('is_important', data.is_important.toString());
    }
    if (data.is_pinned !== undefined) {
      formData.append('is_pinned', data.is_pinned.toString());
    }
    if (data.attachment_file) {
      formData.append('attachment_file', data.attachment_file);
    }
    
    const response = await apiClient.patch(`/notes/announcement/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete announcement note
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notes/announcement/${id}/`);
  },

  // Toggle pin status (teacher only)
  togglePin: async (id: string): Promise<{ message: string; is_pinned: boolean }> => {
    const response = await apiClient.post(`/notes/announcement/${id}/toggle_pin/`);
    return response.data;
  },

  // Get announcement notes by batch
  getByBatch: async (batchId: string): Promise<AnnouncementNote[]> => {
    try {
      const response = await apiClient.get(`/notes/announcement/by_batch/?batch_id=${batchId}`);
      const data = response.data as any;
      if (Array.isArray(data)) return data as AnnouncementNote[];
      if (Array.isArray(data?.results)) return data.results as AnnouncementNote[];
      if (Array.isArray(data?.data)) return data.data as AnnouncementNote[];
      return [];
    } catch (error: any) {
      logger.error('Failed to fetch announcement notes by batch:', error);
      return [];
    }
  },
};