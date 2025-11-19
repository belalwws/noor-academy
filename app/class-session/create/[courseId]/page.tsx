'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Video, ArrowRight, CheckCircle, BookOpen, Star, PenTool, Sparkles, Timer, GraduationCap, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { createCourseSession } from '@/lib/api/sessions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { liveEducationAPI } from '@/lib/api/liveEducation';

interface Course {
  id: string;
  title: string;
  description: string;
  learning_outcomes: string[];
  subjects: string;
  course_type: string;
  lessons: {
    id: string;
    title: string;
    order: number;
    duration_minutes?: number;
  }[];
  teacher: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
      username: string;
    };
  };
}

export default function CreateClassSessionPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params['courseId'] as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [duration, setDuration] = useState(60);

  // جلب بيانات الكورس والدروس
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      
      try {
        setIsLoadingCourse(true);
        
        // جلب تفاصيل الكورس مع الدروس
        const courseData = await liveEducationAPI.getCourse(courseId);
        setCourse(courseData);
        
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('خطأ في جلب بيانات الكورس');
        setCourse(null);
      } finally {
        setIsLoadingCourse(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const createAndStartSession = async () => {
    if (!courseId || !course || !selectedLessonId) {
      toast.error('يرجى اختيار الدرس أولاً');
      return;
    }

    setIsLoading(true);
    try {
      // الحصول على اسم الدرس المختار
      const selectedLesson = course.lessons.find(lesson => lesson.id === selectedLessonId);
      const lessonTitle = selectedLesson?.title || 'حصة مباشرة';

      // استخدام الـ API لإنشاء الجلسة
      const session = await createCourseSession(courseId, lessonTitle, duration);
      console.log('🎯 Session created:', session);
      
      const roomId = session.session_id;
      console.log('🎯 Room ID:', roomId);
      
      if (!roomId) {
        throw new Error('لم يتم إرجاع معرف الجلسة من الخادم');
      }
      
      toast.success('تم إنشاء الحصة بنجاح! جاري التوجيه...');
      
      // توجيه لغرفة الحصة
      setTimeout(() => {
        const meetUrl = `/meet/rooms/${roomId}`;
        console.log('🎯 Navigating to:', meetUrl);
        router.push(meetUrl);
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error(`فشل في إنشاء الحصة: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const validateForm = () => {
    console.log('🔍 Validation Debug:');
    console.log('selectedLessonId:', selectedLessonId);
    console.log('typeof selectedLessonId:', typeof selectedLessonId);
    console.log('course:', course);
    console.log('isLoading:', isLoading);
    
    // تحقق من وجود القيمة بدون .length
    const isValid = selectedLessonId && selectedLessonId !== '';
    console.log('isValid:', isValid);
    
    return isValid;
  };

  if (isLoadingCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <Sparkles className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-gray-700 font-medium">جاري تحميل بيانات الكورس...</p>
          <div className="mt-2 text-sm text-gray-500">يرجى الانتظار قليلاً</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">خطأ في تحميل الكورس</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">لم يتم العثور على الكورس أو ليس لديك صلاحية للوصول إليه</p>
          <Button 
            onClick={() => router.push('/dashboard/teacher')}
            className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للداشبورد
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" dir="rtl">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <PenTool className="w-10 h-10 text-yellow-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                    إنشاء حصة جديدة
                  </h1>
                  <p className="text-emerald-100 text-lg">قم بإعداد حصة تفاعلية مميزة لطلابك</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm text-emerald-200">تجربة تعليمية متطورة</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="text-emerald-600 bg-white/95 hover:bg-white border-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-medium"
                onClick={() => router.push('/dashboard/teacher')}
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة للداشبورد
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Enhanced Course Info Card */}
            <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-white to-emerald-50/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-xl">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-emerald-800 mb-2">{course.title}</CardTitle>
                    <CardDescription className="text-emerald-600 text-base leading-relaxed">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 text-sm font-medium shadow-md">
                    <GraduationCap className="w-4 h-4 ml-1" />
                    {course.subjects}
                  </Badge>
                  <Badge variant="outline" className="border-teal-300 text-teal-700 bg-teal-50 px-4 py-2 text-sm font-medium">
                    <BookOpen className="w-4 h-4 ml-1" />
                    {course.lessons.length} درس
                  </Badge>
                </div>
              </CardHeader>
                        </Card>
            {/* Enhanced Session Settings Card */}
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardHeader className="text-center pb-8 bg-gradient-to-br from-emerald-50 to-teal-50">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Video className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-3xl text-gray-800 mb-2">تفاصيل الحصة</CardTitle>
                <CardDescription className="text-lg text-gray-600">اختر الدرس وأعد حصة تفاعلية مميزة</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8 px-8 pb-8">
                {/* Enhanced Lesson Selection */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-100 shadow-lg relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 left-0 w-full h-full opacity-5">
                    <div className="absolute top-4 right-4 w-20 h-20 bg-blue-500 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-16 h-16 bg-indigo-500 rounded-full"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <Label htmlFor="lessonSelect" className="flex items-center justify-start gap-4 text-lg font-bold text-blue-800 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-800">اختر الدرس من الكورس</div>
                        <div className="text-sm text-blue-600 font-normal">حدد الدرس الذي تريد تدريسه</div>
                      </div>
                    </Label>
                    
                    {course.lessons.length > 0 ? (
                      <div className="space-y-4">
                        <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                          <SelectTrigger className="w-full px-6 py-5 rounded-2xl border-2 border-blue-200 bg-white/90 backdrop-blur-sm text-gray-800 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-base shadow-lg hover:shadow-xl hover:bg-white text-right">
                            <SelectValue placeholder="🎯 اضغط هنا لاختيار الدرس..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm max-h-80 overflow-y-auto">
                            <div className="p-2">
                              {course.lessons
                                .sort((a, b) => a.order - b.order)
                                .map((lesson, index) => (
                                <SelectItem 
                                  key={lesson.id} 
                                  value={lesson.id} 
                                  className="px-4 py-4 mb-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200"
                                >
                                  <div className="flex items-center gap-4 w-full text-right">
                                    {/* رقم الدرس */}
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0">
                                      {index + 1}
                                    </div>
                                    
                                    {/* محتوى الدرس */}
                                    <div className="flex-1 text-right">
                                      <div className="font-bold text-gray-800 text-base mb-1">
                                        {lesson.title}
                                      </div>
                                      <div className="flex items-center justify-end gap-2">
                                        {lesson.duration_minutes && (
                                          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 text-xs font-medium shadow-sm">
                                            <Timer className="w-3 h-3 ml-1" />
                                            {lesson.duration_minutes} دقيقة
                                          </Badge>
                                        )}
                                        <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 px-3 py-1 text-xs">
                                          الدرس {index + 1}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    {/* أيقونة الكتاب */}
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <BookOpen className="w-4 h-4 text-blue-600" />
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                        
                        {/* معلومات إضافية */}
                        <div className="bg-gradient-to-r from-blue-100/70 to-indigo-100/70 rounded-2xl p-5 border border-blue-200/50">
                          <div className="flex items-center gap-3 text-blue-700">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-sm">نصيحة مهمة</div>
                              <div className="text-xs text-blue-600">اختر الدرس المناسب لمستوى طلابك والوقت المتاح</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-gray-500 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300 relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 opacity-50"></div>
                        
                        <div className="relative z-10">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-700 mb-3">لا توجد دروس متاحة</h3>
                          <p className="text-gray-500 mb-4 leading-relaxed">
                            يجب إضافة دروس للكورس أولاً قبل إنشاء الحصص
                          </p>
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            <BookOpen className="w-4 h-4" />
                            تواصل مع المشرف لإضافة الدروس
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Duration Selection */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8 border border-emerald-100 shadow-lg">
                  <Label htmlFor="duration" className="flex items-center gap-3 text-base font-semibold text-emerald-800 mb-4">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    مدة الحصة:
                  </Label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-6 py-4 rounded-xl border-2 border-emerald-200 bg-white text-gray-800 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-base shadow-md hover:shadow-lg font-medium"
                  >
                    {/* <option value={10}>10 دقيقة اختبار للمطور</option> */}
                    <option value={30}>⚡ 30 دقيقة (حصة قصيرة)</option>
                    <option value={40}>⚡  30 دقيقة + 10 دقيقة اضافية</option>
                    <option value={60}>🎯 60 دقيقة (حصة كاملة)</option>
                    <option value={70}>🎯 60 دقيقة + 10 دقيقة اضافية</option>
                  </select>
                  <div className="mt-4 p-4 bg-emerald-100/50 rounded-xl">
                    <p className="text-sm text-emerald-700 flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      اختر المدة المناسبة لمحتوى الدرس وعدد الطلاب
                    </p>
                  </div>
                </div>

                {/* Enhanced Warning */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-800 mb-2 text-lg">⚠️ تنبيه مهم</h4>
                      <p className="text-amber-700 leading-relaxed">
                        <strong>الحصة ستنتهي تلقائياً</strong> بمجرد انتهاء الوقت المحدد لها. 
                        تأكد من اختيار المدة المناسبة قبل بدء الحصة.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Info Box */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border-2 border-cyan-200 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-cyan-800 mb-3 text-lg">من يمكنه الانضمام؟</h4>
                      <ul className="text-cyan-700 space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-cyan-600" />
                          الطلاب المسجلون في هذا الكورس
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-cyan-600" />
                          المشرفون الأكاديميون والعامون
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-cyan-600" />
                          أنت كمعلم الكورس
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Enhanced Create Button */}
                <Button
                  onClick={createAndStartSession}
                  disabled={isLoading || !validateForm()}
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg shadow-xl"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent ml-3"></div>
                      جاري إنشاء الحصة...
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 ml-3" />
                      إنشاء الحصة وبدء الآن
                      <ArrowRight className="w-6 h-6 mr-3" />
                    </>
                  )}
                </Button>

                {/* Enhanced Note */}
                <div className="text-center border-t-2 border-gray-100 pt-6">
                  <p className="flex items-center justify-center gap-3 text-gray-600 bg-gray-50 rounded-xl py-4 px-6">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">سيتم إنشاء رابط الحصة تلقائياً وتوجيهك إلى غرفة الحصة</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Enhanced Footer */}
        <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white py-12 mt-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                لسان الحكمة
              </span>
            </div>
            <p className="text-gray-300 text-lg mb-4">
              منصة تعليمية تفاعلية
            </p>
            <div className="text-sm text-gray-400">
              جميع الحقوق محفوظة - سحابة رؤيا
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}