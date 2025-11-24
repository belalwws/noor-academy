'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import liveEducationApi from '@/lib/api/live-education';
import type { CreateBatchInput, BatchType } from '@/lib/types/live-education';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onSuccess: () => void;
}

export default function CreateBatchModal({
  isOpen,
  onClose,
  courseId,
  onSuccess
}: CreateBatchModalProps) {
  const [formData, setFormData] = useState<CreateBatchInput>({
    name: '',
    course: courseId,
    batch_type: 'group',
    max_students: 30,
    description: '',
    schedule: '',
    meeting_link: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('يرجى إدخال اسم المجموعة');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await liveEducationApi.batches.create(formData);

      if (response.ok) {
        toast.success('تم إنشاء المجموعة بنجاح! 🎉');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: '',
          course: courseId,
          batch_type: 'group',
          max_students: 30,
          description: '',
          schedule: '',
          meeting_link: '',
        });
      } else {
        const error = await response.json();
        toast.error(error.detail || 'حدث خطأ في إنشاء المجموعة');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-2xl -m-6 p-6">
          {/* Animated Background */}
          <motion.div 
            className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-blue-400/20 rounded-full blur-3xl"
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
                className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Users className="w-8 h-8 text-white" />
              </motion.div>
              <DialogTitle className="text-2xl font-bold text-blue-800">
                إنشاء مجموعة جديدة
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                قم بإنشاء مجموعة لتنظيم الطلاب في الدورة
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Batch Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-blue-800 font-semibold">
                  اسم المجموعة *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: مجموعة النسور، مجموعة محمد"
                  className="border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                  disabled={isSubmitting}
                />
              </div>

              {/* Batch Type */}
              <div className="space-y-2">
                <Label htmlFor="batch_type" className="text-blue-800 font-semibold">
                  نوع المجموعة *
                </Label>
                <Select
                  value={formData.batch_type}
                  onValueChange={(value: BatchType) => 
                    setFormData({ 
                      ...formData, 
                      batch_type: value,
                      max_students: value === 'individual' ? 1 : 30
                    })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>مجموعة فردية (طالب واحد)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="group">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>مجموعة جماعية (متعدد الطلاب)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Students (only for group type) */}
              {formData.batch_type === 'group' && (
                <div className="space-y-2">
                  <Label htmlFor="max_students" className="text-blue-800 font-semibold">
                    الحد الأقصى للطلاب
                  </Label>
                  <Input
                    id="max_students"
                    type="number"
                    min="2"
                    max="200"
                    value={formData.max_students}
                    onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) || 30 })}
                    className="border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-blue-800 font-semibold">
                  الوصف (اختياري)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أضف وصفاً للمجموعة..."
                  rows={3}
                  className="border-2 border-blue-200 focus:border-blue-500 rounded-xl resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <Label htmlFor="schedule" className="text-blue-800 font-semibold">
                  الجدول الزمني (اختياري)
                </Label>
                <Input
                  id="schedule"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="مثال: الأحد والثلاثاء 5-7 مساءً"
                  className="border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                  disabled={isSubmitting}
                />
              </div>

              {/* Meeting Link */}
              <div className="space-y-2">
                <Label htmlFor="meeting_link" className="text-blue-800 font-semibold">
                  رابط الاجتماع (اختياري)
                </Label>
                <Input
                  id="meeting_link"
                  type="url"
                  value={formData.meeting_link}
                  onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                  disabled={isSubmitting}
                />
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
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 ml-2" />
                        إنشاء المجموعة
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

