'use client'

import React from 'react'
import { Quiz, QuizAttempt } from '@/lib/api/quizzes'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Award, Clock, Zap, Target, TrendingUp, Calendar } from 'lucide-react'

interface ResultSummaryProps {
  quiz: Quiz
  attempt: QuizAttempt
  score: number
  totalQuestions: number
  passingScore: number
  passed: boolean
}

export default function ResultSummary({
  quiz,
  attempt,
  score,
  totalQuestions,
  passingScore,
  passed
}: ResultSummaryProps) {
  // Calculate time taken
  const formatTimeTaken = (seconds?: number) => {
    if (!seconds) return 'غير متاح'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes} دقيقة ${secs} ثانية`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Use data from attempt (more accurate than calculated)
  const correctAnswers = attempt.correct_answers || Math.round(totalQuestions * (score / 100))
  const incorrectAnswers = totalQuestions - correctAnswers
  
  const stats = [
    {
      icon: Zap,
      label: 'الأسئلة الصحيحة',
      value: `${correctAnswers} من ${totalQuestions}`,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      icon: Clock,
      label: 'الوقت المستغرق',
      value: formatTimeTaken(attempt.time_taken),
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      icon: Award,
      label: 'النقاط المكتسبة',
      value: `${attempt.earned_points || 0} من ${attempt.total_points || 0}`,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30'
    },
    {
      icon: Target,
      label: 'الأسئلة الخاطئة',
      value: `${incorrectAnswers} من ${totalQuestions}`,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
      iconBg: 'bg-red-100 dark:bg-red-900/30'
    },
    {
      icon: TrendingUp,
      label: 'النسبة المئوية',
      value: `${score}%`,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      icon: Calendar,
      label: 'تاريخ الإكمال',
      value: attempt.completed_at ? formatDate(attempt.completed_at) : 'جاري...',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Quiz Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-amber-100 dark:border-amber-900/30 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/30 rounded-2xl">
                <Award className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-gray-900 dark:text-slate-50 mb-2">
                  {quiz.title}
                </h3>
                {quiz.description && (
                  <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                    {quiz.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full">
                    {quiz.quiz_type_display}
                  </span>
                  {attempt.completed_at && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                      ✓ مكتمل
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4, type: 'spring' }}
            >
              <Card className={`${stat.bgColor} border-2 border-amber-100 dark:border-amber-900/30 shadow-lg hover:shadow-xl transition-all duration-300`} style={{ transform: 'none' }}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${stat.iconBg} flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                        {stat.label}
                      </p>
                      <p className={`text-lg font-black ${stat.color} truncate`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Performance Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className={`border-2 border-amber-100 dark:border-amber-900/30 shadow-xl ${
          passed
            ? 'bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 dark:from-blue-900/20 dark:via-blue-900/20 dark:to-blue-900/20'
            : 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-900/20'
        }`}>
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl flex-shrink-0 ${
                passed
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'bg-amber-100 dark:bg-amber-900/30'
              }`}>
                <span className="text-4xl">{passed ? '🎉' : '💪'}</span>
              </div>
              <div className="flex-1">
                <h4 className={`text-2xl font-black mb-3 ${
                  passed
                    ? 'text-blue-900 dark:text-blue-200'
                    : 'text-amber-900 dark:text-amber-200'
                }`}>
                  {passed ? 'ممتاز! لقد نجحت!' : 'استمر في المحاولة!'}
                </h4>
                <p className={`text-base leading-relaxed ${
                  passed
                    ? 'text-blue-800 dark:text-blue-300'
                    : 'text-amber-800 dark:text-amber-300'
                }`}>
                  {passed
                    ? `تهانينا! لقد أظهرت فهماً ممتازاً للمادة بحصولك على ${score}% وهذا يتجاوز حد النجاح ${passingScore}%. استمر بهذا المستوى الرائع!`
                    : `حصلت على ${score}% بينما تحتاج إلى ${passingScore}% للنجاح. لا تقلق! راجع إجاباتك الخاطئة وركز على المواضيع الصعبة، ثم حاول مرة أخرى.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-2 border-amber-100 dark:border-amber-900/30 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <CardContent className="p-8">
            <h4 className="text-xl font-black text-gray-900 dark:text-slate-50 mb-6 flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              الخطوات التالية
            </h4>
            <ul className="space-y-4">
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl"
              >
                <span className="text-2xl flex-shrink-0">📋</span>
                <div>
                  <p className="font-bold text-gray-900 dark:text-slate-50 mb-1">
                    استعرض إجاباتك
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    راجع الأسئلة الخاطئة لفهم المفاهيم الصعبة والتعلم منها
                  </p>
                </div>
              </motion.li>
              
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl"
              >
                <span className="text-2xl flex-shrink-0">📚</span>
                <div>
                  <p className="font-bold text-gray-900 dark:text-slate-50 mb-1">
                    راجع المحتوى
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    عد إلى الدروس والمواد المتعلقة بالأسئلة التي أخطأت فيها
                  </p>
                </div>
              </motion.li>
              
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className={`flex items-start gap-4 p-4 rounded-xl ${
                  quiz.allow_retake
                    ? 'bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20'
                    : 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20'
                }`}
              >
                <span className="text-2xl flex-shrink-0">{quiz.allow_retake ? '🔄' : '🔒'}</span>
                <div>
                  <p className="font-bold text-gray-900 dark:text-slate-50 mb-1">
                    {quiz.allow_retake ? 'أعد الاختبار' : 'إعادة الاختبار غير متاحة'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    {quiz.allow_retake
                      ? 'يمكنك إعادة الاختبار لتحسين درجتك وتعزيز فهمك للمادة'
                      : 'هذا الاختبار لا يسمح بالإعادة، ولكن يمكنك مراجعة إجاباتك'}
                  </p>
                </div>
              </motion.li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
