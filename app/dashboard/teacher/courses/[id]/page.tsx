'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { liveEducationApi } from '@/lib/api/live-education'
import { recordedCoursesApi } from '@/lib/api/recorded-courses'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Calendar,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  FileText
} from 'lucide-react'

interface LiveCourse {
  id: string
  title: string
  description: string
  thumbnail?: string
  cover_image?: string
  learning_outcomes?: string
  topics?: string
  intro_session_id?: string
  teacher: number
  teacher_name: string
  teacher_id: string
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed'
  approval_status: string
  approval_status_display: string
  approved_by?: number
  approved_at?: string
  rejection_reason?: string
  start_date?: string
  end_date?: string
  accepting_applications: boolean
  is_hidden: boolean
  batches_count: string
  total_students: string
  created_at: string
  updated_at: string
  batches?: string
}

export default function CourseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.['id'] as string

  const [course, setCourse] = useState<LiveCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRecordedCourse, setIsRecordedCourse] = useState(false)

  useEffect(() => {
    if (courseId) {
      loadCourseDetails()
    }
  }, [courseId])

  const loadCourseDetails = async () => {
    try {
      setLoading(true)
      // Try to load as live course first
      try {
        const data = await liveEducationApi.courses.get(courseId)
        setCourse(data as any)
        setIsRecordedCourse(false)
      } catch (liveError) {
        // If it fails, try as recorded course
        try {
          const data = await recordedCoursesApi.get(courseId)
          setCourse(data as any)
          setIsRecordedCourse(true)
        } catch (recordedError) {
          throw new Error('Course not found')
        }
      }
    } catch (error) {
      console.error('Error loading course:', error)
      toast.error('فشل تحميل تفاصيل الدورة')
    } finally {
      setLoading(false)
    }
  }


  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      pending: { label: 'قيد المراجعة', variant: 'secondary' },
      approved: { label: 'معتمدة', variant: 'default' },
      rejected: { label: 'مرفوضة', variant: 'outline' },
      active: { label: 'نشطة', variant: 'default' },
      completed: { label: 'مكتملة', variant: 'secondary' }
    }

    const config = statusConfig[status] || { label: status, variant: 'secondary' }
    return (
      <Badge variant={config.variant} className={status === 'approved' || status === 'active' ? 'bg-green-500' : status === 'rejected' ? 'bg-red-500' : ''}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 mt-20">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center mt-20">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">الدورة غير موجودة</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              لم يتم العثور على الدورة المطلوبة
            </p>
            <Button onClick={() => router.push('/dashboard/teacher')}>
              العودة للوحة التحكم
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 mt-20" dir="rtl">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/teacher')}
              className="w-10 h-10 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                تفاصيل الدورة
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                عرض وإدارة معلومات الدورة
              </p>
            </div>
          </div>
        </motion.div>

        {/* Course Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-2xl">{course.title}</CardTitle>
                    {getStatusBadge(course.status)}
                  </div>
                  <CardDescription className="text-base">
                    {course.description}
                  </CardDescription>
                </div>
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users className="w-5 h-5" />
                  <div>
                    <p className="text-xs">عدد الطلاب</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {course.total_students}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <BookOpen className="w-5 h-5" />
                  <div>
                    <p className="text-xs">عدد المجموعات</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {course.batches_count}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-5 h-5" />
                  <div>
                    <p className="text-xs">تاريخ البداية</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {course.start_date ? new Date(course.start_date).toLocaleDateString('ar-EG') : 'غير محدد'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-5 h-5" />
                  <div>
                    <p className="text-xs">تاريخ النهاية</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {course.end_date ? new Date(course.end_date).toLocaleDateString('ar-EG') : 'غير محدد'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Learning Outcomes */}
          {course.learning_outcomes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    نواتج التعلم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {course.learning_outcomes}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Topics */}
          {course.topics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    المواضيع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {course.topics}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Settings & Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات والحالة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium">قبول الطلبات</span>
                </div>
                <Badge variant={course.accepting_applications ? 'default' : 'secondary'}>
                  {course.accepting_applications ? 'مفتوح' : 'مغلق'}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {course.is_hidden ? (
                    <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <span className="font-medium">حالة الظهور</span>
                </div>
                <Badge variant={course.is_hidden ? 'secondary' : 'default'}>
                  {course.is_hidden ? 'مخفية' : 'ظاهرة'}
                </Badge>
              </div>

              {course.rejection_reason && (
                <>
                  <Separator />
                  <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                          سبب الرفض
                        </h4>
                        <p className="text-red-800 dark:text-red-200 text-sm">
                          {course.rejection_reason}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">المعلم:</span>
                <span className="font-medium">{course.teacher_name}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">تاريخ الإنشاء:</span>
                <span className="font-medium">
                  {new Date(course.created_at).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">آخر تحديث:</span>
                <span className="font-medium">
                  {new Date(course.updated_at).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {course.approved_at && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">تاريخ الاعتماد:</span>
                    <span className="font-medium">
                      {new Date(course.approved_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
}
