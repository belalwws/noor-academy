'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { User, Edit, X, Save, Target, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

interface FormData {
  first_name: string
  last_name: string
  email: string
  gender: 'male' | 'female'
  country_code: string
  phone_number: string
  age: number
  bio: string
  learning_goal: 'memorize_quran' | 'learn_arabic' | 'islamic_studies' | 'other'
  preferred_language: 'ar' | 'en'
}

interface PersonalInfoTabProps {
  formData: FormData
  loading: boolean
  onFormDataChange: (data: Partial<FormData>) => void
  onSave: () => void
  hideLearningGoal?: boolean
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  formData,
  loading,
  onFormDataChange,
  onSave,
  hideLearningGoal = false
}) => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [localFormData, setLocalFormData] = useState<FormData>(formData)

  // Update local form data when prop changes
  useEffect(() => {
    setLocalFormData(formData)
  }, [formData])

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    const updated = {
      ...localFormData,
      [field]: value
    }
    setLocalFormData(updated)
    onFormDataChange({ [field]: value })
  }

  const handleEdit = () => {
    setIsEditMode(true)
  }

  const handleCancel = () => {
    setLocalFormData(formData) // Reset to original data
    setIsEditMode(false)
  }

  const handleSave = () => {
    onSave()
    setIsEditMode(false)
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

  const getGenderLabel = (gender: string) => {
    return gender === 'male' ? 'ذكر' : 'أنثى'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Personal Information Card */}
      <Card className="border-0 shadow-xl bg-white dark:bg-slate-800 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-amber-200 dark:border-amber-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-slate-800 dark:text-slate-100">البيانات الشخصية</span>
            </CardTitle>
            {!isEditMode && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white rounded-xl font-medium shadow-lg hover:from-amber-600 hover:to-orange-700 transition-all"
              >
                <Edit className="w-4 h-4" />
                تعديل
              </motion.button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Label htmlFor="first_name" className="text-slate-700 dark:text-slate-300 font-medium">الاسم الأول</Label>
              {isEditMode ? (
                <Input
                  id="first_name"
                  value={localFormData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="mt-2 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                />
              ) : (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                  {localFormData.first_name || '-'}
                </div>
              )}
            </motion.div>

            {/* Last Name */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Label htmlFor="last_name" className="text-slate-700 dark:text-slate-300 font-medium">اسم العائلة</Label>
              {isEditMode ? (
                <Input
                  id="last_name"
                  value={localFormData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="mt-2 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                />
              ) : (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                  {localFormData.last_name || '-'}
                </div>
              )}
            </motion.div>

            {/* Email - Read Only */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">البريد الإلكتروني</Label>
              <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                {localFormData.email || '-'}
              </div>
            </motion.div>

            {/* Gender */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Label htmlFor="gender" className="text-slate-700 dark:text-slate-300 font-medium">الجنس</Label>
              {isEditMode ? (
                <Select
                  value={localFormData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger className="mt-2 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                    <SelectValue placeholder="اختر الجنس" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                  {getGenderLabel(localFormData.gender)}
                </div>
              )}
            </motion.div>

            {/* Country Code */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="country_code" className="text-slate-700 dark:text-slate-300 font-medium">رمز البلد</Label>
              {isEditMode ? (
                <Input
                  id="country_code"
                  value={localFormData.country_code}
                  onChange={(e) => handleInputChange('country_code', e.target.value)}
                  className="mt-2 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                  placeholder="+966"
                />
              ) : (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                  {localFormData.country_code || '-'}
                </div>
              )}
            </motion.div>

            {/* Phone Number */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Label htmlFor="phone_number" className="text-slate-700 dark:text-slate-300 font-medium">رقم الهاتف</Label>
              {isEditMode ? (
                <Input
                  id="phone_number"
                  value={localFormData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="mt-2 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                />
              ) : (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                  {localFormData.phone_number || '-'}
                </div>
              )}
            </motion.div>

            {/* Age */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label htmlFor="age" className="text-slate-700 dark:text-slate-300 font-medium">العمر</Label>
              {isEditMode ? (
                <Input
                  id="age"
                  type="number"
                  value={localFormData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                  className="mt-2 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                  min="1"
                  max="120"
                />
              ) : (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                  {localFormData.age || '-'}
                </div>
              )}
            </motion.div>
          </div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Label htmlFor="bio" className="text-slate-700 dark:text-slate-300 font-medium">نبذة شخصية</Label>
            {isEditMode ? (
              <Textarea
                id="bio"
                value={localFormData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="mt-2 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                rows={4}
                placeholder="اكتب نبذة مختصرة عن نفسك..."
              />
            ) : (
              <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 min-h-[100px]">
                {localFormData.bio || '-'}
              </div>
            )}
          </motion.div>

          {/* Learning Preferences Section - Hidden for supervisors */}
          {!hideLearningGoal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-6 border-t border-slate-200 dark:border-slate-700"
            >
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                التفضيلات التعليمية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Learning Goal */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <Label htmlFor="learning_goal" className="text-slate-700 dark:text-slate-300 font-medium">الهدف التعليمي</Label>
                  {isEditMode ? (
                    <Select
                      value={localFormData.learning_goal}
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
                  ) : (
                    <div className="mt-2">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white px-4 py-2 text-base shadow-md">
                        <Target className="w-4 h-4 mr-2" />
                        {getLearningGoalLabel(localFormData.learning_goal)}
                      </Badge>
                    </div>
                  )}
                </motion.div>

                {/* Preferred Language */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Label htmlFor="preferred_language" className="text-slate-700 dark:text-slate-300 font-medium">اللغة المفضلة</Label>
                  {isEditMode ? (
                    <Select
                      value={localFormData.preferred_language}
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
                  ) : (
                    <div className="mt-2">
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white px-4 py-2 text-base shadow-md">
                        <Globe className="w-4 h-4 mr-2" />
                        {getLanguageLabel(localFormData.preferred_language)}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Preferred Language Only - For supervisors */}
          {hideLearningGoal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-6 border-t border-slate-200 dark:border-slate-700"
            >
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                التفضيلات
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preferred Language */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <Label htmlFor="preferred_language" className="text-slate-700 dark:text-slate-300 font-medium">اللغة المفضلة</Label>
                  {isEditMode ? (
                    <Select
                      value={localFormData.preferred_language}
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
                  ) : (
                    <div className="mt-2">
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white px-4 py-2 text-base shadow-md">
                        <Globe className="w-4 h-4 mr-2" />
                        {getLanguageLabel(localFormData.preferred_language)}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700"
            >
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium shadow-md hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <X className="w-4 h-4" />
                إلغاء
              </button>
              <button
                onClick={handleSave}
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
                    <Save className="w-4 h-4" />
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

export default PersonalInfoTab
