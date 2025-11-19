import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { getAuthToken } from '@/lib/auth';
import type { CourseFormData, Unit, Lesson } from '../types';

export function useCourseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseType = searchParams.get('type') || 'live'; // 'live' or 'recorded'
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createKnowledgeLab, setCreateKnowledgeLab] = useState(false);
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    accepting_applications: true,
    price: courseType === 'recorded' ? '' : undefined,
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
    console.log('🎯 useCourseForm: updateFormData called:', { field, valueType: typeof value, isArray: Array.isArray(value) });
    
    setFormData(prev => {
      console.log('🎯 useCourseForm: Previous formData lessons:', prev.lessons.map((l: any) => ({
        id: l.id,
        title: l.title,
        videoUploaded: l.videoUploaded,
        bunnyVideoId: l.bunnyVideoId,
        videoUploadUrl: l.videoUploadUrl
      })));
      
      const newData = { ...prev, [field]: value };
      
      // Force re-render for lessons array by creating new reference and deep cloning
      if (field === 'lessons' && Array.isArray(value)) {
        // Deep clone lessons to ensure React detects changes
        newData.lessons = value.map((lesson: any) => ({ ...lesson }));
        console.log('🎯 useCourseForm: New lessons array with deep clone:', newData.lessons.map((l: any) => ({
          id: l.id,
          title: l.title,
          videoUploaded: l.videoUploaded,
          bunnyVideoId: l.bunnyVideoId,
          videoUploadUrl: l.videoUploadUrl,
          keysCount: Object.keys(l).length
        })));
      }
      
      console.log('🎯 useCourseForm: Returning newData with lessons count:', newData.lessons.length);
      return newData;
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
        // Units validation
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
        // Lessons validation
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
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const uploadImage = async (file: File): Promise<string> => {
    // TODO: Implement proper image upload when endpoint is available
    // For now, we'll skip image upload since the endpoint doesn't exist
    console.log('Image upload skipped - endpoint not available:', file.name);
    return '';
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getAuthToken();

      // Step 1: Create Course
      toast.info('جاري إنشاء الدورة...');
      
      // Use the correct API endpoint based on course type
      const apiEndpoint = courseType === 'recorded' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/recorded-courses/courses/`
        : `${process.env.NEXT_PUBLIC_API_URL}/live-courses/courses/`;

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

      // Add price for recorded courses
      if (courseType === 'recorded' && formData.price) {
        coursePayload.price = formData.price;
      }
      
      // Note: thumbnail and cover_image are optional and should be uploaded via FormData later
      // For now, we skip them and allow users to add them later via course update

      console.log('📤 Sending course payload:', coursePayload);
      console.log('📤 Course type:', courseType);

      const courseResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coursePayload),
      });

      if (!courseResponse.ok) {
        const errorData = await courseResponse.json().catch(() => ({}));
        console.error('❌ Course creation failed:', errorData);
        
        // Extract meaningful error message
        let errorMessage = 'فشل إنشاء الدورة';
        
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors || errorData.thumbnail || errorData.cover_image) {
          // Handle validation errors - could be direct field errors or nested in errors object
          const allErrors = errorData.errors || errorData;
          const errors = Object.entries(allErrors)
            .map(([field, msgs]: [string, any]) => {
              const fieldName = field === 'thumbnail' ? 'صورة الغلاف' : 
                               field === 'cover_image' ? 'صورة الخلفية' : 
                               field === 'title' ? 'العنوان' :
                               field === 'description' ? 'الوصف' :
                               field === 'start_date' ? 'تاريخ البدء' :
                               field === 'end_date' ? 'تاريخ الانتهاء' :
                               field;
              const message = Array.isArray(msgs) ? msgs.join(', ') : msgs;
              return `${fieldName}: ${message}`;
            })
            .join('\n');
          errorMessage = errors || 'حدث خطأ في التحقق من البيانات';
        }
        
        throw new Error(errorMessage);
      }

      const courseData = await courseResponse.json();
      const courseId = courseData.id;

      // Step 2: Create Units
      toast.info('جاري إنشاء الوحدات...');
      const createdUnits: { [key: string]: string } = {};
      
      // Use different endpoints based on course type
      const unitsEndpoint = courseType === 'recorded'
        ? `${process.env.NEXT_PUBLIC_API_URL}/recorded-courses/units/`
        : `${process.env.NEXT_PUBLIC_API_URL}/content/units/`;
      
      for (const unit of formData.units) {
        const unitPayload = {
          course: courseId,
          title: unit.title,
          description: unit.description,
          order: unit.order,
        };

        console.log(`📤 Creating unit: ${unit.title} for ${courseType} course`);
        console.log(`📤 Unit payload:`, unitPayload);
        console.log(`📤 Using endpoint:`, unitsEndpoint);

        const unitResponse = await fetch(unitsEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(unitPayload),
        });

        if (unitResponse.ok) {
          const unitData = await unitResponse.json();
          console.log(`✅ Unit created successfully:`, unitData);
          
          // Get unit ID from response (could be id, pk, uuid, etc.)
          const unitId = unitData.id || unitData.pk || unitData.uuid;
          
          if (unitId) {
            createdUnits[unit.id] = unitId;
            console.log(`📌 Stored unit ID: ${unitId} for key: ${unit.id}`);
          } else {
            console.error('⚠️ Unit created but no ID found in response:', unitData);
            // Try to fetch the unit list to find the newly created unit
            try {
              const unitsListResponse = await fetch(
                `${unitsEndpoint}?course=${courseId}&ordering=-order&limit=1`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );
              
              if (unitsListResponse.ok) {
                const unitsList = await unitsListResponse.json();
                const units = unitsList.results || unitsList || [];
                if (units.length > 0) {
                  const foundUnit = units.find((u: any) => u.title === unit.title && u.order === unit.order);
                  if (foundUnit) {
                    const foundUnitId = foundUnit.id || foundUnit.pk || foundUnit.uuid;
                    if (foundUnitId) {
                      createdUnits[unit.id] = foundUnitId;
                      console.log(`✅ Found unit ID from list: ${foundUnitId}`);
                    }
                  }
                }
              }
            } catch (error) {
              console.error('❌ Failed to fetch units list:', error);
            }
          }
        } else {
          const errorData = await unitResponse.json().catch(() => ({}));
          console.error('❌ Failed to create unit:', unit.title);
          console.error('❌ Status:', unitResponse.status);
          console.error('❌ Error details:', JSON.stringify(errorData, null, 2));
          
          // Show more detailed error message
          let errorMessage = `فشل إنشاء الوحدة: ${unit.title}`;
          if (errorData.detail) {
            errorMessage += ` - ${errorData.detail}`;
          } else if (errorData.message) {
            errorMessage += ` - ${errorData.message}`;
          } else if (errorData.errors) {
            const errors = Object.entries(errorData.errors)
              .map(([field, msgs]: [string, any]) => {
                const fieldName = field === 'course' ? 'الدورة' :
                                 field === 'title' ? 'العنوان' :
                                 field === 'description' ? 'الوصف' :
                                 field === 'order' ? 'الترتيب' : field;
                const message = Array.isArray(msgs) ? msgs.join(', ') : msgs;
                return `${fieldName}: ${message}`;
              })
              .join(', ');
            errorMessage += ` - ${errors}`;
          }
          toast.error(errorMessage);
        }
      }

      // Step 3: Create Lessons
      toast.info('جاري إنشاء الدروس...');
      
      // Use different endpoints based on course type
      const lessonsEndpoint = courseType === 'recorded'
        ? `${process.env.NEXT_PUBLIC_API_URL}/recorded-courses/lessons/`
        : `${process.env.NEXT_PUBLIC_API_URL}/content/lessons/`;
      
      for (const lesson of formData.lessons) {
        const unitId = createdUnits[lesson.unitId];
        if (!unitId) {
          console.error('❌ Unit ID not found for lesson:', lesson.title);
          console.error('Available unit IDs:', Object.keys(createdUnits));
          toast.error(`فشل إنشاء الدرس "${lesson.title}" - لم يتم العثور على ID الوحدة`);
          continue;
        }

        const lessonPayload = {
          unit: unitId,
          title: lesson.title,
          description: lesson.description,
          learning_outcomes: lesson.learning_outcomes,
          order: lesson.order,
        };

        console.log(`📤 Creating lesson: ${lesson.title} for unit: ${unitId}`);
        console.log(`📤 Using endpoint:`, lessonsEndpoint);

        const lessonResponse = await fetch(lessonsEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lessonPayload),
        });

        if (lessonResponse.ok) {
          const lessonData = await lessonResponse.json();
          console.log(`✅ Lesson created successfully:`, lessonData);
        } else {
          const errorData = await lessonResponse.json().catch(() => ({}));
          console.error('❌ Failed to create lesson:', lesson.title);
          console.error('❌ Status:', lessonResponse.status);
          console.error('❌ Error details:', JSON.stringify(errorData, null, 2));
          
          // Show detailed error message
          let errorMessage = `فشل إنشاء الدرس: ${lesson.title}`;
          if (errorData.detail) {
            errorMessage += ` - ${errorData.detail}`;
          } else if (errorData.message) {
            errorMessage += ` - ${errorData.message}`;
          } else if (errorData.errors) {
            const errors = Object.entries(errorData.errors)
              .map(([field, msgs]: [string, any]) => {
                const fieldName = field === 'unit' ? 'الوحدة' :
                                 field === 'title' ? 'العنوان' :
                                 field === 'description' ? 'الوصف' :
                                 field === 'learning_outcomes' ? 'مخرجات التعلم' :
                                 field === 'order' ? 'الترتيب' : field;
                const message = Array.isArray(msgs) ? msgs.join(', ') : msgs;
                return `${fieldName}: ${message}`;
              })
              .join(', ');
            errorMessage += ` - ${errors}`;
          }
          toast.error(errorMessage);
        }
      }

      toast.success('🎉 تم إنشاء الدورة بنجاح!');
      
      setTimeout(() => {
        router.push('/dashboard/teacher');
      }, 1500);

    } catch (error: any) {
      console.error('Error creating course:', error);
      toast.error(error.message || 'حدث خطأ أثناء إنشاء الدورة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    formData,
    isSubmitting,
    updateFormData,
    handleNext,
    handlePrevious,
    handleSubmit,
    courseType,
  };
}

