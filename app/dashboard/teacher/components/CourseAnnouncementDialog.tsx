'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import { toast } from 'sonner'
import { MessageSquare, Pin, AlertCircle, RefreshCw } from 'lucide-react'

interface Course {
  id: string
  title: string
}

interface CourseAnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
}

interface AnnouncementForm {
  title: string
  content: string
  is_important: boolean
  is_pinned: boolean
}

export default function CourseAnnouncementDialog({
  open,
  onOpenChange,
  course
}: CourseAnnouncementDialogProps) {
  const [form, setForm] = useState<AnnouncementForm>({
    title: '',
    content: '',
    is_important: false,
    is_pinned: false
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!course || !form.title.trim() || !form.content.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      setLoading(true)
      
      const response = await apiClient.post('/notes/course/', {
        course: course.id,
        title: form.title,
        content: form.content,
        note_type: 'announcement',
        is_important: form.is_important,
        is_pinned: form.is_pinned
      })

      if (response.status >= 200 && response.status < 300) {
        toast.success('تم إضافة الإعلان بنجاح! 🎉')
        setForm({ title: '', content: '', is_important: false, is_pinned: false })
        onOpenChange(false)
      } else {
        const message = (response.data as any)?.detail || (response.data as any)?.message || 'حدث خطأ في إضافة الإعلان'
        toast.error(message)
      }
    } catch (error) {
      console.error('Error creating announcement:', error)
      const message = (error as any)?.data?.detail || (error as any)?.message || 'حدث خطأ في الاتصال بالخادم'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <MessageSquare className="w-5 h-5" />
            إضافة إعلان مهم للطلاب
          </DialogTitle>
        </DialogHeader>
        
        {course && (
          <Alert className="bg-orange-50 border-orange-200">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              سيتم إرسال هذا الإعلان لجميع الطلاب المسجلين في كورس: <strong>{course.title}</strong>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان الإعلان *</Label>
            <Input
              id="title"
              placeholder="مثال: إعلان مهم حول الامتحان القادم"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="content">محتوى الإعلان *</Label>
            <Textarea
              id="content"
              placeholder="اكتب محتوى الإعلان هنا..."
              rows={4}
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="important"
                checked={form.is_important}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_important: checked }))}
              />
              <Label htmlFor="important" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                إعلان مهم
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="pinned"
                checked={form.is_pinned}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_pinned: checked }))}
              />
              <Label htmlFor="pinned" className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-blue-500" />
                تثبيت الإعلان
              </Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !form.title.trim() || !form.content.trim()}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  جاري النشر...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  نشر الإعلان
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
