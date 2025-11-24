'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { quizzesApi, quizQuestionsApi, type CreateQuizInput, type CreateQuestionInput, type QuestionType } from '@/lib/api/quizzes'
import { 
  ArrowRight,
  RefreshCw,
  BookOpen,
  Save,
  X,
  Plus,
  Trash2,
  HelpCircle,
  List,
  CheckCircle,
  Copy,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CountdownTimer } from '@/components/games/CountdownTimer'

export default function CreateQuizPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params?.batchId as string

  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState<CreateQuizInput>({
    title: '',
    description: '',
    quiz_type: 'live_batch',
    live_batch: batchId,
    max_questions: 10,
    allow_retake: true,
    passing_score: 100,
    time_limit: 3600, // 1 hour default
  })

  // Questions state
  const [questions, setQuestions] = useState<Array<{
    id: string
    question_type: QuestionType
    question_text: string
    choices: string[] // For multiple choice
    correct_answer: string
    points: number
    explanation: string
    order: number
  }>>([])

  const formatTimeLimit = (seconds: number): string => {
    // Convert seconds to minutes for display
    const minutes = Math.ceil(seconds / 60)
    if (!minutes || minutes === 0) return 'لا يوجد حد زمني'
    if (minutes < 60) return `${minutes} دقيقة`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) return `${hours} ساعة`
    return `${hours} ساعة و ${remainingMinutes} دقيقة`
  }

  const addQuestion = () => {
    const newQuestion = {
      id: `temp-${Date.now()}`,
      question_type: 'multiple_choice' as QuestionType,
      question_text: '',
      choices: ['', '', '', ''],
      correct_answer: '0',
      points: 1,
      explanation: '',
      order: questions.length + 1,
    }
    setQuestions([...questions, newQuestion])
    // Scroll to the new question after a short delay
    setTimeout(() => {
      const element = document.getElementById(`question-${newQuestion.id}`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Focus on question text input
      const input = element?.querySelector('textarea')
      input?.focus()
    }, 100)
  }

  const duplicateQuestion = (id: string) => {
    const question = questions.find(q => q.id === id)
    if (question) {
      const newQuestion = {
        ...question,
        id: `temp-${Date.now()}`,
        question_text: `${question.question_text} (نسخة)`,
        order: questions.length + 1,
      }
      const index = questions.findIndex(q => q.id === id)
      const newQuestions = [...questions]
      newQuestions.splice(index + 1, 0, newQuestion)
      setQuestions(newQuestions.map((q, i) => ({ ...q, order: i + 1 })))
      toast.success('تم نسخ السؤال بنجاح')
    }
  }

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id)
    if (direction === 'up' && index > 0) {
      const newQuestions = [...questions]
      ;[newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]]
      setQuestions(newQuestions.map((q, i) => ({ ...q, order: i + 1 })))
    } else if (direction === 'down' && index < questions.length - 1) {
      const newQuestions = [...questions]
      ;[newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]]
      setQuestions(newQuestions.map((q, i) => ({ ...q, order: i + 1 })))
    }
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id).map((q, index) => ({ ...q, order: index + 1 })))
    toast.success('تم حذف السؤال')
  }

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        if (field === 'choices') {
          return { ...q, choices: value }
        }
        if (field === 'choice') {
          const [index, choiceValue] = value
          const newChoices = [...q.choices]
          newChoices[index] = choiceValue
          return { ...q, choices: newChoices }
        }
        return { ...q, [field]: value }
      }
      return q
    }))
  }

  const handleCreateQuiz = async () => {
    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان الاختبار')
      return
    }

    // Validate max_questions
    if (formData.max_questions && formData.max_questions > 10) {
      toast.error('الحد الأقصى للأسئلة هو 10')
      return
    }

    // Validate questions - MUST have at least one question
    if (questions.length === 0) {
      toast.error('يجب إضافة سؤال واحد على الأقل قبل إنشاء الاختبار')
      return
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question_text.trim()) {
        toast.error(`يرجى إدخال نص السؤال رقم ${i + 1}`)
        return
      }
      if (q.question_type === 'multiple_choice') {
        const validChoices = q.choices.filter(c => c.trim())
        if (validChoices.length < 2) {
          toast.error(`يجب أن يحتوي السؤال رقم ${i + 1} (متعدد الخيارات) على خيارين على الأقل`)
          return
        }
        // Check if correct answer is selected
        const selectedIndex = parseInt(q.correct_answer)
        if (isNaN(selectedIndex) || selectedIndex < 0) {
          toast.error(`يرجى تحديد الإجابة الصحيحة للسؤال رقم ${i + 1}`)
          return
        }
        // Check if selected answer index is valid
        const originalChoices = q.choices
        let validIndex = 0
        for (let j = 0; j <= selectedIndex; j++) {
          if (originalChoices[j]?.trim()) {
            if (j === selectedIndex) {
              break
            }
            validIndex++
          }
        }
        if (validIndex >= validChoices.length) {
          toast.error(`الإجابة الصحيحة المحددة للسؤال رقم ${i + 1} غير صحيحة`)
          return
        }
      } else if (q.question_type === 'true_false') {
        if (q.correct_answer !== 'true' && q.correct_answer !== 'false') {
          toast.error(`يرجى تحديد الإجابة الصحيحة للسؤال رقم ${i + 1} (صحيح/خطأ)`)
          return
        }
      }
    }

    try {
      setCreating(true)
      // Convert time_limit from seconds to minutes for backend
      // Ensure max_questions doesn't exceed 10
      const payload = {
        ...formData,
        live_batch: batchId,
        max_questions: formData.max_questions ? Math.min(formData.max_questions, 10) : 10,
        time_limit: formData.time_limit ? Math.ceil(formData.time_limit / 60) : undefined, // Convert seconds to minutes
        recorded_lesson: undefined, // Ensure recorded_lesson is not sent for live_batch quizzes
      }
      console.log('📤 Creating quiz:', payload)
      const createdQuiz = await quizzesApi.create(payload)
      
      // Create questions
      if (questions.length > 0) {
        for (const question of questions) {
          const questionPayload: CreateQuestionInput = {
            quiz: createdQuiz.id,
            question_type: question.question_type,
            question_text: question.question_text,
            correct_answer: question.correct_answer,
            points: question.points,
            order: question.order,
            explanation: question.explanation || undefined,
          }

          if (question.question_type === 'multiple_choice') {
            // Filter out empty choices and send as JSON array
            const validChoices = question.choices.filter(c => c.trim())
            questionPayload.choices = JSON.stringify(validChoices)
            // Adjust correct_answer index based on filtered choices
            const originalIndex = parseInt(question.correct_answer)
            // Find the new index by counting how many valid choices are before the selected one
            let newIndex = 0
            for (let i = 0; i < originalIndex; i++) {
              if (question.choices[i]?.trim()) {
                newIndex++
              }
            }
            questionPayload.correct_answer = newIndex.toString()
          }

          console.log('📋 Question payload:', questionPayload)
          await quizQuestionsApi.create(questionPayload)
        }
      }

      toast.success('تم إنشاء الاختبار والأسئلة بنجاح')
      // Navigate back to quizzes list
      router.push(`/interface-batch/${batchId}?section=quizzes`)
    } catch (error: any) {
      console.error('❌ Error creating quiz:', error)
      console.error('❌ Error details:', error?.data)
      
      // Extract error message from response
      let errorMessage = 'حدث خطأ في إنشاء الاختبار'
      if (error?.data) {
        if (typeof error.data === 'string') {
          errorMessage = error.data
        } else if (error.data.detail) {
          errorMessage = error.data.detail
        } else if (error.data.error) {
          errorMessage = error.data.error
        } else if (typeof error.data === 'object') {
          // Handle field-specific errors with Arabic translations
          const fieldTranslations: Record<string, string> = {
            max_questions: 'الحد الأقصى للأسئلة',
            title: 'العنوان',
            description: 'الوصف',
            passing_score: 'نقاط النجاح',
            time_limit: 'الحد الزمني',
            live_batch: 'المجموعة',
          }
          
          const fieldErrors = Object.entries(error.data)
            .map(([key, value]) => {
              const fieldName = fieldTranslations[key] || key
              if (Array.isArray(value)) {
                // Translate common error messages
                const translatedMessages = value.map((msg: string) => {
                  if (msg.includes('less than or equal to 10')) {
                    return 'يجب أن يكون أقل من أو يساوي 10'
                  }
                  if (msg.includes('required')) {
                    return 'هذا الحقل مطلوب'
                  }
                  return msg
                })
                return `${fieldName}: ${translatedMessages.join(', ')}`
              }
              return `${fieldName}: ${value}`
            })
            .join('\n')
          if (fieldErrors) {
            errorMessage = fieldErrors
          }
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = () => {
    router.push(`/interface-batch/${batchId}?section=quizzes`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 md:pt-28 pb-8 px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-gray-600 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              <ArrowRight className="w-4 h-4 ml-2 rotate-180" />
              رجوع
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-2xl shadow-lg"
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-500 dark:to-orange-500 bg-clip-text text-transparent">
                إنشاء اختبار جديد
              </h1>
              <p className="text-gray-600 dark:text-slate-400 mt-2 text-lg">
                أضف معلومات الاختبار والأسئلة خطوة بخطوة
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border-2 border-amber-100 dark:border-amber-900/30 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all ${
                  formData.title.trim() 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white scale-110' 
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-500'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {formData.title.trim() ? <CheckCircle className="w-6 h-6" /> : '1'}
              </motion.div>
              <div>
                <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 block">معلومات الاختبار</span>
                <span className={`text-xs flex items-center gap-1 ${
                  formData.title.trim() 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : 'text-gray-500 dark:text-slate-400'
                }`}>
                  {formData.title.trim() ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      مكتمل
                    </>
                  ) : (
                    'غير مكتمل'
                  )}
                </span>
              </div>
            </div>
            <div className="flex-1 mx-6">
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: formData.title.trim() ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.div 
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all ${
                  questions.length > 0 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white scale-110' 
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-500'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {questions.length > 0 ? <CheckCircle className="w-6 h-6" /> : '2'}
              </motion.div>
              <div>
                <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 block">
                  الأسئلة ({questions.length})
                </span>
                <span className={`text-xs flex items-center gap-1 ${
                  questions.length > 0 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : 'text-gray-500 dark:text-slate-400'
                }`}>
                  {questions.length > 0 ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      مضاف
                    </>
                  ) : (
                    'غير مضاف'
                  )}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-2 border-amber-100 dark:border-amber-900/30 mb-6 hover:shadow-2xl transition-all duration-300 hover:border-amber-200 dark:hover:border-amber-800/50 bg-white dark:bg-slate-800">
            <CardHeader className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border-b-2 border-amber-200 dark:border-amber-900/30">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white flex items-center justify-center font-bold shadow-lg">
                  1
                </div>
                <div>
                  <div className="text-gray-900 dark:text-slate-50">معلومات الاختبار</div>
                  <CardDescription className="text-sm mt-1 text-gray-600 dark:text-slate-400">
                    أدخل العنوان والتفاصيل الأساسية للاختبار
                  </CardDescription>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2">
                عنوان الاختبار *
                {!formData.title.trim() && (
                  <span className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    مطلوب
                  </span>
                )}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: اختبار الفصل الأول - العلوم"
                className={`mt-2 h-12 text-base transition-all focus:ring-2 focus:ring-amber-500/20 ${
                  !formData.title.trim() 
                    ? 'border-amber-300 focus:border-amber-500 dark:border-amber-700 dark:focus:border-amber-500' 
                    : 'border-gray-300 dark:border-slate-600 focus:border-amber-500 dark:focus:border-amber-500'
                }`}
              />
              {formData.title.trim() && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  عنوان الاختبار مكتمل
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold">
                الوصف
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="أدخل وصفًا للاختبار (اختياري)"
                rows={4}
                className="mt-2 text-base"
              />
            </div>

            {/* Grid: Max Questions and Passing Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="max_questions" className="text-base font-semibold">
                  الحد الأقصى للأسئلة
                </Label>
                <Input
                  id="max_questions"
                  type="number"
                  value={formData.max_questions}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 10
                    const maxValue = Math.min(value, 10) // Backend limit is 10
                    setFormData({ ...formData, max_questions: maxValue })
                  }}
                  min={1}
                  max={10}
                  className="mt-2 h-12 text-base"
                />
                <p className="text-sm text-gray-500 mt-1">
                  عدد الأسئلة التي سيتم عرضها في الاختبار (الحد الأقصى: 10)
                </p>
              </div>

              <div>
                <Label htmlFor="passing_score" className="text-base font-semibold">
                  نقاط النجاح (%)
                </Label>
                <Input
                  id="passing_score"
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || 100 })}
                  min={0}
                  max={100}
                  className="mt-2 h-12 text-base"
                />
                <p className="text-sm text-gray-500 mt-1">
                  النسبة المئوية المطلوبة للنجاح في الاختبار
                </p>
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <Label htmlFor="time_limit" className="text-base font-semibold">
                الحد الزمني (بالدقائق)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div>
              <Input
                id="time_limit"
                type="number"
                value={formData.time_limit ? Math.ceil(formData.time_limit / 60) : ''}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value) || 0
                      setFormData({ ...formData, time_limit: minutes * 60 }) // Convert minutes to seconds
                }}
                min={1}
                placeholder="أدخل الوقت بالدقائق"
                    className="h-12 text-base"
              />
              <p className="text-sm text-gray-500 mt-1">
                الوقت المتاح للاختبار: <span className="font-semibold text-gray-700 dark:text-slate-300">
                  {formatTimeLimit(formData.time_limit || 60 * 60)}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                يمكنك ترك الحقل فارغاً لإلغاء الحد الزمني
              </p>
                </div>
                {formData.time_limit && formData.time_limit > 0 && (
                  <div className="flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">معاينة العداد:</p>
                      <CountdownTimer
                        duration={Math.min(formData.time_limit, 300)} // Preview max 5 minutes
                        isPlaying={false}
                        size={100}
                        showWarningColors={true}
                        playWarningSounds={false}
                        className="mx-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Allow Retake */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <input
                type="checkbox"
                id="allow_retake"
                checked={formData.allow_retake}
                onChange={(e) => setFormData({ ...formData, allow_retake: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="allow_retake" className="text-base font-semibold cursor-pointer flex-1">
                السماح بإعادة المحاولة
              </Label>
              <p className="text-sm text-gray-500">
                إذا تم تفعيله، يمكن للطلاب إعادة محاولة الاختبار
              </p>
            </div>

            </CardContent>
          </Card>
        </motion.div>

        {/* Questions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-2 border-amber-100 dark:border-amber-900/30 mb-6 hover:shadow-2xl transition-all duration-300 hover:border-amber-200 dark:hover:border-amber-800/50 bg-white dark:bg-slate-800">
            <CardHeader className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border-b-2 border-amber-200 dark:border-amber-900/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white flex items-center justify-center font-bold shadow-lg">
                    2
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-slate-50">أسئلة الاختبار *</CardTitle>
                    <CardDescription className="text-sm mt-1 flex items-center gap-2 text-gray-600 dark:text-slate-400">
                      <span>أضف الأسئلة للاختبار ({questions.length} سؤال)</span>
                      {questions.length > 0 && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          {questions.filter(q => q.question_text.trim() && (
                            q.question_type === 'true_false' || 
                            (q.question_type === 'multiple_choice' && q.choices.filter(c => c.trim()).length >= 2 && q.correct_answer)
                          )).length} سؤال مكتمل
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={addQuestion}
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة سؤال جديد
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {questions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-900/50"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30 flex items-center justify-center"
                    >
                      <HelpCircle className="w-10 h-10 text-blue-500" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-700 dark:text-slate-300 mb-2">
                      لا توجد أسئلة بعد
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                      ابدأ بإضافة أول سؤال للاختبار. يمكنك إضافة أسئلة متعددة الخيارات أو أسئلة صحيح/خطأ
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={addQuestion}
                        size="lg"
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all"
                      >
                        <Plus className="w-5 h-5 ml-2" />
                        إضافة أول سؤال
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => {
                      const isComplete = question.question_text.trim() && (
                        question.question_type === 'true_false' 
                          ? (question.correct_answer === 'true' || question.correct_answer === 'false')
                          : (question.choices.filter(c => c.trim()).length >= 2 && question.correct_answer)
                      )
                      
                      return (
                        <motion.div
                          key={question.id}
                          id={`question-${question.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className={`border-2 transition-all shadow-lg hover:shadow-xl ${
                            isComplete 
                              ? 'border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-900/20 dark:to-orange-900/10' 
                              : 'border-gray-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600'
                          }`}>
                            <CardContent className="p-6 space-y-5">
                              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${
                                    isComplete 
                                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' 
                                      : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                                  }`}>
                                    {isComplete ? <CheckCircle className="w-6 h-6" /> : index + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-xl text-gray-900 dark:text-slate-50">
                                      سؤال {index + 1}
                                    </h4>
                                    {isComplete && (
                                      <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        مكتمل
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* Move Up */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveQuestion(question.id, 'up')}
                                    disabled={index === 0}
                                    className="h-8 w-8 p-0"
                                    title="نقل لأعلى"
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </Button>
                                  {/* Move Down */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveQuestion(question.id, 'down')}
                                    disabled={index === questions.length - 1}
                                    className="h-8 w-8 p-0"
                                    title="نقل لأسفل"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </Button>
                                  {/* Duplicate */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => duplicateQuestion(question.id)}
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="نسخ السؤال"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  {/* Delete */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
                                        removeQuestion(question.id)
                                      }
                                    }}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="حذف السؤال"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                      {/* Question Type */}
                      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg">
                        <Label className="text-base font-semibold mb-3 block">نوع السؤال</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <label className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            question.question_type === 'multiple_choice'
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md'
                              : 'border-gray-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600'
                          }`}>
                            <input
                              type="radio"
                              name={`question_type_${question.id}`}
                              checked={question.question_type === 'multiple_choice'}
                              onChange={() => updateQuestion(question.id, 'question_type', 'multiple_choice')}
                              className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                            />
                            <List className={`w-5 h-5 ${question.question_type === 'multiple_choice' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'}`} />
                            <span className="font-medium">متعدد الخيارات</span>
                          </label>
                          <label className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            question.question_type === 'true_false'
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md'
                              : 'border-gray-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600'
                          }`}>
                            <input
                              type="radio"
                              name={`question_type_${question.id}`}
                              checked={question.question_type === 'true_false'}
                              onChange={() => updateQuestion(question.id, 'question_type', 'true_false')}
                              className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                            />
                            <CheckCircle className={`w-5 h-5 ${question.question_type === 'true_false' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'}`} />
                            <span className="font-medium">صحيح/خطأ</span>
                          </label>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div>
                        <Label className="text-base font-semibold mb-2 block flex items-center gap-2">
                          نص السؤال *
                          {!question.question_text.trim() && (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              مطلوب
                            </span>
                          )}
                        </Label>
                        <Textarea
                          value={question.question_text}
                          onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
                          placeholder="مثال: ما هي عاصمة مصر؟"
                          rows={3}
                          className={`text-base transition-all ${
                            !question.question_text.trim() 
                              ? 'border-amber-300 focus:border-amber-500' 
                              : 'border-gray-300'
                          }`}
                        />
                      </div>

                      {/* Multiple Choice Options */}
                      {question.question_type === 'multiple_choice' && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-800/30">
                          <Label className="text-base font-semibold mb-3 block">الخيارات *</Label>
                          <div className="space-y-3">
                            {question.choices.map((choice, choiceIndex) => (
                              <div 
                                key={choiceIndex} 
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                  question.correct_answer === choiceIndex.toString() && choice.trim()
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`correct_${question.id}`}
                                  checked={question.correct_answer === choiceIndex.toString()}
                                  onChange={() => updateQuestion(question.id, 'correct_answer', choiceIndex.toString())}
                                  className="w-5 h-5 cursor-pointer"
                                  disabled={!choice.trim()}
                                />
                                <Input
                                  value={choice}
                                  onChange={(e) => updateQuestion(question.id, 'choice', [choiceIndex, e.target.value])}
                                  placeholder={`الخيار ${choiceIndex + 1}`}
                                  className="flex-1 text-base"
                                />
                                {question.correct_answer === choiceIndex.toString() && choice.trim() && (
                                  <CheckCircle className="w-5 h-5 text-blue-500" />
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-3 flex items-center gap-1">
                            <HelpCircle className="w-3 h-3" />
                            حدد الإجابة الصحيحة باختيار الدائرة بجانب الخيار
                          </p>
                        </div>
                      )}

                      {/* True/False Options */}
                      {question.question_type === 'true_false' && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-800/30">
                          <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                            الإجابة الصحيحة *
                            {!question.correct_answer && (
                              <span className="text-xs text-amber-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                مطلوب
                              </span>
                            )}
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <motion.label
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`flex items-center justify-center gap-3 p-5 rounded-lg border-2 cursor-pointer transition-all ${
                                question.correct_answer === 'true'
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                  : 'border-gray-200 dark:border-slate-700 hover:border-blue-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct_tf_${question.id}`}
                                checked={question.correct_answer === 'true'}
                                onChange={() => updateQuestion(question.id, 'correct_answer', 'true')}
                                className="w-5 h-5"
                              />
                              <CheckCircle className={`w-6 h-6 ${
                                question.correct_answer === 'true' ? 'text-blue-500' : 'text-gray-400'
                              }`} />
                              <span className="font-bold text-lg">صحيح</span>
                            </motion.label>
                            <motion.label
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`flex items-center justify-center gap-3 p-5 rounded-lg border-2 cursor-pointer transition-all ${
                                question.correct_answer === 'false'
                                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md'
                                  : 'border-gray-200 dark:border-slate-700 hover:border-red-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct_tf_${question.id}`}
                                checked={question.correct_answer === 'false'}
                                onChange={() => updateQuestion(question.id, 'correct_answer', 'false')}
                                className="w-5 h-5"
                              />
                              <X className={`w-6 h-6 ${
                                question.correct_answer === 'false' ? 'text-red-500' : 'text-gray-400'
                              }`} />
                              <span className="font-bold text-lg">خطأ</span>
                            </motion.label>
                          </div>
                        </div>
                      )}

                      {/* Points and Explanation */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-base font-semibold mb-2 block">النقاط</Label>
                          <Input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
                            min={1}
                            className="text-base"
                          />
                        </div>
                        <div>
                          <Label className="text-base font-semibold mb-2 block">الشرح (اختياري)</Label>
                          <Textarea
                            value={question.explanation}
                            onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                            placeholder="شرح مختصر للإجابة الصحيحة..."
                            rows={2}
                            className="text-base"
                          />
                        </div>
                      </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="shadow-xl border-2 border-amber-100 dark:border-amber-900/30 bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {questions.length === 0 ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 text-red-500"
                      >
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">يجب إضافة سؤال واحد على الأقل</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 text-blue-600"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <div>
                          <span className="font-semibold">جاهز للإنشاء:</span>
                          <span className="mr-2">{questions.length} سؤال</span>
                          <span className="text-xs text-gray-500">
                            ({questions.filter(q => q.question_text.trim() && (
                              q.question_type === 'true_false' || 
                              (q.question_type === 'multiple_choice' && q.choices.filter(c => c.trim()).length >= 2 && q.correct_answer)
                            )).length} مكتمل)
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  {!formData.title.trim() && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      يرجى إدخال عنوان الاختبار
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleCancel}
                      disabled={creating}
                      className="h-12 px-8 border-2"
                    >
                      <X className="w-5 h-5 ml-2" />
                      إلغاء
                    </Button>
                  </motion.div>
                  <motion.div 
                    whileHover={(!creating && formData.title.trim() && questions.length > 0) ? { scale: 1.05 } : {}}
                    whileTap={(!creating && formData.title.trim() && questions.length > 0) ? { scale: 0.95 } : {}}
                  >
                    <Button
                      onClick={handleCreateQuiz}
                      disabled={creating || !formData.title.trim() || questions.length === 0}
                      size="lg"
                      className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title={questions.length === 0 ? 'يرجى إضافة سؤال واحد على الأقل' : !formData.title.trim() ? 'يرجى إدخال عنوان الاختبار' : ''}
                    >
                      {creating ? (
                        <>
                          <RefreshCw className="w-5 h-5 ml-2 animate-spin" />
                          جاري الإنشاء...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 ml-2" />
                          إنشاء الاختبار والأسئلة
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

