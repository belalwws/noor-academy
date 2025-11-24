'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import {
  Megaphone,
  FileText,
  Video,
  Play,
  Users as UsersIcon,
  Upload,
  UserPlus,
  ClipboardList,
  BookOpen,
  Star
} from 'lucide-react'

interface CourseTopBarProps {
  activeTab: 'announcements' | 'files' | 'quizzes' | 'meetings' | 'performance-notes'
  onTabChange: (tab: 'announcements' | 'files' | 'quizzes' | 'meetings' | 'performance-notes') => void
  onStartSession: () => void
  isSessionActive?: boolean
  liveSessionsCount?: number
  userRole?: 'teacher' | 'student'
  onAddStudent?: () => void
  hasActiveSessions?: boolean // New prop to indicate if there are active sessions
  unreadPerformanceNotesCount?: number // New prop for unread performance notes
  pendingQuizzesCount?: number // New prop for pending quizzes count
}

export default function CourseTopBar({
  activeTab,
  onTabChange,
  onStartSession,
  isSessionActive = false,
  liveSessionsCount = 0,
  userRole = 'student',
  onAddStudent,
  hasActiveSessions = false, // New prop with default value
  unreadPerformanceNotesCount = 0, // New prop with default value
  pendingQuizzesCount = 0 // New prop with default value
}: CourseTopBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-3"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange('announcements')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all relative ${
              activeTab === 'announcements'
                ? 'text-gray-900 dark:text-slate-50'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>الإعلانات</span>
            {/* Pulsing dot indicator for active sessions */}
            {hasActiveSessions && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 bg-red-500 rounded-full ml-1"
              />
            )}
            {liveSessionsCount > 0 && activeTab === 'announcements' && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 ml-1">
                {liveSessionsCount}
              </Badge>
            )}
            {activeTab === 'announcements' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </motion.button>

          <motion.button
            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange('files')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all relative ${
              activeTab === 'files'
                ? 'text-gray-900 dark:text-slate-50'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>الملفات</span>
            {activeTab === 'files' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </motion.button>

          <motion.button
            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange('quizzes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all relative ${
              activeTab === 'quizzes'
                ? 'text-gray-900 dark:text-slate-50'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>الاختبارات</span>
            {pendingQuizzesCount > 0 && userRole === 'student' && (
              <Badge className="bg-amber-500 text-white text-xs px-2 py-0.5 ml-1 animate-pulse">
                {pendingQuizzesCount}
              </Badge>
            )}
            {activeTab === 'quizzes' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </motion.button>

          <motion.button
            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange('meetings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all relative ${
              activeTab === 'meetings'
                ? 'text-gray-900 dark:text-slate-50'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>الاجتماعات</span>
            {/* Pulsing dot indicator for active sessions */}
            {hasActiveSessions && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 bg-red-500 rounded-full ml-1"
              />
            )}
            {liveSessionsCount > 0 && activeTab === 'meetings' && (
              <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5 ml-1">
                {liveSessionsCount}
              </Badge>
            )}
            {activeTab === 'meetings' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </motion.button>

          <motion.button
            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange('performance-notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all relative ${
              activeTab === 'performance-notes'
                ? 'text-gray-900 dark:text-slate-50'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>ملاحظات الأداء</span>
            {unreadPerformanceNotesCount > 0 && userRole === 'student' && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 ml-1 animate-pulse">
                {unreadPerformanceNotesCount}
              </Badge>
            )}
            {activeTab === 'performance-notes' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </motion.button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isSessionActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-lg"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">مباشر</span>
              <Badge className="bg-red-500 text-white text-xs flex items-center gap-1 px-2 py-0.5">
                <UsersIcon className="w-3 h-3" />
                12
              </Badge>
            </motion.div>
          )}

          {/* Add Student Button (Teacher Only) */}
          {userRole === 'teacher' && onAddStudent && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddStudent}
              className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-200 flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>أضف طالب</span>
            </motion.button>
          )}

          {/* Upload File Button (Files Tab Only) */}
          {activeTab === 'files' && userRole === 'teacher' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('file-upload')?.click()}
              className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-200 flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>رفع ملف</span>
            </motion.button>
          )}

        </div>
      </div>
    </motion.div>
  )
}
