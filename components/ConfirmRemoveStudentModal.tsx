'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, UserMinus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Student {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Course {
  id: string;
  title: string;
  teacher_name: string;
}

interface Enrollment {
  id: string;
  student?: Student;
  course?: Course;
  enrollment_date?: string;
  status?: string;
  // Alternative flat structure
  student_name?: string;
  student_email?: string;
  course_title?: string;
  teacher_name?: string;
  enrollment_status?: string;
}

interface ConfirmRemoveStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  enrollment: Enrollment | null;
}

export default function ConfirmRemoveStudentModal({
  isOpen,
  onClose,
  onConfirm,
  enrollment
}: ConfirmRemoveStudentModalProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);

  const requiredText = 'إزالة الطالب من الكورس';

  const handleClose = () => {
    setConfirmText('');
    setShowSecondConfirm(false);
    setIsRemoving(false);
    onClose();
  };

  const handleFirstConfirm = () => {
    if (confirmText === requiredText) {
      setShowSecondConfirm(true);
    } else {
      toast.error('يرجى كتابة النص المطلوب للتأكيد');
    }
  };

  const handleFinalRemove = async () => {
    if (!enrollment) return;

    setIsRemoving(true);
    try {
      await onConfirm();
      toast.success('تم إزالة الطالب من الكورس بنجاح');
      handleClose();
    } catch (error: any) {
      console.error('Error removing student:', error);
      toast.error(`فشل في إزالة الطالب: ${error.message}`);
    } finally {
      setIsRemoving(false);
    }
  };

  if (!enrollment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            تأكيد إزالة الطالب
          </DialogTitle>
          <DialogDescription>
            سيتم إزالة الطالب من الكورس المحدد
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>تحذير:</strong> سيتم إزالة الطالب من الكورس وستفقد جميع بيانات التقدم
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">تفاصيل الإزالة:</h4>
            <div className="space-y-1 text-sm text-gray-700">
              <p><strong>الطالب:</strong> {
                enrollment.student_name || 
                `${enrollment.student?.first_name || ''} ${enrollment.student?.last_name || ''}`.trim() || 
                'غير محدد'
              }</p>
              <p><strong>البريد الإلكتروني:</strong> {
                enrollment.student_email || 
                enrollment.student?.email || 
                'غير محدد'
              }</p>
              <p><strong>الكورس:</strong> {
                enrollment.course_title || 
                enrollment.course?.title || 
                'غير محدد'
              }</p>
              <p><strong>المعلم:</strong> {
                enrollment.teacher_name || 
                enrollment.course?.teacher_name || 
                'غير محدد'
              }</p>
              <p><strong>تاريخ التسجيل:</strong> {
                enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString('ar-SA') : 'غير محدد'
              }</p>
              <p><strong>الحالة:</strong> {
                enrollment.enrollment_status || 
                enrollment.status || 
                'غير محدد'
              }</p>
            </div>
          </div>

          {!showSecondConfirm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  للتأكيد، اكتب النص التالي:
                </label>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                  <code className="text-yellow-800 font-mono">{requiredText}</code>
                </div>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="اكتب النص هنا..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleFirstConfirm}
                  disabled={confirmText !== requiredText}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <UserMinus className="w-4 h-4 ml-2" />
                  تأكيد الإزالة
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="border-orange-300 bg-orange-100">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>تأكيد نهائي:</strong> هل أنت متأكد تماماً من إزالة هذا الطالب من الكورس؟
                  <br />
                  <strong>سيتم فقدان جميع بيانات التقدم!</strong>
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  onClick={handleFinalRemove}
                  disabled={isRemoving}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isRemoving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 h-4 border-b-2 border-white ml-2"></div>
                      جاري الإزالة...
                    </>
                  ) : (
                    <>
                      <UserMinus className="w-4 h-4 ml-2" />
                      إزالة نهائية
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowSecondConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

