'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { quizzesApi, type CreateQuizInput } from '@/lib/api/quizzes'
import { 
  ArrowRight,
  RefreshCw,
  BookOpen,
  Save,
  X
} from 'lucide-react'

export default function EditQuizPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params?.batchId as string
  const quizId = params?.quizId as string

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [formData, setFormData] = useState<CreateQuizInput>({
    title: '',
    description: '',
    quiz_type: 'live_batch',
    live_batch: batchId,
    max_questions: 10,
    allow_retake: true,
    passing_score: 100,
    time_limit: 3600,
  })

  useEffect(() => {
    if (quizId) {
      loadQuiz()
    }
  }, [quizId])

  const loadQuiz = async () => {
    try {
      setLoading(true)
      const quiz = await quizzesApi.get(quizId)
      // Backend returns time_limit in minutes, convert to seconds for frontend
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        quiz_type: quiz.quiz_type,
        live_batch: batchId,
        max_questions: quiz.max_questions || 10,
        allow_retake: quiz.allow_retake,
        passing_score: quiz.passing_score,
        time_limit: quiz.time_limit ? quiz.time_limit * 60 : 60 * 60, // Convert minutes to seconds
      })
    } catch (error: any) {
      console.error('❌ Error loading quiz:', error)
      toast.error('حدث خطأ في تحميل بيانات الاختبار')
      router.push(`/interface-batch/${batchId}?section=quizzes`)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeLimit = (seconds: number): string => {
    // Convert seconds to minutes for display
    const minutes = Math.ceil(seconds / 60)
    if (!minutes || minutes === 0) return 'لا يوجد حد زمني'
    if (minutes < 60) return `${minutes} دقيقة`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) return `${hours} ساعة`
    return `${hours} ساعة و ${remainingMinutes} دقيقة`
  }

  const handleUpdateQuiz = async () => {
    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان الاختبار')
      return
    }

    // Validate max_questions
    if (formData.max_questions && formData.max_questions > 10) {
      toast.error('الحد الأقصى للأسئلة هو 10')
      return
    }

    try {
      setUpdating(true)
      // Convert time_limit from seconds to minutes for backend
      // Ensure max_questions doesn't exceed 10
      const payload = {
        ...formData,
        live_batch: batchId,
        max_questions: formData.max_questions ? Math.min(formData.max_questions, 10) : 10,
        time_limit: formData.time_limit ? Math.ceil(formData.time_limit / 60) : undefined, // Convert seconds to minutes
        recorded_lesson: undefined, // Ensure recorded_lesson is not sent for live_batch quizzes
      }
      console.log('📤 Updating quiz:', quizId, payload)
      await quizzesApi.update(quizId, payload)
      toast.success('تم تحديث الاختبار بنجاح')
      // Navigate back to quizzes list
      router.push(`/interface-batch/${batchId}?section=quizzes`)
    } catch (error: any) {
      console.error('❌ Error updating quiz:', error)
      console.error('❌ Error details:', error?.data)
      
      // Extract error message from response
      let errorMessage = 'حدث خطأ في تحديث الاختبار'
      if (error?.data) {
        if (typeof error.data === 'string') {
          errorMessage = error.data
        } else if (error.data.detail) {
          errorMessage = error.data.detail
        } else if (error.data.error) {
          errorMessage = error.data.error
        } else if (typeof error.data === 'object') {
          // Handle field-specific errors with Arabic translations
          const fieldTranslations: Record<string, string> = {
            max_questions: 'الحد الأقصى للأسئلة',
            title: 'العنوان',
            description: 'الوصف',
            passing_score: 'نقاط النجاح',
            time_limit: 'الحد الزمني',
            live_batch: 'المجموعة',
          }
          
          const fieldErrors = Object.entries(error.data)
            .map(([key, value]) => {
              const fieldName = fieldTranslations[key] || key
              if (Array.isArray(value)) {
                // Translate common error messages
                const translatedMessages = value.map((msg: string) => {
                  if (msg.includes('less than or equal to 10')) {
                    return 'يجب أن يكون أقل من أو يساوي 10'
                  }
                  if (msg.includes('required')) {
                    return 'هذا الحقل مطلوب'
                  }
                  return msg
                })
                return `${fieldName}: ${translatedMessages.join(', ')}`
              }
              return `${fieldName}: ${value}`
            })
            .join('\n')
          if (fieldErrors) {
            errorMessage = fieldErrors
          }
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = () => {
    router.push(`/interface-batch/${batchId}?section=quizzes`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">جاري تحميل بيانات الاختبار...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="w-4 h-4 ml-2 rotate-180" />
              رجوع
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-50 flex items-center gap-2">
            <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
            تعديل الاختبار
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            قم بتعديل بيانات الاختبار
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>معلومات الاختبار</CardTitle>
            <CardDescription>
              أدخل تفاصيل الاختبار الأساسية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-base font-semibold">
                عنوان الاختبار *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="أدخل عنوان الاختبار"
                className="mt-2 h-12 text-base"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold">
                الوصف
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="أدخل وصفًا للاختبار (اختياري)"
                rows={4}
                className="mt-2 text-base"
              />
            </div>

            {/* Grid: Max Questions and Passing Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="max_questions" className="text-base font-semibold">
                  الحد الأقصى للأسئلة
                </Label>
                <Input
                  id="max_questions"
                  type="number"
                  value={formData.max_questions}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 10
                    const maxValue = Math.min(value, 10) // Backend limit is 10
                    setFormData({ ...formData, max_questions: maxValue })
                  }}
                  min={1}
                  max={10}
                  className="mt-2 h-12 text-base"
                />
                <p className="text-sm text-gray-500 mt-1">
                  عدد الأسئلة التي سيتم عرضها في الاختبار (الحد الأقصى: 10)
                </p>
              </div>

              <div>
                <Label htmlFor="passing_score" className="text-base font-semibold">
                  نقاط النجاح (%)
                </Label>
                <Input
                  id="passing_score"
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || 100 })}
                  min={0}
                  max={100}
                  className="mt-2 h-12 text-base"
                />
                <p className="text-sm text-gray-500 mt-1">
                  النسبة المئوية المطلوبة للنجاح في الاختبار
                </p>
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <Label htmlFor="time_limit" className="text-base font-semibold">
                الحد الزمني (بالدقائق)
              </Label>
              <Input
                id="time_limit"
                type="number"
                value={formData.time_limit ? Math.ceil(formData.time_limit / 60) : ''}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value) || 0
                  setFormData({ ...formData, time_limit: minutes * 60 }) // Convert minutes to seconds for display
                }}
                min={1}
                placeholder="أدخل الوقت بالدقائق"
                className="mt-2 h-12 text-base"
              />
              <p className="text-sm text-gray-500 mt-1">
                الوقت المتاح للاختبار: <span className="font-semibold text-gray-700 dark:text-slate-300">
                  {formatTimeLimit(formData.time_limit || 60 * 60)}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                يمكنك ترك الحقل فارغاً لإلغاء الحد الزمني
              </p>
            </div>

            {/* Allow Retake */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <input
                type="checkbox"
                id="allow_retake"
                checked={formData.allow_retake}
                onChange={(e) => setFormData({ ...formData, allow_retake: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="allow_retake" className="text-base font-semibold cursor-pointer flex-1">
                السماح بإعادة المحاولة
              </Label>
              <p className="text-sm text-gray-500">
                إذا تم تفعيله، يمكن للطلاب إعادة محاولة الاختبار
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
              <Button
                variant="outline"
                size="lg"
                onClick={handleCancel}
                disabled={updating}
                className="h-12 px-6"
              >
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
              <Button
                onClick={handleUpdateQuiz}
                disabled={updating || !formData.title.trim()}
                size="lg"
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {updating ? (
                  <>
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

