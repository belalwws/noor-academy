'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, FileQuestion, BookOpen, Layers, GraduationCap } from 'lucide-react';
import type { 
  LessonExercise, 
  LessonExam, 
  UnitExercise, 
  UnitExam, 
  CourseExam 
} from '@/lib/api/knowledge-lab';

type ExerciseType = LessonExercise | LessonExam | UnitExercise | UnitExam | CourseExam;

interface ExerciseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: ExerciseType | null;
  type: 'lesson-exercise' | 'lesson-exam' | 'unit-exercise' | 'unit-exam' | 'course-exam';
}

export function ExerciseDetailsDialog({
  open,
  onOpenChange,
  exercise,
  type,
}: ExerciseDetailsDialogProps) {
  if (!exercise) return null;

  const getTypeLabel = () => {
    switch (type) {
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
      default:
        return 'تمرين';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'lesson-exercise':
      case 'lesson-exam':
        return <BookOpen className="w-5 h-5" />;
      case 'unit-exercise':
      case 'unit-exam':
        return <Layers className="w-5 h-5" />;
      case 'course-exam':
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <FileQuestion className="w-5 h-5" />;
    }
  };

  const parseOptions = (options: string) => {
    try {
      if (typeof options === 'string') {
        const parsed = JSON.parse(options);
        if (Array.isArray(parsed)) {
          return parsed.map((opt: any) => 
            typeof opt === 'object' ? opt.text || opt.id : opt
          );
        }
        return [];
      }
      return [];
    } catch {
      // If not JSON, try splitting by comma
      if (typeof options === 'string') {
        return options.split(',').map(s => s.trim()).filter(Boolean);
      }
      return [];
    }
  };

  const getCorrectAnswer = (question: any) => {
    if (question.correct_answer) {
      if (Array.isArray(question.correct_answer)) {
        return question.correct_answer;
      }
      if (typeof question.correct_answer === 'string') {
        try {
          const parsed = JSON.parse(question.correct_answer);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return [question.correct_answer];
        }
      }
    }
    return [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} dir="rtl">
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <DialogTitle className="text-xl">{exercise.title}</DialogTitle>
          </div>
          <DialogDescription className="text-right">
            {getTypeLabel()}
            {'lesson_title' in exercise && exercise.lesson_title && (
              <> - الدرس: {exercise.lesson_title}</>
            )}
            {'unit_title' in exercise && exercise.unit_title && (
              <> - الوحدة: {exercise.unit_title}</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description for Course Exam */}
          {'description' in exercise && exercise.description && (
            <div>
              <h4 className="font-semibold mb-2">الوصف:</h4>
              <p className="text-sm text-gray-600">{exercise.description}</p>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="outline" className="flex items-center gap-1">
              <FileQuestion className="w-4 h-4" />
              {exercise.questions?.length || 0} سؤال
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.floor(exercise.time_limit / 60)} دقيقة
            </Badge>
            <Badge variant="outline">
              {new Date(exercise.created_at).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Badge>
          </div>

          {/* Questions List */}
          <div>
            <h4 className="font-semibold mb-3 text-lg">الأسئلة:</h4>
            {exercise.questions && exercise.questions.length > 0 ? (
              <div className="space-y-4">
                {exercise.questions.map((question, index) => {
                  const options = parseOptions(question.options || '');
                  const correctAnswers = getCorrectAnswer(question);
                  
                  return (
                    <div
                      key={question.id || index}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              سؤال #{index + 1}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {question.question_type_display || question.question_type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {question.points} نقطة
                            </Badge>
                          </div>
                          <p className="font-medium text-gray-900 mb-3">
                            {question.text}
                          </p>
                        </div>
                      </div>

                      {/* Options */}
                      {options.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-600 mb-2">الخيارات:</p>
                          <div className="space-y-1">
                            {options.map((option: string, optIdx: number) => {
                              const isCorrect = correctAnswers.some((ans: any) => {
                                const ansStr = typeof ans === 'string' ? ans : String(ans);
                                return ansStr === String(optIdx) || 
                                       ansStr === option || 
                                       String(ans) === String(optIdx);
                              });
                              
                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2 rounded text-sm ${
                                    isCorrect
                                      ? 'bg-green-100 text-green-800 font-medium border border-green-300'
                                      : 'bg-white border border-gray-200'
                                  }`}
                                >
                                  <span className="font-medium ml-2">
                                    {String.fromCharCode(1570 + optIdx)}:
                                  </span>
                                  {option}
                                  {isCorrect && (
                                    <span className="mr-2 text-green-600">✓</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Correct Answer */}
                      {correctAnswers.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            الإجابة الصحيحة:
                          </p>
                          <p className="text-sm font-semibold text-green-700">
                            {correctAnswers.map((ans: any, idx: number) => {
                              const ansStr = String(ans);
                              const optionIdx = parseInt(ansStr);
                              if (!isNaN(optionIdx) && options[optionIdx]) {
                                return options[optionIdx];
                              }
                              return ansStr;
                            }).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                لا توجد أسئلة في هذا التمرين
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

