'use client'

import React, { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { courseCommunitiesApi, type Community } from '@/lib/api/course-communities'
import { liveEducationApi } from '@/lib/api/live-education'
import { recordedCoursesApi } from '@/lib/api/recorded-courses'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Settings,
  MessageSquare,
  Users
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import type { FC } from 'react'

export default function CommunitiesPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.['id'] as string

  const [course, setCourse] = useState<any>(null)
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCommunities, setLoadingCommunities] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
    cover_image: ''
  })

  const loadCourseDetails = async () => {
    try {
      setLoading(true)
      // Try to load as live course first
      try {
        const data = await liveEducationApi.courses.get(courseId)
        setCourse(data as any)
      } catch (liveError) {
        // If it fails, try as recorded course
        try {
          const data = await recordedCoursesApi.get(courseId)
          setCourse(data as any)
        } catch (recordedError) {
          console.error('Error loading course:', recordedError)
        }
      }
    } catch (error) {
      console.error('Error loading course:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCommunities = async () => {
    try {
      setLoadingCommunities(true)
      const response = await courseCommunitiesApi.list({ course: courseId })
      setCommunities(response.results || [])
    } catch (error) {
      console.error('Error loading communities:', error)
      toast.error('فشل تحميل المجتمعات')
    } finally {
      setLoadingCommunities(false)
    }
  }

  useEffect(() => {
    if (courseId) {
      loadCourseDetails()
      loadCommunities()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const handleCreateCommunity = async () => {
    try {
      await courseCommunitiesApi.create({
        course: courseId,
        name: formData.name,
        description: formData.description,
        rules: formData.rules || undefined,
        cover_image: formData.cover_image || undefined
      })
      toast.success('تم إنشاء المجتمع بنجاح')
      setShowCreateDialog(false)
      setFormData({ name: '', description: '', rules: '', cover_image: '' })
      loadCommunities()
    } catch (error: any) {
      console.error('Error creating community:', error)
      toast.error(error?.response?.data?.detail || 'فشل إنشاء المجتمع')
    }
  }

  const handleUpdateCommunity = async () => {
    if (!selectedCommunity) return
    try {
      await courseCommunitiesApi.update(selectedCommunity.id, {
        name: formData.name,
        description: formData.description,
        rules: formData.rules || undefined,
        cover_image: formData.cover_image || undefined
      })
      toast.success('تم تحديث المجتمع بنجاح')
      setShowEditDialog(false)
      setSelectedCommunity(null)
      setFormData({ name: '', description: '', rules: '', cover_image: '' })
      loadCommunities()
    } catch (error: any) {
      console.error('Error updating community:', error)
      toast.error(error?.response?.data?.detail || 'فشل تحديث المجتمع')
    }
  }

  const handleDeleteCommunity = async () => {
    if (!selectedCommunity) return
    try {
      await courseCommunitiesApi.delete(selectedCommunity.id)
      toast.success('تم حذف المجتمع بنجاح')
      setShowDeleteDialog(false)
      setSelectedCommunity(null)
      loadCommunities()
    } catch (error: any) {
      console.error('Error deleting community:', error)
      toast.error(error?.response?.data?.detail || 'فشل حذف المجتمع')
    }
  }

  const openEditDialog = (community: Community) => {
    setSelectedCommunity(community)
    setFormData({
      name: community.name,
      description: community.description,
      rules: community.rules || '',
      cover_image: community.cover_image || ''
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (community: Community) => {
    setSelectedCommunity(community)
    setShowDeleteDialog(true)
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      {loading ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20 md:pt-24 lg:pt-28 pb-16 mt-20 flex items-center justify-center" dir="rtl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20 md:pt-24 lg:pt-28 pb-16 mt-20" dir="rtl">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 top-20 md:top-24 lg:top-28">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-200/20 dark:from-amber-900/10 dark:to-orange-900/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-orange-200/20 to-amber-200/20 dark:from-orange-900/10 dark:to-amber-900/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/teacher/courses/${courseId}/course-management`)}
                  className="w-10 h-10 p-0 shrink-0 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 dark:from-amber-400 dark:via-orange-500 dark:to-amber-600 bg-clip-text text-transparent flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                    إدارة المجتمعات
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                    {course?.title || 'الدورة'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Communities Grid */}
          {loadingCommunities ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-80 w-full rounded-xl" />
              ))}
            </div>
          ) : communities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-2 border-dashed border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg">
                <CardContent className="pt-16 pb-16 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center mb-6"
                  >
                    <MessageSquare className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                    لا توجد مجتمعات
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg max-w-md mx-auto">
                    لم يتم إنشاء أي مجتمعات لهذه الدورة بعد. ابدأ بإنشاء مجتمع جديد للطلاب للتفاعل والمناقشة.
                  </p>
                  <Button
                    onClick={() => {
                      setFormData({ name: '', description: '', rules: '', cover_image: '' })
                      setShowCreateDialog(true)
                    }}
                    className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg"
                  >
                    <Plus className="w-5 h-5" />
                    إنشاء مجتمع جديد
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {communities.map((community, idx) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="h-full"
                >
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-amber-200/50 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col group">
                    {community.cover_image ? (
                      <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                        <img
                          src={community.cover_image}
                          alt={community.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <Badge
                            variant={community.status === 'active' ? 'default' : 'secondary'}
                            className={`${
                              community.status === 'active'
                                ? 'bg-amber-500/90 text-white border-amber-400'
                                : 'bg-slate-500/90 text-white border-slate-400'
                            } backdrop-blur-sm`}
                          >
                            {community.status_display}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-40 w-full bg-gradient-to-br from-amber-100 via-orange-100 to-amber-50 dark:from-amber-900/30 dark:via-orange-900/30 dark:to-amber-800/20 rounded-t-lg flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-t-lg" />
                        <MessageSquare className="w-16 h-16 text-amber-600/50 dark:text-amber-400/50 relative z-10" />
                        <div className="absolute top-3 left-3">
                          <Badge
                            variant={community.status === 'active' ? 'default' : 'secondary'}
                            className={`${
                              community.status === 'active'
                                ? 'bg-amber-500/90 text-white border-amber-400'
                                : 'bg-slate-500/90 text-white border-slate-400'
                            } backdrop-blur-sm`}
                          >
                            {community.status_display}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardHeader className="flex-shrink-0 pb-4">
                      <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
                        {community.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                        {community.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col pt-0">
                      <div className="flex items-center gap-2 text-sm md:text-base text-slate-600 dark:text-slate-400 mb-6">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="font-semibold">{community.members_count} عضو</span>
                      </div>
                      <div className="flex items-center gap-2 mt-auto">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => router.push(`/dashboard/teacher/courses/${courseId}/communities/${community.id}`)}
                          className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="hidden sm:inline">الدخول للمجتمع</span>
                          <span className="sm:hidden">فتح</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(community)}
                          className="gap-1 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="تعديل"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(community)}
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Create Community Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto overflow-x-hidden p-0 bg-white dark:bg-slate-900 mt-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" dir="rtl">
            <div className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-xl p-4 overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.15, 0.3, 0.15],
                    x: [0, 40, 0],
                    y: [0, 30, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-300/40 to-orange-300/30 dark:from-amber-600/25 dark:to-orange-700/20 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.1, 0.25, 0.1],
                    x: [0, -30, 0],
                    y: [0, -25, 0],
                    rotate: [360, 180, 0]
                  }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-300/30 to-amber-300/25 dark:from-orange-600/20 dark:to-amber-700/15 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                    x: [0, 20, 0],
                    y: [0, -20, 0]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-br from-orange-300/20 to-amber-300/15 dark:from-orange-600/15 dark:to-amber-700/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"
                />
              </div>

              <div className="relative z-10 w-full">
                <DialogHeader className="text-center pb-4 w-full">
                  <div className="mx-auto w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-500 dark:to-orange-500 rounded-xl flex items-center justify-center mb-3 shadow-xl">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-2">
                    إنشاء مجتمع جديد
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm">
                    قم بإنشاء مجتمع للطلاب للتفاعل والمناقشة حول هذه الدورة
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 relative z-10 w-full">
                  {/* Community Name */}
                  <div className="w-full">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                      اسم المجتمع <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: مجتمع دورة الفقه"
                      className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-lg transition-all duration-300 bg-white dark:bg-slate-800 w-full"
                    />
                  </div>

                  {/* Description */}
                  <div className="w-full">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                      الوصف <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="وصف المجتمع وأهدافه وطبيعة التفاعل المتوقع"
                      rows={3}
                      className="text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-lg transition-all duration-300 bg-white dark:bg-slate-800 resize-none w-full"
                    />
                  </div>

                  {/* Rules */}
                  <div className="w-full">
                    <Label htmlFor="rules" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                      القواعد <span className="text-gray-500 text-xs">(اختياري)</span>
                    </Label>
                    <Textarea
                      id="rules"
                      value={formData.rules}
                      onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                      placeholder="قواعد المجتمع وسياساته وآداب النقاش"
                      rows={2}
                      className="text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-lg transition-all duration-300 bg-white dark:bg-slate-800 resize-none w-full"
                    />
                  </div>

                  {/* Cover Image */}
                  <div className="w-full">
                    <Label htmlFor="cover_image" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                      رابط صورة الغلاف <span className="text-gray-500 text-xs">(اختياري)</span>
                    </Label>
                    <Input
                      id="cover_image"
                      value={formData.cover_image}
                      onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-lg transition-all duration-300 bg-white dark:bg-slate-800 w-full"
                    />
                    {formData.cover_image && (
                      <div className="mt-3 rounded-lg overflow-hidden border-2 border-amber-200 dark:border-amber-800">
                        <img
                          src={formData.cover_image}
                          alt="Preview"
                          className="w-full h-24 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 relative z-10 w-full">
                  <div className="flex gap-3 w-full">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      className="flex-1 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300"
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleCreateCommunity}
                      disabled={!formData.name || !formData.description}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        إنشاء المجتمع
                      </span>
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Community Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-2xl max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-hidden p-0 bg-white dark:bg-slate-900 mt-16 mb-4" dir="rtl">
            <div className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-4 sm:p-5 backdrop-blur-sm max-h-[80vh] flex flex-col">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.15, 0.3, 0.15],
                    x: [0, 40, 0],
                    y: [0, 30, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-300/40 to-orange-300/30 dark:from-amber-600/25 dark:to-orange-700/20 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.1, 0.25, 0.1],
                    x: [0, -30, 0],
                    y: [0, -25, 0],
                    rotate: [360, 180, 0]
                  }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-300/30 to-amber-300/25 dark:from-orange-600/20 dark:to-amber-700/15 rounded-full blur-3xl"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 flex flex-col flex-1 min-h-0"
              >
                <DialogHeader className="text-right pb-3 flex-shrink-0">
                  <motion.div
                    className="mr-auto w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-500 dark:to-orange-500 rounded-xl flex items-center justify-center mb-2 shadow-xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Settings className="w-7 h-7 text-white" />
                  </motion.div>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-1 text-right">
                    تعديل المجتمع
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400 text-xs text-right">
                    قم بتعديل معلومات المجتمع
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 relative z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-3 rounded-xl overflow-x-hidden overflow-y-auto flex-1 min-h-0">
                  {/* Community Name */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                      اسم المجتمع <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: مجتمع دورة الفقه"
                      className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl transition-all duration-300 bg-white dark:bg-slate-800 w-full"
                      dir="rtl"
                    />
                  </motion.div>

                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                      الوصف <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="وصف المجتمع وأهدافه وطبيعة التفاعل المتوقع"
                      rows={2}
                      className="text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-lg transition-all duration-300 bg-white dark:bg-slate-800 resize-none w-full"
                      dir="rtl"
                    />
                  </motion.div>

                  {/* Rules */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="edit-rules" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                      القواعد <span className="text-gray-500 text-xs">(اختياري)</span>
                    </Label>
                    <Textarea
                      id="edit-rules"
                      value={formData.rules}
                      onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                      placeholder="قواعد المجتمع وسياساته وآداب النقاش"
                      rows={2}
                      className="text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-lg transition-all duration-300 bg-white dark:bg-slate-800 resize-none w-full"
                      dir="rtl"
                    />
                  </motion.div>

                  {/* Cover Image */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Label htmlFor="edit-cover_image" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                      رابط صورة الغلاف <span className="text-gray-500 text-xs">(اختياري)</span>
                    </Label>
                    <Input
                      id="edit-cover_image"
                      value={formData.cover_image}
                      onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl transition-all duration-300 bg-white dark:bg-slate-800 w-full"
                      dir="ltr"
                    />
                    {formData.cover_image && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 rounded-lg overflow-hidden border-2 border-amber-200 dark:border-amber-800"
                      >
                        <img
                          src={formData.cover_image}
                          alt="Preview"
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                <DialogFooter className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 relative z-10 flex-shrink-0" dir="ltr">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => setShowEditDialog(false)}
                      className="flex-1 sm:flex-none border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300"
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleUpdateCommunity}
                      disabled={!formData.name || !formData.description}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        حفظ
                      </span>
                    </Button>
                  </div>
                </DialogFooter>
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Community Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-red-200 dark:border-red-800 shadow-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-red-600 dark:text-red-400 text-xl font-bold text-right">
                تأكيد الحذف
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400 text-right">
                هل أنت متأكد من رغبتك في حذف المجتمع "{selectedCommunity?.name}"؟ 
                <br />
                <span className="font-semibold text-red-600 dark:text-red-400">
                  لا يمكن التراجع عن هذه العملية.
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                إلغاء
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteCommunity}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      )}
    </ProtectedRoute>
  )
}

