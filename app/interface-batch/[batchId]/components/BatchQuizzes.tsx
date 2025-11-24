'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { quizzesApi, type Quiz, type QuizListItem } from '@/lib/api/quizzes'
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  HelpCircle,
  CheckCircle,
  XCircle,
  FileText,
  Play,
  Award,
  BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'

interface BatchQuizzesProps {
  batchId: string
  userRole: 'teacher' | 'student'
  onPendingQuizzesChange?: (count: number) => void
}

// Student Quiz type from the API
interface StudentQuiz extends Quiz {
  student_best_score?: string | number
  student_attempts_count?: string | number
  can_retake?: string | boolean
}

export default function BatchQuizzes({ batchId, userRole, onPendingQuizzesChange }: BatchQuizzesProps) {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<QuizListItem[] | StudentQuiz[]>([])
  const [loading, setLoading] = useState(true)
  const [quizDetails, setQuizDetails] = useState<Quiz | StudentQuiz | null>(null)
  const [showQuizDetails, setShowQuizDetails] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadQuizzes()
  }, [batchId, userRole])

  // Update pending count when quizzes change (for students)
  useEffect(() => {
    if (userRole === 'student' && onPendingQuizzesChange && quizzes.length > 0) {
      const studentQuizzes = quizzes as StudentQuiz[]
      const pendingCount = studentQuizzes.filter((quiz: StudentQuiz) => {
        const attemptsCount = Number(quiz.student_attempts_count) || 0
        const canRetake = quiz.can_retake === true || quiz.can_retake === 'true'
        // Pending if: not started (0 attempts) or can retake
        return attemptsCount === 0 || canRetake
      }).length
      onPendingQuizzesChange(pendingCount)
    } else if (userRole === 'student' && onPendingQuizzesChange && quizzes.length === 0) {
      onPendingQuizzesChange(0)
    }
  }, [quizzes, userRole, onPendingQuizzesChange])

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      console.log('📤 Loading quizzes for batch:', batchId, 'User role:', userRole)
      
      if (userRole === 'teacher') {
        // Teacher: Load quizzes from teacher endpoint
        const data = await quizzesApi.list({
          live_batch: batchId,
          ordering: '-created_at'
        })
        console.log('📦 Teacher quizzes loaded:', data.results.length)
        setQuizzes(data.results)
      } else {
        // Student: Load quizzes from student endpoint
        const data = await quizzesApi.listStudent({
          live_batch: batchId,
          ordering: '-created_at'
        })
        console.log('📦 Student quizzes loaded:', data.results.length)
        setQuizzes(data.results as StudentQuiz[])
      }
    } catch (error) {
      console.error('❌ Error loading quizzes:', error)
      toast.error('حدث خطأ في تحميل الاختبارات')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuiz = () => {
    // Navigate to create quiz page
    router.push(`/interface-batch/${batchId}/quiz/create`)
  }


  const handleDeleteQuiz = async (quizId: string) => {
    try {
      setDeleting(quizId)
      console.log('📤 Deleting quiz:', quizId)
      await quizzesApi.delete(quizId)
      toast.success('تم حذف الاختبار بنجاح')
      loadQuizzes()
    } catch (error: any) {
      console.error('❌ Error deleting quiz:', error)
      const errorMessage = error?.data?.detail || error?.message || 'حدث خطأ في حذف الاختبار'
      toast.error(errorMessage)
    } finally {
      setDeleting(null)
    }
  }

  const handleViewQuiz = async (quizId: string) => {
    try {
      console.log('📤 Fetching quiz details:', quizId)
      const fetchMethod = userRole === 'teacher' ? quizzesApi.get : quizzesApi.getStudent
      const quiz = await fetchMethod(quizId)
      setQuizDetails(quiz)
      setShowQuizDetails(true)
    } catch (error: any) {
      console.error('❌ Error fetching quiz details:', error)
      toast.error('حدث خطأ في تحميل تفاصيل الاختبار')
    }
  }

  const handleStartQuiz = async (quizId: string) => {
    try {
      console.log('📤 Starting quiz attempt:', quizId)
      await quizzesApi.startAttempt(quizId)
      toast.success('تم بدء الاختبار بنجاح')
      // Navigate to quiz taking page
      router.push(`/interface-batch/${batchId}/quiz/${quizId}/take`)
    } catch (error: any) {
      console.error('❌ Error starting quiz:', error)
      const errorMessage = error?.data?.detail || error?.data?.error || error?.message || 'حدث خطأ في بدء الاختبار'
      toast.error(errorMessage)
    }
  }

  const handleEditClick = (quiz: QuizListItem) => {
    // Navigate to edit quiz page
    router.push(`/interface-batch/${batchId}/quiz/${quiz.id}/edit`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-50">
              الاختبارات
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {quizzes.length} اختبار متاح
            </p>
          </div>
        </div>
        {userRole === 'teacher' && (
          <Button
            onClick={handleCreateQuiz}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            إنشاء اختبار جديد
          </Button>
        )}
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-slate-700">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-full">
              <BookOpen className="w-12 h-12 text-gray-400 dark:text-slate-500" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2">
                لا توجد اختبارات
              </h4>
              <p className="text-gray-500 dark:text-slate-400">
                {userRole === 'teacher' 
                  ? 'ابدأ بإنشاء اختبار جديد لتقييم طلابك' 
                  : 'لم يتم إنشاء أي اختبارات في هذه المجموعة حتى الآن'}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="group h-full"
            >
              <Card className="h-full flex flex-col overflow-hidden border border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 rounded-2xl">
                {/* Card Image/Header Area */}
                <div className="relative h-36 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 dark:from-orange-950 dark:via-orange-900 dark:to-slate-800 overflow-hidden">
                  {/* Decorative Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-300 dark:bg-orange-700 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400 dark:bg-orange-600 rounded-full blur-2xl" />
                  </div>
                  
                  {/* Status Badge - Top Right */}
                  <div className="absolute top-3 right-3 z-10">
                    {quiz.is_active ? (
                      <Badge className="bg-blue-500 text-white border-0 shadow-lg">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        نشط
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-500 text-white border-0 shadow-lg">
                        <XCircle className="w-3 h-3 mr-1" />
                        مغلق
                      </Badge>
                    )}
                  </div>

                  {/* Quiz Icon - Centered */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <HelpCircle className="w-10 h-10 text-orange-500" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Questions Count Badge - Bottom Left */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                      <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                        {quiz.total_questions} سؤال
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <CardContent className="flex-1 p-5 flex flex-col">
                  {/* Title */}
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2 min-h-[3.5rem] leading-snug group-hover:text-orange-600 transition-colors">
                    {quiz.title}
                  </h3>

                  {/* Quick Stats - Inline */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    {/* Passing Score */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        نجاح {quiz.passing_score}%
                      </span>
                    </div>

                    {/* Time Limit */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        {quiz.time_limit ? `${Math.round(quiz.time_limit / 60)} دقيقة` : 'بدون توقيت'}
                      </span>
                    </div>

                    {/* Retake Badge */}
                    {quiz.allow_retake && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <RefreshCw className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                          إعادة
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Student Progress Info */}
                  {userRole === 'student' && (quiz as StudentQuiz).student_attempts_count !== undefined && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 dark:text-slate-400 mb-0.5">أفضل نتيجة</div>
                            <div className="text-sm font-bold text-amber-700 dark:text-amber-300">
                              {(quiz as StudentQuiz).student_best_score ? `${(quiz as StudentQuiz).student_best_score}%` : 'لم تبدأ'}
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 dark:text-slate-400 mb-0.5">المحاولات</div>
                          <div className="text-sm font-bold text-gray-700 dark:text-slate-300">
                            {(quiz as StudentQuiz).student_attempts_count || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex-1" />

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-700 to-transparent mb-4" />

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {userRole === 'student' ? (
                      <>
                        {/* Primary Action - Start Quiz */}
                        <Button
                          onClick={() => handleStartQuiz(quiz.id)}
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-md hover:shadow-lg transition-all h-11"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          ابدأ الاختبار
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* Teacher Actions - Grid Layout */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => router.push(`/interface-batch/${batchId}/quiz/${quiz.id}/analytics`)}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                            title="عرض النتائج والإحصائيات"
                          >
                            <BarChart3 className="w-4 h-4 mr-1.5" />
                            النتائج
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleEditClick(quiz as any)}
                            className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
                          >
                            <Edit className="w-4 h-4 mr-1.5" />
                            تعديل
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleViewQuiz(quiz.id)}
                            className="text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 font-medium"
                          >
                            <FileText className="w-4 h-4 mr-1.5" />
                            عرض
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            disabled={deleting === quiz.id}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 font-medium"
                          >
                            {deleting === quiz.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-1.5" />
                                حذف
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}



      {/* Quiz Details Dialog */}
      <Dialog open={showQuizDetails} onOpenChange={setShowQuizDetails}>
        <DialogContent className="sm:max-w-[800px] bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{quizDetails?.title}</DialogTitle>
            <DialogDescription>
              تفاصيل الاختبار والأسئلة
            </DialogDescription>
          </DialogHeader>

          {quizDetails && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-slate-300">عدد الأسئلة</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-slate-50">
                    {quizDetails.total_questions || 0}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-slate-300">نقاط النجاح</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-slate-50">
                    {quizDetails.passing_score}%
                  </div>
                </div>
              </div>

              {quizDetails.questions && quizDetails.questions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">الأسئلة</h4>
                  <div className="space-y-2">
                    {quizDetails.questions.map((question, index) => (
                      <Card key={question.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{index + 1}.</span>
                              <span className="text-sm">{question.question_text}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              النوع: {question.question_type_display || question.question_type} | النقاط: {question.points}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuizDetails(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

