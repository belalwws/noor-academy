'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { liveEducationApi } from '@/lib/api/live-education'
import { batchStudentsApi } from '@/lib/api/batches'
import type { PendingStudentInfo } from '@/lib/types/live-education'
import type { BatchStudent } from '@/lib/api/batches'
import { 
  UserPlus, 
  RefreshCw,
  Mail,
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

interface PendingStudentsProps {
  courseId: string
  batchId: string
  existingStudents?: BatchStudent[]
  onStudentAdded?: () => void
}

export default function PendingStudents({ courseId, batchId, existingStudents = [], onStudentAdded }: PendingStudentsProps) {
  const [students, setStudents] = useState<PendingStudentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<string | null>(null)
  const [addedStudents, setAddedStudents] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadPendingStudents()
  }, [courseId])

  const loadPendingStudents = async () => {
    try {
      setLoading(true)
      console.log('📤 Loading pending students for course:', courseId)
      
      const data = await liveEducationApi.enrollments.getPendingStudents({ course: courseId })
      const studentsList = Array.isArray(data) ? data : (data.results || data.data || [])
      console.log('👥 Pending students loaded:', studentsList.length)
      setStudents(studentsList)
    } catch (error) {
      console.error('❌ Error loading pending students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToBatch = async (studentId: string | number) => {
    try {
      // Ensure studentId is a string
      const studentIdStr = String(studentId)
      setAdding(studentIdStr)
      console.log('📤 Adding student to batch:', { batchId, studentId: studentIdStr, originalType: typeof studentId })
      
      const requestData = {
        batch: String(batchId),
        student: studentIdStr
      }
      console.log('📤 Request data:', requestData)
      
      await batchStudentsApi.create(requestData)
      
      toast.success('تم إضافة الطالب إلى المجموعة بنجاح')
      
      // Mark student as added immediately
      setAddedStudents(prev => new Set(prev).add(studentIdStr))
      
      // Notify parent and reload after a short delay
      setTimeout(() => {
        onStudentAdded?.()
        loadPendingStudents()
      }, 500)
    } catch (error: any) {
      console.error('❌ Error adding student to batch:', error)
      
      // Extract error message
      const errorMessage = error?.data?.detail || error?.message || 'حدث خطأ في إضافة الطالب'
      
      toast.error(errorMessage, {
        duration: 5000,
        description: 'قد يكون الطالب ليس لديه enrollment صحيح أو نوع التعلم لا يطابق نوع المجموعة'
      })
    } finally {
      setAdding(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  // Create a Set of existing student IDs in the batch
  const existingStudentIds = new Set(
    existingStudents.map(s => 
      typeof s.student === 'string' ? s.student : s.student?.toString()
    )
  )

  // Filter out students that:
  // 1. Have been added in this session (addedStudents)
  // 2. Already exist in the batch (existingStudentIds)
  const displayedStudents = students.filter(s => {
    const isAlreadyAdded = addedStudents.has(s.student_id)
    const isInBatch = existingStudentIds.has(s.student_id) || existingStudentIds.has(s.student_id.toString())
    return !isAlreadyAdded && !isInBatch
  })

  if (displayedStudents.length === 0 && !loading) {
    return (
      <Card className="p-6 text-center bg-gray-50">
        <AlertCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-600">لا يوجد طلاب معلقين</p>
        <p className="text-xs text-gray-500 mt-1">
          جميع الطلاب الذين دفعوا تم تعيينهم في مجموعات
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-orange-500" />
        <p className="text-sm font-medium text-gray-700">
          طلاب معلقين ({displayedStudents.length})
        </p>
      </div>
      
      {displayedStudents.map((student, index) => (
        <motion.div
          key={student.student_id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="hover:shadow-sm transition-shadow bg-orange-50 border-orange-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm text-gray-900 truncate">
                    {student.student_name}
                  </h5>
                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{student.student_email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-orange-100 text-orange-800 text-xs border-orange-300">
                      {student.learning_type_display}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(student.enrolled_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleAddToBatch(student.student_id)}
                  disabled={adding !== null}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding === student.student_id ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3 mr-1" />
                      إضافة
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

