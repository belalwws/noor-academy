'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, Sparkles, CheckCircle2, Rocket, X } from 'lucide-react';

interface RegisterPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
}

export default function RegisterPromptModal({
  isOpen,
  onClose,
  courseTitle,
}: RegisterPromptModalProps) {
  const router = useRouter();

  // Debug: Log when modal state changes
  useEffect(() => {
    console.log('🔔 RegisterPromptModal - isOpen changed:', isOpen);
    if (isOpen) {
      console.log('✅ Modal should be visible now');
    }
  }, [isOpen]);

  const handleRegister = () => {
    console.log('📝 User clicked register button');
    router.push('/register');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[900px] max-h-[600px] overflow-y-auto bg-transparent border-0 shadow-none p-0 [&>button]:hidden">
        <div className="relative bg-gradient-to-br from-orange-50 via-yellow-50/50 to-orange-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 hover:bg-white dark:hover:bg-slate-700"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5 text-gray-700 dark:text-slate-300" />
          </button>
          {/* Animated Background Elements */}
          <motion.div 
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/30 to-yellow-400/30 rounded-full blur-3xl"
            initial={{ scale: 0, opacity: 0, x: 100, y: -100 }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-yellow-400/30 to-orange-400/30 rounded-full blur-3xl"
            initial={{ scale: 0, opacity: 0, x: -100, y: 100 }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          />

          <div className="relative z-10 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Right Side - Content */}
              <div className="order-2 md:order-1 text-right flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-3"
                >
                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 dark:from-orange-400 dark:to-yellow-400 bg-clip-text text-transparent">
                    خطوة واحدة تفصلك عن التعليم
                  </h2>
                  
                  {/* Course Title Section */}
                  {courseTitle && (
                    <div className="space-y-1">
                      <p className="font-semibold text-orange-600 dark:text-orange-400 text-lg md:text-xl">
                        أنت على وشك الانضمام إلى:
                      </p>
                      <p className="text-gray-900 dark:text-slate-100 font-medium text-base md:text-lg">
                        {courseTitle}
                      </p>
                    </div>
                  )}

                  {/* Benefits List - Compact */}
                  <div className="space-y-1.5 pt-2" dir="rtl">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 text-right">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                    <span className="text-sm md:text-base">إنشاء حساب سريع وسهل - دقيقة واحدة فقط</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 text-right">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                    <span className="text-sm md:text-base">ابدأ التعلم فوراً بعد التسجيل</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 text-right">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                    <span className="text-sm md:text-base">الوصول إلى جميع الدورات والمواد التعليمية</span>
                  </div>
                  </div>

                  {/* Buttons */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col gap-3 pt-4"
                  >
                    <Button
                      onClick={handleRegister}
                      className="w-full bg-gradient-to-r from-orange-500 via-orange-500 to-yellow-500 hover:from-orange-600 hover:via-orange-600 hover:to-yellow-600 text-white py-5 md:py-6 text-base md:text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] rounded-xl"
                    >
                      <Rocket className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                      <span>سجل الآن وابدأ التعلم</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    </Button>
                    
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 py-3 md:py-4 rounded-xl font-medium transition-all text-sm md:text-base"
                  >
                    لاحقاً
                  </Button>
                  </motion.div>
                </motion.div>
              </div>

              {/* Left Side - Image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="order-1 md:order-2 flex items-center justify-center"
              >
                <div className="relative w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <img 
                    src="/signin.png" 
                    alt="التسجيل في المنصة" 
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.style.display = 'none';
                      const fallback = img.parentElement?.querySelector('.image-fallback') as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  <div className="image-fallback hidden w-full h-[300px] bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="w-16 h-16 text-orange-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">الصورة غير متاحة</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

