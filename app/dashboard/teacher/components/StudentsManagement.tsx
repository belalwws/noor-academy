'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { 
  Users, 
  StickyNote, 
  Plus, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Award,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Edit,
  AlertCircle
} from 'lucide-react'
import { teachersAPI, TeacherStudent } from '@/lib/api/teachers'
import { notesAPI, CreatePrivateNoteData } from '@/lib/api/notes'

interface StudentsManagementProps {
  className?: string
}

interface NoteFormData {
  title: string
  content: string
  note_type: 'performance' | 'behavior' | 'progress' | 'reminder' | 'general'
  is_important: boolean
}

const StudentsManagement: React.FC<StudentsManagementProps> = ({ className }) => {
  const [students, setStudents] = useState<TeacherStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(null)
  const [noteForm, setNoteForm] = useState<NoteFormData>({
    title: '',
    content: '',
    note_type: 'general',
    is_important: false
  })
  const [submittingNote, setSubmittingNote] = useState(false)

  // Load students data
  const loadStudents = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading students with courseId:', selectedCourse)
      const studentsData = await teachersAPI.getStudents(selectedCourse === 'all' ? undefined : selectedCourse || undefined)
      console.log('✅ Students loaded successfully:', studentsData)
      console.log('📊 Number of students:', studentsData?.length || 0)
      setStudents(studentsData)
    } catch (error) {
      console.error('❌ Error loading students:', error)
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      })
      
      // Show more specific error messages
      if (error.status === 401) {
        toast.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى')
      } else if (error.status === 403) {
        toast.error('ليس لديك صلاحية للوصول إلى قائمة الطلاب')
      } else if (error.status === 404) {
        toast.error('لم يتم العثور على قائمة الطلاب')
      } else {
        toast.error('حدث خطأ أثناء تحميل قائمة الطلاب')
      }
      
      // Set empty array on error to show empty state
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [selectedCourse])

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.student.user.get_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get unique courses for filter
  const uniqueCourses = Array.from(
    new Set(students.map(s => s.course.id))
  ).map(courseId => {
    const course = students.find(s => s.course.id === courseId)?.course
    return course
  }).filter(Boolean)

  // Handle note submission
  const handleNoteSubmit = async () => {
    console.log('🔄 Starting note submission...')
    console.log('📝 Note form data:', noteForm)
    console.log('👤 Selected student:', selectedStudent)
    
    if (!selectedStudent || !noteForm.title.trim() || !noteForm.content.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      console.log('❌ Validation failed:', {
        hasStudent: !!selectedStudent,
        hasTitle: !!noteForm.title.trim(),
        hasContent: !!noteForm.content.trim()
      })
      return
    }

    try {
      setSubmittingNote(true)
      
      const noteData: CreatePrivateNoteData = {
        course: selectedStudent.course.id,
        student: selectedStudent.student.id,
        title: noteForm.title,
        content: noteForm.content,
        note_type: noteForm.note_type,
        is_important: noteForm.is_important
      }

      console.log('📤 Sending note data to API:', noteData)
      await notesAPI.createPrivateNote(noteData)
      console.log('✅ Note created successfully')
      
      toast.success('تم إضافة الملحوظة بنجاح')
      setNoteModalOpen(false)
      setNoteForm({
        title: '',
        content: '',
        note_type: 'general',
        is_important: false
      })
      setSelectedStudent(null)
      
    } catch (error: any) {
      console.error('❌ Error creating note:', error)
      console.error('❌ Error response:', error.response)
      console.error('❌ Error data:', error.data)
      console.error('❌ Error status:', error.status)
      // رسائل خطأ أكثر دقة بناءً على رد الخادم
      const details = error?.data || {}
      const serverMessage =
        details?.detail ||
        (Array.isArray(details?.non_field_errors) && details.non_field_errors[0]) ||
        (Array.isArray(details?.course) && details.course[0]) ||
        (Array.isArray(details?.student) && details.student[0]) ||
        (Array.isArray(details?.note_type) && details.note_type[0]) ||
        undefined
      
      if (error?.status === 400) {
        // حالات معروفة من الـ validator في السيرفر
        if (serverMessage?.toString().includes('Only the course teacher')) {
          toast.error('لا يمكنك إضافة ملحوظة لهذه الدورة لأنك لست المعلم المسؤول عنها')
        } else if (serverMessage?.toString().includes('Student must be enrolled')) {
          toast.error('لا يمكن إضافة ملحوظة إلا للطلاب المقبولين في هذا الكورس')
        } else {
          toast.error(serverMessage || 'بيانات غير صالحة للملحوظة')
        }
      } else if (error?.status === 401) {
        toast.error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى')
      } else if (error?.status === 403) {
        toast.error('لا تملك صلاحية لإضافة الملحوظات')
      } else {
        toast.error('حدث خطأ أثناء إضافة الملحوظة')
      }
    } finally {
      setSubmittingNote(false)
      console.log('🏁 Note submission finished')
    }
  }

  // Open note modal for specific student
  const openNoteModal = (student: TeacherStudent) => {
    console.log('🔄 Opening note modal for student:', student)
    console.log('📊 Student status:', student.status)
    
    // لا نسمح إلا للطلاب المقبولين وفق تحقق السيرفر
    if ((student.status || '').toLowerCase() !== 'approved') {
      toast.error('يمكنك إضافة ملحوظة للطلاب المقبولين فقط')
      console.log('❌ Student not approved, status:', student.status)
      return
    }
    console.log('✅ Student approved, opening modal')
    setSelectedStudent(student)
    setNoteModalOpen(true)
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Get note type display
  const getNoteTypeDisplay = (type: string) => {
    const types = {
      performance: { label: 'أداء', icon: '📊' },
      behavior: { label: 'سلوك', icon: '👤' },
      progress: { label: 'تقدم', icon: '📈' },
      reminder: { label: 'تذكير', icon: '⏰' },
      general: { label: 'عام', icon: '📝' }
    }
    return types[type as keyof typeof types] || types.general
  }

  const handleViewStudentPerformance = (studentEnrollment: TeacherStudent) => {
    // TODO: Implement view student performance logic
    toast.info('سيتم إضافة عرض الأداء قريباً')
  }

  return (
    <div className={`space-y-6 md:space-y-8 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex-1 min-w-0">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-2"
          >
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl shadow-lg"
            >
              <Users className="w-6 h-6 md:w-7 md:h-7 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <span>إدارة الطلاب</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-sm md:text-base"
          >
            إدارة طلابك ومتابعة تقدمهم وإضافة الملحوظات الخاصة
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={loadStudents} 
            variant="outline" 
            size="sm"
            disabled={loading}
            className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            {loading ? (
              <Spinner size="sm" tone="brand" className="mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            تحديث
          </Button>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-800/90 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 md:w-5 md:h-5 z-10" />
                  <Input
                    placeholder="البحث في الطلاب أو الكورسات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 md:pl-12 pr-3 md:pr-4 h-10 md:h-12 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-800 text-sm md:text-base"
                  />
                </div>
              </div>
              <div className="sm:w-64">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="h-10 md:h-12 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <SelectValue placeholder="تصفية حسب الكورس" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الكورسات</SelectItem>
                    {uniqueCourses.map((course) => (
                      <SelectItem key={course?.id} value={course?.id || 'unknown'}>
                        {course?.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Students List */}
      {loading ? (
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                      <Skeleton className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                  <Skeleton className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                  <Skeleton className="h-8 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <Skeleton className="h-8 flex-1 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800/90 backdrop-blur-sm">
            <CardContent className="text-center py-12 md:py-16 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-900/10 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg border border-blue-200/50 dark:border-blue-700/50"
              >
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Users className="w-8 h-8 md:w-10 md:h-10 text-blue-400 dark:text-blue-500" />
                </motion.div>
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                {searchTerm || selectedCourse ? 'لا توجد نتائج' : 'لا يوجد طلاب'}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-slate-500 dark:text-slate-400 text-sm md:text-base"
              >
                {searchTerm || selectedCourse 
                  ? 'جرب تغيير معايير البحث أو التصفية'
                  : 'لم يتم تسجيل أي طلاب في كورساتك بعد'
                }
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredStudents.map((studentEnrollment, index) => (
            <motion.div
              key={studentEnrollment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-l-blue-500 dark:border-l-blue-600 bg-white dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage 
                      src={studentEnrollment.student.profile_image_thumbnail || studentEnrollment.student.profile_image} 
                      alt={studentEnrollment.student.user.get_full_name}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {studentEnrollment.student.user.first_name?.[0]}{studentEnrollment.student.user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {studentEnrollment.student.user.get_full_name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {studentEnrollment.student.user.email}
                    </p>
                  </div>
                  {/* Status Indicator */}
                  <div className={`w-3 h-3 rounded-full ${
                    studentEnrollment.status === 'approved' ? 'bg-blue-500' :
                    studentEnrollment.status === 'pending' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Course Info */}
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-700">
                    {studentEnrollment.course.title}
                  </span>
                </div>

                {/* Enrollment Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    تاريخ التسجيل: {new Date(studentEnrollment.enrollment_date).toLocaleDateString('ar-SA')}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(studentEnrollment.status)} text-xs font-medium`}>
                      {studentEnrollment.status === 'approved' && '✅ مقبول'}
                      {studentEnrollment.status === 'pending' && '⏳ قيد المراجعة'}
                      {studentEnrollment.status === 'rejected' && '❌ مرفوض'}
                    </Badge>
                    {studentEnrollment.status === 'approved' && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Award className="w-3 h-3" />
                        <span>نشط</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewStudentPerformance(studentEnrollment)}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    الأداء
                  </Button>
                  
                  <Button
                    size="sm"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={() => openNoteModal(studentEnrollment)}
                    disabled={(studentEnrollment.status || '').toLowerCase() !== 'approved'}
                    title={(studentEnrollment.status || '').toLowerCase() !== 'approved' 
                      ? 'يمكن إضافة الملحوظة بعد اعتماد تسجيل الطالب'
                      : 'إضافة ملحوظة'}
                  >
                    <StickyNote className="w-4 h-4 mr-2" />
                    ملحوظة
                  </Button>
                </div>
              </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add Note Modal */}
      <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-purple-600" />
              إضافة ملحوظة خاصة
            </DialogTitle>
            <DialogDescription>
              {selectedStudent && (
                <>
                  إضافة ملحوظة خاصة للطالب <strong>{selectedStudent.student.user.get_full_name}</strong> 
                  في كورس <strong>{selectedStudent.course.title}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Note Type */}
            <div>
              <Label htmlFor="note_type">نوع الملحوظة</Label>
              <Select 
                value={noteForm.note_type} 
                onValueChange={(value: any) => setNoteForm(prev => ({ ...prev, note_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">📊 أداء الطالب</SelectItem>
                  <SelectItem value="behavior">📝ملحوظة مذاكرة </SelectItem>
                  <SelectItem value="reminder">⏰ تذكير للطالب</SelectItem>
                  <SelectItem value="general">📝 ملحوظة عامة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">عنوان الملحوظة *</Label>
              <Input
                id="title"
                placeholder="مثال: تحسن ملحوظ في الحفظ"
                value={noteForm.title}
                onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">محتوى الملحوظة *</Label>
              <Textarea
                id="content"
                placeholder="اكتب تفاصيل الملحوظة هنا..."
                rows={4}
                value={noteForm.content}
                onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>

            {/* Important Flag */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_important"
                checked={noteForm.is_important}
                onChange={(e) => setNoteForm(prev => ({ ...prev, is_important: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_important" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                ملحوظة مهمة
              </Label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setNoteModalOpen(false)}
                disabled={submittingNote}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleNoteSubmit}
                disabled={submittingNote || !noteForm.title.trim() || !noteForm.content.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {submittingNote ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة الملحوظة
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StudentsManagement
