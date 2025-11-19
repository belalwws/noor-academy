'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto">
      {/* Course Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#2d7d32] to-[#1b5e20] rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 line-clamp-2">
              {course.title}
            </h2>
            <p className="text-sm text-gray-600">
              {course.instructor}
            </p>
          </div>
        </div>
        
        <Badge 
          className={`${
            course.status === 'active' 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : course.status === 'upcoming'
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : 'bg-gray-100 text-gray-800 border-gray-200'
          } border`}
        >
          {course.status === 'active' ? 'نشطة' : course.status === 'upcoming' ? 'قادمة' : 'مكتملة'}
        </Badge>
      </div>

      {/* Navigation Buttons */}
      <div className="p-4 space-y-2">
        <Button
          variant={activeSection === 'details' ? 'default' : 'ghost'}
          onClick={() => onSectionChange('details')}
          className={`w-full justify-start gap-3 h-12 ${
            activeSection === 'details' 
              ? 'bg-[#2d7d32] text-white hover:bg-[#1b5e20]' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Info className="w-5 h-5" />
          عرض تفاصيل الدورة
        </Button>
        
        <Button
          variant={activeSection === 'members' ? 'default' : 'ghost'}
          onClick={() => onSectionChange('members')}
          className={`w-full justify-start gap-3 h-12 ${
            activeSection === 'members' 
              ? 'bg-[#2d7d32] text-white hover:bg-[#1b5e20]' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Users className="w-5 h-5" />
          عرض الأعضاء في الدورة
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">إحصائيات سريعة</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">الطلاب</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{course.studentsCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">تاريخ البداية</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{course.startDate}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">تاريخ النهاية</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{course.endDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
