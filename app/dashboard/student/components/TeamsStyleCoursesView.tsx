'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  Filter,
  Grid3X3,
  List,
  BookOpen,
  Users,
  Clock,
  Star,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar
} from 'lucide-react'
import TeamsStyleCourseCard from './TeamsStyleCourseCard'

interface Course {
  id: string
  title: string
  description?: string
  course_type: string
  course_type_display: string
  teacher: {
    user: {
      first_name: string
      last_name: string
    }
  }
  enrollment_status?: string
  next_session?: string
  total_sessions?: number
  attended_sessions?: number
  recent_notes_count?: number
}

interface CourseApplication {
  id: string;
  course: string;
  course_title?: string;
  status: 'pending_review' | 'ready_for_teacher' | 'rejected' | 'enrolled';
  status_display?: string;
  learning_type?: 'individual' | 'group';
  learning_type_display?: string;
  created_at: string;
  updated_at: string;
}

interface TeamsStyleCoursesViewProps {
  courses: Course[]
  applications?: CourseApplication[]
  batches?: any[]
  loading: boolean
  onRefresh: () => void
}

export default function TeamsStyleCoursesView({ courses, applications = [], batches = [], loading, onRefresh }: TeamsStyleCoursesViewProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<string>('all')
  const [showAll, setShowAll] = useState(false)

  // Convert applications to course-like format for unified display
  const applicationCards = applications.map(app => ({
    id: `app-${app.id}`,
    title: app.course_title || `دورة ${app.course}`,
    description: undefined,
    course_type: app.learning_type || 'individual',
    course_type_display: app.learning_type_display || (app.learning_type === 'individual' ? 'فردي' : 'جماعي'),
    teacher: {
      user: {
        first_name: '',
        last_name: ''
      }
    },
    enrollment_status: app.status === 'pending_review' ? 'pending' : app.status === 'ready_for_teacher' ? 'approved' : app.status,
    status_display: app.status_display || (app.status === 'pending_review' ? 'قيد المراجعة' : app.status === 'ready_for_teacher' ? 'جاهز للمعلم' : app.status === 'rejected' ? 'مرفوض' : ''),
    isApplication: true,
    applicationData: app
  }))

  // Combine courses and applications (batches are shown within course cards)
  const allItems = [...courses, ...applicationCards]

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${item.teacher.user.first_name} ${item.teacher.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || item.course_type === filterType
    
    return matchesSearch && matchesFilter
  })

  const filteredCourses = filteredItems.filter(item => !item.isApplication)
  const filteredApplications = filteredItems.filter(item => item.isApplication)

  const getQuickStats = () => {
    const totalCourses = courses.length
    const activeCourses = courses.filter(c => c.enrollment_status === 'approved').length
    const upcomingSessions = courses.filter(c => c.next_session).length
    const totalNotes = courses.reduce((sum, c) => sum + (c.recent_notes_count || 0), 0)
    const pendingApplications = applications.filter(a => a.status === 'pending_review' || a.status === 'ready_for_teacher').length
    const activeBatches = batches.filter(b => b.status === 'active').length

    return { totalCourses, activeCourses, upcomingSessions, totalNotes, pendingApplications, activeBatches }
  }

  const stats = getQuickStats()

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any; color: string }> = {
      pending_review: {
        label: 'قيد المراجعة',
        variant: 'secondary',
        icon: Clock,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800'
      },
      ready_for_teacher: {
        label: 'جاهز للمعلم',
        variant: 'default',
        icon: CheckCircle,
        color: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
      },
      rejected: {
        label: 'مرفوض',
        variant: 'destructive',
        icon: XCircle,
        color: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800'
      },
    };

    const config = statusConfig[status] || { 
      label: status, 
      variant: 'outline' as const, 
      icon: FileText,
      color: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };


  return (
    <div className="space-y-6">
      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse border border-gray-100">
              <div className="h-20 bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <>
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {(showAll ? filteredItems : filteredItems.slice(0, 8)).map((item) => {
              // Render application card
              if (item.isApplication) {
                const app = item.applicationData as CourseApplication
                const initials = item.title?.trim()?.charAt(0)?.toUpperCase() || 'ط'
                
                // Check if student is already in a batch for this course
                // Match by course ID - both should be UUID strings
                const studentBatch = batches?.find(b => {
                  if (!b.batch_details || b.status !== 'active') {
                    return false
                  }
                  const batchCourseId = String(b.batch_details.course || '').trim()
                  const appCourseId = String(app.course || '').trim()
                  const matches = batchCourseId === appCourseId && batchCourseId !== ''
                  
                  return matches
                })
                
                // Check if application has a matching batch
                return (
                  <Card
                    key={item.id}
                    className="group relative overflow-hidden bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-amber-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Application banner */}
                    <div className="h-32 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full blur-xl translate-y-4 -translate-x-4"></div>
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        <Badge className="text-[10px] px-2.5 py-1 border backdrop-blur-md shadow-sm font-medium bg-amber-100/50 text-amber-900 border-amber-300">
                          طلب تسجيل
                        </Badge>
                        {getStatusBadge(app.status)}
                      </div>
                      <motion.div
                        whileHover={{ rotate: 5 }}
                        className="w-14 h-14 rounded-xl bg-white/30 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl absolute bottom-3 right-3 border border-white/30 shadow-xl"
                      >
                        {initials}
                      </motion.div>
                    </div>

                    <CardContent className="p-6 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-800 dark:to-amber-900/10">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white line-clamp-2">
                        {item.title}
                      </h3>
                      
                      <div className="space-y-3 mt-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div className="flex items-start gap-2">
                            {studentBatch ? (
                              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className={`text-xs leading-relaxed ${
                                studentBatch 
                                  ? 'text-blue-800 dark:text-blue-200 font-medium'
                                  : 'text-amber-800 dark:text-amber-200'
                              }`}>
                                {studentBatch 
                                  ? `تم إضافتك إلى المجموعة: ${studentBatch.batch_details?.name || 'مجموعة'}`
                                  : app.status === 'pending_review' 
                                  ? 'طلبك قيد المراجعة من قبل المشرف الأكاديمي'
                                  : app.status === 'ready_for_teacher'
                                  ? 'تم قبول طلبك! في انتظار المعلم لإضافتك إلى دفعة'
                                  : 'تم رفض طلبك'}
                              </p>
                              {studentBatch && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 text-xs h-7"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/interface-batch/${studentBatch.batch}`)
                                  }}
                                >
                                  عرض المجموعة
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(app.created_at).toLocaleDateString('ar-SA')}</span>
                          </div>
                          {app.learning_type && (
                            <Badge variant="outline" className="text-xs">
                              {app.learning_type_display || (app.learning_type === 'individual' ? 'فردي' : 'جماعي')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              }
              
              // Render course card
              // Find batch for this course
              // Match by course ID - batch_details.course should match item.id (course ID)
              const courseBatch = batches?.find(b => {
                if (!b.batch_details || b.status !== 'active') return false
                const batchCourseId = b.batch_details.course
                // Match by course ID
                return batchCourseId === item.id
              })
              
              return (
              <TeamsStyleCourseCard
                  key={item.id}
                  course={item}
                  batch={courseBatch}
                  onClick={(id) => {
                    // Navigate to course page with 3 options
                    router.push(`/dashboard/student/course/${id}`)
                  }}
                  onBatchClick={(batchId) => {
                    router.push(`/interface-batch/${batchId}`)
                  }}
              />
              )
            })}
          </div>
          {filteredItems.length > 8 && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="border-secondary/30 text-secondary hover:bg-secondary/5"
              >
                {showAll ? 'عرض أقل' : `عرض المزيد (${filteredItems.length - 8})`}
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-800/50 dark:to-purple-900/10 backdrop-blur-sm">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">لا توجد دورات</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {searchTerm || filterType !== 'all'
                ? 'لم يتم العثور على دورات تطابق معايير البحث'
                : 'لم تسجل في أي دورات بعد'
              }
            </p>
            {(searchTerm || filterType !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('all')
                }}
                variant="outline"
                className="border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
              >
                مسح الفلاتر
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
