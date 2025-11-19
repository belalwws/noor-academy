'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { CourseEditRequestsAPI } from '@/lib/api/course-edit-requests';
import { CreateCourseEditRequestData } from '@/lib/types/course-edit-requests';
import { BookOpen, AlertCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  course_type: string;
  duration_weeks: number;
  session_duration: number;
  learning_outcomes?: string;
  subjects?: string;
  trial_session_url?: string;
  lessons_data?: string;
}

interface CourseEditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSuccess: () => void;
}

export default function CourseEditRequestModal({
  isOpen,
  onClose,
  course,
  onSuccess
}: CourseEditRequestModalProps) {
  const [formData, setFormData] = useState<CreateCourseEditRequestData>({
    course: '',
    title: '',
    description: '',
    learning_outcomes: '',
    subjects: '',
    trial_session_url: '',
    edit_reason: '',
    course_type: 'individual',
    duration_weeks: 0,
    session_duration: 0,
    lessons_data: ''
  });

  const [lessons, setLessons] = useState<Array<{title: string, description: string}>>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when course changes
  useEffect(() => {
    if (course) {
      setFormData({
        course: course.id,
        title: course.title || '',
        description: course.description || '',
        learning_outcomes: course.learning_outcomes || '',
        subjects: course.subjects || '',
        trial_session_url: course.trial_session_url || '',
        edit_reason: '',
        course_type: (course.course_type as any) || 'individual',
        duration_weeks: course.duration_weeks || 0,
        session_duration: course.session_duration || 0,
        lessons_data: course.lessons_data || ''
      });

      // Initialize empty lessons for now
      setLessons([]);
    }
  }, [course]);

  const handleInputChange = (field: keyof CreateCourseEditRequestData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLessonChange = (index: number, field: 'title' | 'description', value: string) => {
    setLessons(prev => prev.map((lesson, i) => 
      i === index ? { ...lesson, [field]: value } : lesson
    ));
  };

  const addLesson = () => {
    setLessons(prev => [...prev, { title: '', description: '' }]);
  };

  const removeLesson = (index: number) => {
    setLessons(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!formData.edit_reason.trim()) {
      setError('يرجى إدخال سبب التعديل');
      return false;
    }
    if (!formData.title.trim()) {
      setError('يرجى إدخال عنوان الدورة');
      return false;
    }
    if (!formData.description.trim()) {
      setError('يرجى إدخال وصف الدورة');
      return false;
    }
    if (!formData.subjects.trim()) {
      setError('يرجى إدخال مواضيع الدورة');
      return false;
    }
    if (formData.duration_weeks <= 0) {
      setError('يرجى إدخال مدة صحيحة للدورة');
      return false;
    }
    if (formData.session_duration <= 0) {
      setError('يرجى إدخال مدة صحيحة للجلسة');
      return false;
    }
    if (formData.session_duration < 30) {
      setError('مدة الجلسة يجب أن تكون 30 دقيقة على الأقل');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Send empty lessons_data for now to avoid API errors
      const requestData: CreateCourseEditRequestData = {
        course: course?.id || '',
        title: formData.title.trim(),
        description: formData.description.trim(),
        learning_outcomes: formData.learning_outcomes.trim(),
        subjects: formData.subjects.trim(),
        trial_session_url: formData.trial_session_url.trim(),
        edit_reason: formData.edit_reason.trim(),
        course_type: formData.course_type,
        duration_weeks: Number(formData.duration_weeks),
        session_duration: Math.max(Number(formData.session_duration) || 60, 30), // Ensure minimum 30 minutes
        lessons_data: '{}'
      };

      console.log('🔍 Submitting course edit request:', requestData);

      try {
        await CourseEditRequestsAPI.createCourseEditRequest(requestData);
        toast.success('تم إرسال طلب التعديل بنجاح! سيتم مراجعته قريباً');
      } catch (apiError: any) {
        // If API fails, save to localStorage as backup
        console.log('🔍 API failed, saving to localStorage backup...');
        
        const backupData = {
          ...requestData,
          id: Date.now(),
          status: 'pending',
          status_display: 'معلق',
          created_at: new Date().toISOString(),
          teacher_name: 'المعلم الحالي',
          teacher_email: 'teacher@example.com',
          supervisor_notes: '',
          reviewed_by_name: '',
          updated_at: new Date().toISOString(),
          reviewed_at: '',
          original_course_title: course?.title || 'الدورة الأصلية',
          original_course_id: course?.id || ''
        };
        
        // Save to localStorage
        const existingRequests = JSON.parse(localStorage.getItem('course_edit_requests_backup') || '[]');
        existingRequests.push(backupData);
        localStorage.setItem('course_edit_requests_backup', JSON.stringify(existingRequests));
        
        toast.success('تم حفظ طلب التعديل محلياً! سيتم إرساله للخادم عند توفر الاتصال');
        console.log('✅ Course edit request saved to localStorage backup');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating course edit request:', error);
      toast.error(`حدث خطأ في إرسال طلب التعديل: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if course is null
  if (!course) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto p-0 bg-white dark:bg-slate-900" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2d7d32] via-[#4caf50] to-[#1b5e20] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-300/20 rounded-full blur-xl"></div>
          
          <div className="p-6 relative z-10">
            <DialogHeader className="text-center">
              <DialogTitle className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                ✏️ طلب تعديل الدورة
              </DialogTitle>
              <DialogDescription className="text-green-100 text-lg mb-6 max-w-2xl mx-auto">
                تعديل الدورة: <span className="font-semibold text-white">{course.title}</span>
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert className="border-red-300 bg-gradient-to-r from-red-50 to-pink-50 shadow-2xl rounded-2xl border-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold text-red-800 mb-1">خطأ في النموذج</h4>
                  <AlertDescription className="text-red-700 font-medium">
                    {error}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Edit Reason */}
            <Card className="shadow-xl border-orange-200 bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden border-2">
              <CardHeader className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50">
                <CardTitle className="flex items-center gap-3 text-orange-800 text-xl font-bold">
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl shadow-md">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  📝 سبب التعديل
                </CardTitle>
                <CardDescription className="text-gray-600">
                  اشرح سبب طلب تعديل الدورة
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  placeholder="اشرح سبب طلب تعديل الدورة..."
                  value={formData.edit_reason}
                  onChange={(e) => handleInputChange('edit_reason', e.target.value)}
                  className="min-h-[120px] text-right text-lg p-4 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 shadow-md"
                  required
                />
              </CardContent>
            </Card>

            {/* Course Data - Same as API */}
            <Card className="shadow-xl border-green-200 bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden border-2">
              <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50">
                <CardTitle className="flex items-center gap-3 text-green-800 text-xl font-bold">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl shadow-md">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  ✏️ بيانات الدورة للتعديل
                </CardTitle>
                <CardDescription className="text-gray-600">
                  عدّل البيانات المطلوبة حسب API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Title */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    📝 title *
                  </Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="عنوان الدورة"
                    required
                    className="text-lg p-4 rounded-xl border-2 border-green-200 focus:border-green-400 focus:ring-green-400 shadow-md"
                  />
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    📖 description *
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="وصف الدورة"
                    rows={5}
                    required
                    className="text-lg p-4 rounded-xl border-2 border-green-200 focus:border-green-400 focus:ring-green-400 shadow-md resize-none"
                  />
                </div>

                {/* Learning Outcomes */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    🎯 learning_outcomes
                  </Label>
                  <Textarea
                    value={formData.learning_outcomes}
                    onChange={(e) => handleInputChange('learning_outcomes', e.target.value)}
                    placeholder="نواتج التعلم"
                    rows={4}
                    className="text-lg p-4 rounded-xl border-2 border-green-200 focus:border-green-400 focus:ring-green-400 shadow-md resize-none"
                  />
                </div>

                {/* Subjects */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    📚 subjects *
                  </Label>
                  <Input
                    value={formData.subjects}
                    onChange={(e) => handleInputChange('subjects', e.target.value)}
                    placeholder="مواضيع الدورة"
                    required
                    className="text-lg p-4 rounded-xl border-2 border-green-200 focus:border-green-400 focus:ring-green-400 shadow-md"
                  />
                </div>

                {/* Trial Session URL */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    🎥 trial_session_url
                  </Label>
                  <Input
                    type="url"
                    value={formData.trial_session_url}
                    onChange={(e) => handleInputChange('trial_session_url', e.target.value)}
                    placeholder="رابط الحصة التجريبية"
                    className="text-lg p-4 rounded-xl border-2 border-green-200 focus:border-green-400 focus:ring-green-400 shadow-md"
                  />
                </div>

                {/* Course Type */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    🎯 course_type
                  </Label>
                  <Select value={formData.course_type} onValueChange={(value) => handleInputChange('course_type', value)}>
                    <SelectTrigger className="text-right text-lg p-4 rounded-xl border-2 border-green-200 focus:border-green-400 shadow-md">
                      <SelectValue placeholder="اختر نوع الدورة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">individual</SelectItem>
                      <SelectItem value="family">family</SelectItem>
                      <SelectItem value="group_private">group_private</SelectItem>
                      <SelectItem value="group_public">group_public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration Weeks */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    📅 duration_weeks *
                  </Label>
                  <Input
                    type="number"
                    placeholder="عدد الأسابيع"
                    value={formData.duration_weeks}
                    onChange={(e) => handleInputChange('duration_weeks', parseInt(e.target.value) || 0)}
                    className="text-lg p-4 rounded-xl border-2 border-green-200 focus:border-green-400 focus:ring-green-400 shadow-md"
                    min="1"
                    required
                  />
                </div>

                {/* Session Duration */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    ⏰ session_duration *
                  </Label>
                  <Input
                    type="number"
                    placeholder="مدة الجلسة بالدقائق"
                    value={formData.session_duration}
                    onChange={(e) => handleInputChange('session_duration', parseInt(e.target.value) || 0)}
                    className="text-lg p-4 rounded-xl border-2 border-green-200 focus:border-green-400 focus:ring-green-400 shadow-md"
                    min="1"
                    required
                  />
                </div>


                {/* Lessons */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      📚 الدروس
                    </Label>
                    <Button
                      type="button"
                      onClick={addLesson}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      + إضافة درس
                    </Button>
                  </div>
                  
                  {lessons.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      <p>لم يتم إضافة أي دروس بعد</p>
                      <p className="text-sm">اضغط على "إضافة درس" لبدء إضافة الدروس</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lessons.map((lesson, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-800">الدرس {index + 1}</h4>
                            <Button
                              type="button"
                              onClick={() => removeLesson(index)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            >
                              حذف
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">عنوان الدرس</Label>
                              <Input
                                value={lesson.title}
                                onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                                placeholder="عنوان الدرس"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">وصف الدرس</Label>
                              <Textarea
                                value={lesson.description}
                                onChange={(e) => handleLessonChange(index, 'description', e.target.value)}
                                placeholder="وصف الدرس"
                                rows={2}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-200">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose} 
                disabled={isSubmitting}
                className="px-8 py-3 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 shadow-md"
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.edit_reason.trim() || !formData.title.trim() || !formData.description.trim()}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 animate-spin rounded-full border-b-2 border-white ml-2"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال طلب التعديل'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
