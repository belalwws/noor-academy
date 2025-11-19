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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-[#252525] border-r border-gray-700/50 h-full overflow-y-auto"
    >
      {/* Course Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center"
          >
            <BookOpen className="w-5 h-5 text-white" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white line-clamp-2">
              {course.title}
            </h2>
            <p className="text-xs text-gray-400 truncate">
              {course.instructor}
            </p>
          </div>
        </div>

        <Badge
          className={`${
            course.status === 'active'
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : course.status === 'upcoming'
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
          } border text-xs`}
        >
          {course.status === 'active' ? 'نشطة' : course.status === 'upcoming' ? 'قادمة' : 'مكتملة'}
        </Badge>
      </div>

      {/* Navigation Buttons */}
      <div className="p-3 space-y-1">
        <motion.button
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSectionChange('details')}
          className={`w-full flex items-center justify-start gap-3 px-3 py-2 rounded-lg transition-all font-medium text-sm ${
            activeSection === 'details'
              ? 'bg-primary/20 text-white border-r-2 border-primary'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>تفاصيل الدورة</span>
        </motion.button>

        <motion.button
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSectionChange('members')}
          className={`w-full flex items-center justify-start gap-3 px-3 py-2 rounded-lg transition-all font-medium text-sm ${
            activeSection === 'members'
              ? 'bg-primary/20 text-white border-r-2 border-primary'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>الأعضاء</span>
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="p-3 border-t border-gray-700/50">
        <h3 className="text-xs font-semibold text-gray-400 mb-3 px-3">إحصائيات سريعة</h3>
        <div className="space-y-1">
          <motion.div
            whileHover={{ x: 3, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
            className="flex items-center justify-between p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs text-gray-400">الطلاب</span>
            </div>
            <span className="text-xs font-bold text-white">{course.studentsCount}</span>
          </motion.div>

          <motion.div
            whileHover={{ x: 3, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
            className="flex items-center justify-between p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs text-gray-400">البداية</span>
            </div>
            <span className="text-xs font-medium text-gray-300">{course.startDate}</span>
          </motion.div>

          <motion.div
            whileHover={{ x: 3, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
            className="flex items-center justify-between p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs text-gray-400">النهاية</span>
            </div>
            <span className="text-xs font-medium text-gray-300">{course.endDate}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
