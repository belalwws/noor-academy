'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/lib/hooks'
import { toast } from 'sonner'
import { getAuthToken } from '@/lib/auth'
import { notesAPI } from '@/lib/api/notes'
import LiveSessionsSSE from './components/LiveSessionsSSE'
import { motion } from 'framer-motion'
import ProtectedRoute from '@/components/ProtectedRoute'
import { logger } from '@/lib/utils/logger'

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Icons
import {
  BookOpen,
  FileText,
  UserIcon,
  CheckCircle,
  GraduationCap,
  Video,
  RefreshCw,
  Calendar,
  Clock,
  Play,
  Users,
  StickyNote,
  Pin,
  Megaphone,
  Sparkles
} from 'lucide-react'

// Lazy load heavy components for better performance
import dynamic from 'next/dynamic';

const TeamsStyleCoursesView = dynamic(() => import('./components/TeamsStyleCoursesView'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});
import { useLiveSessions } from '@/lib/store/hooks/useLiveSessions'
import { liveEducationApi } from '@/lib/api/live-education'
import { batchStudentsApi, batchesApi } from '@/lib/api/batches'

function StudentDashboard() {
  const { user } = useAppSelector(state => state.auth)
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const { liveSessions } = useLiveSessions();

  const [enrollments, setEnrollments] = useState<any[]>([])
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [courseDetailsMap, setCourseDetailsMap] = useState<Record<string, any>>({})
  const [initialLoad, setInitialLoad] = useState(true)
  const [refreshSuccess, setRefreshSuccess] = useState(false)
  const [applications, setApplications] = useState<any[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [batches, setBatches] = useState<any[]>([])
  const [batchesLoading, setBatchesLoading] = useState(false)
  const [batchesLoaded, setBatchesLoaded] = useState(false) // Track if batches have been loaded at least once
  const batchesLoadedRef = React.useRef(false) // Also track in ref for immediate checks
  
  // Recorded Courses state
  const [recordedEnrollments, setRecordedEnrollments] = useState<any[]>([])
  const [recordedEnrollmentsLoading, setRecordedEnrollmentsLoading] = useState(true)
  const [recordedApplications, setRecordedApplications] = useState<any[]>([])
  const [recordedApplicationsLoading, setRecordedApplicationsLoading] = useState(false)
  const [courseTotalLessons, setCourseTotalLessons] = useState<Record<string, number>>({})
  
  // Active tab for courses
  const [activeCoursesTab, setActiveCoursesTab] = useState<'live' | 'recorded' | 'applications'>('live')
  
  // Notes state
  const [privateNotes, setPrivateNotes] = useState<any[]>([])
  const [notesLoading, setNotesLoading] = useState(false)
  // Course announcements (by enrolled courses)
  const [courseAnnouncements, setCourseAnnouncements] = useState<any[]>([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(false)
  
  // Modal states
  const [showAllNotesModal, setShowAllNotesModal] = useState(false)
  const [showAllAnnouncementsModal, setShowAllAnnouncementsModal] = useState(false)

  // Simple in-memory cache to reduce backend load
  const cacheRef = React.useRef(new Map<string, { ts: number, data: any }>())
  
  // Memoize fetchWithCache to avoid recreating on every render
  const fetchWithCache = useCallback(async (key: string, url: string, ttlMs: number, init?: RequestInit) => {
    const now = Date.now()
    const hit = cacheRef.current.get(key)
    if (hit && now - hit.ts < ttlMs) return hit.data
    const resp = await fetch(url, init)
    if (!resp.ok) throw new Error(`Request failed: ${resp.status}`)
    const data = await resp.json()
    cacheRef.current.set(key, { ts: now, data })
    return data
  }, [])

  const fetchCourseDetails = useCallback(async (courseId: string) => {
    try {
      // Ensure we include Authorization header to avoid 401
      const token = await getAuthToken()
      const headers: HeadersInit = token
        ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        : { 'Accept': 'application/json' }

      const data = await fetchWithCache(
        `course_${courseId}`,
        `${process.env['NEXT_PUBLIC_API_URL']}/live-education/courses/${courseId}/`,
        120_000,
        { headers, credentials: 'include' }
      )

      logger.log('📚 Course details fetched:', courseId)
      setCourseDetailsMap(prev => ({ ...prev, [courseId]: data }))
    } catch (e) {
      logger.error('❌ Error fetching course details:', e)
    }
  }, [fetchWithCache])

  // Memoize helper functions to avoid recreating on every render
  const getCourseIdFromEnrollment = useCallback((enrollment: any): string | undefined => {
    if (enrollment?.course_id) return String(enrollment.course_id)
    if (enrollment?.course) {
      if (typeof enrollment.course === 'object') return String(enrollment.course.id || '')
      return String(enrollment.course)
    }
    return undefined
  }, [])

  const translateEnrollmentStatus = useCallback((status?: string, display?: string) => {
    const s = (status || display || '').toString().toLowerCase()
    if (/(approved|معتمد|accepted)/.test(s)) return 'معتمد'
    if (/(pending|قيد المراجعة|awaiting|review)/.test(s)) return 'قيد المراجعة'
    if (/(rejected|مرفوض|declined)/.test(s)) return 'مرفوض'
    if (/(completed|مكتمل|done)/.test(s)) return 'مكتمل'
    return display || status || 'غير محدد'
  }, [])

  // Load notes function (private and course notes)
  const loadNotes = useCallback(async () => {
    try {
      setNotesLoading(true)
      // API endpoint removed - returning empty array to avoid 404 errors
      const notesArray: any[] = []
      setPrivateNotes(notesArray)
    } catch (error: any) {
      logger.error('📝 Error loading notes:', error)
      toast.error('حدث خطأ أثناء تحميل الملحوظات')
    } finally {
      setNotesLoading(false)
    }
  }, [])

  // Load recorded course enrollments
  const loadRecordedEnrollments = useCallback(async () => {
    try {
      setRecordedEnrollmentsLoading(true)
      
      const token = await getAuthToken()
      const response = await fetch(`${API_BASE_URL}/recorded-courses/enrollments/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const enrollmentsArray = data.results || []
        setRecordedEnrollments(enrollmentsArray)
      } else {
        setRecordedEnrollments([])
      }
    } catch (error) {
      setRecordedEnrollments([])
    } finally {
      setRecordedEnrollmentsLoading(false)
    }
  }, [])

  // Load recorded course applications
  const loadRecordedApplications = useCallback(async () => {
    try {
      setRecordedApplicationsLoading(true)
      
      const token = await getAuthToken()
      const response = await fetch(`${API_BASE_URL}/recorded-courses/applications/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const applicationsArray = data.results || []
        setRecordedApplications(applicationsArray)
      } else {
        setRecordedApplications([])
      }
    } catch (error) {
      setRecordedApplications([])
    } finally {
      setRecordedApplicationsLoading(false)
    }
  }, [])

  // Load latest announcements for the student's enrolled courses
  const loadCourseAnnouncements = useCallback(async () => {
    try {
      setAnnouncementsLoading(true)
      // Collect unique approved course IDs from enrollments
      const courseIds = Array.from(new Set(
        (enrollments || [])
          .filter((e: any) => (e.status || '').toLowerCase() === 'approved')
          .map((e: any) => getCourseIdFromEnrollment(e))
      )).filter(Boolean) as string[]

      if (courseIds.length === 0) {
        setCourseAnnouncements([])
        return
      }

      // Fetch announcements per course in parallel (limit concurrency to avoid overload)
      // API endpoint removed - returning empty array to avoid 404 errors
      const all: any[] = []

      // Sort: pinned first, then important, then newest
      all.sort((a, b) => {
        const ap = a.is_pinned ? 1 : 0
        const bp = b.is_pinned ? 1 : 0
        if (bp !== ap) return bp - ap
        const ai = a.is_important ? 1 : 0
        const bi = b.is_important ? 1 : 0
        if (bi !== ai) return bi - ai
        const at = new Date(a.created_at || a.updated_at || 0).getTime()
        const bt = new Date(b.created_at || b.updated_at || 0).getTime()
        return bt - at
      })

      setCourseAnnouncements(all)
    } catch (err) {
      // Error loading announcements - silent fail
    } finally {
      setAnnouncementsLoading(false)
    }
  }, [enrollments, getCourseIdFromEnrollment])

  const loadStudentData = useCallback(async () => {
    try {
      const token = await getAuthToken()
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      } as const

      // Load user profile using new auth API
      try {
        const profileData = await fetchWithCache(
          'auth_profile',
          `${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/`,
          60_000,
          { headers: authHeaders, credentials: 'include' }
        )

        // Use the profile image URLs from the new API
        setUserProfile(profileData)

        // Load signed image URLs separately (same as profile page)
        try {
          const { apiService } = await import('@/lib/api')
          const imageResponse = await apiService.getProfileImageUrls()

          if (imageResponse.success && imageResponse.data) {
            const actualData = imageResponse.data.data || imageResponse.data

            const imageUrl = actualData.profile_image_thumbnail_url ||
                            actualData.profile_image_url ||
                            actualData.image_url ||
                            actualData.url ||
                            actualData.profile_image ||
                            actualData.image ||
                            actualData.thumbnail_url ||
                            actualData.original_url ||
                            actualData.file_url

            if (imageUrl) {
              setProfileImage(imageUrl)
              // Update profile data with signed URL
              setUserProfile(prev => prev ? {
                ...prev,
                profile_image_thumbnail_url: imageUrl,
                profile_image_url: actualData.profile_image_url || imageUrl
              } : null)
            }
          }
        } catch (error) {
          // Fallback to original URLs from profile data
          if (profileData.profile_image_thumbnail_url) {
            setProfileImage(profileData.profile_image_thumbnail_url)
          } else if (profileData.profile_image_url) {
            setProfileImage(profileData.profile_image_url)
          } else {
            setProfileImage(null)
          }
        }
      } catch (error) {
        // Error loading auth profile - silent fail
      }

      // Note: Enrollments will be loaded from batches API (loadBatches function)
      // The enrollment API endpoint is not available, so we skip it here
      setEnrollmentsLoading(false)

      // Note: Assignments API endpoint is not available, so we skip it
      // Assignments loaded but not currently displayed in UI

      // Load notes (private and course notes)
      await loadNotes()
      
      // Load recorded course enrollments and applications
      await loadRecordedEnrollments()
      await loadRecordedApplications()
      
      // Note: applications will be loaded after batches are loaded (see useEffect below)
      
    } catch (error) {
      toast.error('حدث خطأ في تحميل البيانات', {
        duration: 3000,
        position: 'top-center',
        description: 'يرجى المحاولة مرة أخرى',
      })
    }
  }, [fetchWithCache, loadNotes, loadRecordedEnrollments, loadRecordedApplications])

  const loadApplications = useCallback(async (skipBatchCheck = false) => {
    try {
      setApplicationsLoading(true)
      const response = await liveEducationApi.applications.list({
        ordering: '-created_at'
      })
      
      let allApplications: any[] = [];
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          allApplications = response;
        } else {
          const data = response as any;
          allApplications = data.results || data.data || [];
        }
      }
      
      // Filter out enrolled applications - they should appear in enrolled courses section
      // Also filter out applications where student is already in a batch
      const filteredApps = allApplications.filter((app: any) => {
        // Don't show enrolled applications
        if (app.status === 'enrolled') {
          return false
        }
        
        // Skip batch check if requested (e.g., during initial load before batches are loaded)
        if (skipBatchCheck) {
          return true
        }
        
        // Check if student is already in a batch for this course
        // If yes, don't show the application (student is already in a batch)
        const studentBatch = batches.find(b => {
          if (!b.batch_details || b.status !== 'active') {
            return false
          }
          const batchCourseId = String(b.batch_details.course || '').trim()
          const appCourseId = String(app.course || '').trim()
          return batchCourseId === appCourseId && batchCourseId !== ''
        })
        
        if (studentBatch) {
          return false
        }
        
        return true
      })
      
      setApplications(filteredApps)
    } catch (error) {
      setApplications([])
    } finally {
      setApplicationsLoading(false)
    }
  }, [batches])

  const loadBatches = useCallback(async () => {
    try {
      setBatchesLoading(true)

      // Use the new batchStudentsApi which automatically filters by current student
      const response = await batchStudentsApi.list({
        ordering: '-created_at'
      })
      
      const allBatches = response.results || []
      
      logger.log('✅ Student batches loaded:', allBatches.length)
      
      // Fetch batch details for each batch (limit concurrency to avoid overload)
      const batchesWithDetails = await Promise.all(
        allBatches.map(async (batchStudent: any) => {
          try {
            const batchDetails = await batchesApi.get(batchStudent.batch)
            return {
              ...batchStudent,
              batch_details: batchDetails
            }
          } catch (error) {
            logger.error('❌ Error fetching batch details:', batchStudent.batch)
            return {
              ...batchStudent,
              batch_details: null
            }
          }
        })
      )
      
      setBatches(batchesWithDetails)
      // Mark batches as loaded - this will trigger applications loading
      // Even if batches array is empty, we still mark as loaded so applications can be loaded
      batchesLoadedRef.current = true
      setBatchesLoaded(true)
      
      // Also update enrollments if we have batches with course info
      if (batchesWithDetails.length > 0) {
        const enrollmentsFromBatches: any[] = []
        const courseIds = new Set<string>()
        
        for (const batch of batchesWithDetails) {
          if (batch.batch_details?.course) {
            const courseId = String(batch.batch_details.course).trim()
            if (courseId && !courseIds.has(courseId)) {
              courseIds.add(courseId)
              enrollmentsFromBatches.push({
                id: `batch-enrollment-${batch.id}`,
                course: courseId,
                course_title: batch.batch_details.course_title || 'دورة',
                status: 'approved',
                status_display: 'مقبول',
                batch: batch.batch,
                batch_name: batch.batch_details.name,
                enrolled_at: batch.created_at || new Date().toISOString(),
                enrollment_type: 'batch'
              })
            }
          }
        }
        
        if (enrollmentsFromBatches.length > 0) {
          logger.log('📚 Updating enrollments from batches:', enrollmentsFromBatches.length)
          // Merge with existing enrollments
          setEnrollments(prev => {
            const existingCourseIds = new Set(prev.map(e => String(getCourseIdFromEnrollment(e) || '').trim()))
            const newEnrollments = enrollmentsFromBatches.filter(e => {
              const courseId = String(e.course || '').trim()
              return courseId && !existingCourseIds.has(courseId)
            })
            return [...prev, ...newEnrollments]
          })
        }
      }
    } catch (error) {
      // Even on error, mark as loaded so applications can still be loaded
      batchesLoadedRef.current = true
      setBatchesLoaded(true)
      toast.error('حدث خطأ في تحميل المجموعات', {
        duration: 3000,
        position: 'top-center',
      })
    } finally {
      setBatchesLoading(false)
    }
  }, [getCourseIdFromEnrollment])

  const refreshData = useCallback(async () => {
    setRefreshing(true)
    setRefreshSuccess(false)
    try {
      await loadStudentData()
      // Load batches first, then applications (so applications can check batches)
      await loadBatches()
      // Wait for batches state to update
      await new Promise(resolve => setTimeout(resolve, 500))
      // Don't skip batch check during refresh - we want to filter properly
      await loadApplications(false)
      setRefreshSuccess(true)
      toast.success("✅ تم تحديث البيانات بنجاح", {
        duration: 2000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
        }
      })
      // Reset success state after animation
      setTimeout(() => setRefreshSuccess(false), 2000)
    } catch (error) {
      toast.error("❌ حدث خطأ أثناء تحديث البيانات", {
        duration: 3000,
        position: 'top-center',
      })
    } finally {
      setRefreshing(false)
    }
  }, [loadStudentData, loadBatches, loadApplications])

  // Memoize status helper functions
  const getStatusBadgeStyle = useCallback((status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }, [])

  const getStatusDisplayText = useCallback((status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '✅ مقبول'
      case 'pending':
        return '⏳ قيد المراجعة'
      case 'rejected':
        return '❌ مرفوض'
      case 'completed':
        return '🎓 مكتمل'
      default:
        return '❓ غير محدد'
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setInitialLoad(true)
      setBatchesLoaded(false) // Reset batches loaded flag
      batchesLoadedRef.current = false
      try {
        await loadStudentData()
      } catch (error) {
        toast.error('حدث خطأ في تحميل البيانات')
      } finally {
        setInitialLoad(false)
      }
    }
    
    loadData()
    
    // Listen for profile image updates
    const handleProfileImageUpdate = (event: CustomEvent) => {
      if (event.detail?.imageUrl || event.detail?.thumbnailUrl) {
        const newImageUrl = event.detail.thumbnailUrl || event.detail.imageUrl
        setProfileImage(newImageUrl)
        
        // Force re-render by updating userProfile as well
        setUserProfile((prev: any) => prev ? {
          ...prev,
          profile_image_thumbnail_url: event.detail.thumbnailUrl,
          profile_image_url: event.detail.fullImageUrl
        } : null)
      }
    }
    
    window.addEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener)
    
    // Also listen for storage changes (in case user updates from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profileImageUpdated') {
        loadStudentData()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener)
      window.removeEventListener('storage', handleStorageChange)
    };
  }, [loadStudentData]);

  // After enrollments are loaded, ensure we have teacher details by fetching course objects (with limit)
  // API endpoint removed - fetchCourseDetails call disabled to avoid 404 errors
  // useEffect(() => {
  //   const uniqueCourseIds = Array.from(new Set(
  //     (enrollments || []).map((e: any) => {
  //       const id = getCourseIdFromEnrollment(e)
  //       return id ? String(id) : ''
  //     })
  //   )).filter(Boolean)
  //   const missing = uniqueCourseIds.filter(id => !courseDetailsMap[id])
  //   if (missing.length === 0) return
  //   let active = true
  //   const run = async () => {
  //     const concurrency = 4
  //     for (let i = 0; i < missing.length; i += concurrency) {
  //       const slice = missing.slice(i, i + concurrency)
  //       await Promise.all(slice.map(id => fetchCourseDetails(id)))
  //       if (!active) break
  //     }
  //   }
  //   run()
  //   return () => { active = false }
  // }, [enrollments])

  // When enrollments change, refresh announcements as well
  useEffect(() => {
    if (!enrollments || enrollments.length === 0) {
      setCourseAnnouncements([])
      return
    }
    loadCourseAnnouncements()
  }, [enrollments, loadCourseAnnouncements])

  // Load batches when userProfile is loaded and on refresh
  useEffect(() => {
    if (userProfile) {
      loadBatches()
    }
  }, [userProfile, loadBatches])

  // Also reload batches when enrollments change (in case student was added to a batch)
  useEffect(() => {
    if (enrollments.length > 0 && userProfile) {
      // Delay slightly to allow backend to process
      const timer = setTimeout(() => {
        loadBatches()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [enrollments.length, userProfile, loadBatches])

  // Load applications after batches are loaded (to prevent flickering)
  // This ensures applications are filtered correctly from the start
  useEffect(() => {
    // Only load applications if:
    // 1. User profile is loaded
    // 2. Batches have been loaded at least once
    // This prevents showing applications before batches are loaded, which causes flickering
    if (userProfile && batchesLoaded) {
      // Small delay to ensure batches state is fully updated
      const timer = setTimeout(() => {
        loadApplications(false) // Always check batches to filter correctly
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [batchesLoaded, userProfile, loadApplications])

  // Reload applications when batches change (after initial load)
  // This handles cases where batches are updated (e.g., student added to new batch)
  useEffect(() => {
    // Only reload if:
    // 1. User profile is loaded
    // 2. Initial load is complete
    // 3. Batches have been loaded at least once
    // 4. Batches array has items (to avoid reloading on empty array)
    if (userProfile && !initialLoad && batchesLoaded && batches.length > 0) {
      // Use a delay to ensure batches state is fully updated
      const timer = setTimeout(() => {
        loadApplications(false) // Don't skip batch check - we want to filter properly
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [batches.length, userProfile, initialLoad, batchesLoaded, loadApplications])



  return (
    <div lang="ar" dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20 md:pt-24">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 top-20 md:top-24">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-200/20 dark:from-amber-900/10 dark:to-orange-900/10 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 dark:from-purple-900/10 dark:to-pink-900/10 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-blue-200/15 to-cyan-200/15 dark:from-blue-900/8 dark:to-cyan-900/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        ></motion.div>
      </div>

      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-[1400px] 2xl:max-w-[1600px]">
        {/* Enhanced Header with Framer Motion */}
        {initialLoad && enrollmentsLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 dark:from-amber-600 dark:via-orange-700 dark:to-amber-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl shadow-orange-500/20 dark:shadow-orange-900/40 relative overflow-hidden mb-6 md:mb-8"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-white/30" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 md:h-8 w-48 md:w-64 bg-white/30 rounded-lg" />
                  <Skeleton className="h-4 w-32 md:w-48 bg-white/20 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 md:h-28 bg-white/30 rounded-xl md:rounded-2xl" />
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
            className="bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 dark:from-amber-600 dark:via-orange-700 dark:to-amber-800 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-2xl shadow-orange-500/20 dark:shadow-orange-900/40 relative overflow-hidden mb-6 md:mb-8"
          >
          {/* Decorative Elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl"
          ></motion.div>
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.4, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-amber-300/30 dark:from-amber-900/30 to-transparent rounded-full blur-2xl"
          ></motion.div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="absolute top-10 right-20 w-6 h-6 text-white/30" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, 10, 0],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <Sparkles className="absolute bottom-10 left-20 w-4 h-4 text-white/20" />
            </motion.div>
            <motion.div
              animate={{
                rotate: [0, 360],
                opacity: [0.25, 0.35, 0.25],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Sparkles className="absolute top-20 left-40 w-5 h-5 text-white/25" />
            </motion.div>
          </div>

          <div className="relative z-10">
            {/* Profile Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6 md:mb-8">
              <div className="flex items-center gap-4 md:gap-5 flex-1 min-w-0">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="relative flex-shrink-0"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-white/40 to-white/20 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-sm border-2 border-white/30 overflow-hidden shadow-xl ring-2 ring-white/20">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="الصورة الشخصية"
                        className="w-full h-full rounded-xl md:rounded-2xl object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                      />
                    ) : (
                      <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    )}
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg md:rounded-xl flex items-center justify-center border-2 md:border-3 border-white shadow-lg"
                  >
                    <span className="text-xs md:text-sm">📚</span>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex-1 min-w-0"
                >
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-2 flex-wrap">
                    <span className="truncate">مرحباً، {userProfile?.full_name || userProfile?.first_name || user?.full_name || 'الطالب'}!</span>
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="text-xl md:text-2xl flex-shrink-0"
                    >
                      🎓
                    </motion.span>
                  </h1>
                  <p className="text-amber-50 dark:text-amber-100 text-sm md:text-base leading-relaxed">
                    {userProfile?.bio || 'تابع رحلتك التعليمية وحقق أهدافك الأكاديمية'}
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-2 md:gap-3 flex-shrink-0"
              >
                {/* Refresh Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={refreshData}
                    variant="outline"
                    size="sm"
                    disabled={refreshing}
                    className={`bg-white/30 border-white/40 text-white hover:bg-white/40 backdrop-blur-md h-9 md:h-10 px-4 md:px-5 shadow-lg hover:shadow-xl transition-all duration-300 text-xs md:text-sm ${
                      refreshSuccess ? 'ring-2 ring-green-300 ring-offset-2 ring-offset-amber-500' : ''
                    }`}
                  >
                    {refreshing ? (
                      <>
                        <Spinner size="sm" tone="contrast" className="ml-2" />
                        <span className="hidden sm:inline">تحديث...</span>
                      </>
                    ) : refreshSuccess ? (
                      <>
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        >
                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4 ml-2" />
                        </motion.div>
                        <span className="hidden sm:inline">تم!</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 md:w-4 md:h-4 ml-2" />
                        <span className="hidden sm:inline">تحديث</span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            {/* Compact Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {/* Total Enrollments - Live Courses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/30 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-amber-50 dark:text-amber-100 text-xs md:text-sm font-medium mb-1 md:mb-2 truncate">الدورات المباشرة</p>
                    {enrollmentsLoading && initialLoad ? (
                      <Skeleton className="h-8 md:h-10 w-16 bg-white/30 rounded-lg mb-1" />
                    ) : (
                      <motion.p
                        key={enrollments.length}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="text-2xl md:text-3xl font-bold text-white mb-1"
                      >
                        {enrollments.length}
                      </motion.p>
                    )}
                    <p className="text-[10px] md:text-xs text-amber-100 dark:text-amber-200">دورة مباشرة</p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/40 p-2.5 md:p-3 rounded-lg md:rounded-xl shadow-lg flex-shrink-0 ml-3 group-hover:bg-white/50 transition-colors"
                  >
                    <Video className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Recorded Courses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/30 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-amber-50 dark:text-amber-100 text-xs md:text-sm font-medium mb-1 md:mb-2 truncate">الدورات المسجلة</p>
                    {recordedEnrollmentsLoading && initialLoad ? (
                      <Skeleton className="h-8 md:h-10 w-16 bg-white/30 rounded-lg mb-1" />
                    ) : (
                      <motion.p
                        key={recordedEnrollments.length}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="text-2xl md:text-3xl font-bold text-white mb-1"
                      >
                        {recordedEnrollments.length}
                      </motion.p>
                    )}
                    <p className="text-[10px] md:text-xs text-amber-100 dark:text-amber-200">
                      {recordedApplications.filter((a: any) => a.status === 'pending_review').length > 0 && 
                        `${recordedApplications.filter((a: any) => a.status === 'pending_review').length} طلب معلق`
                      }
                      {recordedApplications.filter((a: any) => a.status === 'pending_review').length === 0 && 
                        'دورة مسجلة'
                      }
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/40 p-2.5 md:p-3 rounded-lg md:rounded-xl shadow-lg flex-shrink-0 ml-3 group-hover:bg-white/50 transition-colors"
                  >
                    <Play className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Active Courses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/30 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-amber-50 dark:text-amber-100 text-xs md:text-sm font-medium mb-1 md:mb-2 truncate">دورات نشطة</p>
                    {enrollmentsLoading && initialLoad ? (
                      <Skeleton className="h-8 md:h-10 w-12 bg-white/30 rounded-lg mb-1" />
                    ) : (
                      <motion.p
                        key={enrollments.filter(e => e.status === 'approved').length}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="text-2xl md:text-3xl font-bold text-white mb-1"
                      >
                        {enrollments.filter(e => e.status === 'approved').length}
                      </motion.p>
                    )}
                    <p className="text-[10px] md:text-xs text-amber-100 dark:text-amber-200">قيد الدراسة</p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/40 p-2.5 md:p-3 rounded-lg md:rounded-xl shadow-lg flex-shrink-0 ml-3 group-hover:bg-white/50 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Live Sessions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/30 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-amber-50 dark:text-amber-100 text-xs md:text-sm font-medium mb-1 md:mb-2 truncate">جلسات مباشرة</p>
                    <motion.p
                      key={liveSessions.length}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="text-2xl md:text-3xl font-bold text-white mb-1"
                    >
                      {liveSessions.length}
                    </motion.p>
                    <p className="text-[10px] md:text-xs text-amber-100 dark:text-amber-200">نشطة الآن</p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/40 p-2.5 md:p-3 rounded-lg md:rounded-xl shadow-lg flex-shrink-0 ml-3 relative group-hover:bg-white/50 transition-colors"
                  >
                    <Video className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    {liveSessions.length > 0 && (
                      <motion.div
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [1, 0.8, 1]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white shadow-lg"
                      />
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        )}

        {/* Enhanced Content Sections */}
        <div className="space-y-6 md:space-y-8">
          {/* Main Content - Courses with Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-6 md:space-y-8"
          >
            <Tabs value={activeCoursesTab} onValueChange={(v) => setActiveCoursesTab(v as 'live' | 'recorded' | 'applications')} className="w-full" dir="rtl">
              {/* Tabs Header - Enhanced like Teacher Dashboard */}
              <div className="w-full mb-6">
                <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800/90 dark:to-slate-900/90 rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-2xl border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-xl" dir="rtl">
                  <TabsList className="grid w-full grid-cols-3 p-1.5 bg-slate-100/70 dark:bg-slate-900/60 rounded-xl md:rounded-2xl h-auto gap-2 backdrop-blur-sm" dir="rtl">
                    {[
                      { 
                        value: 'live', 
                        label: 'الدورات المباشرة', 
                        icon: Video, 
                        gradient: 'from-amber-500 to-orange-600', 
                        activeColor: 'orange',
                        count: enrollments.length
                      },
                      { 
                        value: 'recorded', 
                        label: 'الدورات المسجلة', 
                        icon: Play, 
                        gradient: 'from-amber-500 to-orange-600', 
                        activeColor: 'orange',
                        count: recordedEnrollments.length
                      },
                      { 
                        value: 'applications', 
                        label: 'طلبات التسجيل', 
                        icon: FileText, 
                        gradient: 'from-amber-500 to-orange-600', 
                        activeColor: 'orange',
                        count: applications.length + recordedApplications.length
                      }
                    ].map((tab, index) => {
                      const Icon = tab.icon
                      const isActive = activeCoursesTab === tab.value
                      
                      return (
                        <motion.div
                          key={tab.value}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="relative"
                        >
                          <TabsTrigger 
                            value={tab.value}
                            className={`
                              flex items-center justify-center gap-2 rounded-xl md:rounded-2xl
                              font-bold py-3 md:py-4 px-3 md:px-5
                              transition-all duration-500 relative overflow-hidden
                              text-xs md:text-sm lg:text-base w-full
                              border-2
                              ${
                                isActive
                                  ? `bg-gradient-to-br ${tab.gradient} text-white shadow-2xl border-transparent
                                     ring-4 ring-${tab.activeColor}-400/20 dark:ring-${tab.activeColor}-500/30`
                                  : `text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 
                                     bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800
                                     border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600
                                     hover:shadow-lg`
                              }
                            `}
                          >
                            {isActive && (
                              <>
                                <motion.div
                                  layoutId="activeTabBackground"
                                  className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} opacity-100`}
                                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                                <motion.div
                                  className="absolute inset-0 bg-white/10"
                                  animate={{
                                    backgroundPosition: ['0% 0%', '100% 100%'],
                                  }}
                                  transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatType: 'reverse',
                                  }}
                                  style={{
                                    backgroundSize: '200% 200%',
                                    backgroundImage: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                                  }}
                                />
                              </>
                            )}
                            <Icon 
                              className={`
                                w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 relative z-10 
                                transition-transform duration-300
                                ${isActive ? 'text-white scale-110' : 'scale-100'}
                              `} 
                            />
                            <span className={`
                              relative z-10 font-bold tracking-wide
                              ${isActive ? 'text-white' : ''}
                            `}>
                              {tab.label}
                            </span>
                            {tab.count > 0 && (
                              <Badge className={`
                                relative z-10 ml-2 text-xs
                                ${isActive 
                                  ? 'bg-white/30 text-white border-0' 
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-0'
                                }
                              `}>
                                {tab.count}
                              </Badge>
                            )}
                          </TabsTrigger>
                        </motion.div>
                      )
                    })}
                  </TabsList>
                </div>
              </div>

              {/* Live Courses Tab */}
              <TabsContent value="live" className="mt-0">
                {/* Loading State for Courses */}
                {enrollmentsLoading && initialLoad ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  <Skeleton className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="border-0 shadow-lg overflow-hidden bg-white dark:bg-slate-800">
                        <Skeleton className="h-40 bg-slate-200 dark:bg-slate-700" />
                        <CardContent className="p-4 md:p-5 space-y-3">
                          <Skeleton className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                          <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                          <Skeleton className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div className="flex gap-2 mt-4">
                            <Skeleton className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                            <Skeleton className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              /* Courses Grid (Teams Style) */
              <TeamsStyleCoursesView
              courses={enrollments.map((enrollment: any) => {
                // Extract enrollment data

                const courseId = getCourseIdFromEnrollment(enrollment)
                const courseDetails = courseDetailsMap[String(courseId || '')]

                // Try to get teacher name from multiple sources - prioritize courseDetails from API
                let teacherFirstName = ''
                let teacherLastName = ''

                // Priority 1: Course details from API (most reliable)
                if (courseDetails?.teacher?.user) {
                  teacherFirstName = courseDetails.teacher.user.first_name || ''
                  teacherLastName = courseDetails.teacher.user.last_name || ''
                } 
                // Priority 2: Teacher name from course details
                else if (courseDetails?.teacher_name) {
                  const nameParts = courseDetails.teacher_name.split(' ')
                  teacherFirstName = nameParts[0] || ''
                  teacherLastName = nameParts.slice(1).join(' ') || ''
                }
                // Priority 3: Teacher data from enrollment.course object
                else if (enrollment.course?.teacher?.user) {
                  teacherFirstName = enrollment.course.teacher.user.first_name || ''
                  teacherLastName = enrollment.course.teacher.user.last_name || ''
                }
                // Priority 4: Teacher name from enrollment
                else if (enrollment.teacher_name) {
                  const nameParts = enrollment.teacher_name.split(' ')
                  teacherFirstName = nameParts[0] || ''
                  teacherLastName = nameParts.slice(1).join(' ') || ''
                }
                // Priority 5: Separate teacher name fields
                else if (enrollment.teacher_first_name || enrollment.teacher_last_name) {
                  teacherFirstName = enrollment.teacher_first_name || ''
                  teacherLastName = enrollment.teacher_last_name || ''
                }
                // Fallback: Generic name
                else {
                  teacherFirstName = 'المعلم'
                  teacherLastName = ''
                }

                // Teacher name resolved

                return {
                  id: courseId || enrollment.id,
                  title: enrollment.course_title || enrollment.course?.title || 'دورة غير محددة',
                  description: enrollment.course_description || enrollment.course?.description,
                  course_type: enrollment.course_type || enrollment.course?.course_type || 'individual',
                  course_type_display: enrollment.course_type_display || enrollment.course?.course_type_display || 'فردي',
                  teacher: {
                    user: {
                      first_name: teacherFirstName,
                      last_name: teacherLastName
                    }
                  },
                  enrollment_status: translateEnrollmentStatus(enrollment.status, enrollment.status_display),
                  status_display: translateEnrollmentStatus(enrollment.status, enrollment.status_display),
                  next_session: enrollment.next_session,
                  total_sessions: enrollment.total_sessions ?? enrollment.course?.lessons?.length,
                  attended_sessions: enrollment.attended_sessions ?? enrollment.progress_sessions ?? 0,
                  recent_notes_count: enrollment.recent_notes_count ?? enrollment.notes_count ?? 0,
                  available_spots: enrollment.course?.available_spots
                }
              })}
              applications={applications}
              batches={batches}
              loading={enrollmentsLoading && !initialLoad}
              onRefresh={refreshData}
            />
            )}
              </TabsContent>

              {/* Recorded Courses Tab */}
              <TabsContent value="recorded" className="mt-0">
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800/90 backdrop-blur-sm">
                  <CardContent className="p-4 md:p-6">

                {/* Enrollments Section */}
                {recordedEnrollmentsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-700/80 dark:to-amber-900/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-700/50"
                      >
                        <Skeleton className="h-6 w-3/4 bg-slate-200 dark:bg-slate-600 rounded mb-3" />
                        <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-600 rounded mb-2" />
                        <Skeleton className="h-4 w-2/3 bg-slate-200 dark:bg-slate-600 rounded" />
                      </motion.div>
                    ))}
                  </div>
                ) : recordedEnrollments.length === 0 && recordedApplications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                      <Play className="w-8 h-8 text-amber-500" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      لا توجد دورات مسجلة
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      ابدأ رحلتك التعليمية بالتسجيل في دورة مسجلة
                    </p>
                  </motion.div>
                ) : (
                  <div>
                    {recordedEnrollments.length > 0 && (
                      <>
                        <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                          <Play className="w-5 h-5 text-amber-600" />
                          دوراتي المسجلة ({recordedEnrollments.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {recordedEnrollments.map((enrollment: any, index: number) => {
                            // Extract course ID - could be enrollment.course or enrollment.course_id
                            const courseId = enrollment.course || enrollment.course_id;
                            
                            // Calculate progress from localStorage (same as recorded-content page)
                            const calculateProgress = (courseId: string): { percentage: number; completed: number; total: number } => {
                              try {
                                const courseProgressKey = `course_progress_${courseId}`;
                                const courseProgress = JSON.parse(localStorage.getItem(courseProgressKey) || '{}');
                                
                                // Get completed lessons from localStorage
                                const completedLessons = Object.values(courseProgress).filter((progress: any) => progress?.completed === true).length;
                                
                                // Try to get total lessons in this order:
                                // 1. From cached state (courseTotalLessons)
                                // 2. From enrollment data (enrollment.total_lessons)
                                // 3. From localStorage (count all lesson IDs)
                                let totalLessons = courseTotalLessons[courseId] || enrollment.total_lessons || 0;
                                
                                // If still not available, try to get from localStorage
                                if (!totalLessons || totalLessons === 0) {
                                  // Count unique lesson IDs in progress
                                  const allLessonIds = Object.keys(courseProgress).map(id => parseInt(id)).filter(id => !isNaN(id));
                                  totalLessons = Math.max(allLessonIds.length, completedLessons);
                                  
                                  // If we found lessons in localStorage, cache it
                                  if (totalLessons > 0 && !courseTotalLessons[courseId]) {
                                    setCourseTotalLessons(prev => ({ ...prev, [courseId]: totalLessons }));
                                  }
                                }
                                
                                const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                                
                                return { percentage, completed: completedLessons, total: totalLessons };
                              } catch (error) {
                                console.error('Error calculating progress:', error);
                                return { percentage: 0, completed: 0, total: 0 };
                              }
                            };
                            
                            const progress = courseId ? calculateProgress(courseId) : { percentage: 0, completed: 0, total: 0 };
                            // Use calculated progress percentage (from localStorage) as primary source
                            // Fallback to enrollment.progress_percentage if calculated is 0
                            const progressPercentage = progress.percentage > 0 ? progress.percentage : (enrollment.progress_percentage !== undefined ? enrollment.progress_percentage : 0);
                            
                            return (
                      <motion.div
                        key={enrollment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="group"
                      >
                        <Card className="border-2 border-amber-200/50 dark:border-amber-700/50 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white via-amber-50/40 to-orange-50/30 dark:from-slate-700/80 dark:via-amber-900/10 dark:to-orange-900/10 cursor-pointer"
                          onClick={() => {
                            if (!courseId) {
                              logger.error('❌ No course ID found for enrollment:', enrollment);
                              toast.error('خطأ: لم يتم العثور على معرف الدورة');
                              return;
                            }
                            router.push(`/course/${courseId}/recorded-content`);
                          }}
                        >
                          <CardContent className="p-5">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg line-clamp-2 flex-1 leading-tight">
                                  {enrollment.course_title || 'دورة غير محددة'}
                                </h3>
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white dark:from-amber-600 dark:to-orange-600 border-0 flex-shrink-0 shadow-sm">
                                  {enrollment.status === 'active' ? 'نشط' : 
                                   enrollment.status === 'completed' ? 'مكتمل' :
                                   enrollment.status === 'suspended' ? 'معلق' : enrollment.status}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <span>
                                  {new Date(enrollment.enrolled_at).toLocaleDateString('ar-EG', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>

                              {/* Progress Section - Always visible */}
                              <div className="space-y-2 pt-2 border-t border-amber-200/50 dark:border-amber-700/50">
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    التقدم
                                  </span>
                                  <span className="font-bold text-amber-600 dark:text-amber-400 text-base">
                                    {Math.round(progressPercentage)}%
                                  </span>
                                  </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5 overflow-hidden shadow-inner">
                                    <motion.div
                                      initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                      transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-full shadow-sm"
                                    />
                                  </div>
                                {progress.total > 0 && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                    {progress.completed} من {progress.total} درس مكتمل
                                  </p>
                              )}
                              </div>

                              <Button
                                size="sm"
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!courseId) {
                                    logger.error('❌ No course ID found for enrollment:', enrollment);
                                    toast.error('خطأ: لم يتم العثور على معرف الدورة');
                                    return;
                                  }
                                  router.push(`/course/${courseId}/recorded-content`);
                                }}
                              >
                                <Play className="w-4 h-4 ml-2" />
                                متابعة الدورة
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                            );
                          })}
                  </div>
                </>
              )}
            </div>
          )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Applications Tab */}
              <TabsContent value="applications" className="mt-0">
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800/90 backdrop-blur-sm">
                  <CardContent className="p-4 md:p-6">
                    {/* Live Course Applications */}
                    {applications.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                          <Video className="w-5 h-5 text-amber-600" />
                          طلبات الدورات المباشرة ({applications.length})
                        </h3>
                        <div className="space-y-3">
                          {applications.map((app: any, index: number) => (
                            <motion.div
                              key={app.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Card className="border-2 border-amber-200/50 dark:border-amber-700/50 overflow-hidden bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-700/80 dark:to-amber-900/10">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 space-y-2">
                                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">
                                        {app.course_title || 'دورة غير محددة'}
                                      </h4>
                                      
                                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                                        <Badge 
                                          className={
                                            app.status === 'pending_review' 
                                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 border-orange-300' 
                                              : app.status === 'ready_for_teacher'
                                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-300'
                                              : app.status === 'rejected'
                                              ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 border-red-300'
                                              : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-300'
                                          }
                                        >
                                          {app.status_display || app.status}
                                        </Badge>
                                        
                                        {app.learning_type && (
                                          <Badge variant="outline" className="text-xs">
                                            {app.learning_type_display || (app.learning_type === 'individual' ? 'فردي' : 'جماعي')}
                                          </Badge>
                                        )}
                                        
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {new Date(app.created_at).toLocaleDateString('ar-EG')}
                                        </span>
                                      </div>

                                      {app.student_notes && (
                                        <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 p-2 rounded">
                                          <strong>ملاحظاتك:</strong> {app.student_notes}
                                        </p>
                                      )}

                                      {app.status === 'rejected' && app.rejection_reason && (
                                        <p className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                                          <strong>سبب الرفض:</strong> {app.rejection_reason}
                                        </p>
                                      )}

                                      {app.status === 'ready_for_teacher' && (
                                        <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                                          ✅ تم قبول طلبك! في انتظار المعلم لإضافتك إلى دفعة
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recorded Course Applications */}
                    {recordedApplications.length > 0 && (
                      <div className={applications.length > 0 ? 'mt-6 pt-6 border-t border-slate-200 dark:border-slate-700' : ''}>
                        <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                          <Play className="w-5 h-5 text-amber-600" />
                          طلبات الدورات المسجلة ({recordedApplications.length})
                        </h3>
                        <div className="space-y-3">
                          {recordedApplications.map((app: any, index: number) => (
                            <motion.div
                              key={app.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Card className="border-2 border-amber-200/50 dark:border-amber-700/50 overflow-hidden bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-700/80 dark:to-amber-900/10">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 space-y-2">
                                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">
                                        {app.course_title || 'دورة غير محددة'}
                                      </h4>
                                      
                                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                                        <Badge 
                                          className={
                                            app.status === 'pending_review' 
                                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 border-orange-300' 
                                              : app.status === 'approved'
                                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-300'
                                              : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 border-red-300'
                                          }
                                        >
                                          {app.status_display || app.status}
                                        </Badge>
                                        
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {new Date(app.created_at).toLocaleDateString('ar-EG')}
                                        </span>
                                      </div>

                                      {app.student_notes && (
                                        <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 p-2 rounded">
                                          <strong>ملاحظاتك:</strong> {app.student_notes}
                                        </p>
                                      )}

                                      {app.status === 'rejected' && app.rejection_reason && (
                                        <p className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                                          <strong>سبب الرفض:</strong> {app.rejection_reason}
                                        </p>
                                      )}

                                      {app.status === 'approved' && (
                                        <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                                          ✅ تم قبول طلبك! سيتم منحك الوصول للدورة قريباً
                                        </p>
                                      )}
                                    </div>

                                    {app.course_price && (
                                      <div className="text-left flex-shrink-0">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">السعر</p>
                                        <p className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                                          {app.course_price} ج.م
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {applications.length === 0 && recordedApplications.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                          className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        >
                          <FileText className="w-8 h-8 text-amber-500" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          لا توجد طلبات تسجيل
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          لم تقم بتقديم أي طلبات تسجيل بعد
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Sidebar */}
          {/*
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-6"
          >
          
          </motion.div>
          
          */}

            {/* Live Sessions Now */}
            {/* <LiveSessionsSSE /> */}

            {/* Private Notes */}
            {/* <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ y: -2 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 dark:from-purple-700 dark:via-purple-800 dark:to-pink-800 text-white rounded-t-2xl relative overflow-hidden p-4 md:p-5">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.1, 0.15, 0.1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12"
                  ></motion.div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="absolute bottom-0 left-0 w-24 h-24 bg-pink-300/20 rounded-full blur-2xl translate-y-8 -translate-x-8"
                  ></motion.div>
                  <CardTitle className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        className="p-2 md:p-2.5 bg-white/30 rounded-lg md:rounded-xl backdrop-blur-sm shadow-lg flex-shrink-0"
                      >
                        <StickyNote className="w-4 h-4 md:w-5 md:h-5" />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <div className="text-base md:text-lg font-bold truncate">ملحوظات معلميني</div>
                        <div className="text-[10px] md:text-xs text-purple-100 dark:text-purple-200 mt-0.5 md:mt-1">
                          {privateNotes.length > 0 ? `${privateNotes.length} ملحوظة` : 'لا توجد ملحوظات'}
                        </div>
                      </div>
                    </div>
                    {privateNotes.some(note => note.is_important) && (
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="flex-shrink-0 ml-2"
                      >
                        <Pin className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
                      </motion.div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-5 bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-800/50 dark:to-purple-900/10 backdrop-blur-sm">
                  <div className="space-y-2 md:space-y-3">
                    {notesLoading ? (
                      <div className="space-y-3">
                        {[...Array(2)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-700/80 dark:to-purple-900/20 rounded-lg md:rounded-xl p-3 md:p-4 border border-purple-200/50 dark:border-purple-700/50"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-slate-600 rounded" />
                                <Skeleton className="h-5 w-16 bg-slate-200 dark:bg-slate-600 rounded-full" />
                              </div>
                              <Skeleton className="h-3 w-full bg-slate-200 dark:bg-slate-600 rounded" />
                              <Skeleton className="h-3 w-3/4 bg-slate-200 dark:bg-slate-600 rounded" />
                              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-600">
                                <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-slate-600 rounded" />
                                <Skeleton className="h-3 w-16 bg-slate-200 dark:bg-slate-600 rounded" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : privateNotes.length > 0 ? (
                      privateNotes.slice(0, 3).map((note, index) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-700/80 dark:to-purple-900/20 rounded-lg md:rounded-xl p-3 md:p-4 border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{note.title}</h4>
                              {note.is_important && (
                                <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full border border-red-200 dark:border-red-700">
                                  <Pin className="w-3 h-3" />
                                  <span>مهم</span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{note.content}</p>
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-600">
                              <span className="line-clamp-1 font-medium">{(note as any)?.teacher_name || 'معلم'}</span>
                              <span>{new Date(note.created_at).toLocaleDateString('ar-SA')}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-6 md:py-8"
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg border border-purple-200/50 dark:border-purple-700/50"
                        >
                          <motion.div
                            animate={{ 
                              y: [0, -5, 0],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <StickyNote className="w-7 h-7 md:w-8 md:h-8 text-purple-400 dark:text-purple-500" />
                          </motion.div>
                        </motion.div>
                        <motion.h3 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1 md:mb-2"
                        >
                          لا توجد ملحوظات
                        </motion.h3>
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-xs md:text-sm text-slate-500 dark:text-slate-400 px-4"
                        >
                          ستظهر ملحوظات معلميك هنا
                        </motion.p>
                      </motion.div>
                    )}

                    {privateNotes.length > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 h-9 md:h-10 font-medium shadow-sm hover:shadow-md transition-all duration-300 text-xs md:text-sm"
                          onClick={() => setShowAllNotesModal(true)}
                        >
                          عرض جميع الملحوظات ({privateNotes.length})
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div> */}

        {/* Latest Announcements from My Teachers */}
           {/*<motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
          whileHover={{ y: -2 }}
        >
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-800 dark:to-pink-800 text-white rounded-t-2xl relative overflow-hidden p-4 md:p-5">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.15, 0.1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12"
              ></motion.div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute bottom-0 left-0 w-24 h-24 bg-pink-300/20 rounded-full blur-2xl translate-y-8 -translate-x-8"
              ></motion.div>
              <CardTitle className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="p-2 md:p-2.5 bg-white/30 rounded-lg md:rounded-xl backdrop-blur-sm shadow-lg flex-shrink-0"
                  >
                    <Megaphone className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base md:text-lg font-bold truncate">إعلانات معلميني</div>
                    <div className="text-[10px] md:text-xs text-indigo-100 dark:text-indigo-200 mt-0.5 md:mt-1">
                      {courseAnnouncements.length > 0 ? `${courseAnnouncements.length} إعلان` : 'لا توجد إعلانات'}
                  </div>
                  </div>
                </div>
                {courseAnnouncements.some((note: any) => note.is_important) && (
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex items-center gap-1 text-xs text-yellow-300 flex-shrink-0 ml-2"
                  >
                    <Pin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="font-medium hidden sm:inline">مهم</span>
                  </motion.div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-800/50 dark:to-indigo-900/10 backdrop-blur-sm">
              <div className="space-y-2 md:space-y-3">
                {announcementsLoading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-700/80 dark:to-indigo-900/20 rounded-lg md:rounded-xl p-3 md:p-4 border border-indigo-200/50 dark:border-indigo-700/50"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-slate-600 rounded" />
                            <Skeleton className="h-5 w-16 bg-slate-200 dark:bg-slate-600 rounded-full" />
                          </div>
                          <Skeleton className="h-3 w-full bg-slate-200 dark:bg-slate-600 rounded" />
                          <Skeleton className="h-3 w-3/4 bg-slate-200 dark:bg-slate-600 rounded" />
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-600">
                            <Skeleton className="h-3 w-24 bg-slate-200 dark:bg-slate-600 rounded" />
                            <Skeleton className="h-3 w-16 bg-slate-200 dark:bg-slate-600 rounded" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : courseAnnouncements.length > 0 ? (
                  courseAnnouncements.slice(0, 3).map((note: any, index: number) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-700/80 dark:to-indigo-900/20 rounded-lg md:rounded-xl p-3 md:p-4 border border-indigo-200/50 dark:border-indigo-700/50 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{note.title}</h4>
                          {(note.is_pinned || note.is_important) && (
                            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full border border-red-200 dark:border-red-700">
                              <Pin className="w-3 h-3" />
                              <span>مهم</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{note.content}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-600">
                          <span className="line-clamp-1 font-medium">
                            {(note as any).course_title || note.course?.title || 'دورة'} • {(note as any).teacher_name || 'معلم'}
                          </span>
                          <span>{new Date(note.created_at || note.updated_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-6 md:py-8"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg border border-indigo-200/50 dark:border-indigo-700/50"
                    >
                      <motion.div
                        animate={{ 
                          y: [0, -5, 0],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Megaphone className="w-7 h-7 md:w-8 md:h-8 text-indigo-400 dark:text-indigo-500" />
                      </motion.div>
                    </motion.div>
                    <motion.h3 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300 mb-1 md:mb-2"
                    >
                      لا توجد إعلانات
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xs md:text-sm text-slate-500 dark:text-slate-400 px-4"
                    >
                      ستظهر إعلانات معلميك هنا
                    </motion.p>
                  </motion.div>
                )}

                {courseAnnouncements.length > 3 && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 h-9 md:h-10 font-medium shadow-sm hover:shadow-md transition-all duration-300 text-xs md:text-sm"
                      onClick={() => setShowAllAnnouncementsModal(true)}
                    >
                      عرض جميع الإعلانات ({courseAnnouncements.length})
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div> 

          </motion.div> */}
        </div>
      </div>

      {/* All Notes Modal */}
      {/* <Dialog open={showAllNotesModal} onOpenChange={setShowAllNotesModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-white dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl">
          <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogTitle className="flex items-center gap-3 md:gap-4 text-xl md:text-2xl">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="p-2.5 md:p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-xl md:rounded-2xl shadow-lg"
                >
                  <StickyNote className="w-6 h-6 md:w-7 md:h-7 text-purple-600 dark:text-purple-400" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <div className="text-slate-900 dark:text-slate-100 font-bold truncate">جميع ملحوظات معلميك</div>
                  <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-normal mt-1">
                    {privateNotes.length} ملحوظة
                  </div>
                </div>
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm md:text-base mt-2">
                جميع الملحوظات التي كتبها معلموك لك
              </DialogDescription>
            </motion.div>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh] space-y-3 md:space-y-4 pr-2 py-4">
            {privateNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card className="border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-700/80 dark:to-purple-900/10">
                  <CardContent className="p-4 md:p-5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{note.title}</h4>
                        {note.is_important && (
                          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-700 shadow-sm">
                            <Pin className="w-4 h-4" />
                            <span className="font-medium">مهم</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">{note.content}</p>
                      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-600">
                        <span className="font-semibold">{(note as any)?.teacher_name || 'معلم'}</span>
                        <span>{new Date(note.created_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog> */}

      {/* All Announcements Modal */}
      {/* <Dialog open={showAllAnnouncementsModal} onOpenChange={setShowAllAnnouncementsModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-white dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl">
          <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogTitle className="flex items-center gap-3 md:gap-4 text-xl md:text-2xl">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="p-2.5 md:p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-xl md:rounded-2xl shadow-lg"
                >
                  <Megaphone className="w-6 h-6 md:w-7 md:h-7 text-indigo-600 dark:text-indigo-400" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <div className="text-slate-900 dark:text-slate-100 font-bold truncate">جميع إعلانات معلميك</div>
                  <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-normal mt-1">
                    {courseAnnouncements.length} إعلان
                  </div>
                </div>
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm md:text-base mt-2">
                جميع الإعلانات من معلميك في الدورات المسجلة
              </DialogDescription>
            </motion.div>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh] space-y-3 md:space-y-4 pr-2 py-4">
            {courseAnnouncements.map((note: any, index: number) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card className="border border-indigo-200/50 dark:border-indigo-700/50 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-700/80 dark:to-indigo-900/10">
                  <CardContent className="p-4 md:p-5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{note.title}</h4>
                        {(note.is_pinned || note.is_important) && (
                          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-700 shadow-sm">
                            <Pin className="w-4 h-4" />
                            <span className="font-medium">مهم</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">{note.content}</p>
                      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-600">
                        <span className="font-semibold">
                          {(note as any).course_title || note.course?.title || 'دورة'} • {(note as any).teacher_name || 'معلم'}
                        </span>
                        <span>{new Date(note.created_at || note.updated_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog> */}
    </div> 
  )
}

// Wrap with ProtectedRoute to ensure only students can access
function ProtectedStudentDashboard() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentDashboard />
    </ProtectedRoute>
  )
}

export default ProtectedStudentDashboard
