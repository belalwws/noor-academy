/**
 * Interactive Games API Service
 * Handles all interactive game-related API calls using H5P
 */

import { apiClient } from '../apiClient';
import { logger } from '../utils/logger';

// ==================== TYPES ====================

export interface InteractiveGame {
  id: string;
  title: string;
  description: string;
  h5p_content: any; // JSON structure for H5P content
  h5p_library: string;
  teacher: number;
  teacher_name: string;
  teacher_email: string;
  status: 'pending' | 'approved' | 'rejected';
  approval_status: string;
  approval_status_display: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  topic?: string | null;
  topic_display?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  difficulty_level_display?: string;
  has_timer?: boolean;
  time_limit?: number | null; // in seconds
  question_time_limit?: number | null; // Time limit per question in seconds
  play_count: number;
  average_score: number | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateInteractiveGameInput {
  title: string;
  description: string;
  h5p_content: any;
  h5p_library: string;
  topic?: string | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  has_timer?: boolean;
  time_limit?: number | null; // in seconds
  question_time_limit?: number | null; // Time limit per question in seconds
}

export interface UpdateInteractiveGameInput extends Partial<CreateInteractiveGameInput> {}

export interface GamePlaySession {
  id: string;
  game: string;
  game_title: string;
  student: string;
  student_name: string;
  score: number | null;
  max_score: number | null;
  score_percentage?: number | null;
  completion_percentage: number;
  started_at: string;
  completed_at: string | null;
}

export interface PlayGameResponse {
  session_id: string;
  game: InteractiveGame;
  message: string;
}

export interface CompleteSessionInput {
  session_id: string;
  score?: number | null;
  max_score?: number | null;
  completion_percentage: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ==================== API SERVICE ====================

class InteractiveGamesApiService {
  /**
   * List interactive games
   * GET /interactive-games/games/
   * @param params Query parameters
   * @param requireAuth Whether authentication is required (default: true)
   */
  async list(params?: {
    status?: 'pending' | 'approved' | 'rejected';
    difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
    search?: string;
    ordering?: string;
  }, requireAuth: boolean = true): Promise<PaginatedResponse<InteractiveGame>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.difficulty_level) queryParams.append('difficulty_level', params.difficulty_level);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      
      const queryString = queryParams.toString();
      const endpoint = `/interactive-games/games/${queryString ? `?${queryString}` : ''}`;
      
      logger.debug('Listing interactive games', { params, requireAuth });
      
      const response = await apiClient.get<PaginatedResponse<InteractiveGame>>(endpoint);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب الألعاب التفاعلية');
      }
      
      return response.data as PaginatedResponse<InteractiveGame>;
    } catch (error: any) {
      logger.error('Failed to list interactive games:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب الألعاب التفاعلية');
    }
  }

  /**
   * Get single game
   * GET /interactive-games/games/{id}/
   * @param id Game ID
   * @param requireAuth Whether authentication is required (default: true)
   */
  async get(id: string, requireAuth: boolean = true): Promise<InteractiveGame> {
    try {
      logger.debug('Getting interactive game', { id, requireAuth });
      
      const response = await apiClient.get<InteractiveGame>(`/interactive-games/games/${id}/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب اللعبة التفاعلية');
      }
      
      return response.data as InteractiveGame;
    } catch (error: any) {
      logger.error('Failed to get interactive game:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب اللعبة التفاعلية');
    }
  }

  /**
   * Create new game
   * POST /interactive-games/games/
   */
  async create(data: CreateInteractiveGameInput): Promise<InteractiveGame> {
    try {
      logger.debug('Creating interactive game', { data });
      
      const response = await apiClient.post<InteractiveGame>('/interactive-games/games/', data);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في إنشاء اللعبة التفاعلية');
      }
      
      return response.data as InteractiveGame;
    } catch (error: any) {
      logger.error('Failed to create interactive game:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إنشاء اللعبة التفاعلية');
    }
  }

  /**
   * Update game
   * PUT /interactive-games/games/{id}/
   */
  async update(id: string, data: UpdateInteractiveGameInput): Promise<InteractiveGame> {
    try {
      logger.debug('Updating interactive game', { id, data });
      
      const response = await apiClient.put<InteractiveGame>(`/interactive-games/games/${id}/`, data);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في تحديث اللعبة التفاعلية');
      }
      
      return response.data as InteractiveGame;
    } catch (error: any) {
      logger.error('Failed to update interactive game:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحديث اللعبة التفاعلية');
    }
  }

  /**
   * Partial update game
   * PATCH /interactive-games/games/{id}/
   */
  async partialUpdate(id: string, data: UpdateInteractiveGameInput): Promise<InteractiveGame> {
    try {
      logger.debug('Partially updating interactive game', { id, data });
      
      const response = await apiClient.patch<InteractiveGame>(`/interactive-games/games/${id}/`, data);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في تحديث اللعبة التفاعلية');
      }
      
      return response.data as InteractiveGame;
    } catch (error: any) {
      logger.error('Failed to partially update interactive game:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في تحديث اللعبة التفاعلية');
    }
  }

  /**
   * Delete game
   * DELETE /interactive-games/games/{id}/
   */
  async delete(id: string): Promise<void> {
    try {
      logger.debug('Deleting interactive game', { id });
      
      const response = await apiClient.delete(`/interactive-games/games/${id}/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في حذف اللعبة التفاعلية');
      }
    } catch (error: any) {
      logger.error('Failed to delete interactive game:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في حذف اللعبة التفاعلية');
    }
  }

  /**
   * Approve game (General Supervisor only)
   * POST /interactive-games/games/{id}/approve/
   */
  async approve(id: string): Promise<{ message: string; game: InteractiveGame }> {
    try {
      logger.debug('Approving interactive game', { id });
      
      const response = await apiClient.post<{ message: string; game: InteractiveGame }>(`/interactive-games/games/${id}/approve/`, {});
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في الموافقة على اللعبة التفاعلية');
      }
      
      return response.data as { message: string; game: InteractiveGame };
    } catch (error: any) {
      logger.error('Failed to approve interactive game:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في الموافقة على اللعبة التفاعلية');
    }
  }

  /**
   * Reject game (General Supervisor only)
   * POST /interactive-games/games/{id}/reject/
   */
  async reject(id: string, rejection_reason?: string): Promise<{ message: string; game: InteractiveGame }> {
    try {
      logger.debug('Rejecting interactive game', { id, rejection_reason });
      
      const response = await apiClient.post<{ message: string; game: InteractiveGame }>(`/interactive-games/games/${id}/reject/`, {
        rejection_reason: rejection_reason || ''
      });
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في رفض اللعبة التفاعلية');
      }
      
      return response.data as { message: string; game: InteractiveGame };
    } catch (error: any) {
      logger.error('Failed to reject interactive game:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في رفض اللعبة التفاعلية');
    }
  }

  /**
   * Start play session (Student only)
   * POST /interactive-games/games/{id}/play/
   */
  async play(id: string): Promise<PlayGameResponse> {
    try {
      logger.debug('Starting play session', { id });
      
      const response = await apiClient.post<PlayGameResponse>(`/interactive-games/games/${id}/play/`, {});
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في بدء جلسة اللعب');
      }
      
      return response.data as PlayGameResponse;
    } catch (error: any) {
      logger.error('Failed to start play session:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في بدء جلسة اللعب');
    }
  }

  /**
   * Complete play session (Student only)
   * POST /interactive-games/games/{id}/complete_session/
   */
  async completeSession(id: string, data: CompleteSessionInput): Promise<{ message: string; session: GamePlaySession }> {
    try {
      logger.debug('Completing play session', { id, data });
      
      const response = await apiClient.post<{ message: string; session: GamePlaySession }>(`/interactive-games/games/${id}/complete_session/`, data);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في إكمال جلسة اللعب');
      }
      
      return response.data as { message: string; session: GamePlaySession };
    } catch (error: any) {
      logger.error('Failed to complete play session:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في إكمال جلسة اللعب');
    }
  }

  /**
   * List play sessions
   * GET /interactive-games/sessions/
   */
  async listSessions(params?: {
    game?: string;
    student?: string;
    ordering?: string;
  }): Promise<PaginatedResponse<GamePlaySession>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.game) queryParams.append('game', params.game);
      if (params?.student) queryParams.append('student', params.student);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      
      const queryString = queryParams.toString();
      const endpoint = `/interactive-games/sessions/${queryString ? `?${queryString}` : ''}`;
      
      logger.debug('Listing play sessions', { params });
      
      const response = await apiClient.get<PaginatedResponse<GamePlaySession>>(endpoint);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب جلسات اللعب');
      }
      
      return response.data as PaginatedResponse<GamePlaySession>;
    } catch (error: any) {
      logger.error('Failed to list play sessions:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب جلسات اللعب');
    }
  }

  /**
   * Get single play session
   * GET /interactive-games/sessions/{id}/
   */
  async getSession(id: string): Promise<GamePlaySession> {
    try {
      logger.debug('Getting play session', { id });
      
      const response = await apiClient.get<GamePlaySession>(`/interactive-games/sessions/${id}/`);
      
      if (response.success === false) {
        throw new Error(response.error || 'فشل في جلب جلسة اللعب');
      }
      
      return response.data as GamePlaySession;
    } catch (error: any) {
      logger.error('Failed to get play session:', error);
      throw new Error(error?.appError?.userMessage || error?.message || 'فشل في جلب جلسة اللعب');
    }
  }
}

// Export singleton instance
export const interactiveGamesApi = new InteractiveGamesApiService();

