'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Trash2, AlertTriangle, BookOpen, User, Calendar } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface Course {
  id: string;
  title: string;
  teacher_name?: string;
  created_at?: string;
  description?: string;
  course_type_display?: string;
}

interface CourseActionModalsProps {
  // Approval Modal
  showApprovalModal: boolean;
  selectedCourse: Course | null;
  approvalNotes: string;
  setApprovalNotes: (notes: string) => void;
  isApproving: boolean;
  handleCourseApproval: () => void;
  
  // Rejection Modal
  showRejectionModal: boolean;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  handleCourseRejection: () => void;
  
  // Delete Modal
  showDeleteModal: boolean;
  confirmDeleteText: string;
  setConfirmDeleteText: (text: string) => void;
  showSecondDeleteConfirm: boolean;
  setShowSecondDeleteConfirm: (show: boolean) => void;
  isDeleting: boolean;
  handleFirstDeleteConfirm: () => void;
  handleFinalDelete: () => void;
  
  // Common
  handleCloseModals: () => void;
}

const CourseActionModals: React.FC<CourseActionModalsProps> = ({
  showApprovalModal,
  selectedCourse,
  approvalNotes,
  setApprovalNotes,
  isApproving,
  handleCourseApproval,
  
  showRejectionModal,
  rejectionReason,
  setRejectionReason,
  handleCourseRejection,
  
  showDeleteModal,
  confirmDeleteText,
  setConfirmDeleteText,
  showSecondDeleteConfirm,
  setShowSecondDeleteConfirm,
  isDeleting,
  handleFirstDeleteConfirm,
  handleFinalDelete,
  
  handleCloseModals
}) => {
  return (
    <>
      {/* 🎯 Approval Modal - بسيط */}
      <Dialog open={showApprovalModal} onOpenChange={handleCloseModals}>
        <DialogContent className="sm:max-w-[450px] max-w-[95vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              قبول الدورة
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Notes Input */}
            <div className="space-y-1.5">
              <label className="text-sm text-slate-600 dark:text-slate-400">
                ملاحظات <span className="text-slate-400">(اختيارية)</span>
              </label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="ملاحظات..."
                className="min-h-[70px] text-sm resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleCloseModals}
              disabled={isApproving}
              className="h-9 px-4 text-sm"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCourseApproval}
              disabled={isApproving}
              className="h-9 px-5 text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2"
            >
              {isApproving ? (
                <>
                  <Spinner size="sm" />
                  جاري الموافقة...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  موافقة
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🎯 Rejection Modal - بسيط واحترافي */}
      <Dialog open={showRejectionModal} onOpenChange={handleCloseModals}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-red-50/30 dark:from-slate-900 dark:to-red-900/10 border-red-200 dark:border-red-700">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  رفض الدورة
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-slate-400">
                  يرجى توضيح سبب الرفض
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Course Info */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {selectedCourse?.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <User className="w-4 h-4" />
                    <span>{selectedCourse?.teacher_name || 'غير معروف'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert */}
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-300 text-sm">
                سيتم رفض الدورة وإرسال السبب للمعلم
              </AlertDescription>
            </Alert>

            {/* Reason Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                سبب الرفض <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="يرجى توضيح سبب رفض الدورة بشكل واضح..."
                className="min-h-[120px] resize-none border-red-200 focus:border-red-400 dark:border-red-800"
                required
              />
              {rejectionReason.trim() && rejectionReason.trim().length < 10 && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  يجب أن يكون السبب 10 أحرف على الأقل
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCloseModals}
              disabled={isApproving}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCourseRejection}
              disabled={isApproving || !rejectionReason.trim() || rejectionReason.trim().length < 10}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white gap-2"
            >
              {isApproving ? (
                <>
                  <Spinner size="sm" />
                  جاري الرفض...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  رفض الدورة
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🎯 Delete Modal - بسيط واحترافي */}
      <Dialog open={showDeleteModal} onOpenChange={handleCloseModals}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-red-50/30 dark:from-slate-900 dark:to-red-900/10 border-red-300 dark:border-red-700">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  حذف الدورة نهائياً
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-slate-400">
                  عملية لا يمكن التراجع عنها
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Course Info */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                {selectedCourse?.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                <User className="w-4 h-4" />
                <span>{selectedCourse?.teacher_name || 'غير معروف'}</span>
              </div>
            </div>

            {!showSecondDeleteConfirm ? (
              <>
                {/* First Confirmation */}
                <Alert className="bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-300 text-sm">
                    <strong>تحذير:</strong> سيتم حذف الدورة وجميع البيانات المرتبطة بها نهائياً!
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    اكتب <span className="font-mono bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded text-red-700 dark:text-red-400">حذف الدورة نهائياً</span> للتأكيد
                  </label>
                  <input
                    type="text"
                    value={confirmDeleteText}
                    onChange={(e) => setConfirmDeleteText(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-red-200 dark:border-red-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    placeholder="حذف الدورة نهائياً"
                  />
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={handleCloseModals}>
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleFirstDeleteConfirm}
                    disabled={confirmDeleteText !== 'حذف الدورة نهائياً'}
                    className="bg-red-600 hover:bg-red-700 text-white gap-2"
                  >
                    متابعة
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                {/* Final Confirmation */}
                <Alert className="bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-700">
                  <AlertTriangle className="h-4 w-4 text-red-700 dark:text-red-400" />
                  <AlertDescription className="text-red-900 dark:text-red-300 text-sm font-semibold">
                    تأكيد نهائي: هل أنت متأكد تماماً؟ لا يمكن التراجع!
                  </AlertDescription>
                </Alert>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowSecondDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    تراجع
                  </Button>
                  <Button
                    onClick={handleFinalDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <Spinner size="sm" />
                        جاري الحذف...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        حذف نهائياً
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseActionModals;

