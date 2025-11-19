'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Award, 
  Star, 
  Crown, 
  Shield, 
  Zap, 
  Heart, 
  BookOpen, 
  MessageSquare,
  Users,
  Trophy,
  Target,
  Flame,
  Medal,
  Gem,
  Sparkles,
  Bookmark
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { communityApi } from '@/lib/api/community'
import { useToast } from '@/components/ui/use-toast'

interface CommunityStats {
  level: number
  xp: number
  nextLevelXp: number
  totalPosts: number
  totalLikes: number
  totalTopics: number
  reputation: number
  streak: number
}

interface CommunityBadge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earned: boolean
  earnedDate?: string
  progress?: number
  maxProgress?: number
}

interface BookmarkedTopic {
  id: string
  title: string
  forum: {
    name: string
    icon: string
  }
  created_at: string
}

interface CommunityProfileSectionProps {
  userId: string
  className?: string
}

const CommunityProfileSection = ({ userId, className }: CommunityProfileSectionProps) => {
  const { toast } = useToast()
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [badges, setBadges] = useState<CommunityBadge[]>([])
  const [bookmarkedTopics, setBookmarkedTopics] = useState<BookmarkedTopic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCommunityData()
  }, [userId])

  const loadCommunityData = async () => {
    try {
      const [statsData, badgesData, bookmarksData] = await Promise.all([
        communityApi.getUserCommunityStats(userId),
        communityApi.getUserBadges(userId),
        communityApi.getUserBookmarkedTopics(userId)
      ])
      
      setStats(statsData)
      setBadges(badgesData)
      setBookmarkedTopics(bookmarksData)
    } catch (error) {
      console.error('Error loading community data:', error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات المجتمع",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: CommunityBadge['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 bg-gray-50'
      case 'rare':
        return 'border-blue-300 bg-blue-50'
      case 'epic':
        return 'border-purple-300 bg-purple-50'
      case 'legendary':
        return 'border-yellow-300 bg-yellow-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  const getRarityGlow = (rarity: CommunityBadge['rarity']) => {
    switch (rarity) {
      case 'rare':
        return 'shadow-blue-200'
      case 'epic':
        return 'shadow-purple-200'
      case 'legendary':
        return 'shadow-yellow-200'
      default:
        return ''
    }
  }

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return <MessageSquare className="h-4 w-4" />
      case 'Heart': return <Heart className="h-4 w-4" />
      case 'BookOpen': return <BookOpen className="h-4 w-4" />
      case 'Crown': return <Crown className="h-4 w-4" />
      case 'Flame': return <Flame className="h-4 w-4" />
      case 'Trophy': return <Trophy className="h-4 w-4" />
      case 'Medal': return <Medal className="h-4 w-4" />
      case 'Star': return <Star className="h-4 w-4" />
      case 'Target': return <Target className="h-4 w-4" />
      case 'Sparkles': return <Sparkles className="h-4 w-4" />
      case 'Shield': return <Shield className="h-4 w-4" />
      case 'Zap': return <Zap className="h-4 w-4" />
      case 'Users': return <Users className="h-4 w-4" />
      case 'Gem': return <Gem className="h-4 w-4" />
      case 'Bookmark': return <Bookmark className="h-4 w-4" />
      default: return <Award className="h-4 w-4" />
    }
  }

  const getLevelInfo = (level: number) => {
    if (level >= 50) return { title: 'أسطورة', color: 'text-purple-600', icon: <Crown className="h-4 w-4" /> }
    if (level >= 30) return { title: 'خبير', color: 'text-yellow-600', icon: <Medal className="h-4 w-4" /> }
    if (level >= 20) return { title: 'متقدم', color: 'text-blue-600', icon: <Star className="h-4 w-4" /> }
    if (level >= 10) return { title: 'متوسط', color: 'text-green-600', icon: <Target className="h-4 w-4" /> }
    return { title: 'مبتدئ', color: 'text-gray-600', icon: <Sparkles className="h-4 w-4" /> }
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">لا توجد بيانات مجتمع متاحة</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const levelInfo = getLevelInfo(stats.level)
  const xpProgress = (stats.xp / stats.nextLevelXp) * 100

  return (
    <div className={`space-y-6 ${className}`}>
      {/* User Level & XP */}
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-emerald-800">
            <div className="p-2 bg-emerald-100 rounded-lg">
              {levelInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>المستوى {stats.level}</span>
                <Badge className={`${levelInfo.color} bg-white border-current`}>
                  {levelInfo.title}
                </Badge>
              </div>
              <p className="text-sm text-emerald-600 font-normal">
                {stats.xp} / {stats.nextLevelXp} نقطة خبرة
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-emerald-700">التقدم للمستوى التالي</span>
              <span className="text-emerald-600">{Math.round(xpProgress)}%</span>
            </div>
            <Progress value={xpProgress} className="h-3 bg-emerald-100" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-800">{stats.totalPosts}</div>
              <div className="text-xs text-emerald-600">مشاركة</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-800">{stats.totalLikes}</div>
              <div className="text-xs text-emerald-600">إعجاب</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-800">{stats.reputation}</div>
              <div className="text-xs text-emerald-600">سمعة</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-lg font-bold text-emerald-800">{stats.streak}</span>
              </div>
              <div className="text-xs text-emerald-600">يوم متتالي</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Award className="h-5 w-5 text-yellow-600" />
            الشارات والإنجازات
            <Badge className="bg-yellow-100 text-yellow-800">
              {badges.filter(b => b.earned).length} / {badges.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <TooltipProvider key={badge.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card 
                      className={`relative transition-all duration-300 hover:scale-105 cursor-pointer ${
                        badge.earned 
                          ? `${getRarityColor(badge.rarity)} shadow-lg ${getRarityGlow(badge.rarity)}` 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 rounded-full ${badge.color} ${
                          badge.earned ? 'text-white' : 'bg-gray-300 text-gray-500'
                        } flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                          {getBadgeIcon(badge.icon)}
                        </div>
                        
                        <h3 className={`font-semibold mb-1 ${
                          badge.earned ? 'text-slate-800' : 'text-gray-500'
                        }`}>
                          {badge.name}
                        </h3>
                        
                        <p className={`text-xs ${
                          badge.earned ? 'text-slate-600' : 'text-gray-400'
                        }`}>
                          {badge.description}
                        </p>
                        
                        {badge.earned && badge.earnedDate && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {new Date(badge.earnedDate).toLocaleDateString('ar-SA')}
                            </Badge>
                          </div>
                        )}
                        
                        {!badge.earned && badge.progress !== undefined && badge.maxProgress && (
                          <div className="mt-3">
                            <div className="text-xs text-slate-600 mb-1">
                              {badge.progress} / {badge.maxProgress}
                            </div>
                            <Progress 
                              value={(badge.progress / badge.maxProgress) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}
                        
                        {badge.rarity === 'legendary' && badge.earned && (
                          <div className="absolute -top-1 -right-1">
                            <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                              <Crown className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p className="font-semibold">{badge.name}</p>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                      {badge.earned && badge.earnedDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          تم الحصول عليها في {new Date(badge.earnedDate).toLocaleDateString('ar-SA')}
                        </p>
                      )}
                      {!badge.earned && badge.progress !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">
                          التقدم: {badge.progress} / {badge.maxProgress}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bookmarked Topics */}
      {bookmarkedTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Bookmark className="h-5 w-5 text-blue-600" />
              المواضيع المحفوظة
              <Badge className="bg-blue-100 text-blue-800">
                {bookmarkedTopics.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookmarkedTopics.slice(0, 5).map((topic) => (
                <div key={topic.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="text-emerald-600">
                    {topic.forum.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{topic.title}</h4>
                    <p className="text-sm text-slate-600">{topic.forum.name}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(topic.created_at).toLocaleDateString('ar-SA')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CommunityProfileSection
