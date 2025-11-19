'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/lib/hooks'
import { apiClient } from '@/lib/apiClient'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getAuthToken } from '@/lib/auth'
import { teachersApi, JoinGeneralSupervisorRequest } from '@/lib/api/teachers'
import { logger } from '@/lib/utils/logger'

// UI Components
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { liveEducationApi } from '@/lib/api/live-education'
import { recordedCoursesApi } from '@/lib/api/recorded-courses'
import { interactiveGamesApi, type InteractiveGame } from '@/lib/api/interactive-games'

// Icons
import {
  BookOpen,
  FileText,
  Plus,
  X,
  Users,
  GraduationCap,
  CalendarCheck,
  Star,
  FlaskConical,
  Eye,
  DollarSign,
  Edit,
  Gamepad2,
  Trophy
} from 'lucide-react'

// Import Components
import TeacherHeader from './components/TeacherHeader'
import TeacherTabs from './components/TeacherTabs'
import CourseCard from './components/CourseCard'
import CourseDetailsDialog from './components/CourseDetailsDialog'
import NotesDialog from './components/NotesDialog'
import SupervisorTab from './components/SupervisorTab'
import CourseAnnouncementDialog from './components/CourseAnnouncementDialog'
import TeacherCourseEditRequests from '@/components/TeacherCourseEditRequests'

interface Course {
  // Core API fields from GET /courses/courses/{id}/
  id: string // UUID string
  title: string
  description: string
  learning_outcomes?: string
  course_type?: "individual" | "family" | "group_private" | "group_public" | "recorded"
  course_type_display?: string
  subjects?: string
  topics?: string
  trial_session_url?: string
  max_students?: string
  teacher: number
  teacher_name: string
  teacher_email: string
  approval_status: "pending" | "approved" | "rejected" | "under_review"
  approval_status_display: string
  approved_by?: number
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  is_published?: boolean
  lessons?: CourseLesson[]
  enrolled_count?: string
  available_spots?: string
  created_at: string
  updated_at?: string
  
  // Recorded course specific fields
  price?: string
  platform_commission_percentage?: string
  final_price?: string
  thumbnail?: string
  cover_image?: string
  intro_session_id?: string
  accepting_applications?: boolean
  is_hidden?: boolean
  units_count?: string
  total_lessons?: string
  
  // Legacy fields for backward compatibility (from other APIs)
  instructor?: number
  instructor_name?: string
  level?: "beginner" | "intermediate" | "advanced"
  learning_path?: "individual" | "group_continuous" | "training" | "live_education" | "recorded"
  duration_weeks?: number
  start_date?: string
  end_date?: string
  session_duration?: number
  enrollment_count?: number | string
  lessons_count?: number
  next_session?: string
  status?: "draft" | "published" | "archived" | "pending_review"
  is_approved?: boolean
  source?: "live_education" | "recorded"
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

interface TeacherProfile {
  full_name: string
  specialization?: string
  years_of_experience?: number
  bio?: string
  profile_image_url?: string | null
  average_rating?: number
  total_students?: number
  total_lessons?: number
  response_rate?: number
  online_hours?: number
}

export default function TeacherDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <TeacherDashboard />
    </ProtectedRoute>
  )
}

function TeacherDashboard() {
  const router = useRouter()
  const { user } = useAppSelector(state => state.auth)
  const [courses, setCourses] = useState<Course[]>([])
  const [allCourses, setAllCourses] = useState<Course[]>([]) // Store all courses for search
  const [searchQuery, setSearchQuery] = useState('')
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState({
    courses: true,
    profile: true,
  })
  const [refreshing, setRefreshing] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [newSupervisorRequest, setNewSupervisorRequest] = useState<JoinGeneralSupervisorRequest>({
    general_supervisor_email: '',
    request_message: 'أرغب في الانضمام لمشرفكم لتوسيع نطاق عملي بحيث نسهل على المدرس'
  })
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [refreshSuccess, setRefreshSuccess] = useState(false)

  // View mode state
  const [viewMode, setViewMode] = useState<'dashboard' | 'teams'>('teams')
  const [requestError, setRequestError] = useState('')
  const [activeTab, setActiveTab] = useState<string>('recorded-courses')
  const [supervisorEmails, setSupervisorEmails] = useState<string[]>([])
  const [supervisorEmailError, setSupervisorEmailError] = useState<string>('')
  const [currentSupervisorEmail, setCurrentSupervisorEmail] = useState<string>('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  
  // Notes dialog state
  const [notesDialog, setNotesDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [courseNote, setCourseNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // Knowledge Labs state
  const [knowledgeLabs, setKnowledgeLabs] = useState<any[]>([])
  const [loadingLabs, setLoadingLabs] = useState(false)
  const [labSearchQuery, setLabSearchQuery] = useState('')

  // Interactive Games state
  const [interactiveGames, setInteractiveGames] = useState<InteractiveGame[]>([])
  const [loadingGames, setLoadingGames] = useState(false)

  // Fetch knowledge labs when tab is active
  useEffect(() => {
    if (activeTab === 'knowledge-labs') {
      fetchKnowledgeLabs()
    } else if (activeTab === 'interactive-games') {
      fetchInteractiveGames()
    }
  }, [activeTab])

  const fetchInteractiveGames = async () => {
    try {
      setLoadingGames(true)
      const response = await interactiveGamesApi.list()
      setInteractiveGames(response.results || [])
    } catch (error: any) {
      logger.error('Error fetching interactive games:', error)
      toast.error('حدث خطأ في جلب الألعاب التفاعلية')
    } finally {
      setLoadingGames(false)
    }
  }

  const fetchKnowledgeLabs = async () => {
    try {
      setLoadingLabs(true)
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        toast.error('يرجى تسجيل الدخول')
        return
      }

      const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'
      const response = await fetch(`${API_BASE_URL}/knowledge-lab/labs/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const labs = data.results || data || []
        logger.log('Knowledge labs fetched:', labs)
        setKnowledgeLabs(labs)
      } else {
        const errorData = await response.json().catch(() => ({}))
        logger.error('Error response:', errorData)
        toast.error('حدث خطأ في جلب مختبرات المعرفة')
      }
    } catch (error) {
      logger.error('Error fetching knowledge labs:', error)
      toast.error('حدث خطأ في جلب مختبرات المعرفة')
    } finally {
      setLoadingLabs(false)
    }
  }


  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false)
const [selectedCourseForAnnouncement, setSelectedCourseForAnnouncement] = useState<Course | null>(null)


  // Course details dialog state
  const [courseDetailsDialog, setCourseDetailsDialog] = useState(false)
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState<Course | null>(null)
  const [courseDetailsLoading, setCourseDetailsLoading] = useState(false)

  // Batch creation dialog state
  const [batchDialogOpen, setBatchDialogOpen] = useState(false)
  const [selectedCourseForBatch, setSelectedCourseForBatch] = useState<Course | null>(null)
  const [newBatch, setNewBatch] = useState({
    name: '',
    type: 'group' as 'individual' | 'group',
    status: 'active' as 'active' | 'closed',
    max_students: 200
  })
  const [creatingBatch, setCreatingBatch] = useState(false)
  const [batchesRefreshKey, setBatchesRefreshKey] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      setInitialLoad(true)
      try {
        await loadTeacherData()
      } catch (error) {
        logger.error('Error loading initial data:', error)
        toast.error('حدث خطأ في تحميل البيانات')
      } finally {
        setInitialLoad(false)
      }
    }
    
    loadData()
  }, [])


  const loadTeacherData = async () => {
    try {
      setLoading({ courses: true, profile: true })

      // Load user email from auth profile
      try {
        const authResponse = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (authResponse.ok) {
          const authData = await authResponse.json();
          setUserEmail(authData.email || '');
        }
      } catch (error) {
        logger.error('Error loading user email:', error);
      }

      // Get teacher ID from user or profile
      const teacherId = (user as any)?.id || (user as any)?.pk || (user as any)?.user_id
      
      const [coursesResponse, recordedCoursesResponse, statsResponse] = await Promise.all([
        liveEducationApi.courses.list(teacherId ? { teacher: Number(teacherId) } : {}).catch((err) => {
          logger.error('❌ Error loading teacher courses:', err)
          return { results: [] }
        }),
        recordedCoursesApi.list({ ordering: '-created_at' }).catch((err) => {
          logger.error('❌ Error loading recorded courses:', err)
          return { results: [], count: 0 }
        }),
        apiClient.getTeacherStats().catch(() => ({
          success: true,
          data: {
            total_courses: 0,
            total_students: 0,
            average_rating: 4.5,
          },
        })),
      ])

      // Debug: Log the courses response
      logger.log('📚 Live courses response:', coursesResponse)

      // Handle courses data from Live Courses API
      let coursesData: Course[] = []
      const cr = coursesResponse as any
      
      // Handle paginated response from liveEducationApi
      if (cr?.results && Array.isArray(cr.results)) {
        coursesData = cr.results
        logger.log('✅ Using results array:', coursesData.length, 'courses')
      } else if (Array.isArray(cr)) {
        coursesData = cr
        logger.log('✅ Using direct array:', coursesData.length, 'courses')
      } else if (cr?.data?.results) {
        coursesData = cr.data.results
        logger.log('✅ Using data.results:', coursesData.length, 'courses')
      } else if (Array.isArray(cr?.data)) {
        coursesData = cr.data
        logger.log('✅ Using data array:', coursesData.length, 'courses')
      } else {
        logger.log('❌ No courses data found in response')
      }

      // Transform live courses to match the Course interface
      const liveCourses = coursesData.map((course: any) => {
        logger.log('📊 Processing course:', course.title, {
          total_students: course.total_students,
          batches_count: course.batches_count,
          lessons: course.lessons,
          enrolled_count: course.enrolled_count,
          thumbnail: course.thumbnail
        })
        
        return {
          ...course,
          learning_path: 'live_education',
          is_approved: course.approval_status === 'approved',
          approval_status: course.approval_status || 'pending',
          approval_status_display: course.approval_status_display || 'قيد المراجعة',
          enrollment_count: course.enrolled_count || course.total_students || '0',
          enrolled_count: course.enrolled_count || course.total_students || '0',
          total_students: course.total_students || course.enrolled_count || '0',
          max_students: course.max_students || '1',
          // Don't set lessons_count here - it will be fetched later for each course individually
          lessons_count: undefined,
          lessons: undefined,
          status: course.approval_status === 'approved' ? 'published' : 'pending_review',
          source: 'live_education' as const,
          course_type: course.course_type || 'group_public',
          course_type_display: 'دورات مباشرة',
          thumbnail: course.thumbnail || course.thumbnail_url,
          cover_image: course.cover_image || course.cover_image_url,
          // Duration from start_date and end_date if available
          duration_weeks: course.start_date && course.end_date 
            ? Math.ceil((new Date(course.end_date).getTime() - new Date(course.start_date).getTime()) / (1000 * 60 * 60 * 24 * 7))
            : undefined
        }
      })

      // Handle recorded courses
      const recordedCoursesData = (recordedCoursesResponse as any)?.results || []
      const recordedCourses = recordedCoursesData.map((course: any) => ({
        ...course,
        id: course.id,
        title: course.title,
        description: course.description,
        learning_outcomes: course.learning_outcomes,
        topics: course.topics,
        teacher: course.teacher,
        teacher_name: course.teacher_name,
        teacher_email: course.teacher_email,
        approval_status: course.status || course.approval_status || 'pending',
        approval_status_display: course.approval_status_display || (course.status === 'approved' ? 'معتمدة' : course.status === 'rejected' ? 'مرفوضة' : 'قيد المراجعة'),
        price: course.price,
        final_price: course.final_price,
        start_date: course.start_date,
        end_date: course.end_date,
        accepting_applications: course.accepting_applications,
        is_hidden: course.is_hidden,
        units_count: course.units_count || '0',
        total_lessons: course.total_lessons || '0',
        created_at: course.created_at,
        updated_at: course.updated_at,
        learning_path: 'recorded' as const,
        is_approved: course.status === 'approved',
        status: course.status === 'approved' ? 'published' : 'pending_review',
        source: 'recorded' as const,
        course_type: 'recorded' as const,
        course_type_display: 'دورة مسجلة',
        is_published: course.status === 'approved' && !course.is_hidden,
        enrollment_count: '0',
        enrolled_count: '0',
        total_students: '0',
        lessons: [],
        lessons_count: typeof course.total_lessons === 'string' 
          ? parseInt(course.total_lessons || '0', 10)
          : (course.total_lessons || 0),
        thumbnail: course.thumbnail || course.thumbnail_url,
        cover_image: course.cover_image || course.cover_image_url
      }))

      // Combine both types of courses
      let allCourses = [...liveCourses, ...recordedCourses]

      // Fetch additional data for each course (lessons, enrolled students, etc.)
      const enrichedCourses = await Promise.all(
        allCourses.map(async (course) => {
          // Create a new course object to avoid mutation issues
          const enrichedCourse = { ...course }
          
          try {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token')
            const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'
            
            if (enrichedCourse.source === 'live_education') {
              // Fetch lessons count for live courses - always fetch for accurate data
              // Use the same method as CourseDetailsModal (which works correctly)
              logger.log(`🔍 Fetching lessons for course ${enrichedCourse.id} (${enrichedCourse.title})`)
              try {
                // Use content API with unit__course filter (same as CourseDetailsModal)
                const lessonsUrl = `${API_BASE_URL}/content/lessons/?unit__course=${enrichedCourse.id}`
                logger.log(`📡 Fetching from: ${lessonsUrl}`)
                
                const lessonsResponse = await fetch(lessonsUrl, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                })
                
                logger.log(`📡 Lessons Response Status: ${lessonsResponse.status}`)
                
                if (lessonsResponse.ok) {
                  const lessonsData = await lessonsResponse.json()
                  const lessons = lessonsData.results || lessonsData || []
                  
                  // Always update with fresh data for this specific course
                  enrichedCourse.lessons_count = lessons.length
                  enrichedCourse.lessons = lessons
                  logger.log(`✅ Course ${enrichedCourse.id} (${enrichedCourse.title}): ${lessons.length} lessons`)
                } else {
                  const errorText = await lessonsResponse.text()
                  logger.error(`❌ Lessons API failed for course ${enrichedCourse.id}: ${lessonsResponse.status} - ${errorText}`)
                  // Reset to 0 if fetch fails
                  enrichedCourse.lessons_count = 0
                  enrichedCourse.lessons = []
                }
              } catch (error: any) {
                logger.error(`❌ Error fetching lessons for course ${enrichedCourse.id} (${enrichedCourse.title}):`, error?.message || error)
                // Set to 0 if fetch fails
                enrichedCourse.lessons_count = 0
                enrichedCourse.lessons = []
              }
              
              // Fetch enrolled students count - always fetch for accurate data
              try {
                const enrollmentsResponse = await fetch(
                  `${API_BASE_URL}/live-education/enrollments/?course=${enrichedCourse.id}`,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  }
                )
                
                if (enrollmentsResponse.ok) {
                  const enrollmentsData = await enrollmentsResponse.json()
                  const enrollments = enrollmentsData.results || enrollmentsData || []
                  // Always update with fresh data for this specific course
                  const enrollmentsCount = enrollments.length
                  enrichedCourse.enrolled_count = String(enrollmentsCount)
                  enrichedCourse.total_students = String(enrollmentsCount)
                  enrichedCourse.enrollment_count = String(enrollmentsCount)
                  logger.log(`✅ Course ${enrichedCourse.id} (${enrichedCourse.title}): ${enrollmentsCount} enrolled students`)
                } else {
                  logger.warn(`⚠️ Failed to fetch enrollments for course ${enrichedCourse.id}: ${enrollmentsResponse.status}`)
                }
              } catch (error) {
                logger.error(`Error fetching enrollments for course ${enrichedCourse.id}:`, error)
                // Keep existing value or set to '0' if not available
                if (!enrichedCourse.enrolled_count || enrichedCourse.enrolled_count === '0') {
                  enrichedCourse.enrolled_count = '0'
                  enrichedCourse.total_students = '0'
                  enrichedCourse.enrollment_count = '0'
                }
              }
            } else if (enrichedCourse.source === 'recorded') {
              // Fetch units and lessons for recorded courses
              try {
                const unitsResponse = await fetch(
                  `${API_BASE_URL}/recorded-courses/units/?course=${enrichedCourse.id}`,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  }
                )
                
                if (unitsResponse.ok) {
                  const unitsData = await unitsResponse.json()
                  const units = unitsData.results || unitsData || []
                  enrichedCourse.units_count = String(units.length)
                  
                  // Count total lessons and calculate total video duration from all units
                  let totalLessons = 0
                  let totalVideoDuration = 0 // Total duration in seconds
                  
                  for (const unit of units) {
                    try {
                      const unitDetailsResponse = await fetch(
                        `${API_BASE_URL}/recorded-courses/units/${unit.id}/`,
                        {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                        }
                      )
                      
                      if (unitDetailsResponse.ok) {
                        const unitDetails = await unitDetailsResponse.json()
                        const lessons = unitDetails.lessons || []
                        totalLessons += lessons.length
                        
                        // Sum video_duration from all lessons in this unit
                        lessons.forEach((lesson: any) => {
                          if (lesson.video_duration && typeof lesson.video_duration === 'number') {
                            totalVideoDuration += lesson.video_duration
                          }
                        })
                      }
                    } catch (error) {
                      logger.error(`Error fetching unit ${unit.id} details:`, error)
                    }
                  }
                  
                  enrichedCourse.total_lessons = String(totalLessons)
                  enrichedCourse.lessons_count = totalLessons
                  enrichedCourse.total_video_duration = totalVideoDuration // Store in seconds
                }
              } catch (error) {
                logger.error(`Error fetching units for course ${enrichedCourse.id}:`, error)
              }
              
              // Calculate duration from start_date and end_date if available
              if (enrichedCourse.start_date && enrichedCourse.end_date) {
                const startDate = new Date(enrichedCourse.start_date)
                const endDate = new Date(enrichedCourse.end_date)
                const weeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
                enrichedCourse.duration_weeks = weeks
              }
            }
          } catch (error) {
            logger.error(`Error enriching course ${enrichedCourse.id}:`, error)
          }
          
          // Log final course data to verify
          logger.log(`📊 Final enriched course ${enrichedCourse.id} (${enrichedCourse.title}):`, {
            lessons_count: enrichedCourse.lessons_count,
            lessons_length: enrichedCourse.lessons?.length,
            enrolled_count: enrichedCourse.enrolled_count,
            total_students: enrichedCourse.total_students,
            source: enrichedCourse.source
          })
          
          return enrichedCourse
        })
      )

      logger.log('📊 Final courses summary:')
      logger.log('📊 Total live courses:', liveCourses.length)
      logger.log('📊 Total recorded courses:', recordedCourses.length)
      logger.log('📊 Total courses:', enrichedCourses.length)
      logger.log('📊 All courses data:', enrichedCourses)
      
      // Log course approval statuses
      logger.log('📊 Course approval statuses:')
      enrichedCourses.forEach((course, index) => {
        logger.log(`📚 Course ${index + 1}: "${course.title}" (${course.source})`, {
          approval_status: course.approval_status,
          approval_status_display: course.approval_status_display,
          is_approved: course.is_approved,
          status: course.status,
          enrolled_count: course.enrolled_count,
          lessons_count: course.lessons_count,
          units_count: course.units_count,
          total_lessons: course.total_lessons
        });
      });
      
      setCourses(enrichedCourses)
      setAllCourses(enrichedCourses) // Store all courses for search functionality

      // Handle profile data
      const stats = (statsResponse as any)?.data || {}

      if (user) {
        setTeacherProfile({
          full_name: user?.full_name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "المعلم",
          specialization: (user as any)?.specialization,
          years_of_experience: (user as any)?.years_of_experience,
          bio: (user as any)?.bio || "يسعدنا وجودك في منصة رشد التعليمية. واصل تطوير رحلتك التعليمية وشارك خبراتك مع طلابك.",
          profile_image_url: (user as any)?.profile_image_url || null,
          average_rating: stats.average_rating || 4.5,
          total_students: stats.total_students || coursesData.reduce((acc, c) => acc + (c.enrollment_count || 0), 0),
          total_lessons: stats.total_lessons || coursesData.reduce((acc, c) => acc + (c.lessons_count || 0), 0),
          response_rate: stats.response_rate || 95,
          online_hours: stats.online_hours || 120,
        })
      }

      // Load profile image - using direct fetch like in profile
      try {
        const token = await getAuthToken()
        const imageResponse = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/image/urls/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        logger.log('🖼️ Dashboard teacher image response status:', imageResponse.status)
        
        if (imageResponse.ok) {
          const data = await imageResponse.json()
          logger.log('🖼️ Dashboard teacher image response data:', data)
          
          if (data.data?.profile_image_url) {
            const url = data.data.profile_image_url
            logger.log('🖼️ Dashboard teacher image URL found:', url)
            setProfileImage(url)
            // Update teacher profile with image
            setTeacherProfile(prev => ({
              ...prev,
              profile_image_url: url
            }))
          } else {
            logger.log('🖼️ Dashboard teacher no profile_image_url in response')
          }
        } else {
          logger.log('🖼️ Dashboard teacher image response not ok:', imageResponse.status, imageResponse.statusText)
        }
      } catch (error) {
        logger.log('🖼️ Dashboard teacher image loading error:', error)
        // Silent fail for image loading
      }

      setLastUpdated(new Date())

    } catch (error) {
      logger.error('Error loading teacher data:', error)
      toast.error("حدث خطأ في تحميل البيانات")
    } finally {
      setLoading({ courses: false, profile: false })
    }
  }

  // Notes functions
  const openNotesDialog = (course: Course) => {
    setSelectedCourse(course)
    setCourseNote('')
    setNotesDialog(true)
  }


  const saveNote = async () => {
    if (!selectedCourse || !courseNote.trim()) {
      toast.error('يرجى كتابة الملحوظة')
      return
    }

    setSavingNote(true)
    try {
      // Here you would save the note to your backend
      // await apiClient.post(`/courses/${selectedCourse.id}/notes/`, { note: courseNote })
      
      toast.success('تم حفظ الملحوظة بنجاح')
      setNotesDialog(false)
      setCourseNote('')
      setSelectedCourse(null)
    } catch (error) {
      logger.error('Error saving note:', error)
      toast.error('حدث خطأ في حفظ الملحوظة')
    } finally {
      setSavingNote(false)
    }
  }

  // Course details functions
  const openCourseDetailsDialog = async (course: Course) => {
    setCourseDetailsDialog(true)
    setCourseDetailsLoading(true)
    
    try {
      // Fetch detailed course information from API
      const response = await apiClient.get(`/live-education/courses/${course.id}/`)
      
      if (response && response.data) {
        setSelectedCourseForDetails(response.data)
        logger.log('Course details loaded:', response.data)
      } else {
        // Fallback to basic course data if API fails
        setSelectedCourseForDetails(course)
        toast.error('تعذر تحميل تفاصيل الدورة الكاملة')
      }
    } catch (error) {
      logger.error('Error fetching course details:', error)
      // Fallback to basic course data
      setSelectedCourseForDetails(course)
      toast.error('تعذر تحميل تفاصيل الدورة')
    } finally {
      setCourseDetailsLoading(false)
    }
  }


  const handleSupervisorEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value.trim().toLowerCase();
    setNewSupervisorRequest({ ...newSupervisorRequest, general_supervisor_email: email });
    
    if (currentSupervisorEmail && email === currentSupervisorEmail.toLowerCase()) {
      setSupervisorEmailError('لا يمكنك إرسال طلب لنفس المشرف العام الحالي');
    } else if (supervisorEmails.includes(email)) {
      setSupervisorEmailError('أنت بالفعل تحت إشراف هذا المشرف أو لديك طلب معلق معه');
    } else {
      setSupervisorEmailError('');
    }
  };

  const resetSupervisorRequestError = () => {
    setRequestError('');
    setRequestSuccess(false);
    setSupervisorEmailError('');
  };

  const handleSupervisorRequestSubmit = async (e?: React.FormEvent) => {
    const email = newSupervisorRequest.general_supervisor_email.trim().toLowerCase();
    
    if (currentSupervisorEmail && email === currentSupervisorEmail.toLowerCase()) {
      setSupervisorEmailError('لا يمكنك إرسال طلب لنفس المشرف العام الحالي');
      return;
    }
    
    if (supervisorEmails.includes(email)) {
      setSupervisorEmailError('أنت بالفعل تحت إشراف هذا المشرف أو لديك طلب معلق معه');
      return;
    }
    setSupervisorEmailError('');
    setIsSubmittingRequest(true)
    setRequestError('')
    setRequestSuccess(false)

    try {
      logger.log('جاري إرسال الطلب إلى API...')
      const response = await teachersApi.joinGeneralSupervisor(newSupervisorRequest)
      logger.log('استجابة API:', response)
      
      setRequestSuccess(true)
      toast.success('تم إرسال طلب الانضمام بنجاح!')
      
      // Reset form
      setNewSupervisorRequest({
        general_supervisor_email: '',
        request_message: ''
      })
      
      logger.log('تم إرسال الطلب بنجاح وإعادة تعيين النموذج')
    } catch (error: any) {
      logger.error('خطأ في إرسال طلب المشرف:', error)
      logger.error('تفاصيل الخطأ:', error.data || error.response?.data || error.message)
      logger.error('كود الخطأ:', error.status || error.response?.status)
      
      let errorMessage = 'حدث خطأ أثناء إرسال الطلب'
      
      // معالجة أخطاء محددة
      if (error.status === 400 || error.response?.status === 400) {
        const errorData = error.data || error.response?.data
        
        // التحقق من errors object
        if (errorData?.errors) {
          if (errorData.errors.general_supervisor_email) {
            // أخذ الرسالة الأولى من المصفوفة
            const emailError = Array.isArray(errorData.errors.general_supervisor_email) 
              ? errorData.errors.general_supervisor_email[0]
              : errorData.errors.general_supervisor_email
            
            // ترجمة الرسائل الشائعة
            if (emailError.includes('No General Supervisor found with this email address')) {
              errorMessage = 'لا يوجد مشرف عام بهذا البريد الإلكتروني. يرجى التحقق من البريد والمحاولة مرة أخرى'
            } else if (emailError.includes('General Supervisor not found')) {
              errorMessage = 'المشرف العام غير موجود'
            } else if (emailError.includes('Invalid email')) {
              errorMessage = 'البريد الإلكتروني غير صحيح'
            } else {
              errorMessage = emailError
            }
          } else if (errorData.errors.request_message) {
            const messageError = Array.isArray(errorData.errors.request_message)
              ? errorData.errors.request_message[0]
              : errorData.errors.request_message
            
            // ترجمة رسائل الطلب
            if (messageError.includes('This field is required')) {
              errorMessage = 'هذا الحقل مطلوب'
            } else if (messageError.includes('Message is required')) {
              errorMessage = 'الرسالة مطلوبة'
            } else {
              errorMessage = messageError
            }
          } else {
            errorMessage = errorData.message || 'البيانات المرسلة غير صحيحة'
          }
        } else if (errorData?.general_supervisor_email) {
          errorMessage = 'البريد الإلكتروني غير صحيح أو غير موجود'
        } else if (errorData?.request_message) {
          errorMessage = 'الرسالة مطلوبة'
        } else if (errorData?.detail) {
          errorMessage = errorData.detail
        } else if (errorData?.message) {
          errorMessage = errorData.message
        } else {
          errorMessage = 'البيانات المرسلة غير صحيحة. يرجى التحقق من البريد الإلكتروني والرسالة'
        }
      } else if (error.status === 401 || error.response?.status === 401) {
        errorMessage = 'يجب تسجيل الدخول أولاً'
      } else if (error.status === 403 || error.response?.status === 403) {
        errorMessage = 'ليس لديك صلاحية لإرسال هذا الطلب'
      } else if (error.status === 409 || error.response?.status === 409) {
        errorMessage = 'لديك طلب معلق بالفعل مع هذا المشرف'
      } else if ((error.status && error.status >= 500) || (error.response?.status && error.response.status >= 500)) {
        errorMessage = 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setRequestError(errorMessage)
      toast.error(`فشل في إرسال طلب الانضمام: ${errorMessage}`)
    } finally {
      setIsSubmittingRequest(false)
      logger.log('انتهت عملية إرسال الطلب')
    }
  }
  const handleAddAnnouncement = (course: Course) => {
    setSelectedCourseForAnnouncement(course)
    setAnnouncementDialogOpen(true)
  }

  const handleDeleteCourse = async (course: Course) => {
    try {
      logger.log('🗑️ Attempting to delete course:', course.id);
      
      // Show confirmation dialog
      const confirmed = window.confirm(
        `هل أنت متأكد من حذف الدورة "${course.title}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`
      );
      
      if (!confirmed) {
        logger.log('❌ Course deletion cancelled by user');
        return;
      }

      // Call delete API
      const result = await teachersApi.deleteCourse(course.id);
      
      if (result.success) {
        toast.success(result.message || 'تم حذف الدورة بنجاح');
        
        // Remove course from local state
        setCourses(prevCourses => prevCourses.filter(c => c.id !== course.id));
        
        logger.log('✅ Course deleted successfully');
      }
    } catch (error: any) {
      logger.error('❌ Error deleting course:', error);
      toast.error(error.message || 'حدث خطأ في حذف الدورة');
    }
  }

  const handleCreateBatch = (course: Course) => {
    setSelectedCourseForBatch(course)
    setNewBatch({
      name: '',
      type: 'group',
      status: 'active',
      max_students: 200
    })
    setBatchDialogOpen(true)
  }

  const handleSubmitBatch = async () => {
    if (!selectedCourseForBatch || !newBatch.name) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      setCreatingBatch(true)
      
      const batchData = {
        course: selectedCourseForBatch.id,
        name: newBatch.name,
        type: newBatch.type,
        status: newBatch.status,
        max_students: newBatch.type === 'individual' ? 1 : newBatch.max_students
      }
      
      logger.log('📤 Creating batch with data:', batchData)
      logger.log('📤 Course ID:', selectedCourseForBatch.id)
      logger.log('📤 Course title:', selectedCourseForBatch.title)
      
      const response = await liveEducationApi.batches.create(batchData)

      logger.log('📦 Batch creation response:', response.status, response.ok)
      
      if (response.ok) {
        const responseData = await response.json().catch(() => ({}))
        logger.log('✅ Batch created successfully:', responseData)
        
        toast.success('تم إنشاء المجموعة بنجاح')
        setBatchDialogOpen(false)
        setSelectedCourseForBatch(null)
        setNewBatch({
          name: '',
          type: 'group',
          status: 'active',
          max_students: 200
        })
        
        // Trigger refresh by updating key
        logger.log('🔄 Triggering refresh by updating key')
        setBatchesRefreshKey(prev => prev + 1)
        
        // Also trigger event for BatchesTab component
        window.dispatchEvent(new CustomEvent('refreshBatches'))
        
        // Switch to batches tab to show the new batch
        setTimeout(() => {
          setActiveTab('batches')
        }, 500)
      } else {
        const errorData = await response.json().catch(() => ({}))
        logger.error('❌ Batch creation error:', errorData)
        toast.error(errorData.message || errorData.detail || 'حدث خطأ في إنشاء المجموعة')
      }
    } catch (error) {
      logger.error('Error creating batch:', error)
      toast.error('حدث خطأ في إنشاء المجموعة')
    } finally {
      setCreatingBatch(false)
    }
  }

  const [studentsStats, setStudentsStats] = useState({
    individual: 0,
    group: 0
  });

  // Fetch students count from batches
  useEffect(() => {
    const fetchStudentsStats = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) return;

        const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
        
        // Get all batches for teacher's courses
        const batchesResponse = await fetch(
          `${API_BASE_URL}/batches/batches/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (batchesResponse.ok) {
          const batchesData = await batchesResponse.json();
          const batches = batchesData.results || batchesData || [];
          
          // Calculate individual students count
          const individualCount = batches
            .filter((batch: any) => batch.type === 'individual')
            .reduce((sum: number, batch: any) => {
              const count = typeof batch.students_count === 'string' 
                ? parseInt(batch.students_count || '0', 10)
                : (batch.students_count || 0);
              return sum + count;
            }, 0);
          
          // Calculate group students count
          const groupCount = batches
            .filter((batch: any) => batch.type === 'group')
            .reduce((sum: number, batch: any) => {
              const count = typeof batch.students_count === 'string' 
                ? parseInt(batch.students_count || '0', 10)
                : (batch.students_count || 0);
              return sum + count;
            }, 0);
          
          setStudentsStats({
            individual: individualCount,
            group: groupCount
          });
        }
      } catch (error) {
        logger.error('Error fetching students stats:', error);
      }
    };

    if (courses.length > 0) {
      fetchStudentsStats();
    }
  }, [courses]);

  const statCards = useMemo(() => {
    // Calculate live courses count
    const liveCoursesCount = courses.filter(
      c => c.learning_path === 'live_education' || c.course_type === 'group_public' || c.course_type === 'group_private'
    ).length;
    
    // Calculate recorded courses count
    const recordedCoursesCount = courses.filter(
      c => c.learning_path !== 'live_education' && c.course_type !== 'group_public' && c.course_type !== 'group_private'
    ).length;
    
    return [
      {
        label: 'عدد الدورات المباشرة',
        value: liveCoursesCount,
        icon: Users,
      },
      {
        label: 'عدد الدورات المسجلة',
        value: recordedCoursesCount,
        icon: BookOpen,
      },
      {
        label: 'الطلاب في المجموعات الفردية',
        value: studentsStats.individual,
        icon: GraduationCap,
      },
      {
        label: 'الطلاب في المجموعات الجماعية',
        value: studentsStats.group,
        icon: Users,
      },
    ];
  }, [courses, studentsStats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20 md:pt-24 lg:pt-28" dir="rtl">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 top-20 md:top-24 lg:top-28">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-200/20 dark:from-amber-900/10 dark:to-orange-900/10 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-200/20 dark:from-green-900/10 dark:to-emerald-900/10 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-blue-200/15 to-cyan-200/15 dark:from-blue-900/8 dark:to-cyan-900/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        ></motion.div>
      </div>

        <div className="relative z-10 mx-auto px-4 py-6 md:py-8 max-w-[1400px] 2xl:max-w-[1600px]">
          {/* Enhanced Teacher Header Component */}
          {initialLoad && loading.profile ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 md:mb-8 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 dark:from-amber-600 dark:via-orange-700 dark:to-amber-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl shadow-orange-500/20 dark:shadow-orange-900/40 relative overflow-hidden"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/30" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 md:h-8 w-48 md:w-64 bg-white/30 rounded-lg" />
                    <Skeleton className="h-4 w-32 md:w-48 bg-white/20 rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20 md:h-24 bg-white/30 rounded-xl" />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: refreshSuccess ? [1, 1.02, 1] : 1
              }}
              transition={{ 
                duration: 0.5,
                scale: refreshSuccess ? { duration: 0.3 } : undefined
              }}
              className="mb-6 md:mb-8 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 dark:from-amber-600 dark:via-orange-700 dark:to-amber-800 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-2xl shadow-orange-500/20 dark:shadow-orange-900/40 relative overflow-hidden"
            >
              {/* Decorative Elements */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl"
              ></motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-amber-300/30 dark:from-amber-900/30 to-transparent rounded-full blur-2xl"
              ></motion.div>

            <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="flex-shrink-0 rounded-2xl bg-white/20 p-4"
                >
                  <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-white" />

                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex-1 min-w-0"
                >
                  <h1 className="text-2xl md:text-3xl font-bold">

                    مرحبًا، {teacherProfile?.full_name || 'معلمنا الكريم'}!

                  </h1>

                  <p className="text-amber-50 dark:text-amber-100 text-sm md:text-base leading-relaxed">

                    {teacherProfile?.bio || 'يسعدنا وجودك في منصة رشد التعليمية. واصل تطوير رحلتك التعليمية وشارك خبراتك مع طلابك.'}

                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 md:gap-2"
              >
                <Link href="/create-course/live">
                  <Button className="bg-white/30 border-white/40 text-white hover:bg-white/40 backdrop-blur-md h-10 px-3 md:px-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-xs md:text-sm whitespace-nowrap">
                    <FileText className="w-4 h-4" />
                    <span>إنشاء دورة مباشرة</span>
                  </Button>
                </Link>
                <Link href="/create-course/recorded">
                  <Button className="bg-white/30 border-white/40 text-white hover:bg-white/40 backdrop-blur-md h-10 px-3 md:px-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-xs md:text-sm whitespace-nowrap">
                    <BookOpen className="w-4 h-4" />
                    <span>إنشاء دورة مسجلة</span>
                  </Button>
                </Link>
                <Link href="/create-course/interactive-game">
                  <Button className="bg-white/30 border-white/40 text-white hover:bg-white/40 backdrop-blur-md h-10 px-3 md:px-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-xs md:text-sm whitespace-nowrap">
                    <Gamepad2 className="w-4 h-4" />
                    <span>إنشاء لعبة تفاعلية</span>
                  </Button>
                </Link>
                <Link href="/knowledge-lab/create">
                  <Button className="bg-white/30 border-white/40 text-white hover:bg-white/40 backdrop-blur-md h-10 px-3 md:px-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-xs md:text-sm whitespace-nowrap">
                    <Users className="w-4 h-4" />
                    <span>إنشاء مختبر معرفة جديد</span>
                  </Button>
                </Link>
              </motion.div>
            </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
                {statCards.map(({ label, value, icon: Icon }, idx) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/30 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-amber-50 dark:text-amber-100 text-xs md:text-sm font-medium mb-1 md:mb-2 truncate">{label}</p>
                        {loading.profile && initialLoad ? (
                          <Skeleton className="h-6 md:h-8 w-12 bg-white/30 rounded-lg" />
                        ) : (
                          <motion.p
                            key={value}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="text-xl md:text-2xl font-bold text-white"
                          >
                            {value}
                          </motion.p>
                        )}
                      </div>
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="flex-shrink-0 rounded-lg bg-white/20 group-hover:bg-white/30 p-2 md:p-2.5 transition-colors"
                      >
                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/20 overflow-hidden"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
              <TeacherTabs activeTab={activeTab} setActiveTab={setActiveTab} />

              {/* Recorded Courses Tab */}
              <TabsContent value="recorded-courses" className="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8" dir="rtl">
                {/* Search Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl md:rounded-2xl border border-purple-200 dark:border-purple-700/50 p-4 md:p-6 shadow-sm"
                  dir="rtl"
                >
                  <div className="text-center mb-4 md:mb-6">
                    <h3 className="text-base md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 md:mb-2">استكشف الدورات المسجلة</h3>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">ابحث بسرعة عن الدورات المسجلة أو صفّها باستخدام الكلمات المفتاحية.</p>
                  </div>
                  
                  <div className="max-w-2xl mx-auto">
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400" />
                      
                      <Input
                        type="text"
                        placeholder="استعرض الدورات المسجلة أو ابحث عنها..."
                        value={searchQuery}
                        onChange={(e) => {
                          const query = e.target.value;
                          setSearchQuery(query);
                          
                          if (query.trim()) {
                            const filtered = allCourses.filter(course => 
                              (course.source === 'recorded' || course.learning_path === 'recorded') &&
                              (course.title.toLowerCase().includes(query.toLowerCase()) ||
                              course.description?.toLowerCase().includes(query.toLowerCase()) ||
                              course.course_type_display?.toLowerCase().includes(query.toLowerCase()))
                            );
                            setCourses(filtered);
                          } else {
                            setCourses(allCourses.filter(c => c.source === 'recorded' || c.learning_path === 'recorded'));
                          }
                        }}
                        className="w-full h-10 md:h-12 pr-10 md:pr-12 pl-3 md:pl-4 text-xs md:text-sm border-2 border-purple-300 dark:border-purple-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 bg-white dark:bg-slate-800 shadow-sm"
                      />

                      {searchQuery && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSearchQuery("")
                            setCourses(allCourses.filter(c => c.source === 'recorded' || c.learning_path === 'recorded'))
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-1 h-6 w-6 md:h-8 md:w-8 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg"
                        >
                          <X className="w-3 h-3 md:w-4 md:h-4 text-purple-600 dark:text-purple-400" />
                        </Button>
                      )}
                    </div>

                    {searchQuery && (
                      <div className="mt-3 md:mt-4 text-center">
                        <p className="text-xs md:text-sm text-purple-700 dark:text-purple-300">
                          عدد النتائج: {courses.filter(c => c.source === 'recorded' || c.learning_path === 'recorded').length} دورة
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Courses Grid or Empty State */}
                {loading.courses && initialLoad ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                          <Skeleton className="h-40 bg-slate-200 dark:bg-slate-700" />
                          <div className="p-4 md:p-5 space-y-3">
                            <Skeleton className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                            <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                            <Skeleton className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="flex gap-2 mt-4">
                              <Skeleton className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                              <Skeleton className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : courses.filter(c => c.source === 'recorded' || c.learning_path === 'recorded').length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-16 md:py-20 bg-white dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-800/50 dark:to-purple-900/10 backdrop-blur-sm p-12 md:p-16">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg border border-purple-200/50 dark:border-purple-700/50"
                      >
                        <motion.div
                          animate={{ 
                            y: [0, -5, 0],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-purple-400 dark:text-purple-500" />
                        </motion.div>
                      </motion.div>
                      
                      <motion.h3 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-300 mb-2"
                      >
                        لا توجد دورات مسجلة حاليًا
                      </motion.h3>

                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-500 dark:text-slate-400 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base px-4"
                      >
                        ابدأ بإضافة دوراتك المسجلة الأولى واستفد من أدوات المنصة المتكاملة.
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Link href="/create-course/form">
                          <Button className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 md:px-8 lg:px-10 py-2.5 md:py-3 rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs md:text-sm lg:text-base font-medium">
                            <Plus className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                            إنشاء دورة مسجلة جديدة
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6"
                  >
                    {courses.filter(c => c.source === 'recorded' || c.learning_path === 'recorded').map((course, idx) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.1, 0.3) }}
                      >
                        <CourseCard
                          course={course}
                          onViewDetails={openCourseDetailsDialog}
                          onAddNote={openNotesDialog}
                          onAddAnnouncement={handleAddAnnouncement}
                          onDeleteCourse={handleDeleteCourse}
                          onEditRequest={() => {}}
                          onCreateBatch={handleCreateBatch}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>

              {/* Live Courses Tab */}
              <TabsContent value="live-courses" className="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8" dir="rtl">
                {/* Search Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl md:rounded-2xl border border-green-200 dark:border-green-700/50 p-4 md:p-6 shadow-sm"
                  dir="rtl"
                >
                  <div className="text-center mb-4 md:mb-6">
                    <h3 className="text-base md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 md:mb-2">استكشف الدورات المباشرة</h3>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">ابحث بسرعة عن الدورات المباشرة أو صفّها باستخدام الكلمات المفتاحية.</p>
                  </div>
                  
                  <div className="max-w-2xl mx-auto">
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                      
                      <Input
                        type="text"
                        placeholder="استعرض الدورات المباشرة أو ابحث عنها..."
                        value={searchQuery}
                        onChange={(e) => {
                          const query = e.target.value;
                          setSearchQuery(query);
                          
                          if (query.trim()) {
                            const filtered = allCourses.filter(course => 
                              (course.source === 'live_education' || course.learning_path === 'live_education') &&
                              (course.title.toLowerCase().includes(query.toLowerCase()) ||
                              course.description?.toLowerCase().includes(query.toLowerCase()) ||
                              course.course_type_display?.toLowerCase().includes(query.toLowerCase()))
                            );
                            setCourses(filtered);
                          } else {
                            setCourses(allCourses.filter(c => c.source === 'live_education' || c.learning_path === 'live_education'));
                          }
                        }}
                        className="w-full h-10 md:h-12 pr-10 md:pr-12 pl-3 md:pl-4 text-xs md:text-sm border-2 border-green-300 dark:border-green-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 bg-white dark:bg-slate-800 shadow-sm"
                      />

                      {searchQuery && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSearchQuery("")
                            setCourses(allCourses.filter(c => c.source === 'live_education' || c.learning_path === 'live_education'))
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-1 h-6 w-6 md:h-8 md:w-8 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg"
                        >
                          <X className="w-3 h-3 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
                        </Button>
                      )}
                    </div>

                    {searchQuery && (
                      <div className="mt-3 md:mt-4 text-center">
                        <p className="text-xs md:text-sm text-green-700 dark:text-green-300">
                          عدد النتائج: {courses.filter(c => c.source === 'live_education' || c.learning_path === 'live_education').length} دورة
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Courses Grid or Empty State */}
                {loading.courses && initialLoad ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                          <Skeleton className="h-40 bg-slate-200 dark:bg-slate-700" />
                          <div className="p-4 md:p-5 space-y-3">
                            <Skeleton className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                            <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                            <Skeleton className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="flex gap-2 mt-4">
                              <Skeleton className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                              <Skeleton className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : courses.filter(c => c.source === 'live_education' || c.learning_path === 'live_education').length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-16 md:py-20 bg-white dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-slate-50 to-green-50/30 dark:from-slate-800/50 dark:to-green-900/10 backdrop-blur-sm p-12 md:p-16">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg border border-green-200/50 dark:border-green-700/50"
                      >
                        <motion.div
                          animate={{ 
                            y: [0, -5, 0],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-green-400 dark:text-green-500" />
                        </motion.div>
                      </motion.div>
                      
                      <motion.h3 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-300 mb-2"
                      >
                        لا توجد دورات مباشرة حاليًا
                      </motion.h3>

                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-500 dark:text-slate-400 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base px-4"
                      >
                        ابدأ بإضافة دوراتك المباشرة الأولى واستفد من أدوات المنصة المتكاملة.
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Link href="/knowledge-lab/create">
                          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 md:px-8 lg:px-10 py-2.5 md:py-3 rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs md:text-sm lg:text-base font-medium">
                            <Plus className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                            إنشاء مختبر معرفة جديد
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6"
                  >
                    {courses.filter(c => c.source === 'live_education' || c.learning_path === 'live_education').map((course, idx) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.1, 0.3) }}
                      >
                        <CourseCard
                          course={course}
                          onViewDetails={openCourseDetailsDialog}
                          onAddNote={openNotesDialog}
                          onAddAnnouncement={handleAddAnnouncement}
                          onDeleteCourse={handleDeleteCourse}
                          onEditRequest={() => {}}
                          onCreateBatch={handleCreateBatch}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>

              {/* Courses Tab - Old (Keep for backward compatibility) */}
              <TabsContent value="courses" className="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8">
                {/* Search Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl md:rounded-2xl border border-amber-200 dark:border-amber-700/50 p-4 md:p-6 shadow-sm"
                >
                  <div className="text-center mb-4 md:mb-6">
                    <h3 className="text-base md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 md:mb-2">استكشف دوراتك</h3>

                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">ابحث بسرعة عن دوراتك أو صفّها باستخدام الكلمات المفتاحية.</p>

                  </div>
                  
                  <div className="max-w-2xl mx-auto">
                    <div className="relative">
                      <BookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 w-4 h-4 md:w-5 md:h-5 text-amber-600 dark:text-amber-400" />
                      
                      <Input
                        type="text"
                        placeholder="استعرض الدورات أو ابحث عنها..."

                        value={searchQuery}
                        onChange={(e) => {
                          const query = e.target.value;
                          setSearchQuery(query);
                          
                          if (query.trim()) {
                            const filtered = allCourses.filter(course => 
                              course.title.toLowerCase().includes(query.toLowerCase()) ||
                              course.description?.toLowerCase().includes(query.toLowerCase()) ||
                              course.course_type_display?.toLowerCase().includes(query.toLowerCase())
                            );
                            setCourses(filtered);
                          } else {
                            setCourses(allCourses);
                          }
                        }}
                        className="w-full h-10 md:h-12 pl-10 md:pl-12 pr-3 md:pr-4 text-xs md:text-sm border-2 border-amber-300 dark:border-amber-600 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 bg-white dark:bg-slate-800 shadow-sm"
                      />

                      {searchQuery && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSearchQuery("")
                            setCourses(allCourses)
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-1 h-6 w-6 md:h-8 md:w-8 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg"
                        >
                          <X className="w-3 h-3 md:w-4 md:h-4 text-amber-600 dark:text-amber-400" />
                        </Button>
                      )}
                    </div>

                    {searchQuery && (
                      <div className="mt-3 md:mt-4 text-center">
                        <p className="text-xs md:text-sm text-amber-700 dark:text-amber-300">
                          عدد النتائج: {courses.length} دورة
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Courses Grid or Empty State */}
                {loading.courses && initialLoad ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                          <Skeleton className="h-40 bg-slate-200 dark:bg-slate-700" />
                          <div className="p-4 md:p-5 space-y-3">
                            <Skeleton className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                            <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                            <Skeleton className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="flex gap-2 mt-4">
                              <Skeleton className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                              <Skeleton className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : courses.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-16 md:py-20 bg-white dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-800/50 dark:to-purple-900/10 backdrop-blur-sm p-12 md:p-16">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg border border-amber-200/50 dark:border-amber-700/50"
                      >
                        <motion.div
                          animate={{ 
                            y: [0, -5, 0],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-amber-400 dark:text-amber-500" />
                        </motion.div>
                      </motion.div>
                      
                      <motion.h3 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-300 mb-2"
                      >
                        لا توجد دورات متاحة حاليًا
                      </motion.h3>

                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-500 dark:text-slate-400 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base px-4"
                      >
                        ابدأ بإضافة دوراتك الأولى واستفد من أدوات المنصة المتكاملة.
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Link href="/create-course/form">
                          <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 md:px-8 lg:px-10 py-2.5 md:py-3 rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs md:text-sm lg:text-base font-medium">
                            <Plus className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                            إنشاء دورة جديدة
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6"
                  >
                    {courses.map((course, idx) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.1, 0.3) }}
                      >
                        <CourseCard
                          course={course}
                          onViewDetails={openCourseDetailsDialog}
                          onAddNote={openNotesDialog}
                          onAddAnnouncement={handleAddAnnouncement}
                          onDeleteCourse={handleDeleteCourse}
                          onEditRequest={() => {}}
                          onCreateBatch={handleCreateBatch}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>

              {/* Interactive Games Tab */}
              <TabsContent value="interactive-games" className="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8" dir="rtl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ألعابي التفاعلية</h2>
                    <Link href="/create-course/interactive-game">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 ml-2" />
                        إنشاء لعبة تفاعلية
                      </Button>
                    </Link>
                  </div>

                  {loadingGames ? (
                    <div className="text-center py-12">
                      <Spinner className="w-8 h-8 mx-auto mb-4" />
                      <p className="text-gray-600">جاري التحميل...</p>
                    </div>
                  ) : interactiveGames.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl">
                      <Gamepad2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                        لا توجد ألعاب تفاعلية
                      </h3>
                      <p className="text-gray-500 mb-6">ابدأ بإنشاء لعبة تفاعلية جديدة</p>
                      <Link href="/create-course/interactive-game">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Plus className="w-4 h-4 ml-2" />
                          إنشاء لعبة تفاعلية
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {interactiveGames.map((game) => (
                        <Card key={game.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <CardTitle className="flex items-start justify-between gap-2">
                              <span className="flex-1">{game.title}</span>
                              <Badge variant={
                                game.status === 'approved' ? 'default' :
                                game.status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {game.approval_status_display}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{game.description}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                              <Users className="w-4 h-4" />
                              <span>{game.play_count} لاعب</span>
                              {game.average_score !== null && (
                                <>
                                  <Trophy className="w-4 h-4 ml-2" />
                                  <span>متوسط: {game.average_score.toFixed(1)}</span>
                                </>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                <Eye className="w-4 h-4 ml-2" />
                                عرض
                              </Button>
                              {game.status === 'rejected' && (
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Edit className="w-4 h-4 ml-2" />
                                  تعديل
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* Knowledge Labs Tab */}
              <TabsContent value="knowledge-labs" className="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8" dir="rtl">
                {/* Search Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl md:rounded-2xl border border-yellow-200 dark:border-yellow-700/50 p-4 md:p-6 shadow-sm"
                  dir="rtl"
                >
                  <div className="text-center mb-4 md:mb-6">
                    <h3 className="text-base md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 md:mb-2">استكشف مختبرات المعرفة</h3>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">ابحث بسرعة عن مختبرات المعرفة أو صفّها باستخدام الكلمات المفتاحية.</p>
                  </div>
                  
                  <div className="max-w-2xl mx-auto">
                    <div className="relative">
                      <FlaskConical className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 w-4 h-4 md:w-5 md:h-5 text-yellow-600 dark:text-yellow-400" />
                      
                      <Input
                        type="text"
                        placeholder="استعرض مختبرات المعرفة أو ابحث عنها..."
                        value={labSearchQuery}
                        onChange={(e) => {
                          const query = e.target.value;
                          setLabSearchQuery(query);
                        }}
                        className="w-full h-10 md:h-12 pr-10 md:pr-12 pl-3 md:pl-4 text-xs md:text-sm border-2 border-yellow-300 dark:border-yellow-600 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-800 bg-white dark:bg-slate-800 shadow-sm"
                      />

                      {labSearchQuery && (
                        <Button
                          size="sm"
                          onClick={() => setLabSearchQuery("")}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-1 h-6 w-6 md:h-8 md:w-8 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-lg"
                        >
                          <X className="w-3 h-3 md:w-4 md:h-4 text-yellow-600 dark:text-yellow-400" />
                        </Button>
                      )}
                    </div>

                    {labSearchQuery && (
                      <div className="mt-3 md:mt-4 text-center">
                        <p className="text-xs md:text-sm text-yellow-700 dark:text-yellow-300">
                          عدد النتائج: {knowledgeLabs.filter(lab => 
                            lab.title?.toLowerCase().includes(labSearchQuery.toLowerCase()) ||
                            lab.description?.toLowerCase().includes(labSearchQuery.toLowerCase())
                          ).length} مختبر
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Knowledge Labs Grid or Empty State */}
                {loadingLabs ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                          <Skeleton className="h-40 bg-slate-200 dark:bg-slate-700" />
                          <div className="p-4 md:p-5 space-y-3">
                            <Skeleton className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                            <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                            <Skeleton className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="flex gap-2 mt-4">
                              <Skeleton className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                              <Skeleton className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : knowledgeLabs.filter(lab => 
                  !labSearchQuery || 
                  lab.title?.toLowerCase().includes(labSearchQuery.toLowerCase()) ||
                  lab.description?.toLowerCase().includes(labSearchQuery.toLowerCase())
                ).length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-16 md:py-20 bg-white dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-slate-50 to-yellow-50/30 dark:from-slate-800/50 dark:to-yellow-900/10 backdrop-blur-sm p-12 md:p-16">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg border border-yellow-200/50 dark:border-yellow-700/50"
                      >
                        <motion.div
                          animate={{ 
                            y: [0, -5, 0],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <FlaskConical className="w-8 h-8 md:w-10 md:h-10 text-yellow-400 dark:text-yellow-500" />
                        </motion.div>
                      </motion.div>
                      
                      <motion.h3 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-300 mb-2"
                      >
                        لا توجد مختبرات معرفة حاليًا
                      </motion.h3>

                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-500 dark:text-slate-400 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base px-4"
                      >
                        لا توجد مختبرات معرفة متاحة حالياً.
                      </motion.p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6"
                  >
                    {knowledgeLabs.filter(lab => 
                      !labSearchQuery || 
                      lab.title?.toLowerCase().includes(labSearchQuery.toLowerCase()) ||
                      lab.description?.toLowerCase().includes(labSearchQuery.toLowerCase())
                    ).map((lab, idx) => (
                      <motion.div
                        key={lab.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.1, 0.3) }}
                        className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
                      >
                        {lab.thumbnail && (
                          <div className="h-40 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 overflow-hidden">
                            <img 
                              src={lab.thumbnail} 
                              alt={lab.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4 md:p-5">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                              {lab.title}
                            </h3>
                            <Badge 
                              className={`ml-2 ${
                                lab.status === 'approved' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : lab.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}
                            >
                              {lab.status_display || lab.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                            {lab.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                            <span className="flex items-center gap-1">
                              <FlaskConical className="w-4 h-4" />
                              {lab.questions_count || 0} سؤال
                            </span>
                            {lab.is_standalone && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {lab.final_price || lab.price || '0'} ر.س
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/knowledge-lab/${lab.id}/manage`} className="flex-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                              >
                                <Eye className="w-4 h-4 ml-2" />
                                إدارة
                              </Button>
                            </Link>
                            <Link href={`/knowledge-lab/${lab.id}/edit`} className="flex-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                              >
                                <Edit className="w-4 h-4 ml-2" />
                                تعديل
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>

              {/* Edit Requests Tab */}
              <TabsContent value="edit-requests" className="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8" dir="rtl">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <TeacherCourseEditRequests />
                </motion.div>
              </TabsContent>

              {/* Supervisors Tab */}
              <TabsContent value="supervisors" className="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <SupervisorTab
                    requestSuccess={requestSuccess}
                    submittingRequest={isSubmittingRequest}
                    joinRequest={{
                      supervisor_email: newSupervisorRequest.general_supervisor_email,
                      message: newSupervisorRequest.request_message
                    }}
                    onJoinRequestChange={(field, value) => {
                      if (field === 'supervisor_email') {
                        handleSupervisorEmailChange({ target: { value } } as any)
                      } else if (field === 'message') {
                        setNewSupervisorRequest(prev => ({ ...prev, request_message: value }))
                      }
                    }}
                    onSubmitRequest={handleSupervisorRequestSubmit}
                    supervisorEmailError={supervisorEmailError}
                    currentSupervisorEmail={currentSupervisorEmail}
                    requestError={requestError}
                    onResetError={resetSupervisorRequestError}
                  />
                </motion.div>
              </TabsContent>

            </Tabs>
          </motion.div>

          {/* Dialogs */}
          <NotesDialog
            open={notesDialog}
            onOpenChange={setNotesDialog}
            course={selectedCourse}
            note={courseNote}
            onNoteChange={setCourseNote}
            onSave={saveNote}
            saving={savingNote}
          />

          <CourseAnnouncementDialog
            open={announcementDialogOpen}
            onOpenChange={setAnnouncementDialogOpen}
            course={selectedCourseForAnnouncement}
          />

          {/* Batch Creation Dialog */}
          <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
            <DialogContent className="sm:max-w-[500px] bg-white !bg-white dark:bg-slate-900 !dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
              <DialogHeader className="bg-white !bg-white dark:bg-slate-900 !dark:bg-slate-900">
                <DialogTitle className="text-gray-900 dark:text-white">
                  إنشاء مجموعة جديدة
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  {selectedCourseForBatch && `إنشاء مجموعة للدورة: ${selectedCourseForBatch.title}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 bg-white !bg-white dark:bg-slate-900 !dark:bg-slate-900">
                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-white font-semibold">اسم المجموعة</Label>
                  <Input
                    placeholder="مثال: المجموعة الأولى"
                    value={newBatch.name}
                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                    className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-white font-semibold">نوع المجموعة</Label>
                  <Select
                    value={newBatch.type}
                    onValueChange={(value: 'individual' | 'group') => {
                      setNewBatch({
                        ...newBatch,
                        type: value,
                        max_students: value === 'individual' ? 1 : 200
                      })
                    }}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
                      <SelectValue className="text-gray-900 dark:text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800">
                      <SelectItem value="individual" className="text-gray-900 dark:text-white">
                        فردي (طالب واحد)
                      </SelectItem>
                      <SelectItem value="group" className="text-gray-900 dark:text-white">
                        مجموعة (حتى 200 طالب)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newBatch.type !== 'individual' && (
                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white font-semibold">الحد الأقصى للطلاب</Label>
                    <Input
                      type="number"
                      min="1"
                      max="200"
                      value={newBatch.max_students || 200}
                      onChange={(e) =>
                        setNewBatch({ ...newBatch, max_students: parseInt(e.target.value) || 200 })
                      }
                      className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-white font-semibold">الحالة</Label>
                  <Select
                    value={newBatch.status}
                    onValueChange={(value: 'active' | 'closed') =>
                      setNewBatch({ ...newBatch, status: value })
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
                      <SelectValue className="text-gray-900 dark:text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800">
                      <SelectItem value="active" className="text-gray-900 dark:text-white">
                        نشط
                      </SelectItem>
                      <SelectItem value="closed" className="text-gray-900 dark:text-white">
                        مغلق
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="bg-white !bg-white dark:bg-slate-900 !dark:bg-slate-900 pt-4 border-t border-gray-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => setBatchDialogOpen(false)}
                  className="border-gray-300 dark:border-slate-600"
                  disabled={creatingBatch}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleSubmitBatch}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
                  disabled={creatingBatch || !newBatch.name}
                >
                  {creatingBatch ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      إنشاء
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </div>
  )
}
