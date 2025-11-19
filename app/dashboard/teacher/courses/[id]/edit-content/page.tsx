'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { liveEducationApi } from '@/lib/api/live-education'
import { liveCourseEditRequestsApi } from '@/lib/api/live-course-edit-requests'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Send,
  Loader2,
  FileText,
  Calendar,
  Lightbulb
} from 'lucide-react'

interface LiveCourse {
  id: string
  title: string
  description: string
  learning_outcomes?: string
  topics?: string
  start_date?: string
  end_date?: string
}

export default function EditCourseContentPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.['id'] as string

  const [course, setCourse] = useState<LiveCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state - only fields that can be edited
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    learning_outcomes: '',
    topics: '',
    start_date: '',
    end_date: '',
    teacher_notes: ''
  })

  useEffect(() => {
    if (courseId) {
      loadCourseDetails()
    }
  }, [courseId])

  const loadCourseDetails = async () => {
    try {
      setLoading(true)
      const data = await liveEducationApi.courses.get(courseId)
      setCourse(data as any)
      
      // Populate form with current course data
      const courseData = data as any
      setFormData({
        title: courseData.title || '',
        description: courseData.description || '',
        learning_outcomes: courseData.learning_outcomes || '',
        topics: courseData.topics || '',
        start_date: courseData.start_date ? courseData.start_date.split('T')[0] : '',
        end_date: courseData.end_date ? courseData.end_date.split('T')[0] : '',
        teacher_notes: ''
      })
    } catch (error) {
      console.error('Error loading course:', error)
      toast.error('فشل تحميل تفاصيل الدورة')
      router.push('/dashboard/teacher')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان الدورة')
      return
    }

    if (!formData.description.trim()) {
      toast.error('يرجى إدخال وصف الدورة')
      return
    }

    try {
      setSubmitting(true)
      
      // Prepare request data - only include fields that have values
      const requestData: any = {
        title: formData.title,
        description: formData.description
      }
      
      // Only include optional fields if they have values
      if (formData.learning_outcomes && typeof formData.learning_outcomes === 'string' && formData.learning_outcomes.trim()) {
        requestData.learning_outcomes = formData.learning_outcomes
      }
      if (formData.topics && typeof formData.topics === 'string' && formData.topics.trim()) {
        requestData.topics = formData.topics
      }
      if (formData.start_date) {
        requestData.start_date = formData.start_date
      }
      if (formData.end_date) {
        requestData.end_date = formData.end_date
      }
      if (formData.teacher_notes && typeof formData.teacher_notes === 'string' && formData.teacher_notes.trim()) {
        requestData.teacher_notes = formData.teacher_notes
      }
      
      console.log('📤 Creating edit request:', {
        courseId,
        requestData
      })
      
      // Create edit request
      await liveCourseEditRequestsApi.createEditRequest(courseId, requestData)
      
      toast.success('تم إرسال طلب تعديل الدورة بنجاح. سيتم مراجعته من قبل المشرف العام.')
      router.push(`/dashboard/teacher/courses/${courseId}`)
    } catch (error: any) {
      console.error('❌ Error creating edit request:', {
        error,
        message: error?.message,
        stack: error?.stack
      })
      toast.error(error.message || 'فشل في إرسال طلب التعديل')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!course) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 mt-20" dir="rtl">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/teacher/courses/${courseId}`)}
              className="w-10 h-10 p-0 border-orange-200 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                طلب تعديل محتوى الدورة
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                سيتم مراجعة طلبك من قبل المشرف العام قبل تطبيق التغييرات
              </p>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>ملاحظة:</strong> يمكنك طلب تعديل محتوى الدورة المقبولة. سيتم إرسال طلبك إلى المشرف العام للمراجعة والموافقة قبل تطبيق التغييرات.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-b border-orange-200 dark:border-orange-800">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  المعلومات الأساسية
                </CardTitle>
                <CardDescription>
                  عنوان ووصف الدورة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الدورة *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="مثال: دورة تعليم القرآن الكريم"
                    required
                    className="border-orange-200 focus:border-orange-500 dark:border-orange-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف الدورة *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="وصف تفصيلي عن محتوى الدورة وأهدافها"
                    rows={5}
                    required
                    className="border-orange-200 focus:border-orange-500 dark:border-orange-800"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Learning Details */}
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-b border-orange-200 dark:border-orange-800">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  التفاصيل التعليمية
                </CardTitle>
                <CardDescription>
                  نواتج التعلم والمواضيع المطروحة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="learning_outcomes">نواتج التعلم</Label>
                  <Textarea
                    id="learning_outcomes"
                    value={formData.learning_outcomes}
                    onChange={(e) => handleChange('learning_outcomes', e.target.value)}
                    placeholder="ماذا سيتعلم الطلاب من هذه الدورة؟"
                    rows={4}
                    className="border-orange-200 focus:border-orange-500 dark:border-orange-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topics">المواضيع</Label>
                  <Textarea
                    id="topics"
                    value={formData.topics}
                    onChange={(e) => handleChange('topics', e.target.value)}
                    placeholder="المواضيع التي ستغطيها الدورة"
                    rows={4}
                    className="border-orange-200 focus:border-orange-500 dark:border-orange-800"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-b border-orange-200 dark:border-orange-800">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  الجدول الزمني
                </CardTitle>
                <CardDescription>
                  تواريخ بداية ونهاية الدورة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">تاريخ البداية</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleChange('start_date', e.target.value)}
                      className="border-orange-200 focus:border-orange-500 dark:border-orange-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">تاريخ النهاية</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleChange('end_date', e.target.value)}
                      className="border-orange-200 focus:border-orange-500 dark:border-orange-800"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Notes */}
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-b border-orange-200 dark:border-orange-800">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  ملاحظات المعلم
                </CardTitle>
                <CardDescription>
                  أي ملاحظات إضافية تريد إضافتها لطلب التعديل
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="teacher_notes">الملاحظات</Label>
                  <Textarea
                    id="teacher_notes"
                    value={formData.teacher_notes}
                    onChange={(e) => handleChange('teacher_notes', e.target.value)}
                    placeholder="أي ملاحظات أو توضيحات حول التعديلات المطلوبة..."
                    rows={4}
                    className="border-orange-200 focus:border-orange-500 dark:border-orange-800"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={submitting}
                className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    إرسال طلب التعديل
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/teacher/courses/${courseId}`)}
                disabled={submitting}
                className="border-orange-200 hover:bg-orange-50"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

