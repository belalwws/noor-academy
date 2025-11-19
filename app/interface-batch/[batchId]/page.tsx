'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import BatchSidebar from './components/BatchSidebar'
import BatchMainContent from './components/BatchMainContent'
import AddStudentDialog from './components/AddStudentDialog'
import BatchLoadingState from './components/BatchLoadingState'
import BatchErrorState from './components/BatchErrorState'
import { batchesApi, batchStudentsApi, type BatchStudent } from '@/lib/api/batches'
import type { Batch } from '@/lib/types/live-education'
import { toast } from 'sonner'
import { authService } from '@/lib/auth/authService'
import { courseCommunitiesApi } from '@/lib/api/course-communities'

interface UserData {
  name: string
  avatar?: string
  role: 'teacher' | 'student' // Mapped role for UI (supervisors are mapped to 'teacher')
  isActualTeacher?: boolean // True only for actual teachers, false for supervisors
}

export default function BatchInterface() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const batchId = params?.['batchId'] as string

  const [batch, setBatch] = useState<Batch | null>(null)
  const [batchStudents, setBatchStudents] = useState<BatchStudent[]>([])
  const [userData, setUserData] = useState<UserData>({
    name: 'مستخدم',
    avatar: '',
    role: 'student'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const [activeSection, setActiveSection] = useState<'details' | 'members' | 'manage-students' | 'badges'>('details')
  const [activeTab, setActiveTab] = useState<'announcements' | 'files' | 'quizzes' | 'meetings' | 'performance-notes'>('announcements')
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  const [studentId, setStudentId] = useState('')
  const [addingStudent, setAddingStudent] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | number | null>(null)
  const [communityId, setCommunityId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const authData = authService.getStoredAuthData()
        if (authData?.user) {
          const user = authData.user
          const userRole = user.role || 'student'
          const userName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'مستخدم'
          const userAvatar = user.profile_image_url || user.profile_image_thumbnail_url || ''
          const userId = user.id || (user as any).pk || null
          
          // Supervisors should be treated as students (read-only access)
          // Only actual teachers get teacher privileges
          const isActualTeacher = userRole === 'teacher'
          // Map role: only actual teachers get 'teacher' role, supervisors are treated as 'student'
          const mappedRole = isActualTeacher ? 'teacher' : 'student'
          
          setUserData({
            name: userName,
            avatar: userAvatar,
            role: mappedRole as 'teacher' | 'student',
            isActualTeacher: isActualTeacher // Store if user is actual teacher (not supervisor)
          } as UserData & { isActualTeacher: boolean })
          setCurrentUserId(userId)
          
          if (!isActualTeacher) {
            setActiveSection((prev) => (prev === 'manage-students' ? 'details' : prev))
          }
        } else {
          setAccessDenied(true)
          setError('يجب تسجيل الدخول للوصول إلى هذه الصفحة')
          toast.error('يجب تسجيل الدخول للوصول إلى هذه الصفحة')
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        setAccessDenied(true)
        setError('حدث خطأ في تحميل بيانات المستخدم')
      }
    }
  }, [router])

  useEffect(() => {
    const section = searchParams?.get('section')
    if (section && ['details', 'members', 'manage-students', 'badges'].includes(section)) {
      setActiveSection(section as 'details' | 'members' | 'manage-students' | 'badges')
    }
  }, [searchParams])


  useEffect(() => {
    if (batchId && currentUserId !== null) {
      loadBatchData()
    } else if (!batchId) {
      setError('لم يتم العثور على معرف المجموعة')
      setLoading(false)
    }
  }, [batchId, currentUserId])


  const loadBatchData = async () => {
    if (!currentUserId) {
      return
    }
    
    try {
      setLoading(true)
      setError(null)

      let convertedBatch: Batch | null = null
      try {
        const batchData = await batchesApi.get(batchId)
        
        if (batchData && (batchData.id || batchData.course)) {
          convertedBatch = {
            id: batchData.id || '',
            course: batchData.course,
            course_title: batchData.course_title,
            name: batchData.name,
            type: batchData.type,
            status: batchData.status,
            max_students: batchData.max_students,
            students_count: batchData.students_count,
            students: batchData.students as any || [],
            teacher: batchData.teacher,
            teacher_name: batchData.teacher_name,
            created_at: batchData.created_at || new Date().toISOString(),
            updated_at: batchData.updated_at || new Date().toISOString(),
          }
          setBatch(convertedBatch)
        } else {
          setError('بيانات المجموعة غير صحيحة')
          toast.error('فشل تحميل بيانات المجموعة')
          return
        }
      } catch (error: any) {
        console.error('❌ Error loading batch:', error)
        console.error('❌ Error details:', {
          status: error?.status,
          responseStatus: error?.response?.status,
          dataStatus: error?.data?.status,
          message: error?.message,
          data: error?.data,
          response: error?.response
        })
        
        // Check if error is 403 (Forbidden) or 404 (Not Found) - user doesn't have access
        const status = error?.status || error?.response?.status || error?.response?.statusCode || error?.data?.status
        const statusCode = error?.response?.status || error?.status
        
        if (status === 403 || status === 404 || statusCode === 403 || statusCode === 404) {
          console.log('❌ Access denied: 403/404 error from backend')
          setAccessDenied(true)
          const errorMessage = error?.data?.detail || error?.data?.message || error?.message || error?.response?.data?.detail || 'ليس لديك صلاحية للوصول إلى هذه المجموعة'
          setError(errorMessage)
          toast.error(errorMessage)
          setLoading(false)
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
          return
        }
        
        // If error message indicates permission issue
        const errorMessage = error?.data?.detail || error?.data?.message || error?.message || error?.response?.data?.detail || 'حدث خطأ في تحميل بيانات المجموعة'
        if (errorMessage.includes('permission') || errorMessage.includes('صلاحية') || errorMessage.includes('access') || errorMessage.includes('وصول')) {
          console.log('❌ Access denied: Permission error in message')
          setAccessDenied(true)
          setError(errorMessage)
          toast.error(errorMessage)
          setLoading(false)
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
          return
        }
        
        // Other errors (network, server errors, etc.)
        console.log('❌ Other error (not access-related):', errorMessage)
        setError(errorMessage)
        toast.error(errorMessage)
        return
      }

      let studentsList: BatchStudent[] = []
      try {
        const studentsData = await batchStudentsApi.list({
          batch: batchId,
          ordering: '-created_at'
        })
        studentsList = studentsData?.results || []
        setBatchStudents(studentsList)
      } catch (error) {
        console.error('Error loading batch students:', error)
      }

      // Load community for badges
      if (convertedBatch?.course) {
        try {
          const communitiesResponse = await courseCommunitiesApi.list({
            course: convertedBatch.course,
            page: 1
          })
          if (communitiesResponse.results && communitiesResponse.results.length > 0) {
            setCommunityId(communitiesResponse.results[0].id)
          }
        } catch (error) {
          console.error('Error loading community:', error)
          // Community might not exist yet, that's okay
        }
      }

      // Backend validates access in BatchViewSet.get_queryset()
      // If batch was successfully loaded, it means user has access (teacher or student)
      // No need for frontend access check - backend handles it
      if (convertedBatch) {
        console.log('✅ Batch loaded successfully - access granted by backend')
      }

    } catch (error) {
      console.error('Error loading batch data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async () => {
    if (!studentId.trim()) {
      toast.error('يرجى إدخال معرف الطالب')
      return
    }

    try {
      setAddingStudent(true)
      await batchStudentsApi.create({
        batch: batchId,
        student: studentId
      })
      toast.success('تم إضافة الطالب بنجاح')
      setShowAddStudentDialog(false)
      setStudentId('')
      loadBatchData()
    } catch (error: any) {
      const errorMessage = error?.data?.detail || error?.message || 'حدث خطأ في إضافة الطالب'
      toast.error(errorMessage)
    } finally {
      setAddingStudent(false)
    }
  }

  const handleStartSession = () => {
    setIsSessionActive(!isSessionActive)
  }

  const handleFileUpload = (files: FileList) => {
    console.log('Files uploaded:', files)
  }

  if (loading) {
    return <BatchLoadingState />
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-24 md:pt-28 flex items-center justify-center" dir="rtl">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 mb-2">الوصول مرفوض</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              {error || 'ليس لديك صلاحية للوصول إلى هذه المجموعة. يجب أن تكون المدرس صاحب المجموعة أو طالباً مسجلاً فيها.'}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors"
            >
              العودة إلى لوحة التحكم
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error || (!loading && !batch)) {
    return <BatchErrorState error={error} batchId={batchId} />
  }

  if (!batch) {
    return <BatchLoadingState />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-24 md:pt-28" dir="rtl">
      <div className="flex h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] gap-4 px-4 pb-4">
        <div className="flex-shrink-0">
          <BatchSidebar
            batch={batch}
            batchStudents={batchStudents}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            userRole={userData.role}
            batchId={batchId}
            courseId={batch?.course}
            onStudentsUpdate={loadBatchData}
            communityId={communityId || undefined}
          />
        </div>
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="flex-1 min-h-0">
            <BatchMainContent
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onStartSession={handleStartSession}
              isSessionActive={isSessionActive}
              userRole={userData.role}
              isActualTeacher={userData.isActualTeacher ?? false}
              onAddStudent={() => setShowAddStudentDialog(true)}
              courseId={batch?.course || ''}
              userName={userData.name}
              userAvatar={userData.avatar}
              onFileUpload={handleFileUpload}
              batchId={batchId}
              currentUserId={currentUserId || undefined}
            />
          </div>
        </div>
      </div>
      <AddStudentDialog
        open={showAddStudentDialog}
        onOpenChange={setShowAddStudentDialog}
        studentId={studentId}
        onStudentIdChange={setStudentId}
        onAdd={handleAddStudent}
        adding={addingStudent}
      />
    </div>
  )
}

