'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface TeamsStyleCourseCardProps {
  course: {
    id: string
    title: string
    description?: string
    course_type: string
    course_type_display: string
    teacher: {
      user: {
        first_name: string
        last_name: string
      }
    }
    enrollment_status?: string
    status_display?: string
    next_session?: string
    total_sessions?: number
    attended_sessions?: number
    recent_notes_count?: number
    available_spots?: number
  }
  batch?: {
    id: string
    batch: string
    batch_details?: {
      id: string
      name: string
      course: string
      course_title?: string
      type?: string
      status?: string
      max_students?: number
      students_count?: string | number
      teacher?: string
      teacher_name?: string
      created_at?: string
    }
    status: string
  }
  onClick: (courseId: string) => void
  onBatchClick?: (batchId: string) => void
}

const getCourseTypeColor = (courseType: string) => {
  switch (courseType) {
    case 'individual':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700'
    case 'family':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700'
    case 'group_private':
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
    case 'group_public':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700'
    default:
      return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-600'
  }
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'approved':
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
    case 'pending':
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700'
    case 'rejected':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
    default:
      return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-600'
  }
}

// Pick a pleasant gradient color based on course id using platform colors (Orange/Amber)
const pickTileGradient = (seed: string) => {
  // Platform colors - orange/amber variations (brand colors)
  const gradients = [
    'from-orange-500 to-amber-500', // Primary orange to amber
    'from-orange-600 to-amber-600', // Darker orange to amber
    'from-amber-500 to-orange-400', // Amber to light orange
    'from-orange-500 to-yellow-500', // Orange to yellow
    'from-amber-600 to-orange-500', // Amber to orange
    'from-orange-400 to-amber-400', // Light orange to light amber
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return gradients[hash % gradients.length]
}

export default function TeamsStyleCourseCard({ course, batch, onClick, onBatchClick }: TeamsStyleCourseCardProps) {
  const initials = course.title?.trim()?.charAt(0)?.toUpperCase() || 'د'
  const gradient = pickTileGradient(course.id)

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -8 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        className="group relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
        onClick={() => onClick(course.id)}
      >
        {/* Enhanced tile banner */}
        <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -translate-y-6 translate-x-6"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full blur-xl translate-y-4 -translate-x-4"></div>

          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <Badge className={`text-[10px] px-2.5 py-1 border backdrop-blur-md shadow-sm font-medium ${getCourseTypeColor(course.course_type)}`}>
              {course.course_type_display}
            </Badge>
            {course.enrollment_status && (
              <Badge className={`text-[10px] px-2.5 py-1 border backdrop-blur-md shadow-sm font-medium ${getStatusColor(course.enrollment_status)}`}>
                {course.status_display || (course.enrollment_status === 'approved' ? 'مسجل' : course.enrollment_status === 'pending' ? 'قيد المراجعة' : 'مرفوض')}
              </Badge>
            )}
          </div>
          <motion.div
            whileHover={{ rotate: 5 }}
            className="w-14 h-14 rounded-xl bg-white/30 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl absolute bottom-3 right-3 border border-white/30 shadow-xl"
          >
            {initials}
          </motion.div>
        </div>

        <CardContent className="p-6 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900/50">
          {/* Title Only */}
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-5 line-clamp-2 group-hover:text-orange-500 dark:group-hover:text-amber-400 transition-colors leading-tight">
              {course.title}
            </h3>
          </div>

          {/* Action button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-xl h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-orange-600 dark:to-amber-600 dark:hover:from-orange-700 dark:hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base"
            onClick={(e) => { e.stopPropagation(); onClick(course.id) }}
          >
            <span>دخول الدورة</span>
            <ChevronRight className="w-5 h-5 mr-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
