'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { courseCommunitiesApi, type CommunityPost } from '@/lib/api/course-communities'
import { Clock, MessageSquare } from 'lucide-react'

interface LatestPostsWidgetProps {
  communityId: string
}

export default function LatestPostsWidget({ communityId }: LatestPostsWidgetProps) {
  const [latestPosts, setLatestPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (communityId) {
      loadLatestPosts()
    }
  }, [communityId])

  const loadLatestPosts = async () => {
    try {
      setLoading(true)
      const response = await courseCommunitiesApi.listPosts({ 
        community: communityId,
        page: 1
      })
      // Get latest 5 posts
      setLatestPosts((response.results || []).slice(0, 5))
    } catch (error) {
      console.error('Error loading latest posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMins < 1) return 'الآن'
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`
      if (diffHours < 24) return `منذ ${diffHours} ساعة`
      if (diffDays < 7) return `منذ ${diffDays} يوم`
      return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <Card className="shadow-md border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-200 dark:border-amber-800 pb-3">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">آخر التحديثات</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (latestPosts.length === 0) {
    return null
  }

  return (
    <Card className="shadow-md border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-200 dark:border-amber-800 pb-3">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">آخر التحديثات</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {latestPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => {
                // Scroll to post or highlight it
                const element = document.getElementById(`post-${post.id}`)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  element.classList.add('ring-2', 'ring-amber-500')
                  setTimeout(() => {
                    element.classList.remove('ring-2', 'ring-amber-500')
                  }, 2000)
                }
              }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
            >
              <Avatar className="w-10 h-10 border-2 border-gray-200 dark:border-gray-700 group-hover:border-amber-500 transition-colors">
                <AvatarImage src={post.author.profile_image_url} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-sm font-semibold">
                  {post.author.get_full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {post.author.get_full_name} نشر تحديث
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-1">
                  {post.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(post.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

