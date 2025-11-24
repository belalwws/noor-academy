'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Users,
  Info,
  Calendar,
  Clock
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  startDate: string
  endDate: string
  studentsCount: number
  status: 'active' | 'upcoming' | 'completed'
}

interface CourseSidebarProps {
  course: Course
  activeSection: 'details' | 'members'
  onSectionChange: (section: 'details' | 'members') => void
}

export default function CourseSidebar({
  course,
  activeSection,
  onSectionChange
}: CourseSidebarProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-700 h-full overflow-y-auto"
    >
      {/* Course Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center"
          >
            <BookOpen className="w-5 h-5 text-primary" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 dark:text-slate-50 truncate">
              {course.title}
            </h2>
            <p className="text-xs text-gray-600 dark:text-slate-400 truncate">
              {course.instructor}
            </p>
          </div>
        </div>

        <Badge
          className={`text-xs ${
            course.status === 'active'
              ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
              : course.status === 'upcoming'
              ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
              : 'bg-gray-100 dark:bg-slate-500/20 text-gray-700 dark:text-slate-400 border-gray-200 dark:border-slate-500/30'
          } border`}
        >
          {course.status === 'active' ? 'نشطة' : course.status === 'upcoming' ? 'قادمة' : 'مكتملة'}
        </Badge>
      </div>

      {/* Navigation Buttons */}
      <div className="p-3 space-y-1">
        <motion.button
          whileHover={{ x: 2 }}
          onClick={() => onSectionChange('details')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
            activeSection === 'details'
              ? 'bg-primary/20 text-primary'
              : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-50'
          }`}
        >
          <Info className="w-4 h-4" />
          تفاصيل الدورة
        </motion.button>

        <motion.button
          whileHover={{ x: 2 }}
          onClick={() => onSectionChange('members')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
            activeSection === 'members'
              ? 'bg-primary/20 text-primary'
              : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          الأعضاء
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="p-3 border-t border-gray-200 dark:border-slate-700 mt-2">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">إحصائيات</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
              <Users className="w-3 h-3" />
              <span>الطلاب</span>
            </div>
            <span className="text-gray-900 dark:text-slate-50 font-medium">{course.studentsCount}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>البداية</span>
            </div>
            <span className="text-gray-700 dark:text-slate-300">{course.startDate}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>النهاية</span>
            </div>
            <span className="text-gray-700 dark:text-gray-300">{course.endDate}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
