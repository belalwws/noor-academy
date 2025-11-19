'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, FlaskConical, GraduationCap, BookOpen, MessageSquare } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { batchesApi, batchStudentsApi } from '@/lib/api/batches'
import { liveEducationApi } from '@/lib/api/live-education'
import { knowledgeLabApi } from '@/lib/api/knowledge-lab'
import { courseCommunitiesApi, type Community } from '@/lib/api/course-communities'
import { toast } from 'sonner'

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'

export default function LiveCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<any>(null)
  const [batches, setBatches] = useState<any[]>([])
  const [knowledgeLab, setKnowledgeLab] = useState<any>(null)
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId) {
      loadData()
    }
  }, [courseId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load course details
      const courseData = await liveEducationApi.courses.get(courseId)
      setCourse(courseData)

      // Load batches for this course
      try {
        // Get all batches for the current student
        const batchesResponse = await batchStudentsApi.list({
          ordering: '-created_at'
        })
        
        console.log('📦 All batches for student:', batchesResponse.results)
        
        // Filter batches by course and get batch details
        const batchesWithDetails = await Promise.all(
          (batchesResponse.results || []).map(async (batchStudent: any) => {
            try {
              const batchDetails = await batchesApi.get(batchStudent.batch)
              console.log('🔍 Checking batch:', {
                batchId: batchStudent.batch,
                batchCourseId: batchDetails.course,
                targetCourseId: courseId,
                match: batchDetails.course === courseId || String(batchDetails.course) === String(courseId)
              })
              
              // Filter by course ID
              if (batchDetails.course === courseId || String(batchDetails.course) === String(courseId)) {
                return {
                  ...batchStudent,
                  batch_details: batchDetails
                }
              }
              return null
            } catch (error) {
              console.error('Error fetching batch details:', error)
              return null
            }
          })
        )
        
        // Filter out null values
        const validBatches = batchesWithDetails.filter(b => b !== null)
        console.log('✅ Filtered batches for course:', validBatches)
        setBatches(validBatches)
      } catch (error) {
        console.error('Error loading batches:', error)
        toast.error('حدث خطأ في تحميل المجموعات')
        setBatches([])
      }

      // Load knowledge lab if exists
      try {
        // Get content type ID for live course (usually 1 or check from API)
        // Search for knowledge labs with this course as object_id
        const labsResponse = await knowledgeLabApi.listLabs({
          is_standalone: false,
          ordering: '-created_at'
        })
        
        if (labsResponse.success && labsResponse.data) {
          const labs = labsResponse.data.results || []
          console.log('🔬 All knowledge labs:', labs)
          
          // Find knowledge lab for this course
          // object_id should match courseId and content_type should be for live course
          const courseLab = labs.find((lab: any) => {
            const matches = String(lab.object_id) === String(courseId)
            console.log('🔍 Checking lab:', {
              labId: lab.id,
              labObjectId: lab.object_id,
              courseId: courseId,
              matches
            })
            return matches
          })
          
          if (courseLab) {
            console.log('✅ Found knowledge lab for course:', courseLab)
            setKnowledgeLab(courseLab)
          } else {
            console.log('ℹ️ No knowledge lab found for this course')
            setKnowledgeLab(null)
          }
        } else {
          console.log('ℹ️ No knowledge labs response or error')
          setKnowledgeLab(null)
        }
      } catch (error) {
        console.error('Error loading knowledge lab:', error)
        setKnowledgeLab(null)
      }

      // Load communities for this course
      try {
        const communitiesResponse = await courseCommunitiesApi.list({ course: courseId })
        setCommunities(communitiesResponse.results || [])
        console.log('✅ Loaded communities:', communitiesResponse.results)
      } catch (error) {
        console.error('Error loading communities:', error)
        toast.error('حدث خطأ في تحميل المجتمعات')
        setCommunities([])
      }
    } catch (error) {
      console.error('Error loading course data:', error)
      toast.error('حدث خطأ في تحميل بيانات الدورة')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenBatch = (batchId: string) => {
    router.push(`/interface-batch/${batchId}`)
  }

  const handleOpenKnowledgeLab = () => {
    if (knowledgeLab) {
      router.push(`/knowledge-lab/${knowledgeLab.id}`)
    } else {
      toast.info('مختبر المعرفة غير متاح لهذه الدورة')
    }
  }

  const handleOpenCommunity = (communityId: string) => {
    router.push(`/dashboard/student/course/${courseId}/community/${communityId}`)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pt-20 pb-16" dir="rtl">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pt-20 pb-16" dir="rtl">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/student')}
              className="mb-4"
            >
              <ArrowLeft className="ml-2" size={20} />
              العودة
            </Button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              {course?.title || 'الدورة المباشرة'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              اختر من الخيارات التالية للوصول إلى محتوى الدورة
            </p>
          </motion.div>

          {/* Four Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: المجموعات */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-xl">المجموعات</CardTitle>
                  </div>
                  <CardDescription>
                    عرض وإدارة مجموعات الدورة التعليمية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {batches.length > 0 ? (
                    <div className="space-y-3">
                      {batches.map((batch) => (
                        <motion.div
                          key={batch.id || batch.batch}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            className="p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
                            onClick={() => handleOpenBatch(batch.batch)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                                  {batch.batch_details?.name || `المجموعة ${batch.batch}`}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      batch.batch_details?.type === 'group' 
                                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700'
                                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                                    }`}
                                  >
                                    {batch.batch_details?.type === 'group' ? 'جماعي' : batch.batch_details?.type === 'individual' ? 'فردي' : 'غير محدد'}
                                  </Badge>
                                  {batch.batch_details?.status && (
                                    <Badge 
                                      variant="outline"
                                      className={`text-xs ${
                                        batch.batch_details.status === 'active'
                                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700'
                                          : 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                      }`}
                                    >
                                      {batch.batch_details.status === 'active' ? 'نشط' : 'مغلق'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-left ml-3">
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                                  {batch.batch_details?.students_count || 0} طالب
                                </Badge>
                                {batch.batch_details?.max_students && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    من {batch.batch_details.max_students}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد مجموعات متاحة</p>
                      <p className="text-xs mt-2">لم يتم إضافتك إلى أي مجموعة في هذه الدورة بعد</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Option 2: مختبر المعرفة */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <FlaskConical className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <CardTitle className="text-xl">مختبر المعرفة</CardTitle>
                  </div>
                  <CardDescription>
                    بنك الأسئلة والتمارين التفاعلية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {knowledgeLab ? (
                    <div className="space-y-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className="w-full"
                          onClick={handleOpenKnowledgeLab}
                        >
                          <FlaskConical className="ml-2" size={20} />
                          فتح مختبر المعرفة
                        </Button>
                      </motion.div>
                      
                      {/* Knowledge Lab Info */}
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2 text-sm">
                          {knowledgeLab.title}
                        </h4>
                        {knowledgeLab.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                            {knowledgeLab.description}
                          </p>
                        )}
                        {knowledgeLab.questions_count && (
                          <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300">
                            <BookOpen size={14} />
                            <span>{knowledgeLab.questions_count} سؤال</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>مختبر المعرفة غير متاح</p>
                      <p className="text-xs mt-2">لم يتم إنشاء مختبر معرفة لهذه الدورة بعد</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Option 3: المجتمعات */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-xl">المجتمعات</CardTitle>
                  </div>
                  <CardDescription>
                    مجتمعات النقاش والتفاعل في الدورة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {communities.length > 0 ? (
                    <div className="space-y-3">
                      {communities.map((community) => (
                        <motion.div
                          key={community.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            className="p-4 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer border border-green-200 dark:border-green-800"
                            onClick={() => handleOpenCommunity(community.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                                  {community.name}
                                </h3>
                                {community.description && (
                                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                                    {community.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge 
                                    variant="outline"
                                    className={`text-xs ${
                                      community.status === 'active'
                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700'
                                        : 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    {community.status_display}
                                  </Badge>
                                  {community.members_count && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                                      {community.members_count} عضو
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد مجتمعات متاحة</p>
                      <p className="text-xs mt-2">لم يتم إنشاء مجتمعات لهذه الدورة بعد</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Option 4: غرفة الدراسة */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-xl">غرفة الدراسة</CardTitle>
                  </div>
                  <CardDescription>
                    بيئة تعليمية تفاعلية للدراسة الجماعية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center"
                    >
                      <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </motion.div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      قريباً
                    </p>
                    <Badge variant="outline" className="text-xs">
                      قيد التطوير
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

