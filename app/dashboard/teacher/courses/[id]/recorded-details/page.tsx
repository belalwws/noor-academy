'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BookOpen, FlaskConical, ExternalLink, Layers, Clock, Users } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { recordedCoursesApi } from '@/lib/api/recorded-courses'
import { knowledgeLabApi } from '@/lib/api/knowledge-lab'
import { simpleAuthService } from '@/lib/auth/simpleAuth'

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'

export default function RecordedCourseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params['id'] as string
  const [course, setCourse] = useState<any>(null)
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [knowledgeLab, setKnowledgeLab] = useState<any | null>(null)
  const [loadingLab, setLoadingLab] = useState(false)

  useEffect(() => {
    loadCourseDetails()
    loadKnowledgeLab()
  }, [courseId])

  const loadCourseDetails = async () => {
    try {
      setLoading(true)
      const courseData = await recordedCoursesApi.get(courseId)
      setCourse(courseData)

      // Load units with lessons
      const token = localStorage.getItem('access_token')
      const unitsResponse = await fetch(
        `${API_BASE_URL}/recorded-courses/units/?course=${courseId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (unitsResponse.ok) {
        const unitsData = await unitsResponse.json()
        const unitsList = unitsData.results || []

        // Load detailed units with lessons
        const detailedUnits = await Promise.all(
          unitsList.map(async (unit: any) => {
            const unitDetailResponse = await fetch(
              `${API_BASE_URL}/recorded-courses/units/${unit.id}/`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            )

            if (unitDetailResponse.ok) {
              return await unitDetailResponse.json()
            }
            return unit
          })
        )

        setUnits(detailedUnits)
      }
    } catch (error) {
      console.error('Error loading course details:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadKnowledgeLab = async () => {
    try {
      setLoadingLab(true)
      const validToken = await simpleAuthService.getValidAccessToken()
      if (!validToken) return

      const token = localStorage.getItem('access_token')
      const courseData = await recordedCoursesApi.get(courseId)
      const teacherId = courseData.teacher || (typeof courseData.teacher === 'object' ? courseData.teacher?.id : null)
      
      if (teacherId) {
        const labsResponse = await knowledgeLabApi.listLabs({ 
          teacher: teacherId,
          is_standalone: false
        })
        const labs = labsResponse.data?.results || []
        const courseLab = labs.find((lab: any) => lab.object_id === courseId)
        
        if (courseLab) {
          setKnowledgeLab(courseLab)
        } else {
          setKnowledgeLab(null)
        }
      }
    } catch (error) {
      console.error('Error loading knowledge lab:', error)
      setKnowledgeLab(null)
    } finally {
      setLoadingLab(false)
    }
  }

  const handleCreateKnowledgeLab = () => {
    router.push(`/knowledge-lab/create?courseId=${courseId}&courseType=recorded&courseName=${encodeURIComponent(course?.title || '')}`)
  }

  const handleViewContent = () => {
    router.push(`/course/${courseId}/recorded-content`)
  }

  const totalLessons = units.reduce((sum, unit) => sum + (unit.lessons?.length || 0), 0)
  const totalDuration = units.reduce((sum, unit) => {
    const unitDuration = unit.lessons?.reduce((lessonSum: number, lesson: any) => {
      return lessonSum + (lesson.duration || 0)
    }, 0) || 0
    return sum + unitDuration
  }, 0)

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours} ساعة ${minutes > 0 ? `${minutes} دقيقة` : ''}`
    }
    return `${minutes} دقيقة`
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20 md:pt-24 lg:pt-28 flex items-center justify-center" dir="rtl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20 md:pt-24 lg:pt-28" dir="rtl">
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

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 dark:from-amber-400 dark:via-orange-500 dark:to-amber-600 bg-clip-text text-transparent flex items-center gap-3 mb-2">
                <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-500" />
                {course?.title || 'الدورة المسجلة'}
              </h1>
              {course?.description && (
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                  {course.description}
                </p>
              )}
            </div>
          </motion.div>

          {/* Course Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-amber-200/50 dark:border-amber-800/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">الوحدات</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{units.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-orange-200/50 dark:border-orange-800/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">الدروس</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalLessons}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-amber-200/50 dark:border-amber-800/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">المدة الإجمالية</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatDuration(totalDuration)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
            {/* View Content Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Card 
                className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 border-amber-200/50 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col"
                onClick={handleViewContent}
              >
                <CardHeader className="pb-4 relative overflow-hidden flex-shrink-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-amber-200/30 dark:from-amber-900/20 dark:to-amber-800/10 rounded-full blur-2xl" />
                  <div className="relative z-10 flex items-center gap-4 mb-2">
                    <motion.div 
                      className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0"
                      whileHover={{ rotate: 5 }}
                    >
                      <BookOpen className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                        محتوى الدورة
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                        عرض الوحدات والدروس
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 flex-1 flex flex-col">
                  <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed text-sm md:text-base flex-grow">
                    عرض وإدارة محتوى الدورة المسجلة بما في ذلك الوحدات والدروس والفيديوهات.
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewContent()
                    }}
                  >
                    عرض المحتوى
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Knowledge Lab Card */}
            {loadingLab ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="h-full"
              >
                <Card className="h-full border-2 border-orange-200/50 dark:border-orange-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">جاري التحميل...</p>
                  </div>
                </Card>
              </motion.div>
            ) : knowledgeLab ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -4 }}
                className="h-full"
              >
                <Card 
                  className="h-full hover:shadow-2xl transition-all duration-300 group border-2 border-orange-200/50 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col"
                >
                  <CardHeader className="pb-4 relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/50 to-amber-200/30 dark:from-orange-900/20 dark:to-amber-800/10 rounded-full blur-2xl" />
                    <div className="relative z-10 flex items-center gap-4 mb-2">
                      <motion.div 
                        className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0"
                        whileHover={{ rotate: 5 }}
                      >
                        <FlaskConical className="w-8 h-8 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                          {knowledgeLab.title || 'مختبر المعرفة'}
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                          مختبر معرفة مرتبط بهذه الدورة
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 flex-1 flex flex-col">
                    {knowledgeLab.description && (
                      <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed text-sm md:text-base line-clamp-2">
                        {knowledgeLab.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={
                        knowledgeLab.status === 'approved' 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' 
                          : knowledgeLab.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }>
                        {knowledgeLab.status === 'approved' ? 'معتمد' : knowledgeLab.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                      </Badge>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => router.push(`/knowledge-lab/${knowledgeLab.id}/manage`)}
                    >
                      فتح مختبر المعرفة
                      <ExternalLink className="w-4 h-4 mr-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -4 }}
                className="h-full"
              >
                <Card 
                  className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 border-orange-200/50 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col"
                  onClick={handleCreateKnowledgeLab}
                >
                  <CardHeader className="pb-4 relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/50 to-amber-200/30 dark:from-orange-900/20 dark:to-amber-800/10 rounded-full blur-2xl" />
                    <div className="relative z-10 flex items-center gap-4 mb-2">
                      <motion.div 
                        className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0"
                        whileHover={{ rotate: 5 }}
                      >
                        <FlaskConical className="w-8 h-8 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                          مختبر المعرفة
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                          إنشاء تمارين وأسئلة
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 flex-1 flex flex-col">
                    <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed text-sm md:text-base flex-grow">
                      أنشئ مختبر معرفة مرتبط بهذه الدورة يحتوي على تمارين وأسئلة تفاعلية لطلابك.
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCreateKnowledgeLab()
                      }}
                    >
                      إنشاء مختبر المعرفة
                      <ArrowRight className="w-4 h-4 mr-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

