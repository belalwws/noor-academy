'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen, X, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { logger } from '@/lib/utils/logger';
import { toast } from 'sonner';
import ErrorModal from './ErrorModal';
import { Spinner } from '@/components/ui/spinner';
import { motion } from 'framer-motion';

interface CourseEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    course_type: string;
  };
  onSuccess?: () => void;
}

export default function CourseEnrollmentModal({
  isOpen,
  onClose,
  course,
  onSuccess
}: CourseEnrollmentModalProps) {
  logger.debug('CourseEnrollmentModal rendered', { isOpen, course, onClose, onSuccess });
  
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    title: string;
    message: string;
    details?: string[];
  } | null>(null);

  const showErrorModalWithDetails = (title: string, message: string, details?: string[]) => {
    setErrorDetails({ title, message, details });
    setShowErrorModal(true);
  };

  const handleSubmit = async () => {
    if (!course) {
      toast.error('لم يتم تحديد الدورة');
      return;
    }

    if (!course.id) {
      toast.error('معرف الدورة غير صحيح');
      return;
    }

    logger.debug('Submitting enrollment', { course });
    setIsSubmitting(true);
    
    try {
      const enrollmentData = {
        course: course.id,
        notes: notes.trim() || 'تسجيل في الدورة'
      };
      
      logger.debug('Sending enrollment data', { enrollmentData });
      
      const response = await apiClient.post('/live-education/enrollments/', enrollmentData);

      if (response.success) {
        toast.success('تم إرسال طلب التسجيل بنجاح! 🎉', {
          duration: 5000,
          description: 'ستتلقى إشعاراً عند الموافقة على التسجيل.'
        });
        setNotes('');
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = response.error || response.data;
        logger.error('Enrollment failed', { error: errorData, status: response.status });

        if (response.status === 400) {
          if (errorData.detail?.includes('already enrolled') || 
              errorData.course?.some((msg: string) => msg.includes('already enrolled'))) {
            showErrorModalWithDetails(
              'مسجل بالفعل',
              'أنت مسجل بالفعل في هذه الدورة.',
              ['يمكنك مراجعة دوراتك من صفحة "دوراتي"', 'أو التواصل مع المعلم للمزيد من المعلومات']
            );
            // تحديث حالة التسجيل
            if (onSuccess) {
              onSuccess();
            }
          } else {
            const details: string[] = [];
            if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
              details.push(...errorData.non_field_errors);
            }
            if (errorData.notes && errorData.notes.length > 0) {
              details.push(`ملاحظات: ${errorData.notes.join(', ')}`);
            }
            if (errorData.course && errorData.course.length > 0) {
              details.push(`الدورة: ${errorData.course.join(', ')}`);
            }
            
            showErrorModalWithDetails(
              'خطأ في البيانات',
              'يرجى التحقق من البيانات المدخلة والمحاولة مرة أخرى.',
              details.length > 0 ? details : undefined
            );
          }
        } else if (response.status === 401) {
          showErrorModalWithDetails(
            'غير مصرح لك',
            'يرجى تسجيل الدخول أولاً.',
            ['سيتم توجيهك لصفحة تسجيل الدخول']
          );
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        } else if (response.status === 403) {
          showErrorModalWithDetails(
            'غير مصرح لك',
            'ليس لديك صلاحية للتسجيل في هذه الدورة.',
            ['تأكد من أنك طالب مسجل في النظام', 'أو تواصل مع الإدارة للمساعدة']
          );
        } else if (response.status === 404) {
          showErrorModalWithDetails(
            'الدورة غير موجودة',
            'الدورة المطلوبة غير موجودة أو تم حذفها.',
            ['تأكد من صحة رابط الدورة', 'أو ابحث عن دورة أخرى']
          );
        } else {
          showErrorModalWithDetails(
            'خطأ غير متوقع',
            'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
            ['تأكد من اتصالك بالإنترنت', 'أو تواصل مع الدعم الفني']
          );
        }
      }
    } catch (error: any) {
      logger.error('Error enrolling', { error });
      toast.error('حدث خطأ في الاتصال بالخادم', { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNotes('');
      onClose();
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-2xl -m-6 p-6">
          {/* Animated Background Circles */}
          <motion.div 
            className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-blue-400/20 rounded-full blur-3xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-blue-400/20 rounded-full blur-2xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
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
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1
                  }}
                >
            <BookOpen className="w-8 h-8 text-white" />
                </motion.div>
                <DialogTitle className="text-2xl font-bold text-blue-800 mb-2">
                  التسجيل في الدورة
          </DialogTitle>
                <DialogDescription className="text-gray-600 text-base leading-relaxed">
            اكتب ملاحظاتك لتساعد المعلم في فهم احتياجاتك التعليمية
          </DialogDescription>
        </DialogHeader>
            </motion.div>
            
            <motion.div 
              className="space-y-6 py-4 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
          {/* Course Info */}
              <motion.div 
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
            <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                    <h3 className="font-bold text-blue-800 text-lg mb-1">{course.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {course.course_type}
                      </span>
              </div>
            </div>
          </div>
              </motion.div>

          {/* Notes Input */}
          <div className="space-y-3">
                <Label htmlFor="notes" className="text-right text-blue-800 font-semibold text-base flex items-center gap-2">
                  <span>ملاحظات التسجيل</span>
                  <span className="text-xs text-gray-500 font-normal">(اختياري)</span>
            </Label>
            <div className="relative">
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اكتب ملاحظاتك حول سبب رغبتك في التسجيل في هذه الدورة..."
                    className="min-h-[140px] text-right resize-none border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl p-4 text-base transition-all duration-200 bg-white/80 backdrop-blur-sm"
                disabled={isSubmitting}
              />
            </div>
                <p className="text-sm text-gray-600 text-right leading-relaxed flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>هذه الملاحظات ستساعد المعلم في فهم احتياجاتك التعليمية وتخصيص المحتوى لك</span>
            </p>
          </div>

          {/* Action Buttons */}
              <motion.div 
                className="flex gap-4 justify-end pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isSubmitting}
                  className="border-2 border-blue-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              <X className="w-5 h-5 ml-2" />
              إلغاء
            </Button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="md" className="ml-2" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 ml-2" />
                  إرسال الطلب
                </>
              )}
            </Button>
                </motion.div>
              </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Error Modal */}
    {errorDetails && (
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorDetails.title}
        message={errorDetails.message}
        details={errorDetails.details}
      />
    )}
  </>
  );
}
