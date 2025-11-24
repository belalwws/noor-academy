'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen,
  Target,
  Award,
  MapPin,
  Globe
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
  objectives?: string[]
  requirements?: string[]
  duration?: string
  level?: string
  language?: string
  location?: string
  category?: string
}

interface CourseDetailsProps {
  course: Course
}

export default function CourseDetails({ course }: CourseDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Course Overview */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
            <BookOpen className="w-6 h-6 text-[#2d7d32]" />
            نظرة عامة على الدورة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
            <p className="text-gray-700 leading-relaxed">{course.description}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2d7d32]" />
              <div>
                <p className="text-xs text-gray-500">تاريخ البداية</p>
                <p className="text-sm font-medium text-gray-900">{course.startDate}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2d7d32]" />
              <div>
                <p className="text-xs text-gray-500">تاريخ النهاية</p>
                <p className="text-sm font-medium text-gray-900">{course.endDate}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2d7d32]" />
              <div>
                <p className="text-xs text-gray-500">عدد الطلاب</p>
                <p className="text-sm font-medium text-gray-900">{course.studentsCount}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2d7d32]" />
              <div>
                <p className="text-xs text-gray-500">المستوى</p>
                <p className="text-sm font-medium text-gray-900">{course.level || 'متوسط'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Objectives */}
      {course.objectives && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              <Target className="w-5 h-5 text-[#2d7d32]" />
              أهداف الدورة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {course.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#2d7d32] rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Course Requirements */}
      {course.requirements && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              <BookOpen className="w-5 h-5 text-[#2d7d32]" />
              متطلبات الدورة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {course.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#2d7d32] rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{requirement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
            <Globe className="w-5 h-5 text-[#2d7d32]" />
            معلومات إضافية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">المدة الزمنية:</span>
                <span className="font-medium text-gray-900">{course.duration || '8 أسابيع'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">اللغة:</span>
                <span className="font-medium text-gray-900">{course.language || 'العربية'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">التصنيف:</span>
                <Badge className="bg-[#2d7d32]/10 text-[#2d7d32] border-[#2d7d32]/20">
                  {course.category || 'علوم شرعية'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">المعلم:</span>
                <span className="font-medium text-gray-900">{course.instructor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">الموقع:</span>
                <span className="font-medium text-gray-900">{course.location || 'عبر الإنترنت'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">الحالة:</span>
                <Badge 
                  className={`${
                    course.status === 'active' 
                      ? 'bg-blue-100 text-blue-800 border-blue-200' 
                      : course.status === 'upcoming'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  } border`}
                >
                  {course.status === 'active' ? 'نشطة' : course.status === 'upcoming' ? 'قادمة' : 'مكتملة'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
