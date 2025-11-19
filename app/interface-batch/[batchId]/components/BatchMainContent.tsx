'use client'

import React, { useState, useEffect, useCallback } from 'react'
import CourseTopBar from '../../components/CourseTopBar'
import PostsList from '../../components/PostsList'
import CourseFiles from '../../../course-interface/components/CourseFiles'
import BatchQuizzes from './BatchQuizzes'
import BatchMeetings from './BatchMeetings'
import PerformanceNotes from './PerformanceNotes'
import { sessionService } from '@/lib/services/sessionService'
import type { Session } from '@/types/session'
import { quizzesApi } from '@/lib/api/quizzes'
import { performanceNotesAPI } from '@/lib/api/notes'

interface BatchMainContentProps {
  activeTab: 'announcements' | 'files' | 'quizzes' | 'meetings' | 'performance-notes'
  onTabChange: (tab: 'announcements' | 'files' | 'quizzes' | 'meetings' | 'performance-notes') => void
  onStartSession: () => void
  isSessionActive: boolean
  userRole: 'teacher' | 'student'
  isActualTeacher?: boolean // True only for actual teachers, false for supervisors
  onAddStudent: () => void
  courseId: string
  userName: string
  userAvatar?: string
  onFileUpload: (files: FileList) => void
  batchId: string
  currentUserId?: string | number
}

export default function BatchMainContent({
  activeTab,
  onTabChange,
  onStartSession,
  isSessionActive,
  userRole,
  isActualTeacher = false,
  onAddStudent,
  courseId,
  userName,
  userAvatar,
  onFileUpload,
  batchId,
  currentUserId
}: BatchMainContentProps) {
  // State to track if there are active sessions from different tabs
  const [hasActiveSessionsFromAnnouncements, setHasActiveSessionsFromAnnouncements] = useState(false)
  const [hasActiveSessionsFromMeetings, setHasActiveSessionsFromMeetings] = useState(false)
  const [hasActiveSessionsFromBackground, setHasActiveSessionsFromBackground] = useState(false)
  const [unreadPerformanceNotesCount, setUnreadPerformanceNotesCount] = useState(0)
  const [pendingQuizzesCount, setPendingQuizzesCount] = useState(0)
  
  // Helper function to check if session is expired (same logic as in PostsList and BatchMeetings)
  const isExpired = useCallback((session: Session): boolean => {
    if (session.remaining_time !== undefined && session.remaining_time !== null) {
      if (typeof session.remaining_time === 'number') {
        return session.remaining_time <= 0
      }
      if (typeof session.remaining_time === 'string') {
        const remainingTimeStr = session.remaining_time.toString().trim().toLowerCase()
        if (
          remainingTimeStr === 'منتهي' ||
          remainingTimeStr === 'expired' ||
          remainingTimeStr === '' ||
          remainingTimeStr === '0' ||
          remainingTimeStr === '00:00' ||
          remainingTimeStr === '00:00:00'
        ) {
          return true
        }
        if (remainingTimeStr.includes('دقيقة') || remainingTimeStr.includes('ساعة')) {
          return false
        }
        if (remainingTimeStr.includes(':')) {
          const parts = remainingTimeStr.split(':')
          if (parts.length >= 2) {
            const minutes = parseInt(parts[0], 10)
            const seconds = parseInt(parts[1], 10)
            return isNaN(minutes) || isNaN(seconds) || (minutes === 0 && seconds === 0)
          }
        }
        return false
      }
    }
    if (session.expires_at) {
      try {
        const expiresAt = new Date(session.expires_at)
        const now = new Date()
        return expiresAt < now
      } catch (e) {
        // Invalid date, ignore
      }
    }
    if (session.session_status === 'ended') {
      return true
    }
    return false
  }, [])
  
  // Helper function to check if session can be joined
  const canJoin = useCallback((session: Session): boolean => {
    if (isExpired(session)) {
      return false
    }
    if (session.session_status === 'ended') {
      return false
    }
    if (session.session_status === 'closed_automatically') {
      if (isExpired(session)) {
        return false
      }
      return true
    }
    return true
  }, [isExpired])
  
  // Load active sessions in the background to show indicator on tabs even when tab is not active
  useEffect(() => {
    if (!courseId || !batchId) {
      return
    }
    
    const loadActiveSessions = async () => {
      try {
        const sessions = await sessionService.getCourseActiveSessions(courseId)
        
        // Filter sessions for this batch
        const batchSessions = sessions.filter((session) => {
          const sessionBatchId = session.batch ? String(session.batch).trim() : null
          const currentBatchId = batchId ? String(batchId).trim() : null
          
          if (!sessionBatchId || !currentBatchId || sessionBatchId !== currentBatchId) {
            return false
          }
          
          return canJoin(session)
        })
        
        setHasActiveSessionsFromBackground(batchSessions.length > 0)
      } catch (error: any) {
        // Silently handle errors - don't show toasts for background loading
        setHasActiveSessionsFromBackground(false)
      }
    }
    
    loadActiveSessions()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadActiveSessions, 30000)
    return () => clearInterval(interval)
  }, [courseId, batchId, canJoin, isExpired])

  // Load pending quizzes count in the background (for students only)
  useEffect(() => {
    if (!batchId || userRole !== 'student') {
      return
    }
    
    const loadPendingQuizzes = async () => {
      try {
        const data = await quizzesApi.listStudent({
          live_batch: batchId,
          ordering: '-created_at'
        })
        
        // Calculate pending quizzes count (not started or can retake)
        const pendingCount = (data.results || []).filter((quiz: any) => {
          const attemptsCount = Number(quiz.student_attempts_count) || 0
          const canRetake = quiz.can_retake === true || quiz.can_retake === 'true'
          // Pending if: not started (0 attempts) or can retake
          return attemptsCount === 0 || canRetake
        }).length
        
        setPendingQuizzesCount(pendingCount)
      } catch (error: any) {
        // Silently handle errors - don't show toasts for background loading
        console.error('Error loading pending quizzes:', error)
        setPendingQuizzesCount(0)
      }
    }
    
    loadPendingQuizzes()
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadPendingQuizzes, 60000)
    return () => clearInterval(interval)
  }, [batchId, userRole])

  // Load unread performance notes count in the background (for students only)
  useEffect(() => {
    if (!batchId || userRole !== 'student') {
      return
    }
    
    const loadUnreadPerformanceNotes = async () => {
      try {
        const response = await performanceNotesAPI.list({ batch_id: batchId })
        const notes = response.results || []
        
        // Get viewed notes from localStorage
        const storedViewed = localStorage.getItem(`viewed_performance_notes_${batchId}`)
        const viewed = storedViewed ? new Set<string>(JSON.parse(storedViewed)) : new Set<string>()
        
        // Calculate unread count
        const unreadCount = notes.filter((note: any) => !viewed.has(note.id)).length
        setUnreadPerformanceNotesCount(unreadCount)
      } catch (error: any) {
        // Silently handle errors - don't show toasts for background loading
        console.error('Error loading unread performance notes:', error)
        setUnreadPerformanceNotesCount(0)
      }
    }
    
    loadUnreadPerformanceNotes()
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadUnreadPerformanceNotes, 60000)
    return () => clearInterval(interval)
  }, [batchId, userRole])
  
  // Combine all sources to determine if there are any active sessions
  const hasActiveSessions = hasActiveSessionsFromAnnouncements || hasActiveSessionsFromMeetings || hasActiveSessionsFromBackground
  
  const renderContent = () => {
    if (activeTab === 'meetings') {
      return (
        <BatchMeetings
          batchId={batchId}
          courseId={courseId}
          userRole={userRole}
          onActiveSessionsChange={setHasActiveSessionsFromMeetings}
        />
      )
    }

    if (activeTab === 'quizzes') {
      return (
        <BatchQuizzes
          batchId={batchId}
          userRole={userRole}
          onPendingQuizzesChange={setPendingQuizzesCount}
        />
      )
    }

    if (activeTab === 'performance-notes') {
      return (
        <PerformanceNotes
          batchId={batchId}
          userRole={userRole}
          currentUserId={currentUserId || ''}
          onUnreadCountChange={setUnreadPerformanceNotesCount}
        />
      )
    }

    if (activeTab === 'files') {
      return (
        <CourseFiles
          userRole={userRole}
          onUpload={onFileUpload}
        />
      )
    }

    return (
      <PostsList
        courseId={courseId}
        userRole={userRole}
        isActualTeacher={isActualTeacher}
        userName={userName}
        userAvatar={userAvatar}
        batchId={batchId}
        onActiveSessionsChange={setHasActiveSessionsFromAnnouncements}
      />
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      <CourseTopBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onStartSession={onStartSession}
        isSessionActive={isSessionActive}
        liveSessionsCount={isSessionActive ? 1 : 0}
        userRole={userRole}
        onAddStudent={onAddStudent}
        hasActiveSessions={hasActiveSessions}
        unreadPerformanceNotesCount={unreadPerformanceNotesCount}
        pendingQuizzesCount={pendingQuizzesCount}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

