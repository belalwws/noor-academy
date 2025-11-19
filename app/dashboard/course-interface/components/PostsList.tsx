'use client'

import React, { useState, useEffect } from 'react'
import PostCard from './PostCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Search, Video, Users, Clock, Play } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Post {
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

interface LiveSession {
  id: string
  title: string
  instructor: string
  startTime: string
  participantsCount: number
  isJoinable: boolean
}

interface PostsListProps {
  courseId?: string
  userRole?: 'teacher' | 'student'
  userName?: string
  userAvatar?: string
}

export default function PostsList({
  courseId,
  userRole = 'student',
  userName = "المستخدم",
  userAvatar
}: PostsListProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockPosts: Post[] = [
      {
        id: '1',
        author: {
          name: 'د. أحمد محمد',
          avatar: '',
          role: 'teacher'
        },
        content: 'مرحباً بكم في دورة تعليم القرآن الكريم. سنبدأ اليوم بتعلم أحكام التجويد الأساسية. يرجى مراجعة المواد المرفقة قبل الجلسة القادمة.',
        timestamp: 'منذ ساعتين',
        isPinned: true,
        type: 'announcement',
        attachments: [
          {
            name: 'أحكام التجويد - الدرس الأول.pdf',
            type: 'PDF',
            size: '2.5 MB',
            url: '#'
          }
        ],
        likes: 12,
        comments: 3,
        isLiked: false
      },
      {
        id: '2',
        author: {
          name: 'فاطمة علي',
          avatar: '',
          role: 'student'
        },
        content: 'شكراً لك دكتور على الشرح الواضح في الدرس الماضي. هل يمكن أن تشاركنا المزيد من التمارين العملية؟',
        timestamp: 'منذ 4 ساعات',
        type: 'discussion',
        likes: 5,
        comments: 2,
        isLiked: true
      },
      {
        id: '3',
        author: {
          name: 'د. أحمد محمد',
          avatar: '',
          role: 'teacher'
        },
        content: 'واجب الأسبوع: قراءة سورة الفاتحة بأحكام التجويد الصحيحة. يرجى تسجيل قراءتكم وإرسالها قبل نهاية الأسبوع.',
        timestamp: 'أمس',
        type: 'assignment',
        likes: 8,
        comments: 1,
        isLiked: false
      }
    ]
    setPosts(mockPosts)

    // Mock live sessions
    const mockLiveSessions: LiveSession[] = [
      {
        id: '1',
        title: 'درس أحكام التجويد - الجلسة المباشرة',
        instructor: 'د. أحمد محمد',
        startTime: 'بدأت منذ 15 دقيقة',
        participantsCount: 18,
        isJoinable: true
      }
    ]
    setLiveSessions(mockLiveSessions)
  }, [])

  const handleCreatePost = (content: string, attachments: File[]) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        name: userName,
        avatar: userAvatar,
        role: userRole
      },
      content,
      timestamp: 'الآن',
      type: 'discussion',
      attachments: attachments.map(file => ({
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        url: '#'
      })),
      likes: 0,
      comments: 0,
      isLiked: false
    }
    setPosts(prev => [newPost, ...prev])
  }

  const handleRefresh = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || post.type === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Live Sessions */}
      {liveSessions.length > 0 && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-l-red-500">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-red-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <Video className="w-5 h-5" />
              </div>
              الحصص المباشرة النشطة ({liveSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {liveSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{session.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>المعلم: {session.instructor}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{session.startTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{session.participantsCount} مشارك</span>
                      </div>
                    </div>
                  </div>
                </div>

                {session.isJoinable && (
                  <Button className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    انضم الآن
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

     


      {/* Posts */}
      <div className="space-y-6">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
      </div>

    </div>
  )
}
