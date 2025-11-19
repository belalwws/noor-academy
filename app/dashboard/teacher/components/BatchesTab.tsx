'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { liveEducationApi } from '@/lib/api/live-education'
import type { Batch, CreateBatchInput } from '@/lib/types/live-education'
import { Plus, Users, Calendar, Edit, Trash2, RefreshCw, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  title: string
  approval_status: 'pending' | 'approved' | 'rejected'
}

interface BatchesTabProps {
  refreshKey?: number
}

export default function BatchesTab({ refreshKey = 0 }: BatchesTabProps) {
  const router = useRouter()
  const [batches, setBatches] = useState<Batch[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [newBatch, setNewBatch] = useState<CreateBatchInput>({
    name: '',
    course: '',
    type: 'group',
    status: 'active',
    max_students: 200
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Reload when refreshKey changes
    if (refreshKey > 0) {
      console.log('🔄 Refresh key changed, reloading batches...', refreshKey)
      loadData()
    }
  }, [refreshKey])

  useEffect(() => {
    // Listen for refresh event from parent component
    const handleRefresh = () => {
      console.log('🔄 Refresh event received, reloading batches...')
      loadData()
    }
    
    window.addEventListener('refreshBatches', handleRefresh)
    
    return () => {
      window.removeEventListener('refreshBatches', handleRefresh)
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading batches...')
      
      try {
        const batchesData = await liveEducationApi.batches.list()
        console.log('📦 Batches data:', batchesData)
        
        // Handle paginated response
        if (batchesData && typeof batchesData === 'object') {
          const batchesList = batchesData.results || batchesData.data || (Array.isArray(batchesData) ? batchesData : [])
          console.log('📦 Batches list:', batchesList)
          console.log('📦 Batches count:', batchesList.length)
          setBatches(batchesList)
        } else if (Array.isArray(batchesData)) {
          console.log('📦 Batches is direct array:', batchesData)
          setBatches(batchesData)
        } else {
          console.warn('⚠️ Unexpected batches data format:', batchesData)
          setBatches([])
        }
      } catch (error) {
        console.error('❌ Error loading batches:', error)
        toast.error('حدث خطأ في تحميل المجموعات')
        setBatches([])
      }

      try {
        const coursesData = await liveEducationApi.courses.list()
        // Filter only approved courses
        const coursesList = coursesData?.results || coursesData?.data || (Array.isArray(coursesData) ? coursesData : [])
        const approvedCourses = coursesList.filter(
          (c: Course) => c.approval_status === 'approved'
        )
        setCourses(approvedCourses)
      } catch (error) {
        console.error('❌ Error loading courses:', error)
        setCourses([])
      }
    } catch (error) {
      console.error('❌ Error loading batches:', error)
      toast.error('حدث خطأ في تحميل المجموعات')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBatch = async () => {
    if (!newBatch.name || !newBatch.course) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      const response = await liveEducationApi.batches.create({
        ...newBatch,
        course: selectedCourse,
        type: newBatch.type || 'group',
        max_students: newBatch.type === 'individual' ? 1 : newBatch.max_students || 200
      })

      if (response.ok) {
        toast.success('تم إنشاء المجموعة بنجاح')
        setShowCreateDialog(false)
        setNewBatch({
          name: '',
          course: '',
          type: 'group',
          status: 'active',
          max_students: 200
        })
        setSelectedCourse('')
        loadData()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.message || 'حدث خطأ في إنشاء المجموعة')
      }
    } catch (error) {
      console.error('Error creating batch:', error)
      toast.error('حدث خطأ في إنشاء المجموعة')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">نشط</Badge>
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">مغلق</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'individual':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">فردي</Badge>
      case 'group':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">جماعي</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{type === 'group' ? 'جماعي' : type === 'individual' ? 'فردي' : type}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">المجموعات</h2>
          <p className="text-gray-600 mt-1">إدارة مجموعات الطلاب في الدورات</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          إنشاء مجموعة جديدة
        </Button>
      </div>

      {/* Batches Grid */}
      {batches.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
          <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">لا توجد مجموعات</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">ابدأ بإنشاء مجموعة جديدة لدورتك</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{batch.name}</CardTitle>
                    {getStatusBadge(batch.status)}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeBadge(batch.type || batch.batch_type || 'group')}
                  </div>
                  <p className="text-sm text-gray-600">{batch.course_title || 'دورة غير معروفة'}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">عدد الطلاب:</span>
                      <span className="font-semibold">
                        {batch.students_count || batch.current_students || 0} / {batch.max_students}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">تاريخ الإنشاء:</span>
                      <span className="text-gray-900">
                        {new Date(batch.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/interface-batch/${batch.id}`)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      فتح الواجهة
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      تعديل
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4 mr-2" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Batch Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white !bg-white dark:bg-slate-900 !dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
          <DialogHeader className="bg-white !bg-white dark:bg-slate-900 !dark:bg-slate-900">
            <DialogTitle className="text-gray-900 dark:text-white">إنشاء مجموعة جديدة</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              اختر الدورة وأنشئ مجموعة جديدة للطلاب
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 bg-white !bg-white dark:bg-slate-900 !dark:bg-slate-900">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white font-semibold">الدورة</Label>
              <Select value={selectedCourse} onValueChange={(value) => {
                setSelectedCourse(value)
                setNewBatch({ ...newBatch, course: value })
              }}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
                  <SelectValue placeholder="اختر الدورة" className="text-gray-900 dark:text-white" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800">
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id} className="text-gray-900 dark:text-white">
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white font-semibold">اسم المجموعة</Label>
              <Input
                placeholder="مثال: المجموعة الأولى"
                value={newBatch.name}
                onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white font-semibold">نوع المجموعة</Label>
              <Select
                value={newBatch.type || 'group'}
                onValueChange={(value: 'individual' | 'group') => {
                  setNewBatch({
                    ...newBatch,
                    type: value,
                    max_students: value === 'individual' ? 1 : 200
                  })
                }}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
                  <SelectValue className="text-gray-900 dark:text-white" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800">
                  <SelectItem value="individual" className="text-gray-900 dark:text-white">فردي (طالب واحد)</SelectItem>
                  <SelectItem value="group" className="text-gray-900 dark:text-white">مجموعة (حتى 200 طالب)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newBatch.type !== 'individual' && (
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white font-semibold">الحد الأقصى للطلاب</Label>
                <Input
                  type="number"
                  min="1"
                  max="200"
                  value={newBatch.max_students || 200}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, max_students: parseInt(e.target.value) || 200 })
                  }
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white font-semibold">الحالة</Label>
              <Select
                value={newBatch.status || 'active'}
                onValueChange={(value: 'active' | 'closed') =>
                  setNewBatch({ ...newBatch, status: value })
                }
              >
                <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
                  <SelectValue className="text-gray-900 dark:text-white" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800">
                  <SelectItem value="active" className="text-gray-900 dark:text-white">نشط</SelectItem>
                  <SelectItem value="closed" className="text-gray-900 dark:text-white">مغلق</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="bg-white !bg-white dark:bg-slate-900 !dark:bg-slate-900 pt-4 border-t border-gray-200 dark:border-slate-700">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              className="border-gray-300 dark:border-slate-600"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleCreateBatch}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              إنشاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

