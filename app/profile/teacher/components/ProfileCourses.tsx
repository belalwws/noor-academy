'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiClient } from '@/lib/apiClient'
import { toast } from 'sonner'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  RefreshCw,
  TrendingUp
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  course_type: string
  course_type_display: string
  max_students: number
  enrolled_count: number
  approval_status: string
  approval_status_display: string
  is_published: boolean
  created_at: string
  updated_at: string
}

interface ProfileCoursesProps {
  teacherId?: number
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusBadge = (approvalStatus: string, isPublished: boolean) => {
  if (approvalStatus === 'approved' && isPublished) {
    return {
      label: 'منشورة',
      className: 'bg-blue-500 text-white',
      icon: CheckCircle
    }
  } else if (approvalStatus === 'approved' && !isPublished) {
    return {
      label: 'معتمدة',
      className: 'bg-blue-500 text-white',
      icon: CheckCircle
    }
  } else if (approvalStatus === 'rejected') {
    return {
      label: 'مرفوضة',
      className: 'bg-red-500 text-white',
      icon: AlertCircle
    }
  } else {
    return {
      label: 'قيد المراجعة',
      className: 'bg-yellow-500 text-white',
      icon: Clock
    }
  }
}

export default function ProfileCourses({ teacherId }: ProfileCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadCourses = async () => {
    try {
      setLoading(true)
      console.log('Loading teacher courses...')

      const response = await apiClient.get('/live-education/courses/')
      console.log('Courses response:', response)

      if (response && response.data) {
        // Handle both paginated and direct array responses
        const coursesData = Array.isArray(response.data) 
          ? response.data 
          : response.data.results || []
        
        setCourses(coursesData)
        console.log('Loaded courses:', coursesData.length)
      } else {
        setCourses([])
      }
    } catch (error) {
      console.error('Error loading courses:', error)
      toast.error('حدث خطأ في تحميل الدورات')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCourses()
    setRefreshing(false)
    toast.success('تم تحديث قائمة الدورات')
  }

  useEffect(() => {
    loadCourses()
  }, [teacherId])

  if (loading) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-8">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-[#2d7d32] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">جاري تحميل الدورات...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate stats
  const totalCourses = courses.length
  const approvedCourses = courses.filter(c => c.approval_status === 'approved').length
  const publishedCourses = courses.filter(c => c.is_published).length
  const totalStudents = courses.reduce((sum, course) => sum + (course.enrolled_count || 0), 0)

  return (
    <div className="space-y-6">
      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-100">
          <CardContent className="p-4 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">إجمالي الدورات</p>
                <p className="text-2xl font-bold text-blue-800">{totalCourses}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100">
          <CardContent className="p-4 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">معتمدة</p>
                <p className="text-2xl font-bold text-blue-800">{approvedCourses}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-100">
          <CardContent className="p-4 bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">منشورة</p>
                <p className="text-2xl font-bold text-purple-800">{publishedCourses}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-100">
          <CardContent className="p-4 bg-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">إجمالي الطلاب</p>
                <p className="text-2xl font-bold text-orange-800">{totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">دوراتي ({totalCourses})</h2>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          
          <Link href="/create-course/form">
            <Button className="bg-[#2d7d32] hover:bg-[#1b5e20] flex items-center gap-2">
              <Plus className="w-4 h-4" />
              إنشاء دورة جديدة
            </Button>
          </Link>
        </div>
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <Card className="border-2 border-gray-200">
          <CardContent className="p-12">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد دورات بعد</h3>
              <p className="text-gray-500 mb-6">ابدأ رحلتك التعليمية بإنشاء دورتك الأولى</p>
              <Link href="/create-course/form">
                <Button className="bg-[#2d7d32] hover:bg-[#1b5e20]">
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء دورة جديدة
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => {
            const status = getStatusBadge(course.approval_status, course.is_published)
            const StatusIcon = status.icon
            const enrollmentPercentage = course.max_students > 0 
              ? (course.enrolled_count / course.max_students) * 100 
              : 0

            return (
              <Card key={course.id} className="border-2 border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {course.course_type_display}
                        </Badge>
                        <Badge className={status.className}>
                          <StatusIcon className="w-3 h-3 ml-1" />
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  {course.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  {/* Enrollment Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">الطلاب المسجلين</span>
                      <span className="font-semibold">
                        {course.enrolled_count}/{course.max_students}
                      </span>
                    </div>
                    <Progress value={enrollmentPercentage} className="h-2" />
                  </div>

                  {/* Course Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>أنشئت: {formatDate(course.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>محدثة: {formatDate(course.updated_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Link href={`/dashboard/teacher`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 ml-2" />
                        عرض التفاصيل
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
