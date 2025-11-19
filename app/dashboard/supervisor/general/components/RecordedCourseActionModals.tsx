'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, BookOpen, User, Percent } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { type RecordedCourse } from '@/lib/api/recorded-courses';

interface RecordedCourseActionModalsProps {
  // Approval Modal
  showApprovalModal: boolean;
  selectedCourse: RecordedCourse | null;
  approvalNotes: string;
  setApprovalNotes: (notes: string) => void;
  platformCommission: string;
  setPlatformCommission: (commission: string) => void;
  isApproving: boolean;
  handleCourseApproval: () => void;
  
  // Rejection Modal
  showRejectionModal: boolean;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  handleCourseRejection: () => void;
  
  // Common
  handleCloseModals: () => void;
}

const RecordedCourseActionModals: React.FC<RecordedCourseActionModalsProps> = ({
  showApprovalModal,
  selectedCourse,
  approvalNotes,
  setApprovalNotes,
  platformCommission,
  setPlatformCommission,
  isApproving,
  handleCourseApproval,
  
  showRejectionModal,
  rejectionReason,
  setRejectionReason,
  handleCourseRejection,
  
  handleCloseModals
}) => {
  // Validate commission percentage
  const isValidCommission = () => {
    if (!platformCommission.trim()) return true; // Optional field
    const num = parseFloat(platformCommission);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  return (
    <>
      {/* 🎯 Approval Modal - مخصص للدورات المسجلة */}
      <Dialog open={showApprovalModal} onOpenChange={handleCloseModals}>
        <DialogContent className="sm:max-w-[600px] !top-[47%] translate-y-[-50%] mt-16 bg-gradient-to-br from-white via-amber-50/50 to-orange-50/50 dark:from-slate-900 dark:via-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 shadow-2xl">
          <DialogHeader className="pb-4 border-b border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 -m-6 mb-0 p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  اعتماد الدورة المسجلة
                </DialogTitle>
                <DialogDescription className="text-sm text-amber-700 dark:text-amber-400">
                  تأكيد الموافقة على الدورة المسجلة وإتاحتها للطلاب
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Course Info */}
            <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 backdrop-blur-sm p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                  <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {selectedCourse?.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                    <User className="w-4 h-4" />
                    <span>{selectedCourse?.teacher_name || 'غير معروف'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert */}
            <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
                ستتم الموافقة على الدورة المسجلة وإتاحتها للطلاب المسجلين
              </AlertDescription>
            </Alert>

            {/* Platform Commission Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-amber-800 dark:text-amber-300">
                نسبة عمولة المنصة <span className="text-amber-500 dark:text-amber-500">(اختيارية)</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={platformCommission}
                  onChange={(e) => setPlatformCommission(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  max="100"
                  step="0.01"
                  className={`pr-10 border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500 ${!isValidCommission() ? 'border-red-300 focus:border-red-500' : ''}`}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Percent className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </div>
              </div>
              {!isValidCommission() && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  يجب أن تكون النسبة بين 0 و 100
                </p>
              )}
              <p className="text-xs text-amber-600 dark:text-amber-400">
                أدخل نسبة عمولة المنصة من سعر الدورة (0-100%)
              </p>
            </div>

            {/* Notes Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-amber-800 dark:text-amber-300">
                ملاحظات الموافقة <span className="text-amber-500 dark:text-amber-500">(اختيارية)</span>
              </label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="أدخل أي ملاحظات حول قبول الدورة..."
                className="min-h-[100px] resize-none border-amber-200 dark:border-amber-800 focus:border-amber-500 dark:focus:border-amber-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 -m-6 mt-0 p-6 rounded-b-lg">
            <Button
              variant="outline"
              onClick={handleCloseModals}
              disabled={isApproving}
              className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCourseApproval}
              disabled={isApproving || !isValidCommission()}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
            >
              {isApproving ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" className="w-4 h-4" />
                  <span>جاري الموافقة...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>اعتماد الدورة</span>
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🎯 Rejection Modal - مخصص للدورات المسجلة */}
      <Dialog open={showRejectionModal} onOpenChange={handleCloseModals}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-red-50/30 dark:from-slate-900 dark:to-red-900/10 border-red-200 dark:border-red-700">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  رفض الدورة المسجلة
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
                سيتم رفض الدورة المسجلة وإرسال السبب للمعلم
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
    </>
  );
};

export default RecordedCourseActionModals;

