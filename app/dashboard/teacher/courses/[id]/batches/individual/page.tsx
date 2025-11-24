'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { batchesApi } from '@/lib/api/batches'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ArrowLeft, User, Plus, Search, RefreshCw, ExternalLink, Edit, Trash2 } from 'lucide-react'

interface Batch {
  id: string
  course: string
  course_title: string
  name: string
  type: 'individual' | 'group'
  status: 'active' | 'closed'
  max_students: number
  students_count: string | number
  students: Array<{
    id: string
    student: string
    student_name: string
    student_email: string
    status: string
  }>
  created_at: string
}

export default function IndividualBatchesPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params['id'] as string

  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [newBatch, setNewBatch] = useState({
    name: '',
    status: 'active' as 'active' | 'closed'
  })

  useEffect(() => {
    loadBatches()
  }, [courseId])

  const loadBatches = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      console.log('📤 Loading individual batches for course:', courseId)
      const response = await batchesApi.list({
        course: courseId,
        type: 'individual', // Will be sent to backend, with client-side filtering as fallback
        ordering: '-created_at', // Order by creation date (newest first)
        // status is optional - omit it to get all statuses
      })
      
      console.log('📦 Individual batches API Response:', response)
      const batchesList = response?.results || []
      console.log('📊 Total individual batches returned:', batchesList.length)
      console.log('📊 Batches data:', batchesList)
      
      if (batchesList.length === 0) {
        console.warn('⚠️ No individual batches found for course:', courseId)
      }
      
      setBatches(batchesList)
    } catch (error: any) {
      console.error('❌ Error loading individual batches:', error)
      console.error('❌ Error details:', {
        message: error?.message,
        data: error?.data,
        status: error?.status,
      })
      const errorMessage = error?.data?.detail || error?.message || 'حدث خطأ في تحميل المجموعات الفردية'
      toast.error(errorMessage)
      setBatches([])
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const handleCreateBatch = async () => {
    if (!newBatch.name.trim()) {
      toast.error('يرجى إدخال اسم المجموعة')
      return
    }

    try {
      console.log('📤 Creating individual batch with data:', {
        course: courseId,
        name: newBatch.name,
        type: 'individual',
        status: newBatch.status,
        max_students: 1
      })
      
      const createdBatch = await batchesApi.create({
        course: courseId,
        name: newBatch.name,
        type: 'individual',
        status: newBatch.status,
        max_students: 1
      })

      console.log('✅ Batch created successfully:', createdBatch)
      console.log('✅ Created batch ID:', createdBatch.id)
      console.log('✅ Created batch type:', createdBatch.type)
      
      toast.success('تم إنشاء المجموعة الفردية بنجاح', {
        description: `تم إنشاء "${createdBatch.name}" بنجاح`
      })
      
      setShowCreateDialog(false)
      setNewBatch({ name: '', status: 'active' })
      
      // Immediately add the new batch to the list (optimistic update)
      if (createdBatch.type === 'individual') {
        setBatches(prevBatches => [createdBatch, ...prevBatches])
        console.log('✅ Added new batch to local state')
      }
      
      // Also reload from server to ensure we have the latest data
      setTimeout(() => {
        console.log('🔄 Reloading batches from server...')
        loadBatches()
      }, 1000)
    } catch (error: any) {
      console.error('❌ Error creating individual batch:', error)
      console.error('❌ Error details:', {
        message: error?.message,
        data: error?.data,
        status: error?.status,
        response: error?.response
      })
      
      let errorMessage = 'حدث خطأ في إنشاء المجموعة'
      if (error?.data?.detail) {
        errorMessage = error.data.detail
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // Handle field errors
      if (error?.data?.errors) {
        const fieldErrors = Object.entries(error.data.errors)
          .map(([field, messages]: [string, any]) => {
            const fieldName = field === 'course' ? 'الدورة' :
                            field === 'name' ? 'الاسم' :
                            field === 'type' ? 'النوع' :
                            field === 'status' ? 'الحالة' :
                            field === 'max_students' ? 'عدد الطلاب' : field
            return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
          })
          .join('; ')
        errorMessage = `أخطاء التحقق: ${fieldErrors}`
      }
      
      toast.error(errorMessage)
    }
  }

  const handleDeleteBatch = async () => {
    if (!batchToDelete || !batchToDelete.id) {
      toast.error('لم يتم تحديد المجموعة للحذف')
      return
    }

    const batchIdToDelete = batchToDelete.id
    const batchNameToDelete = batchToDelete.name

    try {
      setDeleting(true)
      console.log('🗑️ Deleting batch:', batchIdToDelete)
      
      // Optimistic update: Remove from state immediately
      setBatches(prevBatches => prevBatches.filter(b => b.id !== batchIdToDelete))
      
      // Close dialog immediately for better UX
      setShowDeleteDialog(false)
      setBatchToDelete(null)
      
      // Delete from server
      await batchesApi.delete(batchIdToDelete)
      console.log('✅ Batch deleted successfully')
      
      toast.success(`تم حذف المجموعة "${batchNameToDelete}" بنجاح`)
      
      // Reload batches in background silently (no loading spinner) to ensure consistency
      // This happens in the background without showing loading state
      setTimeout(() => {
        loadBatches(false).catch(err => {
          console.error('❌ Error reloading batches after delete:', err)
          // If reload fails, the optimistic update is still valid
        })
      }, 300)
    } catch (error: any) {
      console.error('❌ Error deleting batch:', error)
      const errorMessage = error?.data?.detail || error?.message || 'حدث خطأ في حذف المجموعة'
      toast.error(errorMessage)
      
      // Revert optimistic update on error - reload batches silently
      loadBatches(false).catch(err => {
        console.error('❌ Error reloading batches after delete error:', err)
      })
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteDialog = (batch: Batch) => {
    setBatchToDelete(batch)
    setShowDeleteDialog(true)
  }

  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">نشط</Badge>
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">مغلق</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20 md:pt-24 lg:pt-28" dir="rtl">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 top-20 md:top-24 lg:top-28">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-blue-300/20 dark:from-blue-900/10 dark:to-blue-800/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-blue-200/20 dark:from-blue-900/10 dark:to-blue-900/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/dashboard/teacher/courses/${courseId}/course-management`)}
                  className="shrink-0 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                    <User className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                    المجموعات الفردية
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                    إدارة المجموعات الفردية للدورة
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء مجموعة فردية
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="بحث عن مجموعة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700"
              />
            </div>
            <Button
              variant="outline"
              onClick={loadBatches}
              disabled={loading}
              className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </motion.div>

          {/* Batches Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : filteredBatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-12 text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg">
                <User className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {searchQuery ? 'لا توجد نتائج' : 'لا توجد مجموعات فردية'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {searchQuery 
                    ? 'جرب البحث بكلمات مختلفة'
                    : 'ابدأ بإنشاء مجموعة فردية جديدة'
                  }
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إنشاء مجموعة فردية
                  </Button>
                )}
              </Card>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBatches.map((batch, idx) => (
                <motion.div
                  key={batch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg text-slate-900 dark:text-white">{batch.name}</CardTitle>
                        {getStatusBadge(batch.status)}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {batch.course_title || 'دورة غير معروفة'}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">عدد الطلاب:</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {batch.students_count || batch.students?.length || 0} / {batch.max_students}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">تاريخ الإنشاء:</span>
                          <span className="text-slate-900 dark:text-white">
                            {new Date(batch.created_at).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                          onClick={() => router.push(`/interface-batch/${batch.id}`)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          فتح
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                          onClick={() => openDeleteDialog(batch)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Delete Batch Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-red-200 dark:border-red-800 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-red-600 dark:text-red-400 text-xl font-bold">
                  تأكيد الحذف
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                  هل أنت متأكد من رغبتك في حذف المجموعة "{batchToDelete?.name}"؟ 
                  <br />
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    لا يمكن التراجع عن هذه العملية.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setBatchToDelete(null)
                  }}
                  disabled={deleting}
                  className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleDeleteBatch}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      حذف
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Batch Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white text-xl font-bold">إنشاء مجموعة فردية جديدة</DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                  أنشئ مجموعة فردية جديدة للدورة (طالب واحد فقط)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-slate-900 dark:text-white font-semibold">اسم المجموعة</Label>
                  <Input
                    placeholder="مثال: مجموعة فردية 1"
                    value={newBatch.name}
                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-900 dark:text-white font-semibold">الحالة</Label>
                  <Select
                    value={newBatch.status}
                    onValueChange={(value: 'active' | 'closed') =>
                      setNewBatch({ ...newBatch, status: value })
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                      <SelectValue className="text-slate-900 dark:text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800">
                      <SelectItem value="active" className="text-slate-900 dark:text-white">نشط</SelectItem>
                      <SelectItem value="closed" className="text-slate-900 dark:text-white">مغلق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleCreateBatch}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  )
}

