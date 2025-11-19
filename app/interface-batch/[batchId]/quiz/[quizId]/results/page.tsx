'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { quizzesApi, quizAttemptsApi, type Quiz, type QuizAttempt } from '@/lib/api/quizzes'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Home,
  Share2,
  Award
} from 'lucide-react'
import ScoreDisplay from './components/ScoreDisplay'
import ResultSummary from './components/ResultSummary'
import AnswerReview from './components/AnswerReview'

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params?.['batchId'] as string
  const quizId = params?.['quizId'] as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'review'>('summary')

  // Load quiz results
  useEffect(() => {
    if (!quizId) return
    loadResults()
  }, [quizId])

  const loadResults = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load quiz details and student attempts in parallel
      const [quizData, attemptsData] = await Promise.all([
        quizzesApi.getStudent(quizId),
        quizzesApi.getMyAttempts(quizId)
      ])
      
      console.log('📊 Quiz Data:', quizData)
      console.log('📊 Attempts Data:', attemptsData)
      console.log('📊 Attempts Data Type:', typeof attemptsData)
      console.log('📊 Is Array:', Array.isArray(attemptsData))
      
      setQuiz(quizData)
      
      // Handle attempts data - the API returns an array directly
      let attemptsArray: QuizAttempt[] = []
      if (Array.isArray(attemptsData)) {
        attemptsArray = attemptsData
        console.log('✅ Attempts array:', attemptsArray)
      } else {
        console.warn('⚠️ Unexpected attempts data format:', attemptsData)
      }
      
      // Filter for completed attempts only
      const completedAttempts = attemptsArray.filter(att => att.status === 'completed')
      console.log('✅ Completed attempts:', completedAttempts)
      
      // Get the most recent completed attempt - sort by attempt_number (descending)
      if (completedAttempts.length > 0) {
        const latestAttempt = completedAttempts.sort((a, b) => 
          (b.attempt_number || 0) - (a.attempt_number || 0)
        )[0]
        console.log('✅ Latest completed attempt (basic):', latestAttempt)
        
        // Fetch full attempt details with answers
        try {
          const fullAttempt = await quizAttemptsApi.get(latestAttempt.id)
          console.log('✅ Full attempt with answers:', fullAttempt)
          console.log('📊 Full attempt.answers:', fullAttempt.answers)
          setCurrentAttempt(fullAttempt)
        } catch (fetchError: any) {
          console.warn('⚠️ Failed to fetch full attempt details, using basic data:', fetchError)
          // Fallback to basic attempt data
          setCurrentAttempt(latestAttempt)
        }
      } else if (attemptsArray.length > 0) {
        // If no completed attempts, get the latest in-progress one
        const latestAttempt = attemptsArray[attemptsArray.length - 1]
        console.log('⚠️ No completed attempts, using latest:', latestAttempt)
        
        // Try to fetch full details even for in-progress attempts
        try {
          const fullAttempt = await quizAttemptsApi.get(latestAttempt.id)
          console.log('✅ Full attempt with answers:', fullAttempt)
          setCurrentAttempt(fullAttempt)
        } catch (fetchError: any) {
          console.warn('⚠️ Failed to fetch full attempt details, using basic data:', fetchError)
          setCurrentAttempt(latestAttempt)
        }
      } else {
        console.error('❌ No attempts found')
        setError('لم يتم العثور على محاولات لهذا الاختبار')
      }
      
    } catch (err: any) {
      console.error('Error loading results:', err)
      const errorMsg = err?.data?.detail || err?.message || 'فشل تحميل النتائج'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleRetakeQuiz = async () => {
    try {
      await quizzesApi.startAttempt(quizId)
      toast.success('تم بدء محاولة جديدة')
      router.push(`/interface-batch/${batchId}/quiz/${quizId}/take`)
    } catch (err: any) {
      const errorMsg = err?.data?.detail || 'لا يمكن إعادة الاختبار'
      toast.error(errorMsg)
    }
  }

  const handleShare = () => {
    if (!quiz || !currentAttempt) return
    
    const shareText = `لقد أكملت الاختبار "${quiz.title}"! حصلت على ${currentAttempt.score}%! 🎉`
    if (navigator.share) {
      navigator.share({
        title: quiz.title,
        text: shareText,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(shareText)
      toast.success('تم نسخ النص')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 md:pt-28 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md shadow-2xl border-2 border-amber-100 dark:border-amber-900/30">
          <CardContent className="p-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-6"
            >
              <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-900 border-t-amber-600 dark:border-t-amber-400 rounded-full" />
            </motion.div>
            <p className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2">
              جاري تحميل النتائج...
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              يرجى الانتظار قليلاً
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !quiz || !currentAttempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 md:pt-28 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md border-2 border-red-200 dark:border-red-800 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-red-600 dark:text-red-400 mb-2">
                  خطأ في تحميل النتائج
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                  {error || 'لم يتم العثور على نتائج لهذا الاختبار'}
                </p>
                <Button 
                  onClick={() => router.push(`/interface-batch/${batchId}`)} 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 transition-colors"
                  style={{ transform: 'none' }}
                >
                  <Home className="w-4 h-4 ml-2" />
                  العودة إلى المجموعة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Check if the quiz attempt is incomplete
  if (currentAttempt.status === 'in_progress') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 md:pt-28 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md border-2 border-amber-200 dark:border-amber-800 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-amber-600 dark:text-amber-400 mb-2">
                  الاختبار لم يكتمل بعد
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                  هذا الاختبار لا يزال قيد التقدم. يرجى إكمال الاختبار أولاً لرؤية النتائج.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => router.push(`/interface-batch/${batchId}/quiz/${quizId}/take`)} 
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 transition-colors"
                    style={{ transform: 'none' }}
                  >
                    إكمال الاختبار
                  </Button>
                  <Button 
                    onClick={() => router.push(`/interface-batch/${batchId}`)} 
                    variant="outline"
                    className="flex-1 border-2 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                    style={{ transform: 'none' }}
                  >
                    العودة
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Use score from attempt (which is the percentage) - convert to number if string
  const score = typeof currentAttempt.score === 'string' 
    ? parseFloat(currentAttempt.score) 
    : (currentAttempt.score || 0)
  const totalQuestions = currentAttempt.total_questions || quiz.total_questions || 0
  const passingScore = quiz.passing_score || 0
  const passed = currentAttempt.passed
  
  // Check if attempt is completed
  const isCompleted = currentAttempt.status === 'completed'

  console.log('📊 Final values for display:')
  console.log('  - score:', score, typeof score)
  console.log('  - totalQuestions:', totalQuestions, typeof totalQuestions)
  console.log('  - passingScore:', passingScore, typeof passingScore)
  console.log('  - passed:', passed, typeof passed)
  console.log('  - isCompleted:', isCompleted)
  console.log('  - currentAttempt:', currentAttempt)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 md:pt-28 pb-12" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: 'spring' }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 shadow-lg"
              >
                <Award className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-slate-50 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600">
                  نتائج الاختبار
                </h1>
                <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">
                  {quiz.title}
                </p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={() => router.push(`/interface-batch/${batchId}`)}
                className="flex items-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                style={{ transform: 'none' }}
              >
                <ArrowRight className="w-4 h-4" />
                العودة
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <ScoreDisplay
            score={score}
            totalQuestions={totalQuestions}
            passingScore={passingScore}
            passed={passed}
          />
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-3 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-amber-100 dark:border-amber-900/30 w-fit">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'summary'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white shadow-lg shadow-amber-500/30'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
              }`}
              style={{ transform: 'none' }}
            >
              📊 الملخص
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('review')}
              className={`px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'review'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white shadow-lg shadow-amber-500/30'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
              }`}
              style={{ transform: 'none' }}
            >
              📝 استعراض الإجابات
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {activeTab === 'summary' ? (
            <ResultSummary
              quiz={quiz}
              attempt={currentAttempt}
              score={score}
              totalQuestions={totalQuestions}
              passingScore={passingScore}
              passed={passed}
            />
          ) : (
            <AnswerReview 
              quiz={quiz} 
              attempt={currentAttempt}
            />
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex gap-3 flex-wrap justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => router.push(`/interface-batch/${batchId}`)}
              size="lg"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 shadow-lg shadow-amber-500/30 px-8 transition-colors"
              style={{ transform: 'none' }}
            >
              <Home className="w-5 h-5" />
              العودة إلى المجموعة
            </Button>
          </motion.div>

          {quiz.allow_retake && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleRetakeQuiz}
                size="lg"
                variant="outline"
                className="flex items-center gap-2 border-2 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 px-8 transition-colors"
                style={{ transform: 'none' }}
              >
                <RotateCcw className="w-5 h-5" />
                إعادة الاختبار
              </Button>
            </motion.div>
          )}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleShare}
              size="lg"
              variant="outline"
              className="flex items-center gap-2 border-2 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-amber-200 dark:hover:border-amber-800 px-8 transition-colors"
              style={{ transform: 'none' }}
            >
              <Share2 className="w-5 h-5" />
              مشاركة النتيجة
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
