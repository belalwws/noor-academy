'use client'

import { useState, useCallback, useEffect } from 'react'
import { communityApi, type Forum, type Topic, type Post } from '@/lib/api/community'
import { useToast } from '@/components/ui/use-toast'

interface UseCommunityDataProps {
  initialPage?: number
  initialPageSize?: number
}

export const useCommunityData = ({
  initialPage = 1,
  initialPageSize = 10
}: UseCommunityDataProps = {}) => {
  const [forums, setForums] = useState<Forum[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [topicsLoading, setTopicsLoading] = useState(false)
  const [postsLoading, setPostsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [topicsError, setTopicsError] = useState<string | null>(null)
  const [postsError, setPostsError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [topicsRetryCount, setTopicsRetryCount] = useState(0)
  const [postsRetryCount, setPostsRetryCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalTopics, setTotalTopics] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  const { toast } = useToast()

  const handleApiError = useCallback((error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error)
    
    let errorMessage = 'حدث خطأ غير متوقع'
    
    if (error.response?.status === 401) {
      errorMessage = 'يجب تسجيل الدخول أولاً'
    } else if (error.response?.status === 403) {
      errorMessage = 'ليس لديك صلاحية للقيام بهذا الإجراء'
    } else if (error.response?.status === 404) {
      errorMessage = 'لم يتم العثور على المورد المطلوب'
    } else if (error.response?.status >= 500) {
      errorMessage = 'خطأ في الخادم، يرجى المحاولة لاحقاً'
    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      errorMessage = 'فشل الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return errorMessage
  }, [])

  // Load forums with enhanced error handling
  const loadForums = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const forumsData = await communityApi.getForums()
      setForums(forumsData)
      setRetryCount(0) // Reset retry count on success
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'تحميل المنتديات')
      setError(errorMessage)
      
      // Auto-retry logic for network errors
      if ((error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) && 
          retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          loadForums()
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }, [handleApiError, retryCount])

  // Load topics with enhanced error handling and filtering
  const loadTopics = useCallback(async (params: {
    forum?: string
    search?: string
    page?: number
    page_size?: number
    sort_by?: string
    filter_by?: string
  }) => {
    try {
      setTopicsLoading(true)
      setTopicsError(null)
      
      const topicsData = await communityApi.getTopics(params)
      setTopics(topicsData.results || [])
      setTotalTopics(topicsData.count)
      setTotalPages(Math.ceil(topicsData.count / (params.page_size || initialPageSize)))
      setTopicsRetryCount(0) // Reset retry count on success
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'تحميل المواضيع')
      setTopicsError(errorMessage)
      
      // Auto-retry logic for network errors
      if ((error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) && 
          topicsRetryCount < 3) {
        setTimeout(() => {
          setTopicsRetryCount(prev => prev + 1)
          loadTopics(params)
        }, 2000)
      }
    } finally {
      setTopicsLoading(false)
    }
  }, [handleApiError, initialPageSize, topicsRetryCount])

  // Load posts with enhanced error handling
  const loadPosts = useCallback(async (topicId: string, params: {
    page?: number
    page_size?: number
  }) => {
    try {
      setPostsLoading(true)
      setPostsError(null)
      
      const postsData = await communityApi.getTopicPosts(topicId, params)
      setPosts(postsData.results || [])
      setPostsRetryCount(0) // Reset retry count on success
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'تحميل المشاركات')
      setPostsError(errorMessage)
      
      // Auto-retry logic for network errors
      if ((error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) && 
          postsRetryCount < 3) {
        setTimeout(() => {
          setPostsRetryCount(prev => prev + 1)
          loadPosts(topicId, params)
        }, 2000)
      }
    } finally {
      setPostsLoading(false)
    }
  }, [handleApiError, postsRetryCount])

  const retryOperation = useCallback((operation: string) => {
    setRetryCount(prev => prev + 1)
    
    if (operation === 'loadForums') {
      loadForums()
    } else if (operation === 'loadTopics') {
      // This would need to be called with current params in actual usage
    } else if (operation === 'loadPosts') {
      // This would need to be called with current params in actual usage
    }
  }, [loadForums])

  return {
    // Data
    forums,
    topics,
    posts,
    
    // Loading states
    loading,
    topicsLoading,
    postsLoading,
    
    // Errors
    error,
    topicsError,
    postsError,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalTopics,
    totalPages,
    
    // Retry
    retryCount,
    topicsRetryCount,
    postsRetryCount,
    
    // Methods
    loadForums,
    loadTopics,
    loadPosts,
    retryOperation
  }
}
