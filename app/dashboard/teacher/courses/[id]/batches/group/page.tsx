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
import { ArrowLeft, Users, Plus, Search, RefreshCw, ExternalLink, Trash2 } from 'lucide-react'

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

export default function GroupBatchesPage() {
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
    status: 'active' as 'active' | 'closed',
    max_students: 200
  })
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    setIsInitialLoad(true)
    loadBatches().finally(() => setIsInitialLoad(false))
  }, [courseId])

  const loadBatches = async () => {
    try {
      setLoading(true)
      console.log('📤 Loading group batches for course:', courseId)
      console.log('📤 Course ID type:', typeof courseId)
      console.log('📤 Course ID value:', courseId)
      
      const response = await batchesApi.list({
        course: courseId,
        type: 'group', // Will be sent to backend, with client-side filtering as fallback
        ordering: '-created_at', // Order by creation date (newest first)
        // status is optional - omit it to get all statuses
      })
      
      console.log('📦 Group batches API Response:', response)
      console.log('📦 Response type:', typeof response)
      console.log('📦 Response keys:', response ? Object.keys(response) : 'No response')
      console.log('📦 Response count:', response?.count)
      console.log('📦 Response results type:', typeof response?.results)
      console.log('📦 Response results length:', response?.results?.length)
      
      const batchesList = response?.results || []
      console.log('📊 Total batches returned (before filter):', batchesList.length)
      console.log('📊 All batches data:', JSON.stringify(batchesList, null, 2))
      
      // Log each batch details
      batchesList.forEach((batch: any, index: number) => {
        console.log(`📋 Batch ${index + 1}:`, {
          id: batch.id,
          name: batch.name,
          type: batch.type,
          course: batch.course,
          status: batch.status,
          max_students: batch.max_students,
        })
      })
      
      // Filter by type if needed (should already be filtered in batchesApi.list)
      const groupBatches = batchesList.filter((batch: any) => {
        const isGroup = batch.type === 'group'
        if (!isGroup) {
          console.log(`⚠️ Batch "${batch.name}" is not a group batch (type: ${batch.type})`)
        }
        return isGroup
      })
      
      console.log('📊 Total group batches (after filter):', groupBatches.length)
      console.log('📊 Group batches data:', JSON.stringify(groupBatches, null, 2))
      
      if (groupBatches.length === 0) {
        console.warn('⚠️ No group batches found for course:', courseId)
        console.warn('⚠️ This could mean:')
        console.warn('  1. No batches exist for this course')
        console.warn('  2. All batches are of type "individual"')
        console.warn('  3. There is a backend issue with saving/retrieving batches')
        console.warn('  4. The course ID might be incorrect')
        console.warn('  5. The course does not belong to the current teacher')
        
        // Don't overwrite existing batches if this is a reload after creation
        // Only set empty array if this is the initial load
        if (!isInitialLoad && batches.length > 0) {
          console.warn(`⚠️ Keeping ${batches.length} existing batch(es) in state (backend returned empty - likely a permission/ownership issue)`)
          console.warn(`⚠️ This suggests the course may not belong to the current teacher, or there's a backend filtering issue`)
          // Don't update state - keep existing batches from optimistic update
          return
        }
      } else {
        console.log('✅ Found', groupBatches.length, 'group batch(es)')
      }
      
      setBatches(groupBatches)
    } catch (error: any) {
      console.error('❌ Error loading group batches:', error)
      console.error('❌ Error details:', {
        message: error?.message,
        data: error?.data,
        status: error?.status,
        stack: error?.stack,
      })
      const errorMessage = error?.data?.detail || error?.message || 'حدث خطأ في تحميل المجموعات الجماعية'
      toast.error(errorMessage)
      setBatches([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBatch = async () => {
    if (!newBatch.name.trim()) {
      toast.error('يرجى إدخال اسم المجموعة')
      return
    }

    if (newBatch.max_students < 1 || newBatch.max_students > 200) {
      toast.error('عدد الطلاب يجب أن يكون بين 1 و 200')
      return
    }

    try {
      console.log('📤 Creating group batch with data:', {
        course: courseId,
        name: newBatch.name,
        type: 'group',
        status: newBatch.status,
        max_students: newBatch.max_students
      })
      
      const createdBatch = await batchesApi.create({
        course: courseId,
        name: newBatch.name,
        type: 'group',
        status: newBatch.status,
        max_students: newBatch.max_students
      })

      console.log('✅ Batch created successfully:', createdBatch)
      console.log('✅ Created batch ID:', createdBatch.id)
      console.log('✅ Created batch type:', createdBatch.type)
      console.log('✅ Full created batch object:', JSON.stringify(createdBatch, null, 2))
      
      toast.success('تم إنشاء المجموعة الجماعية بنجاح', {
        description: `تم إنشاء "${createdBatch.name}" بنجاح`
      })
      
      setShowCreateDialog(false)
      setNewBatch({ name: '', status: 'active', max_students: 200 })
      
      // Don't do optimistic update if we don't have an ID - wait for server reload
      if (createdBatch.id && createdBatch.type === 'group') {
        console.log('✅ Adding batch to local state (optimistic update)')
        setBatches(prevBatches => {
          // Check if batch already exists (avoid duplicates)
          const exists = prevBatches.some(b => b.id === createdBatch.id)
          if (exists) {
            console.log('⚠️ Batch already exists in state, skipping optimistic update')
            return prevBatches
          }
          return [createdBatch, ...prevBatches]
        })
      } else {
        console.warn('⚠️ No ID in created batch, skipping optimistic update')
      }
      
      // Always reload from server to get the complete data with ID
      // Use multiple retries with increasing delays to handle backend delay
      console.log('🔄 Scheduling batch reload from server...')
      
      // Immediate reload after 300ms
      setTimeout(() => {
        console.log('🔄 Reload attempt 1 (300ms delay)...')
        loadBatches()
      }, 300)
      
      // Second reload after 1 second (in case backend is slow)
      setTimeout(() => {
        console.log('🔄 Reload attempt 2 (1s delay)...')
        loadBatches()
      }, 1000)
      
      // Third reload after 2 seconds (final attempt)
      setTimeout(() => {
        console.log('🔄 Reload attempt 3 (2s delay)...')
        loadBatches()
      }, 2000)
    } catch (error: any) {
      console.error('❌ Error creating group batch:', error)
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
            className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-purple-300/20 dark:from-purple-900/10 dark:to-purple-800/10 rounded-full blur-3xl"
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
                  size="sm"
                  onClick={() => router.push(`/dashboard/teacher/courses/${courseId}/course-management`)}
                  className="shrink-0 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 dark:from-purple-400 dark:via-purple-500 dark:to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                    <Users className="w-8 h-8 text-purple-600 dark:text-purple-500" />
                    المجموعات الجماعية
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                    إدارة المجموعات الجماعية للدورة (حتى 200 طالب)
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => {
                    console.log('🔄 Opening create batch dialog')
                    console.log('📋 Current course ID:', courseId)
                    setShowCreateDialog(true)
                  }}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء مجموعة جماعية
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
                <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {searchQuery ? 'لا توجد نتائج' : 'لا توجد مجموعات جماعية'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {searchQuery 
                    ? 'جرب البحث بكلمات مختلفة'
                    : 'ابدأ بإنشاء مجموعة جماعية جديدة'
                  }
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إنشاء مجموعة جماعية
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
          <Dialog 
            open={showCreateDialog} 
            onOpenChange={(open) => {
              console.log('🔄 Dialog state changed:', open)
              setShowCreateDialog(open)
            }}
          >
            <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white text-xl font-bold">إنشاء مجموعة جماعية جديدة</DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                  أنشئ مجموعة جماعية جديدة للدورة (حتى 200 طالب)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-slate-900 dark:text-white font-semibold">اسم المجموعة</Label>
                  <Input
                    placeholder="مثال: المجموعة الأولى"
                    value={newBatch.name}
                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-900 dark:text-white font-semibold">الحد الأقصى للطلاب</Label>
                  <Input
                    type="number"
                    min="1"
                    max="200"
                    value={newBatch.max_students}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, max_students: parseInt(e.target.value) || 200 })
                    }
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    يمكن أن تحتوي المجموعة على حتى 200 طالب
                  </p>
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
                  onClick={() => {
                    console.log('🚫 Cancel button clicked - closing dialog')
                    setShowCreateDialog(false)
                  }}
                  className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={(e) => {
                    console.log('🖱️ Create button clicked!')
                    console.log('📋 Current batch data:', newBatch)
                    console.log('📋 Course ID:', courseId)
                    e.preventDefault()
                    handleCreateBatch()
                  }}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl"
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

