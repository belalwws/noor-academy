'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { courseCommunitiesApi, type Community } from '@/lib/api/course-communities'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Users, Award, Trophy, MessageSquare, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAppSelector } from '@/lib/hooks'
import { authService } from '@/lib/auth/authService'
import CommunityTabs from './components/CommunityTabs'
import CommunityPostsTab from './components/CommunityPostsTab'
import CommunityBadgesTab from './components/CommunityBadgesTab'
import CommunityLeaderboard from './components/CommunityLeaderboard'
import LatestPostsWidget from './components/LatestPostsWidget'
import MembersPreviewWidget from './components/MembersPreviewWidget'

type TabType = 'posts' | 'badges' | 'leaderboard'

export default function StudentCommunityPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.['courseId'] as string
  const communityId = params?.['communityId'] as string

  const { user } = useAppSelector(state => state.auth)
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('posts')
  const [badgesCount, setBadgesCount] = useState(0)
  const [postsCount, setPostsCount] = useState(0)
  const [membersCount, setMembersCount] = useState(0)

  useEffect(() => {
    if (communityId) {
      loadCommunity()
      loadBadgesCount()
      loadPostsCount()
    }
  }, [communityId])

  useEffect(() => {
    if (community) {
      setMembersCount(community.members?.length || parseInt(community.members_count || '0'))
    }
  }, [community])

  const loadCommunity = async () => {
    try {
      setLoading(true)
      setAccessDenied(false)
      
      // التحقق من أن المستخدم طالب أولاً
      const authData = authService.getStoredAuthData()
      const currentUser = authData?.user || user
      
      if (!currentUser) {
        console.error('❌ No current user found')
        setAccessDenied(true)
        toast.error('يرجى تسجيل الدخول أولاً')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
        return
      }

      // التحقق من أن المستخدم طالب
      if (currentUser.role !== 'student') {
        console.error('❌ Access denied: User is not a student', {
          userRole: currentUser.role
        })
        setAccessDenied(true)
        toast.error('هذه الصفحة متاحة للطلاب فقط')
        
        // محاولة جلب المجتمع للحصول على معرف الكورس
        try {
          const data = await courseCommunitiesApi.get(communityId)
          const actualCourseId = data.course || courseId
          
          // إعادة التوجيه حسب الدور
          setTimeout(() => {
            if (currentUser.role === 'teacher') {
              router.push(`/dashboard/teacher/courses/${actualCourseId}/communities/${communityId}`)
            } else {
              router.push('/dashboard')
            }
          }, 1500)
        } catch (error) {
          // إذا فشل جلب المجتمع، نستخدم courseId من params
          setTimeout(() => {
            if (currentUser.role === 'teacher') {
              router.push(`/dashboard/teacher/courses/${courseId}/communities/${communityId}`)
            } else {
              router.push('/dashboard')
            }
          }, 1500)
        }
        return
      }

      // محاولة جلب المجتمع
      // الـ backend يستخدم get_queryset() الذي يتحقق من أن المستخدم عضو في المجتمع
      const data = await courseCommunitiesApi.get(communityId)
      
      // الحصول على معرف الكورس من المجتمع (أكثر دقة من params)
      const actualCourseId = data.course || courseId
      
      // التحقق من أن الطالب عضو في المجتمع
      const isMember = checkStudentMembership(data, currentUser)
      
      if (!isMember) {
        console.error('❌ Access denied: Student is not a member of the community', {
          studentId: currentUser.id,
          studentEmail: currentUser.email,
          communityMembers: data.members?.length || 0
        })
        setAccessDenied(true)
        toast.error('أنت لست عضوًا في هذا المجتمع')
        
        // إعادة التوجيه إلى صفحة الدورة باستخدام معرف الكورس الصحيح
        setTimeout(() => {
          router.push(`/dashboard/student/course/${actualCourseId}`)
        }, 2000)
        return
      }
      
      console.log('✅ Student is a member of the community')
      setCommunity(data)
    } catch (error: any) {
      console.error('❌ Error loading community:', error)
      
      // إذا كان الخطأ 403 أو 404، يعني أن المستخدم ليس عضوًا في المجتمع
      const status = error?.status || error?.response?.status || error?.response?.statusCode
      if (status === 403 || status === 404) {
        setAccessDenied(true)
        toast.error('أنت لست عضوًا في هذا المجتمع')
        console.log('🚫 Access denied by backend (403/404) - Student is not a member')
        
        // إعادة التوجيه إلى صفحة الدورة
        // نستخدم courseId من params (لأننا لم نتمكن من جلب بيانات المجتمع)
        setTimeout(() => {
          router.push(`/dashboard/student/course/${courseId}`)
        }, 2000)
      } else {
        toast.error('فشل تحميل المجتمع')
        console.error('❌ Failed to load community:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const checkStudentMembership = (communityData: Community, currentUser: any): boolean => {
    try {
      // التحقق من وجود الطالب في قائمة الأعضاء
      if (communityData.members && Array.isArray(communityData.members)) {
        const userEmail = currentUser.email?.toLowerCase().trim()
        const userId = currentUser.id?.toString()
        
        const isMember = communityData.members.some(member => {
          const memberEmail = member.user?.email?.toLowerCase().trim()
          const memberUserId = member.user?.id?.toString()
          
          // التحقق من أن العضو نشط
          const isActive = member.status === 'active'
          
          // التحقق من المطابقة بالـ email أو ID
          const emailMatch = userEmail && memberEmail && userEmail === memberEmail
          const idMatch = userId && memberUserId && userId === memberUserId
          
          return isActive && (emailMatch || idMatch)
        })
        
        console.log('🔍 Checking student membership:', {
          studentEmail: userEmail,
          studentId: userId,
          totalMembers: communityData.members.length,
          isMember: isMember,
          members: communityData.members.map(m => ({
            email: m.user?.email,
            id: m.user?.id,
            status: m.status,
            role: m.role
          }))
        })
        
        return isMember
      }
      
      // إذا لم تكن قائمة الأعضاء متوفرة، نعتمد على الـ backend
      // (إذا نجح الطلب، يعني أن الطالب عضو)
      console.log('⚠️ Members list not available, relying on backend verification')
      return true
    } catch (error) {
      console.error('❌ Error checking student membership:', error)
      // في حالة الخطأ، نعتمد على الـ backend (إذا نجح الطلب، يعني أن الطالب عضو)
      return true
    }
  }

  const loadBadgesCount = async () => {
    try {
      const response = await courseCommunitiesApi.listBadges({ community: communityId })
      setBadgesCount(response.count || 0)
    } catch (error) {
      console.error('Error loading badges count:', error)
    }
  }

  const loadPostsCount = async () => {
    try {
      const response = await courseCommunitiesApi.listPosts({ community: communityId })
      setPostsCount(response.count || 0)
    } catch (error) {
      console.error('Error loading posts count:', error)
    }
  }

  const handleUpdate = () => {
    loadCommunity()
    loadBadgesCount()
    loadPostsCount()
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950" dir="rtl">
          <Skeleton className="h-64 w-full" />
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
            <Skeleton className="h-32 w-full mb-8" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (accessDenied) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-20 pb-16 flex items-center justify-center" dir="rtl">
          <div className="max-w-md w-full mx-4">
            <Card className="shadow-lg border-red-200 dark:border-red-900">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  الوصول مرفوض
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                  أنت لست عضوًا في هذا المجتمع
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  يجب أن تكون عضوًا في المجتمع للوصول إلى هذه الصفحة. يرجى التواصل مع المعلم للانضمام إلى المجتمع.
                </p>
                <Button
                  onClick={() => router.push(`/dashboard/student/course/${courseId}`)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة إلى الكورس
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!community) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-20 pb-16" dir="rtl">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">المجتمع غير موجود</p>
                <Button
                  onClick={() => router.push(`/dashboard/student/course/${courseId}`)}
                  className="mt-4"
                >
                  العودة إلى الكورس
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Get community initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950" dir="rtl">
        {/* Banner Section */}
        <div className="relative w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 overflow-hidden">
          {/* Cover Image */}
          {community.cover_image ? (
            <img
              src={community.cover_image}
              alt={community.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600">
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              </div>
            </div>
          )}
          
          {/* Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/dashboard/student/course/${courseId}`)}
              className="bg-white/95 hover:bg-white text-gray-900 shadow-xl backdrop-blur-md border border-white/20"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </div>

          {/* Profile Info Over Banner */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                {/* Community Avatar */}
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="relative"
                >
                  <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white ring-4 ring-white/50">
                    {community.cover_image ? (
                      <img
                        src={community.cover_image}
                        alt={community.name}
                        className="w-full h-full rounded-xl md:rounded-2xl object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : null}
                    {!community.cover_image && (
                      <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                        <span className="text-3xl md:text-4xl font-bold text-white">
                          {getInitials(community.name)}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Status Badge */}
                  <div className="absolute -bottom-2 -right-2 z-10">
                    <Badge className={`${community.status === 'active' ? 'bg-amber-500' : 'bg-gray-500'} text-white border-2 border-white shadow-xl px-3 py-1 text-sm font-semibold`}>
                      {community.status === 'active' ? 'نشط' : 'مؤرشف'}
                    </Badge>
                  </div>
                </motion.div>

                {/* Community Info */}
                <div className="flex-1 text-center md:text-right text-white">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
                    {community.name}
                  </h1>
                  <p className="text-white/90 mb-2 drop-shadow-md">
                    {community.description}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-white/80">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>انضم في {formatDate(community.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{membersCount} عضو</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <CommunityTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              postsCount={postsCount}
              badgesCount={badgesCount}
            />
          </motion.div>

          {/* Content with Sidebar */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {activeTab === 'posts' && (
                  <CommunityPostsTab communityId={communityId} />
                )}
                {activeTab === 'badges' && (
                  <CommunityBadgesTab communityId={communityId} />
                )}
                {activeTab === 'leaderboard' && (
                  <CommunityLeaderboard community={community} />
                )}
              </motion.div>
            </div>

            {/* Sidebar Widgets */}
            <div className="w-full lg:w-80 space-y-6">
              {/* Community Stats */}
              <Card className="shadow-md border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-200 dark:border-amber-800 pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">إحصائيات المجتمع</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">المنشورات</span>
                    </div>
                    <span className="font-bold text-lg text-amber-600 dark:text-amber-400">{postsCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">الشارات</span>
                    </div>
                    <span className="font-bold text-lg text-amber-600 dark:text-amber-400">{badgesCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">الأعضاء</span>
                    </div>
                    <span className="font-bold text-lg text-amber-600 dark:text-amber-400">{membersCount}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Latest Posts Widget */}
              <LatestPostsWidget communityId={communityId} />

              {/* Members Preview Widget */}
              <MembersPreviewWidget community={community} />

              {/* Community Rules */}
              {community.rules && (
                <Card className="shadow-md border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-200 dark:border-amber-800 pb-3">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">قواعد المجتمع</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      {typeof community.rules === 'string' 
                        ? community.rules.split('\n').filter(r => r.trim()).map((rule, index) => (
                            <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                              <CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{rule.trim()}</span>
                            </div>
                          ))
                        : Array.isArray(community.rules) 
                        ? community.rules.map((rule, index) => (
                            <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                              <CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{rule}</span>
                            </div>
                          ))
                        : null}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Course Info */}
              <Card className="shadow-md border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-200 dark:border-amber-800 pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">معلومات الكورس</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    {community.course_title || 'الكورس المرتبط'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/student/course/${courseId}`)}
                    className="w-full border-2 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:border-amber-300 dark:hover:border-amber-700 transition-all"
                  >
                    عرض الكورس
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
