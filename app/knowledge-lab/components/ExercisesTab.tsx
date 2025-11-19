'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, GraduationCap, Layers, BookMarked, FileText
} from 'lucide-react';
import { LessonExercisesTab } from './exercises/LessonExercisesTab';
import { LessonExamsTab } from './exercises/LessonExamsTab';
import { UnitExercisesTab } from './exercises/UnitExercisesTab';
import { UnitExamsTab } from './exercises/UnitExamsTab';
import { CourseExamsTab } from './exercises/CourseExamsTab';
import { CourseReviewExercisesTab } from './exercises/CourseReviewExercisesTab';

interface ExercisesTabProps {
  labId: string;
  courseId?: string;
}

export function ExercisesTab({ labId, courseId }: ExercisesTabProps) {
  const [activeTab, setActiveTab] = useState('lesson-exercises');

  return (
    <div className="space-y-6" dir="rtl">
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full grid-cols-6 bg-orange-50" dir="rtl">
          <TabsTrigger value="lesson-exercises" dir="rtl" className="text-xs md:text-sm">
            <BookOpen className="w-4 h-4 ml-1" />
            تمارين الدروس
          </TabsTrigger>
          <TabsTrigger value="lesson-exams" dir="rtl" className="text-xs md:text-sm">
            <GraduationCap className="w-4 h-4 ml-1" />
            اختبارات الدروس
          </TabsTrigger>
          <TabsTrigger value="unit-exercises" dir="rtl" className="text-xs md:text-sm">
            <Layers className="w-4 h-4 ml-1" />
            تمارين الوحدات
          </TabsTrigger>
          <TabsTrigger value="unit-exams" dir="rtl" className="text-xs md:text-sm">
            <BookMarked className="w-4 h-4 ml-1" />
            اختبارات الوحدات
          </TabsTrigger>
          <TabsTrigger value="course-exams" dir="rtl" className="text-xs md:text-sm">
            <GraduationCap className="w-4 h-4 ml-1" />
            اختبارات الدورة
          </TabsTrigger>
          <TabsTrigger value="course-review-exercises" dir="rtl" className="text-xs md:text-sm">
            <FileText className="w-4 h-4 ml-1" />
            تمارين المراجعة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lesson-exercises" className="mt-6" dir="rtl">
          <LessonExercisesTab labId={labId} courseId={courseId} />
        </TabsContent>

        <TabsContent value="lesson-exams" className="mt-6" dir="rtl">
          <LessonExamsTab labId={labId} courseId={courseId} />
        </TabsContent>

        <TabsContent value="unit-exercises" className="mt-6" dir="rtl">
          <UnitExercisesTab labId={labId} courseId={courseId} />
        </TabsContent>

        <TabsContent value="unit-exams" className="mt-6" dir="rtl">
          <UnitExamsTab labId={labId} courseId={courseId} />
        </TabsContent>

        <TabsContent value="course-exams" className="mt-6" dir="rtl">
          <CourseExamsTab labId={labId} />
        </TabsContent>

        <TabsContent value="course-review-exercises" className="mt-6" dir="rtl">
          <CourseReviewExercisesTab labId={labId} courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

