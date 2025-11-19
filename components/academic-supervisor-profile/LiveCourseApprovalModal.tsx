'use client';

import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LiveCourseApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  onApprove?: (course: any, notes?: string) => void;
  onReject?: (course: any, reason?: string) => void;
}

export const LiveCourseApprovalModal: React.FC<LiveCourseApprovalModalProps> = ({
  isOpen,
  onClose,
  course,
  onApprove,
  onReject,
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${API_BASE_URL}/live-courses/courses/${course.id}/approve/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: notes || '' }),
      });

      if (response.ok) {
        toast.success('✅ تم قبول الدورة المباشرة بنجاح!');
        onApprove?.(course, notes);
        handleClose();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'فشل في قبول الدورة');
      }
    } catch (error) {
      console.error('Error approving course:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء قبول الدورة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${API_BASE_URL}/live-courses/courses/${course.id}/reject/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: notes || '' }),
      });

      if (response.ok) {
        toast.success('✅ تم رفض الدورة المباشرة');
        onReject?.(course, notes);
        handleClose();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'فشل في رفض الدورة');
      }
    } catch (error) {
      console.error('Error rejecting course:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء رفض الدورة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setAction(null);
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold pr-10">
              {action === null ? 'قبول / رفض الدورة المباشرة' : 
               action === 'approve' ? 'قبول الدورة' : 'رفض الدورة'}
            </h2>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {action === null ? (
              <>
                {/* Course Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-gray-800">{course.title}</p>
                  <p className="text-sm text-gray-600">
                    المعلم: <span className="font-medium">{course.teacher_name || 'غير محدد'}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    النوع: <span className="font-medium">{course.course_type_display || course.course_type}</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button
                    onClick={() => setAction('approve')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    قبول الدورة
                  </Button>
                  <Button
                    onClick={() => setAction('reject')}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <AlertTriangle className="w-4 h-4 ml-2" />
                    رفض الدورة
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Notes/Reason */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {action === 'approve' ? 'ملاحظات الموافقة (اختياري)' : 'سبب الرفض (اختياري)'}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={action === 'approve' ? 'أضف ملاحظاتك...' : 'اشرح سبب الرفض...'}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                </div>

                {/* Confirmation */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    {action === 'approve' 
                      ? '⚠️ سيتم إرسال إشعار للمعلم بموافقتك على الدورة'
                      : '⚠️ سيتم إرسال إشعار للمعلم برفضك للدورة'
                    }
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button
                    onClick={() => setAction(null)}
                    variant="outline"
                    disabled={submitting}
                  >
                    عودة
                  </Button>
                  <Button
                    onClick={action === 'approve' ? handleApprove : handleReject}
                    className={action === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                    }
                    disabled={submitting}
                  >
                    {submitting ? 'جاري...' : (action === 'approve' ? 'تأكيد الموافقة' : 'تأكيد الرفض')}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
