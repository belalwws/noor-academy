'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Users, 
  Eye, 
  Heart, 
  Pin, 
  Lock, 
  Flag,
  Clock,
  TrendingUp,
  Star,
  Share2,
  Bookmark,
  MoreHorizontal,
  ChevronUp,
  Award
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { communityApi } from '@/lib/api/community'
import { 
  useCommunityPermissions, 
  PermissionGate, 
  getRoleInfo 
} from '@/components/CommunityPermissions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TopicCardProps {
  topic: any
  onTopicClick: (topicId: string) => void
  onReloadTopics: () => void
}

const CommunityTopicCard = ({ topic, onTopicClick, onReloadTopics }: TopicCardProps) => {
  const { toast } = useToast()
  const permissions = useCommunityPermissions()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isUpvoted, setIsUpvoted] = useState(false)

  const handleApiError = (error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error)
    toast({
      title: 'خطأ',
      description: `فشل في ${operation}`,
      variant: 'destructive',
    })
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/placeholder-user.png'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'منذ دقائق'
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
    if (diffInHours < 48) return 'منذ يوم'
    const diffInDays = Math.floor(diffInHours / 24)
    return `منذ ${diffInDays} أيام`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'ألف'
    }
    return num.toString()
  }

  const getTopicPriority = () => {
    if (topic.is_pinned) return { label: 'مثبت', color: 'bg-amber-100 text-amber-800', icon: Pin }
    if (topic.views_count > 1000) return { label: 'شائع', color: 'bg-red-100 text-red-800', icon: TrendingUp }
    if (topic.likes_count > 50) return { label: 'محبوب', color: 'bg-pink-100 text-pink-800', icon: Heart }
    return null
  }

  const priority = getTopicPriority()

  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] group bg-white/95 backdrop-blur-sm border border-slate-200 hover:border-blue-300"
      onClick={() => onTopicClick(topic.id)}
    >
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Header with Author Info */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="w-10 h-10 border-2 border-blue-100">
                <AvatarImage src={topic.author?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-100 text-blue-700 font-semibold">
                  {topic.author?.username?.charAt(0) || 'م'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 truncate">
                    {topic.author?.username || 'مستخدم'}
                  </span>
                  {topic.author?.role && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getRoleInfo(topic.author.role).color} border-0`}
                    >
                      {getRoleInfo(topic.author.role).label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(topic.created_at)}</span>
                </div>
              </div>
            </div>
            
            {/* Action Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" dir="rtl">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsBookmarked(!isBookmarked)
                    toast({ 
                      title: isBookmarked ? 'تم إلغاء الحفظ' : 'تم الحفظ', 
                      description: isBookmarked ? 'تم إزالة الموضوع من المحفوظات' : 'تم حفظ الموضوع'
                    })
                  }}
                  className="flex items-center gap-2"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-yellow-500' : ''}`} />
                  {isBookmarked ? 'إلغاء الحفظ' : 'حفظ'}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.share?.({
                      title: topic.title,
                      url: window.location.origin + `/community/${topic.id}`
                    }) || navigator.clipboard.writeText(window.location.origin + `/community/${topic.id}`)
                    toast({ title: 'تم النسخ', description: 'تم نسخ رابط الموضوع' })
                  }}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </DropdownMenuItem>

                <PermissionGate permission="canPinTopics">
                  <DropdownMenuItem 
                    onClick={async (e) => {
                      e.stopPropagation()
                      try {
                        await communityApi.pinTopic(topic.id)
                        toast({ title: 'تم التثبيت', description: 'تم تثبيت الموضوع بنجاح' })
                        onReloadTopics()
                      } catch (error) {
                        handleApiError(error, 'تثبيت الموضوع')
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Pin className="w-4 h-4" />
                    تثبيت
                  </DropdownMenuItem>
                </PermissionGate>

                <PermissionGate permission="canLockTopics">
                  <DropdownMenuItem 
                    onClick={async (e) => {
                      e.stopPropagation()
                      try {
                        await communityApi.lockTopic(topic.id)
                        toast({ title: 'تم القفل', description: 'تم قفل الموضوع بنجاح' })
                        onReloadTopics()
                      } catch (error) {
                        handleApiError(error, 'قفل الموضوع')
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    قفل
                  </DropdownMenuItem>
                </PermissionGate>

                <DropdownMenuItem 
                  onClick={async (e) => {
                    e.stopPropagation()
                    try {
                      await communityApi.createReport({
                        topic: topic.id,
                        reason: "inappropriate",
                        description: "تم الإبلاغ عن هذا الموضوع من قبل المستخدم",
                        report_type: "topic"
                      })
                      toast({ title: 'تم الإبلاغ', description: 'تم إرسال البلاغ بنجاح وسيتم مراجعته' })
                    } catch (error) {
                      handleApiError(error, 'الإبلاغ عن الموضوع')
                    }
                  }}
                  className="flex items-center gap-2 text-red-600"
                >
                  <Flag className="w-4 h-4" />
                  إبلاغ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Topic Title and Content */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 transition-colors flex-1 text-right leading-tight">
                {topic.title}
              </h3>
              <div className="flex gap-1 flex-shrink-0">
                {topic.is_pinned && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    <Pin className="w-3 h-3 ml-1" />
                    مثبت
                  </Badge>
                )}
                {topic.is_locked && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                    <Lock className="w-3 h-3 ml-1" />
                    مقفل
                  </Badge>
                )}
                {topic.is_popular && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    <TrendingUp className="w-3 h-3 ml-1" />
                    شائع
                  </Badge>
                )}
              </div>
            </div>
            
            {topic.content && (
              <p className="text-slate-600 text-sm line-clamp-2 text-right leading-relaxed">
                {topic.content}
              </p>
            )}
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-4">
              {/* Upvote Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsUpvoted(!isUpvoted)
                  toast({ 
                    title: isUpvoted ? 'تم إلغاء الإعجاب' : 'تم الإعجاب', 
                    description: isUpvoted ? 'تم إلغاء إعجابك بالموضوع' : 'تم تسجيل إعجابك بالموضوع'
                  })
                }}
                className={`h-8 px-3 ${isUpvoted ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
              >
                <ChevronUp className={`w-4 h-4 ml-1 ${isUpvoted ? 'fill-current' : ''}`} />
                <span className="text-xs font-medium">{formatNumber(topic.likes_count || 0)}</span>
              </Button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <span className="font-medium">{formatNumber(topic.replies_count || 0)}</span>
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{formatNumber(topic.views_count || 0)}</span>
                <Eye className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CommunityTopicCard
