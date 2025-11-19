import { getApiUrl } from '../config';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

class AdminService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse(response: Response): Promise<ApiResponse> {
    try {
      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data,
          message: data.message || 'Operation successful'
        };
      } else {
        return {
          success: false,
          error: data.error || data.message || 'Operation failed',
          data: data
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error or invalid response'
      };
    }
  }

  // User Management
  async getUsers(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl('admin/users/'), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch users' };
    }
  }

  async getUser(userId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`admin/users/${userId}/`), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch user' };
    }
  }

  async createUser(userData: any): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl('admin/users/'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to create user' };
    }
  }

  async updateUser(userId: number, userData: any): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`admin/users/${userId}/`), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to update user' };
    }
  }

  async deleteUser(userId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`admin/users/${userId}/`), {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to delete user' };
    }
  }

  async changeUserRole(userId: number, role: string): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`admin/users/${userId}/change_role/`), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ role }),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to change user role' };
    }
  }

  async toggleUserActive(userId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`admin/users/${userId}/toggle_active/`), {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to toggle user active status' };
    }
  }

  // Course Management
  async getCourses(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl('admin/courses/'), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch courses' };
    }
  }

  async getCourse(courseId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`admin/courses/${courseId}/`), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch course' };
    }
  }

  async createCourse(courseData: any): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl('admin/courses/'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(courseData),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to create course' };
    }
  }

  async updateCourse(courseId: number, courseData: any): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`admin/courses/${courseId}/`), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(courseData),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to update course' };
    }
  }

  async deleteCourse(courseId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`admin/courses/${courseId}/`), {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to delete course' };
    }
  }

  async archiveCourse(courseId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`admin/courses/${courseId}/archive/`), {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to archive course' };
    }
  }

  async forcePublishCourse(courseId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl(`admin/courses/${courseId}/force_publish/`), {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to force publish course' };
    }
  }

  // Monitoring
  async getMonitoring(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl('admin/monitoring/'), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch monitoring data' };
    }
  }

  async getSystemOverview(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl('admin/monitoring/overview/'), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch system overview' };
    }
  }

  async getUserAnalytics(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl('admin/monitoring/user_analytics/'), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch user analytics' };
    }
  }

  // Reports
  async getReports(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl('admin/reports/'), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch reports' };
    }
  }

  async getSystemReport(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl('admin/reports/system_report/'), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch system report' };
    }
  }

  // Settings
  async getSettings(): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl('admin/settings/'), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch settings' };
    }
  }

  async updateSettings(settingsData: any): Promise<ApiResponse> {
    try {
      const response = await fetch(getApiUrl('admin/settings/'), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(settingsData),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to update settings' };
    }
  }
}

export const adminService = new AdminService();
