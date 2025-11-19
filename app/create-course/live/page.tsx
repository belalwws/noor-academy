'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, CheckCircle, BookOpen, FileText, Layers, Eye } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getAuthToken } from '@/lib/auth';

// Components
import { StepIndicator } from '../form/components/StepIndicator';
import { Step1BasicInfo } from '../form/components/Step1BasicInfo';
import { Step2LearningDetails } from '../form/components/Step2LearningDetails';
import { Step3Units } from '../form/components/Step3Units';
import { Step4Lessons } from '../form/components/Step4Lessons';
import { Step5Review } from '../form/components/Step5Review';
import type { CourseFormData } from '../form/types';

// Constants for Live Courses
const STEPS = [
  { id: 1, title: 'المعلومات الأساسية', icon: BookOpen },
  { id: 2, title: 'مخرجات التعلم', icon: FileText },
  { id: 3, title: 'الوحدات', icon: Layers },
  { id: 4, title: 'الدروس', icon: FileText },
  { id: 5, title: 'المراجعة', icon: Eye },
];

export default function CreateLiveCourseForm() {
  return (
    <ProtectedRoute allowedRoles={['teacher', 'general_supervisor', 'academic_supervisor']}>
      <CreateLiveCourseFormContent />
    </ProtectedRoute>
  );
}

function CreateLiveCourseFormContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    accepting_applications: true,
    thumbnail: null,
    thumbnailPreview: '',
    cover_image: null,
    coverImagePreview: '',
    learning_outcomes: '',
    topics: '',
    intro_session_id: '',
    units: [],
    lessons: [],
  });

  const updateFormData = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title || !formData.description || !formData.start_date || !formData.end_date) {
          toast.error('يرجى ملء جميع الحقول المطلوبة');
          return false;
        }
        if (new Date(formData.end_date) < new Date(formData.start_date)) {
          toast.error('تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.learning_outcomes || !formData.topics) {
          toast.error('يرجى ملء مخرجات التعلم والمواضيع');
          return false;
        }
        return true;
      
      case 3:
        if (formData.units.length === 0) {
          toast.error('يرجى إضافة وحدة واحدة على الأقل');
          return false;
        }
        const emptyUnit = formData.units.find(u => !u.title || !u.description);
        if (emptyUnit) {
          toast.error('يرجى ملء عنوان ووصف جميع الوحدات');
          return false;
        }
        return true;
      
      case 4:
        if (formData.lessons.length === 0) {
          toast.error('يرجى إضافة درس واحد على الأقل');
          return false;
        }
        const emptyLesson = formData.lessons.find(l => !l.title || !l.description);
        if (emptyLesson) {
          toast.error('يرجى ملء عنوان ووصف جميع الدروس');
          return false;
        }
        return true;
      
      case 5:
        // Review step - no validation needed
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Validate all steps
    for (let step = 1; step <= STEPS.length; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
      return;
      }
    }

    try {
      setIsSubmitting(true);
      const token = await getAuthToken();

      // Step 1: Create Live Course
      toast.info('جاري إنشاء الدورة...');
      
      const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

      // Convert learning_outcomes and topics from text to arrays
      const learningOutcomesArray = formData.learning_outcomes
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      const topicsArray = formData.topics
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const coursePayload: any = {
        title: formData.title,
        description: formData.description,
        learning_outcomes: learningOutcomesArray,
        topics: topicsArray,
        start_date: formData.start_date,
        end_date: formData.end_date,
        accepting_applications: formData.accepting_applications,
      };

      // Add optional fields (excluding images - they need to be uploaded via FormData later)
      if (formData.intro_session_id && formData.intro_session_id.trim()) {
        coursePayload.intro_session_id = formData.intro_session_id;
      }
      
      // Note: thumbnail and cover_image are optional and should be uploaded via FormData later
      // For now, we skip them and allow users to add them later via course update

      console.log('📤 Sending live course payload:', coursePayload);

      const courseResponse = await fetch(`${API_BASE_URL}/live-courses/courses/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coursePayload),
      });

      if (!courseResponse.ok) {
        const errorData = await courseResponse.json().catch(() => ({}));
        console.error('❌ Live course creation failed:', errorData);
        
        let errorMessage = 'فشل إنشاء الدورة';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      }

      const courseData = await courseResponse.json();
      
      console.log('✅ Course created successfully:', courseData);
      console.log('📌 Course response keys:', Object.keys(courseData));
      console.log('📌 Full course data:', JSON.stringify(courseData, null, 2));
      
      // Try different ID field names
      let courseId = courseData.id || courseData.pk || courseData.course_id || courseData.uuid;
      
      // If no ID in response, try to fetch it by title (last created course)
      if (!courseId) {
        console.log('⚠️ No ID in response, fetching course list to find ID...');
        try {
          const listResponse = await fetch(`${API_BASE_URL}/live-courses/courses/?ordering=-id&limit=1`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (listResponse.ok) {
            const listData = await listResponse.json();
            if (listData.results && listData.results.length > 0) {
              courseId = listData.results[0].id;
              console.log('✅ Found course ID from list:', courseId);
            }
          }
        } catch (error) {
          console.error('❌ Failed to fetch course list:', error);
        }
      }
      
      console.log('📌 Final Course ID:', courseId);
      console.log('📌 Course ID type:', typeof courseId);
      console.log('📌 Course ID is:', courseId ? 'exists' : 'NULL/UNDEFINED');

      if (!courseId) {
        throw new Error('❌ Course ID not found - please check the API response format');
      }

      // Step 2: Create Units
      toast.info('جاري إنشاء الوحدات...');
      const createdUnits: { [key: string]: string } = {};
      
      for (const unit of formData.units) {
        const unitPayload = {
          course: courseId,
          title: unit.title,
          description: unit.description,
          order: unit.order,
        };
        
        console.log('📤 Creating unit with payload:', unitPayload);

        const unitResponse = await fetch(`${API_BASE_URL}/content/units/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(unitPayload),
        });

        if (unitResponse.ok) {
          const unitData = await unitResponse.json();
          console.log('✅ Unit created successfully:', unitData);
          console.log('📌 Unit response keys:', Object.keys(unitData));
          
          // Try to get ID from response
          let unitId = unitData.id || unitData.pk || unitData.unit_id || unitData.uuid;
          
          // If no ID, fetch the unit list to find the newly created unit
          if (!unitId) {
            console.log('⚠️ No ID in unit response, fetching unit list to find ID...');
            try {
              const unitsListResponse = await fetch(
                `${API_BASE_URL}/content/units/?course=${courseId}&ordering=-id&limit=1`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );
              
              if (unitsListResponse.ok) {
                const unitsList = await unitsListResponse.json();
                if (unitsList.results && unitsList.results.length > 0) {
                  unitId = unitsList.results[0].id;
                  console.log('✅ Found unit ID from list:', unitId);
                }
              }
            } catch (error) {
              console.error('❌ Failed to fetch units list:', error);
            }
          }
          
          if (unitId) {
            createdUnits[unit.id] = unitId;
            console.log('📌 Stored unit ID:', unitId, 'for key:', unit.id);
          } else {
            console.warn('⚠️ Unit created but no ID found:', unitData);
          }
        } else {
          const errorData = await unitResponse.json().catch(() => ({}));
          console.error('❌ Failed to create unit:', unit.title);
          console.error('Status:', unitResponse.status);
          console.error('Full error details:', JSON.stringify(errorData, null, 2));
          toast.error(`فشل في إنشاء الوحدة: ${unit.title} - ${JSON.stringify(errorData)}`);
        }
      }

      // Step 3: Create Lessons
      toast.info('جاري إنشاء الدروس...');
      for (const lesson of formData.lessons) {
        const unitId = createdUnits[lesson.unitId];
        if (!unitId) {
          console.error('Unit ID not found for lesson:', lesson.title);
          continue;
        }

        const lessonPayload = {
          unit: unitId,
          title: lesson.title,
          description: lesson.description,
          learning_outcomes: lesson.learning_outcomes,
          order: lesson.order,
        };

        console.log('📤 Creating lesson with payload:', lessonPayload);

        const lessonResponse = await fetch(`${API_BASE_URL}/content/lessons/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lessonPayload),
        });

        if (lessonResponse.ok) {
          const lessonData = await lessonResponse.json();
          console.log('✅ Lesson created successfully:', lessonData);
          console.log('📌 Lesson response keys:', Object.keys(lessonData));
          
          // Try to get ID from response
          let lessonId = lessonData.id || lessonData.pk || lessonData.lesson_id || lessonData.uuid;
          
          // If no ID, fetch the lessons list to find the newly created lesson
          if (!lessonId) {
            console.log('⚠️ No ID in lesson response, fetching lessons list to find ID...');
            try {
              const lessonsListResponse = await fetch(
                `${API_BASE_URL}/content/lessons/?unit=${unitId}&ordering=-id&limit=1`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );
              
              if (lessonsListResponse.ok) {
                const lessonsList = await lessonsListResponse.json();
                if (lessonsList.results && lessonsList.results.length > 0) {
                  lessonId = lessonsList.results[0].id;
                  console.log('✅ Found lesson ID from list:', lessonId);
                }
              }
            } catch (error) {
              console.error('❌ Failed to fetch lessons list:', error);
            }
          }
          
          if (lessonId) {
            console.log('📌 Lesson ID:', lessonId);
          } else {
            console.warn('⚠️ Lesson created but no ID found:', lessonData);
          }
        } else {
          const errorData = await lessonResponse.json().catch(() => ({}));
          console.error('❌ Failed to create lesson:', lesson.title);
          console.error('Status:', lessonResponse.status);
          console.error('Full error details:', JSON.stringify(errorData, null, 2));
          toast.error(`فشل في إنشاء الدرس: ${lesson.title} - ${JSON.stringify(errorData)}`);
        }
      }

      toast.success('🎉 تم إنشاء الدورة المباشرة بنجاح!');
      
      setTimeout(() => {
        router.push('/dashboard/teacher');
      }, 1500);

    } catch (error: any) {
      console.error('Error creating live course:', error);
      toast.error(error.message || 'حدث خطأ أثناء إنشاء الدورة');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl"
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
            إنشاء دورة مباشرة جديدة
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            اتبع الخطوات لإنشاء دورتك المباشرة بسهولة واحترافية
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
                {currentStep === 1 && <Step1BasicInfo formData={formData} updateFormData={updateFormData} courseType="live" />}
                {currentStep === 2 && <Step2LearningDetails formData={formData} updateFormData={updateFormData} courseType="live" />}
                {currentStep === 3 && <Step3Units formData={formData} updateFormData={updateFormData} courseType="live" />}
                {currentStep === 4 && <Step4Lessons formData={formData} updateFormData={updateFormData} courseType="live" />}
                {currentStep === 5 && (
                  <Step5Review 
                    formData={formData}
                    courseType="live"
                  />
                )}

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
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 gap-2"
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








