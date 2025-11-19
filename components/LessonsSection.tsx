'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Clock, 
  Calendar,
  Play,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';

interface Lesson {
  id: string | number;
  title: string;
  description: string;
  order: number;
  duration_minutes?: number | null;
  objectives?: string;
  materials?: string;
  homework?: string;
  sessions_count?: number;
  created_at: string;
  updated_at: string;
}

interface LessonsSectionProps {
  lessons: Lesson[];
  onLessonClick: (lessonId: string | number) => void;
  selectedLesson: Lesson | null;
  isRecordedCourse?: boolean;
}

export default function LessonsSection({ 
  lessons, 
  onLessonClick, 
  selectedLesson,
  isRecordedCourse = false
}: LessonsSectionProps) {
  
  const [expandedLessons, setExpandedLessons] = useState<Set<string | number>>(new Set());

  const toggleLesson = (lessonId: string | number) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  if (!lessons || lessons.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">محتويات الدورة</h2>
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors duration-300">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">لا توجد دروس متاحة</h3>
          <p className="text-gray-600 dark:text-slate-400">لم يتم إضافة دروس لهذه الدورة بعد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lessons Header */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">محتويات الدورة</h2>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-400">
          <span>{lessons.length} درس</span>
          {isRecordedCourse && (
            <>
              <span>•</span>
              <span>{lessons.reduce((total, lesson) => total + (lesson.duration_minutes || 0), 0)} دقيقة إجمالي</span>
            </>
          )}
        </div>
      </div>

      {/* Lessons List */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden transition-colors duration-300">
        {lessons.map((lesson, index) => {
          const isExpanded = expandedLessons.has(lesson.id);
          const isSelected = selectedLesson?.id === lesson.id;
          
          return (
            <div 
              key={lesson.id} 
              className={`border-b border-gray-200 dark:border-slate-700 last:border-b-0 transition-colors duration-300 ${
                isSelected ? 'bg-green-50 dark:bg-orange-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {/* Lesson Header */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleLesson(lesson.id)}
              >
                <div className="flex items-center gap-4">
                  {/* Lesson Number */}
                  <div className="w-8 h-8 bg-green-600 dark:bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {lesson.order || index + 1}
                  </div>
                  
                  {/* Lesson Title */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-1">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                      {lesson.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.duration_minutes} دقيقة</span>
                        </div>
                      )}
                      {lesson.sessions_count && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{lesson.sessions_count} جلسة</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Expand/Collapse Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Lesson Details (Expanded) */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-white">
                  <div className="pt-4 space-y-4">
                    {lesson.description && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">وصف الدرس</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {lesson.description}
                        </p>
                      </div>
                    )}
                    
                    {lesson.objectives && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">أهداف الدرس</h4>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {lesson.objectives}
                        </p>
                      </div>
                    )}
                    
                    {lesson.materials && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">المواد المطلوبة</h4>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {lesson.materials}
                        </p>
                      </div>
                    )}
                    
                    {lesson.homework && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">الواجب المنزلي</h4>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {lesson.homework}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(lesson.created_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLessonClick(lesson.id);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
                      >
                        <Eye className="w-4 h-4 ml-1" />
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Lesson Details */}
      {selectedLesson && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {selectedLesson.order || lessons.findIndex(l => l.id === selectedLesson.id) + 1}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedLesson.title}
              </h3>
            </div>
            
            {selectedLesson.description && selectedLesson.description.trim() && (
              <p className="text-gray-700 leading-relaxed">
                {selectedLesson.description}
              </p>
            )}
            
            {(!selectedLesson.description || !selectedLesson.description.trim()) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-yellow-800 font-medium">
                    لا يوجد وصف متاح لهذا الدرس
                  </p>
                </div>
                <p className="text-yellow-700 text-sm mt-2">
                  المدرس لم يضع وصفاً للدرس بعد. يمكنك التواصل مع المدرس للحصول على تفاصيل أكثر.
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
              {selectedLesson.duration_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span>{selectedLesson.duration_minutes} دقيقة</span>
                </div>
              )}
              {selectedLesson.sessions_count && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <span>{selectedLesson.sessions_count} جلسة</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-green-600" />
                <span>{new Date(selectedLesson.created_at).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
            
            {(selectedLesson.objectives || selectedLesson.materials || selectedLesson.homework) && (
              <div className="pt-4 border-t border-green-200 space-y-3">
                {selectedLesson.objectives && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">🎯</span>
                      </div>
                      أهداف الدرس
                    </div>
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{selectedLesson.objectives}</div>
                  </div>
                )}
                
                {selectedLesson.materials && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs">📚</span>
                      </div>
                      المواد المطلوبة
                    </div>
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{selectedLesson.materials}</div>
                  </div>
                )}
                
                {selectedLesson.homework && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 text-xs">✏️</span>
                      </div>
                      الواجب المنزلي
                    </div>
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{selectedLesson.homework}</div>
                  </div>
                )}
              </div>
            )}
            
            <div className="pt-4 border-t border-green-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">رقم الدرس</div>
                  <div className="text-gray-600">{selectedLesson.order}</div>
                </div>
                {selectedLesson.duration_minutes && (
                  <div className="bg-white p-3 rounded-lg">
                    <div className="font-medium text-gray-900 mb-1">المدة الزمنية</div>
                    <div className="text-gray-600">{selectedLesson.duration_minutes} دقيقة</div>
                  </div>
                )}
                {selectedLesson.sessions_count && (
                  <div className="bg-white p-3 rounded-lg">
                    <div className="font-medium text-gray-900 mb-1">عدد الجلسات</div>
                    <div className="text-gray-600">{selectedLesson.sessions_count} جلسة</div>
                  </div>
                )}
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">تاريخ الإنشاء</div>
                  <div className="text-gray-600">{new Date(selectedLesson.created_at).toLocaleDateString('ar-SA')}</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">آخر تحديث</div>
                  <div className="text-gray-600">{new Date(selectedLesson.updated_at).toLocaleDateString('ar-SA')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
