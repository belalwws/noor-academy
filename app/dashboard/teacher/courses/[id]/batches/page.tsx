'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Users, User, ArrowLeft, FlaskConical, MessageSquare, ExternalLink, Settings } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { knowledgeLabApi } from '@/lib/api/knowledge-lab'
import { simpleAuthService } from '@/lib/auth/simpleAuth'

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'

export default function CourseBatchesPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params['id'] as string
  const [courseName, setCourseName] = useState('الدورة')
  const [knowledgeLab, setKnowledgeLab] = useState<any | null>(null)
  const [loadingLab, setLoadingLab] = useState(false)

  useEffect(() => {
    // Fetch course details to get the name
    const fetchCourseDetails = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${API_BASE_URL}/live-courses/courses/${courseId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setCourseName(data.title || 'الدورة')
        }
      } catch (error) {
        console.error('Error fetching course details:', error)
      }
    }
    fetchCourseDetails()
  }, [courseId])

  // Fetch knowledge lab for this course
  useEffect(() => {
    const fetchKnowledgeLab = async () => {
      try {
        setLoadingLab(true)
        const validToken = await simpleAuthService.getValidAccessToken()
        if (!validToken) return

        // Get teacher ID from course or user
        const token = localStorage.getItem('access_token')
        const courseResponse = await fetch(`${API_BASE_URL}/live-courses/courses/${courseId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (courseResponse.ok) {
          const courseData = await courseResponse.json()
          const teacherId = courseData.teacher || (typeof courseData.teacher === 'object' ? courseData.teacher?.id : null)
          
          if (teacherId) {
            // Fetch labs for this teacher
            const labsResponse = await knowledgeLabApi.listLabs({ 
              teacher: teacherId,
              is_standalone: false // Only get labs linked to courses
            })
            const labs = labsResponse.data?.results || []
            
            // Filter labs by object_id matching course.id
            const courseLab = labs.find((lab: any) => lab.object_id === courseId)
            
            if (courseLab) {
              setKnowledgeLab(courseLab)
            } else {
              setKnowledgeLab(null)
            }
          }
        }
      } catch (error) {
        console.error('Error loading knowledge lab:', error)
        setKnowledgeLab(null)
      } finally {
        setLoadingLab(false)
      }
    }

    fetchKnowledgeLab()
  }, [courseId])

  const handleIndividualBatches = () => {
    router.push(`/dashboard/teacher/courses/${courseId}/course-management/individual`)
  }

  const handleGroupBatches = () => {
    router.push(`/dashboard/teacher/courses/${courseId}/course-management/group`)
  }

  const handleCreateKnowledgeLab = () => {
    // Navigate to Knowledge Lab creation page with course info
    router.push(`/knowledge-lab/create?courseId=${courseId}&courseType=live&courseName=${encodeURIComponent(courseName)}`)
  }

  const handleManageCommunities = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    // Navigate to communities page
    router.push(`/dashboard/teacher/courses/${courseId}/communities`)
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
            className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-200/20 dark:from-green-900/10 dark:to-emerald-900/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="shrink-0 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Batch Type Cards */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
            {/* Individual Batches Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Card 
                className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col"
                onClick={handleIndividualBatches}
              >
                <CardHeader className="pb-4 relative overflow-hidden flex-shrink-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-blue-200/30 dark:from-blue-900/20 dark:to-blue-800/10 rounded-full blur-2xl" />
                  <div className="relative z-10 flex items-center gap-4 mb-2">
                    <motion.div 
                      className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0"
                      whileHover={{ rotate: 5 }}
                    >
                      <User className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                        المجموعات الفردية
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                        طالب واحد في كل مجموعة
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 flex-1 flex flex-col">
                  <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed text-sm md:text-base flex-grow">
                    إدارة المجموعات الفردية حيث كل مجموعة تحتوي على طالب واحد فقط. 
                    مناسب للدروس الخاصة والتوجيه الفردي.
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleIndividualBatches()
                    }}
                  >
                    عرض المجموعات الفردية
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Group Batches Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Card 
                className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col"
                onClick={handleGroupBatches}
              >
                <CardHeader className="pb-4 relative overflow-hidden flex-shrink-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-purple-200/30 dark:from-purple-900/20 dark:to-purple-800/10 rounded-full blur-2xl" />
                  <div className="relative z-10 flex items-center gap-4 mb-2">
                    <motion.div 
                      className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0"
                      whileHover={{ rotate: 5 }}
                    >
                      <Users className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                        المجموعات الجماعية
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                        حتى 200 طالب في كل مجموعة
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 flex-1 flex flex-col">
                  <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed text-sm md:text-base flex-grow">
                    إدارة المجموعات الجماعية حيث يمكن أن تحتوي كل مجموعة على حتى 200 طالب. 
                    مناسب للدروس الجماعية والفصول الدراسية الكبيرة.
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGroupBatches()
                    }}
                  >
                    عرض المجموعات الجماعية
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Knowledge Lab Card - Show existing lab or create new */}
            {loadingLab ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
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
              // Show existing knowledge lab
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
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
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
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
              // Show create knowledge lab card
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
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

            {/* Communities Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Card 
                className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 border-green-200/50 dark:border-green-800/50 hover:border-green-400 dark:hover:border-green-600 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col"
                onClick={(e) => handleManageCommunities(e)}
              >
                <CardHeader className="pb-4 relative overflow-hidden flex-shrink-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-emerald-200/30 dark:from-green-900/20 dark:to-emerald-800/10 rounded-full blur-2xl" />
                  <div className="relative z-10 flex items-center gap-4 mb-2">
                    <motion.div 
                      className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0"
                      whileHover={{ rotate: 5 }}
                    >
                      <MessageSquare className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                        المجتمعات
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                        إنشاء وإدارة المجتمعات
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 flex-1 flex flex-col">
                  <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed text-sm md:text-base flex-grow">
                    أنشئ مجتمعات للطلاب للتفاعل والمناقشة حول هذه الدورة مع إمكانية إدارة الأعضاء والأنشطة.
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleManageCommunities(e)
                    }}
                  >
                    إدارة المجتمعات
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

