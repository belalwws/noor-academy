'use client'

import React from 'react'
import { Quiz, QuizAttempt } from '@/lib/api/quizzes'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface AnswerReviewProps {
  quiz: Quiz
  attempt: QuizAttempt
}

export default function AnswerReview({ quiz, attempt }: AnswerReviewProps) {
  // Debug logging
  console.log('🔍 AnswerReview - quiz:', quiz)
  console.log('🔍 AnswerReview - attempt:', attempt)
  console.log('🔍 AnswerReview - attempt.answers:', attempt?.answers)
  console.log('🔍 AnswerReview - attempt.answers type:', typeof attempt?.answers)
  console.log('🔍 AnswerReview - attempt.answers is array:', Array.isArray(attempt?.answers))
  console.log('🔍 AnswerReview - attempt.answers length:', attempt?.answers?.length)
  console.log('🔍 AnswerReview - quiz.questions:', quiz?.questions)
  console.log('🔍 AnswerReview - quiz.questions length:', quiz?.questions?.length)
  
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-12 text-center">
          <div className="inline-block p-6 bg-gray-100 dark:bg-slate-800 rounded-full mb-4">
            <AlertTriangle className="w-12 h-12 text-gray-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-50 mb-2">
            لا توجد أسئلة متاحة
          </h3>
          <p className="text-gray-600 dark:text-slate-400">
            لا توجد أسئلة متاحة للاستعراض في هذا الاختبار
          </p>
        </CardContent>
      </Card>
    )
  }
  
  // Check if answers are available - handle different data formats
  const answersArray = Array.isArray(attempt?.answers) 
    ? attempt.answers 
    : attempt?.answers 
      ? [attempt.answers] 
      : []
  
  const hasAnswers = answersArray.length > 0
  
  console.log('🔍 AnswerReview - answersArray:', answersArray)
  console.log('🔍 AnswerReview - hasAnswers:', hasAnswers)

  // Create a map of question ID to answer for easy lookup
  const answersMap = new Map(
    answersArray.map(ans => {
      // Handle both string and object formats for question ID
      const questionId = typeof ans.question === 'string' ? ans.question : ans.question?.id || ans.question_id || ans.question
      return [questionId, ans]
    })
  )
  
  console.log('🔍 AnswerReview - answersMap:', Array.from(answersMap.entries()))
  
  // Show warning only if truly no answers, but still display all questions
  // Check if we have any matching answers for the questions
  const hasMatchingAnswers = quiz.questions.some(question => {
    const questionId = question.id
    return answersMap.has(questionId) || 
           answersMap.has(String(questionId)) ||
           answersArray.some(ans => {
             const ansQuestionId = typeof ans.question === 'string' 
               ? ans.question 
               : ans.question?.id || ans.question_id || ans.question
             return ansQuestionId === questionId || String(ansQuestionId) === String(questionId)
           })
  })
  
  console.log('🔍 AnswerReview - hasMatchingAnswers:', hasMatchingAnswers)
  
  // Show warning if no matching answers but still display questions
  if (!hasMatchingAnswers && !hasAnswers) {
    return (
      <div className="space-y-4">
        <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-2">
                  لا توجد إجابات متاحة
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  لم يتم الإجابة على أي سؤال في هذا الاختبار بعد. سيتم عرض الأسئلة أدناه.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Show questions even without answers */}
        {quiz.questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Card className="border-2 border-amber-100 dark:border-amber-900/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-gray-50 dark:bg-slate-800/50">
              <div className="h-2 bg-gray-300 dark:bg-slate-600" />
              <CardContent className="p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-bold rounded-lg shadow-sm">
                        سؤال {index + 1}
                      </span>
                      <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-lg">
                        لم تتم الإجابة
                      </span>
                      <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-lg">
                        {question.points} نقطة
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-slate-50 leading-relaxed">
                      {question.question_text}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                      {question.question_type_display || question.question_type}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="p-4 bg-gray-100 dark:bg-gray-900/30 rounded-full">
                      <AlertTriangle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </div>
                
                {/* Show correct answer if available */}
                {question.correct_answer && (
                  <div className="p-5 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-300 dark:border-green-700">
                    <p className="text-xs font-bold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      الإجابة الصحيحة:
                    </p>
                    <p className="text-base font-semibold text-green-900 dark:text-green-200">
                      {question.correct_answer}
                    </p>
                  </div>
                )}
                
                {/* Show explanation if available */}
                {question.explanation && (
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 mt-4">
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      الشرح:
                    </p>
                    <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {quiz.questions.map((question, index) => {
        // Try multiple ways to find the answer
        const studentAnswer = answersMap.get(question.id) || 
                             answersMap.get(String(question.id)) ||
                             answersArray.find(ans => {
                               const ansQuestionId = typeof ans.question === 'string' 
                                 ? ans.question 
                                 : ans.question?.id || ans.question_id || ans.question
                               return ansQuestionId === question.id || String(ansQuestionId) === String(question.id)
                             })
        
        console.log(`🔍 Question ${index + 1} (${question.id}):`, {
          questionId: question.id,
          studentAnswer,
          answersMapKeys: Array.from(answersMap.keys()),
          foundInMap: answersMap.has(question.id) || answersMap.has(String(question.id))
        })
        
        const isCorrect = studentAnswer?.is_correct || false
        const hasAnswer = !!studentAnswer

        return (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Card className={`border-2 border-amber-100 dark:border-amber-900/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
              !hasAnswer
                ? 'bg-gray-50 dark:bg-slate-800/50'
                : isCorrect
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10'
                : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10'
            }`}>
              {/* Top colored bar */}
              <div className={`h-2 ${
                !hasAnswer
                  ? 'bg-gray-300 dark:bg-slate-600'
                  : isCorrect
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-red-500 to-rose-500'
              }`} />
              
              <CardContent className="p-8">
                {/* Question Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-bold rounded-lg shadow-sm">
                        سؤال {index + 1}
                      </span>
                      {hasAnswer ? (
                        isCorrect ? (
                          <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-bold rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            إجابة صحيحة
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-bold rounded-lg flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            إجابة خاطئة
                          </span>
                        )
                      ) : (
                        <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-lg">
                          لم تتم الإجابة
                        </span>
                      )}
                      <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-lg">
                        {question.points} نقطة
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-slate-50 leading-relaxed">
                      {question.question_text}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                      {question.question_type_display || question.question_type}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {hasAnswer ? (
                      isCorrect ? (
                        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                          <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                      )
                    ) : (
                      <div className="p-4 bg-gray-100 dark:bg-gray-900/30 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Answer Details */}
                <div className="space-y-4">
                  {/* Student Answer */}
                  {studentAnswer && (
                    <div className={`p-5 rounded-xl border-2 ${
                      isCorrect
                        ? 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-800'
                        : 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-800'
                    }`}>
                      <p className={`text-xs font-bold mb-2 flex items-center gap-2 ${
                        isCorrect
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        إجابتك:
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-slate-50">
                        {studentAnswer.selected_answer_text || studentAnswer.selected_answer}
                      </p>
                      {studentAnswer.points_earned !== undefined && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                          النقاط المكتسبة: {studentAnswer.points_earned} من {question.points}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Correct Answer (shown if answer is wrong or not answered) */}
                  {(!isCorrect || !hasAnswer) && (
                    <div className="p-5 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-300 dark:border-green-700">
                      <p className="text-xs font-bold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        الإجابة الصحيحة:
                      </p>
                      <p className="text-base font-semibold text-green-900 dark:text-green-200">
                        {studentAnswer?.correct_answer || question.correct_answer}
                      </p>
                    </div>
                  )}

                  {/* Explanation */}
                  {(studentAnswer?.explanation || question.explanation) && (
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        الشرح:
                      </p>
                      <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                        {studentAnswer?.explanation || question.explanation}
                      </p>
                    </div>
                  )}

                  {/* Choices (for multiple choice) */}
                  {question.question_type === 'multiple_choice' && question.choices && (
                    <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">
                        الخيارات المتاحة:
                      </p>
                      <div className="space-y-2">
                        {(() => {
                          try {
                            const choices = JSON.parse(question.choices)
                            return Object.entries(choices).map(([key, value]) => (
                              <div
                                key={key}
                                className={`p-3 rounded-lg border ${
                                  question.correct_answer === value
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                                    : studentAnswer?.selected_answer === value
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                                    : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600'
                                }`}
                              >
                                <span className="text-sm font-medium text-gray-900 dark:text-slate-50">
                                  {value as string}
                                  {question.correct_answer === value && (
                                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                                  )}
                                  {studentAnswer?.selected_answer === value && question.correct_answer !== value && (
                                    <span className="text-red-600 dark:text-red-400 mr-2">✗</span>
                                  )}
                                </span>
                              </div>
                            ))
                          } catch {
                            return <p className="text-sm text-gray-500 dark:text-slate-400">خطأ في عرض الخيارات</p>
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
