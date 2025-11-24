'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  FlaskConical, ArrowLeft, BookOpen, FileQuestion, 
  Play, Target, Award, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '@/components/ProtectedRoute';
import { knowledgeLabApi } from '@/lib/api/knowledge-lab';
import { QuestionsPracticeTab } from '../components/QuestionsPracticeTab';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

interface KnowledgeLab {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  cover_image: string | null;
  objective: string;
  topics: string;
  is_standalone: boolean;
  content_type: number | null;
  object_id: string | null;
  course_title: string | null;
  status: 'pending' | 'approved' | 'rejected';
  questions_count?: string;
  lesson_exercises_count?: number;
  lesson_exams_count?: number;
  unit_exercises_count?: number;
  unit_exams_count?: number;
  course_exams_count?: number;
  course_review_exercises_count?: number;
}

interface Exercise {
  id: string;
  title: string;
  lesson_title?: string;
  unit_title?: string;
  time_limit?: number;
  questions_count?: number;
  type: 'lesson-exercise' | 'lesson-exam' | 'unit-exercise' | 'unit-exam' | 'course-exam' | 'course-review-exercise';
}

const KnowledgeLabStudentPage = () => {
  const params = useParams();
  const router = useRouter();
  const labId = params['id'] as string;

  const [loading, setLoading] = useState(true);
  const [lab, setLab] = useState<KnowledgeLab | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);

  useEffect(() => {
    if (labId) {
      fetchLabDetails();
      fetchExercises();
    }
  }, [labId]);

  const fetchLabDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('يرجى تسجيل الدخول');
        router.push('/login');
        return;
      }

      const response = await knowledgeLabApi.getLab(labId);
      
      if (response.success && response.data) {
        setLab(response.data);
      } else {
        toast.error('فشل في تحميل بيانات المختبر');
        router.push('/dashboard/student');
      }
    } catch (error) {
      console.error('Error fetching lab:', error);
      toast.error('حدث خطأ أثناء تحميل البيانات');
      router.push('/dashboard/student');
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      setExercisesLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) return;

      const allExercises: Exercise[] = [];

      // Fetch lesson exercises
      try {
        const lessonExercisesResponse = await fetch(
          `${API_BASE_URL}/knowledge-lab/lesson-exercises/?knowledge_lab=${labId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (lessonExercisesResponse.ok) {
          const data = await lessonExercisesResponse.json();
          const exercises = data.results || data || [];
          exercises.forEach((ex: any) => {
            allExercises.push({
              id: ex.id,
              title: ex.title,
              lesson_title: ex.lesson_title,
              time_limit: ex.time_limit,
              questions_count: ex.questions?.length || 0,
              type: 'lesson-exercise'
            });
          });
        }
      } catch (e) {
        console.error('Error fetching lesson exercises:', e);
      }

      // Fetch lesson exams
      try {
        const lessonExamsResponse = await fetch(
          `${API_BASE_URL}/knowledge-lab/lesson-exams/?knowledge_lab=${labId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (lessonExamsResponse.ok) {
          const data = await lessonExamsResponse.json();
          const exercises = data.results || data || [];
          exercises.forEach((ex: any) => {
            allExercises.push({
              id: ex.id,
              title: ex.title,
              lesson_title: ex.lesson_title,
              time_limit: ex.time_limit,
              questions_count: ex.questions?.length || 0,
              type: 'lesson-exam'
            });
          });
        }
      } catch (e) {
        console.error('Error fetching lesson exams:', e);
      }

      // Fetch unit exercises
      try {
        const unitExercisesResponse = await fetch(
          `${API_BASE_URL}/knowledge-lab/unit-exercises/?knowledge_lab=${labId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (unitExercisesResponse.ok) {
          const data = await unitExercisesResponse.json();
          const exercises = data.results || data || [];
          exercises.forEach((ex: any) => {
            allExercises.push({
              id: ex.id,
              title: ex.title,
              unit_title: ex.unit_title,
              time_limit: ex.time_limit,
              questions_count: ex.questions?.length || 0,
              type: 'unit-exercise'
            });
          });
        }
      } catch (e) {
        console.error('Error fetching unit exercises:', e);
      }

      // Fetch unit exams
      try {
        const unitExamsResponse = await fetch(
          `${API_BASE_URL}/knowledge-lab/unit-exams/?knowledge_lab=${labId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (unitExamsResponse.ok) {
          const data = await unitExamsResponse.json();
          const exercises = data.results || data || [];
          exercises.forEach((ex: any) => {
            allExercises.push({
              id: ex.id,
              title: ex.title,
              unit_title: ex.unit_title,
              time_limit: ex.time_limit,
              questions_count: ex.questions?.length || 0,
              type: 'unit-exam'
            });
          });
        }
      } catch (e) {
        console.error('Error fetching unit exams:', e);
      }

      // Fetch course exams
      try {
        const courseExamsResponse = await fetch(
          `${API_BASE_URL}/knowledge-lab/course-exams/?knowledge_lab=${labId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (courseExamsResponse.ok) {
          const data = await courseExamsResponse.json();
          const exercises = data.results || data || [];
          exercises.forEach((ex: any) => {
            allExercises.push({
              id: ex.id,
              title: ex.title,
              time_limit: ex.time_limit,
              questions_count: ex.questions?.length || 0,
              type: 'course-exam'
            });
          });
        }
      } catch (e) {
        console.error('Error fetching course exams:', e);
      }

      setExercises(allExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setExercisesLoading(false);
    }
  };

  const handleStartExercise = (exercise: Exercise) => {
    router.push(`/knowledge-lab/${labId}/exercises/${exercise.id}?type=${exercise.type}`);
  };

  const getExerciseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'lesson-exercise': 'تمرين درس',
      'lesson-exam': 'امتحان درس',
      'unit-exercise': 'تمرين وحدة',
      'unit-exam': 'امتحان وحدة',
      'course-exam': 'امتحان دورة',
      'course-review-exercise': 'تمرين مراجعة'
    };
    return labels[type] || type;
  };

  const formatTimeLimit = (seconds?: number) => {
    if (!seconds) return 'لا يوجد حد زمني';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} ساعة`;
    return `${hours} ساعة و ${remainingMinutes} دقيقة`;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
          <div className="text-center">
            <div className="animate-spin w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">جاري تحميل المختبر...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!lab) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-800 mb-2">المختبر غير موجود</p>
            <Button
              onClick={() => router.push('/dashboard/student')}
              className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للوحة التحكم
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (lab.status !== 'approved') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
          <div className="text-center">
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-800 mb-2">المختبر غير متاح</p>
            <p className="text-gray-600 mb-4">
              {lab.status === 'pending' 
                ? 'المختبر قيد المراجعة' 
                : 'المختبر غير معتمد'}
            </p>
            <Button
              onClick={() => router.push('/dashboard/student')}
              className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للوحة التحكم
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const totalExercises = exercises.length;
  const totalQuestions = parseInt(lab.questions_count || '0', 10);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-8 px-4 pt-24" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/student')}
                className="border-orange-200 hover:bg-orange-50"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FlaskConical className="w-8 h-8 text-orange-600" />
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                    {lab.title}
                  </h1>
                  <Badge className="bg-blue-500 text-white">معتمد</Badge>
                </div>
                <p className="text-gray-600">{lab.description}</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" dir="rtl">
            <Card className="border-orange-100" dir="rtl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الأسئلة</p>
                    <p className="text-2xl font-bold text-orange-600">{totalQuestions}</p>
                  </div>
                  <FileQuestion className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-100" dir="rtl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">التمارين المتاحة</p>
                    <p className="text-2xl font-bold text-amber-600">{totalExercises}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-100" dir="rtl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">الأهداف التعليمية</p>
                    <p className="text-sm font-semibold text-yellow-600 line-clamp-1">
                      {lab.objective || 'غير محدد'}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="questions" className="w-full" dir="rtl">
            <div className="mb-6">
              <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-orange-50 p-1.5 text-orange-900 shadow-lg border border-orange-200" dir="rtl">
                <TabsTrigger 
                  value="questions" 
                  dir="rtl"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-orange-700 data-[state=inactive]:hover:bg-orange-100 data-[state=inactive]:hover:text-orange-900"
                >
                  <FileQuestion className="w-4 h-4 ml-2" />
                  بنك الأسئلة ({totalQuestions})
                </TabsTrigger>
                <TabsTrigger 
                  value="exercises" 
                  dir="rtl"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-orange-700 data-[state=inactive]:hover:bg-orange-100 data-[state=inactive]:hover:text-orange-900"
                >
                  <BookOpen className="w-4 h-4 ml-2" />
                  التمارين ({totalExercises})
                </TabsTrigger>
                <TabsTrigger 
                  value="info" 
                  dir="rtl"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-orange-700 data-[state=inactive]:hover:bg-orange-100 data-[state=inactive]:hover:text-orange-900"
                >
                  <Target className="w-4 h-4 ml-2" />
                  معلومات المختبر
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="questions" className="mt-6" dir="rtl">
              <QuestionsPracticeTab labId={labId} />
            </TabsContent>

            <TabsContent value="exercises" className="mt-6" dir="rtl">
              {exercisesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600">جاري تحميل التمارين...</p>
                </div>
              ) : exercises.length === 0 ? (
                <Card className="border-orange-100" dir="rtl">
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-orange-300" />
                    <p className="text-lg font-semibold text-gray-800 mb-2">لا توجد تمارين متاحة</p>
                    <p className="text-sm text-gray-600">سيتم إضافة التمارين قريباً</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exercises.map((exercise, index) => (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer h-full" dir="rtl">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg font-bold text-orange-600 line-clamp-2 flex-1">
                              {exercise.title}
                            </CardTitle>
                            <Badge className="bg-orange-100 text-orange-800 border-orange-300 flex-shrink-0">
                              {getExerciseTypeLabel(exercise.type)}
                            </Badge>
                          </div>
                          {exercise.lesson_title && (
                            <CardDescription className="text-sm text-gray-600">
                              درس: {exercise.lesson_title}
                            </CardDescription>
                          )}
                          {exercise.unit_title && (
                            <CardDescription className="text-sm text-gray-600">
                              وحدة: {exercise.unit_title}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <FileQuestion className="w-4 h-4" />
                                الأسئلة
                              </span>
                              <span className="font-semibold">{exercise.questions_count || 0}</span>
                            </div>
                            {exercise.time_limit && (
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  الوقت
                                </span>
                                <span className="font-semibold">{formatTimeLimit(exercise.time_limit)}</span>
                              </div>
                            )}
                            <Button
                              onClick={() => handleStartExercise(exercise)}
                              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                            >
                              <Play className="w-4 h-4 ml-2" />
                              بدء التمرين
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="info" className="mt-6" dir="rtl">
              <Card className="border-orange-100" dir="rtl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-orange-600">معلومات المختبر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {lab.objective && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5 text-orange-600" />
                        الأهداف التعليمية
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{lab.objective}</p>
                    </div>
                  )}
                  
                  {lab.topics && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-amber-600" />
                        المواضيع المشمولة
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{lab.topics}</p>
                    </div>
                  )}

                  {lab.course_title && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        الدورة المرتبطة
                      </h3>
                      <p className="text-gray-700">{lab.course_title}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default KnowledgeLabStudentPage;

