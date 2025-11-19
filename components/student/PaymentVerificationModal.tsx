'use client';

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileImage, Users, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import liveEducationApi from '@/lib/api/live-education';
import type { Enrollment } from '@/lib/types/live-education';

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: Enrollment;
  onSuccess: () => void;
}

export default function PaymentVerificationModal({
  isOpen,
  onClose,
  enrollment,
  onSuccess
}: PaymentVerificationModalProps) {
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [educationType, setEducationType] = useState<'individual' | 'group'>('group');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار صورة');
        return;
      }

      setReceiptImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setReceiptImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiptImage) {
      toast.error('يرجى رفع صورة الإيصال');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await liveEducationApi.enrollments.verifyPayment(enrollment.id, {
        receipt_image: receiptImage,
        education_type: educationType,
        notes: notes.trim() || undefined
      });

      if (response.ok) {
        toast.success('تم رفع إيصال الدفع بنجاح! 🎉', {
          description: 'سيتم مراجعته من قبل المشرف الأكاديمي قريباً'
        });
        onSuccess();
        onClose();
        // Reset form
        handleRemoveImage();
        setEducationType('group');
        setNotes('');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'حدث خطأ في رفع الإيصال');
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        <div className="relative bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-2xl -m-6 p-6">
          {/* Animated Background */}
          <motion.div 
            className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-3xl"
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
                className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Upload className="w-8 h-8 text-white" />
              </motion.div>
              <DialogTitle className="text-2xl font-bold text-orange-800">
                توثيق الدفع
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                قم برفع إيصال الدفع واختيار نوع التعليم المناسب
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              
              {/* Upload Receipt */}
              <div className="space-y-3">
                <Label className="text-orange-800 font-semibold">
                  إيصال الدفع *
                </Label>
                
                {!imagePreview ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center hover:border-orange-500 hover:bg-orange-50/50 transition-all cursor-pointer"
                  >
                    <FileImage className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      انقر لرفع صورة الإيصال
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG أو JPEG (حجم أقصى 5 ميجابايت)
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Receipt preview" 
                      className="w-full rounded-xl border-2 border-orange-200"
                    />
                    <Button
                      type="button"
                      onClick={handleRemoveImage}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Education Type */}
              <div className="space-y-3">
                <Label htmlFor="education_type" className="text-orange-800 font-semibold">
                  نوع التعليم *
                </Label>
                <Select
                  value={educationType}
                  onValueChange={(value: 'individual' | 'group') => setEducationType(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="border-2 border-orange-200 focus:border-orange-500 rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium">تعليم فردي</div>
                          <div className="text-xs text-gray-500">خاص بطالب واحد</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="group">
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-medium">تعليم جماعي</div>
                          <div className="text-xs text-gray-500">مجموعة من الطلاب</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-orange-800 font-semibold">
                  ملاحظات (اختياري)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات أو تفاصيل إضافية..."
                  rows={3}
                  className="border-2 border-orange-200 focus:border-orange-500 rounded-xl resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Info Box */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm text-amber-800 leading-relaxed">
                  <CheckCircle className="w-4 h-4 inline ml-2" />
                  سيتم مراجعة إيصال الدفع من قبل المشرف الأكاديمي. بعد الموافقة، ستتمكن من إرسال طلب انضمام للمعلم.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex-1 border-2 border-orange-200 text-gray-700 hover:bg-orange-50 rounded-xl"
                >
                  <X className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={!receiptImage || isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 ml-2" />
                        رفع الإيصال
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

