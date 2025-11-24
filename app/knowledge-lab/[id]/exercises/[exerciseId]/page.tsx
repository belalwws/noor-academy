'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowRight, Clock, FileQuestion, BookOpen, Layers, GraduationCap, CheckCircle2, XCircle, Play, Send, ArrowLeft, CheckCircle, RotateCcw } from 'lucide-react';
import { knowledgeLabApi } from '@/lib/api/knowledge-lab';
import type { 
  LessonExercise, 
  LessonExam, 
  UnitExercise, 
  UnitExam, 
  CourseExam,
  StudentAttempt
} from '@/lib/api/knowledge-lab';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'sonner';
import { CountdownTimer } from '@/components/games/CountdownTimer';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

type ExerciseType = 'lesson-exercise' | 'lesson-exam' | 'unit-exercise' | 'unit-exam' | 'course-exam' | 'course-review-exercise';
type Exercise = LessonExercise | LessonExam | UnitExercise | UnitExam | CourseExam | any;

export default function ExerciseDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const labId = params['id'] as string;
  const exerciseId = params['exerciseId'] as string;
  const exerciseType = (searchParams.get('type') || 'lesson-exercise') as ExerciseType;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [attempt, setAttempt] = useState<StudentAttempt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    fetchExerciseDetails();
  }, [labId, exerciseId, exerciseType]);

  const fetchExerciseDetails = async () => {
    try {
      setLoading(true);
      let response;

      switch (exerciseType) {
        case 'lesson-exercise':
          response = await knowledgeLabApi.getLessonExercise(exerciseId);
          break;
        case 'lesson-exam':
          response = await knowledgeLabApi.getLessonExam(exerciseId);
          break;
        case 'unit-exercise':
          response = await knowledgeLabApi.getUnitExercise(exerciseId);
          break;
        case 'unit-exam':
          response = await knowledgeLabApi.getUnitExam(exerciseId);
          break;
        case 'course-exam':
          response = await knowledgeLabApi.getCourseExam(exerciseId);
          break;
        case 'course-review-exercise':
          response = await knowledgeLabApi.getCourseReviewExercise(exerciseId);
          break;
        default:
          throw new Error('نوع التمرين غير صحيح');
      }

      if (response.success && response.data) {
        setExercise(response.data);
      } else {
        console.error('API Response Error:', response);
        throw new Error(response.error || 'فشل في تحميل التفاصيل');
      }
    } catch (error: any) {
      console.error('Error fetching exercise:', error);
      console.error('Exercise ID:', exerciseId);
      console.error('Exercise Type:', exerciseType);
      console.error('Lab ID:', labId);
      // Don't set exercise to null here, let the error state show
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = () => {
    switch (exerciseType) {
      case 'lesson-exercise':
        return 'تمرين درس';
      case 'lesson-exam':
        return 'اختبار درس';
      case 'unit-exercise':
        return 'تمرين وحدة';
      case 'unit-exam':
        return 'اختبار وحدة';
      case 'course-exam':
        return 'اختبار دورة';
      case 'course-review-exercise':
        return 'تمرين مراجعة الدورة';
      default:
        return 'تمرين';
    }
  };

  const getTypeIcon = () => {
    switch (exerciseType) {
      case 'lesson-exercise':
      case 'lesson-exam':
        return <BookOpen className="w-6 h-6" />;
      case 'unit-exercise':
      case 'unit-exam':
        return <Layers className="w-6 h-6" />;
      case 'course-exam':
      case 'course-review-exercise':
        return <GraduationCap className="w-6 h-6" />;
      default:
        return <FileQuestion className="w-6 h-6" />;
    }
  };

  const parseOptions = (question: any) => {
    // Handle true/false questions
    if (question.question_type === 'true_false') {
      return [
        { id: 'true', label: 'أ', text: 'صحيح', value: 'true' },
        { id: 'false', label: 'ب', text: 'خطأ', value: 'false' }
      ];
    }

    // Options is stored as JSONField - array of objects with id and text
    const optionsData = question.options || question.choices || [];
    
    if (!optionsData || (Array.isArray(optionsData) && optionsData.length === 0)) {
      return [];
    }

    try {
      // If it's already an array
      let parsed: any[] = [];
      if (Array.isArray(optionsData)) {
        parsed = optionsData;
      } else if (typeof optionsData === 'string') {
        // Try to parse if it's a string
        parsed = JSON.parse(optionsData);
      } else {
        parsed = [optionsData];
      }
      
      if (Array.isArray(parsed)) {
        return parsed.map((opt: any, idx: number) => {
          if (typeof opt === 'object' && opt !== null) {
            return {
              id: opt.id || String(idx), // Ensure id is present - this is what correct_answer references
              label: opt.label || String.fromCharCode(1570 + idx),
              text: opt.text || opt.id || String(opt),
              value: opt.value || opt.id || String(idx)
            };
          }
          return {
            id: String(idx),
            label: String.fromCharCode(1570 + idx),
            text: String(opt),
            value: String(idx)
          };
        });
      }
    } catch {
      // Fallback: split by comma if it's a string
      if (typeof optionsData === 'string') {
        const parts = optionsData.split(',').map(s => s.trim()).filter(Boolean);
        return parts.map((part, idx) => ({
          id: String(idx),
          label: String.fromCharCode(1570 + idx),
          text: part,
          value: String(idx)
        }));
      }
    }
    
    return [];
  };

  const getQuestionTypeLabel = (question: any) => {
    const type = question.question_type_display || question.question_type || '';
    
    // Translate common English types
    if (type.toLowerCase().includes('multiple choice') || type === 'multiple_choice') {
      return 'الاختيار من متعدد';
    }
    if (type.toLowerCase().includes('true false') || type === 'true_false') {
      return 'صحيح / خطأ';
    }
    
    // Return as is if already in Arabic or unknown
    return type;
  };

  const getCorrectAnswer = (question: any): string[] => {
    console.log('🔍 getCorrectAnswer - Question:', question.id);
    console.log('🔍 getCorrectAnswer - correct_answer raw:', question.correct_answer);
    console.log('🔍 getCorrectAnswer - correct_answer type:', typeof question.correct_answer);
    
    if (!question.correct_answer) {
      console.log('❌ No correct_answer found');
      return [];
    }

    // Handle true/false questions
    if (question.question_type === 'true_false') {
      const answer = question.correct_answer;
      console.log('🔍 True/False question - answer:', answer);
      
      // If it's already an array
      if (Array.isArray(answer)) {
        const result = answer.map((a: any) => {
          if (a === true || a === 'true' || String(a).toLowerCase() === 'true') return 'true';
          return 'false';
        });
        console.log('✅ True/False array result:', result);
        return result;
      }
      
      // If it's a string
      if (typeof answer === 'string') {
        try {
          const parsed = JSON.parse(answer);
          const result = parsed === true || parsed === 'true' || String(parsed).toLowerCase() === 'true' ? ['true'] : ['false'];
          console.log('✅ True/False parsed result:', result);
          return result;
        } catch {
          const result = answer === 'true' || answer === true ? ['true'] : ['false'];
          console.log('✅ True/False string result:', result);
          return result;
        }
      }
      
      // If it's boolean
      const result = answer === true || answer === 'true' ? ['true'] : ['false'];
      console.log('✅ True/False boolean result:', result);
      return result;
    }

    // Handle multiple choice - correct_answer is stored as array of option IDs
    if (Array.isArray(question.correct_answer)) {
      const result = question.correct_answer.map((a: any) => String(a));
      console.log('✅ Multiple choice array result:', result);
      return result;
    }
    
    // If it's a string, try to parse it
    if (typeof question.correct_answer === 'string') {
      try {
        const parsed = JSON.parse(question.correct_answer);
        const result = Array.isArray(parsed) ? parsed.map((a: any) => String(a)) : [String(parsed)];
        console.log('✅ Multiple choice parsed result:', result);
        return result;
      } catch {
        const result = [String(question.correct_answer)];
        console.log('✅ Multiple choice string result:', result);
        return result;
      }
    }
    
    // Fallback
    const result = [String(question.correct_answer)];
    console.log('✅ Fallback result:', result);
    return result;
  };

  const getAttemptType = (): 'lesson_exercise' | 'lesson_exam' | 'unit_exercise' | 'unit_exam' | 'course_exam' | 'course_review' => {
    switch (exerciseType) {
      case 'lesson-exercise':
        return 'lesson_exercise';
      case 'lesson-exam':
        return 'lesson_exam';
      case 'unit-exercise':
        return 'unit_exercise';
      case 'unit-exam':
        return 'unit_exam';
      case 'course-exam':
        return 'course_exam';
      case 'course-review-exercise':
        return 'course_review';
      default:
        return 'lesson_exercise';
    }
  };

  const getExerciseTypeModel = (): string => {
    switch (exerciseType) {
      case 'lesson-exercise':
        return 'lessonexercise';
      case 'lesson-exam':
        return 'lessonexam';
      case 'unit-exercise':
        return 'unitexercise';
      case 'unit-exam':
        return 'unitexam';
      case 'course-exam':
        return 'courseexam';
      case 'course-review-exercise':
        return 'coursereviewexercise';
      default:
        return 'lessonexercise';
    }
  };

  const handleStartExercise = async () => {
    try {
      const attemptResponse = await knowledgeLabApi.startStudentAttempt({
        knowledge_lab: labId,
        attempt_type: getAttemptType(),
        exercise_type: getExerciseTypeModel(),
        exercise_id: exerciseId
      });

      console.log('📝 Attempt Response (Full):', JSON.stringify(attemptResponse, null, 2));
      console.log('📝 Attempt Response Success:', attemptResponse.success);
      console.log('📝 Attempt Response Data:', attemptResponse.data);
      console.log('📝 Attempt Response Data Type:', typeof attemptResponse.data);
      console.log('📝 Attempt Response Data Keys:', attemptResponse.data ? Object.keys(attemptResponse.data) : 'No data');

      if (attemptResponse.success && attemptResponse.data) {
        const attemptData = attemptResponse.data;
        console.log('📝 Full Attempt Data (JSON):', JSON.stringify(attemptData, null, 2));
        console.log('📝 Attempt Data Keys:', Object.keys(attemptData));
        console.log('📝 Attempt ID:', attemptData.id);
        console.log('📝 Attempt ID Type:', typeof attemptData.id);
        
        // Handle different response structures
        let attemptId = attemptData.id;
        if (!attemptId && (attemptData as any).pk) {
          attemptId = (attemptData as any).pk;
          console.log('📝 Found ID in pk:', attemptId);
        }
        if (!attemptId && (attemptData as any).uuid) {
          attemptId = (attemptData as any).uuid;
          console.log('📝 Found ID in uuid:', attemptId);
        }
        
        // Check if response.data itself is the ID (sometimes API returns just the ID)
        if (!attemptId && typeof attemptResponse.data === 'string') {
          attemptId = attemptResponse.data;
          console.log('📝 Response data is the ID itself:', attemptId);
        }
        
        if (!attemptId) {
          console.error('❌ Attempt ID is missing!');
          console.error('❌ Attempt Data:', attemptData);
          console.error('❌ Attempt Response Full:', JSON.stringify(attemptResponse, null, 2));
          toast.error('فشل في بدء التمرين: معرف المحاولة غير موجود. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.');
          return;
        }

        // Ensure ID is a string
        const finalAttemptData = {
          ...attemptData,
          id: String(attemptId)
        };

        console.log('✅ Final Attempt Data with ID:', finalAttemptData);
        console.log('✅ Setting attempt state with ID:', finalAttemptData.id);
        setAttempt(finalAttemptData);
        setExerciseStarted(true);
        setStartTime(new Date());
        toast.success('تم بدء التمرين!');
      } else {
        console.error('❌ Failed to start attempt');
        console.error('❌ Success:', attemptResponse.success);
        console.error('❌ Error:', attemptResponse.error);
        console.error('❌ Full Response:', JSON.stringify(attemptResponse, null, 2));
        toast.error(attemptResponse.error || 'فشل في بدء التمرين');
      }
    } catch (error: any) {
      console.error('Error starting exercise:', error);
      toast.error('حدث خطأ أثناء بدء التمرين');
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    console.log('✅ Answer changed:', { questionId, answer });
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: [answer] // Store as array for API compatibility
      };
      console.log('✅ Updated answers:', newAnswers);
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (exercise?.questions && currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!attempt || submitting) {
      console.error('❌ Cannot submit: attempt is', attempt, 'submitting is', submitting);
      if (!attempt) {
        toast.error('لم يتم بدء التمرين بعد. يرجى الضغط على "بدء التمرين" أولاً.');
      }
      return;
    }

    if (!attempt.id) {
      console.error('❌ Attempt ID is missing!', attempt);
      toast.error('خطأ: معرف المحاولة غير موجود. يرجى إعادة بدء التمرين.');
      return;
    }

    try {
      setSubmitting(true);

      console.log('📤 Submitting answers with attempt ID:', attempt.id);
      console.log('📤 Answers:', answers);

      // Format answers for API
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswers]) => ({
        question_id: questionId,
        selected_answer: selectedAnswers || []
      }));

      console.log('📤 Formatted Answers:', formattedAnswers);
      console.log('📤 Formatted Answers (JSON):', JSON.stringify(formattedAnswers, null, 2));

      // Send answers as array directly (not stringified) - Django JSONField handles it
      const submitResponse = await knowledgeLabApi.submitStudentAnswers(attempt.id, {
        answers: formattedAnswers
      });

      console.log('📥 Submit Response:', submitResponse);

      if (submitResponse.success) {
        // Use the response data directly (it includes exercise with correct answers)
        if (submitResponse.data) {
          setAttempt(submitResponse.data);
          
          // Update exercise with questions that include correct_answer
          if (submitResponse.data.exercise && submitResponse.data.exercise.questions) {
            setExercise({
              ...exercise,
              questions: submitResponse.data.exercise.questions
            });
            console.log('✅ Updated exercise with questions including correct_answer:', submitResponse.data.exercise.questions);
          }
          
          setShowResults(true);
          toast.success('تم إرسال الإجابات بنجاح!');
        } else {
          // Fallback: Fetch updated attempt
          const updatedAttempt = await knowledgeLabApi.getStudentAttempt(attempt.id);
          if (updatedAttempt.success && updatedAttempt.data) {
            setAttempt(updatedAttempt.data);
            
            // Update exercise if available
            if (updatedAttempt.data.exercise && updatedAttempt.data.exercise.questions) {
              setExercise({
                ...exercise,
                questions: updatedAttempt.data.exercise.questions
              });
            }
            
            setShowResults(true);
            toast.success('تم إرسال الإجابات بنجاح!');
          }
        }
      } else {
        toast.error(submitResponse.error || 'فشل في إرسال الإجابات');
      }
    } catch (error: any) {
      console.error('Error submitting answers:', error);
      toast.error('حدث خطأ أثناء إرسال الإجابات');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimerComplete = () => {
    toast.warning('انتهى الوقت المخصص للتمرين!');
    handleSubmit();
  };

  const formatTimeLimit = (seconds?: number) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return { hours, minutes: remainingMinutes };
  };

  const getCurrentQuestion = () => {
    if (!exercise?.questions) return null;
    return exercise.questions[currentQuestionIndex];
  };

  const isAnswerCorrect = (question: any, answer: string): boolean => {
    const correctAnswers = getCorrectAnswer(question);
    return correctAnswers.includes(String(answer));
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6" dir="rtl">
          <div className="max-w-5xl mx-auto">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل التفاصيل...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!exercise) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6" dir="rtl">
          <div className="max-w-5xl mx-auto">
            <Card className="border-orange-200 shadow-lg">
              <CardContent className="py-12 text-center">
                <p className="text-lg text-gray-600 mb-4">لم يتم العثور على التمرين</p>
                <Button onClick={() => router.push(`/knowledge-lab/${labId}/manage`)}>
                  العودة إلى المختبر
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6" dir="rtl">
        <div className="max-w-5xl mx-auto space-y-6 mt-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => router.push(`/knowledge-lab/${labId}`)}
              className="flex items-center gap-2 border-orange-200 hover:bg-orange-50"
            >
              <ArrowRight className="w-4 h-4" />
              العودة
            </Button>
            {exerciseStarted && !showResults && exercise?.time_limit && exercise.time_limit > 0 && (
              <div className="flex items-center gap-2">
                <CountdownTimer
                  duration={exercise.time_limit}
                  onComplete={handleTimerComplete}
                  onTimeWarning={() => toast.warning('انتبه! الوقت المتبقي قليل')}
                />
              </div>
            )}
          </div>

          {/* Exercise Header Card */}
          <Card className="border-orange-200 shadow-xl bg-white">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                {getTypeIcon()}
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{exercise.title}</CardTitle>
                  <CardDescription className="text-orange-100">
                    {getTypeLabel()}
                    {'lesson_title' in exercise && exercise.lesson_title && (
                      <> - الدرس: {exercise.lesson_title}</>
                    )}
                    {'unit_title' in exercise && exercise.unit_title && (
                      <> - الوحدة: {exercise.unit_title}</>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Description for Course Exam */}
              {'description' in exercise && exercise.description && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border-r-4 border-orange-400">
                  <h4 className="font-semibold mb-2 text-gray-800">الوصف:</h4>
                  <p className="text-gray-700">{exercise.description}</p>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 flex-wrap mb-6">
                <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 text-base">
                  <FileQuestion className="w-5 h-5" />
                  {exercise.questions?.length || 0} سؤال
                </Badge>
                {'time_limit' in exercise && exercise.time_limit && (
                  <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 text-base">
                    <Clock className="w-5 h-5" />
                    {Math.floor(exercise.time_limit / 60)} دقيقة
                  </Badge>
                )}
                <Badge variant="outline" className="px-4 py-2 text-base">
                  {new Date(exercise.created_at).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Start Exercise Button or Exercise Interface */}
          {!exerciseStarted ? (
            <Card className="border-2 border-orange-200 shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                      <Play className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">جاهز للبدء؟</h2>
                    <p className="text-gray-600 max-w-md">
                      سيبدأ التمرين عند الضغط على الزر أدناه. تأكد من أنك جاهز قبل البدء.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <FileQuestion className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-600">{exercise.questions?.length || 0}</p>
                      <p className="text-sm text-gray-600">سؤال</p>
                    </div>
                    {exercise.time_limit && (
                      <div className="p-4 bg-amber-50 rounded-lg">
                        <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-amber-600">{Math.floor(exercise.time_limit / 60)}</p>
                        <p className="text-sm text-gray-600">دقيقة</p>
                      </div>
                    )}
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-600">
                        {exercise.questions?.reduce((sum: number, q: any) => sum + (q.points || 1), 0) || 0}
                      </p>
                      <p className="text-sm text-gray-600">نقطة</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartExercise}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg px-8 py-6"
                    size="lg"
                  >
                    <Play className="w-5 h-5 ml-2" />
                    بدء التمرين
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : showResults && attempt ? (
            /* Results View */
            <Card className="border-2 border-blue-200 shadow-xl bg-blue-50">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  نتائج التمرين
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-white rounded-lg">
                    <p className="text-4xl font-bold text-blue-600">{attempt.score || 0}%</p>
                    <p className="text-sm text-gray-600 mt-2">النسبة المئوية</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg">
                    <p className="text-4xl font-bold text-orange-600">{attempt.points_earned || 0}</p>
                    <p className="text-sm text-gray-600 mt-2">من {attempt.total_points || 0} نقطة</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">
                      {attempt.time_taken ? Math.floor(attempt.time_taken / 60) : 0} دقيقة
                    </p>
                    <p className="text-sm text-gray-600 mt-2">الوقت المستغرق</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800">تفاصيل الإجابات:</h3>
                  {exercise.questions?.map((question: any, index: number) => {
                    const userAnswer = answers[question.id]?.[0];
                    let correctAnswers = getCorrectAnswer(question);
                    const isCorrect = userAnswer && isAnswerCorrect(question, userAnswer);
                    const options = parseOptions(question);
                    
                    // Try to get correct answer from attempt.answers if question.correct_answer is missing
                    if (correctAnswers.length === 0 && attempt.answers) {
                      try {
                        const attemptAnswer = typeof attempt.answers === 'string' 
                          ? JSON.parse(attempt.answers) 
                          : attempt.answers;
                        if (Array.isArray(attemptAnswer)) {
                          const questionAttempt = attemptAnswer.find((a: any) => 
                            String(a.question_id) === String(question.id)
                          );
                          if (questionAttempt && questionAttempt.selected_answer) {
                            // We can't get the correct answer from attempt, but we can try to infer it
                            // by checking all options and seeing which one would make it correct
                            console.log('⚠️ No correct_answer in question, trying to infer from attempt');
                          }
                        }
                      } catch (e) {
                        console.error('Error parsing attempt.answers:', e);
                      }
                    }
                    
                    // Get user answer text
                    let userAnswerText = 'لم تجب';
                    if (userAnswer) {
                      if (question.question_type === 'true_false') {
                        userAnswerText = userAnswer === 'true' ? 'صحيح' : 'خطأ';
                      } else {
                        const userOption = options.find((opt: any) => 
                          String(opt.value) === String(userAnswer) || 
                          String(opt.id) === String(userAnswer)
                        );
                        userAnswerText = userOption?.text || userAnswer;
                      }
                    }
                    
                    // Get correct answer text
                    let correctAnswerText = 'غير محدد';
                    if (correctAnswers.length > 0) {
                      console.log(`📝 Question ${index + 1} - Correct Answers:`, correctAnswers);
                      console.log(`📝 Question ${index + 1} - Options:`, options);
                      console.log(`📝 Question ${index + 1} - Question Type:`, question.question_type);
                      console.log(`📝 Question ${index + 1} - Correct Answer Raw:`, question.correct_answer);
                      
                      if (question.question_type === 'true_false') {
                        correctAnswerText = correctAnswers[0] === 'true' ? 'صحيح' : 'خطأ';
                      } else {
                        const correctTexts = correctAnswers.map((ans: string) => {
                          console.log(`📝 Looking for answer ID: "${ans}" (type: ${typeof ans})`);
                          console.log(`📝 Available options:`, options);
                          
                          // correct_answer contains option IDs, so we need to match by option.id
                          // Try to find by option.id first (this is the primary match)
                          let opt = options.find((o: any) => {
                            const optionId = String(o.id || o.value || '');
                            const answerId = String(ans);
                            return optionId === answerId;
                          });
                          console.log(`📝 Found by option.id:`, opt);
                          
                          if (!opt) {
                            // Try to find by value
                            opt = options.find((o: any) => String(o.value) === String(ans));
                            console.log(`📝 Found by value:`, opt);
                          }
                          
                          if (!opt) {
                            // Try to find by index (if answer is numeric)
                            const ansIndex = parseInt(String(ans));
                            if (!isNaN(ansIndex) && options[ansIndex]) {
                              opt = options[ansIndex];
                              console.log(`📝 Found by index ${ansIndex}:`, opt);
                            }
                          }
                          
                          if (!opt) {
                            // Try to find by label
                            opt = options.find((o: any) => String(o.label) === String(ans));
                            console.log(`📝 Found by label:`, opt);
                          }
                          
                          if (!opt) {
                            // Try to find by text (last resort)
                            opt = options.find((o: any) => String(o.text) === String(ans));
                            console.log(`📝 Found by text:`, opt);
                          }
                          
                          const result = opt?.text || opt?.label || ans;
                          console.log(`📝 Final result for "${ans}":`, result);
                          return result;
                        });
                        correctAnswerText = correctTexts.join(' أو ');
                        console.log(`📝 Final correct answer text:`, correctAnswerText);
                      }
                    } else {
                      console.log(`📝 Question ${index + 1} - No correct answers found!`);
                      console.log(`📝 Question correct_answer field:`, question.correct_answer);
                    }
                    
                    return (
                      <Card key={question.id || index} className="border-2 border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={isCorrect ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}>
                                  {isCorrect ? '✓ صحيح' : '✗ خاطئ'}
                                </Badge>
                                <span className="text-sm text-gray-600">سؤال {index + 1}</span>
                                <Badge variant="outline" className="text-xs">
                                  {question.points || 1} نقطة
                                </Badge>
                              </div>
                              <p className="font-semibold text-gray-800 text-lg mb-2">{question.text}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-3">
                            <div className={`p-4 rounded-lg border-2 ${isCorrect ? 'bg-blue-50 border-blue-300' : 'bg-red-50 border-red-300'}`}>
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <span className="font-semibold text-gray-700 min-w-[80px]">إجابتك:</span>
                                  <span className={`font-medium ${isCorrect ? 'text-blue-700' : 'text-red-700'}`}>
                                    {userAnswerText}
                                  </span>
                                </div>
                                <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                                  <span className="font-semibold text-gray-700 min-w-[100px]">الإجابة الصحيحة:</span>
                                  <span className="font-bold text-blue-700">
                                    {correctAnswerText}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {question.explanation && (
                              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <span className="font-semibold text-blue-800 min-w-[50px]">الشرح:</span>
                                  <p className="text-sm text-blue-900">{question.explanation}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => router.push(`/knowledge-lab/${labId}`)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    العودة للمختبر
                  </Button>
                  <Button
                    onClick={() => {
                      setExerciseStarted(false);
                      setShowResults(false);
                      setAnswers({});
                      setCurrentQuestionIndex(0);
                      setAttempt(null);
                    }}
                    variant="outline"
                    className="flex-1 border-orange-200 hover:bg-orange-50"
                  >
                    <RotateCcw className="w-4 h-4 ml-2" />
                    إعادة المحاولة
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Active Exercise View */
              <div className="space-y-6">
              {/* Progress Bar */}
              <Card className="border-orange-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      السؤال {currentQuestionIndex + 1} من {exercise.questions?.length || 0}
                    </span>
                    <span className="text-sm text-gray-600">
                      تم الإجابة على {Object.keys(answers).length} سؤال
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / (exercise.questions?.length || 1)) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Current Question */}
              {getCurrentQuestion() && (() => {
                const question = getCurrentQuestion()!;
                  const options = parseOptions(question);
                const userAnswer = answers[question.id]?.[0] || '';
                  
                  return (
                  <Card className="border-2 border-orange-200 shadow-xl">
                      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <Badge className="bg-orange-500 text-white text-sm px-3 py-1">
                              سؤال {currentQuestionIndex + 1}
                              </Badge>
                              <Badge variant="outline" className="text-sm">
                                {getQuestionTypeLabel(question)}
                              </Badge>
                              <Badge variant="outline" className="text-sm">
                              {question.points || 1} نقطة
                              </Badge>
                            </div>
                            <CardTitle className="text-xl text-gray-900 mb-0">
                              {question.text}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                      <RadioGroup
                        value={userAnswer}
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                      >
                        <div className="space-y-3">
                              {options.map((option: any, optIdx: number) => {
                            // Use option.id (not option.value) because correct_answer contains IDs
                            const optionId = String(option.id || option.value || optIdx);
                            const isSelected = userAnswer === optionId;
                                
                                return (
                                  <div
                                    key={optIdx}
                                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-orange-50 border-orange-500'
                                    : 'bg-white border-gray-200 hover:border-orange-300'
                                }`}
                                onClick={() => handleAnswerChange(question.id, optionId)}
                              >
                                <Label
                                  htmlFor={`option-${optIdx}`}
                                  className="flex items-center gap-3 cursor-pointer"
                                >
                                  <RadioGroupItem value={optionId} id={`option-${optIdx}`} />
                                      <div className="flex-1">
                                    <span className="font-semibold text-gray-700">
                                      {option.label && option.label !== option.id ? `${option.label}. ` : ''}
                                      {option.text}
                                    </span>
                                      </div>
                                </Label>
                                  </div>
                                );
                              })}
                            </div>
                      </RadioGroup>
                      </CardContent>
                    </Card>
                );
              })()}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="border-orange-200 hover:bg-orange-50"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  السابق
                </Button>

                <div className="flex gap-2">
                  {currentQuestionIndex === (exercise.questions?.length || 0) - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || Object.keys(answers).length === 0}
                      className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 ml-2" />
                          إرسال الإجابات
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                    >
                      التالي
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Questions Navigation Dots */}
              {exercise.questions && exercise.questions.length > 1 && (
                <Card className="border-orange-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {exercise.questions.map((_, index) => {
                        const question = exercise.questions[index];
                        const isAnswered = answers[question.id];
                        const isCurrent = index === currentQuestionIndex;

                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                              isCurrent
                                ? 'bg-orange-500 text-white scale-110'
                                : isAnswered
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {index + 1}
                          </button>
                  );
                })}
              </div>
                </CardContent>
              </Card>
            )}
          </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

