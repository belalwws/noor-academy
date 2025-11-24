
'use client'

import type { LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Play,
  Calendar,
  Edit,
  Users,
  Layers,
  FlaskConical
} from 'lucide-react'
import { useLiveSessions } from '@/lib/store/hooks/useLiveSessions'

interface Course {
  id: string
  title: string
  description: string
  learning_outcomes?: string
  course_type?: 'individual' | 'family' | 'group_private' | 'group_public' | 'recorded'
  course_type_display?: string
  subjects?: string
  topics?: string
  trial_session_url?: string
  max_students?: string
  teacher: number
  teacher_name: string
  teacher_email: string
  approval_status: 'pending' | 'approved' | 'rejected' | 'under_review'
  approval_status_display: string
  approved_by?: number
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  is_published?: boolean
  lessons?: any[]
  enrolled_count?: string
  available_spots?: string
  created_at: string
  updated_at?: string

  // Recorded course specific fields
  price?: string
  final_price?: string
  source?: 'live_education' | 'recorded'
  thumbnail?: string
  cover_image?: string
  
  // API fields for stats
  total_students?: number | string
  units_count?: number | string
  batches_count?: number | string

  // Legacy fields for backward compatibility
  instructor?: number
  instructor_name?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
  learning_path?: 'individual' | 'group_continuous' | 'training' | 'live_education' | 'recorded'
  duration_weeks?: number
  start_date?: string
  end_date?: string
  session_duration?: number
  enrollment_count?: number | string
  lessons_count?: number
  total_lessons?: string
  next_session?: string
  status?: 'draft' | 'published' | 'archived' | 'pending_review'
  is_approved?: boolean
  total_video_duration?: number // Total video duration in seconds for recorded courses
}

interface CourseCardProps {
  course: Course
  onViewDetails: (course: Course) => void
  onAddNote: (course: Course) => void
  onAddAnnouncement?: (course: Course) => void
  onDeleteCourse?: (course: Course) => void
  onEditRequest?: (course: Course) => void
  onCreateBatch?: (course: Course) => void
}

const getCourseTypeInfo = (lp?: string, courseType?: string, source?: string) => {
  // Handle recorded courses
  if (lp === 'recorded' || courseType === 'recorded' || source === 'recorded') {
    return {
      name: 'دورة مسجلة',
      color: 'text-indigo-700 dark:text-indigo-300',
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      border: 'border-indigo-300 dark:border-indigo-700'
    }
  }

  // Handle live education course types
  if (lp === 'live_education' || courseType || source === 'live_education') {
    switch (courseType) {
      case 'individual':
        return {
          name: 'حصص فردية',
          color: 'text-blue-700 dark:text-blue-300',
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          border: 'border-blue-300 dark:border-blue-700'
        }
      case 'family':
        return {
          name: 'برنامج عائلي',
          color: 'text-blue-700 dark:text-blue-300',
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          border: 'border-blue-300 dark:border-blue-700'
        }
      case 'group_private':
        return {
          name: 'مجموعة خاصة',
          color: 'text-purple-700 dark:text-purple-300',
          bg: 'bg-purple-100 dark:bg-purple-900/30',
          border: 'border-purple-300 dark:border-purple-700'
        }
      case 'group_public':
        return {
          name: 'مجموعة عامة',
          color: 'text-orange-700 dark:text-orange-300',
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          border: 'border-orange-300 dark:border-orange-700'
        }
      default:
        return {
          name: 'تعليم مباشر',
          color: 'text-teal-700 dark:text-teal-300',
          bg: 'bg-teal-100 dark:bg-teal-900/30',
          border: 'border-teal-300 dark:border-teal-700'
        }
    }
  }

  // Handle legacy course types
  switch (lp) {
    case 'individual':
      return {
        name: 'مسار فردي',
        color: 'text-blue-700 dark:text-blue-300',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-300 dark:border-blue-700'
      }
    case 'group_continuous':
      return {
        name: 'مجموعة مستمرة',
        color: 'text-blue-700 dark:text-blue-300',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-300 dark:border-blue-700'
      }
    case 'training':
      return {
        name: 'برنامج تدريبي',
        color: 'text-purple-700 dark:text-purple-300',
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        border: 'border-purple-300 dark:border-purple-700'
      }
    default:
      return {
        name: 'مسار تعليمي',
        color: 'text-gray-700 dark:text-gray-300',
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-300 dark:border-gray-700'
      }
  }
}

const formatNumber = (value?: string | number | null) => {
  if (value === undefined || value === null) return '—'
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '—'
    return new Intl.NumberFormat('ar-SA').format(value)
  }

  const numeric = Number(value)
  if (Number.isNaN(numeric)) return value
  return new Intl.NumberFormat('ar-SA').format(numeric)
}

const formatCurrency = (value?: string | number | null) => {
  if (value === undefined || value === null) return null
  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numeric)) return typeof value === 'string' ? value : null

  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0
  }).format(numeric)
}


export default function CourseCard({ course, onViewDetails }: CourseCardProps) {
  const router = useRouter()
  const typeInfo = getCourseTypeInfo(course.learning_path, course.course_type, course.source)

  // Live session state for this course (for teacher rejoin)
  const { liveSessions } = useLiveSessions()
  const liveSession = liveSessions.find(
    (session: any) => String(session.course_id) === String(course.id)
  )

  const isRecordedCourse =
    course.source === 'recorded' || course.course_type === 'recorded' || course.learning_path === 'recorded'

  // Calculate stats from course data directly
  const getCourseStats = () => {
    // Students count - prioritize total_students from API
    // Make sure we're using the correct data for this specific course
    const studentsCount = course.total_students ?? course.enrollment_count ?? course.enrolled_count ?? '0'
    
    // Units and Lessons
    let unitsAndLessons = '—'
    if (isRecordedCourse) {
      const unitsCount = typeof course.units_count === 'string' 
        ? parseInt(course.units_count, 10) 
        : (typeof course.units_count === 'number' ? course.units_count : 0)
      const lessonsCount = typeof course.total_lessons === 'string'
        ? parseInt(course.total_lessons, 10)
        : (typeof course.total_lessons === 'number' ? course.total_lessons : (course.lessons_count || 0))
      
      const unitsText = unitsCount > 0 ? `${unitsCount} وحدة` : ''
      const lessonsText = lessonsCount > 0 ? `${lessonsCount} درس` : ''
      unitsAndLessons = unitsCount > 0 && lessonsCount > 0
        ? `${unitsText} • ${lessonsText}`
        : unitsCount > 0 ? unitsText
        : lessonsCount > 0 ? lessonsText
        : '—'
    } else {
      // For live courses, get from lessons_count or lessons array
      // Make sure we're using the correct data for this specific course
      const lessonsCount = course.lessons_count ?? (Array.isArray(course.lessons) ? course.lessons.length : 0)
      const lessonsText = lessonsCount > 0 ? `${lessonsCount} درس` : '—'
      unitsAndLessons = lessonsText
      
      // Debug logging to verify course-specific data
      console.log(`🎯 CourseCard for ${course.id} (${course.title}):`, {
        lessons_count: course.lessons_count,
        lessons_length: course.lessons?.length,
        calculated_lessonsCount: lessonsCount,
        unitsAndLessons
      })
    }
    
    // Duration
    let duration = '—'
    if (isRecordedCourse && course.total_video_duration) {
      // For recorded courses, show total video duration
      const totalMinutes = Math.round(course.total_video_duration / 60)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      if (hours > 0) {
        duration = minutes > 0 ? `${hours} ساعة ${minutes} دقيقة` : `${hours} ساعة`
      } else {
        duration = `${minutes} دقيقة`
      }
    } else if (course.duration_weeks) {
      duration = `${course.duration_weeks} أسابيع`
    } else if (course.session_duration) {
      duration = `${course.session_duration} دقيقة للجلسة`
    }
    
    const stats = {
      studentsCount: String(studentsCount),
      unitsAndLessons,
      duration
    }
    
    return stats
  }

  const courseStats = getCourseStats()

  const priceLabel = formatCurrency(course.final_price ?? course.price)
  const studentCount = courseStats.studentsCount
  const lessonsValue = courseStats.unitsAndLessons
  const nextSessionDate = course.next_session ? new Date(course.next_session) : null
  const hasNextSession = nextSessionDate && !Number.isNaN(nextSessionDate.getTime())
  const nextSessionDay = hasNextSession
    ? new Intl.DateTimeFormat('ar-SA', { weekday: 'short', day: 'numeric', month: 'short' }).format(
        nextSessionDate as Date
      )
    : null
  const nextSessionTime = hasNextSession
    ? new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(nextSessionDate as Date)
    : null

  const approvalState = (() => {
    if (course.is_approved || course.approval_status === 'approved') {
      return {
        label: 'تمت الموافقة',
        Icon: CheckCircle,
        classes:
          'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/30'
      }
    }

    if (course.approval_status === 'rejected') {
      return {
        label: 'مرفوض',
        Icon: AlertCircle,
        classes:
          'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/30'
      }
    }

    if (course.approval_status === 'under_review') {
      return {
        label: 'قيد المراجعة',
        Icon: Clock,
        classes:
          'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700'
      }
    }

    return {
      label: 'بانتظار المراجعة',
      Icon: Clock,
      classes:
        'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30'
    }
  })()

  const stats: { key: string; label: string; value: string; hint?: string; icon: LucideIcon }[] = [
    {
      key: 'students',
      label: 'الطلاب المسجلون',
      value: formatNumber(studentCount),
      hint: course.max_students ? `من ${formatNumber(course.max_students)} مقاعد` : undefined,
      icon: Users
    },
    {
      key: 'lessons',
      label: 'الوحدات والدروس',
      value: lessonsValue,
      hint: course.learning_outcomes ? 'مخرجات تعليمية محدّثة' : undefined,
      icon: Layers
    },
    {
      key: 'duration',
      label: 'المدة',
      value: courseStats.duration,
      hint: course.course_type_display ?? undefined,
      icon: Clock
    }
  ]

  const handleCardClick = () => {
    if (isRecordedCourse) {
      router.push(`/dashboard/teacher/courses/${course.id}/recorded-details`)
      return
    }

    router.push(`/dashboard/teacher/courses/${course.id}/course-management`)
  }

  return (
    <motion.div
      whileHover={{ y: -12, transition: { duration: 0.3, ease: 'easeOut' } }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full"
      dir="rtl"
    >
      <Card
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:border-amber-300 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-800/50"
        onClick={handleCardClick}
      >
        {/* Thumbnail Section - Udemy/Coursera Style */}
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500">
          {/* Thumbnail Image */}
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Fallback to gradient if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          
          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Decorative pattern - only show if no thumbnail */}
          {!course.thumbnail && (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/30 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-amber-100/40 blur-3xl" />
            </div>
          )}

          {/* Content Icon - only show if no thumbnail */}
          {!course.thumbnail && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ rotate: 12, scale: 1.1 }}
                className="text-white opacity-90"
              >
                <BookOpen className="h-16 w-16" />
              </motion.div>
            </div>
          )}

          {/* Edit Button - Top Right (for approved live courses only) */}
          {((course.approval_status === 'approved' || course.is_approved) && 
            (course.source === 'live_education' || course.learning_path === 'live_education')) && (
            <div className="absolute top-4 right-4 z-20">
              <Link
                href={`/dashboard/teacher/courses/${course.id}/edit-content`}
                onClick={(event) => event.stopPropagation()}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-9 rounded-full border-white/80 bg-white/90 backdrop-blur-sm p-0 shadow-lg hover:bg-white hover:border-white dark:border-slate-700/80 dark:bg-slate-800/90 dark:hover:bg-slate-800"
                  title="طلب تعديل الدورة"
                >
                  <Edit className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </Button>
              </Link>
            </div>
          )}

          {/* Course Type Badge - Top Right (below Edit button if present) */}
          <div className={`absolute top-4 z-10 ${
            ((course.approval_status === 'approved' || course.is_approved) && 
             (course.source === 'live_education' || course.learning_path === 'live_education'))
              ? 'right-16' 
              : 'right-4'
          }`}>
            <Badge
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${typeInfo.bg} ${typeInfo.color} ${typeInfo.border}`}
            >
              {course.course_type_display ?? typeInfo.name}
            </Badge>
          </div>

          {/* Approval Status Badge - Top Left */}
          <div className="absolute top-4 left-4 z-10">
            <div
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${approvalState.classes}`}
            >
              <approvalState.Icon className="h-3.5 w-3.5" />
              {approvalState.label}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CardHeader className="flex flex-1 flex-col gap-4 px-5 py-4">
          {/* Title */}
          <div>
            <CardTitle className="line-clamp-2 text-base font-bold text-slate-900 transition-colors group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-300">
              {course.title}
            </CardTitle>
            {course.description && (
              <CardDescription className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                {course.description}
              </CardDescription>
            )}
          </div>

          {/* Stats Grid - 3 columns like Udemy */}
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.key}
                  className="flex flex-col items-center rounded-lg border border-slate-100 bg-slate-50/80 p-2.5 text-center dark:border-slate-700 dark:bg-slate-900/40"
                >
                  <Icon className="mb-1 h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{stat.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                </div>
              )
            })}
          </div>

          {/* Price if available */}
          {priceLabel && (
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 dark:border-amber-900/30 dark:bg-amber-900/20">
              <div className="text-xs text-amber-600 dark:text-amber-300">السعر</div>
              <div className="text-lg font-bold text-amber-700 dark:text-amber-200">{priceLabel}</div>
            </div>
          )}

          {/* Live Session Indicator */}
          {liveSession && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-blue-200/60 bg-blue-50 p-3 dark:border-blue-600/30 dark:bg-blue-900/20"
            >
              <div className="flex items-center gap-2">
                <span className="relative inline-flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                </span>
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-200">بث مباشر الآن</span>
              </div>
            </motion.div>
          )}

          {/* Next Session */}
          {hasNextSession && !liveSession && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-600 dark:bg-slate-900/40">
              <div className="text-xs text-slate-500 dark:text-slate-400">الجلسة القادمة</div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                {nextSessionDay} • {nextSessionTime}
              </div>
            </div>
          )}
        </CardHeader>

        {/* Action Buttons Section */}
        <div className="space-y-2 border-t border-slate-200 bg-slate-50/50 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/20">
          <div className="flex gap-2">
            {/* Primary Action Button */}
            <Link
              href={`/dashboard/teacher/courses/${course.id}`}
              className="flex-1"
              onClick={(event) => event.stopPropagation()}
            >
              <Button
                type="button"
                size="sm"
                className="h-full w-full gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 font-semibold text-white shadow-md hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 dark:from-amber-600 dark:via-orange-600 dark:to-amber-700"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">عرض</span>
              </Button>
            </Link>

            {/* Edit Button - Different behavior for approved live courses */}
            {((course.approval_status === 'approved' || course.is_approved) && 
              (course.source === 'live_education' || course.learning_path === 'live_education')) ? (
              // For approved live courses: go to edit-content (edit request)
              <Link
                href={`/dashboard/teacher/courses/${course.id}/edit-content`}
                className="flex-1"
                onClick={(event) => event.stopPropagation()}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="h-full w-full gap-2 border-slate-300 font-semibold text-slate-700 hover:border-slate-400 hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">طلب تعديل</span>
                </Button>
              </Link>
            ) : (
              // For other courses: direct edit
            <Link
              href={`/dashboard/teacher/courses/${course.id}/edit`}
              className="flex-1"
              onClick={(event) => event.stopPropagation()}
            >
              <Button
                size="sm"
                variant="outline"
                className="h-full w-full gap-2 border-slate-300 font-semibold text-slate-700 hover:border-slate-400 hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">تعديل</span>
              </Button>
            </Link>
            )}

            {/* Live Join Button if available */}
            {liveSession?.can_join && (
              <Link
                href={`/join/${liveSession.session_id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="sm"
                  className="gap-2 bg-blue-600 font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <Play className="h-4 w-4" />
                  <span className="hidden sm:inline">بث</span>
                </Button>
              </Link>
            )}
          </div>
          
        </div>
      </Card>
    </motion.div>
  )
}
