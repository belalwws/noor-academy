"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAppSelector } from '../../../../lib/hooks'
import { apiClient } from '../../../../lib/api'
import ProtectedRoute from '../../../../components/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Badge } from '../../../../components/ui/badge'
import { Progress } from '../../../../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs'
import { 
  BookOpen, 
  Users, 
  Clock, 
  Edit,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  FileText,
  Video,
  Calendar,
  ArrowLeft
} from 'lucide-react'

interface Course {
  id: number
  title: string
  description: string
  content: string
  level: string
  category: string
  duration: number
  max_students: number
  enrolled_students: number
  price: number
  status: 'draft' | 'pending_review' | 'published' | 'archived'
  created_at: string
  updated_at: string
  start_date?: string
  end_date?: string
  thumbnail?: string
  lessons_count: number
  assignments_count: number
  completion_rate: number
}

interface Student {
  id: number
  name: string
  email: string
  enrolled_at: string
  progress: number
  last_activity: string
}

export default function TeacherCourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params['id'] as string
  const { user } = useAppSelector(state => state.auth)
  
  const [course, setCourse] = useState<Course | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (courseId) {
      loadCourseDetails()
    }
  }, [courseId])

  const loadCourseDetails = async () => {
    try {
      setLoading(true)
      
      const [courseResponse, studentsResponse] = await Promise.all([
        apiClient.getCourseDetails(parseInt(courseId)),
        apiClient.getCourseStudents(parseInt(courseId))
      ])
      
      // Extract data from ApiResponse objects
      if (courseResponse.success && courseResponse.data) {
        setCourse(courseResponse.data)
      } else {
        setError(courseResponse.error || 'فشل في تحميل تفاصيل الدورة')
        return
      }
      
      if (studentsResponse.success) {
        setStudents(studentsResponse.data?.results || [])
      } else {
        console.warn('Failed to load students:', studentsResponse.error)
        setStudents([])
      }
    } catch (error: any) {
      console.error('Error loading course details:', error)
      setError('حدث خطأ في تحميل تفاصيل الدورة')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-blue-100 text-blue-800'
      case 'pending_review': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'archived': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'منشورة'
      case 'pending_review': return 'قيد المراجعة'
      case 'draft': return 'مسودة'
      case 'archived': return 'مؤرشفة'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل تفاصيل الدورة...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !course) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {error || 'لم يتم العثور على الدورة'}
              </h3>
              <Button onClick={() => router.push('/teacher/courses')}>
                العودة إلى الدورات
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => router.push('/teacher/courses')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة إلى الدورات
            </Button>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {course.title}
                </h1>
                <p className="text-gray-600 mb-4">
                  {course.description}
                </p>
                <Badge className={getStatusColor(course.status)}>
                  {getStatusLabel(course.status)}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل الدورة
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 ml-2" />
                  الإعدادات
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الطلاب المسجلين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{course.enrolled_students}</div>
                <p className="text-xs text-muted-foreground">
                  من أصل {course.max_students}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الدروس</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{course.lessons_count}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الواجبات</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{course.assignments_count}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معدل الإكمال</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{course.completion_rate}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Course Progress */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>نسبة امتلاء الدورة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>الطلاب المسجلين</span>
                  <span>{course.enrolled_students} / {course.max_students}</span>
                </div>
                <Progress 
                  value={(course.enrolled_students / course.max_students) * 100} 
                  className="h-3"
                />
                <p className="text-xs text-gray-500">
                  {course.max_students - course.enrolled_students} مقعد متبقي
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="students">الطلاب</TabsTrigger>
              <TabsTrigger value="lessons">الدروس</TabsTrigger>
              <TabsTrigger value="assignments">الواجبات</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>تفاصيل الدورة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="font-medium">الفئة:</span>
                      <span className="mr-2">{course.category}</span>
                    </div>
                    <div>
                      <span className="font-medium">المستوى:</span>
                      <span className="mr-2">{course.level}</span>
                    </div>
                    <div>
                      <span className="font-medium">المدة:</span>
                      <span className="mr-2">{course.duration} ساعة</span>
                    </div>
                    <div>
                      <span className="font-medium">السعر:</span>
                      <span className="mr-2">{course.price} ر.س</span>
                    </div>
                    {course.start_date && (
                      <div>
                        <span className="font-medium">تاريخ البداية:</span>
                        <span className="mr-2">{formatDate(course.start_date)}</span>
                      </div>
                    )}
                    {course.end_date && (
                      <div>
                        <span className="font-medium">تاريخ النهاية:</span>
                        <span className="mr-2">{formatDate(course.end_date)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>محتوى الدورة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {course.content || 'لم يتم إضافة محتوى مفصل للدورة بعد.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>قائمة الطلاب المسجلين</CardTitle>
                  <CardDescription>
                    إدارة الطلاب المسجلين في الدورة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {students.length > 0 ? (
                    <div className="space-y-4">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{student.name}</h4>
                            <p className="text-sm text-gray-500">{student.email}</p>
                            <p className="text-xs text-gray-400">
                              تاريخ التسجيل: {formatDate(student.enrolled_at)}
                            </p>
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium mb-1">
                              التقدم: {student.progress}%
                            </div>
                            <Progress value={student.progress} className="w-24 h-2" />
                            <p className="text-xs text-gray-400 mt-1">
                              آخر نشاط: {formatDate(student.last_activity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">لا يوجد طلاب مسجلين في هذه الدورة بعد</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lessons" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>دروس الدورة</CardTitle>
                  <CardDescription>
                    إدارة محتوى الدروس والمواد التعليمية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">لم يتم إضافة دروس لهذه الدورة بعد</p>
                    <Button>إضافة درس جديد</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>واجبات الدورة</CardTitle>
                  <CardDescription>
                    إدارة الواجبات والتقييمات
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">لم يتم إضافة واجبات لهذه الدورة بعد</p>
                    <Button>إضافة واجب جديد</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
