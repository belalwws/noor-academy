'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { courseCommunitiesApi, type CommunityBadge, type UpdateBadgeData } from '@/lib/api/course-communities'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface EditBadgeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  badge: CommunityBadge
  batchStudents: Array<{ id: string; user: { id: number; get_full_name: string } }>
  onSuccess: () => void
}

export default function EditBadgeDialog({
  open,
  onOpenChange,
  badge,
  batchStudents,
  onSuccess
}: EditBadgeDialogProps) {
  const [formData, setFormData] = useState<UpdateBadgeData>({
    student: badge.student,
    badge_type: badge.badge_type,
    name: badge.name,
    description: badge.description,
    icon: badge.icon
  })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (badge) {
      setFormData({
        student: badge.student,
        badge_type: badge.badge_type,
        name: badge.name,
        description: badge.description,
        icon: badge.icon
      })
    }
  }, [badge])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      setUpdating(true)
      await courseCommunitiesApi.patchBadge(badge.id, formData)
      toast.success('تم تحديث الشارة بنجاح')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error updating badge:', error)
      toast.error(error?.data?.detail || error?.message || 'فشل تحديث الشارة')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>تعديل الشارة</DialogTitle>
          <DialogDescription>
            قم بتعديل معلومات الشارة
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">الطالب *</Label>
            <Select
              value={formData.student}
              onValueChange={(value) => setFormData({ ...formData, student: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الطالب" />
              </SelectTrigger>
              <SelectContent>
                {batchStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.user?.get_full_name || `طالب ${student.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="badge_type">نوع الشارة *</Label>
            <Select
              value={formData.badge_type}
              onValueChange={(value: 'title' | 'achievement' | 'participation' | 'excellence') =>
                setFormData({ ...formData, badge_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">لقب / رتبة</SelectItem>
                <SelectItem value="achievement">إنجاز</SelectItem>
                <SelectItem value="participation">مشاركة</SelectItem>
                <SelectItem value="excellence">تميز</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">اسم الشارة *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: الطالب المتميز"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف الشارة..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">الأيقونة (Emoji)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🏆"
              maxLength={10}
            />
            <p className="text-xs text-gray-500">
              يمكنك استخدام emoji كأيقونة للشارة
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updating}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  جاري التحديث...
                </>
              ) : (
                'تحديث الشارة'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

