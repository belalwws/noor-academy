'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { CourseEditRequestsAPI } from '@/lib/api/course-edit-requests'
import { CreateCourseEditRequestData } from '@/lib/types/course-edit-requests'
import { BookOpen, AlertCircle, ArrowRight, Save, X } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'

interface Course {
  id: string
  title: string
  description: string
  learning_outcomes?: string
  course_type: "individual" | "family" | "group_private" | "group_public"
  course_type_display: string
  subjects?: string
  trial_session_url?: string
  max_students: string
  teacher: number
  teacher_name: string
  teacher_email: string
  approval_status: "pending" | "approved" | "rejected" | "under_review"
  approval_status_display: string
  approved_by?: number
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  is_published: boolean
  lessons: CourseLesson[]
  enrolled_count: string
  available_spots: string
  created_at: string
  updated_at: string
  // Additional fields from API
  duration_weeks?: number
  session_duration?: number
  price?: number
}

interface CourseLesson {
  id: number
  title: string
  description: string
  order: number
  duration_minutes: number
  created_at: string
  updated_at: string
}

interface CourseEditPageProps {
  params: {
    id: string
  }
}

export default function CourseEditPage({ params }: CourseEditPageProps) {
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState<CreateCourseEditRequestData>({
    course: '',
    title: '',
    description: '',
    learning_outcomes: '',
    subjects: '',
    trial_session_url: '',
    edit_reason: '',
    course_type: 'individual',
    duration_weeks: 0,
    session_duration: 0,
    lessons_data: ''
  })

  const [lessons, setLessons] = useState<Array<{title: string, description: string}>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load course data
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true)
        // Get auth token
        const token = localStorage.getItem('token')
        if (!token) {
          toast.error('يرجى تسجيل الدخول أولاً')
          router.push('/login')
          return
        }
        
        // Always try to refresh token to ensure it's valid
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/token/refresh/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                refresh: refreshToken
              })
            })
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json()
              localStorage.setItem('token', refreshData.access)
            } else {
              toast.error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى')
              localStorage.removeItem('token')
              localStorage.removeItem('refreshToken')
              router.push('/login')
              return
            }
          } catch (refreshError) {
            toast.error('خطأ في تجديد الجلسة. يرجى تسجيل الدخول مرة أخرى')
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            router.push('/login')
            return
          }
        } else {
          toast.error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى')
          localStorage.removeItem('token')
          router.push('/login')
          return
        }

        // Use the direct API endpoint for specific course
        let courseData = null
        try {
          // Get the current token
          const currentToken = localStorage.getItem('token')
          
          // Use the direct API endpoint for specific course
          const courseUrl = `${process.env['NEXT_PUBLIC_API_URL']}/live-education/courses/${params.id}/`
          
          const courseResponse = await fetch(courseUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${currentToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include',
          })
          
          if (courseResponse.ok) {
            courseData = await courseResponse.json()
          } else if (courseResponse.status === 401) {
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
              try {
                const refreshResponse = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/token/refresh/`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ refresh: refreshToken })
                })
                
                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json()
                  localStorage.setItem('token', refreshData.access)
                  
                  // Retry the course request with new token
                  const retryResponse = await fetch(courseUrl, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${refreshData.access}`,
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                    },
                    credentials: 'include',
                  })
                  
                  if (retryResponse.ok) {
                    courseData = await retryResponse.json()
                  }
                }
              } catch (retryError) {
                // Ignore retry errors
              }
            }
          } else if (courseResponse.status === 404) {
            toast.error('الدورة غير موجودة')
          } else if (courseResponse.status === 403) {
            toast.error('ليس لديك صلاحية للوصول إلى هذه الدورة')
          } else {
            toast.error(`خطأ في الخادم: ${courseResponse.status}`)
          }
        } catch (error) {
          toast.error('خطأ في الاتصال بالخادم')
          courseData = null
        }

        if (!courseData) {
          setError(`الدورة ${params.id} غير موجودة في قائمة الدورات الخاصة بك`)
          setLoading(false)
          return
        }

        // Use the course data directly since it matches our interface
        const transformedCourse: Course = courseData
        
        // Log course structure to check supervisor info
        console.log('🔍 Full course data loaded:', courseData);
        console.log('🔍 Course has teacher info:', {
          teacher: courseData.teacher,
          teacher_name: courseData.teacher_name,
          teacher_email: courseData.teacher_email,
          approval_status: courseData.approval_status,
          approved_by: courseData.approved_by,
          approved_by_name: courseData.approved_by_name
        });

        // Load lessons if available
        if (courseData.lessons && Array.isArray(courseData.lessons)) {
          const loadedLessons = courseData.lessons.map((lesson: CourseLesson) => ({
            title: lesson.title || '',
            description: lesson.description || ''
          }))
          setLessons(loadedLessons)
        }
        
        setCourse(transformedCourse)
        
        const newFormData = {
          course: transformedCourse.id,
          title: transformedCourse.title || '',
          description: transformedCourse.description || '',
          learning_outcomes: transformedCourse.learning_outcomes || '',
          subjects: transformedCourse.subjects || '',
          trial_session_url: transformedCourse.trial_session_url || '',
          edit_reason: '',
          course_type: transformedCourse.course_type || 'individual',
          duration_weeks: 12, // Default value since API doesn't provide this
          session_duration: 60, // Default value since API doesn't provide this
          lessons_data: '{}' // Default empty lessons data
        }
        setFormData(newFormData)
        
        // Show success message
        toast.success('تم تحميل بيانات الدورة بنجاح')
        
      } catch (error) {
        setError('حدث خطأ في تحميل بيانات الدورة. يرجى المحاولة مرة أخرى.')
        toast.error('حدث خطأ في تحميل بيانات الدورة')
      } finally {
        setLoading(false)
      }
    }

    loadCourseData()
  }, [params.id, router])

  const handleInputChange = (field: keyof CreateCourseEditRequestData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLessonChange = (index: number, field: 'title' | 'description', value: string) => {
    setLessons(prev => prev.map((lesson, i) => 
      i === index ? { ...lesson, [field]: value } : lesson
    ))
  }

  const addLesson = () => {
    setLessons(prev => [...prev, { title: '', description: '' }])
  }

  const removeLesson = (index: number) => {
    setLessons(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = (): boolean => {
    if (!formData.edit_reason.trim()) {
      setError('يرجى إدخال سبب التعديل')
      return false
    }
    if (!formData.title.trim()) {
      setError('يرجى إدخال عنوان الدورة')
      return false
    }
    if (!formData.description.trim()) {
      setError('يرجى إدخال وصف الدورة')
      return false
    }
    if (!formData.subjects.trim()) {
      setError('يرجى إدخال مواضيع الدورة')
      return false
    }
    if (formData.duration_weeks <= 0) {
      setError('يرجى إدخال مدة صحيحة للدورة')
      return false
    }
    if (formData.session_duration <= 0) {
      setError('يرجى إدخال مدة صحيحة للجلسة')
      return false
    }
    if (formData.session_duration < 30) {
      setError('مدة الجلسة يجب أن تكون 30 دقيقة على الأقل')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const requestData: CreateCourseEditRequestData = {
        course: course?.id || '',
        title: formData.title.trim(),
        description: formData.description.trim(),
        learning_outcomes: formData.learning_outcomes.trim(),
        subjects: formData.subjects.trim(),
        trial_session_url: formData.trial_session_url.trim(),
        edit_reason: formData.edit_reason.trim(),
        course_type: formData.course_type,
        duration_weeks: Number(formData.duration_weeks),
        session_duration: Math.max(Number(formData.session_duration) || 60, 30),
        lessons_data: '{}'
      }

      console.log('🔍 Submitting course edit request:', requestData)
      console.log('🔍 Request data structure:', {
        has_course: !!requestData.course,
        has_title: !!requestData.title,
        has_description: !!requestData.description,
        has_edit_reason: !!requestData.edit_reason,
        course_id: requestData.course,
        edit_reason: requestData.edit_reason,
        includes_supervisor_email: 'supervisor_email' in requestData
      })
      
      // Check if we need to add supervisor email
      console.log('🔍 Questions about the request:');
      console.log('🔍 - Does course have supervisor info:', course?.teacher_name, course?.teacher_email);
      console.log('🔍 - Should we include general_supervisor_email in request?');
      console.log('🔍 - Current request includes ONLY course edit data (no supervisor info)')

      try {
        await CourseEditRequestsAPI.createCourseEditRequest(requestData)
        toast.success('تم إرسال طلب التعديل بنجاح! سيتم مراجعته قريباً')
      } catch (apiError: any) {
        // If API fails, save to localStorage as backup
        console.log('🔍 API failed, saving to localStorage backup...')
        
        const backupData = {
          ...requestData,
          id: Date.now(),
          status: 'pending',
          status_display: 'معلق',
          created_at: new Date().toISOString(),
          teacher_name: 'المعلم الحالي',
          teacher_email: 'teacher@example.com',
          supervisor_notes: '',
          reviewed_by_name: '',
          updated_at: new Date().toISOString(),
          reviewed_at: '',
          original_course_title: course?.title || 'الدورة الأصلية',
          original_course_id: course?.id || ''
        }
        
        // Save to localStorage
        const existingRequests = JSON.parse(localStorage.getItem('course_edit_requests_backup') || '[]')
        existingRequests.push(backupData)
        localStorage.setItem('course_edit_requests_backup', JSON.stringify(existingRequests))
        
        toast.success('تم حفظ طلب التعديل محلياً! سيتم إرساله للخادم عند توفر الاتصال')
      }
      
      // Navigate back to teacher dashboard
      router.push('/dashboard/teacher')
    } catch (error: any) {
      toast.error(`حدث خطأ في إرسال طلب التعديل: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/teacher')
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/20 flex items-center justify-center">
          <div className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">جاري تحميل بيانات الدورة</h2>
            <p className="text-gray-600 text-lg">يرجى الانتظار...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!course && !loading) {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-pink-50/20 flex items-center justify-center">
          <div className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">لم يتم العثور على الدورة</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              الدورة المطلوبة غير موجودة أو لا يمكن الوصول إليها. 
              قد تكون الدورة قد تم حذفها أو لا تملك صلاحية للوصول إليها.
            </p>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/dashboard/teacher')} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                العودة إلى لوحة التحكم
              </Button>
              <Button 
                onClick={() => router.back()} 
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50 py-3 rounded-xl"
              >
                العودة للصفحة السابقة
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/20" dir="rtl">
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-teal-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2d7d32] via-[#4caf50] to-[#1b5e20] rounded-3xl p-8 text-white shadow-2xl border border-blue-200 relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-300/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">تعديل الدورة</h1>
                    <p className="text-blue-100 text-lg">
                      تعديل الدورة: <span className="font-semibold text-white">{course.title}</span>
                    </p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                        {course.course_type_display}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        course.approval_status === 'approved' 
                          ? 'bg-blue-500/30 text-white' 
                          : course.approval_status === 'rejected'
                          ? 'bg-red-500/30 text-white'
                          : 'bg-yellow-500/30 text-white'
                      }`}>
                        {course.approval_status_display}
                      </span>
                      <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                        {course.enrolled_count} طالب
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                >
                  <X className="w-5 h-5 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert className="border-red-300 bg-gradient-to-r from-red-50 to-pink-50 shadow-2xl rounded-2xl border-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-800 mb-1">خطأ في النموذج</h4>
                    <AlertDescription className="text-red-700 font-medium">
                      {error}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Edit Reason */}
              <Card className="shadow-xl border-orange-200 bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden border-2">
                <CardHeader className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50">
                  <CardTitle className="flex items-center gap-3 text-orange-800 text-xl font-bold">
                    <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl shadow-md">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    📝 سبب التعديل
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    اشرح سبب طلب تعديل الدورة
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    placeholder="اشرح سبب طلب تعديل الدورة..."
                    value={formData.edit_reason}
                    onChange={(e) => handleInputChange('edit_reason', e.target.value)}
                    className="min-h-[120px] text-right text-lg p-4 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 shadow-md"
                    required
                  />
                </CardContent>
              </Card>

              {/* Course Data */}
              <Card className="shadow-xl border-blue-200 bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden border-2">
                <CardHeader className="bg-gradient-to-r from-blue-50 via-blue-50 to-blue-50">
                  <CardTitle className="flex items-center gap-3 text-blue-800 text-xl font-bold">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-100 rounded-xl shadow-md">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    ✏️ بيانات الدورة للتعديل
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    عدّل البيانات المطلوبة  
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Title */}
                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      📝 عنوان الدورة *
                    </Label>
                    <Input
                      value={formData.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="عنوان الدورة"
                      required
                      className="text-lg p-4 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 shadow-md"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      📖 وصف الدورة *
                    </Label>
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="وصف الدورة"
                      rows={5}
                      required
                      className="text-lg p-4 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 shadow-md resize-none"
                    />
                  </div>

                  {/* Learning Outcomes */}
                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      🎯 نواتج التعلم
                    </Label>
                    <Textarea
                      value={formData.learning_outcomes}
                      onChange={(e) => handleInputChange('learning_outcomes', e.target.value)}
                      placeholder="نواتج التعلم"
                      rows={4}
                      className="text-lg p-4 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 shadow-md resize-none"
                    />
                  </div>

                  {/* Subjects */}
                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      📚 مواضيع الدورة *
                    </Label>
                    <Input
                      value={formData.subjects}
                      onChange={(e) => handleInputChange('subjects', e.target.value)}
                      placeholder="مواضيع الدورة"
                      required
                      className="text-lg p-4 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 shadow-md"
                    />
                  </div>

                  {/* Trial Session URL */}
                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      🎥 رابط الحصة التجريبية
                    </Label>
                    <Input
                      type="url"
                      value={formData.trial_session_url}
                      onChange={(e) => handleInputChange('trial_session_url', e.target.value)}
                      placeholder="رابط الحصة التجريبية"
                      className="text-lg p-4 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 shadow-md"
                    />
                  </div>

                  {/* Course Type */}
                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      🎯 نوع الدورة
                    </Label>
                    <Select value={formData.course_type} onValueChange={(value) => handleInputChange('course_type', value)}>
                      <SelectTrigger className="text-right text-lg p-4 rounded-xl border-2 border-blue-200 focus:border-blue-400 shadow-md">
                        <SelectValue placeholder="اختر نوع الدورة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">فردي</SelectItem>
                        <SelectItem value="family">عائلي</SelectItem>
                        <SelectItem value="group_private">جماعي خاص</SelectItem>
                        <SelectItem value="group_public">جماعي عام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration Weeks */}
                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      📅 مدة الدورة (بالأسابيع) *
                    </Label>
                    <Input
                      type="number"
                      placeholder="عدد الأسابيع"
                      value={formData.duration_weeks}
                      onChange={(e) => handleInputChange('duration_weeks', parseInt(e.target.value) || 0)}
                      className="text-lg p-4 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 shadow-md"
                      min="1"
                      required
                    />
                  </div>

                  {/* Session Duration */}
                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      ⏰ مدة الجلسة (بالدقائق) *
                    </Label>
                    <Input
                      type="number"
                      placeholder="مدة الجلسة بالدقائق"
                      value={formData.session_duration}
                      onChange={(e) => handleInputChange('session_duration', parseInt(e.target.value) || 0)}
                      className="text-lg p-4 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 shadow-md"
                      min="30"
                      required
                    />
                  </div>

                  {/* Lessons */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        📚 الدروس
                      </Label>
                      <Button
                        type="button"
                        onClick={addLesson}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        + إضافة درس
                      </Button>
                    </div>
                    
                    {lessons.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                        <p>لم يتم إضافة أي دروس بعد</p>
                        <p className="text-sm">اضغط على "إضافة درس" لبدء إضافة الدروس</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {lessons.map((lesson, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-800">الدرس {index + 1}</h4>
                              <Button
                                type="button"
                                onClick={() => removeLesson(index)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                              >
                                حذف
                              </Button>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">عنوان الدرس</Label>
                                <Input
                                  value={lesson.title}
                                  onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                                  placeholder="عنوان الدرس"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">وصف الدرس</Label>
                                <Textarea
                                  value={lesson.description}
                                  onChange={(e) => handleLessonChange(index, 'description', e.target.value)}
                                  placeholder="وصف الدرس"
                                  rows={2}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-200">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleCancel} 
                  disabled={isSubmitting}
                  className="px-8 py-3 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 shadow-md"
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.edit_reason.trim() || !formData.title.trim() || !formData.description.trim()}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 animate-spin rounded-full border-b-2 border-white ml-2"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 ml-2" />
                      إرسال طلب التعديل
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
