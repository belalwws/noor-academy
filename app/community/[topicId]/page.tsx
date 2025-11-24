'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import {
  ArrowRight,
  Heart,
  MessageSquare,
  Flag,
  Pin,
  Lock,
  Eye,
  Reply,
  MoreVertical,
  Edit,
  Trash2,
  Bookmark,
  Paperclip,
  X,
  Image as ImageIcon,
  File,
  Video,
  Music,
  Archive
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { communityApi, type Topic, type Post, type Author, type PostAttachment } from '@/lib/api/community'
import { useAuth } from '@/lib/hooks/useAuth'

const TopicDetailPage = () => {
  const params = useParams()
  const topicId = params['topicId'] as string

  const [topic, setTopic] = useState<Topic | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(false)
  const [newReply, setNewReply] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportingPost, setReportingPost] = useState<string | null>(null)
  const [reportingTopic, setReportingTopic] = useState<boolean>(false)
  const [reportData, setReportData] = useState({ reason: '', description: '' })
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSuggestions, setMentionSuggestions] = useState<Author[]>([])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [postAttachments, setPostAttachments] = useState<Record<string, PostAttachment[]>>({})

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (topicId) {
      loadTopic()
      loadPosts()
      loadBookmarkStatus()
    }
  }, [topicId])

  const loadTopic = async () => {
    try {
      const topicData = await communityApi.getTopic(topicId)
      setTopic(topicData)
    } catch (error) {
      console.error('Error loading topic:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل الموضوع",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadPosts = async () => {
    setPostsLoading(true)
    try {
      const postsData = await communityApi.getPosts(topicId)
      setPosts(postsData.results)
      
      // Load attachments for each post
      const attachmentsMap: Record<string, PostAttachment[]> = {}
      for (const post of postsData.results) {
        try {
          const attachmentsData = await communityApi.getPostAttachments(post.id)
          attachmentsMap[post.id] = attachmentsData.results
        } catch (error) {
          console.error(`Error loading attachments for post ${post.id}:`, error)
          attachmentsMap[post.id] = []
        }
      }
      setPostAttachments(attachmentsMap)
    } catch (error) {
      console.error('Error loading posts:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل المشاركات",
        variant: "destructive"
      })
    } finally {
      setPostsLoading(false)
    }
  }

  const loadBookmarkStatus = async () => {
    try {
      const bookmarkStatus = await communityApi.getBookmarkStatus(topicId)
      setIsBookmarked(bookmarkStatus.bookmarked)
    } catch (error) {
      console.error('Error loading bookmark status:', error)
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      const result = await communityApi.likePost(postId)
      
      // Update posts state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            is_liked: result.liked,
            likes_count: result.likes_count
          }
        }
        // Also update nested replies
        if (post.replies) {
          return {
            ...post,
            replies: post.replies.map(reply => 
              reply.id === postId 
                ? { ...reply, is_liked: result.liked, likes_count: result.likes_count }
                : reply
            )
          }
        }
        return post
      }))

      toast({
        title: result.liked ? "تم الإعجاب" : "تم إلغاء الإعجاب",
        description: result.liked ? "تم إضافة إعجابك" : "تم إلغاء إعجابك"
      })
    } catch (error) {
      console.error('Error liking post:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في تسجيل الإعجاب",
        variant: "destructive"
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate file count (max 10 files per post)
    if (selectedFiles.length + files.length > 10) {
      toast({
        title: "خطأ",
        description: "يمكن رفع 10 ملفات كحد أقصى لكل مشاركة",
        variant: "destructive"
      })
      return
    }

    // Validate file types and sizes
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const validVideoTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv']
    const validDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
    const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg']
    const validArchiveTypes = ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']

    const maxSizes = {
      image: 10 * 1024 * 1024, // 10MB
      video: 100 * 1024 * 1024, // 100MB
      document: 20 * 1024 * 1024, // 20MB
      audio: 50 * 1024 * 1024, // 50MB
      archive: 50 * 1024 * 1024 // 50MB
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
        toast({
          title: "خطأ",
          description: `نوع الملف ${file.name} غير مدعوم`,
          variant: "destructive"
        })
        continue
      }

      if (file.size > maxSize) {
        toast({
          title: "خطأ",
          description: `حجم الملف ${file.name} كبير جداً (الحد الأقصى: ${maxSize / (1024 * 1024)}MB)`,
          variant: "destructive"
        })
        continue
      }

      validFiles.push(file)
    }

    setSelectedFiles([...selectedFiles, ...validFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const handleReply = async (postId?: string) => {
    if (!newReply.trim() && selectedFiles.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى كتابة محتوى الرد أو إرفاق ملف",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    setUploadingFiles(true)
    try {
      const newPost = await communityApi.createPost({
        content: newReply,
        topic: topicId,
        parent: postId
      })

      // Upload files if any
      if (selectedFiles.length > 0) {
        const uploadedAttachments: PostAttachment[] = []
        for (const file of selectedFiles) {
          try {
            const attachment = await communityApi.uploadPostAttachment(newPost.id, file, false)
            uploadedAttachments.push(attachment)
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error)
            toast({
              title: "تحذير",
              description: `فشل رفع الملف ${file.name}`,
              variant: "destructive"
            })
          }
        }
        
        // Update attachments map
        setPostAttachments(prev => ({
          ...prev,
          [newPost.id]: uploadedAttachments
        }))
      }

      if (postId) {
        // Reply to specific post - add to replies
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              replies: [...(post.replies || []), newPost]
            }
          }
          return post
        }))
      } else {
        // New main post
        setPosts([...posts, newPost])
      }

      setNewReply('')
      setReplyingTo(null)
      setSelectedFiles([])
      
      toast({
        title: "تم بنجاح",
        description: "تم إرسال الرد بنجاح"
      })
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في إرسال الرد",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
      setUploadingFiles(false)
    }
  }

  const handleReport = async () => {
    if (!reportData.reason) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار سبب الإبلاغ",
        variant: "destructive"
      })
      return
    }

    try {
      if (reportingTopic && topic) {
        // Report the topic directly
        await communityApi.createReport({
          topic: topic.id,
          reason: reportData.reason,
          description: reportData.description,
          report_type: 'topic'
        })
      } else if (reportingPost) {
        // Report a specific post
        await communityApi.createReport({
          post: reportingPost,
          reason: reportData.reason,
          description: reportData.description,
          report_type: 'post'
        })
      }

      toast({
        title: "تم الإبلاغ",
        description: "تم إرسال البلاغ للمراجعة"
      })

      setShowReportDialog(false)
      setReportingPost(null)
      setReportingTopic(false)
      setReportData({ reason: '', description: '' })
    } catch (error) {
      console.error('Error reporting content:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في إرسال البلاغ",
        variant: "destructive"
      })
    }
  }

  const handleBookmark = async () => {
    try {
      await communityApi.toggleBookmark(topicId)
      setIsBookmarked(!isBookmarked)
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في إضافة الإشارة المرجعية",
        variant: "destructive"
      })
    }
  }

  const handleReplyChange = (value: string) => {
    setNewReply(value)
    const mentionRegex = /@(\w+)/g
    const mentions = value.match(mentionRegex)
    if (mentions) {
      setShowMentions(true)
      const mentionUsers = mentions.map(mention => mention.replace('@', ''))
      communityApi.getSuggestedMentions(mentionUsers).then(users => setMentionSuggestions(users))
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (username: string) => {
    const mentionRegex = /@(\w+)/g
    const mentions = newReply.match(mentionRegex)
    if (mentions) {
      const newReplyValue = newReply.replace(mentionRegex, `@${username}`)
      setNewReply(newReplyValue)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'teacher': return 'bg-blue-100 text-blue-800'
      case 'supervisor': return 'bg-purple-100 text-purple-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'teacher': return 'معلم'
      case 'supervisor': return 'مشرف'
      default: return 'طالب'
    }
  }

  const canModerate = () => {
    return user && user.role === 'supervisor'
  }

  const canEdit = (author: Author) => {
    return user && author && (user.id === author?.id || canModerate())
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const renderPost = (post: Post, isReply = false) => (
    <div key={post.id} className={`${isReply ? 'mr-12 mt-4' : ''}`}>
      <Card className={`${isReply ? 'bg-gradient-to-r from-blue-25 to-blue-25 border-blue-100' : 'bg-white/80 backdrop-blur-sm border-blue-100'} shadow-lg hover:shadow-xl transition-all duration-200`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-10 h-10 ring-2 ring-blue-200">
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-100 text-blue-700 font-semibold">
                {post.author?.full_name?.charAt(0) || post.author?.username?.charAt(0) || 'م'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{post.author?.full_name || post.author?.username || 'مستخدم'}</span>
                  <Badge className={`text-xs shadow-sm ${getRoleBadgeColor(post.author?.role || 'student')}`}>
                    {getRoleDisplayName(post.author?.role || 'student')}
                  </Badge>
                  <span className="text-sm text-slate-400">•</span>
                  <span className="text-sm text-slate-500">{formatDate(post.created_at)}</span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-blue-50 text-slate-500 hover:text-blue-600">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-blue-100">
                    <DropdownMenuItem
                      onClick={() => {
                        setReportingPost(post.id)
                        setReportingTopic(false)
                        setShowReportDialog(true)
                      }}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Flag className="w-4 h-4 ml-2" />
                      إبلاغ
                    </DropdownMenuItem>
                    {canEdit(post.author) && (
                      <>
                        <DropdownMenuItem className="hover:bg-blue-50 hover:text-blue-600">
                          <Edit className="w-4 h-4 ml-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{post.content}</p>
              </div>

              {/* Display attachments */}
              {postAttachments[post.id] && postAttachments[post.id].length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-600">المرفقات:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {postAttachments[post.id].map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        <div className="text-slate-600">
                          {getFileIcon(attachment.file_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <a
                            href={attachment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 truncate block"
                          >
                            {attachment.original_name}
                          </a>
                          <div className="text-xs text-slate-500">
                            {attachment.file_type_display} • {formatFileSize(attachment.file_size)}
                          </div>
                        </div>
                        {attachment.file_type === 'image' && (
                          <a
                            href={attachment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2"
                          >
                            <img
                              src={attachment.file_url}
                              alt={attachment.original_name}
                              className="w-16 h-16 object-cover rounded border border-slate-200"
                            />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikePost(post.id)}
                  className={`gap-1 transition-colors ${post.is_liked ? 'text-red-600 hover:text-red-700' : 'text-slate-500 hover:text-red-500'}`}
                >
                  <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                  <span>{post.likes_count}</span>
                </Button>
                
                {!topic?.is_locked && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (replyingTo === post.id) {
                        setReplyingTo(null)
                        setSelectedFiles([])
                      } else {
                        setReplyingTo(post.id)
                        setSelectedFiles([])
                      }
                    }}
                    className="gap-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Reply className="w-4 h-4" />
                    رد
                  </Button>
                )}
              </div>
              
              {replyingTo === post.id && (
                <div className="mt-4 space-y-3 p-4 bg-gradient-to-r from-blue-50 to-blue-50 rounded-lg border border-blue-100">
                  <Textarea
                    value={newReply}
                    onChange={(e: any) => handleReplyChange(e)}
                    placeholder="اكتب ردك هنا..."
                    className="border-blue-200 focus:border-blue-400 focus:ring-blue-200 resize-none"
                  />
                  {showMentions && (
                    <div className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-sm p-2 mt-2 rounded-lg">
                      {mentionSuggestions.map(user => (
                        <div key={user.id} className="flex items-center gap-2 p-2 hover:bg-blue-50 cursor-pointer" onClick={() => insertMention(user.username)}>
                          <Avatar className="w-6 h-6 ring-2 ring-blue-200">
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-100 text-blue-700 text-xs font-semibold">
                              {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{user.username}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* File Upload Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id={`file-input-${post.id}`}
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,audio/*"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`file-input-${post.id}`)?.click()}
                        className="border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                        disabled={selectedFiles.length >= 10}
                      >
                        <Paperclip className="w-4 h-4 ml-2" />
                        إرفاق ملفات ({selectedFiles.length}/10)
                      </Button>
                    </div>
                    
                    {selectedFiles.length > 0 && (
                      <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border border-blue-200">
                            <div className="text-slate-600">
                              {getFileIcon(
                                file.type.startsWith('image/') ? 'image' :
                                file.type.startsWith('video/') ? 'video' :
                                file.type.startsWith('audio/') ? 'audio' :
                                file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z') ? 'archive' :
                                'document'
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-slate-700 truncate">{file.name}</div>
                              <div className="text-xs text-slate-500">{formatFileSize(file.size)}</div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleReply(post.id)}
                      className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={submitting || uploadingFiles || (!newReply.trim() && selectedFiles.length === 0)}
                    >
                      {submitting && <Spinner size="sm" tone="contrast" className="ml-2" />}
                      {uploadingFiles ? 'جاري الرفع...' : 'إرسال الرد'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setReplyingTo(null)
                        setSelectedFiles([])
                      }}
                      size="sm"
                      className="border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Render replies */}
      {post.replies && post.replies.map(reply => renderPost(reply, true))}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-teal-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gradient-to-r from-blue-200 to-blue-200 rounded-lg w-1/3"></div>
            <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-100 rounded-xl shadow-sm"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl shadow-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-teal-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-700 bg-clip-text text-transparent mb-4">
              الموضوع غير موجود
            </h2>
            <Link href="/community">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                العودة للمجتمع
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-teal-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link href="/community">
          <Button 
            variant="ghost" 
            className="gap-2 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للمجتمع
          </Button>
        </Link>

        {/* Topic Header */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-blue-100 hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-t-lg">
            <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
              <span className="text-lg">{topic.forum.icon}</span>
              <span className="font-medium">{topic.forum.name}</span>
            </div>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {topic.is_pinned && <Pin className="w-5 h-5 text-amber-500" />}
                  {topic.is_locked && <Lock className="w-5 h-5 text-slate-500" />}
                  <CardTitle className="text-2xl bg-gradient-to-r from-blue-800 to-blue-800 bg-clip-text text-transparent">
                    {topic.title}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6 ring-2 ring-blue-200">
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-100 text-blue-700 text-xs font-semibold">
                        {topic.author?.full_name?.charAt(0) || topic.author?.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>بواسطة {topic.author?.full_name || topic.author?.username || 'مستخدم'}</span>
                    {topic.author && (
                      <Badge className={`text-xs shadow-sm ${getRoleBadgeColor(topic.author.role || 'student')}`}>
                        {getRoleDisplayName(topic.author.role || 'student')}
                      </Badge>
                    )}
                  </div>
                  <span>•</span>
                  <span>{formatDate(topic.created_at)}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Eye className="w-4 h-4" />
                    <span>{topic.views_count} مشاهدة</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleBookmark} 
                    className={`text-blue-600 hover:text-blue-800 ${isBookmarked ? 'text-blue-800' : ''}`}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    إشارة مرجعية
                  </Button>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-blue-50 text-slate-500 hover:text-blue-600">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-blue-100">
                  <DropdownMenuItem
                    onClick={() => {
                      setReportingTopic(true)
                      setReportingPost(null)
                      setShowReportDialog(true)
                    }}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Flag className="w-4 h-4 ml-2" />
                    إبلاغ عن الموضوع
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setReportingPost(topic.id)
                      setReportingTopic(false)
                      setShowReportDialog(true)
                    }}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Flag className="w-4 h-4 ml-2" />
                    إبلاغ
                  </DropdownMenuItem>
                  {canEdit(topic.author) && (
                    <>
                      <DropdownMenuItem className="hover:bg-blue-50 hover:text-blue-600">
                        <Edit className="w-4 h-4 ml-2" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose prose-slate max-w-none">
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{topic.content}</p>
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

        {/* Posts */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-700 to-blue-700 bg-clip-text text-transparent">
              المشاركات ({posts.length})
            </h3>
          </div>
          
          {postsLoading ? (
            <div className="flex justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-200 to-blue-200 rounded-full animate-pulse"></div>
                <Spinner size="lg" className="absolute top-2 left-2" />
              </div>
            </div>
          ) : (
            posts.map(post => renderPost(post))
          )}
        </div>

        {/* New Reply Form */}
        {!topic.is_locked && user ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-blue-100 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-t-lg">
              <CardTitle className="text-lg bg-gradient-to-r from-blue-700 to-blue-700 bg-clip-text text-transparent">
                إضافة مشاركة جديدة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Textarea
                value={newReply}
                onChange={(e: any) => handleReplyChange(e)}
                placeholder="اكتب ردك هنا..."
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-200 resize-none"
              />
              {showMentions && (
                <div className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-sm p-2 mt-2 rounded-lg">
                  {mentionSuggestions.map(user => (
                    <div key={user.id} className="flex items-center gap-2 p-2 hover:bg-blue-50 cursor-pointer" onClick={() => insertMention(user.username)}>
                      <Avatar className="w-6 h-6 ring-2 ring-blue-200">
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-100 text-blue-700 text-xs font-semibold">
                          {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.username}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* File Upload Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="file-input-main"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,audio/*"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-input-main')?.click()}
                    className="border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                    disabled={selectedFiles.length >= 10}
                  >
                    <Paperclip className="w-4 h-4 ml-2" />
                    إرفاق ملفات ({selectedFiles.length}/10)
                  </Button>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border border-blue-200">
                        <div className="text-slate-600">
                          {getFileIcon(
                            file.type.startsWith('image/') ? 'image' :
                            file.type.startsWith('video/') ? 'video' :
                            file.type.startsWith('audio/') ? 'audio' :
                            file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z') ? 'archive' :
                            'document'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-700 truncate">{file.name}</div>
                          <div className="text-xs text-slate-500">{formatFileSize(file.size)}</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleReply()}
                  className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={(!newReply.trim() && selectedFiles.length === 0) || submitting || uploadingFiles}
                >
                  {submitting && <Spinner size="sm" tone="contrast" className="ml-2" />}
                  {uploadingFiles ? 'جاري الرفع...' : 'إرسال المشاركة'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : topic.is_locked ? (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg">
            <CardContent className="py-8 text-center">
              <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full w-fit mx-auto mb-4">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-amber-800 font-medium text-lg">هذا الموضوع مغلق للمشاركات الجديدة</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
            <CardContent className="py-8 text-center">
              <p className="text-blue-800 font-medium text-lg mb-4">
                يجب تسجيل الدخول للمشاركة في النقاش
              </p>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  تسجيل الدخول
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent dir="rtl" className="border-blue-100">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-700 to-blue-700 bg-clip-text text-transparent">
              إبلاغ عن محتوى غير مناسب
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              يرجى اختيار سبب الإبلاغ وإضافة تفاصيل إضافية إذا لزم الأمر
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-slate-700">سبب الإبلاغ</label>
              <Select value={reportData.reason} onValueChange={(value) => setReportData({...reportData, reason: value})}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-200">
                  <SelectValue placeholder="اختر السبب" />
                </SelectTrigger>
                <SelectContent className="border-blue-100">
                  <SelectItem value="inappropriate">محتوى غير مناسب</SelectItem>
                  <SelectItem value="spam">رسائل مزعجة</SelectItem>
                  <SelectItem value="harassment">تحرش أو إساءة</SelectItem>
                  <SelectItem value="false_info">معلومات خاطئة</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-slate-700">تفاصيل إضافية (اختياري)</label>
              <Textarea
                placeholder="اكتب تفاصيل إضافية..."
                value={reportData.description}
                onChange={(e) => setReportData({...reportData, description: e.target.value})}
                rows={3}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-200 resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowReportDialog(false)}
                className="border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleReport} 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                إرسال البلاغ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TopicDetailPage


