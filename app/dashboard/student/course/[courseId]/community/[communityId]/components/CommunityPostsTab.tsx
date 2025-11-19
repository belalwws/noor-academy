'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAppSelector } from '@/lib/hooks'
import { courseCommunitiesApi, type CommunityPost, type CommunityPostComment, type CreatePostData } from '@/lib/api/course-communities'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Heart,
  MessageCircle,
  Pin,
  Send,
  FileText,
  Image as ImageIcon,
  Video,
  Link as LinkIcon
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { apiService } from '@/lib/api'

interface CommunityPostsTabProps {
  communityId: string
}

export default function CommunityPostsTab({ communityId }: CommunityPostsTabProps) {
  const { user } = useAppSelector(state => state.auth)
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [postComments, setPostComments] = useState<Record<string, CommunityPostComment[]>>({})
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({})
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    community: communityId,
    post_type: 'discussion' as 'discussion' | 'announcement' | 'question' | 'resource',
    title: '',
    content: '',
    attachments: ''
  })
  const [creating, setCreating] = useState(false)
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    if (communityId) {
      loadPosts()
    }
    if (user) {
      loadUserProfile()
    }
  }, [communityId, user])

  const loadUserProfile = async () => {
    try {
      if (user?.id) {
        // Get user name
        const fullName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'المستخدم'
        setUserName(fullName)
        
        // Get user profile image
        try {
          const imageResponse = await apiService.getProfileImageUrls()
          if (imageResponse.success && imageResponse.data) {
            const actualData = imageResponse.data.data || imageResponse.data
            const imageUrl = actualData.profile_image_thumbnail_url ||
                            actualData.profile_image_url ||
                            actualData.image_url ||
                            user.profile_image_thumbnail_url ||
                            user.profile_image_url
            if (imageUrl) {
              setUserProfileImage(imageUrl)
            }
          }
        } catch (error) {
          // Fallback to user's profile image URL
          if (user.profile_image_thumbnail_url || user.profile_image_url) {
            setUserProfileImage(user.profile_image_thumbnail_url || user.profile_image_url || null)
          }
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const loadPosts = async () => {
    try {
      setLoadingPosts(true)
      const response = await courseCommunitiesApi.listPosts({ community: communityId })
      const postsData = response.results || []
      setPosts(postsData)
      
      // Load comments for each post
      for (const post of postsData) {
        if (post.comments && Array.isArray(post.comments) && post.comments.length > 0) {
          setPostComments(prev => ({
            ...prev,
            [post.id]: post.comments as CommunityPostComment[]
          }))
        }
      }
    } catch (error) {
      console.error('Error loading posts:', error)
      toast.error('فشل تحميل المنشورات')
    } finally {
      setLoadingPosts(false)
    }
  }

  const loadComments = async (postId: string) => {
    try {
      setLoadingComments(prev => ({ ...prev, [postId]: true }))
      const response = await courseCommunitiesApi.listComments({ post: postId })
      setPostComments(prev => ({
        ...prev,
        [postId]: response.results || []
      }))
    } catch (error) {
      console.error('Error loading comments:', error)
      toast.error('فشل تحميل التعليقات')
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }))
    }
  }

  const handleToggleComments = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
        // Load comments if not already loaded
        if (!postComments[postId]) {
          loadComments(postId)
        }
      }
      return newSet
    })
  }

  const handleAddComment = async (postId: string, parentCommentId?: string) => {
    try {
      const commentText = parentCommentId ? replyTexts[`${postId}-${parentCommentId}`] : commentTexts[postId]
      if (!commentText || !commentText.trim()) {
        toast.error('يرجى إدخال نص التعليق')
        return
      }

      await courseCommunitiesApi.createComment({
        post: postId,
        content: commentText.trim(),
        parent_comment: parentCommentId
      })
      
      toast.success('تم إضافة التعليق بنجاح')
      
      // Clear comment text
      if (parentCommentId) {
        setReplyTexts(prev => {
          const newTexts = { ...prev }
          delete newTexts[`${postId}-${parentCommentId}`]
          return newTexts
        })
      } else {
        setCommentTexts(prev => {
          const newTexts = { ...prev }
          delete newTexts[postId]
          return newTexts
        })
      }
      
      // Optimistic update: تحديث العدد فوراً
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? {
                ...p,
                comments_count: (p.comments_count || 0) + 1
              }
            : p
        )
      )
      
      // Reload comments to get the new comment
      await loadComments(postId)
      
      // Reload posts to sync with backend
      loadPosts()
    } catch (error: any) {
      console.error('Error adding comment:', error)
      toast.error(error?.response?.data?.detail || 'فشل إضافة التعليق')
      
      // Rollback: إعادة العدد الأصلي في حالة الخطأ
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? {
                ...p,
                comments_count: Math.max(0, (p.comments_count || 0) - 1)
              }
            : p
        )
      )
    }
  }

  const handleLikePost = async (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    // حفظ القيم الأصلية قبل التحديث
    const originalIsLiked = !!post.is_liked_by_user
    const originalLikesCount = post.likes_count || 0
    
    try {
      // Optimistic update: تحديث UI فوراً قبل استدعاء API
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? {
                ...p,
                is_liked_by_user: !originalIsLiked,
                likes_count: originalIsLiked ? Math.max(0, originalLikesCount - 1) : originalLikesCount + 1
              }
            : p
        )
      )

      // استدعاء API
      if (originalIsLiked) {
        await courseCommunitiesApi.unlikePost(postId)
      } else {
        await courseCommunitiesApi.likePost(postId)
      }
    } catch (error: any) {
      console.error('Error toggling like:', error)
      toast.error('فشل تحديث الإعجاب')
      
      // Rollback: إعادة القيم الأصلية في حالة الخطأ
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? {
                ...p,
                is_liked_by_user: originalIsLiked,
                likes_count: originalLikesCount
              }
            : p
        )
      )
    }
  }

  const handleCreatePost = async () => {
    try {
      if (!formData.title || !formData.content) {
        toast.error('يرجى ملء جميع الحقول المطلوبة')
        return
      }

      setCreating(true)
      
      // Parse attachments if it's a string
      let attachments: string[] = []
      if (formData.attachments && typeof formData.attachments === 'string') {
        const attachmentStr = formData.attachments.trim()
        if (attachmentStr) {
          attachments = attachmentStr.split(',').map(url => url.trim()).filter(url => url.length > 0)
        }
      } else if (Array.isArray(formData.attachments)) {
        attachments = formData.attachments.filter(url => url && typeof url === 'string' && url.trim().length > 0)
      }

      const postData: CreatePostData = {
        community: communityId,
        post_type: formData.post_type,
        title: formData.title.trim(),
        content: formData.content.trim(),
        ...(attachments.length > 0 && { attachments })
      }

      await courseCommunitiesApi.createPost(postData)
      
      toast.success('تم إنشاء المنشور بنجاح')
      setShowCreateDialog(false)
      setFormData({
        community: communityId,
        post_type: 'discussion',
        title: '',
        content: '',
        attachments: ''
      })
      loadPosts()
    } catch (error: any) {
      console.error('Error creating post:', error)
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'فشل إنشاء المنشور'
      toast.error(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
      case 'question': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      case 'resource': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    }
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <FileText className="w-4 h-4" />
      case 'question': return <MessageCircle className="w-4 h-4" />
      case 'resource': return <LinkIcon className="w-4 h-4" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  const renderComment = (comment: CommunityPostComment, postId: string, level: number = 0) => {
    const replies = Array.isArray(comment.replies) ? comment.replies : []
    
    return (
      <div key={comment.id} className={level > 0 ? 'mr-8 mt-3' : ''}>
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={comment.author.profile_image_url} />
            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs">
              {comment.author.get_full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                {comment.author.get_full_name}
              </h4>
              {comment.is_helpful && (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700">
                  مفيد
                </Badge>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(comment.created_at).toLocaleDateString('ar-EG', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap">
              {comment.content}
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const key = `${postId}-${comment.id}`
                  if (!replyTexts[key]) {
                    setReplyTexts(prev => ({ ...prev, [key]: '' }))
                  }
                }}
                className="h-7 px-2 text-xs text-gray-500 hover:text-amber-600"
              >
                رد
              </Button>
            </div>
            
            {/* Reply Input */}
            {replyTexts[`${postId}-${comment.id}`] !== undefined && (
              <div className="mt-3 flex items-start gap-2">
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs">
                    +
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={replyTexts[`${postId}-${comment.id}`] || ''}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [`${postId}-${comment.id}`]: e.target.value }))}
                    placeholder="اكتب رداً..."
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleAddComment(postId, comment.id)
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddComment(postId, comment.id)}
                    className="h-8 px-3 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 text-white shadow-md"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyTexts(prev => {
                        const newTexts = { ...prev }
                        delete newTexts[`${postId}-${comment.id}`]
                        return newTexts
                      })
                    }}
                    className="h-8 px-2"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
            
            {/* Replies */}
            {replies.length > 0 && (
              <div className="mt-3 space-y-2">
                {replies.map((reply) => renderComment(reply as CommunityPostComment, postId, level + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Sort posts: pinned first, then by date
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white dark:bg-slate-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="w-12 h-12 border-2 border-gray-200 dark:border-gray-700 shadow-md">
                <AvatarImage src={userProfileImage || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-lg font-semibold">
                  {userName?.charAt(0) || user?.full_name?.charAt(0) || user?.first_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                onClick={() => {
                  setFormData({
                    community: communityId,
                    post_type: 'discussion',
                    title: '',
                    content: '',
                    attachments: ''
                  })
                  setShowCreateDialog(true)
                }}
                className="flex-1 justify-start text-right h-auto p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
              >
                <span className="text-base font-medium">شارك ما يدور في ذهنك{userName ? `، ${userName}` : ''}...</span>
              </Button>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFormData({
                    community: communityId,
                    post_type: 'discussion',
                    title: '',
                    content: '',
                    attachments: ''
                  })
                  setShowCreateDialog(true)
                }}
                className="flex-1 gap-2 h-10 rounded-lg text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all"
              >
                <ImageIcon className="w-5 h-5" />
                <span className="text-sm font-medium">صورة</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFormData({
                    community: communityId,
                    post_type: 'discussion',
                    title: '',
                    content: '',
                    attachments: ''
                  })
                  setShowCreateDialog(true)
                }}
                className="flex-1 gap-2 h-10 rounded-lg text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all"
              >
                <Video className="w-5 h-5" />
                <span className="text-sm font-medium">فيديو</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFormData({
                    community: communityId,
                    post_type: 'discussion',
                    title: '',
                    content: '',
                    attachments: ''
                  })
                  setShowCreateDialog(true)
                }}
                className="flex-1 gap-2 h-10 rounded-lg text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all"
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">مستند</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Posts List */}
      {loadingPosts ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : sortedPosts.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              لا توجد منشورات
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              كن أول من ينشر في هذا المجتمع
            </p>
            <Button
              onClick={() => {
                setFormData({
                  community: communityId,
                  post_type: 'discussion',
                  title: '',
                  content: '',
                  attachments: ''
                })
                setShowCreateDialog(true)
              }}
              className="gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4" />
              إنشاء منشور جديد
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => (
            <motion.div
              key={post.id}
              id={`post-${post.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <Card className={`bg-white dark:bg-slate-800 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden ${post.is_pinned ? 'border-l-4 border-l-amber-500' : ''}`}>
                {post.is_pinned && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-amber-600 text-white text-xs shadow-lg px-3 py-1">
                      <Pin className="w-3 h-3 ml-1" />
                      مثبت
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="w-12 h-12 ring-2 ring-gray-200 dark:ring-gray-700 shadow-md">
                        <AvatarImage src={post.author.profile_image_url} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-lg font-semibold">
                          {post.author.get_full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            {post.author.get_full_name}
                          </h3>
                          <Badge variant="outline" className={getPostTypeColor(post.post_type) + ' text-xs font-semibold'}>
                            {getPostTypeIcon(post.post_type)}
                            <span className="mr-1">{post.post_type_display}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(post.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {post.title}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4 text-base leading-relaxed">
                    {post.content}
                  </p>
                  
                  {/* Attachments */}
                  {post.attachments && (
                    <div className="mb-4">
                      {Array.isArray(post.attachments) ? (
                        <div className="space-y-3">
                          {post.attachments.map((url, index) => {
                            // Check if URL is an image
                            const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
                            return isImage ? (
                              <div key={index} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                <img
                                  src={url}
                                  alt={`Attachment ${index + 1}`}
                                  className="w-full h-auto max-h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(url, '_blank')}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                            ) : (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400"
                              >
                                <LinkIcon className="w-5 h-5" />
                                <span className="truncate flex-1">{url}</span>
                              </a>
                            )
                          })}
                        </div>
                      ) : (
                        (() => {
                          const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(post.attachments)
                          return isImage ? (
                            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                              <img
                                src={post.attachments}
                                alt="Post attachment"
                                className="w-full h-auto max-h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(post.attachments as string, '_blank')}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            </div>
                          ) : (
                            <a
                              href={post.attachments as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400"
                            >
                              <LinkIcon className="w-5 h-5" />
                              <span className="truncate flex-1">{post.attachments}</span>
                            </a>
                          )
                        })()
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikePost(post.id)}
                      className={`flex-1 gap-2 h-9 rounded-lg ${post.is_liked_by_user ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                    >
                      <Heart className={`w-5 h-5 ${post.is_liked_by_user ? 'fill-red-600' : ''}`} />
                      <span className="text-sm font-medium">إعجاب</span>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {post.likes_count || 0}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleComments(post.id)}
                      className={`flex-1 gap-2 h-9 rounded-lg ${expandedPosts.has(post.id) ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                    >
                      <MessageCircle className={`w-5 h-5 ${expandedPosts.has(post.id) ? 'fill-amber-600' : ''}`} />
                      <span className="text-sm font-medium">تعليق</span>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {post.comments_count ?? 0}
                      </span>
                    </Button>
                  </div>
                </CardContent>
                
                {/* Comments Section */}
                {expandedPosts.has(post.id) && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-slate-900/50">
                    {/* Add Comment Input */}
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs">
                          +
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={commentTexts[post.id] || ''}
                          onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="اكتب تعليقاً..."
                          className="h-9 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              handleAddComment(post.id)
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentTexts[post.id]?.trim()}
                          className="h-9 px-3 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 disabled:opacity-50 text-white shadow-lg"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Comments List */}
                    {loadingComments[post.id] ? (
                      <div className="space-y-3">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ) : postComments[post.id] && postComments[post.id].length > 0 ? (
                      <div className="space-y-2">
                        {postComments[post.id]
                          .filter(comment => !comment.parent_comment)
                          .map(comment => renderComment(comment, post.id))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        لا توجد تعليقات بعد
                      </p>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-slate-900" dir="rtl">
          <div className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl -m-6 p-6">
            <DialogHeader className="text-center pb-6">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-amber-800 to-orange-700 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-2">
                منشور جديد
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 relative z-10">
              <div>
                <Label className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  نوع المنشور
                </Label>
                <Select
                  value={formData.post_type}
                  onValueChange={(value: any) => setFormData({ ...formData, post_type: value })}
                >
                  <SelectTrigger className="h-12 border-2 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discussion">مناقشة</SelectItem>
                    <SelectItem value="question">سؤال</SelectItem>
                    <SelectItem value="resource">مورد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  العنوان <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="عنوان المنشور"
                  className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  المحتوى <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="محتوى المنشور"
                  rows={6}
                  className="text-base border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl resize-none"
                />
              </div>
              <div>
                <Label className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  المرفقات (روابط مفصولة بفواصل)
                </Label>
                <Input
                  value={formData.attachments}
                  onChange={(e) => setFormData({ ...formData, attachments: e.target.value })}
                  placeholder="https://example.com/file1.pdf, https://example.com/file2.jpg"
                  className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 relative z-10">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="border-2 rounded-xl px-6 py-2.5 font-semibold"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={creating || !formData.title || !formData.content}
                className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 text-white rounded-xl px-6 py-2.5 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {creating ? 'جاري النشر...' : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    نشر
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

