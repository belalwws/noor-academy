import { apiClient } from '../apiClient'

// Types
export interface Author {
  id: string
  username: string
  name: string
  avatar?: string
  role: string
}

export interface Forum {
  id: string
  name: string
  description: string
  forum_type: string
  icon: string
  is_active: boolean
  order: number
  topics_count: number
  posts_count: number
  created_at: string
  updated_at: string
}

export interface Topic {
  id: string
  title: string
  content: string
  forum: Forum
  author: Author
  is_pinned: boolean
  is_locked: boolean
  is_active: boolean
  posts_count: number
  views_count: number
  likes_count: number
  created_at: string
  updated_at: string
}

export interface PostAttachment {
  id: number
  file_name: string
  original_name: string
  file_url: string
  file_type: 'image' | 'video' | 'document' | 'audio' | 'archive'
  file_type_display: string
  file_size: number
  file_size_mb: string
  file_extension: string
  mime_type: string
  uploaded_by: {
    id: number
    email: string
    first_name: string
    last_name: string
    get_full_name: string
    profile_image_url?: string
  }
  uploaded_at: string
}

export interface Post {
  id: string
  content: string
  topic: string
  author: Author
  parent?: string
  is_active: boolean
  replies_count: number
  likes_count: number
  attachments: Array<{
    id: string
    name: string
    url: string
    type: string
    size: number
  }>
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  reporter: Author
  post?: string
  topic?: string
  reason: string
  description: string
  status: string
  reviewed_by?: Author
  reviewed_at?: string
  resolution_notes: string
  created_at: string
  updated_at: string
}

export interface PostLike {
  id: string
  post: string
  user: string
  created_at: string
}

export interface CommunityStats {
  total_forums: number
  total_topics: number
  total_posts: number
  total_users: number
  active_users_today: number
  pending_reports: number
}

// Enhanced cache with invalidation mechanisms
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
const cache: Record<string, { data: any; timestamp: number }> = {}

// Cache invalidation events
const CACHE_INVALIDATION_EVENTS = {
  FORUM_CREATED: 'forum_created',
  FORUM_UPDATED: 'forum_updated',
  FORUM_DELETED: 'forum_deleted',
  TOPIC_CREATED: 'topic_created',
  TOPIC_UPDATED: 'topic_updated',
  TOPIC_DELETED: 'topic_deleted',
  POST_CREATED: 'post_created',
  POST_UPDATED: 'post_updated',
  POST_DELETED: 'post_deleted',
  REPORT_CREATED: 'report_created',
  REPORT_UPDATED: 'report_updated'
}

const getCachedData = (key: string) => {
  const cachedItem = cache[key]
  if (!cachedItem) return null
  
  // Check if cache is still valid
  if (Date.now() - cachedItem.timestamp < CACHE_DURATION) {
    return cachedItem.data
  }
  
  // Remove expired cache
  delete cache[key]
  return null
}

const setCachedData = (key: string, data: any) => {
  cache[key] = {
    data,
    timestamp: Date.now()
  }
}

// Enhanced cache invalidation
const invalidateCache = (event: string, data?: any) => {
  switch (event) {
    case CACHE_INVALIDATION_EVENTS.FORUM_CREATED:
    case CACHE_INVALIDATION_EVENTS.FORUM_UPDATED:
    case CACHE_INVALIDATION_EVENTS.FORUM_DELETED:
      // Invalidate forums cache
      delete cache['forums']
      // Invalidate all forum-specific caches
      Object.keys(cache).forEach(key => {
        if (key.startsWith('forum_')) {
          delete cache[key]
        }
      })
      break
      
    case CACHE_INVALIDATION_EVENTS.TOPIC_CREATED:
    case CACHE_INVALIDATION_EVENTS.TOPIC_UPDATED:
    case CACHE_INVALIDATION_EVENTS.TOPIC_DELETED:
      // Invalidate topics cache
      delete cache['topics']
      // Invalidate forum topics cache
      if (data?.forumId) {
        Object.keys(cache).forEach(key => {
          if (key.startsWith(`forum_topics_${data.forumId}`)) {
            delete cache[key]
          }
        })
      }
      break
      
    case CACHE_INVALIDATION_EVENTS.POST_CREATED:
    case CACHE_INVALIDATION_EVENTS.POST_UPDATED:
    case CACHE_INVALIDATION_EVENTS.POST_DELETED:
      // Invalidate posts cache
      delete cache['posts']
      // Invalidate topic posts cache
      if (data?.topicId) {
        Object.keys(cache).forEach(key => {
          if (key.startsWith(`topic_posts_${data.topicId}`)) {
            delete cache[key]
          }
        })
      }
      break
      
    case CACHE_INVALIDATION_EVENTS.REPORT_CREATED:
    case CACHE_INVALIDATION_EVENTS.REPORT_UPDATED:
      // Invalidate reports cache
      delete cache['reports']
      delete cache['pending_reports']
      break
      
    default:
      // For other events, invalidate everything
      Object.keys(cache).forEach(key => delete cache[key])
  }
}

// API Functions
export const communityApi = {
  // Forums
  async getForums(): Promise<Forum[]> {
    // Check cache first
    const cached = getCachedData('forums')
    if (cached) {
      return cached
    }
    
    const response = await apiClient.get('/community/forums/')
    const data = response.data.results || response.data
    
    // Cache the response
    setCachedData('forums', data)
    
    return data
  },

  async getForum(id: string): Promise<Forum> {
    // Create cache key based on id
    const cacheKey = `forum_${id}`
    
    // Check cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await apiClient.get(`/community/forums/${id}/`)
    const data = response.data
    
    // Cache the response
    setCachedData(cacheKey, data)
    
    return data
  },

  async createForum(data: Partial<Forum>): Promise<Forum> {
    const response = await apiClient.post('/community/forums/', data)
    const forum = response.data
    
    // Invalidate cache
    invalidateCache(CACHE_INVALIDATION_EVENTS.FORUM_CREATED)
    
    return forum
  },

  async updateForum(id: string, data: Partial<Forum>): Promise<Forum> {
    const response = await apiClient.patch(`/community/forums/${id}/`, data)
    const forum = response.data
    
    // Invalidate cache
    invalidateCache(CACHE_INVALIDATION_EVENTS.FORUM_UPDATED, { id })
    
    return forum
  },

  async deleteForum(id: string): Promise<void> {
    await apiClient.delete(`/community/forums/${id}/`)
    
    // Invalidate cache
    invalidateCache(CACHE_INVALIDATION_EVENTS.FORUM_DELETED, { id })
  },

  // Get topics for a specific forum
  async getForumTopics(forumId: string, params?: {
    search?: string
    page?: number
    page_size?: number
  }): Promise<{ results: Topic[]; count: number; next?: string; previous?: string }> {
    // Create cache key based on params
    const cacheKey = `forum_topics_${forumId}_${JSON.stringify(params)}`
    
    // Check cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await apiClient.get(`/community/forums/${forumId}/topics/`, { params })
    const data = response.data
    
    // Cache the response
    setCachedData(cacheKey, data)
    
    return data
  },

  // Topics
  async getTopics(params?: {
    forum?: string
    search?: string
    page?: number
    page_size?: number
    sort_by?: string
    filter_by?: string
  }): Promise<{ results: Topic[]; count: number; next?: string; previous?: string }> {
    // Create cache key based on params
    const cacheKey = `topics_${JSON.stringify(params)}`
    
    // Check cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await apiClient.get('/community/topics/', { params })
    const data = response.data
    
    // Cache the response
    setCachedData(cacheKey, data)
    
    return data
  },

  async getTopic(id: string): Promise<Topic> {
    // Create cache key based on id
    const cacheKey = `topic_${id}`
    
    // Check cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await apiClient.get(`/community/topics/${id}/`)
    const data = response.data
    
    // Cache the response
    setCachedData(cacheKey, data)
    
    return data
  },

  async createTopic(data: {
    title: string
    content: string
    forum: string
  }): Promise<Topic> {
    const response = await apiClient.post('/community/topics/', data)
    const topic = response.data
    
    // Invalidate cache
    invalidateCache(CACHE_INVALIDATION_EVENTS.TOPIC_CREATED, { forumId: data.forum })
    
    return topic
  },

  async updateTopic(id: string, data: Partial<Topic>): Promise<Topic> {
    const response = await apiClient.patch(`/community/topics/${id}/`, data)
    const topic = response.data
    
    // Invalidate cache
    invalidateCache(CACHE_INVALIDATION_EVENTS.TOPIC_UPDATED, { id })
    
    return topic
  },

  async deleteTopic(id: string): Promise<void> {
    await apiClient.delete(`/community/topics/${id}/`)
    
    // Invalidate cache
    invalidateCache(CACHE_INVALIDATION_EVENTS.TOPIC_DELETED, { id })
  },

  async pinTopic(id: string): Promise<Topic> {
    const response = await apiClient.post(`/community/topics/${id}/pin/`)
    return response.data
  },

  async lockTopic(id: string): Promise<Topic> {
    const response = await apiClient.post(`/community/topics/${id}/lock/`)
    return response.data
  },

  // Get posts for a specific topic
  async getTopicPosts(topicId: string, params?: {
    page?: number
    page_size?: number
  }): Promise<{ results: Post[]; count: number; next?: string; previous?: string }> {
    // Create cache key based on params
    const cacheKey = `topic_posts_${topicId}_${JSON.stringify(params)}`
    
    // Check cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await apiClient.get(`/community/topics/${topicId}/posts/`, { params })
    const data = response.data
    
    // Cache the response
    setCachedData(cacheKey, data)
    
    return data
  },

  // Posts
  async getPosts(topicId: string, params?: {
    page?: number
    page_size?: number
  }): Promise<{ results: Post[]; count: number; next?: string; previous?: string }> {
    // Create cache key based on params
    const cacheKey = `posts_${topicId}_${JSON.stringify(params)}`
    
    // Check cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await apiClient.get('/community/posts/', {
      params: { topic: topicId, ...params }
    })
    const data = response.data
    
    // Cache the response
    setCachedData(cacheKey, data)
    
    return data
  },

  async getPost(id: string): Promise<Post> {
    // Create cache key based on id
    const cacheKey = `post_${id}`
    
    // Check cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await apiClient.get(`/community/posts/${id}/`)
    const data = response.data
    
    // Cache the response
    setCachedData(cacheKey, data)
    
    return data
  },

  async createPost(data: {
    content: string
    topic: string
    parent?: string
  }): Promise<Post> {
    const response = await apiClient.post('/community/posts/', data)
    const post = response.data
    
    // Invalidate cache
    invalidateCache(CACHE_INVALIDATION_EVENTS.POST_CREATED, { topicId: data.topic })
    
    return post
  },

  async updatePost(id: string, data: { content: string }): Promise<Post> {
    const response = await apiClient.patch(`/community/posts/${id}/`, data)
    const post = response.data
    
    // Invalidate cache
    invalidateCache(CACHE_INVALIDATION_EVENTS.POST_UPDATED, { id })
    
    return post
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/community/posts/${id}/`)
    
    // Invalidate cache
    invalidateCache(CACHE_INVALIDATION_EVENTS.POST_DELETED, { id })
  },

  async likePost(id: string): Promise<{ liked: boolean; likes_count: number }> {
    const response = await apiClient.post(`/community/posts/${id}/like/`)
    return response.data
  },

  // Get reported posts
  async getReportedPosts(params?: {
    page?: number
    page_size?: number
  }): Promise<{ results: Post[]; count: number; next?: string; previous?: string }> {
    // Create cache key based on params
    const cacheKey = `reported_posts_${JSON.stringify(params)}`
    
    // Check cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await apiClient.get('/community/posts/reported/', { params })
    const data = response.data
    
    // Cache the response
    setCachedData(cacheKey, data)
    
    return data
  },

  // Reports
  async getReports(params?: {
    status?: string
    page?: number
    page_size?: number
  }): Promise<{ results: Report[]; count: number; next?: string; previous?: string }> {
    // Create cache key based on params
    const cacheKey = `reports_${JSON.stringify(params)}`
    
    // Check cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await apiClient.get('/community/reports/', { params })
    const data = response.data
    
    // Cache the response
    setCachedData(cacheKey, data)
    
    return data
  },

  async createReport(data: {
    post?: string
    topic?: string
    reason: string
    description?: string
    report_type?: string
  }): Promise<Report> {
    const response = await apiClient.post('/community/reports/', data)
    const report = response.data
    
    // Invalidate cache
    invalidateCache(CACHE_INVALIDATION_EVENTS.REPORT_CREATED)
    
    return report
  },

  async updateReport(id: string, data: {
    status?: string
    resolution_notes?: string
  }): Promise<Report> {
    const response = await apiClient.patch(`/community/reports/${id}/`, data)
    const report = response.data
    
    // Invalidate cache
    invalidateCache(CACHE_INVALIDATION_EVENTS.REPORT_UPDATED)
    
    return report
  },

  async resolveReport(id: string, resolution_notes: string): Promise<Report> {
    const response = await apiClient.post(`/community/reports/${id}/resolve/`, {
      resolution_notes
    })
    return response.data
  },

  async dismissReport(id: string, resolution_notes: string): Promise<Report> {
    const response = await apiClient.post(`/community/reports/${id}/dismiss/`, {
      resolution_notes
    })
    return response.data
  },

  // Community Management
  async getCommunityStats(): Promise<CommunityStats> {
    // Create cache key
    const cacheKey = `community_stats`
    
    // Check cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await apiClient.get('/community/management/stats/')
    const data = response.data
    
    // Cache the response
    setCachedData(cacheKey, data)
    
    return data
  },

  async getPendingReports(): Promise<Report[]> {
    // Create cache key
    const cacheKey = `pending_reports`
    
    // Check cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await apiClient.get('/community/management/pending-reports/')
    const data = response.data
    
    // Cache the response
    setCachedData(cacheKey, data)
    
    return data
  },

  async getRecentActivity(): Promise<any[]> {
    // Create cache key
    const cacheKey = `recent_activity`
    
    // Check cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const response = await apiClient.get('/community/management/recent-activity/')
    const data = response.data
    
    // Cache the response
    setCachedData(cacheKey, data)
    
    return data
  },

  async getBookmarkedTopics(): Promise<Topic[]> {
    const response = await apiClient.get('/community/topics/bookmarks/')
    return response.data
  },

  async getBookmarkStatus(topicId: string): Promise<{ bookmarked: boolean }> {
    const response = await apiClient.get(`/community/topics/${topicId}/bookmark-status/`)
    return response.data
  },

  async toggleBookmark(topicId: string): Promise<{ bookmarked: boolean }> {
    const response = await apiClient.post(`/community/topics/${topicId}/toggle-bookmark/`)
    return response.data
  },

  // Add user profile methods
  async getUserCommunityStats(userId: string): Promise<any> {
    const response = await apiClient.get(`/community/users/${userId}/stats/`)
    return response.data
  },

  async getUserBadges(userId: string): Promise<any[]> {
    const response = await apiClient.get(`/community/users/${userId}/badges/`)
    return response.data
  },

  async getUserBookmarkedTopics(userId: string): Promise<Topic[]> {
    const response = await apiClient.get(`/community/users/${userId}/bookmarks/`)
    return response.data
  },

  // Add method to fetch suggested mentions
  async getSuggestedMentions(query: string[]): Promise<Author[]> {
    const response = await apiClient.get('/community/users/suggestions/', {
      params: { query: query.join(',') }
    })
    return response.data
  },

  // Post Attachments
  async getPostAttachments(postPk: string, params?: {
    page?: number
  }): Promise<{ results: PostAttachment[]; count: number; next?: string; previous?: string }> {
    const response = await apiClient.get(`/communities/posts/${postPk}/attachments/`, { params })
    return response.data
  },

  async getPostAttachment(postPk: string, attachmentId: number): Promise<PostAttachment> {
    const response = await apiClient.get(`/communities/posts/${postPk}/attachments/${attachmentId}/`)
    return response.data
  },

  async uploadPostAttachment(postPk: string, file: File, isPublic: boolean = false): Promise<PostAttachment> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('is_public', String(isPublic))
    
    const response = await apiClient.post(`/communities/posts/${postPk}/attachments/upload/`, formData)
    
    // Invalidate cache for this post
    invalidateCache(CACHE_INVALIDATION_EVENTS.POST_UPDATED, { id: postPk })
    
    return response.data
  },

  async deletePostAttachment(postPk: string, attachmentId: number): Promise<void> {
    await apiClient.delete(`/communities/posts/${postPk}/attachments/${attachmentId}/`)
    
    // Invalidate cache for this post
    invalidateCache(CACHE_INVALIDATION_EVENTS.POST_UPDATED, { id: postPk })
  }
}

export default communityApi
