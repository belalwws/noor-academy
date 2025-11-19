'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, RefreshCw } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  learning_outcomes?: string
  course_type: "individual" | "family" | "group_private" | "group_public"
  course_type_display: string
  subjects?: string
  trial_session_url?: string
  max_students: string
  teacher: number
  teacher_name: string
  teacher_email: string
  approval_status: "pending" | "approved" | "rejected" | "under_review"
  approval_status_display: string
  approved_by?: number
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  is_published: boolean
  lessons: any[]
  enrolled_count: string
  available_spots: string
  created_at: string
  updated_at: string
  
  // Legacy fields for backward compatibility
  instructor?: number
  instructor_name?: string
  level?: "beginner" | "intermediate" | "advanced"
  learning_path?: "individual" | "group_continuous" | "training" | "live_education"
  duration_weeks?: number
  start_date?: string
  session_duration?: number
  enrollment_count?: number | string
  lessons_count?: number
  next_session?: string
  status?: "draft" | "published" | "archived" | "pending_review"
  is_approved?: boolean
}

interface NotesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
  note: string
  onNoteChange: (note: string) => void
  onSave: () => void
  saving: boolean
}

export default function NotesDialog({
  open,
  onOpenChange,
  course,
  note,
  onNoteChange,
  onSave,
  saving
}: NotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-right">ترك ملحوظة</DialogTitle>
          <DialogDescription className="text-right">
            {course && (
              <>اترك ملحوظة حول الدورة: <span className="font-semibold">{course.title}</span></>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course-note">الملحوظة</Label>
            <Textarea
              id="course-note"
              placeholder="اكتب ملحوظتك هنا..."
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button 
              onClick={onSave}
              disabled={saving || !note.trim()}
              className="bg-[#2d7d32] hover:bg-[#1b5e20]"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 ml-2" />
                  حفظ الملحوظة
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
