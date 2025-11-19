'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, X, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import liveEducationApi from '@/lib/api/live-education';
import type { Batch, PendingStudent } from '@/lib/types/live-education';
import { Badge } from '@/components/ui/badge';

interface AddStudentToBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch;
  pendingStudents: PendingStudent[];
  onSuccess: () => void;
}

export default function AddStudentToBatchModal({
  isOpen,
  onClose,
  batch,
  pendingStudents,
  onSuccess
}: AddStudentToBatchModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId) {
      toast.error('يرجى اختيار طالب');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await liveEducationApi.batchStudents.add({
        batch: batch.id,
        student: parseInt(selectedStudentId),
      });

      if (response.ok) {
        toast.success('تم إضافة الطالب للمجموعة بنجاح! 🎉');
        onSuccess();
        onClose();
        setSelectedStudentId('');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'حدث خطأ في إضافة الطالب');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900">
        <div className="relative bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-2xl -m-6 p-6">
          {/* Animated Background */}
          <motion.div 
            className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <DialogHeader className="text-center pb-6 relative z-10">
              <motion.div 
                className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <UserPlus className="w-8 h-8 text-white" />
              </motion.div>
              <DialogTitle className="text-2xl font-bold text-blue-800">
                إضافة طالب للمجموعة
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {batch.name}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Batch Info */}
              <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-blue-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">الطلاب الحاليون</span>
                  <span className="font-bold text-gray-900">
                    {batch.current_students} / {batch.max_students}
                  </span>
                </div>
                {batch.is_full && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    ⚠️ المجموعة ممتلئة
                  </div>
                )}
              </div>

              {/* Student Selection */}
              <div className="space-y-2">
                <Label htmlFor="student" className="text-blue-800 font-semibold">
                  اختر الطالب *
                </Label>
                {pendingStudents.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-600">
                    لا يوجد طلاب منتظرين حالياً
                  </div>
                ) : (
                  <Select
                    value={selectedStudentId}
                    onValueChange={setSelectedStudentId}
                    disabled={isSubmitting || batch.is_full}
                  >
                    <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 rounded-xl">
                      <SelectValue placeholder="اختر طالباً..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {pendingStudents.map((student) => (
                        <SelectItem key={student.id} value={student.student_id.toString()}>
                          <div className="flex items-center gap-3 py-1">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">
                                {student.student_name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {student.student_email}
                              </div>
                            </div>
                            {student.payment_status === 'approved' && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <CheckCircle className="w-3 h-3 ml-1" />
                                مدفوع
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex-1 border-2 border-blue-200 text-gray-700 hover:bg-blue-50 rounded-xl"
                >
                  <X className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedStudentId || batch.is_full || pendingStudents.length === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                        جاري الإضافة...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 ml-2" />
                        إضافة الطالب
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

