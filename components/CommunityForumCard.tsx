'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Users, 
  Eye, 
  TrendingUp,
  BookOpen,
  Mic,
  Globe,
  GraduationCap,
  Clock,
  ArrowLeft,
  Plus
} from 'lucide-react'

interface ForumCardProps {
  forum: any
  isSelected: boolean
  onSelect: (forumId: string) => void
  onCreateTopic?: (forumId: string) => void
}

const CommunityForumCard = ({ forum, isSelected, onSelect, onCreateTopic }: ForumCardProps) => {
  const getForumIcon = (forumType: string) => {
    switch (forumType) {
      case 'quran_memorization':
        return <BookOpen className="h-5 w-5" />
      case 'islamic_studies':
        return <Globe className="h-5 w-5" />
      case 'arabic_language':
        return <MessageSquare className="h-5 w-5" />
      case 'tajweed':
        return <Mic className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const getForumColor = (forumType: string) => {
    switch (forumType) {
      case 'quran_memorization':
        return 'from-blue-500 to-blue-600'
      case 'islamic_studies':
        return 'from-blue-500 to-indigo-600'
      case 'arabic_language':
        return 'from-purple-500 to-violet-600'
      case 'tajweed':
        return 'from-orange-500 to-red-600'
      default:
        return 'from-slate-500 to-gray-600'
    }
  }

  const getForumColorLight = (forumType: string) => {
    switch (forumType) {
      case 'quran_memorization':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'islamic_studies':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'arabic_language':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'tajweed':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'ألف'
    }
    return num.toString()
  }

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group border ${
        isSelected 
          ? 'ring-2 ring-blue-500 shadow-lg bg-gradient-to-bl from-blue-50 to-blue-50 border-blue-200' 
          : 'hover:shadow-md bg-white/95 backdrop-blur-sm border-slate-200 hover:border-blue-300'
      }`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onSelect(forum.id)}
          >
            <div className={`p-2.5 rounded-xl bg-gradient-to-bl ${getForumColor(forum.forum_type)} text-white shadow-md flex-shrink-0`}>
              {getForumIcon(forum.forum_type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors text-right truncate">
                {forum.name}
              </h3>
              <p className="text-sm text-slate-600 line-clamp-2 mt-1 text-right">
                {forum.description}
              </p>
            </div>
            {isSelected && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex-shrink-0">
                نشط
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-bl from-blue-50 to-blue-50 rounded-lg p-2.5 border border-blue-100">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-blue-700 font-medium">المواضيع</span>
                <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div className="mt-1 text-right">
                <span className="text-lg font-bold text-blue-800">
                  {formatNumber(forum.topics_count || 0)}
                </span>
              </div>
            </div>
            
            <div className="bg-gradient-to-bl from-blue-50 to-indigo-50 rounded-lg p-2.5 border border-blue-100">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-blue-700 font-medium">المشاركات</span>
                <Users className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div className="mt-1 text-right">
                <span className="text-lg font-bold text-blue-800">
                  {formatNumber(forum.posts_count || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Create Topic Button */}
          <Button 
            className={`w-full justify-between text-right h-auto p-2.5 ${
              isSelected 
                ? `bg-gradient-to-l ${getForumColor(forum.forum_type)} text-white shadow-md hover:shadow-lg` 
                : 'bg-white/80 border border-blue-200 hover:bg-blue-50 text-blue-700'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              onCreateTopic && onCreateTopic(forum.id)
            }}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="font-medium">موضوع جديد</span>
            </div>
            <div className="text-xs opacity-75">
              في {forum.name}
            </div>
          </Button>

          {/* Activity Indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <TrendingUp className="h-3 w-3" />
              <span>نشط</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>آخر نشاط: اليوم</span>
              <Clock className="h-3 w-3" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CommunityForumCard
