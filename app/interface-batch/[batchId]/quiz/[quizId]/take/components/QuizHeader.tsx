'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Quiz } from '@/lib/api/quizzes'
import { BookOpen, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface QuizHeaderProps {
  quiz: Quiz
}

export default function QuizHeader({ quiz }: QuizHeaderProps) {
  const router = useRouter()

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-2xl shadow-lg"
          >
            <BookOpen className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-500 dark:to-orange-500 bg-clip-text text-transparent mb-2">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="text-gray-600 dark:text-slate-300 max-w-2xl text-base">
                {quiz.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-semibold">
                📊 {quiz.total_questions} سؤال
              </span>
              {quiz.time_limit && (
                <span className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-semibold">
                  ⏱️ {Math.round(quiz.time_limit / 60)} دقيقة
                </span>
              )}
              <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold">
                ✅ {quiz.passing_score}% للنجاح
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2 border-2 border-gray-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          العودة
        </Button>
      </div>

    </motion.div>
  )
}
