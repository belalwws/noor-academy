'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { communityApi, type Topic } from '@/lib/api/community'
import CommunityTopicCard from '@/components/CommunityTopicCard'
import CommunitySkeletonLoader from '@/components/CommunityError'

interface CommunityInfiniteScrollProps {
  forumId?: string
  searchQuery?: string
  onTopicClick: (topicId: string) => void
}

const CommunityInfiniteScroll = ({ 
  forumId, 
  searchQuery,
  onTopicClick
}: CommunityInfiniteScrollProps) => {
  const { toast } = useToast()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

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
    
    setError(errorMessage)
    toast({
      title: 'خطأ',
      description: errorMessage,
      variant: 'destructive',
    })
  }, [toast])

  const loadTopics = useCallback(async (pageNum: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const params: any = {
        page: pageNum,
        page_size: 10,
        search: searchQuery,
      }
      
      if (forumId) {
        params.forum = forumId
      }
      
      const topicsData = await communityApi.getTopics(params)
      
      if (pageNum === 1) {
        setTopics(topicsData.results || [])
      } else {
        setTopics(prev => [...prev, ...(topicsData.results || [])])
      }
      
      setHasMore(!!topicsData.next)
    } catch (error) {
      handleApiError(error, 'تحميل المواضيع')
    } finally {
      setLoading(false)
    }
  }, [forumId, searchQuery, handleApiError])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }, [loading, hasMore])

  useEffect(() => {
    loadTopics(1)
    setPage(1)
  }, [forumId, searchQuery, loadTopics])

  useEffect(() => {
    if (page > 1) {
      loadTopics(page)
    }
  }, [page, loadTopics])

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          onClick={() => loadTopics(1)}
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  if (topics.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">لا توجد مواضيع</h3>
        <p className="text-gray-500">كن أول من يبدأ النقاش في هذا المنتدى</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <CommunityTopicCard
          key={topic.id}
          topic={topic}
          onTopicClick={onTopicClick}
          onReloadTopics={() => loadTopics(1)}
        />
      ))}
      
      {hasMore && (
        <div className="text-center py-4">
          <button
            className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'جاري التحميل...' : 'تحميل المزيد'}
          </button>
        </div>
      )}
      
      {!hasMore && topics.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          لا توجد مواضيع إضافية
        </div>
      )}
    </div>
  )
}

export default CommunityInfiniteScroll
