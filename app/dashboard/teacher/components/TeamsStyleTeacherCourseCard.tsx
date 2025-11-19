'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock,
  MessageSquare,
  ChevronRight,
  Settings,
  Video,
  BarChart3,
  Eye,
  Edit,
  Play
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description?: string
  course_type: string
  course_type_display: string
  enrollment_count?: number | string
  max_students?: number
  status?: string
  is_approved?: boolean
  approval_status?: string
  next_session?: string
  total_sessions?: number
  recent_notes_count?: number
  active_students?: number
}

interface TeamsStyleTeacherCourseCardProps {
  course: Course
  onViewDetails: (course: Course) => void
  onManageCourse: (courseId: string) => void
  onAddNote: (course: Course) => void
}

const getCourseTypeColor = (courseType: string) => {
  switch (courseType) {
    case 'individual':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'family':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'group_private':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'group_public':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusColor = (status?: string, isApproved?: boolean, approvalStatus?: string) => {
  if (isApproved === true || approvalStatus === 'approved') {
    return 'bg-green-100 text-green-800 border-green-200'
  }
  if (approvalStatus === 'pending' || status === 'pending_review') {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
  if (approvalStatus === 'rejected') {
    return 'bg-red-100 text-red-800 border-red-200'
  }
  if (status === 'draft') {
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return 'bg-blue-100 text-blue-800 border-blue-200'
}

const getStatusText = (status?: string, isApproved?: boolean, approvalStatus?: string) => {
  if (isApproved === true || approvalStatus === 'approved') return 'معتمدة'
  if (approvalStatus === 'pending' || status === 'pending_review') return 'قيد المراجعة'
  if (approvalStatus === 'rejected') return 'مرفوضة'
  if (status === 'draft') return 'مسودة'
  if (status === 'published') return 'منشورة'
  return 'غير محدد'
}

export default function TeamsStyleTeacherCourseCard({ 
  course, 
  onViewDetails, 
  onManageCourse,
  onAddNote 
}: TeamsStyleTeacherCourseCardProps) {
  const enrollmentCount = Number(course.enrollment_count || 0)
  const maxStudents = Number(course.max_students || 0)
  const fillPercentage = maxStudents > 0 ? (enrollmentCount / maxStudents) * 100 : 0
  
  const isApproved = (course.is_approved === true) || (course.approval_status === 'approved')
  
  return (
    <Card 
      className="group relative overflow-hidden bg-white border-0 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:-translate-y-1"
    >
      {/* Header with course type indicator */}
      <div className="h-2 bg-gradient-to-r from-[#2d7d32] via-[#4caf50] to-[#1b5e20]"></div>
      
      <CardContent className="p-6">
        {/* Course Title and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#2d7d32] transition-colors">
              {course.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge className={`text-xs border ${getCourseTypeColor(course.course_type)}`}>
                {course.course_type_display}
              </Badge>
              <Badge className={`text-xs border ${getStatusColor(course.status, course.is_approved, course.approval_status)}`}>
                {getStatusText(course.status, course.is_approved, course.approval_status)}
              </Badge>
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-[#2d7d32]/10 to-[#4caf50]/10 rounded-xl flex items-center justify-center group-hover:from-[#2d7d32]/20 group-hover:to-[#4caf50]/20 transition-all">
            <BookOpen className="w-6 h-6 text-[#2d7d32]" />
          </div>
        </div>

        {/* Course Description */}
        {course.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Student Enrollment Progress */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">الطلاب المسجلين</span>
            </div>
            <span className="text-sm font-bold text-blue-600">
              {enrollmentCount}/{maxStudents || '∞'}
            </span>
          </div>
          {maxStudents > 0 && (
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(fillPercentage, 100)}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {course.total_sessions && (
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
              <Video className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs text-purple-600 font-medium">{course.total_sessions}</p>
                <p className="text-xs text-purple-500">جلسة</p>
              </div>
            </div>
          )}
          
          {course.recent_notes_count !== undefined && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
              <MessageSquare className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-green-600 font-medium">{course.recent_notes_count}</p>
                <p className="text-xs text-green-500">ملحوظة</p>
              </div>
            </div>
          )}
        </div>

        {/* Next Session */}
        {course.next_session && (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#2d7d32]/5 to-[#4caf50]/5 rounded-xl mb-4">
            <Calendar className="w-4 h-4 text-[#2d7d32]" />
            <div>
              <p className="text-xs text-gray-500">الجلسة القادمة</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(course.next_session).toLocaleDateString('ar-SA')}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-gradient-to-r from-[#2d7d32] to-[#4caf50] hover:from-[#1b5e20] hover:to-[#2d7d32] text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
            onClick={() => onViewDetails(course)}
          >
            <Eye className="w-4 h-4 mr-2" />
            <span>عرض التفاصيل</span>
          </Button>
          
          {isApproved && (
            <Button 
              variant="outline"
              className="px-3 border-[#2d7d32] text-[#2d7d32] hover:bg-[#2d7d32] hover:text-white rounded-xl transition-all duration-300"
              onClick={() => onManageCourse(course.id)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
          
          <Button 
            variant="outline"
            className="px-3 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all duration-300"
            onClick={() => onAddNote(course)}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>

        {/* Live Session Indicator */}
        {/* This would be populated with actual live session data */}
        {Math.random() > 0.8 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            جلسة مباشرة
          </div>
        )}
      </CardContent>
    </Card>
  )
}
