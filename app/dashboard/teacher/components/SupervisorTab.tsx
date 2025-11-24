'use client'

import { motion } from 'framer-motion'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { CheckCircle, UserIcon, RefreshCw, Mail, AlertCircle } from 'lucide-react'

interface JoinGeneralSupervisorRequest {
  supervisor_email: string
  message?: string
}

interface SupervisorTabProps {
  requestSuccess: boolean
  submittingRequest: boolean
  joinRequest: JoinGeneralSupervisorRequest
  onJoinRequestChange: (field: keyof JoinGeneralSupervisorRequest, value: string) => void
  onSubmitRequest: () => void
  supervisorEmailError?: string
  currentSupervisorEmail?: string
  requestError?: string
  onResetError?: () => void
}

export default function SupervisorTab({
  requestSuccess,
  submittingRequest,
  joinRequest,
  onJoinRequestChange,
  onSubmitRequest,
  supervisorEmailError,
  currentSupervisorEmail,
  requestError,
  onResetError
}: SupervisorTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white dark:from-slate-800 via-teal-50/30 dark:via-teal-900/20 to-white dark:to-slate-800 rounded-2xl md:rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-teal-600 via-teal-500 to-teal-700 dark:from-teal-700 dark:via-teal-600 dark:to-teal-800 text-white rounded-t-2xl md:rounded-t-3xl relative overflow-hidden p-4 md:p-6">
          {/* Decorative Elements */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl"
          ></motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-teal-300/20 dark:from-teal-400/20 to-transparent rounded-full blur-xl"
          ></motion.div>
          
          <div className="relative z-10">
            <CardTitle className="flex items-center gap-3 md:gap-4 text-xl md:text-2xl font-bold mb-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                whileHover={{ rotate: 5, scale: 1.1 }}
                className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg"
              >
                <UserIcon className="h-5 w-5 md:h-7 md:w-7 text-white" />
              </motion.div>
              <span>طلب الانضمام إلى مشرف عام جديد</span>
            </CardTitle>
            <CardDescription className="text-teal-100 dark:text-teal-200 text-base md:text-lg">
              قدم طلبًا للانضمام إلى مشرف عام إضافي لتوسيع شبكة الإشراف
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {requestSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
                <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  تم إرسال طلب الانضمام بنجاح! سيتم مراجعة طلبك من قبل المشرف العام.
                </AlertDescription>
              </Alert>
            </motion.div>
          ) : requestError ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 p-4 md:p-6"
            >
              <Alert className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {requestError}
                </AlertDescription>
              </Alert>
              <div className="flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => {
                      if (onResetError) {
                        onResetError();
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white flex items-center gap-2 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={submittingRequest}
                  >
                    <RefreshCw className="w-4 h-4" />
                    تعديل البيانات والمحاولة مرة أخرى
                  </Button>
                </motion.div>
              </div>
            </motion.div>
        ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={(e) => { e.preventDefault(); onSubmitRequest(); }}
              className="space-y-6 p-4 md:p-6"
            >
              {currentSupervisorEmail && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      المشرف العام الحالي: <strong>{currentSupervisorEmail}</strong>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="supervisor-email" className="text-right flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <Mail className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  البريد الإلكتروني للمشرف العام الجديد
                </Label>
                <Input
                  id="supervisor-email"
                  type="email"
                  placeholder="supervisor@example.com"
                  value={joinRequest.supervisor_email}
                  onChange={(e) => onJoinRequestChange('supervisor_email', e.target.value)}
                  className="text-right h-11 md:h-12 border-2 border-slate-200 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400 bg-white dark:bg-slate-800"
                  required
                />
                {supervisorEmailError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Alert className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        {supervisorEmailError}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="message" className="text-right text-slate-700 dark:text-slate-300 font-medium">
                  رسالة إضافية (اختيارية)
                </Label>
                <Textarea
                  id="message"
                  placeholder="اكتب رسالة للمشرف العام..."
                  value={joinRequest.message || ''}
                  onChange={(e) => onJoinRequestChange('message', e.target.value)}
                  className="min-h-[100px] text-right border-2 border-slate-200 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400 bg-white dark:bg-slate-800"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 dark:from-teal-700 dark:to-teal-800 dark:hover:from-teal-800 dark:hover:to-teal-900 text-white font-semibold py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={submittingRequest || !joinRequest.supervisor_email.trim()}
                >
                  {submittingRequest ? (
                    <>
                      <Spinner size="sm" tone="contrast" className="ml-2" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <UserIcon className="w-4 h-4 ml-2" />
                      إرسال طلب الانضمام
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
