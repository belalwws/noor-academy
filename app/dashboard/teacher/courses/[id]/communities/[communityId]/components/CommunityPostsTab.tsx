'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAppSelector } from '@/lib/hooks'
import { courseCommunitiesApi, type CommunityPost, type CommunityPostComment } from '@/lib/api/course-communities'
import { getProxiedImageUrl } from '@/lib/imageUtils'
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
  Trash2,
  Edit,
  Send,
  FileText,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Paperclip,
  X,
  Music,
  Archive,
  File
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
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [postComments, setPostComments] = useState<Record<string, CommunityPostComment[]>>({})
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({})
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
  const [showEditCommentDialog, setShowEditCommentDialog] = useState(false)
  const [showDeleteCommentDialog, setShowDeleteCommentDialog] = useState(false)
  const [selectedComment, setSelectedComment] = useState<CommunityPostComment | null>(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [formData, setFormData] = useState({
    post_type: 'discussion' as 'discussion' | 'announcement' | 'question' | 'resource',
    title: '',
    content: '',
    attachments: ''
  })
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [postAttachments, setPostAttachments] = useState<Record<string, any[]>>({})
  const [isCreatingPost, setIsCreatingPost] = useState(false)

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
          // Handle both success and 404 (no images found) cases
          if (imageResponse && (imageResponse.success || (imageResponse.data && imageResponse.data.data))) {
            const actualData = imageResponse.data?.data || imageResponse.data || {}
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
          // Silently fail - this is not critical
          console.log('Profile image not available, using fallback')
        } finally {
          // Fallback to user's profile image URL from user object
          if (!userProfileImage && (user.profile_image_thumbnail_url || user.profile_image_url)) {
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
      
      // Load attachments for each post
      const attachmentsMap: Record<string, any[]> = {}
      const commentsMap: Record<string, CommunityPostComment[]> = {}
      
      // دالة لحساب عدد التعليقات (يشمل الردود)
      const countAllComments = (commentList: CommunityPostComment[]): number => {
        let count = 0
        for (const comment of commentList) {
          count++
          if (comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0) {
            count += countAllComments(comment.replies as CommunityPostComment[])
          }
        }
        return count
      }
      
      for (const post of postsData) {
        try {
          const attachmentsData = await courseCommunitiesApi.getPostAttachments(post.id)
          attachmentsMap[post.id] = attachmentsData.results || []
        } catch (error) {
          console.error(`Error loading attachments for post ${post.id}:`, error)
          attachmentsMap[post.id] = []
        }
        
        // Load comments for each post - تأكد من أن كل منشور له تعليقاته الخاصة فقط
        if (post.comments && Array.isArray(post.comments) && post.comments.length > 0) {
          commentsMap[post.id] = post.comments as CommunityPostComment[]
          // تحديث عدد التعليقات بناءً على التعليقات المحملة
          const actualCount = countAllComments(post.comments as CommunityPostComment[])
          post.comments_count = actualCount
        } else {
          commentsMap[post.id] = []
          // إذا لم تكن هناك تعليقات محملة، استخدم القيمة من API أو 0
          if (!post.comments_count) {
            post.comments_count = 0
          }
        }
      }
      
      // تحديث جميع التعليقات دفعة واحدة لتجنب أي مشاكل في التحديث
      setPostAttachments(attachmentsMap)
      setPostComments(commentsMap)
      setPosts(postsData)
    } catch (error) {
      console.error('Error loading posts:', error)
      toast.error('فشل تحميل المنشورات')
    } finally {
      setLoadingPosts(false)
    }
  }

  const loadComments = async (postId: string) => {
    try {
      console.log('Loading comments for post:', postId)
      
      setLoadingComments(prev => {
        const newState = { ...prev }
        newState[postId] = true
        return newState
      })
      
      const response = await courseCommunitiesApi.listComments({ post: postId })
      const comments = response.results || []
      
      console.log('Loaded comments for post', postId, ':', comments.length, 'comments')
      
      // تحديث التعليقات فقط للمنشور المحدد - تأكد من عدم التأثير على المنشورات الأخرى
      setPostComments(prev => {
        const newComments = { ...prev }
        // تأكد من أننا نحدث فقط التعليقات للمنشور المحدد
        newComments[postId] = [...comments] // استخدام spread لإنشاء نسخة جديدة
        console.log('Updated postComments for post', postId, ':', newComments[postId].length, 'comments')
        return newComments
      })
      
      // تحديث عدد التعليقات في المنشور بناءً على التعليقات المحملة
      const countAllComments = (commentList: CommunityPostComment[]): number => {
        let count = 0
        for (const comment of commentList) {
          count++
          if (comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0) {
            count += countAllComments(comment.replies as CommunityPostComment[])
          }
        }
        return count
      }
      
      const actualCount = countAllComments(comments)
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? {
                ...p,
                comments_count: actualCount
              }
            : p
        )
      )
    } catch (error) {
      console.error('Error loading comments:', error)
      toast.error('فشل تحميل التعليقات')
    } finally {
      setLoadingComments(prev => {
        const newState = { ...prev }
        newState[postId] = false
        return newState
      })
    }
  }

  // حساب عدد التعليقات الفعلي (يشمل الردود)
  const getCommentsCount = (postId: string): number => {
    const comments = postComments[postId]
    if (!comments || !Array.isArray(comments)) {
      return 0
    }
    
    // حساب جميع التعليقات بما في ذلك الردود
    const countAllComments = (commentList: CommunityPostComment[]): number => {
      let count = 0
      for (const comment of commentList) {
        count++ // التعليق نفسه
        if (comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0) {
          count += countAllComments(comment.replies as CommunityPostComment[])
        }
      }
      return count
    }
    
    return countAllComments(comments)
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

      console.log('Adding comment to post:', postId, 'parentCommentId:', parentCommentId)

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
      
      // Reload comments to get the new comment - فقط للمنشور المحدد
      // استخدام setTimeout بسيط لضمان أن API قد تم تحديثه
      setTimeout(async () => {
        console.log('Reloading comments for post:', postId)
        await loadComments(postId)
      }, 300)
      
      // تحديث عدد التعليقات فقط بدون إعادة تحميل جميع المنشورات
      // loadPosts() تم إزالته لتجنب إعادة تحميل جميع المنشورات
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

  const handleUpdateComment = async () => {
    if (!selectedComment) return
    try {
      await courseCommunitiesApi.updateComment(selectedComment.id, {
        content: editCommentText.trim()
      })
      toast.success('تم تحديث التعليق بنجاح')
      setShowEditCommentDialog(false)
      setSelectedComment(null)
      setEditCommentText('')
      
      // Reload comments
      if (selectedComment.post) {
        loadComments(selectedComment.post)
      }
    } catch (error: any) {
      console.error('Error updating comment:', error)
      toast.error(error?.response?.data?.detail || 'فشل تحديث التعليق')
    }
  }

  const handleDeleteComment = async () => {
    if (!selectedComment) return
    const postId = selectedComment.post
    if (!postId) return
    
    // حفظ العدد الأصلي قبل الحذف
    const post = posts.find(p => p.id === postId)
    const originalCount = post?.comments_count || 0
    
    try {
      // Optimistic update: تحديث العدد فوراً
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
      
      // حذف التعليق من الحالة أيضاً
      if (postComments[postId]) {
        const countComments = (comments: CommunityPostComment[]): number => {
          let count = 0
          comments.forEach(comment => {
            count++
            if (comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0) {
              count += countComments(comment.replies as CommunityPostComment[])
            }
          })
          return count
        }
        
        // إزالة التعليق من الحالة
        const removeComment = (comments: CommunityPostComment[], commentId: string): CommunityPostComment[] => {
          return comments
            .filter(comment => comment.id !== commentId)
            .map(comment => ({
              ...comment,
              replies: comment.replies && Array.isArray(comment.replies)
                ? removeComment(comment.replies as CommunityPostComment[], commentId)
                : comment.replies
            }))
        }
        
        setPostComments(prev => ({
          ...prev,
          [postId]: removeComment(prev[postId], selectedComment.id)
        }))
      }
      
      await courseCommunitiesApi.deleteComment(selectedComment.id)
      toast.success('تم حذف التعليق بنجاح')
      setShowDeleteCommentDialog(false)
      setSelectedComment(null)
      
      // Reload comments to sync
      if (postId) {
        await loadComments(postId)
      }
      // Reload posts to sync with backend
      loadPosts()
    } catch (error: any) {
      console.error('Error deleting comment:', error)
      toast.error(error?.response?.data?.detail || 'فشل حذف التعليق')
      
      // Rollback: إعادة العدد الأصلي في حالة الخطأ
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? {
                ...p,
                comments_count: originalCount
              }
            : p
        )
      )
      
      // إعادة تحميل التعليقات في حالة الخطأ
      if (postId) {
        loadComments(postId)
      }
    }
  }

  const handleMarkHelpful = async (commentId: string, postId: string) => {
    try {
      await courseCommunitiesApi.markCommentHelpful(commentId)
      loadComments(postId)
    } catch (error: any) {
      console.error('Error marking comment as helpful:', error)
      toast.error('فشل تحديث حالة التعليق')
    }
  }

  const openEditCommentDialog = (comment: CommunityPostComment) => {
    setSelectedComment(comment)
    setEditCommentText(comment.content)
    setShowEditCommentDialog(true)
  }

  const openDeleteCommentDialog = (comment: CommunityPostComment) => {
    setSelectedComment(comment)
    setShowDeleteCommentDialog(true)
  }

  const renderComment = (comment: CommunityPostComment, postId: string, level: number = 0) => {
    const replies = Array.isArray(comment.replies) ? comment.replies : []
    
    return (
      <div key={comment.id} className={level > 0 ? 'mr-8 mt-3' : ''}>
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
          <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700">
            <AvatarImage 
              src={comment.author.profile_image_url ? getProxiedImageUrl(comment.author.profile_image_url, false) : undefined} 
              alt={comment.author.get_full_name || 'صاحب التعليق'}
              onError={(e) => {
                const currentSrc = (e.target as HTMLImageElement).src
                const originalUrl = comment.author.profile_image_url
                console.log('❌ Comment author image error:', { currentSrc, originalUrl, author: comment.author.get_full_name })
                if (originalUrl) {
                  if (currentSrc.includes('/auth/image-proxy/')) {
                    console.log('🔄 Trying direct URL')
                    (e.target as HTMLImageElement).src = originalUrl
                  } else {
                    // Try backend proxy if direct URL failed
                    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'
                    const proxyUrl = `${apiUrl}/auth/image-proxy/?url=${encodeURIComponent(originalUrl)}`
                    console.log('🔄 Trying backend proxy:', proxyUrl)
                    (e.target as HTMLImageElement).src = proxyUrl
                  }
                }
              }}
              onLoad={() => {
                console.log('✅ Comment author image loaded')
              }}
            />
            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs font-semibold">
              {comment.author.get_full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                {comment.author.get_full_name}
              </h4>
              {comment.is_helpful && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700">
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
                onClick={() => handleMarkHelpful(comment.id, postId)}
                className={`h-7 px-2 text-xs ${comment.is_helpful ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {comment.is_helpful ? '✓ مفيد' : 'مفيد'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const key = `${postId}-${comment.id}`
                  if (!replyTexts[key]) {
                    setReplyTexts(prev => ({ ...prev, [key]: '' }))
                  }
                }}
                className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
              >
                رد
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditCommentDialog(comment)}
                className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
              >
                تعديل
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openDeleteCommentDialog(comment)}
                className="h-7 px-2 text-xs text-red-500 hover:text-red-700"
              >
                حذف
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (selectedFiles.length + files.length > 10) {
      toast.error('يمكن رفع 10 ملفات كحد أقصى لكل مشاركة')
      return
    }

    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const validVideoTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv']
    const validDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
    const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg']
    const validArchiveTypes = ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']

    const maxSizes = {
      image: 10 * 1024 * 1024,
      video: 100 * 1024 * 1024,
      document: 20 * 1024 * 1024,
      audio: 50 * 1024 * 1024,
      archive: 50 * 1024 * 1024
    }

    const validFiles: File[] = []
    
    for (const file of files) {
      let fileType: 'image' | 'video' | 'document' | 'audio' | 'archive' | null = null
      let maxSize = 0

      if (validImageTypes.includes(file.type)) {
        fileType = 'image'
        maxSize = maxSizes.image
      } else if (validVideoTypes.includes(file.type)) {
        fileType = 'video'
        maxSize = maxSizes.video
      } else if (validDocumentTypes.includes(file.type)) {
        fileType = 'document'
        maxSize = maxSizes.document
      } else if (validAudioTypes.includes(file.type)) {
        fileType = 'audio'
        maxSize = maxSizes.audio
      } else if (validArchiveTypes.includes(file.type)) {
        fileType = 'archive'
        maxSize = maxSizes.archive
      }

      if (!fileType) {
        toast.error(`نوع الملف ${file.name} غير مدعوم`)
        continue
      }

      if (file.size > maxSize) {
        toast.error(`حجم الملف ${file.name} كبير جداً (الحد الأقصى: ${maxSize / (1024 * 1024)}MB)`)
        continue
      }

      validFiles.push(file)
    }

    setSelectedFiles([...selectedFiles, ...validFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />
      case 'video':
        return <Video className="w-4 h-4" />
      case 'audio':
        return <Music className="w-4 h-4" />
      case 'archive':
        return <Archive className="w-4 h-4" />
      default:
        return <File className="w-4 h-4" />
    }
  }

  const handleCreatePost = async () => {
    if (!formData.title || !formData.content) {
      toast.error('يرجى إدخال العنوان والمحتوى')
      return
    }

    setUploadingFiles(true)
    try {
      const newPost = await courseCommunitiesApi.createPost({
        community: communityId,
        post_type: formData.post_type,
        title: formData.title,
        content: formData.content,
        attachments: []
      })

      // Check if post ID exists - sometimes API returns the data sent instead of created post
      let postId = newPost?.id
      
      // If no ID, wait a bit and reload posts to get the latest one (workaround)
      if (!postId) {
        console.warn('Post ID not in response, waiting and reloading posts...')
        // Wait a bit for backend to process
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Get the most recent post (should be the one we just created)
        const latestPosts = await courseCommunitiesApi.listPosts({ community: communityId })
        if (latestPosts.results && latestPosts.results.length > 0) {
          // Find the post that matches what we just created
          const matchingPost = latestPosts.results.find(post => 
            post.title === formData.title && 
            post.content === formData.content &&
            post.post_type === formData.post_type
          )
          
          if (matchingPost) {
            postId = matchingPost.id
            console.log('Found post ID from reload:', postId)
          } else {
            // If no exact match, take the first one (most recent)
            postId = latestPosts.results[0].id
            console.log('Using most recent post ID:', postId)
          }
        }
      }

      if (!postId) {
        console.error('Post creation failed - no ID returned:', newPost)
        toast.error('فشل إنشاء المنشور - لم يتم إرجاع معرف المنشور')
        setUploadingFiles(false)
        // Still reload posts to show the new post even if we can't upload attachments
        await loadPosts()
        setIsCreatingPost(false)
        setFormData({ post_type: 'discussion', title: '', content: '', attachments: '' })
        setSelectedFiles([])
        return
      }

      // Upload files if any
      if (selectedFiles.length > 0 && postId) {
        const uploadedAttachments: any[] = []
        for (const file of selectedFiles) {
          try {
            const attachment = await courseCommunitiesApi.uploadPostAttachment(postId, file, false)
            uploadedAttachments.push(attachment)
          } catch (error: any) {
            console.error(`Error uploading file ${file.name}:`, error)
            toast.error(`فشل رفع الملف ${file.name}: ${error?.response?.data?.detail || error?.message || 'خطأ غير معروف'}`)
          }
        }
        
        if (uploadedAttachments.length > 0) {
          setPostAttachments(prev => ({
            ...prev,
            [postId]: uploadedAttachments
          }))
        }
      }

      toast.success('تم إنشاء المنشور بنجاح')
      setIsCreatingPost(false)
      setFormData({ post_type: 'discussion', title: '', content: '', attachments: '' })
      setSelectedFiles([])
      await loadPosts()
    } catch (error: any) {
      console.error('Error creating post:', error)
      toast.error(error?.response?.data?.detail || error?.message || 'فشل إنشاء المنشور')
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleUpdatePost = async () => {
    if (!selectedPost) return
    try {
      const attachments = formData.attachments 
        ? formData.attachments.split(',').map(url => url.trim()).filter(url => url)
        : undefined
      
      await courseCommunitiesApi.updatePost(selectedPost.id, {
        post_type: formData.post_type,
        title: formData.title,
        content: formData.content,
        attachments: attachments
      })
      toast.success('تم تحديث المنشور بنجاح')
      setShowEditDialog(false)
      setSelectedPost(null)
      setFormData({ post_type: 'discussion', title: '', content: '', attachments: '' })
      loadPosts()
    } catch (error: any) {
      console.error('Error updating post:', error)
      toast.error(error?.response?.data?.detail || 'فشل تحديث المنشور')
    }
  }

  const handleDeletePost = async () => {
    if (!selectedPost) return
    try {
      await courseCommunitiesApi.deletePost(selectedPost.id)
      toast.success('تم حذف المنشور بنجاح')
      setShowDeleteDialog(false)
      setSelectedPost(null)
      loadPosts()
    } catch (error: any) {
      console.error('Error deleting post:', error)
      toast.error(error?.response?.data?.detail || 'فشل حذف المنشور')
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

  const handlePinPost = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId)
      if (post?.is_pinned) {
        await courseCommunitiesApi.unpinPost(postId)
      } else {
        await courseCommunitiesApi.pinPost(postId)
      }
      loadPosts()
    } catch (error: any) {
      console.error('Error toggling pin:', error)
      toast.error('فشل تحديث التثبيت')
    }
  }

  const openEditDialog = (post: CommunityPost) => {
    setSelectedPost(post)
    const attachments = Array.isArray(post.attachments) 
      ? post.attachments.join(', ')
      : post.attachments || ''
    setFormData({
      post_type: post.post_type,
      title: post.title,
      content: post.content,
      attachments: attachments
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (post: CommunityPost) => {
    setSelectedPost(post)
    setShowDeleteDialog(true)
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

  // Sort posts: pinned first, then by date
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-6">
      {/* Create Post Card - Facebook Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white dark:bg-slate-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <CardContent className="p-4">
            {!isCreatingPost ? (
              <>
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-10 h-10 border-2 border-gray-200 dark:border-gray-700">
                    <AvatarImage src={userProfileImage || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-sm font-semibold">
                      {userName?.charAt(0) || user?.full_name?.charAt(0) || user?.first_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFormData({ post_type: 'discussion', title: '', content: '', attachments: '' })
                      setSelectedFiles([])
                      setIsCreatingPost(true)
                    }}
                    className="flex-1 justify-start text-right h-auto p-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
                  >
                    <span className="text-sm font-medium">شارك ما يدور في ذهنك{userName ? `، ${userName}` : ''}...</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData({ post_type: 'discussion', title: '', content: '', attachments: '' })
                      setSelectedFiles([])
                      setIsCreatingPost(true)
                    }}
                    className="flex-1 gap-2 h-9 rounded-lg text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">صورة</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData({ post_type: 'discussion', title: '', content: '', attachments: '' })
                      setSelectedFiles([])
                      setIsCreatingPost(true)
                    }}
                    className="flex-1 gap-2 h-9 rounded-lg text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span className="text-xs font-medium">فيديو</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData({ post_type: 'discussion', title: '', content: '', attachments: '' })
                      setSelectedFiles([])
                      setIsCreatingPost(true)
                    }}
                    className="flex-1 gap-2 h-9 rounded-lg text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span className="text-xs font-medium">ملف</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">إنشاء منشور جديد</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCreatingPost(false)
                      setFormData({ post_type: 'discussion', title: '', content: '', attachments: '' })
                      setSelectedFiles([])
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 border-2 border-gray-200 dark:border-gray-700">
                    <AvatarImage src={userProfileImage || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-sm font-semibold">
                      {userName?.charAt(0) || user?.full_name?.charAt(0) || user?.first_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Select
                      value={formData.post_type}
                      onValueChange={(value: any) => setFormData({ ...formData, post_type: value })}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discussion">مناقشة</SelectItem>
                        <SelectItem value="announcement">إعلان</SelectItem>
                        <SelectItem value="question">سؤال</SelectItem>
                        <SelectItem value="resource">مورد</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="عنوان المنشور..."
                      className="h-10 text-sm"
                    />
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="ماذا تريد أن تقول؟"
                      rows={4}
                      className="text-sm resize-none"
                    />
                    
                    {/* File Upload */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="file-input-inline"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,audio/*"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('file-input-inline')?.click()}
                          className="h-8 text-xs"
                          disabled={selectedFiles.length >= 10}
                        >
                          <Paperclip className="w-3 h-3 ml-1" />
                          إرفاق ({selectedFiles.length}/10)
                        </Button>
                      </div>
                      
                      {selectedFiles.length > 0 && (
                        <div className="space-y-1">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-700">
                              <div className="text-gray-600 dark:text-gray-400">
                                {getFileIcon(
                                  file.type.startsWith('image/') ? 'image' :
                                  file.type.startsWith('video/') ? 'video' :
                                  file.type.startsWith('audio/') ? 'audio' :
                                  file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z') ? 'archive' :
                                  'document'
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-700 dark:text-gray-300 truncate">{file.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsCreatingPost(false)
                          setFormData({ post_type: 'discussion', title: '', content: '', attachments: '' })
                          setSelectedFiles([])
                        }}
                        className="h-9 text-xs"
                      >
                        إلغاء
                      </Button>
                      <Button
                        onClick={handleCreatePost}
                        disabled={(!formData.title || !formData.content) || uploadingFiles}
                        className="h-9 text-xs bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 text-white"
                      >
                        {uploadingFiles ? 'جاري النشر...' : 'نشر'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                setFormData({ post_type: 'discussion', title: '', content: '', attachments: '' })
                setShowCreateDialog(true)
              }}
              className="gap-2"
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
                        <AvatarImage 
                          src={post.author.profile_image_url ? getProxiedImageUrl(post.author.profile_image_url, false) : undefined} 
                          alt={post.author.get_full_name || 'صاحب المنشور'}
                          onError={(e) => {
                            const currentSrc = (e.target as HTMLImageElement).src
                            const originalUrl = post.author.profile_image_url
                            console.log('❌ Post author image error:', { currentSrc, originalUrl, author: post.author.get_full_name })
                            if (originalUrl) {
                              if (currentSrc.includes('/auth/image-proxy/')) {
                                console.log('🔄 Trying direct URL')
                                (e.target as HTMLImageElement).src = originalUrl
                              } else {
                                // Try backend proxy if direct URL failed
                                const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'
                                const proxyUrl = `${apiUrl}/auth/image-proxy/?url=${encodeURIComponent(originalUrl)}`
                                console.log('🔄 Trying backend proxy:', proxyUrl)
                                (e.target as HTMLImageElement).src = proxyUrl
                              }
                            }
                          }}
                          onLoad={() => {
                            console.log('✅ Post author image loaded')
                          }}
                        />
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
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePinPost(post.id)}
                        className="h-8 w-8 p-0"
                        title={post.is_pinned ? 'إلغاء التثبيت' : 'تثبيت'}
                      >
                            <Pin className={`w-4 h-4 ${post.is_pinned ? 'text-amber-600 fill-amber-600' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(post)}
                        className="h-8 w-8 p-0"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4 text-gray-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(post)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                  
                  {/* Display attachments from API */}
                  {postAttachments[post.id] && postAttachments[post.id].length > 0 && (
                    <div className="mb-4 space-y-3">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">المرفقات:</div>
                      
                      {/* Images Grid - Display images in a grid */}
                      {postAttachments[post.id].filter(att => att.file_type === 'image').length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {postAttachments[post.id]
                            .filter(attachment => attachment.file_type === 'image')
                            .map((attachment) => (
                              <div
                                key={attachment.id}
                                className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
                              >
                                <a
                                  href={attachment.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={getProxiedImageUrl(attachment.file_url, false)}
                                    alt={attachment.original_name}
                                    className="w-full h-48 object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      const currentSrc = e.currentTarget.src
                                      const originalUrl = attachment.file_url
                                      
                                      // Try backend proxy if direct URL fails
                                      if (originalUrl && !currentSrc.includes('/auth/image-proxy/')) {
                                        const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'
                                        e.currentTarget.src = `${apiUrl}/auth/image-proxy/?url=${encodeURIComponent(originalUrl)}`
                                      } else if (currentSrc.includes('/auth/image-proxy/')) {
                                        // Backend proxy also failed, hide image
                                        console.warn('Image failed to load, hiding:', originalUrl)
                                        e.currentTarget.style.display = 'none'
                                      }
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-gray-900/90 px-3 py-1 rounded-lg">
                                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                                        {attachment.original_name}
                                      </span>
                                    </div>
                                  </div>
                                </a>
                              </div>
                            ))}
                        </div>
                      )}
                      
                      {/* Other Files - Display non-image files as download links */}
                      {postAttachments[post.id].filter(att => att.file_type !== 'image').length > 0 && (
                        <div className="space-y-2">
                          {postAttachments[post.id]
                            .filter(attachment => attachment.file_type !== 'image')
                            .map((attachment) => (
                              <div
                                key={attachment.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                              >
                                <div className="text-gray-600 dark:text-gray-400 flex-shrink-0">
                                  {getFileIcon(attachment.file_type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <a
                                    href={attachment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 truncate block"
                                  >
                                    {attachment.original_name}
                                  </a>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {attachment.file_type_display} • {formatFileSize(attachment.file_size)}
                                  </div>
                                </div>
                                <a
                                  href={attachment.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex-shrink-0"
                                  download
                                >
                                  <Download className="w-5 h-5" />
                                </a>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Legacy Attachments (from post.attachments) */}
                  {post.attachments && (!postAttachments[post.id] || postAttachments[post.id].length === 0) && (
                    <div className="mb-4">
                      {Array.isArray(post.attachments) ? (
                        <div className="space-y-3">
                          {post.attachments.map((url, index) => {
                            // Check if URL is an image
                            const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
                            return isImage ? (
                              <div key={index} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                <img
                                  src={getProxiedImageUrl(url, false)}
                                  alt={`Attachment ${index + 1}`}
                                  className="w-full h-auto max-h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(url, '_blank')}
                                  onError={(e) => {
                                    const currentSrc = e.currentTarget.src
                                    const originalUrl = url
                                    // Try backend proxy if direct URL fails
                                    if (originalUrl && !currentSrc.includes('/auth/image-proxy/')) {
                                      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'
                                      e.currentTarget.src = `${apiUrl}/auth/image-proxy/?url=${encodeURIComponent(originalUrl)}`
                                    } else {
                                      e.currentTarget.style.display = 'none'
                                    }
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
                                src={getProxiedImageUrl(post.attachments, false)}
                                alt="Post attachment"
                                className="w-full h-auto max-h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(post.attachments, '_blank')}
                                onError={(e) => {
                                  const currentSrc = e.currentTarget.src
                                  const originalUrl = post.attachments
                                  // Try backend proxy if direct URL fails
                                  if (originalUrl && !currentSrc.includes('/auth/image-proxy/')) {
                                    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'
                                    e.currentTarget.src = `${apiUrl}/auth/image-proxy/?url=${encodeURIComponent(originalUrl)}`
                                  } else {
                                    e.currentTarget.style.display = 'none'
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <a
                              href={post.attachments}
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
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
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
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                        {postComments[post.id] && postComments[post.id].length > 0 
                          ? getCommentsCount(post.id) 
                          : (post.comments_count ?? 0)}
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

      {/* Create Post Dialog - Keep for backward compatibility */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open)
        if (!open) {
          setSelectedFiles([])
          setIsCreatingPost(false)
        }
      }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-slate-900" dir="rtl">
          <div className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl -m-6 p-6">
            <DialogHeader className="text-center pb-6">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-amber-800 to-orange-700 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-2">
                منشور جديد
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                شارك أفكارك ومحتواك مع المجتمع
              </DialogDescription>
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
                    <SelectItem value="announcement">إعلان</SelectItem>
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
              {/* File Upload Section */}
              <div>
                <Label className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  المرفقات
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="file-input-create"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,audio/*"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-input-create')?.click()}
                      className="border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                      disabled={selectedFiles.length >= 10}
                    >
                      <Paperclip className="w-4 h-4 ml-2" />
                      إرفاق ملفات ({selectedFiles.length}/10)
                    </Button>
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-700">
                          <div className="text-gray-600 dark:text-gray-400">
                            {getFileIcon(
                              file.type.startsWith('image/') ? 'image' :
                              file.type.startsWith('video/') ? 'video' :
                              file.type.startsWith('audio/') ? 'audio' :
                              file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z') ? 'archive' :
                              'document'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                disabled={(!formData.title || !formData.content) || uploadingFiles}
                className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 text-white rounded-xl px-6 py-2.5 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {uploadingFiles ? 'جاري الرفع...' : (
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

      {/* Edit Post Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-slate-900" dir="rtl">
          <div className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl -m-6 p-6">
            <DialogHeader className="text-center pb-6">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-amber-800 to-orange-700 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-2">
                تعديل المنشور
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
                    <SelectItem value="announcement">إعلان</SelectItem>
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
                  rows={6}
                  className="text-base border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl resize-none"
                />
              </div>
              <div>
                <Label className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  المرفقات
                </Label>
                <Input
                  value={formData.attachments}
                  onChange={(e) => setFormData({ ...formData, attachments: e.target.value })}
                  placeholder="روابط مفصولة بفواصل"
                  className="h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 relative z-10">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="border-2 rounded-xl px-6 py-2.5 font-semibold"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleUpdatePost}
                disabled={!formData.title || !formData.content}
                className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 text-white rounded-xl px-6 py-2.5 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Post Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>حذف المنشور</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف المنشور "{selectedPost?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeletePost}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Comment Dialog */}
      <Dialog open={showEditCommentDialog} onOpenChange={setShowEditCommentDialog}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-900" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل التعليق</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editCommentText}
              onChange={(e) => setEditCommentText(e.target.value)}
              placeholder="نص التعليق"
              rows={4}
              className="text-base border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditCommentDialog(false)
              setSelectedComment(null)
              setEditCommentText('')
            }}>
              إلغاء
            </Button>
            <Button
              onClick={handleUpdateComment}
              disabled={!editCommentText.trim()}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 text-white shadow-lg"
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Comment Dialog */}
      <Dialog open={showDeleteCommentDialog} onOpenChange={setShowDeleteCommentDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>حذف التعليق</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا التعليق؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteCommentDialog(false)
              setSelectedComment(null)
            }}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeleteComment}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

