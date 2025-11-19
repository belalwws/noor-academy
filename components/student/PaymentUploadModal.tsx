'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Lottie from 'lottie-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import liveEducationApi from '@/lib/api/live-education';

interface PaymentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onSuccess?: () => void;
}

export default function PaymentUploadModal({
  isOpen,
  onClose,
  courseId,
  onSuccess
}: PaymentUploadModalProps) {
  const [learningType, setLearningType] = useState<'individual' | 'group'>('group');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [studentNotes, setStudentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lottieData, setLottieData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Lottie animation data
  useEffect(() => {
    fetch('/register-sucuess.json')
      .then((res) => res.json())
      .then((data) => setLottieData(data))
      .catch((err) => console.error('Failed to load Lottie animation:', err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار ملف صورة');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      setReceiptFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!receiptFile) {
      toast.error('يرجى اختيار إيصال الدفع');
      return;
    }

    try {
      setIsSubmitting(true);

      console.log('📤 Uploading payment receipt:', {
        courseId,
        learningType,
        notes: studentNotes
      });

      // For testing: Use a placeholder URL
      // TODO: In production, upload to proper storage (Cloudinary, S3, etc.)
      const receiptUrl = `https://via.placeholder.com/600x800.png?text=Receipt+${Date.now()}`;
      
      console.log('✅ Using placeholder receipt URL:', receiptUrl);
      
      // Send application data to backend with the receipt URL
      toast.info('🔄 جاري حفظ البيانات...');
      
      const token = localStorage.getItem('access_token');
      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'https://lisan-alhekma.onrender.com/api';
      
      // Use the new applications endpoint which accepts receipt_url
      const applicationData = {
        course: courseId,
        receipt_url: receiptUrl,
        student_notes: studentNotes || ''
      };
      
      console.log('📦 Application data to send:', applicationData);
      console.log('📦 Course ID:', courseId);
      console.log('📦 Receipt URL:', receiptUrl);
      console.log('📦 Student Notes:', studentNotes);
      console.log('🌐 API URL:', `${apiUrl}/live-courses/applications/`);
      console.log('🔑 Token exists:', !!token);
      
      const response = await fetch(`${apiUrl}/live-courses/applications/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData),
        credentials: 'include',
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const successData = await response.json();
        console.log('✅ Success response:', successData);
        
        // Show success modal instead of closing immediately
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error uploading payment (status ' + response.status + '):', errorData);
        console.error('📋 Full error details:', JSON.stringify(errorData, null, 2));
        console.error('📋 Request details:', {
          courseId,
          learningType,
          hasFile: !!receiptFile,
          fileName: receiptFile?.name
        });
        
        // Display detailed error message
        let errorMessage = 'حدث خطأ في رفع الإيصال';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'object') {
          // Show field-specific errors
          const errors = Object.entries(errorData).map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}: ${value.join(', ')}`;
            }
            return `${key}: ${value}`;
          }).join('\n');
          errorMessage = errors || errorMessage;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error uploading payment:', error);
      toast.error('حدث خطأ في رفع الإيصال. يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setStudentNotes('');
    setLearningType('group');
    setShowSuccessModal(false);
    onClose();
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onSuccess?.();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Success Modal */}
      {showSuccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-orange-200 dark:border-orange-800"
          >
            {/* Success Content */}
            <div className="p-8 text-center">
              {/* Lottie Animation */}
              {lottieData && (
                <div className="w-48 h-48 mx-auto mb-6">
                  <Lottie
                    animationData={lottieData}
                    loop={true}
                    autoplay={true}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              )}
              
              {/* Success Icon (fallback if Lottie fails) */}
              {!lottieData && (
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              )}

              {/* Success Message */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">
                تم رفع الإيصال بنجاح! 🎉
              </h2>
              <p className="text-gray-600 dark:text-slate-300 mb-6 leading-relaxed">
                سيتم مراجعة إيصال الدفع من قبل المشرف الأكاديمي خلال 24-48 ساعة
              </p>

              {/* Action Button */}
              <Button
                onClick={handleSuccessModalClose}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 dark:from-orange-600 dark:to-amber-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-colors"
                style={{ transform: 'none' }}
              >
                <CheckCircle className="w-5 h-5 ml-2" />
                تم
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Main Upload Modal */}
      {!showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-24 bg-black/60 dark:bg-black/80 backdrop-blur-sm" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-orange-200 dark:border-orange-800"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 p-4 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">رفع إيصال الدفع</h2>
                  <p className="text-orange-100 dark:text-orange-200 text-xs">ارفع إيصال الدفع للمراجعة</p>
                </div>
              </div>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-xl"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
            {/* Learning Type */}
            <div className="space-y-2">
              <Label htmlFor="learning-type" className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                نوع التعليم المفضل <span className="text-red-500">*</span>
              </Label>
              <Select value={learningType} onValueChange={(value) => setLearningType(value as 'individual' | 'group')}>
                <SelectTrigger className="w-full border-2 border-gray-200 dark:border-slate-600 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl h-11 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <SelectItem value="group" className="text-gray-900 dark:text-slate-100">تعليم جماعي 👥</SelectItem>
                  <SelectItem value="individual" className="text-gray-900 dark:text-slate-100">تعليم فردي 👤</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                اختر نوع التعليم الذي تفضله (يمكنك تغييره لاحقاً مع المعلم)
              </p>
            </div>

            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label htmlFor="receipt" className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                إيصال الدفع <span className="text-red-500">*</span>
              </Label>

              {!receiptPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-colors"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-slate-100 font-semibold mb-1 text-sm">
                        اضغط لاختيار صورة الإيصال
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        PNG, JPG, GIF (حجم أقصى: 5 ميجابايت)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border-2 border-orange-300 dark:border-orange-700">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="w-full h-48 object-contain bg-gray-50 dark:bg-slate-900"
                  />
                  <Button
                    onClick={() => {
                      setReceiptFile(null);
                      setReceiptPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    إزالة
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

            {/* Student Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                ملاحظات (اختياري)
              </Label>
              <Textarea
                id="notes"
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="أضف أي ملاحظات أو تفاصيل إضافية..."
                className="min-h-[80px] border-2 border-gray-200 dark:border-slate-600 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-400"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400">
                مثلاً: "دفعت عن طريق فودافون كاش" أو "التحويل من حساب والدي"
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-orange-800 dark:text-orange-200">
                  <p className="font-semibold mb-1">ملاحظة هامة</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>سيتم مراجعة الإيصال من قبل المشرف الأكاديمي</li>
                    <li>قد تستغرق عملية المراجعة من 24-48 ساعة</li>
                    <li>ستتلقى إشعاراً عند الموافقة أو الرفض</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-slate-900 p-4 flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 h-11 rounded-xl border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              disabled={isSubmitting}
              style={{ transform: 'none' }}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!receiptFile || isSubmitting}
              className="flex-1 h-11 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl font-bold transition-colors"
              style={{ transform: 'none' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 ml-2" />
                  رفع الإيصال
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}

