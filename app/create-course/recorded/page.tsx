'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, CheckCircle, BookOpen, FileText, Layers, Eye, DollarSign } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { recordedCoursesApi } from '@/lib/api/recorded-courses';
import { getAuthToken } from '@/lib/auth';

// Components
import { StepIndicator } from '../form/components/StepIndicator';
import { Step1BasicInfo } from '../form/components/Step1BasicInfo';
import { Step2LearningDetails } from '../form/components/Step2LearningDetails';
import { Step3Pricing } from '../form/components/Step3Pricing';
import { Step3Units } from '../form/components/Step3Units';
import { Step4Lessons } from '../form/components/Step4Lessons';
import { Step5Review } from '../form/components/Step5Review';
import type { CourseFormData } from '../form/types';

// Constants for Recorded Courses
const STEPS = [
  { id: 1, title: 'المعلومات الأساسية', icon: BookOpen },
  { id: 2, title: 'مخرجات التعلم', icon: FileText },
  { id: 3, title: 'التسعير', icon: DollarSign },
  { id: 4, title: 'الوحدات', icon: Layers },
  { id: 5, title: 'الدروس', icon: FileText },
  { id: 6, title: 'المراجعة', icon: Eye },
];

export default function CreateRecordedCourseForm() {
  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <CreateRecordedCourseFormContent />
    </ProtectedRoute>
  );
}

function CreateRecordedCourseFormContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    accepting_applications: true,
    price: '',
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
    console.log('📝 updateFormData called:', { field, valueType: typeof value, isArray: Array.isArray(value) });
    
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // CRITICAL: Deep clone lessons array to ensure React detects changes
      if (field === 'lessons' && Array.isArray(value)) {
        updated.lessons = value.map((lesson: any) => ({ ...lesson }));
        console.log('📝 Updated lessons (deep cloned) - FULL DATA:', updated.lessons.map((l: any) => ({
          id: l.id,
          title: l.title,
          videoUploaded: l.videoUploaded,
          bunnyVideoId: l.bunnyVideoId,
          videoUploadUrl: l.videoUploadUrl,
          apiId: l.apiId,
          videoFileName: l.videoFileName,
          allKeys: Object.keys(l)
        })));
      }
      
      console.log('📝 Updated formData:', { field, lessonsCount: updated.lessons?.length });
      return updated;
    });
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
        // Pricing validation - required for recorded courses
        if (!formData.price || parseFloat(formData.price) <= 0) {
          toast.error('يرجى إدخال سعر صحيح للدورة');
          return false;
        }
        return true;
      
      case 4:
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
      
      case 5:
        // For recorded courses, lessons are optional during creation
        // Videos can be uploaded later, but if lessons exist, they should have videos
        if (formData.lessons.length > 0) {
          const emptyLesson = formData.lessons.find(l => !l.title || !l.description);
          if (emptyLesson) {
            toast.error('يرجى ملء عنوان ووصف جميع الدروس');
            return false;
          }
          
          // Check if there are lessons without videos (warning, not blocking)
          const lessonsWithoutVideos = formData.lessons.filter(l => !l.videoUploaded);
          if (lessonsWithoutVideos.length > 0) {
            // Allow submission but show warning
            console.log(`⚠️ Warning: ${lessonsWithoutVideos.length} lessons without videos`);
          }
        }
        return true;
      
      case 6:
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
    // Validate all steps before submission
    for (let step = 1; step <= STEPS.length; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Step 1: Check if course is already created (from previous steps)
      // If courseId exists in localStorage, use it
      let courseId = localStorage.getItem('currentRecordedCourseId');
      
      // Step 2: Create Recorded Course (if not already created)
      if (!courseId) {
        toast.info('جاري إنشاء الدورة المسجلة...');
      
      const coursePayload: any = {
        title: formData.title,
        description: formData.description,
        learning_outcomes: formData.learning_outcomes,
        topics: formData.topics,
        start_date: formData.start_date,
        end_date: formData.end_date,
        accepting_applications: formData.accepting_applications,
        price: formData.price,
      };

      // Add optional fields (excluding images - they need to be uploaded via FormData)
      if (formData.intro_session_id && formData.intro_session_id.trim()) {
        coursePayload.intro_session_id = formData.intro_session_id;
      }
      
      // Note: thumbnail and cover_image are optional and should be uploaded via FormData
      // For now, we skip them and allow users to add them later via course update

        console.log('📤 Sending recorded course payload:', coursePayload);

        const courseData = await recordedCoursesApi.create(coursePayload);
        console.log('📋 Course data received:', courseData);
        console.log('📋 Course data type:', typeof courseData);
        console.log('📋 Course data keys:', courseData ? Object.keys(courseData) : 'No data');
        
        // Try to get ID from various possible locations
        courseId = courseData?.id;
        
        // If id is not directly available, check if it's nested or has a different structure
        if (!courseId && courseData) {
          // Check if id exists but might be in a different format
          if ((courseData as any).data?.id) {
            courseId = (courseData as any).data.id;
          } else if ((courseData as any).course?.id) {
            courseId = (courseData as any).course.id;
          }
        }
        
        if (!courseId) {
          console.error('❌ Course created but no ID found in response:', courseData);
          console.error('❌ Full response object:', JSON.stringify(courseData, null, 2));
          toast.error('تم إنشاء الدورة لكن لم يتم إرجاع المعرف. سيتم إعادة تحميل الصفحة...');
          // Reload the page to show the newly created course
          setTimeout(() => {
            router.push('/dashboard/teacher');
          }, 2000);
          return;
        }
        
        console.log('✅ Course ID found:', courseId);
        
        // Save courseId to localStorage for Step3Units and Step4Lessons
        localStorage.setItem('currentRecordedCourseId', courseId);
        
        // Trigger a custom event to notify Step3Units and Step4Lessons about the new courseId
        window.dispatchEvent(new CustomEvent('recordedCourseCreated', { detail: { courseId } }));
        
        toast.success('✅ تم إنشاء الدورة المسجلة بنجاح');
      } else {
        console.log('✅ Course already exists, using existing courseId:', courseId);
        toast.info('جاري حفظ الوحدات والدروس...');
      }

      // Step 3: Create units in database
      // Units might have been created already in Step3Units (if user saved them)
      // So we only create units that don't have an apiId
      const unitsToCreate = formData.units.filter(unit => !unit.apiId);
      const unitsAlreadyCreated = formData.units.filter(unit => unit.apiId);
      
      console.log(`📊 Units status: ${unitsAlreadyCreated.length} already created, ${unitsToCreate.length} to create`);
      
      // Keep track of created units with their API IDs (for immediate use)
      const unitsMap = new Map<string, string>(); // Map<unitId, apiId>
      
      // Add already created units to the map
      unitsAlreadyCreated.forEach(u => {
        if (u.apiId) {
          unitsMap.set(u.id, u.apiId);
        }
      });
      
      if (unitsToCreate.length > 0) {
        toast.info(`جاري إنشاء ${unitsToCreate.length} وحدة...`);
        
        for (const unit of unitsToCreate) {
          try {
            const unitPayload = {
              course: courseId,
              title: unit.title,
              description: unit.description,
              order: unit.order,
            };
            
            console.log('📤 Creating unit with payload:', unitPayload);

            const unitData = await recordedCoursesApi.createUnit(unitPayload);
            if (unitData.id) {
              // Store in map for immediate use
              unitsMap.set(unit.id, unitData.id);
              
              // Update formData with the new apiId
              const updatedUnits = formData.units.map(u => 
                u.id === unit.id ? { ...u, apiId: unitData.id } : u
              );
              updateFormData('units', updatedUnits);
              console.log('✅ Unit created:', unitData.id);
            } else {
              console.error('❌ Unit created but no ID returned:', unitData);
              toast.error(`تم إنشاء الوحدة لكن لم يتم إرجاع المعرف`);
            }
          } catch (error: any) {
            console.error('❌ Error creating unit:', unit.title, error);
            toast.error(`فشل في إنشاء الوحدة: ${unit.title}`);
          }
        }
      }      // Step 4: Create lessons in database and attach videos
      // We need to create lessons in DB and attach the uploaded videos
      const lessonsWithVideos = formData.lessons.filter(lesson => lesson.videoUploaded && lesson.bunnyVideoId);
      const lessonsWithoutVideos = formData.lessons.filter(lesson => !lesson.videoUploaded);
      
      console.log(`📊 Lessons status: ${lessonsWithVideos.length} with videos, ${lessonsWithoutVideos.length} without videos`);
      
      if (lessonsWithVideos.length > 0) {
        toast.loading(`جاري حفظ ${lessonsWithVideos.length} درس في قاعدة البيانات...`);
        
        for (const lesson of lessonsWithVideos) {
          try {
            // Get the unit API ID from our map (this is immediate, not dependent on state update)
            const unitApiId = unitsMap.get(lesson.unitId);
            if (!unitApiId) {
              console.error('❌ Unit API ID not found for lesson:', lesson.title);
              console.error('   Lesson unitId:', lesson.unitId);
              console.error('   Available units in map:', Array.from(unitsMap.entries()));
              toast.error(`فشل في ربط الدرس "${lesson.title}" بالوحدة`);
              continue;
            }
            
            console.log(`📝 Creating lesson in DB: ${lesson.title} for unit ${unitApiId}`);
            
            // Create lesson in database
            const lessonData = await recordedCoursesApi.createLesson({
              unit: unitApiId,
              title: lesson.title,
              description: lesson.description,
              learning_outcomes: lesson.learning_outcomes || '',
              order: lesson.order,
            });
            
            console.log('✅ Lesson created in DB:', lessonData);
            
            if (!lessonData.id) {
              throw new Error('Lesson created but no ID returned');
            }
            
            // Now attach the video to the lesson if bunny video ID exists
            if (lesson.bunnyVideoId) {
              console.log(`📎 Attaching video ${lesson.bunnyVideoId} to lesson ${lessonData.id}`);
              
              const attachResult = await recordedCoursesApi.attachVideo(
                lessonData.id,
                { video_id: lesson.bunnyVideoId }
              );
              
              console.log('✅ Video attached to lesson:', attachResult);
            } else {
              console.warn('⚠️ No bunny video ID for lesson:', lesson.title);
            }
            
          } catch (error: any) {
            console.error('❌ Error creating/attaching lesson:', lesson.title, error);
            toast.error(`فشل في حفظ الدرس: ${lesson.title}`);
          }
        }
        
        toast.success(`✅ تم حفظ ${lessonsWithVideos.length} درس مع الفيديوهات بنجاح`);
      }
      
      if (lessonsWithoutVideos.length > 0) {
        toast.warning(`⚠️ يوجد ${lessonsWithoutVideos.length} درس بدون فيديو. يمكنك إضافة الفيديوهات لاحقاً.`);
        console.log('⚠️ Lessons without videos:', lessonsWithoutVideos.map(l => l.title));
      }

      // Show success message with details
      const unitsCount = formData.units.filter(u => u.apiId).length || formData.units.length;
      const lessonsCount = formData.lessons.filter(l => l.videoUploaded && l.apiId).length;
      
      let successMessage = '🎉 تم إنشاء الدورة المسجلة بنجاح!';
      const details: string[] = [];
      if (unitsCount > 0) {
        details.push(`${unitsCount} وحدة`);
      }
      if (lessonsCount > 0) {
        details.push(`${lessonsCount} درس مع فيديو`);
      }
      if (details.length > 0) {
        successMessage += `\n✅ تم إنشاء: ${details.join('، ')}`;
      }
      if (formData.thumbnail || formData.cover_image) {
        successMessage += '\n💡 يمكنك إضافة الصور لاحقاً من صفحة تعديل الدورة';
      }
      
      toast.success(successMessage);
      
      // Clear localStorage after successful submission
      localStorage.removeItem('currentRecordedCourseId');
      
      setTimeout(() => {
        router.push('/dashboard/teacher');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating recorded course:', error);
      
      // Handle error messages
      let errorMessage = 'حدث خطأ أثناء إنشاء الدورة';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.data) {
        if (error.data.detail) {
          errorMessage = error.data.detail;
        } else if (error.data.message) {
          errorMessage = error.data.message;
        } else if (error.data.errors) {
          const errors = Object.entries(error.data.errors)
            .map(([field, msgs]: [string, any]) => {
              const fieldName = field === 'price' ? 'السعر' : 
                               field === 'title' ? 'العنوان' :
                               field === 'description' ? 'الوصف' :
                               field;
              const message = Array.isArray(msgs) ? msgs.join(', ') : msgs;
              return `${fieldName}: ${message}`;
            })
            .join('\n');
          errorMessage = errors || 'حدث خطأ في التحقق من البيانات';
        }
      }
      
      toast.error(errorMessage);
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
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"
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
            إنشاء دورة مسجلة جديدة
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            اتبع الخطوات لإنشاء دورتك المسجلة بسهولة واحترافية
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
                {currentStep === 1 && <Step1BasicInfo formData={formData} updateFormData={updateFormData} courseType="recorded" />}
                {currentStep === 2 && <Step2LearningDetails formData={formData} updateFormData={updateFormData} courseType="recorded" />}
                {currentStep === 3 && <Step3Pricing formData={formData} updateFormData={updateFormData} courseType="recorded" />}
                {currentStep === 4 && <Step3Units formData={formData} updateFormData={updateFormData} courseType="recorded" />}
                {currentStep === 5 && <Step4Lessons formData={formData} updateFormData={updateFormData} courseType="recorded" />}
                {currentStep === 6 && (
                  <Step5Review 
                    formData={formData} 
                    courseType="recorded"
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




