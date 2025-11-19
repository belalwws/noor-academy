'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, FlaskConical, User, Percent } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { type KnowledgeLab } from '@/lib/api/knowledge-lab';

interface KnowledgeLabActionModalsProps {
  // Approval Modal
  showApprovalModal: boolean;
  selectedLab: KnowledgeLab | null;
  approvalNotes: string;
  setApprovalNotes: (notes: string) => void;
  platformCommission: string;
  setPlatformCommission: (commission: string) => void;
  isApproving: boolean;
  handleLabApproval: () => void;
  
  // Rejection Modal
  showRejectionModal: boolean;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  handleLabRejection: () => void;
  
  // Common
  handleCloseModals: () => void;
}

const KnowledgeLabActionModals: React.FC<KnowledgeLabActionModalsProps> = ({
  showApprovalModal,
  selectedLab,
  approvalNotes,
  setApprovalNotes,
  platformCommission,
  setPlatformCommission,
  isApproving,
  handleLabApproval,
  
  showRejectionModal,
  rejectionReason,
  setRejectionReason,
  handleLabRejection,
  
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
      {/* 🎯 Approval Modal - مخصص لمختبرات المعرفة */}
      <Dialog open={showApprovalModal} onOpenChange={handleCloseModals}>
        <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white to-green-50/30 dark:from-slate-900 dark:to-green-900/10 border-green-200 dark:border-green-700">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  اعتماد مختبر المعرفة
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-slate-400">
                  تأكيد الموافقة على مختبر المعرفة وإتاحته للطلاب
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Lab Info */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {selectedLab?.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <User className="w-4 h-4" />
                    <span>{selectedLab?.teacher_name || 'غير معروف'}</span>
                  </div>
                  {selectedLab?.course_title && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      مرتبط بدورة: {selectedLab.course_title}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Alert */}
            <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
                ستتم الموافقة على مختبر المعرفة وإتاحته للطلاب
              </AlertDescription>
            </Alert>

            {/* Platform Commission Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                نسبة عمولة المنصة <span className="text-gray-400">(اختيارية)</span>
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
                  className={`pr-10 ${!isValidCommission() ? 'border-red-300 focus:border-red-500' : ''}`}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Percent className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              {!isValidCommission() && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  يجب أن تكون النسبة بين 0 و 100
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-slate-400">
                أدخل نسبة عمولة المنصة من سعر مختبر المعرفة (0-100%)
              </p>
            </div>

            {/* Notes Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                ملاحظات الموافقة <span className="text-gray-400">(اختيارية)</span>
              </label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="أدخل أي ملاحظات حول قبول مختبر المعرفة..."
                className="min-h-[100px] resize-none"
              />
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
              onClick={handleLabApproval}
              disabled={isApproving || !isValidCommission()}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white gap-2"
            >
              {isApproving ? (
                <>
                  <Spinner size="sm" />
                  جاري الموافقة...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  اعتماد المختبر
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🎯 Rejection Modal - مخصص لمختبرات المعرفة */}
      <Dialog open={showRejectionModal} onOpenChange={handleCloseModals}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-red-50/30 dark:from-slate-900 dark:to-red-900/10 border-red-200 dark:border-red-700">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  رفض مختبر المعرفة
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-slate-400">
                  يرجى توضيح سبب الرفض
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Lab Info */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {selectedLab?.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <User className="w-4 h-4" />
                    <span>{selectedLab?.teacher_name || 'غير معروف'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert */}
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-300 text-sm">
                سيتم رفض مختبر المعرفة وإرسال السبب للمعلم
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
                placeholder="يرجى توضيح سبب رفض مختبر المعرفة بشكل واضح..."
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
              onClick={handleLabRejection}
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
                  رفض المختبر
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KnowledgeLabActionModals;

