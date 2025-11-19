'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Plus, 
  Megaphone, 
  Star, 
  Pin,
  PinOff,
  Paperclip, 
  Download, 
  Trash2,
  Calendar,
  User,
  Eye
} from 'lucide-react'
import { 
  announcementNotesAPI,
  type AnnouncementNote,
  type CreateAnnouncementNoteData 
} from '@/lib/api/notes'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface AnnouncementNotesProps {
  batchId: string
  userRole: 'teacher' | 'student'
  isActualTeacher?: boolean // True only for actual teachers, false for supervisors
}

export default function AnnouncementNotes({ batchId, userRole, isActualTeacher = false }: AnnouncementNotesProps) {
  const [notes, setNotes] = useState<AnnouncementNote[]>([])
  const [selectedNote, setSelectedNote] = useState<AnnouncementNote | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_important: false,
    is_pinned: false
  })

  // Load notes
  useEffect(() => {
    if (batchId) {
      loadNotes()
    }
  }, [batchId])

  const loadNotes = async (silent = false, preserveOptimisticUpdates = false) => {
    try {
      if (!silent) {
        setLoading(true)
      }
      const data = await announcementNotesAPI.getByBatch(batchId)
      console.log('📋 Loaded announcement notes:', data)
      
      // التحقق من أن البيانات موجودة وصحيحة
      if (Array.isArray(data)) {
        console.log(`📊 Found ${data.length} announcement notes`)
        // Sort: pinned first, then by creation date
        const sorted = data.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1
          if (!a.is_pinned && b.is_pinned) return 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        
        // إذا كنا نحافظ على optimistic updates، نتحقق من وجود الإعلانات المضافة محلياً
        if (preserveOptimisticUpdates) {
          setNotes(prevNotes => {
            // الحصول على IDs للإعلانات المرتجعة من API
            const apiNoteIds = new Set(sorted.map(n => n.id))
            
            // إضافة الإعلانات المحلية التي لم تكن موجودة في API
            const localNotes = prevNotes.filter(n => !apiNoteIds.has(n.id))
            
            // دمج الإعلانات: API notes + local notes (optimistic updates)
            const mergedNotes = [...sorted, ...localNotes]
            
            // إعادة الترتيب بعد الدمج
            return mergedNotes.sort((a, b) => {
              if (a.is_pinned && !b.is_pinned) return -1
              if (!a.is_pinned && b.is_pinned) return 1
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            })
          })
        } else {
          console.log(`✅ Setting ${sorted.length} notes to state`)
          setNotes(sorted)
        }
      } else {
        // إذا لم تكن البيانات مصفوفة
        console.warn('⚠️ Expected array but got:', data)
        if (!preserveOptimisticUpdates) {
          setNotes([])
        }
        // إذا كنا نحافظ على optimistic updates، لا نقوم بتعيين القائمة إلى مصفوفة فارغة
      }
    } catch (error) {
      console.error('❌ Error loading announcement notes:', error)
      if (!silent) {
        toast.error('فشل تحميل الإعلانات')
      }
      // في حالة الخطأ، إذا كنا نحافظ على optimistic updates، لا نقوم بتعيين القائمة إلى مصفوفة فارغة
      if (!preserveOptimisticUpdates) {
        // فقط في حالة عدم الحفاظ على optimistic updates، نترك القائمة كما هي
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const handleCreateNote = async () => {
    if (!formData.title || !formData.content) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      setCreating(true)
      
      const createData: CreateAnnouncementNoteData = {
        batch: batchId,
        title: formData.title,
        content: formData.content,
        is_important: formData.is_important,
        is_pinned: formData.is_pinned,
        attachment_file: attachmentFile || undefined
      }

      const newNote = await announcementNotesAPI.create(createData)
      
      toast.success('✅ تم إضافة الإعلان بنجاح')
      setShowCreateDialog(false)
      resetForm()
      
      // Add the new note to the list immediately (optimistic update)
      setNotes(prevNotes => {
        const updated = [newNote, ...prevNotes]
        return updated.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1
          if (!a.is_pinned && b.is_pinned) return 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
      })
      
      // Reload the full list in background to ensure consistency
      loadNotes(true)
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast.error('فشل إضافة الإعلان')
    } finally {
      setCreating(false)
    }
  }

  const handleViewDetails = async (note: AnnouncementNote) => {
    try {
      const fullNote = await announcementNotesAPI.get(note.id)
      setSelectedNote(fullNote)
      setShowDetailsDialog(true)
    } catch (error) {
      console.error('Error loading note details:', error)
      toast.error('فشل تحميل تفاصيل الإعلان')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      return
    }

    try {
      await announcementNotesAPI.delete(noteId)
      toast.success('تم حذف الإعلان بنجاح')
      loadNotes()
      setShowDetailsDialog(false)
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('فشل حذف الإعلان')
    }
  }

  const handleTogglePin = async (noteId: string) => {
    if (userRole !== 'teacher') {
      toast.error('التثبيت متاح للمعلم فقط')
      return
    }

    try {
      const result = await announcementNotesAPI.togglePin(noteId)
      toast.success(result.is_pinned ? '📌 تم تثبيت الإعلان' : 'تم إلغاء التثبيت')
      loadNotes()
      if (selectedNote?.id === noteId) {
        setSelectedNote({ ...selectedNote, is_pinned: result.is_pinned })
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
      toast.error('فشل تغيير حالة التثبيت')
    }
  }

  const resetForm = () => {
    setFormData({ title: '', content: '', is_important: false, is_pinned: false })
    setAttachmentFile(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/quicktime', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(file.type)) {
        toast.error('نوع الملف غير مدعوم. يُسمح بالصور، فيديوهات، ومستندات')
        return
      }
      
      // Validate file size (max 50MB for videos, 5MB for others)
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error(`حجم الملف كبير جداً. الحد الأقصى ${file.type.startsWith('video/') ? '50' : '5'} ميجابايت`)
        return
      }
      
      setAttachmentFile(file)
      toast.success(`تم اختيار الملف: ${file.name}`)
    }
  }

  // Check if user can delete note (only creator can delete)
  const canDeleteNote = (note: AnnouncementNote) => {
    // Note: Backend should handle creator identification
    // For now, we check if creator_type matches user role
    // In production, we need creator_id from backend to compare with currentUserId
    return userRole === note.creator_type
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-600" />
            الإعلانات العامة
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            إعلانات مشتركة لجميع أعضاء المجموعة
          </p>
        </div>
        
        {/* Create Button - Actual Teacher Only (not supervisors) */}
        {isActualTeacher && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-auto">
                <Plus className="w-4 h-4 ml-2" />
                إعلان جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                إضافة إعلان جديد
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                أضف إعلاناً عاماً لجميع أعضاء المجموعة
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-900 dark:text-slate-100 text-sm font-medium">
                  عنوان الإعلان <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="مثال: إعلان هام - موعد الاختبار"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={200}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 h-10 text-right"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">{formData.title.length}/200</p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-slate-900 dark:text-slate-100 text-sm font-medium">
                  المحتوى <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="اكتب محتوى الإعلان هنا..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="resize-none bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-right"
                />
              </div>

              {/* Important Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_important"
                  checked={formData.is_important}
                  onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 cursor-pointer"
                />
                <Label htmlFor="is_important" className="cursor-pointer flex items-center gap-2 text-slate-900 dark:text-slate-100 text-sm">
                  <Star className="w-4 h-4 text-yellow-500" />
                  إعلان مهم
                </Label>
              </div>

              {/* Pin Checkbox (Actual Teacher only) */}
              {isActualTeacher && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_pinned"
                    checked={formData.is_pinned}
                    onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <Label htmlFor="is_pinned" className="cursor-pointer flex items-center gap-2 text-slate-900 dark:text-slate-100 text-sm">
                    <Pin className="w-4 h-4 text-blue-600" />
                    تثبيت في الأعلى
                  </Label>
                </div>
              )}

              {/* Attachment */}
              <div className="space-y-2">
                <Label htmlFor="attachment" className="text-slate-900 dark:text-slate-100 text-sm font-medium">
                  إرفاق ملف (اختياري)
                </Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="attachment"
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="cursor-pointer bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 h-10 file:ml-2 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                  />
                  {attachmentFile && (
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <Paperclip className="w-3 h-3" />
                      {attachmentFile.name}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  يُسمح بالصور، فيديوهات (حتى 30 ثانية)، ومستندات (PDF, Word)
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false)
                  resetForm()
                }}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2 h-9 text-sm"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleCreateNote}
                disabled={creating || !formData.title || !formData.content}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 h-9 text-sm"
              >
                {creating ? 'جاري النشر...' : 'نشر الإعلان'}
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
              <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-base font-medium">لا توجد إعلانات بعد</p>
              <p className="text-sm mt-2">ابدأ بإضافة إعلان عام للمجموعة</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card 
              key={note.id} 
              className={`cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 ${
                note.is_pinned ? 'border-l-4 border-l-blue-600' : ''
              }`}
              onClick={() => handleViewDetails(note)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {note.is_pinned && (
                        <Pin className="w-4 h-4 text-blue-600 fill-blue-600" />
                      )}
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">{note.title}</CardTitle>
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
                        {note.creator_name} ({note.creator_type === 'teacher' ? 'معلم' : 'طالب'})
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {note.visible_students_count} مشاهدة
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
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900" dir="rtl">
          {selectedNote && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Megaphone className="w-5 h-5 text-blue-600" />
                      {selectedNote.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {selectedNote.is_pinned && (
                        <Badge className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-600">
                          <Pin className="w-3 h-3 fill-current" />
                          مثبت
                        </Badge>
                      )}
                      {selectedNote.is_important && (
                        <Badge variant="destructive" className="flex items-center gap-1 text-xs px-2 py-0.5">
                          <Star className="w-3 h-3 fill-current" />
                          مهم
                        </Badge>
                      )}
                      {selectedNote.has_attachment && (
                        <Badge variant="outline" className="flex items-center gap-1 text-xs px-2 py-0.5">
                          <Paperclip className="w-3 h-3" />
                          يحتوي على مرفق
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isActualTeacher && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTogglePin(selectedNote.id)
                        }}
                        className="h-8 px-3 text-sm"
                      >
                        {selectedNote.is_pinned ? (
                          <>
                            <PinOff className="w-3.5 h-3.5 ml-1" />
                            إلغاء التثبيت
                          </>
                        ) : (
                          <>
                            <Pin className="w-3.5 h-3.5 ml-1" />
                            تثبيت
                          </>
                        )}
                      </Button>
                    )}
                    {canDeleteNote(selectedNote) && (
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
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">الناشر</p>
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                      {selectedNote.creator_name} ({selectedNote.creator_type === 'teacher' ? 'معلم' : 'طالب'})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">المجموعة</p>
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{selectedNote.batch_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">الدورة</p>
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{selectedNote.course_title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">تاريخ النشر</p>
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
                            onClick={(e) => e.stopPropagation()}
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
