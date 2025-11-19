'use client'

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw, UserPlus } from 'lucide-react'

interface AddStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  onStudentIdChange: (id: string) => void
  onAdd: () => void
  adding: boolean
}

export default function AddStudentDialog({
  open,
  onOpenChange,
  studentId,
  onStudentIdChange,
  onAdd,
  adding
}: AddStudentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>إضافة طالب جديد</DialogTitle>
          <DialogDescription>
            أدخل معرف الطالب (UUID) لإضافته إلى المجموعة
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="student-id">معرف الطالب (UUID)</Label>
            <Input
              id="student-id"
              placeholder="مثال: 3fa85f64-5717-4562-b3fc-2c963f66afa6"
              value={studentId}
              onChange={(e) => onStudentIdChange(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              ملاحظة: يجب إدخال UUID الخاص بالطالب (يمكن الحصول عليه من صفحة الطلاب)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button 
            onClick={onAdd}
            disabled={adding}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {adding ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                جاري الإضافة...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                إضافة
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

