'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { courseCommunitiesApi, type Community, type CommunityBadge } from '@/lib/api/course-communities'
import { toast } from 'sonner'
import { Trophy, Medal, Award, Star, Loader2, Crown } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  member: {
    id: string
    user: {
      id: number
      get_full_name: string
      profile_image_url?: string
    }
    total_points: number
    role: string
    role_display: string
  }
  badges: CommunityBadge[]
  total_posts: number
  total_comments: number
}

interface CommunityLeaderboardProps {
  community: Community
}

export default function CommunityLeaderboard({ community }: CommunityLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (community) {
      loadLeaderboard()
    }
  }, [community])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      // Backend returns an array of leaderboard entries
      const data = await courseCommunitiesApi.getLeaderboard(community.id)
      
      if (Array.isArray(data)) {
        setLeaderboard(data.map((entry: any) => ({
          rank: entry.rank || 0,
          member: entry.member,
          badges: entry.badges || [],
          total_posts: entry.total_posts || 0,
          total_comments: entry.total_comments || 0
        })))
      } else {
        setLeaderboard([])
      }
    } catch (error: any) {
      console.error('Error loading leaderboard:', error)
      toast.error(error?.data?.detail || error?.message || 'فشل تحميل لوحة الشرف')
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-amber-500" />
      case 2:
        return <Medal className="w-6 h-6 text-orange-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-300 dark:border-amber-700 shadow-lg'
      case 2:
        return 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800'
      case 3:
        return 'bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800'
      default:
        return 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700'
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

  if (loading) {
    return (
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle>لوحة الشرف</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-200 dark:border-amber-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">لوحة الشرف</CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              أفضل المساهمين في المجتمع
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">لا توجد بيانات في لوحة الشرف</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {leaderboard.slice(0, 10).map((entry) => (
              <div
                key={entry.member.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md ${getRankColor(entry.rank)}`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <Avatar className="w-10 h-10 ring-2 ring-white dark:ring-slate-700 flex-shrink-0">
                  <AvatarImage src={entry.member.user.profile_image_url} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-sm">
                    {entry.member.user.get_full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {entry.member.user.get_full_name}
                    </h4>
                    {entry.member.role === 'teacher' && (
                      <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {entry.member.total_points}
                    </span>
                    <span>{entry.total_posts} منشور</span>
                    <span>{entry.total_comments} تعليق</span>
                  </div>
                </div>

                {/* Badges */}
                {entry.badges && entry.badges.length > 0 && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {entry.badges.slice(0, 3).map((badge) => (
                      <div
                        key={badge.id}
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs"
                        title={badge.name}
                      >
                        {badge.icon ? (
                          <span className="text-xs">{badge.icon}</span>
                        ) : (
                          <div className="w-3 h-3">
                            {getBadgeIcon(badge.badge_type)}
                          </div>
                        )}
                      </div>
                    ))}
                    {entry.badges.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 text-xs">
                        +{entry.badges.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

