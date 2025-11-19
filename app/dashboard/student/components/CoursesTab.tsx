'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { liveEducationAPI } from '@/lib/api/liveEducation'
import { enrollmentAPI } from '@/lib/api/enrollments'
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Search, 
  Users, 
  Star, 
  Play,
  CheckCircle,
  AlertCircle,
  XCircle,
  BookMarked,
  User,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

interface Course {
  id: string
  title: string
  description?: string
  learning_outcomes?: string[]
  subjects?: string
  course_type: 'individual' | 'family' | 'group_private' | 'group_public'
  course_type_display: string
  max_students: number
  current_enrollments: number
  available_spots: number
  teacher: {
    id: string
    user: {
      id: string
      username: string
      first_name: string
      last_name: string
      email: string
    }
    specialization?: string
    bio?: string
    experience_years?: number
  }
  lessons: {
    id: string
    title: string
    order: number
    duration_minutes?: number
  }[]
  trial_session_url?: string
  approval_status: string
  approval_status_display: string
  is_published: boolean
  created_at: string
  updated_at?: string
  enrollment_status?: 'not_enrolled' | 'pending' | 'approved' | 'rejected' | 'completed'
}

interface Enrollment {
  id: string
  course: Course
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  status_display: string
  enrollment_date: string
  notes?: string
  completion_date?: string
  progress?: number
}

export default function CoursesTab() {
  const [activeTab, setActiveTab] = useState('available')
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [enrolling, setEnrolling] = useState<string | null>(null)

  // Load available courses
  const loadAvailableCourses = async () => {
    try {
      const response = await liveEducationAPI.getPublishedCourses({
        search: searchTerm || undefined,
        course_type: selectedType !== 'all' ? selectedType as any : undefined,
        ordering: '-created_at'
      })
      setAvailableCourses(response.results)
    } catch (error) {
      console.error('Error loading courses:', error)
      toast.error('حدث خطأ في تحميل الكورسات')
    }
  }

  // Load enrolled courses
  const loadEnrolledCourses = async () => {
    try {
      const resp: any = await enrollmentAPI.getMyEnrollments()
      const rawList: any[] = Array.isArray(resp) ? resp : (resp?.results || resp?.data || [])

      // Enrich each enrollment with full course details to match UI expectations
      const enriched = await Promise.all(
        rawList.map(async (en) => {
          try {
            const course = await liveEducationAPI.getCourse(en.course)
            return {
              id: en.id,
              course, // full course object as expected by the UI
              status: en.status,
              status_display: en.status_display,
              enrollment_date: en.enrolled_at,
              notes: en.notes,
              completion_date: en.completed_at,
              progress: en.progress_percentage || en.progress || 0,
            } as any
          } catch (e) {
            // Fallback to minimal structure if course fetch fails
            return {
              id: en.id,
              course: { id: en.course, title: en.course_title || 'دورة', lessons: [], course_type_display: '', teacher: { user: {} } } as any,
              status: en.status,
              status_display: en.status_display,
              enrollment_date: en.enrolled_at,
              notes: en.notes,
            } as any
          }
        })
      )

      setEnrolledCourses(enriched)
    } catch (error) {
      console.error('Error loading enrollments:', error)
      toast.error('حدث خطأ في تحميل التسجيلات')
    }
  }

  // Load all data
  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadAvailableCourses(), loadEnrolledCourses()])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Quick enroll function
  const handleQuickEnroll = async (courseId: string, courseTitle: string) => {
    try {
      setEnrolling(courseId)
      
      await enrollmentAPI.createEnrollment({
        course: courseId,
        notes: `طلب التسجيل في كورس ${courseTitle}`
      })

      toast.success('تم إرسال طلب التسجيل بنجاح!')
      await loadAllData() // Reload data to update enrollment status
    } catch (error: any) {
      console.error('Error enrolling:', error)
      if (error.message.includes('already enrolled')) {
        toast.error('أنت مسجل بالفعل في هذا الكورس')
      } else {
        toast.error(error.message || 'حدث خطأ في التسجيل')
      }
    } finally {
      setEnrolling(null)
    }
  }

  // Get enrollment status for a course
  const getEnrollmentStatus = (courseId: string) => {
    return enrolledCourses.find(enrollment => enrollment.course.id === courseId)
  }

  // Get course type badge color
  const getCourseTypeBadge = (type: string) => {
    switch (type) {
      case 'individual': return 'bg-blue-100 text-blue-800'
      case 'family': return 'bg-green-100 text-green-800' 
      case 'group_private': return 'bg-purple-100 text-purple-800'
      case 'group_public': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get enrollment status badge
  const getEnrollmentBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" /> قيد المراجعة</Badge>
      case 'approved':
        return <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> معتمد</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200"><XCircle className="w-3 h-3 mr-1" /> مرفوض</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200"><BookMarked className="w-3 h-3 mr-1" /> مكتمل</Badge>
      default:
        return null
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  useEffect(() => {
    loadAvailableCourses()
  }, [searchTerm, selectedType])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الكورسات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            الكورسات المتاحة ({availableCourses.length})
          </TabsTrigger>
          <TabsTrigger value="enrolled" className="flex items-center gap-2">
            <BookMarked className="w-4 h-4" />
            كورساتي ({enrolledCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="ابحث في الكورسات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="individual">فردي</option>
                  <option value="family">عائلي</option>
                  <option value="group_private">جماعي خاص</option>
                  <option value="group_public">جماعي عام</option>
                </select>
                <Button variant="outline" onClick={loadAvailableCourses}>
                  <Filter className="w-4 h-4 mr-2" />
                  تطبيق
                </Button>
              </div>
            </div>
          </div>

          {/* Available Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => {
              const enrollmentStatus = getEnrollmentStatus(course.id)
              const canEnroll = !enrollmentStatus && course.available_spots > 0

              return (
                <Card key={course.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                          {course.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={getCourseTypeBadge(course.course_type)}>
                            {course.course_type_display}
                          </Badge>
                          {enrollmentStatus && getEnrollmentBadge(enrollmentStatus.status)}
                        </div>
                      </div>
                    </div>
                    
                    <CardDescription className="text-sm text-gray-600 line-clamp-3">
                      {course.description || 'لا يوجد وصف متاح'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* Teacher Info */}
                    <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">
                        {course.teacher.user.first_name} {course.teacher.user.last_name}
                      </span>
                    </div>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{course.lessons.length}</div>
                        <div className="text-xs text-blue-600">دروس</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{course.available_spots}</div>
                        <div className="text-xs text-purple-600">مقعد متاح</div>
                      </div>
                    </div>

                    {/* Learning Outcomes Preview */}
                    {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">ستتعلم:</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {course.learning_outcomes.slice(0, 2).map((outcome, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1">{outcome}</span>
                            </li>
                          ))}
                          {course.learning_outcomes.length > 2 && (
                            <li className="text-green-600 font-medium">+ {course.learning_outcomes.length - 2} المزيد...</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {course.trial_session_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(course.trial_session_url, '_blank')}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          حصة تجريبية
                        </Button>
                      )}

                      {canEnroll ? (
                        <Button
                          className="w-full"
                          onClick={() => handleQuickEnroll(course.id, course.title)}
                          disabled={enrolling === course.id}
                        >
                          {enrolling === course.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              جاري التسجيل...
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-4 h-4 mr-2" />
                              سجل الآن
                            </>
                          )}
                        </Button>
                      ) : enrollmentStatus ? (
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            {enrollmentStatus.status === 'pending' && 'طلبك قيد المراجعة'}
                            {enrollmentStatus.status === 'approved' && 'أنت مسجل في هذا الكورس'}
                            {enrollmentStatus.status === 'rejected' && 'تم رفض طلب التسجيل'}
                          </p>
                        </div>
                      ) : (
                        <Button disabled className="w-full">
                          <Users className="w-4 h-4 mr-2" />
                          مكتمل العدد
                        </Button>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Link 
                        href={`/live-teaching/${course.course_type === 'individual' ? 'single-individual' : course.course_type}`}
                        className="text-xs text-green-600 hover:text-green-800 font-medium"
                      >
                        عرض المزيد من الكورسات المشابهة ←
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Empty State */}
          {availableCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد كورسات متاحة</h3>
              <p className="text-gray-600 mb-4">جرب تغيير معايير البحث أو تصفح أنواع كورسات مختلفة</p>
              <Link href="/live-teaching">
                <Button variant="outline">
                  تصفح جميع الكورسات
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrolled">
          {/* Enrolled Courses */}
          <div className="space-y-6">
            {enrolledCourses.map((enrollment) => (
              <Card key={enrollment.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-800 mb-2">
                        {enrollment.course.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className={getCourseTypeBadge(enrollment.course.course_type)}>
                          {enrollment.course.course_type_display}
                        </Badge>
                        {getEnrollmentBadge(enrollment.status)}
                      </div>
                    </div>
                  </div>
                  
                  <CardDescription className="text-sm text-gray-600">
                    {enrollment.course.description || 'لا يوجد وصف متاح'}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Course Details */}
                    <div className="space-y-4">
                      {/* Teacher Info */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {enrollment.course.teacher.user.first_name} {enrollment.course.teacher.user.last_name}
                          </p>
                          <p className="text-sm text-gray-600">المعلم</p>
                        </div>
                      </div>

                      {/* Enrollment Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>تاريخ التسجيل: {new Date(enrollment.enrollment_date).toLocaleDateString('ar-SA')}</span>
                        </div>
                        {enrollment.completion_date && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>تاريخ الإنجاز: {new Date(enrollment.completion_date).toLocaleDateString('ar-SA')}</span>
                          </div>
                        )}
                      </div>

                      {/* Progress */}
                      {enrollment.progress && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">التقدم</span>
                            <span className="font-medium text-gray-800">{enrollment.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Course Stats and Actions */}
                    <div className="space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">{enrollment.course.lessons.length}</div>
                          <div className="text-sm text-blue-600">درس</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-xl font-bold text-green-600">
                            {enrollment.course.current_enrollments}
                          </div>
                          <div className="text-sm text-green-600">طالب مسجل</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        {enrollment.status === 'approved' && (
                          <>
                            <Button className="w-full" size="sm">
                              <BookOpen className="w-4 h-4 mr-2" />
                              دخول الكورس
                            </Button>
                            {enrollment.course.trial_session_url && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => window.open(enrollment.course.trial_session_url, '_blank')}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                الحصة التجريبية
                              </Button>
                            )}
                          </>
                        )}
                        
                        {enrollment.status === 'pending' && (
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-800 font-medium">
                              طلبك قيد المراجعة من المشرف العام
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                              ستصلك إشعار عند الموافقة على التسجيل
                            </p>
                          </div>
                        )}
                        
                        {enrollment.status === 'rejected' && (
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-800 font-medium">
                              تم رفض طلب التسجيل
                            </p>
                            {enrollment.notes && (
                              <p className="text-xs text-red-600 mt-1">
                                {enrollment.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {enrolledCourses.length === 0 && (
              <div className="text-center py-12">
                <BookMarked className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد كورسات مسجلة</h3>
                <p className="text-gray-600 mb-4">ابدأ رحلتك التعليمية بالتسجيل في كورسك الأول</p>
                <Button onClick={() => setActiveTab('available')}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  تصفح الكورسات المتاحة
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
