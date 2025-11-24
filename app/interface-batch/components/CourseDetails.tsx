'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Target,
  Award,
  MapPin,
  Globe,
  CheckCircle2
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
    <div className="space-y-4">
      {/* Course Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#3a3a3a] rounded-lg border border-gray-700/50 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-base font-bold text-white">نظرة عامة</h3>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h4 className="font-semibold text-white text-sm mb-2">{course.title}</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{course.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.div
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              className="flex items-center gap-2 p-3 bg-[#2d2d2d] rounded-lg"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-400">البداية</p>
                <p className="text-xs font-semibold text-white">{course.startDate}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              className="flex items-center gap-2 p-3 bg-[#2d2d2d] rounded-lg"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-400">النهاية</p>
                <p className="text-xs font-semibold text-white">{course.endDate}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              className="flex items-center gap-2 p-3 bg-[#2d2d2d] rounded-lg"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-400">الطلاب</p>
                <p className="text-xs font-semibold text-white">{course.studentsCount}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              className="flex items-center gap-2 p-3 bg-[#2d2d2d] rounded-lg"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-400">المستوى</p>
                <p className="text-xs font-semibold text-white">{course.level || 'متوسط'}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Course Objectives */}
      {course.objectives && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#3a3a3a] rounded-lg border border-gray-700/50 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-base font-bold text-white">أهداف الدورة</h3>
            </div>
          </div>

          <div className="p-4">
            <ul className="space-y-2">
              {course.objectives.map((objective, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-[#2d2d2d] transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{objective}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Course Requirements */}
      {course.requirements && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">متطلبات الدورة</h3>
            </div>
          </div>

          <div className="p-6">
            <ul className="space-y-3">
              {course.requirements.map((requirement, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{requirement}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
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
