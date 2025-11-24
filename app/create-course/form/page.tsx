'use client';

import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, CheckCircle, BookOpen, FileText, Layers, Eye } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

// Hooks
import { useCourseForm } from './hooks/useCourseForm';

// Components
import { StepIndicator } from './components/StepIndicator';
import { Step1BasicInfo } from './components/Step1BasicInfo';
import { Step2LearningDetails } from './components/Step2LearningDetails';
import { Step3Units } from './components/Step3Units';
import { Step4Lessons } from './components/Step4Lessons';
import { Step5Review } from './components/Step5Review';

// Constants
const STEPS = [
  { id: 1, title: 'المعلومات الأساسية', icon: BookOpen },
  { id: 2, title: 'مخرجات التعلم', icon: FileText },
  { id: 3, title: 'الوحدات', icon: Layers },
  { id: 4, title: 'الدروس', icon: FileText },
  { id: 5, title: 'المراجعة', icon: Eye },
];

export default function CreateLiveCourseForm() {
  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
        <CreateLiveCourseFormContent />
      </Suspense>
    </ProtectedRoute>
  );
}

function CreateLiveCourseFormContent() {
  const {
    currentStep,
    formData,
    isSubmitting,
    updateFormData,
    handleNext,
    handlePrevious,
    handleSubmit,
    courseType,
  } = useCourseForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 pb-12 px-4" dir="rtl">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-blue-200/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {courseType === 'recorded' ? 'إنشاء دورة مسجلة جديدة' : 'إنشاء دورة مباشرة جديدة'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            اتبع الخطوات لإنشاء دورتك بسهولة واحترافية
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </motion.div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl border-0">
              <CardContent className="p-6 md:p-8">
                {/* Render Current Step */}
                {currentStep === 1 && <Step1BasicInfo formData={formData} updateFormData={updateFormData} courseType={courseType} />}
                {currentStep === 2 && <Step2LearningDetails formData={formData} updateFormData={updateFormData} courseType={courseType} />}
                {currentStep === 3 && <Step3Units formData={formData} updateFormData={updateFormData} courseType={courseType} />}
                {currentStep === 4 && <Step4Lessons formData={formData} updateFormData={updateFormData} courseType={courseType} />}
                {currentStep === 5 && <Step5Review key={`review-${formData.lessons.map(l => `${l.id}-${l.videoUploaded || false}-${l.bunnyVideoId || 'none'}`).join('-')}`} formData={formData} courseType={courseType} />}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    السابق
                  </Button>

                  {currentStep < STEPS.length ? (
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 gap-2"
                    >
                      التالي
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner className="w-4 h-4" />
                          جاري الإنشاء...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          إنشاء الدورة
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
