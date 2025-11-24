'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { batchStudentsApi } from '@/lib/api/batches'
import type { BatchStudent } from '@/lib/api/batches'
import PendingStudents from './PendingStudents'
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Ban, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Mail,
  Calendar,
  Eye
} from 'lucide-react'
import { motion } from 'framer-motion'

interface BatchStudentsManagerProps {
  batchId: string
  courseId?: string
  onStudentsUpdate?: () => void
}

export default function BatchStudentsManager({ batchId, courseId, onStudentsUpdate }: BatchStudentsManagerProps) {
  const [students, setStudents] = useState<BatchStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<BatchStudent | null>(null)
  const [showProfileDialog, setShowProfileDialog] = useState(false)

  useEffect(() => {
    loadStudents()
  }, [batchId])

  const loadStudents = async () => {
    try {
      setLoading(true)
      console.log('📤 Loading students for batch:', batchId)
      
      const data = await batchStudentsApi.list({
        batch: batchId,
        ordering: '-created_at'
      })
      
      const studentsList = data?.results || []
      console.log('👥 Students loaded:', studentsList.length)
      setStudents(studentsList)
    } catch (error) {
      console.error('❌ Error loading students:', error)
      toast.error('حدث خطأ في تحميل الطلاب')
    } finally {
      setLoading(false)
    }
  }


  const handleActivate = async (studentId: string) => {
    try {
      setActionLoading(studentId)
      await batchStudentsApi.activate(studentId)
      toast.success('تم تنشيط الطالب بنجاح')
      loadStudents()
      onStudentsUpdate?.()
    } catch (error: any) {
      console.error('Error activating student:', error)
      const errorMessage = error?.data?.detail || error?.message || 'حدث خطأ في تنشيط الطالب'
      toast.error(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspend = async (studentId: string) => {
    try {
      setActionLoading(studentId)
      await batchStudentsApi.suspend(studentId)
      toast.success('تم إيقاف الطالب مؤقتاً')
      loadStudents()
      onStudentsUpdate?.()
    } catch (error: any) {
      console.error('Error suspending student:', error)
      const errorMessage = error?.data?.detail || error?.message || 'حدث خطأ في إيقاف الطالب'
      toast.error(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handleComplete = async (studentId: string) => {
    try {
      setActionLoading(studentId)
      await batchStudentsApi.complete(studentId)
      toast.success('تم وضع علامة الإكمال للطالب')
      loadStudents()
      onStudentsUpdate?.()
    } catch (error: any) {
      console.error('Error completing student:', error)
      const errorMessage = error?.data?.detail || error?.message || 'حدث خطأ في تحديث حالة الطالب'
      toast.error(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handleWithdraw = async (studentId: string) => {
    try {
      setActionLoading(studentId)
      await batchStudentsApi.withdraw(studentId)
      toast.success('تم انسحاب الطالب من المجموعة')
      loadStudents()
      onStudentsUpdate?.()
    } catch (error: any) {
      console.error('Error withdrawing student:', error)
      const errorMessage = error?.data?.detail || error?.message || 'حدث خطأ في انسحاب الطالب'
      toast.error(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        label: 'نشط',
        className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
        icon: UserCheck
      },
      suspended: {
        label: 'موقوف',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
        icon: Ban
      },
      completed: {
        label: 'مكتمل',
        className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
        icon: CheckCircle
      },
      withdrawn: {
        label: 'منسحب',
        className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
        icon: XCircle
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">{status}</Badge>

    const Icon = config.icon

    return (
      <Badge className={`${config.className} flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 h-5`}>
        <Icon className="w-2.5 h-2.5" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          الطلاب ({students.length})
        </h3>
      </div>

      {/* Pending Students */}
      {courseId && (
        <div className="mb-4">
          <PendingStudents 
            courseId={courseId} 
            batchId={batchId}
            existingStudents={students}
            onStudentAdded={() => {
              loadStudents()
              onStudentsUpdate?.()
            }}
          />
        </div>
      )}

      {/* Students List */}
      {students.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h4 className="text-md font-semibold text-gray-700 mb-1">لا يوجد طلاب</h4>
          <p className="text-sm text-gray-500">ابدأ بإضافة طلاب إلى هذه المجموعة</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {students.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-sm transition-all border-gray-200 dark:border-slate-700">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {student.student_name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    
                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-semibold text-gray-900 dark:text-slate-50 text-sm truncate">
                          {student.student_name || 'طالب'}
                        </h4>
                        {getStatusBadge(student.status)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
                        <span className="truncate flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {student.student_email}
                        </span>
                        <span>•</span>
                        <span className="whitespace-nowrap">
                          {student.created_at && new Date(student.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowProfileDialog(true)
                        }}
                        className="h-7 w-7 p-0 border-gray-300 text-gray-600 hover:bg-gray-50"
                        title="عرض البروفايل"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      
                      {student.status === 'suspended' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleActivate(student.id)}
                          disabled={actionLoading === student.id}
                          className="h-7 w-7 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
                          title="تفعيل"
                        >
                          {actionLoading === student.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserCheck className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                      
                      {student.status === 'active' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSuspend(student.id)}
                            disabled={actionLoading === student.id}
                            className="h-7 w-7 p-0 border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                            title="إيقاف"
                          >
                            {actionLoading === student.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Ban className="w-3 h-3" />
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleComplete(student.id)}
                            disabled={actionLoading === student.id}
                            className="h-7 w-7 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
                            title="إكمال"
                          >
                            {actionLoading === student.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                          </Button>
                        </>
                      )}
                      
                      {(student.status === 'active' || student.status === 'suspended') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWithdraw(student.id)}
                          disabled={actionLoading === student.id}
                          className="h-7 w-7 p-0 border-red-300 text-red-600 hover:bg-red-50"
                          title="سحب"
                        >
                          {actionLoading === student.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Student Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 mt-16 md:mt-20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {selectedStudent?.student_name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <span>{selectedStudent?.student_name || 'طالب'}</span>
            </DialogTitle>
            <DialogDescription>
              معلومات تفصيلية عن الطالب
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4 py-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">الحالة</span>
                {getStatusBadge(selectedStudent.status)}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>البريد الإلكتروني</span>
                </div>
                <p className="text-sm text-gray-900 dark:text-slate-50 bg-gray-50 dark:bg-slate-800 p-2 rounded">
                  {selectedStudent.student_email || 'غير متوفر'}
                </p>
              </div>

              {/* Join Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>تاريخ الانضمام</span>
                </div>
                <p className="text-sm text-gray-900 dark:text-slate-50 bg-gray-50 dark:bg-slate-800 p-2 rounded">
                  {selectedStudent.created_at 
                    ? new Date(selectedStudent.created_at).toLocaleDateString('ar-EG', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'غير متوفر'
                  }
                </p>
              </div>

              {/* Added By */}
              {selectedStudent.added_by_name && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
                    <UserPlus className="w-4 h-4 text-gray-400" />
                    <span>تم الإضافة بواسطة</span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-slate-50 bg-gray-50 dark:bg-slate-800 p-2 rounded">
                    {selectedStudent.added_by_name}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowProfileDialog(false)}
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

