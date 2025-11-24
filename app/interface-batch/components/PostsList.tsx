'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PostCard from './PostCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Search, Video, Users, Clock, GraduationCap, ExternalLink, Plus, Megaphone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { sessionService } from '@/lib/services/sessionService'
import { useRouter } from 'next/navigation'
import type { Session } from '@/types/session'
import { announcementNotesAPI, type AnnouncementNote } from '@/lib/api/notes'
import { toast } from 'sonner'

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

interface PostsListProps {
  courseId?: string
  userRole?: 'teacher' | 'student'
  isActualTeacher?: boolean // True only for actual teachers, false for supervisors
  userName?: string
  userAvatar?: string
  batchId?: string
  onActiveSessionsChange?: (hasActiveSessions: boolean) => void // Callback to notify parent about active sessions
}

export default function PostsList({
  courseId,
  userRole = 'student',
  isActualTeacher = false,
  userName = "المستخدم",
  userAvatar,
  batchId,
  onActiveSessionsChange
}: PostsListProps) {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [activeSessions, setActiveSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [announcements, setAnnouncements] = useState<AnnouncementNote[]>([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(true)
  const [sessionsLoading, setSessionsLoading] = useState(true)
  
  // Create announcement dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    is_important: false,
    is_pinned: false
  })
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Helper functions for session status (defined before useEffects)
  // Helper function to check if session is expired
  // Trust backend's remaining_time calculation - if it's not "00:00", session is not expired
  const isExpired = React.useCallback((session: Session): boolean => {
    // Priority 1: Check remaining_time first (most reliable - comes from backend)
    // Backend returns "00:00" if expired, or actual time if not expired
    if (session.remaining_time !== undefined && session.remaining_time !== null) {
      // Handle number format (seconds)
      if (typeof session.remaining_time === 'number') {
        // If it's a positive number, session is NOT expired
        return session.remaining_time <= 0
      }
      
      // Handle string format (usually "MM:SS" or "HH:MM:SS")
      if (typeof session.remaining_time === 'string') {
        const remainingTimeStr = session.remaining_time.toString().trim().toLowerCase()
        
        // Check for explicit expired indicators
        if (
          remainingTimeStr === 'منتهي' ||
          remainingTimeStr === 'expired' ||
          remainingTimeStr === '' ||
          remainingTimeStr === '0'
        ) {
          return true
        }
        
        // Check for "00:00" format (expired)
        // Backend returns "00:00" when session is expired
        if (remainingTimeStr === '00:00' || remainingTimeStr === '00:00:00' || 
            remainingTimeStr === '0:0' || remainingTimeStr === '0:0:0') {
          return true
        }
        
        // If it contains Arabic time units (دقيقة, ساعة), it's NOT expired
        if (remainingTimeStr.includes('دقيقة') || remainingTimeStr.includes('ساعة')) {
          return false
        }
        
        // Try to parse as MM:SS or HH:MM:SS
        if (remainingTimeStr.includes(':')) {
          const parts = remainingTimeStr.split(':')
          if (parts.length >= 2) {
            const minutes = parseInt(parts[0], 10)
            const seconds = parseInt(parts[1], 10)
            // If both are 0, session is expired
            // Otherwise, session is NOT expired (has time remaining)
            return isNaN(minutes) || isNaN(seconds) || (minutes === 0 && seconds === 0)
          }
        }
        
        // If we have any non-empty string that's not an expired indicator, assume not expired
        // (Backend is the source of truth)
        return false
      }
    }
    
    // Priority 2: Check expires_at as fallback (if remaining_time is not available)
    if (session.expires_at) {
      try {
        const expiresAt = new Date(session.expires_at)
        const now = new Date()
        return expiresAt < now
      } catch (e) {
        // Invalid date, ignore
      }
    }
    
    // Priority 3: Check session_status as last resort
    // Only 'ended' status means definitely expired
    // 'closed_automatically' doesn't mean expired - session can be reopened
    if (session.session_status === 'ended') {
      return true
    }
    
    // Default: if we can't determine from remaining_time or expires_at,
    // and status is not 'ended', assume not expired
    // (Better to show session than hide it incorrectly)
    return false
  }, [])
  
  // Check if session can be joined (not expired and not permanently ended)
  const canJoin = React.useCallback((session: Session): boolean => {
    // Priority 1: Check if session is expired (most reliable indicator)
    if (isExpired(session)) {
      return false
    }
    
    // Priority 2: If session is not expired, check status
    // Allow joining if:
    // - Status is 'created' or 'active' (always joinable)
    // - Status is 'closed_automatically' BUT session is not expired (can be reopened)
    // - Only reject if status is 'ended' (permanently ended)
    
    // If session_status is 'ended', it's permanently ended
    if (session.session_status === 'ended') {
      return false
    }
    
    // If session_status is 'closed_automatically' but session is not expired,
    // it can be reopened when someone joins (so allow joining)
    if (session.session_status === 'closed_automatically') {
      // Check if session is truly expired by checking remaining_time and expires_at
      if (isExpired(session)) {
        return false
      }
      // If not expired, allow joining (session will be reopened)
      return true
    }
    
    // Allow joining if session is not expired and status is 'created' or 'active'
    // Sessions can be joined even if is_active is false (no participants yet)
    return true
  }, [isExpired])
  
  // Check if session is "live" (ready to join)
  const isSessionLive = React.useCallback((session: Session): boolean => {
    // Session is "live" if it's not expired and not permanently ended
    if (isExpired(session)) {
      return false
    }
    
    // If session_status is 'ended', it's permanently ended
    if (session.session_status === 'ended') {
      return false
    }
    
    // If session_status is 'closed_automatically' but session is not expired,
    // it's still considered "live" (can be reopened)
    if (session.session_status === 'closed_automatically') {
      // Check if session is truly expired
      if (isExpired(session)) {
        return false
      }
      // If not expired, it's "live" (can be reopened)
      return true
    }
    
    // Any session that is not expired and not ended is considered "live" (ready to join)
    // This includes sessions that are created but not started yet (is_active = false)
    return true
  }, [isExpired])

  const formatRemainingTime = (remainingTime?: string | number): string => {
    if (!remainingTime || remainingTime === 'expired' || remainingTime === '00:00:00' || remainingTime === '00:00') {
      return 'منتهي'
    }
    
    if (typeof remainingTime === 'number') {
      const minutes = Math.floor(remainingTime / 60)
      return `${minutes} دقيقة`
    }
    
    if (typeof remainingTime === 'string') {
      const parts = remainingTime.split(':')
      if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10)
        return `${minutes} دقيقة`
      } else if (parts.length === 3) {
        const hours = parseInt(parts[0], 10)
        const minutes = parseInt(parts[1], 10)
        if (hours > 0) {
          return `${hours} ساعة${minutes > 0 ? ` و ${minutes} دقيقة` : ''}`
        }
        return `${minutes} دقيقة`
      }
    }
    
    return remainingTime.toString()
  }

  // Load announcements from API
  useEffect(() => {
    if (!batchId) {
      setAnnouncementsLoading(false)
      return
    }

    const loadAnnouncements = async () => {
      try {
        setAnnouncementsLoading(true)
        const announcementNotes = await announcementNotesAPI.list({ batch_id: batchId })
        
        // Sort announcements: pinned first, then important, then by date (newest first)
        const sorted = announcementNotes.sort((a, b) => {
          // Pinned first
          if (a.is_pinned && !b.is_pinned) return -1
          if (!a.is_pinned && b.is_pinned) return 1
          // Important next
          if (a.is_important && !b.is_important) return -1
          if (!a.is_important && b.is_important) return 1
          // Then by date (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        
        setAnnouncements(sorted)
      } catch (error: any) {
        console.error('Error loading announcements:', error)
        // Don't show toast for connection errors
        if (!error?.message?.includes('Failed to fetch') && error?.name !== 'TypeError') {
          toast.error('فشل تحميل الإعلانات')
        }
        setAnnouncements([])
      } finally {
        setAnnouncementsLoading(false)
      }
    }

    loadAnnouncements()
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadAnnouncements, 60000)
    return () => clearInterval(interval)
  }, [batchId, refreshTrigger])

  // Load active sessions for this batch (for both teachers and students)
  useEffect(() => {
    if (!courseId || !batchId) {
      console.log('⚠️ Missing courseId or batchId:', { courseId, batchId })
      return
    }
    
    const loadActiveSessions = async () => {
      try {
        setSessionsLoading(true)
        console.log('🔄 Loading active sessions for course:', courseId, 'batch:', batchId)
        const sessions = await sessionService.getCourseActiveSessions(courseId)
        console.log('📦 All sessions for course:', sessions)
        
        // Filter sessions for this batch and exclude expired ones
        // Show sessions that can be joined (not expired, not permanently ended)
        const batchSessions = sessions.filter(
          (session) => {
            // Compare batch IDs (handle both string and UUID formats)
            const sessionBatchId = session.batch ? String(session.batch).trim() : null
            const currentBatchId = batchId ? String(batchId).trim() : null
            
            // Must be for this batch (compare as strings to handle UUID format)
            if (!sessionBatchId || !currentBatchId || sessionBatchId !== currentBatchId) {
              return false
            }
            
            // Check if session is expired (most reliable check)
            const expired = isExpired(session)
            
            // Check if session can be joined
            const joinable = canJoin(session)
            
            console.log('🔍 Checking session:', {
              session_id: session.session_id,
              session_batch: sessionBatchId,
              current_batchId: currentBatchId,
              matches: sessionBatchId === currentBatchId,
              isExpired: expired,
              canJoin: joinable,
              remaining_time: session.remaining_time,
              session_status: session.session_status,
              is_active: session.is_active,
              title: session.title,
              expires_at: session.expires_at
            })
            
            if (joinable) {
              console.log('✅ Session is joinable and matches batch:', session.session_id)
            } else {
              console.log('❌ Session is not joinable:', {
                session_id: session.session_id,
                isExpired: expired,
                session_status: session.session_status,
                remaining_time: session.remaining_time
              })
            }
            
            return joinable
          }
        )
        
        console.log('✅ Filtered batch sessions:', batchSessions)
        setActiveSessions(batchSessions)
        
        // Notify parent component about active sessions
        if (onActiveSessionsChange) {
          onActiveSessionsChange(batchSessions.length > 0)
        }
      } catch (error: any) {
        // Check if error is authentication error (401/403)
        const status = error?.status || error?.response?.status || error?.data?.status
        if (status === 401 || status === 403) {
          console.log('⚠️ Authentication error loading sessions - user may need to login')
          // Don't show error toast for auth errors - they're handled by apiClient
          setActiveSessions([])
          // Notify parent that there are no active sessions
          if (onActiveSessionsChange) {
            onActiveSessionsChange(false)
          }
          return
        }
        
        // Only show error if it's not a connection issue
        if (!error?.message?.includes('Failed to fetch') && error?.name !== 'TypeError') {
          console.error('❌ Error loading active sessions:', error)
          // Don't show toast for API errors to avoid annoying users
        } else {
          console.log('⚠️ Connection error (silent):', error?.message)
        }
        setActiveSessions([])
        // Notify parent that there are no active sessions
        if (onActiveSessionsChange) {
          onActiveSessionsChange(false)
        }
      } finally {
        setSessionsLoading(false)
      }
    }

    loadActiveSessions()
    // Auto-refresh every 30 seconds to get latest sessions
    const interval = setInterval(loadActiveSessions, 30000)
    return () => clearInterval(interval)
  }, [courseId, batchId, canJoin, isExpired, onActiveSessionsChange])

  const handleJoinSession = async (sessionId: string) => {
    try {
      await sessionService.joinSession(sessionId)
      router.push(`/meet/rooms/${sessionId}`)
    } catch (error: any) {
      console.error('Error joining session:', error)
    }
  }

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim() || !batchId) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      setCreating(true)
      
      const formData: any = {
        batch: batchId,
        title: announcementForm.title,
        content: announcementForm.content,
        is_important: announcementForm.is_important,
        is_pinned: announcementForm.is_pinned,
        attachment_file: attachmentFile || undefined
      }

      const result = await announcementNotesAPI.create(formData)
      
      toast.success('✅ تم إنشاء الملاحظة العامة بنجاح')
      setShowCreateDialog(false)
      setAnnouncementForm({ title: '', content: '', is_important: false, is_pinned: false })
      setAttachmentFile(null)
      
      // Trigger reload
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast.error('فشل إنشاء الملاحظة العامة')
    } finally {
      setCreating(false)
    }
  }

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
      {/* Active Sessions Banner - Red UI (shown for both teachers and students) */}
      {sessionsLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-lg border-2 border-red-300 dark:border-red-500/50 overflow-hidden shadow-lg mb-6"
        >
          <div className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">جاري تحميل الجلسات المباشرة...</span>
            </div>
          </div>
        </motion.div>
      ) : activeSessions.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-lg border-2 border-red-300 dark:border-red-500/50 overflow-hidden shadow-lg mb-6"
        >
          <div className="p-4 bg-red-500/20 border-b border-red-300 dark:border-red-500/30">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <Video className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-base font-bold text-red-700 dark:text-red-300">
                جلسة مباشرة نشطة ({activeSessions.length})
              </h3>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {activeSessions.map((session) => {
              const isLive = isSessionLive(session)
              const canJoinSession = canJoin(session)
              
              return (
                <motion.div
                  key={session.session_id || session.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-red-200 dark:border-red-500/30 shadow-md"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 dark:text-slate-50 text-base">
                          {session.title || 'جلسة مباشرة'}
                        </h4>
                        {isLive && (
                          <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                              مباشر
                            </span>
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-400 flex-wrap">
                        {session.created_by_name && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {session.created_by_name}
                          </span>
                        )}
                        {session.remaining_time && (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                            <Clock className="w-4 h-4" />
                            متبقي: {formatRemainingTime(session.remaining_time)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {session.participant_count || 0} مشارك
                        </span>
                        {session.duration_minutes && (
                          <span className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            {session.duration_minutes} دقيقة
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {canJoinSession ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleJoinSession(session.session_id)}
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>انضم الآن</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      disabled
                      className="bg-gray-400 text-white flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm cursor-not-allowed opacity-50"
                    >
                      <span>غير متاح</span>
                    </motion.button>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      ) : null}
      
      {/* Show message if no sessions but we're looking for them */}
      {!sessionsLoading && activeSessions.length === 0 && courseId && batchId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Video className="w-5 h-5" />
            <span className="text-sm font-medium">
              لا توجد جلسات مباشرة حالياً. سيظهر هنا الجلسات التي ينشئها المعلم.
            </span>
          </div>
        </motion.div>
      )}


     


      {/* Teacher Announcements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-50 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            إعلانات المعلم
          </h3>
          <div className="flex items-center gap-2">
            {announcementsLoading && (
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            )}
            {isActualTeacher && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إنشاء ملاحظة عامة</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px] max-h-[calc(100vh-120px)] overflow-y-auto bg-white dark:bg-slate-900 pt-8 mt-8 md:mt-12 [&>button]:top-2 [&>button]:right-2" dir="rtl">
                  <DialogHeader className="pb-2 pt-0">
                    <DialogTitle className="text-base font-bold text-gray-900 dark:text-slate-50 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-primary" />
                      إنشاء ملاحظة عامة جديدة
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-600 dark:text-slate-400">
                      ستكون هذه الملاحظة مرئية لجميع طلاب المجموعة
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-2.5 py-1.5">
                    <div className="space-y-1.5">
                      <Label htmlFor="title" className="text-xs font-medium text-gray-900 dark:text-slate-50">
                        عنوان الملاحظة <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                        placeholder="اكتب عنوان الملاحظة هنا..."
                        className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 h-9 text-sm"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="content" className="text-xs font-medium text-gray-900 dark:text-slate-50">
                        محتوى الملاحظة <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="content"
                        value={announcementForm.content}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                        placeholder="اكتب محتوى الملاحظة هنا..."
                        className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 min-h-[80px] text-sm"
                        dir="rtl"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_important"
                        checked={announcementForm.is_important}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, is_important: e.target.checked })}
                        className="w-3.5 h-3.5 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <Label htmlFor="is_important" className="text-xs font-medium text-gray-900 dark:text-slate-50 cursor-pointer">
                        ⚠️ ملاحظة مهمة
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_pinned"
                        checked={announcementForm.is_pinned}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, is_pinned: e.target.checked })}
                        className="w-3.5 h-3.5 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <Label htmlFor="is_pinned" className="text-xs font-medium text-gray-900 dark:text-slate-50 cursor-pointer">
                        📌 تثبيت الملاحظة
                      </Label>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="attachment" className="text-xs font-medium text-gray-900 dark:text-slate-50">
                        إرفاق ملف (اختياري)
                      </Label>
                      <Input
                        id="attachment"
                        type="file"
                        onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                        className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 h-9 text-sm"
                        accept="image/*,video/*,.pdf,.doc,.docx"
                      />
                      {attachmentFile && (
                        <p className="text-xs text-gray-600 dark:text-slate-400">
                          الملف المحدد: {attachmentFile.name} ({(attachmentFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="gap-2 pt-3 px-4 pb-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      disabled={creating}
                      className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 h-9 text-sm"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreateAnnouncement}
                      disabled={creating || !announcementForm.title.trim() || !announcementForm.content.trim()}
                      className="bg-primary hover:bg-primary/90 text-white h-9 text-sm"
                    >
                      {creating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          جاري الإنشاء...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          إنشاء الملاحظة
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {announcementsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Creator Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm"
                    >
                      {announcement.creator_name ? announcement.creator_name.charAt(0) : 'م'}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-slate-50 text-sm">
                              {announcement.creator_name || 'المعلم'}
                            </h4>
                            {announcement.is_pinned && (
                              <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30 text-xs px-2 py-0">
                                📌 مثبت
                              </Badge>
                            )}
                            {announcement.is_important && (
                              <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30 text-xs px-2 py-0">
                                ⚠️ مهم
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                            {new Date(announcement.created_at).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                          {announcement.creator_type === 'teacher' ? 'إعلان' : 'من طالب'}
                        </Badge>
                      </div>

                      {/* Title */}
                      {announcement.title && (
                        <h5 className="font-bold text-gray-900 dark:text-slate-50 text-base mb-2">
                          {announcement.title}
                        </h5>
                      )}

                      {/* Content */}
                      <div className="prose prose-sm max-w-none mb-2">
                        <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {announcement.content || 'لا يوجد محتوى'}
                        </p>
                      </div>

                      {/* Attachment */}
                      {announcement.has_attachment && announcement.attachment_url && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                          <a
                            href={announcement.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <span>📎 {announcement.attachment_name || 'مرفق'}</span>
                            {announcement.attachment_size && (
                              <span className="text-xs text-gray-500">
                                ({(announcement.attachment_size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            )}
                          </a>
                        </div>
                      )}

                      {/* Footer */}
                      {(announcement.course_title || announcement.batch_name) && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                          {announcement.course_title && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                              <span>{announcement.course_title}</span>
                            </div>
                          )}
                          {announcement.batch_name && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              <span>{announcement.batch_name}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-slate-50 mb-2">لا توجد إعلانات</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">لم يقم المعلم بنشر أي إعلانات في هذه الدورة بعد.</p>
            </div>
          </motion.div>
        )}
      </div>

    </div>
  )
}
