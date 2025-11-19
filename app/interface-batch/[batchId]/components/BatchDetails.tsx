'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Batch } from '@/lib/types/live-education'
import { 
  Users, 
  User, 
  Calendar, 
  Clock, 
  BookOpen, 
  GraduationCap,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import { motion } from 'framer-motion'

interface BatchDetailsProps {
  batch: Batch
  studentsCount?: number
}

export default function BatchDetails({ batch, studentsCount: externalStudentsCount }: BatchDetailsProps) {
  const batchType = batch.type || batch.batch_type || 'group'
  const studentsCount = externalStudentsCount !== undefined 
    ? externalStudentsCount
    : (typeof batch.students_count === 'number' 
      ? batch.students_count 
      : (typeof batch.students_count === 'string' 
        ? parseInt(batch.students_count) || 0 
        : (batch.current_students || (batch.students?.length || 0))))
  const maxStudents = batch.max_students || (batchType === 'individual' ? 1 : 200)
  const fillPercentage = maxStudents > 0 ? (studentsCount / maxStudents) * 100 : 0
  const isFull = studentsCount >= maxStudents
  
  // Calculate stats from batch.students if available
  const activeStudents = batch.students?.filter(s => s.status === 'active').length || 0
  const completedStudents = batch.students?.filter(s => s.status === 'completed').length || 0

  const getStatusBadge = () => {
    switch (batch.status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            نشط
          </Badge>
        )
      case 'closed':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            مغلق
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
            {batch.status}
          </Badge>
        )
    }
  }

  const getTypeBadge = () => {
    if (batchType === 'individual') {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 flex items-center gap-1">
          <User className="w-3 h-3" />
          فردي
        </Badge>
      )
    }
    return (
      <Badge className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700 flex items-center gap-1">
        <Users className="w-3 h-3" />
        جماعي
      </Badge>
    )
  }

  return (
    <div className="space-y-3">
      {/* Batch Info Card - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
          <CardContent className="p-3 space-y-3">
            {/* Status and Type - Compact */}
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge()}
              {getTypeBadge()}
            </div>

            {/* Students Count - Compact */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  الطلاب
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-xs">
                  {studentsCount} / {maxStudents}
                </span>
              </div>
              <Progress 
                value={fillPercentage} 
                className={`h-1.5 ${isFull ? 'bg-red-200 dark:bg-red-900/30' : ''}`}
              />
            </div>

            {/* Course & Teacher - Compact Grid */}
            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              {batch.course_title && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">الدورة</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {batch.course_title}
                    </p>
                  </div>
                </div>
              )}

              {batch.teacher_name && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">المعلم</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {batch.teacher_name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Created Date - Compact */}
            {batch.created_at && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">تاريخ الإنشاء</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {new Date(batch.created_at).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Optional Fields - Collapsible */}
            {(batch.description || batch.schedule || batch.meeting_link) && (
              <details className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                  المزيد من التفاصيل
                </summary>
                <div className="mt-2 space-y-2">
                  {batch.description && (
                    <div className="flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الوصف</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-3">
                          {batch.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {batch.schedule && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الجدول</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                          {batch.schedule}
                        </p>
                      </div>
                    </div>
                  )}

                  {batch.meeting_link && (
                    <div className="flex items-start gap-2">
                      <div className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">رابط الاجتماع</p>
                        <a 
                          href={batch.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block"
                        >
                          {batch.meeting_link}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-2"
      >
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600 dark:text-gray-400">نشطون</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  {activeStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600 dark:text-gray-400">مكتملون</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  {completedStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

