'use client'

import React, { useState, useEffect } from 'react'
import { Video, Plus, Users, Clock, Trash2, ExternalLink, Calendar, Play, Download, FileVideo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CreateSessionModal } from '@/components/sessions'
import { sessionService } from '@/lib/services/sessionService'
import { recordingService, type Recording } from '@/lib/api/recording'
import type { Session } from '@/types/session'

interface BatchMeetingsProps {
  batchId: string
  courseId: string
  userRole: 'teacher' | 'student'
  onActiveSessionsChange?: (hasActiveSessions: boolean) => void // Callback to notify parent about active sessions
}

export default function BatchMeetings({ batchId, courseId, userRole, onActiveSessionsChange }: BatchMeetingsProps) {
  const router = useRouter()
  const [meetings, setMeetings] = useState<Session[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRecordings, setLoadingRecordings] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Helper functions for session status (defined first)
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

  const loadMeetings = React.useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      
      // Get active sessions for this course
      const sessions = await sessionService.getCourseActiveSessions(courseId)
      console.log('📦 BatchMeetings - All sessions for course:', sessions)
      
      // Filter sessions for this batch (show all sessions, including expired ones)
      const batchSessions = sessions.filter(
        (session) => {
          // Compare batch IDs (handle both string and UUID formats)
          const sessionBatchId = session.batch ? String(session.batch).trim() : null
          const currentBatchId = batchId ? String(batchId).trim() : null
          
          console.log('🔍 BatchMeetings - Checking session:', {
            session_id: session.session_id,
            session_batch: sessionBatchId,
            current_batchId: currentBatchId,
            matches: sessionBatchId === currentBatchId,
            isExpired: isExpired(session),
            canJoin: canJoin(session),
            remaining_time: session.remaining_time,
            session_status: session.session_status,
            is_active: session.is_active,
            title: session.title
          })
          
          // Must be for this batch (compare as strings to handle UUID format)
          if (!sessionBatchId || !currentBatchId || sessionBatchId !== currentBatchId) {
            console.log('❌ BatchMeetings - Session batch does not match')
            return false
          }
          
          // Show all sessions for this batch (including expired ones)
          const joinable = canJoin(session)
          if (joinable) {
            console.log('✅ BatchMeetings - Session is joinable:', session.session_id)
          } else {
            console.log('ℹ️ BatchMeetings - Session is not joinable (but will be shown):', {
              session_id: session.session_id,
              isExpired: isExpired(session),
              session_status: session.session_status
            })
          }
          // Return true to show all sessions (even expired ones)
          return true
        }
      )
      
      console.log('✅ BatchMeetings - Filtered batch sessions:', batchSessions)
      setMeetings(batchSessions)
      
      // Notify parent component about active sessions
      if (onActiveSessionsChange) {
        onActiveSessionsChange(batchSessions.length > 0)
      }
    } catch (error: any) {
      // Only show error if it's not a connection issue
      if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
        // Server is not running, don't spam console or show toast
        setMeetings([])
        // Notify parent that there are no active sessions
        if (onActiveSessionsChange) {
          onActiveSessionsChange(false)
        }
        return
      }
      console.error('Error loading meetings:', error)
      toast.error('فشل تحميل الاجتماعات')
      setMeetings([])
      // Notify parent that there are no active sessions
      if (onActiveSessionsChange) {
        onActiveSessionsChange(false)
      }
    } finally {
      setLoading(false)
    }
  }, [batchId, courseId, canJoin, isExpired, onActiveSessionsChange])

  const loadRecordings = React.useCallback(async (): Promise<void> => {
    try {
      setLoadingRecordings(true)
      console.log('📹 BatchMeetings - Loading recordings for meetings:', meetings.length)
      
      // Get all recordings for all sessions in this batch
      const allRecordings: Recording[] = []
      
      // Get recordings for each meeting
      for (const meeting of meetings) {
        try {
          console.log(`📹 BatchMeetings - Fetching recordings for session: ${meeting.session_id}`)
          const response = await recordingService.listRecordings(meeting.session_id)
          console.log(`📹 BatchMeetings - Recordings response for ${meeting.session_id}:`, response)
          
          const meetingRecordings = response?.recordings || response?.results || []
           console.log(`📹 BatchMeetings - Found ${meetingRecordings.length} recordings for session ${meeting.session_id}`)
           
           // Log detailed info for each recording
           meetingRecordings.forEach((rec: Recording) => {
             console.log(`📹 Recording ${rec.id}:`, {
               id: rec.id,
               status: rec.status,
               recording_url: rec.recording_url,
               wasabi_key: rec.wasabi_key,
               duration: rec.duration,
               file_size: rec.file_size,
               created_at: rec.created_at,
               uploaded_at: rec.uploaded_at
             })
           })
           
           allRecordings.push(...meetingRecordings)
        } catch (error) {
          console.error(`❌ BatchMeetings - Failed to load recordings for session ${meeting.session_id}:`, error)
        }
      }
      
      console.log(`📹 BatchMeetings - Total recordings found: ${allRecordings.length}`)
      
      // Sort by created_at (newest first)
      allRecordings.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateB - dateA
      })
      
      setRecordings(allRecordings)
      console.log('📹 BatchMeetings - Recordings set:', allRecordings)
      
      // Log summary of recordings
      console.log('📹 BatchMeetings - Recordings Summary:')
      allRecordings.forEach((rec: Recording) => {
        console.log(`  📹 ID: ${rec.id}, Status: ${rec.status}, URL: ${rec.recording_url || 'N/A'}, Wasabi Key: ${rec.wasabi_key || 'N/A'}`)
      })
    } catch (error: any) {
      console.error('❌ BatchMeetings - Error loading recordings:', error)
      setRecordings([])
    } finally {
      setLoadingRecordings(false)
    }
  }, [meetings])

  useEffect(() => {
    if (batchId && courseId) {
      loadMeetings()
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadMeetings, 30000)
      return () => clearInterval(interval)
    }
  }, [batchId, courseId, loadMeetings])

  useEffect(() => {
    if (meetings.length > 0) {
      loadRecordings()
    }
  }, [meetings, loadRecordings])

  // Auto-refresh recordings that are in uploading/processing status
  useEffect(() => {
    if (recordings.length === 0) return

    // Check if there are any recordings in uploading or processing status
    const hasActiveRecordings = recordings.some(
      (rec) => rec.status === 'uploading' || rec.status === 'processing'
    )

    if (!hasActiveRecordings) return

    // Refresh recordings every 10 seconds if there are active ones
    const interval = setInterval(() => {
      loadRecordings()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [recordings, loadRecordings])

  const handleSessionCreated = (sessionId: string) => {
    console.log('✅ Session created:', sessionId)
    toast.success('تم إنشاء الجلسة بنجاح!')
    setShowCreateDialog(false)
    // Reload meetings after a short delay to ensure backend has processed the new session
    setTimeout(() => {
      loadMeetings()
    }, 500)
  }

  const handleJoinMeeting = async (sessionId: string): Promise<void> => {
    try {
      await sessionService.joinSession(sessionId)
      
      // Redirect to meeting room
      router.push(`/meet/rooms/${sessionId}`)
    } catch (error: any) {
      // Only show error if it's not a connection issue (already handled in service)
      if (!error?.message?.includes('Failed to fetch') && error?.name !== 'TypeError') {
        console.error('Error joining meeting:', error)
      }
      toast.error(error.message || 'فشل الانضمام للاجتماع')
    }
  }

  const handleDeleteMeeting = async (sessionId: string): Promise<void> => {
    if (!confirm('هل أنت متأكد من حذف هذا الاجتماع؟')) {
      return
    }

    try {
      await sessionService.deleteSession(sessionId)
      toast.success('تم حذف الاجتماع بنجاح')
      await loadMeetings()
    } catch (error: any) {
      console.error('Error deleting meeting:', error)
      toast.error(error.message || 'فشل حذف الاجتماع')
    }
  }

  const formatRemainingTime = (remainingTime?: string | number): string => {
    // Handle expired or empty - check multiple variations
    if (!remainingTime) {
      return 'منتهي'
    }
    
    const timeStr = remainingTime.toString().trim().toLowerCase()
    
    // Check for expired indicators
    if (
      timeStr === 'expired' ||
      timeStr === 'منتهي' ||
      timeStr === '00:00' ||
      timeStr === '00:00:00' ||
      timeStr === '' ||
      timeStr === '0' ||
      timeStr === '0:0' ||
      timeStr === '0:0:0'
    ) {
      return 'منتهي'
    }
    
    // If it's a number (seconds), convert to minutes
    if (typeof remainingTime === 'number') {
      if (remainingTime <= 0) {
        return 'منتهي'
      }
      const minutes = Math.floor(remainingTime / 60)
      const seconds = remainingTime % 60
      if (minutes > 0) {
        return `${minutes} دقيقة${seconds > 0 ? ` و ${seconds} ثانية` : ''}`
      }
      return `${seconds} ثانية`
    }
    
    // If it's a string in format "MM:SS" or "HH:MM:SS", extract minutes
    if (typeof remainingTime === 'string') {
      const parts = remainingTime.split(':')
      if (parts.length === 2) {
        // Format: "MM:SS"
        const minutes = parseInt(parts[0], 10)
        const seconds = parseInt(parts[1], 10)
        if (isNaN(minutes) || isNaN(seconds) || (minutes === 0 && seconds === 0)) {
          return 'منتهي'
        }
        if (minutes > 0) {
          return `${minutes} دقيقة${seconds > 0 ? ` و ${seconds} ثانية` : ''}`
        }
        return `${seconds} ثانية`
      } else if (parts.length === 3) {
        // Format: "HH:MM:SS"
        const hours = parseInt(parts[0], 10)
        const minutes = parseInt(parts[1], 10)
        const seconds = parseInt(parts[2], 10)
        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || (hours === 0 && minutes === 0 && seconds === 0)) {
          return 'منتهي'
        }
        if (hours > 0) {
          return `${hours} ساعة${minutes > 0 ? ` و ${minutes} دقيقة` : ''}`
        }
        if (minutes > 0) {
          return `${minutes} دقيقة${seconds > 0 ? ` و ${seconds} ثانية` : ''}`
        }
        return `${seconds} ثانية`
      }
    }
    
    // Fallback: return as is (but check if it's an expired indicator)
    const fallbackStr = remainingTime.toString().trim().toLowerCase()
    if (fallbackStr === 'expired' || fallbackStr === 'منتهي') {
      return 'منتهي'
    }
    return remainingTime.toString()
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل الاجتماعات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Video className="w-6 h-6" />
            الاجتماعات المباشرة
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            إنشاء وإدارة الاجتماعات المباشرة مع الطلاب
          </p>
        </div>

        {userRole === 'teacher' && (
          <Button 
            className="gap-2" 
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-4 h-4" />
            إنشاء جلسة جديدة
          </Button>
        )}
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              لا توجد اجتماعات حالياً
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              {userRole === 'teacher' 
                ? 'ابدأ بإنشاء اجتماع جديد للتواصل مع طلابك'
                : 'سيظهر هنا الاجتماعات التي ينشئها المعلم'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => {
            const expired = isExpired(meeting)
            
            return (
              <Card key={meeting.session_id || meeting.id || `meeting-${meeting.title}`} className={expired ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Video className="w-5 h-5" />
                        {meeting.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        بواسطة {meeting.created_by_name}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {expired ? (
                        <Badge variant="secondary" className="bg-gray-500 text-white">
                          منتهي
                        </Badge>
                      ) : isSessionLive(meeting) ? (
                        <Badge variant="default" className="bg-green-500">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            مباشر
                          </span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                          جاهزة للبدء
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Meeting Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{meeting.duration_minutes} دقيقة</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{meeting.participant_count} مشارك</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(meeting.created_at).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>متبقي: {formatRemainingTime(meeting.remaining_time)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {expired ? (
                        <Button
                          disabled
                          variant="outline"
                          className="flex-1 opacity-50"
                        >
                          الاجتماع منتهي
                        </Button>
                      ) : canJoin(meeting) ? (
                        <Button
                          onClick={() => handleJoinMeeting(meeting.session_id)}
                          className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-white"
                          variant="default"
                        >
                          <ExternalLink className="w-4 h-4" />
                          انضم الآن
                        </Button>
                      ) : (
                        <Button
                          disabled
                          variant="outline"
                          className="flex-1"
                        >
                          غير متاح
                        </Button>
                      )}

                      {userRole === 'teacher' && (
                        <button
                          onClick={() => handleDeleteMeeting(meeting.session_id)}
                          className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Recordings Section */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileVideo className="w-5 h-5" />
              التسجيلات
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              جميع التسجيلات المحفوظة للاجتماعات
            </p>
          </div>
        </div>

        {loadingRecordings ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">جاري تحميل التسجيلات...</p>
              </div>
            </CardContent>
          </Card>
        ) : recordings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileVideo className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد تسجيلات حالياً
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                سيظهر هنا التسجيلات بعد انتهاء الاجتماعات
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {recordings.map((recording) => {
              // Find the meeting this recording belongs to
              const meeting = meetings.find(m => m.session_id === recording.session_id)
              
              const getStatusBadge = () => {
                switch (recording.status) {
                  case 'processing':
                    return <Badge className="bg-yellow-500">قيد المعالجة</Badge>
                  case 'uploading':
                    return <Badge className="bg-blue-500">قيد الرفع</Badge>
                  case 'available':
                    return <Badge className="bg-green-500">متاح</Badge>
                  case 'failed':
                    return <Badge className="bg-red-500">فشل</Badge>
                  case 'expired':
                    return <Badge className="bg-gray-500">منتهي</Badge>
                  default:
                    return <Badge variant="outline">{recording.status}</Badge>
                }
              }

              return (
                <Card key={recording.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <FileVideo className="w-5 h-5" />
                          {recording.session_title || 'تسجيل اجتماع'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          تم التسجيل في {new Date(recording.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                      {getStatusBadge()}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Recording Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>المدة: {recording.duration_formatted || '0:00'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <FileVideo className="w-4 h-4" />
                          <span>الحجم: {recording.file_size_formatted || 'غير متاح'}</span>
                        </div>
                        {recording.view_count !== undefined && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>المشاهدات: {recording.view_count}</span>
                          </div>
                        )}
                        {recording.expires_at && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>ينتهي: {new Date(recording.expires_at).toLocaleDateString('ar-EG')}</span>
                          </div>
                        )}
                      </div>

                      {/* Recording URL Info */}
                      {recording.recording_url && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">رابط الفيديو:</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 break-all truncate" title={recording.recording_url}>
                                {recording.recording_url}
                              </p>
                            </div>
                            <Button
                              onClick={() => {
                                navigator.clipboard.writeText(recording.recording_url!)
                                toast.success('تم نسخ الرابط')
                              }}
                              variant="ghost"
                              size="sm"
                              className="shrink-0"
                            >
                              نسخ
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {recording.status === 'available' && recording.recording_url && (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            onClick={() => window.open(recording.recording_url, '_blank')}
                            className="flex-1 gap-2"
                            variant="default"
                          >
                            <Play className="w-4 h-4" />
                            مشاهدة التسجيل
                          </Button>
                          {recording.recording_url && (
                            <Button
                              onClick={() => {
                                const link = document.createElement('a')
                                link.href = recording.recording_url!
                                link.download = `${recording.session_title || 'recording'}.mp4`
                                link.click()
                              }}
                              variant="outline"
                              className="gap-2"
                            >
                              <Download className="w-4 h-4" />
                              تحميل
                            </Button>
                          )}
                        </div>
                      )}
                      {recording.status === 'available' && !recording.recording_url && meeting && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            onClick={async () => {
                              try {
                                // Fetch full recording details from API
                                const fullRecording = await recordingService.getRecording(
                                  meeting.session_id,
                                  recording.id
                                )
                                console.log('📹 Full Recording Details:', fullRecording)
                                console.log('📹 Recording URL:', fullRecording.recording_url)
                                console.log('📹 Wasabi Key:', fullRecording.wasabi_key)
                                
                                if (fullRecording.recording_url) {
                                  toast.success('تم جلب رابط الفيديو')
                                  // Update the recording in state
                                  setRecordings(prev => prev.map(r => 
                                    r.id === recording.id 
                                      ? { ...r, recording_url: fullRecording.recording_url }
                                      : r
                                  ))
                                } else {
                                  toast.info('الفيديو قيد المعالجة، لا يوجد رابط بعد')
                                }
                              } catch (error: any) {
                                console.error('Failed to get recording details:', error)
                                toast.error(error.message || 'فشل جلب تفاصيل التسجيل')
                              }
                            }}
                            variant="outline"
                            className="w-full gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            جلب تفاصيل التسجيل (API)
                          </Button>
                        </div>
                      )}
                      {recording.status === 'processing' && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            ⏳ التسجيل قيد المعالجة، سيصبح متاحاً قريباً
                          </p>
                        </div>
                      )}
                      {recording.status === 'uploading' && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-blue-600 dark:text-blue-400">
                                📤 التسجيل قيد الرفع إلى السحابة
                              </p>
                              {recording.ended_at && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  بدأ الرفع: {new Date(recording.ended_at).toLocaleTimeString('ar-EG')}
                                </p>
                              )}
                            </div>
                            {meeting && (
                              <div className="flex gap-2">
                                <Button
                                  onClick={async () => {
                                    try {
                                      // Fetch full recording details from API
                                      const fullRecording = await recordingService.getRecording(
                                        meeting.session_id,
                                        recording.id
                                      )
                                      console.log('📹 Full Recording Details (uploading):', fullRecording)
                                      console.log('📹 Recording URL:', fullRecording.recording_url)
                                      console.log('📹 Wasabi Key:', fullRecording.wasabi_key)
                                      console.log('📹 LiveKit Download URL:', fullRecording.livekit_download_url)
                                      
                                      if (fullRecording.recording_url) {
                                        toast.success('تم جلب رابط الفيديو')
                                        // Update the recording in state
                                        setRecordings(prev => prev.map(r => 
                                          r.id === recording.id 
                                            ? { ...r, recording_url: fullRecording.recording_url, status: fullRecording.status }
                                            : r
                                        ))
                                      } else {
                                        toast.info('الفيديو لا يزال قيد الرفع، لا يوجد رابط بعد')
                                      }
                                    } catch (error: any) {
                                      console.error('Failed to get recording details:', error)
                                      toast.error(error.message || 'فشل جلب تفاصيل التسجيل')
                                    }
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  فحص التفاصيل
                                </Button>
                                <Button
                                  onClick={async () => {
                                    try {
                                      await recordingService.retryUploadRecording(
                                        meeting.session_id,
                                        recording.id
                                      )
                                      toast.success('تمت إعادة محاولة الرفع')
                                      setTimeout(() => loadRecordings(), 2000)
                                    } catch (error: any) {
                                      toast.error(error.message || 'فشل إعادة محاولة الرفع')
                                    }
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  إعادة المحاولة
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {recording.status === 'failed' && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-red-600 dark:text-red-400">
                                ❌ فشل التسجيل
                                {recording.error_message && `: ${recording.error_message}`}
                              </p>
                            </div>
                            {meeting && (
                              <Button
                                onClick={async () => {
                                  try {
                                    await recordingService.retryUploadRecording(
                                      meeting.session_id,
                                      recording.id
                                    )
                                    toast.success('تمت إعادة محاولة الرفع')
                                    setTimeout(() => loadRecordings(), 2000)
                                  } catch (error: any) {
                                    toast.error(error.message || 'فشل إعادة محاولة الرفع')
                                  }
                                }}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <Download className="w-4 h-4" />
                                إعادة المحاولة
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                ميزات الاجتماعات المباشرة
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• تسجيل تلقائي لجميع الاجتماعات</li>
                <li>• مشاركة الشاشة والصوت والفيديو</li>
                <li>• دردشة نصية مباشرة</li>
                <li>• إمكانية مشاهدة التسجيلات لاحقاً</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Session Modal */}
      {userRole === 'teacher' && (
        <CreateSessionModal
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          courseId={courseId}
          batchId={batchId}
          onSessionCreated={handleSessionCreated}
        />
      )}
    </div>
  )
}
