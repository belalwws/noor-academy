'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  BookOpen,
  Award,
  Target,
  Globe,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react'
import { motion } from 'framer-motion'

interface FormData {
  learning_goal: 'memorize_quran' | 'learn_arabic' | 'islamic_studies' | 'other'
  preferred_language: 'ar' | 'en'
}

interface UserStats {
  total_courses: number
  completed_courses: number
  in_progress_courses: number
  certificates_earned: number
  total_study_hours: number
  average_grade: number
}

interface AcademicTabProps {
  formData: FormData
  userStats: UserStats | null
  onFormDataChange: (data: FormData) => void
  onSave?: () => void
  loading?: boolean
  editMode?: boolean
}

const AcademicTab: React.FC<AcademicTabProps> = ({
  formData,
  userStats,
  onFormDataChange,
  onSave,
  loading = false,
  editMode = true
}) => {
  const handleInputChange = (field: keyof FormData, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value
    })
  }

  const getLearningGoalLabel = (goal: string) => {
    const goals = {
      'memorize_quran': 'حفظ القرآن الكريم',
      'learn_arabic': 'تعلم اللغة العربية',
      'islamic_studies': 'الدراسات الإسلامية',
      'other': 'أخرى'
    }
    return goals[goal as keyof typeof goals] || goal
  }

  const getLanguageLabel = (lang: string) => {
    const languages = {
      'ar': 'العربية',
      'en': 'الإنجليزية'
    }
    return languages[lang as keyof typeof languages] || lang
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Academic Stats */}
      {userStats && (
        <Card className="border-0 shadow-xl bg-white dark:bg-slate-800 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-amber-200 dark:border-amber-700">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-slate-800 dark:text-slate-100">الإحصائيات الأكاديمية</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-300">{userStats.total_courses}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">إجمالي الدورات</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <Award className="w-10 h-10 mx-auto mb-3 text-emerald-600 dark:text-emerald-400" />
                <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-300">{userStats.certificates_earned}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">الشهادات المحصلة</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <Clock className="w-10 h-10 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
                <p className="text-3xl font-bold text-purple-800 dark:text-purple-300">{userStats.total_study_hours}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">ساعات الدراسة</p>
              </motion.div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <Star className="w-10 h-10 mx-auto mb-3 text-amber-600 dark:text-amber-400" />
                <p className="text-3xl font-bold text-amber-800 dark:text-amber-300">{userStats.average_grade?.toFixed(1) || '0.0'}</p>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">المعدل العام</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center p-6 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <TrendingUp className="w-10 h-10 mx-auto mb-3 text-teal-600 dark:text-teal-400" />
                <p className="text-3xl font-bold text-teal-800 dark:text-teal-300">{userStats.in_progress_courses}</p>
                <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">الدورات الجارية</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Preferences */}
      <Card className="border-0 shadow-xl bg-white dark:bg-slate-800 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-amber-200 dark:border-amber-700">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
              <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-slate-800 dark:text-slate-100">التفضيلات التعليمية</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Label htmlFor="learning_goal" className="text-slate-700 dark:text-slate-300 font-medium">الهدف التعليمي</Label>
              <Select
                value={formData.learning_goal}
                onValueChange={(value) => handleInputChange('learning_goal', value)}
              >
                <SelectTrigger className="mt-2 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                  <SelectValue placeholder="اختر هدفك التعليمي" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="memorize_quran">حفظ القرآن الكريم</SelectItem>
                  <SelectItem value="learn_arabic">تعلم اللغة العربية</SelectItem>
                  <SelectItem value="islamic_studies">الدراسات الإسلامية</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Label htmlFor="preferred_language" className="text-slate-700 dark:text-slate-300 font-medium">اللغة المفضلة</Label>
              <Select
                value={formData.preferred_language}
                onValueChange={(value) => handleInputChange('preferred_language', value)}
              >
                <SelectTrigger className="mt-2 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                  <SelectValue placeholder="اختر اللغة المفضلة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">الإنجليزية</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>

          {!editMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-600"
            >
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">ملخص التفضيلات الحالية:</h4>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white px-4 py-2 shadow-md">
                  <Target className="w-4 h-4 mr-2" />
                  {getLearningGoalLabel(formData.learning_goal)}
                </Badge>
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white px-4 py-2 shadow-md">
                  <Globe className="w-4 h-4 mr-2" />
                  {getLanguageLabel(formData.preferred_language)}
                </Badge>
              </div>
            </motion.div>
          )}

          {/* Save Button */}
          {onSave && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex justify-end pt-4"
            >
              <button
                onClick={onSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white rounded-xl font-medium shadow-lg hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    حفظ التغييرات
                  </>
                )}
              </button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default AcademicTab
