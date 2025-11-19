'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { QuizQuestion } from '@/lib/api/quizzes'

interface QuestionDisplayProps {
  question: QuizQuestion
  questionNumber: number
  totalQuestions: number
  selectedAnswer: string
  onAnswerChange: (answer: string) => void
}

export default function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerChange
}: QuestionDisplayProps) {
  // Parse choices if it's a JSON string
  let choices: string[] = []
  if (question.choices) {
    try {
      choices = typeof question.choices === 'string' 
        ? JSON.parse(question.choices)
        : Array.isArray(question.choices)
        ? question.choices
        : []
    } catch (e) {
      console.error('Error parsing choices:', e)
      choices = []
    }
  }

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-500 dark:to-orange-500 bg-clip-text text-transparent">
            السؤال {questionNumber} من {totalQuestions}
          </h2>
          {question.points && (
            <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white rounded-xl text-sm font-bold shadow-lg">
              {question.points} نقطة
            </span>
          )}
        </div>
        <p className="text-lg md:text-xl text-gray-800 dark:text-slate-100 font-medium leading-relaxed">
          {question.question_text}
        </p>
      </div>

      {/* Question Options */}
      <div className="space-y-3">
        {question.question_type === 'true_false' ? (
          // True/False Options
          <div className="grid grid-cols-2 gap-4">
            {['true', 'false'].map((option) => {
              const label = option === 'true' ? 'صحيح ✓' : 'خاطئ ✗'
              const isSelected = selectedAnswer === option

              return (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAnswerChange(option)}
                  className={`p-6 rounded-xl border-2 transition-all font-bold text-lg shadow-md hover:shadow-lg ${
                    isSelected
                      ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 shadow-lg'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-600'
                  }`}
                >
                  {label}
                </motion.button>
              )
            })}
          </div>
        ) : (
          // Multiple Choice Options
          <div className="space-y-3">
            {choices.map((choice, index) => {
              const isSelected = selectedAnswer === index.toString()

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01, x: -4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onAnswerChange(index.toString())}
                  className={`w-full p-5 rounded-xl border-2 transition-all text-right font-medium shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 shadow-lg'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-600 shadow-md'
                        : 'border-gray-300 dark:border-slate-600'
                    }`}>
                      {isSelected && (
                        <span className="text-white text-base font-bold">✓</span>
                      )}
                    </div>
                    <span className="text-base">{choice}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {/* Explanation (if available) */}
      {question.explanation && (
        <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 border-2 border-amber-200 dark:border-amber-800/30 rounded-xl shadow-sm">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
            <span className="text-lg">💡</span>
            شرح:
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  )
}
