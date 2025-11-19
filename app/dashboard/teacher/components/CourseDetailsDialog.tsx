'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FileText,
  Play,
  MessageSquare,
  RefreshCw
} from 'lucide-react'

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
  
  // Legacy fields for backward compatibility
  instructor?: number
  instructor_name?: string
  level?: "beginner" | "intermediate" | "advanced"
  learning_path?: "individual" | "group_continuous" | "training" | "live_education"
  duration_weeks?: number
  start_date?: string
  session_duration?: number
  enrollment_count?: number | string
  lessons_count?: number
  next_session?: string
  status?: "draft" | "published" | "archived" | "pending_review"
  is_approved?: boolean
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

interface CourseDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
  loading: boolean
  onAddNote: (course: Course) => void
  formatDate: (date: string) => string
  getCourseTypeInfo: (lp?: string, courseType?: string) => {
    name: string
    color: string
    bg: string
    border: string
  }
}

const formatDate = (d: string) => {
  return new Date(d).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getCourseTypeInfo = (lp?: string, courseType?: string) => {
  // Handle live education course types
  if (lp === "live_education" || courseType) {
    switch (courseType) {
      case "individual":
        return { name: "مباشر فردي", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" }
      case "family":
        return { name: "مباشر عائلي", color: "text-green-600", bg: "bg-green-100", border: "border-green-200" }
      case "group_private":
        return { name: "جماعي خاص", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" }
      case "group_public":
        return { name: "جماعي عام", color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200" }
      default:
        return { name: "مباشر", color: "text-teal-600", bg: "bg-teal-100", border: "border-teal-200" }
    }
  }

  // Handle legacy course types
  switch (lp) {
    case "individual":
      return { name: "تعليم فردي", color: "text-green-600", bg: "bg-green-100", border: "border-green-200" }
    case "group_continuous":
      return { name: "تعليم مستمر", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" }
    case "training":
      return { name: "دورة تدريبية", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" }
    default:
      return { name: "غير محدد", color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200" }
  }
}

export default function CourseDetailsDialog({
  open,
  onOpenChange,
  course,
  loading,
  onAddNote
}: CourseDetailsDialogProps) {
  if (!course) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-right text-2xl font-bold text-[#2d7d32]">
            تفاصيل الدورة
          </DialogTitle>
          <DialogDescription className="text-right">
            عرض تفاصيل الدورة: <span className="font-semibold">{course.title}</span>
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-[#2d7d32] animate-spin mx-auto mb-4" />
              <p className="text-gray-600">جاري تحميل تفاصيل الدورة...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-2">
            {/* Course Header */}
            <div className="bg-gradient-to-r from-[#2d7d32] to-[#1b5e20] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{course.title}</h3>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-white/20 text-white border-white/30">
                      {course.course_type_display || getCourseTypeInfo(course.learning_path, course.course_type).name}
                    </Badge>
                    <Badge className={
                      (course.is_approved === true) || (course.approval_status === 'approved')
                        ? "bg-green-500 text-white" 
                        : course.approval_status === 'rejected'
                          ? "bg-red-500 text-white"
                          : "bg-yellow-500 text-white"
                    }>
                      {course.approval_status_display || 
                       ((course.is_approved === true) || (course.approval_status === 'approved') ? 'مفعلة' 
                        : course.approval_status === 'rejected' ? 'مرفوضة' : 'قيد المراجعة')}
                    </Badge>
                    {course.is_published && (
                      <Badge className="bg-blue-500 text-white">
                        منشورة
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {course.description && (
                <p className="text-green-100 leading-relaxed">{course.description}</p>
              )}
            </div>

            {/* Course Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="border-2 border-blue-100">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">نوع الدورة:</span>
                    <span className="font-semibold">{course.course_type_display}</span>
                  </div>
                  {course.subjects && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">المواضيع:</span>
                      <span className="font-semibold">{course.subjects}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">حالة النشر:</span>
                    <span className={`font-semibold ${course.is_published ? 'text-green-600' : 'text-gray-600'}`}>
                      {course.is_published ? 'منشورة' : 'غير منشورة'}
                    </span>
                  </div>
                  {course.lessons && course.lessons.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">عدد الدروس:</span>
                      <span className="font-semibold">{course.lessons.length} درس</span>
                    </div>
                  )}
                  {course.lessons && course.lessons.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">إجمالي مدة الدروس:</span>
                      <span className="font-semibold">
                        {course.lessons.reduce((total, lesson) => total + lesson.duration_minutes, 0)} دقيقة
                      </span>
                    </div>
                  )}
                  
                  {/* Legacy fields for backward compatibility */}
                  {course.level && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">المستوى:</span>
                      <span className="font-semibold">
                        {course.level === "beginner" ? "مبتدئ" : 
                         course.level === "intermediate" ? "متوسط" : "متقدم"}
                      </span>
                    </div>
                  )}
                  {course.duration_weeks && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">مدة الدورة:</span>
                      <span className="font-semibold">{course.duration_weeks} أسبوع</span>
                    </div>
                  )}
                  {course.session_duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">مدة الجلسة:</span>
                      <span className="font-semibold">{course.session_duration} دقيقة</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enrollment Information */}
              <Card className="border-2 border-green-100">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    معلومات التسجيل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحد الأقصى للطلاب:</span>
                    <span className="font-semibold">{course.max_students} طالب</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المسجلين حالياً:</span>
                    <span className="font-semibold">
                      {course.enrolled_count} طالب
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المقاعد المتبقية:</span>
                    <span className="font-semibold text-blue-600">
                      {course.available_spots} مقعد
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>نسبة الامتلاء</span>
                      <span>{Math.round((Number(course.enrolled_count) / Number(course.max_students)) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(Number(course.enrolled_count) / Number(course.max_students)) * 100} 
                      className="h-3"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dates Information */}
              <Card className="border-2 border-purple-100">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-purple-800 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    التواريخ والمواعيد
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {course.start_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ البداية:</span>
                      <span className="font-semibold">{formatDate(course.start_date)}</span>
                    </div>
                  )}
                  {course.next_session && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">الجلسة القادمة:</span>
                      <span className="font-semibold">{formatDate(course.next_session)}</span>
                    </div>
                  )}
                  {course.created_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الإنشاء:</span>
                      <span className="font-semibold">{formatDate(course.created_at)}</span>
                    </div>
                  )}
                  {course.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">آخر تحديث:</span>
                      <span className="font-semibold">{formatDate(course.updated_at)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="border-2 border-orange-100">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    معلومات إضافية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {course.instructor_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">المدرس:</span>
                      <span className="font-semibold">{course.instructor_name}</span>
                    </div>
                  )}
                  {course.teacher_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">المدرس:</span>
                      <span className="font-semibold">{course.teacher_name}</span>
                    </div>
                  )}
                  {course.teacher_email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">بريد المدرس:</span>
                      <span className="font-semibold">{course.teacher_email}</span>
                    </div>
                  )}
                  {course.approved_by_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">معتمد من:</span>
                      <span className="font-semibold text-green-600">{course.approved_by_name}</span>
                    </div>
                  )}
                  {course.approved_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الموافقة:</span>
                      <span className="font-semibold">{formatDate(course.approved_at)}</span>
                    </div>
                  )}
                  {course.rejection_reason && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">سبب الرفض:</span>
                      <span className="font-semibold text-red-600">{course.rejection_reason}</span>
                    </div>
                  )}
                  {course.trial_session_url && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">رابط الجلسة التجريبية:</span>
                      <a 
                        href={course.trial_session_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        فتح الرابط
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">معرف الدورة:</span>
                    <span className="font-semibold">#{course.id}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Outcomes */}
            {course.learning_outcomes && (
              <Card className="border-2 border-teal-100">
                <CardHeader className="bg-teal-50">
                  <CardTitle className="text-teal-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    مخرجات التعلم
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-700 leading-relaxed">{course.learning_outcomes}</p>
                </CardContent>
              </Card>
            )}

            {/* Course Lessons */}
            {course.lessons && course.lessons.length > 0 && (
              <Card className="border-2 border-indigo-100">
                <CardHeader className="bg-indigo-50">
                  <CardTitle className="text-indigo-800 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    دروس الدورة ({course.lessons.length} درس)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {course.lessons
                      .sort((a, b) => a.order - b.order)
                      .map((lesson, index) => (
                      <div key={lesson.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {lesson.order || index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{lesson.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration_minutes} دقيقة
                                </span>
                                <span className="text-xs text-gray-500">
                                  تم الإنشاء: {formatDate(lesson.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {lesson.description && (
                          <p className="text-gray-600 text-sm leading-relaxed mt-2 pr-11">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-indigo-700 font-medium">إجمالي مدة الدروس:</span>
                      <span className="text-indigo-800 font-bold">
                        {course.lessons.reduce((total, lesson) => total + lesson.duration_minutes, 0)} دقيقة
                        ({Math.round(course.lessons.reduce((total, lesson) => total + lesson.duration_minutes, 0) / 60)} ساعة)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                إغلاق
              </Button>
              {((course.is_approved === true) || (course.approval_status === 'approved')) && (
                <>
                  {/* ابدأ حصة جديدة - يوجه للصفحة /class-session/create */}
                  <Link href={`/class-session/create/${course.id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full text-green-600 border-green-300 hover:bg-green-50 font-semibold">
                      <Play className="w-4 h-4 ml-2" />
                       حصة جديدة ابدأ
                    </Button>
                  </Link>
                  <Button 
                    variant="outline"
                    className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                    onClick={() => {
                      onOpenChange(false)
                      onAddNote(course)
                    }}
                  >
                    <MessageSquare className="w-4 h-4 ml-2" />
                    ترك ملحوظة
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
