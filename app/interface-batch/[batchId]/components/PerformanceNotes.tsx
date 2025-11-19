'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Plus, 
  FileText, 
  Star, 
  Paperclip, 
  Download, 
  Trash2,
  User,
  Calendar,
  BookOpen
} from 'lucide-react'
import { 
  performanceNotesAPI, 
  type PerformanceNote, 
  type PerformanceNoteListItem,
  type CreatePerformanceNoteData 
} from '@/lib/api/notes'
import { batchStudentsApi, type BatchStudent } from '@/lib/api/batches'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface PerformanceNotesProps {
  batchId: string
  userRole: 'teacher' | 'student'
  currentUserId: string | number
  onUnreadCountChange?: (count: number) => void
}

export default function PerformanceNotes({ batchId, userRole, currentUserId, onUnreadCountChange }: PerformanceNotesProps) {
  const [notes, setNotes] = useState<PerformanceNoteListItem[]>([])
  const [selectedNote, setSelectedNote] = useState<PerformanceNote | null>(null)
  const [students, setStudents] = useState<BatchStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [viewedNotes, setViewedNotes] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_important: false
  })

  // Load notes and students
  useEffect(() => {
    if (batchId) {
      loadNotes()
      if (userRole === 'teacher') {
        loadStudents()
      }
    }
  }, [batchId, userRole])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const params: any = { batch_id: batchId }
      
      // Note: For students, we don't send student_id because the backend
      // automatically filters by user.student_profile in the viewset
      // Sending user.id would cause a mismatch (user.id vs student_profile.id)
      
      console.log('📋 Loading performance notes with params:', params)
      const response = await performanceNotesAPI.list(params)
      console.log('📊 Performance notes response:', response)
      console.log('✅ Setting notes to state:', response.results || [])
      setNotes(response.results || [])
      
      // Calculate unread count for students
      if (userRole === 'student' && onUnreadCountChange) {
        const storedViewed = localStorage.getItem(`viewed_performance_notes_${batchId}`)
        const viewed = storedViewed ? new Set<string>(JSON.parse(storedViewed)) : new Set<string>()
        setViewedNotes(viewed)
        
        const unreadCount = (response.results || []).filter((note: PerformanceNoteListItem) => !viewed.has(note.id)).length
        onUnreadCountChange(unreadCount)
      }
    } catch (error) {
      console.error('Error loading performance notes:', error)
      toast.error('فشل تحميل الملاحظات')
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await batchStudentsApi.list({ batch: batchId })
      const studentsList = response.results || []
      setStudents(studentsList.filter((s: BatchStudent) => s.status === 'active'))
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const handleCreateNote = async () => {
    if (!formData.title || !formData.content || !selectedStudent) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      setCreating(true)
      
      const createData: CreatePerformanceNoteData = {
        batch: batchId,
        student: selectedStudent,
        title: formData.title,
        content: formData.content,
        is_important: formData.is_important,
        attachment_file: attachmentFile || undefined
      }

      await performanceNotesAPI.create(createData)
      
      toast.success('✅ تم إضافة الملاحظة بنجاح')
      setShowCreateDialog(false)
      resetForm()
      loadNotes()
    } catch (error) {
      console.error('Error creating note:', error)
      toast.error('فشل إضافة الملاحظة')
    } finally {
      setCreating(false)
    }
  }

  const handleViewDetails = async (noteId: string) => {
    try {
      const note = await performanceNotesAPI.get(noteId)
      setSelectedNote(note)
      setShowDetailsDialog(true)
      
      // Mark as viewed for students
      if (userRole === 'student') {
        const viewed = new Set(viewedNotes)
        viewed.add(noteId)
        setViewedNotes(viewed)
        localStorage.setItem(`viewed_performance_notes_${batchId}`, JSON.stringify([...viewed]))
        
        // Update unread count
        if (onUnreadCountChange) {
          const unreadCount = notes.filter((n) => !viewed.has(n.id)).length
          onUnreadCountChange(unreadCount)
        }
      }
    } catch (error) {
      console.error('Error loading note details:', error)
      toast.error('فشل تحميل تفاصيل الملاحظة')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
      return
    }

    try {
      await performanceNotesAPI.delete(noteId)
      toast.success('تم حذف الملاحظة بنجاح')
      loadNotes()
      setShowDetailsDialog(false)
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('فشل حذف الملاحظة')
    }
  }

  const resetForm = () => {
    setFormData({ title: '', content: '', is_important: false })
    setSelectedStudent('')
    setAttachmentFile(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type (image or PDF only)
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        toast.error('يُسمح فقط بالصور وملفات PDF')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الملف يجب أن يكون أقل من 5 ميجابايت')
        return
      }
      
      setAttachmentFile(file)
      toast.success(`تم اختيار الملف: ${file.name}`)
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            ملاحظات الأداء
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            ملاحظات خاصة بين المعلم والطالب
          </p>
        </div>
        
        {userRole === 'teacher' && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-auto">
                <Plus className="w-4 h-4 ml-2" />
                إضافة ملاحظة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[calc(100vh-120px)] overflow-y-auto bg-white dark:bg-slate-900 mt-8 md:mt-12" dir="rtl">
              <DialogHeader className="pb-2">
                <DialogTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  إضافة ملاحظة أداء جديدة
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  أضف ملاحظة خاصة لأحد الطلاب في هذه المجموعة
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                {/* Select Student */}
                <div className="space-y-1.5">
                  <Label htmlFor="student" className="text-slate-900 dark:text-slate-100 text-xs font-medium">
                    الطالب <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 h-9 text-sm">
                      <SelectValue placeholder="اختر الطالب" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                      {students.map((student) => (
                        <SelectItem 
                          key={student.id} 
                          value={String(student.student)}
                          className="hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          {student.student_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-slate-900 dark:text-slate-100 text-xs font-medium">
                    عنوان الملاحظة <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="مثال: تحسن ملحوظ في القراءة"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    maxLength={200}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 h-9 text-sm text-right"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{formData.title.length}/200</p>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <Label htmlFor="content" className="text-slate-900 dark:text-slate-100 text-xs font-medium">
                    المحتوى <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="اكتب ملاحظتك هنا..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    className="resize-none bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-sm text-right"
                  />
                </div>

                {/* Important Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_important"
                    checked={formData.is_important}
                    onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <Label htmlFor="is_important" className="cursor-pointer flex items-center gap-2 text-slate-900 dark:text-slate-100 text-xs">
                    <Star className="w-3.5 h-3.5 text-yellow-500" />
                    ملاحظة مهمة
                  </Label>
                </div>

                {/* Attachment */}
                <div className="space-y-1.5">
                  <Label htmlFor="attachment" className="text-slate-900 dark:text-slate-100 text-xs font-medium">
                    إرفاق ملف (اختياري)
                  </Label>
                  <div className="flex flex-col gap-1.5">
                    <Input
                      id="attachment"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handleFileChange}
                      className="cursor-pointer bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 h-9 text-sm file:ml-2 file:px-2 file:py-1 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                    />
                    {attachmentFile && (
                      <Badge variant="outline" className="flex items-center gap-1 w-fit text-xs py-0.5">
                        <Paperclip className="w-3 h-3" />
                        {attachmentFile.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    يُسمح بالصور (JPG, PNG) وملفات PDF فقط (حد أقصى 5 ميجابايت)
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2 py-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false)
                    resetForm()
                  }}
                  className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-1.5 h-8 text-xs transition-colors"
                  style={{ transform: 'none' }}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleCreateNote}
                  disabled={creating || !formData.title || !formData.content || !selectedStudent}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-3 py-1.5 h-8 text-xs transition-colors"
                  style={{ transform: 'none' }}
                >
                  {creating ? 'جاري الإضافة...' : 'إضافة الملاحظة'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : notes.length === 0 ? (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardContent className="py-12">
            <div className="text-center text-slate-500 dark:text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-base font-medium">لا توجد ملاحظات أداء بعد</p>
              {userRole === 'teacher' && (
                <p className="text-sm mt-2">ابدأ بإضافة ملاحظة لطلابك</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => {
            const isUnread = userRole === 'student' && !viewedNotes.has(note.id)
            return (
              <Card 
                key={note.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 relative ${
                  isUnread ? 'border-l-4 border-l-red-500' : ''
                }`}
                onClick={() => handleViewDetails(note.id)}
              >
                {isUnread && (
                  <div className="absolute top-4 left-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">{note.title}</CardTitle>
                        {isUnread && (
                          <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
                            جديد
                          </Badge>
                        )}
                        {note.is_important && (
                        <Badge variant="destructive" className="flex items-center gap-1 text-xs px-2 py-0.5">
                          <Star className="w-3 h-3 fill-current" />
                          مهم
                        </Badge>
                      )}
                      {note.has_attachment && (
                        <Badge variant="outline" className="flex items-center gap-1 text-xs px-2 py-0.5">
                          <Paperclip className="w-3 h-3" />
                          مرفق
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {userRole === 'teacher' ? note.student_name : note.teacher_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {note.batch_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: ar })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
            )
          })}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900" dir="rtl">
          {selectedNote && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <FileText className="w-5 h-5 text-blue-600" />
                      {selectedNote.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {selectedNote.is_important && (
                        <Badge variant="destructive" className="flex items-center gap-1 text-xs px-2 py-0.5">
                          <Star className="w-3 h-3 fill-current" />
                          مهم
                        </Badge>
                      )}
                      {selectedNote.attachment_url && (
                        <Badge variant="outline" className="flex items-center gap-1 text-xs px-2 py-0.5">
                          <Paperclip className="w-3 h-3" />
                          يحتوي على مرفق
                        </Badge>
                      )}
                    </div>
                  </div>
                  {userRole === 'teacher' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteNote(selectedNote.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-3 text-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5 ml-1" />
                      حذف
                    </Button>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">المعلم</p>
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{selectedNote.teacher_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">الطالب</p>
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{selectedNote.student_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">المجموعة</p>
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{selectedNote.batch_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">تاريخ الإنشاء</p>
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                      {new Date(selectedNote.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label className="text-slate-900 dark:text-slate-100 text-sm font-medium">المحتوى</Label>
                  <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg whitespace-pre-wrap text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                    {selectedNote.content}
                  </div>
                </div>

                {/* Attachment */}
                {selectedNote.attachment_url && (
                  <div className="space-y-2">
                    <Label className="text-slate-900 dark:text-slate-100 text-sm font-medium">المرفق</Label>
                    <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Paperclip className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{selectedNote.attachment_name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {selectedNote.attachment_type?.toUpperCase()} • 
                                {selectedNote.attachment_size ? ` ${(selectedNote.attachment_size / 1024).toFixed(2)} KB` : ''}
                              </p>
                            </div>
                          </div>
                          <a
                            href={selectedNote.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex-shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            تحميل
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
