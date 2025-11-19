import { apiClient } from '../apiClient'

// Types
export interface CommunityMember {
  id: string
  community: string
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    get_full_name: string
    profile_image_url?: string
    profile_image_thumbnail_url?: string
  }
  role: 'teacher' | 'assistant' | 'student'
  role_display: string
  status: 'active' | 'inactive'
  status_display: string
  total_points: number
  joined_at: string
}

export interface Community {
  id: string
  course: string
  course_title: string
  name: string
  description: string
  rules?: string
  cover_image?: string
  status: 'active' | 'inactive'
  status_display: string
  teacher: string | {
    id: string
    name: string
    email: string
  }
  members_count: string
  created_at: string
  updated_at: string
  members?: CommunityMember[]
  recent_posts?: string
  top_contributors?: string
}

export interface CreateCommunityData {
  course: string
  name: string
  description: string
  rules?: string
  cover_image?: string
}

export interface UpdateCommunityData {
  course?: string
  name?: string
  description?: string
  rules?: string
  cover_image?: string
  status?: 'active' | 'inactive'
}

export interface AddStudentsData {
  student_ids: string[]
}

export interface PromoteToAssistantData {
  student_id: string
}

export interface RemoveStudentData {
  student_id: string
}

export interface CommunityPostAuthor {
  id: number
  email: string
  first_name: string
  last_name: string
  get_full_name: string
  profile_image_url?: string
  profile_image_thumbnail_url?: string
}

export interface CommunityPostComment {
  id: string
  post: string
  author: CommunityPostAuthor
  content: string
  parent_comment?: string
  is_helpful: boolean
  created_at: string
  updated_at: string
  replies?: string | CommunityPostComment[]
  replies_count?: string | number
}

export interface CreateCommentData {
  post: string
  content: string
  parent_comment?: string
}

export interface UpdateCommentData {
  post?: string
  content?: string
  parent_comment?: string
  is_helpful?: boolean
}

export interface CommunityBadge {
  id: string
  community: string
  student: string
  student_name: string
  badge_type: 'title' | 'achievement' | 'participation' | 'excellence'
  badge_type_display: string
  name: string
  description: string
  icon?: string
  granted_by: number
  granted_by_name: string
  granted_at: string
}

export interface CreateBadgeData {
  community: string
  student: string
  badge_type: 'title' | 'achievement' | 'participation' | 'excellence'
  name: string
  description: string
  icon?: string
}

export interface UpdateBadgeData {
  community?: string
  student?: string
  badge_type?: 'title' | 'achievement' | 'participation' | 'excellence'
  name?: string
  description?: string
  icon?: string
  granted_by?: number
}

export interface CommunityPost {
  id: string
  community: string
  author: CommunityPostAuthor
  post_type: 'discussion' | 'announcement' | 'question' | 'resource'
  post_type_display: string
  title: string
  content: string
  attachments?: string | string[]
  is_pinned: boolean
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  comments?: CommunityPostComment[]
  is_liked_by_user?: boolean | string
}

export interface CreatePostData {
  community: string
  post_type: 'discussion' | 'announcement' | 'question' | 'resource'
  title: string
  content: string
  attachments?: string | string[]
}

export interface UpdatePostData {
  community?: string
  post_type?: 'discussion' | 'announcement' | 'question' | 'resource'
  title?: string
  content?: string
  attachments?: string | string[]
  is_pinned?: boolean
}

// API Functions
export const courseCommunitiesApi = {
  // List all communities
  async list(params?: {
    page?: number
    course?: string
  }): Promise<{ count: number; next?: string; previous?: string; results: Community[] }> {
    const response = await apiClient.get('/communities/communities/', { params })
    return response.data
  },

  // Get a specific community
  async get(id: string): Promise<Community> {
    const response = await apiClient.get(`/communities/communities/${id}/`)
    return response.data
  },

  // Create a new community
  async create(data: CreateCommunityData): Promise<Community> {
    const response = await apiClient.post('/communities/communities/', data)
    return response.data
  },

  // Update a community
  async update(id: string, data: UpdateCommunityData): Promise<Community> {
    const response = await apiClient.put(`/communities/communities/${id}/`, data)
    return response.data
  },

  // Partially update a community
  async patch(id: string, data: Partial<UpdateCommunityData>): Promise<Community> {
    const response = await apiClient.patch(`/communities/communities/${id}/`, data)
    return response.data
  },

  // Delete a community
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/communities/communities/${id}/`)
  },

  // Add students from course to community
  async addStudents(id: string, data: AddStudentsData): Promise<Community> {
    const response = await apiClient.post(`/communities/communities/${id}/add_students/`, data)
    return response.data
  },

  // Get leaderboard
  async getLeaderboard(id: string): Promise<any> {
    const response = await apiClient.get(`/communities/communities/${id}/leaderboard/`)
    return response.data
  },

  // Promote student to assistant
  async promoteToAssistant(id: string, data: PromoteToAssistantData): Promise<Community> {
    const response = await apiClient.post(`/communities/communities/${id}/promote_to_assistant/`, data)
    return response.data
  },

  // Remove student from community
  async removeStudent(id: string, data: RemoveStudentData): Promise<Community> {
    const response = await apiClient.post(`/communities/communities/${id}/remove_student/`, data)
    return response.data
  },

  // Posts
  // List all posts
  async listPosts(params?: {
    page?: number
    community?: string
  }): Promise<{ count: number; next?: string; previous?: string; results: CommunityPost[] }> {
    const response = await apiClient.get('/communities/posts/', { params })
    return response.data
  },

  // Get a specific post
  async getPost(id: string): Promise<CommunityPost> {
    const response = await apiClient.get(`/communities/posts/${id}/`)
    return response.data
  },

  // Create a new post
  async createPost(data: CreatePostData): Promise<CommunityPost> {
    const response = await apiClient.post('/communities/posts/', data)
    return response.data
  },

  // Update a post
  async updatePost(id: string, data: UpdatePostData): Promise<CommunityPost> {
    const response = await apiClient.put(`/communities/posts/${id}/`, data)
    return response.data
  },

  // Partially update a post
  async patchPost(id: string, data: Partial<UpdatePostData>): Promise<CommunityPost> {
    const response = await apiClient.patch(`/communities/posts/${id}/`, data)
    return response.data
  },

  // Delete a post
  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/communities/posts/${id}/`)
  },

  // Like a post
  async likePost(id: string): Promise<CommunityPost> {
    const response = await apiClient.post(`/communities/posts/${id}/like/`)
    return response.data
  },

  // Unlike a post
  async unlikePost(id: string): Promise<CommunityPost> {
    const response = await apiClient.post(`/communities/posts/${id}/unlike/`)
    return response.data
  },

  // Pin a post
  async pinPost(id: string): Promise<CommunityPost> {
    const response = await apiClient.post(`/communities/posts/${id}/pin/`)
    return response.data
  },

  // Unpin a post
  async unpinPost(id: string): Promise<CommunityPost> {
    const response = await apiClient.post(`/communities/posts/${id}/unpin/`)
    return response.data
  },

  // Comments
  // List all comments
  async listComments(params?: {
    page?: number
    post?: string
  }): Promise<{ count: number; next?: string; previous?: string; results: CommunityPostComment[] }> {
    const response = await apiClient.get('/communities/comments/', { params })
    return response.data
  },

  // Get a specific comment
  async getComment(id: string): Promise<CommunityPostComment> {
    const response = await apiClient.get(`/communities/comments/${id}/`)
    return response.data
  },

  // Create a new comment
  async createComment(data: CreateCommentData): Promise<CommunityPostComment> {
    const response = await apiClient.post('/communities/comments/', data)
    return response.data
  },

  // Update a comment
  async updateComment(id: string, data: UpdateCommentData): Promise<CommunityPostComment> {
    const response = await apiClient.put(`/communities/comments/${id}/`, data)
    return response.data
  },

  // Partially update a comment
  async patchComment(id: string, data: Partial<UpdateCommentData>): Promise<CommunityPostComment> {
    const response = await apiClient.patch(`/communities/comments/${id}/`, data)
    return response.data
  },

  // Delete a comment
  async deleteComment(id: string): Promise<void> {
    await apiClient.delete(`/communities/comments/${id}/`)
  },

  // Mark comment as helpful
  async markCommentHelpful(id: string): Promise<CommunityPostComment> {
    const response = await apiClient.post(`/communities/comments/${id}/mark_helpful/`)
    return response.data
  },

  // Badges
  // List all badges
  async listBadges(params?: {
    page?: number
    community?: string
    student?: string
  }): Promise<{ count: number; next?: string; previous?: string; results: CommunityBadge[] }> {
    const response = await apiClient.get('/communities/badges/', { params })
    return response.data
  },

  // Get my badges
  async getMyBadges(): Promise<CommunityBadge[]> {
    const response = await apiClient.get('/communities/badges/my_badges/')
    return response.data
  },

  // Get a specific badge
  async getBadge(id: string): Promise<CommunityBadge> {
    const response = await apiClient.get(`/communities/badges/${id}/`)
    return response.data
  },

  // Create a new badge
  async createBadge(data: CreateBadgeData): Promise<CommunityBadge> {
    const response = await apiClient.post('/communities/badges/', data)
    return response.data
  },

  // Update a badge
  async updateBadge(id: string, data: UpdateBadgeData): Promise<CommunityBadge> {
    const response = await apiClient.put(`/communities/badges/${id}/`, data)
    return response.data
  },

  // Partially update a badge
  async patchBadge(id: string, data: Partial<UpdateBadgeData>): Promise<CommunityBadge> {
    const response = await apiClient.patch(`/communities/badges/${id}/`, data)
    return response.data
  },

  // Delete a badge
  async deleteBadge(id: string): Promise<void> {
    await apiClient.delete(`/communities/badges/${id}/`)
  },

  // Post Attachments
  // Get post attachments
  async getPostAttachments(postPk: string, params?: {
    page?: number
  }): Promise<{ results: any[]; count: number; next?: string; previous?: string }> {
    const response = await apiClient.get(`/communities/posts/${postPk}/attachments/`, { params })
    return response.data
  },

  // Get a specific attachment
  async getPostAttachment(postPk: string, attachmentId: number): Promise<any> {
    const response = await apiClient.get(`/communities/posts/${postPk}/attachments/${attachmentId}/`)
    return response.data
  },

  // Upload attachment to post
  async uploadPostAttachment(postPk: string, file: File, isPublic: boolean = false): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('is_public', String(isPublic))
    
    const response = await apiClient.post(`/communities/posts/${postPk}/attachments/upload/`, formData)
    return response.data
  },

  // Delete attachment
  async deletePostAttachment(postPk: string, attachmentId: number): Promise<void> {
    await apiClient.delete(`/communities/posts/${postPk}/attachments/${attachmentId}/`)
  }
}

export default courseCommunitiesApi

