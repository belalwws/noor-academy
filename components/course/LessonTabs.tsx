'use client';

import { motion } from 'framer-motion';
import { CheckCircle, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Lesson {
  id: number;
  title: string;
  description: string;
  video_duration?: number;
  unit_title?: string;
}

interface Course {
  title: string;
  description?: string;
  learning_outcomes?: string;
  teacher_name?: string;
}

interface LessonTabsProps {
  lesson: Lesson;
  course: Course;
  onComplete: () => void;
  onNext: () => void;
}

export default function LessonTabs({ lesson, course, onComplete, onNext }: LessonTabsProps) {
  return (
    <div className="bg-white dark:bg-slate-800">
      {/* محتوى الدرس */}
      <div className="p-6 max-w-5xl">
        <motion.div
          key="overview"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
              {/* معلومات الدرس */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {lesson.title}
                </h2>
                {lesson.description && (
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {lesson.description}
                  </p>
                )}
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {lesson.video_duration && (
                    <Badge variant="outline" className="gap-1">
                      {Math.round(lesson.video_duration / 60)} دقيقة
                    </Badge>
                  )}
                  {lesson.unit_title && (
                    <Badge className="bg-[#E9A821]/10 text-[#E9A821] border-0">
                      {lesson.unit_title}
                    </Badge>
                  )}
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={onNext}
                    className="bg-[#E9A821] hover:bg-[#FFB347] text-white"
                    size="lg"
                  >
                    <SkipForward className="w-4 h-4 ml-2" />
                    الانتقال للدرس التالي
                  </Button>
                </div>
              </div>

              {/* نبذة عن الدورة */}
              {course.description && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    نبذة عن الدورة
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {course.description}
                  </p>
                </div>
              )}

              {/* مخرجات التعلم */}
              {course.learning_outcomes && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    ماذا ستتعلم
                  </h3>
                  <div className="space-y-2">
                    {course.learning_outcomes.split('\n').filter(line => line.trim()).map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#E9A821] shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300">
                          {outcome.replace(/^[-•]\s*/, '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* معلومات المعلم */}
              {course.teacher_name && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    المعلم
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E9A821] to-[#FFB347] flex items-center justify-center text-white font-bold text-lg">
                      {course.teacher_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {course.teacher_name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        مدرب معتمد
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
      </div>
    </div>
  );
}

