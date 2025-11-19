'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Pin,
  Calendar,
  Clock,
  FileText,
  Download,
  Eye
} from 'lucide-react'

interface PostCardProps {
  id: string
  author: {
    name: string
    avatar?: string
    role: 'teacher' | 'student'
  }
  content: string
  timestamp: string
  isPinned?: boolean
  type: 'announcement' | 'assignment' | 'discussion' | 'resource'
  attachments?: Array<{
    name: string
    type: string
    size: string
    url: string
  }>
  likes?: number
  comments?: number
  isLiked?: boolean
}

export default function PostCard({
  id,
  author,
  content,
  timestamp,
  isPinned = false,
  type,
  attachments = [],
  likes = 0,
  comments = 0,
  isLiked = false
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'assignment':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'discussion':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'resource':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'إعلان'
      case 'assignment':
        return 'واجب'
      case 'discussion':
        return 'نقاش'
      case 'resource':
        return 'مورد'
      default:
        return 'منشور'
    }
  }

  const getRoleColor = (role: string) => {
    return role === 'teacher' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const getRoleLabel = (role: string) => {
    return role === 'teacher' ? 'معلم' : 'طالب'
  }

  return (
    <Card className="w-full bg-white shadow-sm hover:shadow-md transition-all duration-200 border-0 rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12 border-2 border-gray-100">
              <AvatarImage src={author.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white font-medium">
                {author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{author.name}</h4>
                <Badge className={`text-xs border ${getRoleColor(author.role)}`}>
                  {getRoleLabel(author.role)}
                </Badge>
                {isPinned && (
                  <Pin className="w-4 h-4 text-green-600" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs border ${getTypeColor(type)}`}>
                  {getTypeLabel(type)}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{timestamp}</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-4 space-y-2">
            {attachments.map((attachment, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{attachment.name}</p>
                  <p className="text-xs text-gray-500">{attachment.type} • {attachment.size}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-200 rounded-lg">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-200 rounded-lg">
                    <Download className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                liked 
                  ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likeCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{comments}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">مشاركة</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
