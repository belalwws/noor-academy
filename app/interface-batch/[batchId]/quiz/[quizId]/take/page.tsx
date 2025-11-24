'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { quizzesApi, type Quiz } from '@/lib/api/quizzes'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import QuizTimer from './components/QuizTimer'
import QuestionDisplay from './components/QuestionDisplay'
import ProgressBar from './components/ProgressBar'
import QuizHeader from './components/QuizHeader'
import { CountdownTimer } from '@/components/games/CountdownTimer'
import { useGameSounds } from '@/hooks/useGameSounds'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Send, AlertCircle, Play, BookOpen } from 'lucide-react'

interface QuizState {
  currentQuestionIndex: number
  answers: Record<string, string>
  isSubmitting: boolean
  timeRemaining: number | null
  isTimeUp: boolean
}

export default function TakeQuizPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params?.['batchId'] as string
  const quizId = params?.['quizId'] as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const sounds = useGameSounds({ enabled: true })
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    isSubmitting: false,
    timeRemaining: null,
    isTimeUp: false,
  })

  // Load quiz data
  useEffect(() => {
    if (!quizId) return
    loadQuiz()
  }, [quizId])

  const loadQuiz = async () => {
    try {
      setLoading(true)
      const quizData = await quizzesApi.getStudent(quizId)
      setQuiz(quizData)
      
      // Initialize time remaining
      if (quizData.time_limit) {
        setQuizState(prev => ({
          ...prev,
          timeRemaining: quizData.time_limit
        }))
      }
    } catch (err: any) {
      console.error('Error loading quiz:', err)
      const errorMsg = err?.data?.detail || err?.message || 'فشل تحميل الاختبار'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Handle timer warning (called by CountdownTimer)
  const handleTimerWarning = () => {
    // This is called when 30 seconds remain (handled by CountdownTimer)
    // The sound is already played by CountdownTimer
  }

  // Handle timer complete
  const handleTimerComplete = () => {
    setQuizState(prev => ({
      ...prev,
      isTimeUp: true,
      timeRemaining: 0
    }))
    toast.error('انتهى الوقت المخصص للاختبار!')
    handleSubmitQuiz()
  }

  // Start quiz
  const handleStartQuiz = () => {
    setQuizStarted(true)
  }

  // Handle answer change
  const handleAnswerChange = (questionId: string, answer: string) => {
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }))
  }

  // Navigate to next question
  const handleNextQuestion = () => {
    if (quiz?.questions && quizState.currentQuestionIndex < quiz.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }))
    }
  }

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }))
    }
  }

  // Jump to specific question
  const handleJumpToQuestion = (index: number) => {
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: index
    }))
  }

  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (quizState.isSubmitting) return

    // Check if all questions are answered
    const totalQuestions = quiz?.questions?.length || 0
    const answeredCount = Object.keys(quizState.answers).length
    
    if (answeredCount < totalQuestions) {
      const unanswered = totalQuestions - answeredCount
      toast.warning(`لم تجب على ${unanswered} سؤال. هل تريد المتابعة؟`)
    }

    try {
      setQuizState(prev => ({ ...prev, isSubmitting: true }))
      
      // Convert answers to the format expected by the backend
      const formattedAnswers = Object.entries(quizState.answers).map(([questionId, answer]) => ({
        question_id: questionId,
        selected_answer: answer,
        time_taken: null // Optional: can track per-question time if needed
      }))

      await quizzesApi.submitQuiz(quizId, { answers: formattedAnswers })
      toast.success('تم إرسال الاختبار بنجاح!')
      
      // Navigate to results page
      router.push(`/interface-batch/${batchId}/quiz/${quizId}/results`)
    } catch (err: any) {
      console.error('Error submitting quiz:', err)
      const errorMsg = err?.data?.detail || err?.message || 'فشل إرسال الاختبار'
      toast.error(errorMsg)
    } finally {
      setQuizState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 md:pt-28 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md border-2 border-amber-100 dark:border-amber-900/30 shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 dark:border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-slate-400 font-medium">جاري تحميل الاختبار...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 md:pt-28 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md border-2 border-red-200 dark:border-red-800 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">خطأ في تحميل الاختبار</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{error}</p>
                <Button
                  onClick={() => router.back()}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 text-white"
                >
                  العودة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = quiz.questions?.[quizState.currentQuestionIndex]
  const totalQuestions = quiz.questions?.length || 0
  const answeredCount = Object.keys(quizState.answers).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 md:pt-28 pb-8" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {!quizStarted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center min-h-[70vh]"
          >
            <Card className="w-full max-w-lg border-2 border-amber-100 dark:border-amber-900/30 shadow-2xl overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 p-6 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl"
                >
                  <BookOpen className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2 drop-shadow-lg">
                  {quiz.title}
                </h2>
                {quiz.description && (
                  <p className="text-sm text-white/90 max-w-md mx-auto">
                    {quiz.description}
                  </p>
                )}
              </div>

              <CardContent className="p-8">
                {/* Info Cards */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                    <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mb-1">
                      {totalQuestions}
                    </div>
                    <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      سؤال
                    </div>
                  </div>
                  
                  {quiz.time_limit && (
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                      <div className="text-2xl font-black text-orange-700 dark:text-orange-300 mb-1">
                        {Math.ceil((quiz.time_limit || 0) / 60)}
                      </div>
                      <div className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                        دقيقة
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mb-1">
                      {quiz.passing_score}%
                    </div>
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      للنجاح
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-8 p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 border-2 border-amber-200 dark:border-amber-800/30 rounded-xl">
                  <p className="text-sm text-amber-800 dark:text-amber-200 text-center flex items-center justify-center gap-2">
                    <span className="text-lg">ℹ️</span>
                    <span>
                      <span className="font-semibold">تعليمات:</span> اختر الإجابة الصحيحة لكل سؤال. يمكنك التنقل بين الأسئلة والعودة للتعديل قبل الإرسال.
                    </span>
                  </p>
                </div>

                {/* Start Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleStartQuiz}
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all h-14 text-lg font-bold"
                    style={{ transform: 'none' }}
                  >
                    <Play className="w-5 h-5 ml-2" />
                    بدء الاختبار
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Header - Only shown after quiz starts */}
            <QuizHeader quiz={quiz} />
            
            {/* Quiz Content (shown after start) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-6">
            {/* Main Quiz Area */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Timer and Progress */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  {quiz.time_limit && (
                    <Card className="flex-1 border-2 border-amber-100 dark:border-amber-900/30 shadow-lg">
                      <CardContent className="p-5">
                        <div className="flex flex-col items-center">
                          <CountdownTimer
                            key={quizStarted ? 'started' : 'not-started'}
                            duration={quiz.time_limit || 3600}
                            isPlaying={!quizState.isTimeUp && !quizState.isSubmitting && quizStarted}
                            onComplete={handleTimerComplete}
                            onTimeWarning={handleTimerWarning}
                            size={120}
                            showWarningColors={true}
                            playWarningSounds={true}
                          />
                          <p className="text-xs text-gray-600 dark:text-slate-400 mt-2 font-medium">
                            الوقت المتبقي
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <Card className="flex-1 border-2 border-amber-100 dark:border-amber-900/30 shadow-lg">
                    <CardContent className="p-5">
                      <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-3">التقدم</p>
                      <ProgressBar
                        current={quizState.currentQuestionIndex + 1}
                        total={totalQuestions}
                        answered={answeredCount}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Question Card */}
                {currentQuestion && (
                  <Card className="mb-6 border-2 border-amber-100 dark:border-amber-900/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6 md:p-8">
                      <QuestionDisplay
                        question={currentQuestion}
                        questionNumber={quizState.currentQuestionIndex + 1}
                        totalQuestions={totalQuestions}
                        selectedAnswer={quizState.answers[currentQuestion.id] || ''}
                        onAnswerChange={(answer: string) => handleAnswerChange(currentQuestion.id, answer)}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 mb-6">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={quizState.currentQuestionIndex === 0}
                    className="flex-1 flex items-center justify-center gap-2 h-12 border-2 border-gray-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                    السؤال السابق
                  </Button>

                  {quizState.currentQuestionIndex < totalQuestions - 1 ? (
                    <Button
                      onClick={handleNextQuestion}
                      className="flex-1 flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      السؤال التالي
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={quizState.isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      {quizState.isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          إرسال الاختبار
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Question List */}
            <div className="lg:col-span-1">
              <Card className="sticky top-28 border-2 border-amber-100 dark:border-amber-900/30 shadow-xl">
                <CardContent className="p-4">
                  <h3 className="font-bold text-base mb-4 text-gray-900 dark:text-slate-50 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white flex items-center justify-center text-sm">
                      {totalQuestions}
                    </span>
                    الأسئلة
                  </h3>
                  <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
                    {quiz.questions?.map((question, index) => {
                      const isAnswered = !!quizState.answers[question.id]
                      const isCurrent = index === quizState.currentQuestionIndex

                      return (
                        <motion.button
                          key={question.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleJumpToQuestion(index)}
                          className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                            isCurrent
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white shadow-lg'
                              : isAnswered
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/40'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-2 border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 hover:border-amber-300 dark:hover:border-amber-600'
                          }`}
                        >
                          السؤال {index + 1}
                        </motion.button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  )
}
