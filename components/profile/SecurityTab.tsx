'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Key,
  Mail,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { motion } from 'framer-motion'

interface PasswordData {
  old_password: string
  new_password: string
  confirm_password: string
}

interface FormData {
  is_profile_public: boolean
}

interface UserProfile {
  is_verified?: boolean
  email?: string
}

interface SecurityTabProps {
  formData: FormData
  passwordData: PasswordData
  profileData?: UserProfile | null
  loading: boolean
  showPasswordDialog: boolean
  sendingVerification?: boolean
  onFormDataChange: (data: FormData) => void
  onPasswordDataChange: (data: PasswordData) => void
  onPasswordDialogToggle: () => void
  onPasswordChange: () => void
  onSendEmailVerification?: () => void
}

const SecurityTab: React.FC<SecurityTabProps> = ({
  formData,
  passwordData,
  profileData,
  loading,
  showPasswordDialog,
  sendingVerification = false,
  onFormDataChange,
  onPasswordDataChange,
  onPasswordDialogToggle,
  onPasswordChange,
  onSendEmailVerification
}) => {
  const [showOldPassword, setShowOldPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const handlePasswordInputChange = (field: keyof PasswordData, value: string) => {
    onPasswordDataChange({
      ...passwordData,
      [field]: value
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Password Security */}
      <Card className="border-0 shadow-xl bg-white dark:bg-slate-800 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-amber-200 dark:border-amber-700">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-slate-800 dark:text-slate-100">أمان كلمة المرور</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Email Verification Section */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 rounded-xl border-2 ${
                profileData?.is_verified
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
              }`}
            >
              <div className="flex items-center gap-4 mb-4 lg:mb-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  profileData?.is_verified
                    ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                    : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300'
                }`}>
                  {profileData?.is_verified ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">تحقق البريد الإلكتروني</h4>
                  <p className={`text-sm ${
                    profileData?.is_verified
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {profileData?.is_verified
                      ? 'تم تحقق بريدك الإلكتروني بنجاح'
                      : 'يرجى تحقق بريدك الإلكتروني لتفعيل حسابك'
                    }
                  </p>
                  {profileData?.email && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{profileData.email}</p>
                  )}
                </div>
              </div>

              {!profileData?.is_verified && onSendEmailVerification && (
                <Button
                  onClick={onSendEmailVerification}
                  disabled={sendingVerification}
                  variant="outline"
                  className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white border-0 hover:from-amber-600 hover:to-orange-700 shadow-md"
                >
                  {sendingVerification ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      إرسال رسالة التحقق
                    </>
                  )}
                </Button>
              )}
            </motion.div>

            {/* Password Change Section */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-600"
            >
              <div className="mb-4 lg:mb-0">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">تغيير كلمة المرور</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">قم بتحديث كلمة المرور لحماية حسابك</p>
              </div>
              <Button
                onClick={onPasswordDialogToggle}
                variant="outline"
                className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white border-0 hover:from-amber-600 hover:to-orange-700 shadow-md"
              >
                <Key className="w-4 h-4 mr-2" />
                تغيير كلمة المرور
              </Button>
            </motion.div>

            {showPasswordDialog && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 border-2 border-amber-200 dark:border-amber-700 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl space-y-6"
              >
                <div>
                  <Label htmlFor="old_password" className="text-slate-700 dark:text-slate-300 font-medium">كلمة المرور الحالية</Label>
                  <div className="relative mt-2">
                    <Input
                      id="old_password"
                      type={showOldPassword ? "text" : "password"}
                      value={passwordData.old_password}
                      onChange={(e) => handlePasswordInputChange('old_password', e.target.value)}
                      className="pr-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="new_password" className="text-slate-700 dark:text-slate-300 font-medium">كلمة المرور الجديدة</Label>
                  <div className="relative mt-2">
                    <Input
                      id="new_password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.new_password}
                      onChange={(e) => handlePasswordInputChange('new_password', e.target.value)}
                      className="pr-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm_password" className="text-slate-700 dark:text-slate-300 font-medium">تأكيد كلمة المرور الجديدة</Label>
                  <div className="relative mt-2">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirm_password}
                      onChange={(e) => handlePasswordInputChange('confirm_password', e.target.value)}
                      className="pr-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={onPasswordChange}
                    disabled={loading}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 hover:from-amber-600 hover:to-orange-700 text-white shadow-md"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        جاري التحديث...
                      </>
                    ) : (
                      'تحديث كلمة المرور'
                    )}
                  </Button>
                  <Button
                    onClick={onPasswordDialogToggle}
                    variant="outline"
                    disabled={loading}
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    إلغاء
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Email Verification Info */}
      {!profileData?.is_verified && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-300 flex-shrink-0" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 text-lg">تحقق البريد الإلكتروني مطلوب</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                    لم يتم تحقق بريدك الإلكتروني بعد. يرجى التحقق من صندوق الوارد الخاص بك واتباع الرابط المرسل.
                  </p>
                  <div className="space-y-2 text-sm text-yellow-600 dark:text-yellow-400">
                    <p>• تحقق من مجلد الرسائل غير المرغوب فيها (Spam)</p>
                    <p>• تأكد من صحة عنوان البريد الإلكتروني</p>
                    <p>• يمكنك طلب رسالة تحقق جديدة باستخدام الزر أعلاه</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}

export default SecurityTab
