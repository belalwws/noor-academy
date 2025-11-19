'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { quizzesApi, quizAttemptsApi, type QuizAttempt } from '@/lib/api/quizzes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from 'lucide-react'

export default function QuizAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params?.['quizId'] as string

  const [quizDetails, setQuizDetails] = useState<any>(null)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quizId) return
    loadAnalyticsData()
  }, [quizId])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch quiz details and attempts in parallel
      const [quizData, attemptsData] = await Promise.all([
        quizzesApi.get(quizId),
        quizAttemptsApi.list({ quiz: quizId, status: 'completed' })
      ])

      console.log('📊 Quiz Details:', quizData)
      console.log('📊 Quiz Attempts:', attemptsData)

      setQuizDetails(quizData)
      setAttempts(attemptsData.results || [])
    } catch (err: any) {
      console.error('❌ Error loading analytics:', err)
      const errorMsg = err?.data?.detail || err?.message || 'فشل تحميل البيانات'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-96">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-red-600 mb-2">خطأ في تحميل البيانات</h3>
              <p className="text-gray-600 dark:text-slate-400 mb-6">{error}</p>
              <Button onClick={() => router.back()}>العودة</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalAttempts = attempts.length
  const passedAttempts = attempts.filter(a => a.passed).length
  const failedAttempts = totalAttempts - passedAttempts
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0
  const averageScore = totalAttempts > 0
    ? attempts.reduce((sum, a) => {
        const score = typeof a.score === 'string' ? parseFloat(a.score) : (a.score || 0)
        return sum + score
      }, 0) / totalAttempts
    : 0

  // Get unique students
  const uniqueStudents = new Set(attempts.map(a => a.student_name)).size

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 pt-20 pb-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50 mb-2">
            نتائج الاختبار
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            {quizDetails?.title}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Attempts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                      إجمالي المحاولات
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-slate-50">
                      {totalAttempts}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Unique Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                      عدد الطلاب
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-slate-50">
                      {uniqueStudents}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pass Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                      نسبة النجاح
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-slate-50">
                      {passRate}%
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Passed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                      نجح
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {passedAttempts}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Failed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                      فشل
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {failedAttempts}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Average Score */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      متوسط الدرجات
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">
                      {averageScore.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${averageScore}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Attempts Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-gray-200 dark:border-slate-700">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              تفاصيل محاولات الطلاب
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {attempts.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-slate-400">
                  لا توجد محاولات مكتملة حتى الآن
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-slate-300">
                        اسم الطالب
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-slate-300">
                        رقم المحاولة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-slate-300">
                        الدرجة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-slate-300">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-slate-300">
                        الوقت المستغرق
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-slate-300">
                        التاريخ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {attempts.map((attempt, index) => {
                      const score = typeof attempt.score === 'string' ? parseFloat(attempt.score) : (attempt.score || 0)
                      const isPassed = attempt.passed
                      const timeInMinutes = attempt.time_taken ? Math.round(attempt.time_taken / 60) : 0

                      return (
                        <motion.tr
                          key={attempt.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-50">
                            {attempt.student_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                            {attempt.attempt_number}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${
                                score >= quizDetails?.passing_score
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}>
                                {score.toFixed(2)}%
                              </span>
                              <div className="w-16 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    score >= quizDetails?.passing_score
                                      ? 'bg-green-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isPassed ? (
                              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center gap-1 w-fit">
                                <CheckCircle className="w-3 h-3" />
                                نجح
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center gap-1 w-fit">
                                <XCircle className="w-3 h-3" />
                                فشل
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {timeInMinutes} دقيقة
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                            {attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
