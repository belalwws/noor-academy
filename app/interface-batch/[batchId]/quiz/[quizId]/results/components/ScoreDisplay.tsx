'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { ConfettiEffect } from '@/components/games/ConfettiEffect'
import { useGameSounds } from '@/hooks/useGameSounds'

interface ScoreDisplayProps {
  score: number
  totalQuestions: number
  passingScore: number
  passed: boolean
}

export default function ScoreDisplay({
  score,
  totalQuestions,
  passingScore,
  passed
}: ScoreDisplayProps) {
  const percentage = score
  const correctAnswers = Math.round(totalQuestions * (score / 100))
  const [showConfetti, setShowConfetti] = useState(false)
  const sounds = useGameSounds({ enabled: true })

  // Trigger confetti and sound when passed
  useEffect(() => {
    if (passed) {
      setShowConfetti(true)
      // Play win sound after a short delay to avoid overlap with animations
      setTimeout(() => {
        sounds.playWin()
      }, 500)
      
      // Hide confetti after animation completes
      setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
    }
  }, [passed, sounds])

  return (
    <div className="space-y-6">
      {/* Confetti Effect */}
      <ConfettiEffect
        trigger={showConfetti}
        duration={3000}
        particleCount={150}
        spread={70}
        colors={['#E9A821', '#FFB347', '#FFD700', '#10B981', '#34D399']}
      />
      
      {/* Main Score Card */}
      <Card className="overflow-hidden border-2 border-amber-100 dark:border-amber-900/30 shadow-xl">
        <div className={`h-2 bg-gradient-to-r ${
          passed
            ? 'from-amber-400 via-amber-500 to-orange-600 dark:from-amber-500 dark:via-amber-600 dark:to-orange-700'
            : 'from-amber-400 via-yellow-500 to-amber-600 dark:from-amber-500 dark:via-yellow-600 dark:to-amber-700'
        }`} />
        
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left Side - Circular Score */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
              className="flex items-center justify-center p-8 md:p-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900"
            >
              <div className="relative w-48 h-48 md:w-56 md:h-56">
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-200 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 blur-xl" />
                
                {/* SVG Circle */}
                <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 224 224">
                  {/* Background Circle */}
                  <circle
                    cx="112"
                    cy="112"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-gray-300 dark:text-slate-600"
                  />
                  
                  {/* Progress Circle */}
                  <motion.circle
                    cx="112"
                    cy="112"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50}
                    strokeLinecap="round"
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 50 - (percentage / 100) * (2 * Math.PI * 50)
                    }}
                    transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
                    className={`${
                      passed
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-amber-600 dark:text-amber-400'
                    } drop-shadow-lg`}
                    filter="drop-shadow(0 4px 12px rgba(0,0,0,0.15))"
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="text-center px-2"
                  >
                    <div className={`text-3xl md:text-4xl font-black tracking-tight leading-none ${
                      passed
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {Math.round(score)}%
                    </div>
                    <div className="text-[9px] md:text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-1 md:mt-1.5 uppercase tracking-widest">
                      النسبة المئوية
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Status and Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
              className="p-12 flex flex-col justify-center bg-white dark:bg-slate-900"
            >
              {/* Status Badge */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  {passed ? (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                        className="p-4 bg-gradient-to-br from-blue-100 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30 rounded-full"
                      >
                        <CheckCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      </motion.div>
                      <div>
                        <motion.h2
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 }}
                          className="text-3xl font-black text-gray-900 dark:text-slate-50"
                        >
                          ممتاز! 🎉
                        </motion.h2>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                          className="text-sm text-gray-600 dark:text-slate-400 mt-1"
                        >
                          لقد اجتزت الاختبار بنجاح
                        </motion.p>
                      </div>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                        className="p-4 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-full"
                      >
                        <AlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                      </motion.div>
                      <div>
                        <motion.h2
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 }}
                          className="text-3xl font-black text-gray-900 dark:text-slate-50"
                        >
                          محاولة أخرى 💪
                        </motion.h2>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                          className="text-sm text-gray-600 dark:text-slate-400 mt-1"
                        >
                          حاول مرة أخرى لتحسين درجتك
                        </motion.p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-slate-700">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-amber-600 dark:text-amber-400">⚡</span>
                    <span className="text-sm text-gray-600 dark:text-slate-400">الأسئلة الصحيحة</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-slate-50">
                    {correctAnswers}/{totalQuestions}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-amber-600 dark:text-amber-400">📈</span>
                    <span className="text-sm text-gray-600 dark:text-slate-400">حد النجاح</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-slate-50">
                    {passingScore}%
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    passed
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'bg-yellow-50 dark:bg-yellow-900/20'
                  }`}
                >
                  <span className={`text-sm font-semibold ${
                    passed
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    الفارق
                  </span>
                  <span className={`text-lg font-bold ${
                    passed
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {passed ? `+${score - passingScore}%` : `-${passingScore - score}%`}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="space-y-2"
      >
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold text-gray-700 dark:text-slate-300">التقدم الكلي</span>
          <span className="text-gray-500 dark:text-slate-400">{percentage}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, delay: 1.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-500 via-amber-500 to-orange-600 dark:from-amber-600 dark:via-amber-500 dark:to-orange-400 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  )
}
