'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { liveEducationApi } from '@/lib/api/live-education'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Save,
  Loader2
} from 'lucide-react'

interface LiveCourse {
  id: string
  title: string
  description: string
  thumbnail?: string
  cover_image?: string
  learning_outcomes?: string
  topics?: string
  start_date?: string
  end_date?: string
  accepting_applications: boolean
  is_hidden: boolean
}

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.['id'] as string

  const [course, setCourse] = useState<LiveCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    learning_outcomes: '',
    topics: '',
    start_date: '',
    end_date: '',
    accepting_applications: false,
    is_hidden: false
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
      
      // Populate form
      const courseData = data as any
      setFormData({
        title: courseData.title || '',
        description: courseData.description || '',
        learning_outcomes: courseData.learning_outcomes || '',
        topics: courseData.topics || '',
        start_date: courseData.start_date || '',
        end_date: courseData.end_date || '',
        accepting_applications: courseData.accepting_applications || false,
        is_hidden: courseData.is_hidden || false
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
      setSaving(true)
      
      await liveEducationApi.courses.partialUpdate(courseId, formData)
      
      toast.success('تم تحديث الدورة بنجاح')
      router.push(`/dashboard/teacher/courses/${courseId}`)
    } catch (error: any) {
      console.error('Error updating course:', error)
      toast.error(error.message || 'فشل تحديث الدورة')
    } finally {
      setSaving(false)
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950" dir="rtl">
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
              className="w-10 h-10 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                تعديل الدورة
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                تحديث معلومات وإعدادات الدورة
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
                <CardDescription>
                  عنوان ووصف الدورة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الدورة *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="مثال: دورة تعليم القرآن الكريم"
                    required
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
                  />
                </div>
              </CardContent>
            </Card>

            {/* Learning Details */}
            <Card>
              <CardHeader>
                <CardTitle>التفاصيل التعليمية</CardTitle>
                <CardDescription>
                  نواتج التعلم والمواضيع المطروحة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="learning_outcomes">نواتج التعلم</Label>
                  <Textarea
                    id="learning_outcomes"
                    value={formData.learning_outcomes}
                    onChange={(e) => handleChange('learning_outcomes', e.target.value)}
                    placeholder="ماذا سيتعلم الطلاب من هذه الدورة؟"
                    rows={4}
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
                  />
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>الجدول الزمني</CardTitle>
                <CardDescription>
                  تواريخ بداية ونهاية الدورة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">تاريخ البداية</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleChange('start_date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">تاريخ النهاية</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleChange('end_date', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات</CardTitle>
                <CardDescription>
                  إعدادات الظهور والتسجيل
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="accepting_applications">قبول الطلبات</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      السماح للطلاب بالتقديم على الدورة
                    </p>
                  </div>
                  <Switch
                    id="accepting_applications"
                    checked={formData.accepting_applications}
                    onCheckedChange={(checked) => handleChange('accepting_applications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_hidden">إخفاء الدورة</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      إخفاء الدورة من القائمة العامة
                    </p>
                  </div>
                  <Switch
                    id="is_hidden"
                    checked={formData.is_hidden}
                    onCheckedChange={(checked) => handleChange('is_hidden', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/teacher/courses/${courseId}`)}
                disabled={saving}
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
