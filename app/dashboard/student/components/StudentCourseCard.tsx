'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  Award, 
  Play,
  Download,
  ExternalLink
} from 'lucide-react'

interface StudentCourseCardProps {
  course: {
    id: string
    title: string
    description?: string
    course_type: string
    course_type_display: string
    teacher_name: string
    enrollment_date: string
    completion_percentage: number
    status: 'active' | 'completed' | 'paused' | 'dropped'
    grade?: number
    certificate_url?: string
    next_session?: string
    total_sessions: number
    attended_sessions: number
  }
  onViewDetails?: (courseId: string) => void
}

export default function StudentCourseCard({ course, onViewDetails }: StudentCourseCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">نشط</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">مكتمل</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">متوقف</Badge>
      case 'dropped':
        return <Badge className="bg-red-100 text-red-800">منسحب</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCourseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      individual: 'فردي',
      family: 'عائلي',
      group_private: 'مجموعة خاصة',
      group_public: 'مجموعة عامة'
    }
    return labels[type] || type
  }

  return (
    <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 line-clamp-2">{course.title}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(course.status)}
              <Badge variant="outline" className="text-xs">
                {getCourseTypeLabel(course.course_type)}
              </Badge>
            </div>
          </div>
        </div>
        
        {course.description && (
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">التقدم</span>
            <span className="font-medium">{course.completion_percentage || 0}%</span>
          </div>
          <Progress value={course.completion_percentage || 0} className="h-2" />
        </div>

        {/* Course Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4" />
            <span>{course.teacher_name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(course.enrollment_date).toLocaleDateString('ar-SA')}</span>
          </div>
          
          {course.total_sessions && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{course.attended_sessions || 0}/{course.total_sessions} جلسة</span>
            </div>
          )}
          
          {course.grade && (
            <div className="flex items-center gap-2 text-gray-600">
              <Award className="w-4 h-4" />
              <span>{course.grade}%</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {course.status === 'active' && (
            <Button size="sm" className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
              <Play className="w-4 h-4 ml-2" />
              متابعة الدراسة
            </Button>
          )}
          
          {course.status === 'completed' && course.certificate_url && (
            <Button size="sm" variant="outline" className="flex-1">
              <Download className="w-4 h-4 ml-2" />
              تحميل الشهادة
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onViewDetails?.(course.id)}
          >
            <ExternalLink className="w-4 h-4 ml-2" />
            التفاصيل
          </Button>
        </div>

        {/* Next Session Info */}
        {course.next_session && course.status === 'active' && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-800 mb-1">الجلسة القادمة</div>
            <div className="text-sm text-blue-600">
              {new Date(course.next_session).toLocaleString('ar-SA')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
