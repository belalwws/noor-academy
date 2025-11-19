'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Award, 
  Trophy, 
  Star, 
  Medal,
  Loader2
} from 'lucide-react'
import { courseCommunitiesApi, type CommunityBadge } from '@/lib/api/course-communities'
import { toast } from 'sonner'

interface CommunityBadgesTabProps {
  communityId: string
}

export default function CommunityBadgesTab({ communityId }: CommunityBadgesTabProps) {
  const [badges, setBadges] = useState<CommunityBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (communityId) {
      loadBadges()
    }
  }, [communityId, page])

  const loadBadges = async () => {
    try {
      setLoading(true)
      const response = await courseCommunitiesApi.listBadges({ 
        community: communityId,
        page 
      })
      setBadges(response.results || [])
      setCount(response.count || 0)
      setHasNext(!!response.next)
      setHasPrevious(!!response.previous)
    } catch (error) {
      console.error('Error loading badges:', error)
      toast.error('فشل تحميل الشارات')
    } finally {
      setLoading(false)
    }
  }

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'title':
        return <Medal className="w-4 h-4" />
      case 'achievement':
        return <Trophy className="w-4 h-4" />
      case 'participation':
        return <Star className="w-4 h-4" />
      case 'excellence':
        return <Award className="w-4 h-4" />
      default:
        return <Award className="w-4 h-4" />
    }
  }

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'title':
        return 'bg-gradient-to-br from-amber-400 to-orange-500'
      case 'achievement':
        return 'bg-gradient-to-br from-amber-500 to-orange-600'
      case 'participation':
        return 'bg-gradient-to-br from-orange-400 to-amber-500'
      case 'excellence':
        return 'bg-gradient-to-br from-amber-600 to-orange-700'
      default:
        return 'bg-gradient-to-br from-amber-400 to-orange-500'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            شارات المجتمع
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {count} شارة
          </p>
        </div>
      </div>

      {/* Badges Grid */}
      {badges.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              لا توجد شارات
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              لم يتم منح أي شارات في هذا المجتمع بعد
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <Card
              key={badge.id}
              className="bg-white dark:bg-slate-800 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-16 h-16 ${getBadgeColor(badge.badge_type)} rounded-xl flex items-center justify-center shadow-lg`}>
                    {badge.icon ? (
                      <span className="text-2xl">{badge.icon}</span>
                    ) : (
                      <div className="text-white">
                        {getBadgeIcon(badge.badge_type)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {badge.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                      {badge.badge_type_display}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {badge.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs">
                        {badge.student_name?.charAt(0) || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {badge.student_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        منح في {formatDate(badge.granted_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(hasNext || hasPrevious) && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(prev => prev - 1)}
            disabled={!hasPrevious || loading}
            className="gap-2"
          >
            السابق
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            صفحة {page}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(prev => prev + 1)}
            disabled={!hasNext || loading}
            className="gap-2"
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  )
}

