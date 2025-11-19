'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle, Clock, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Lesson {
  id: number;
  title: string;
  description: string;
  order: number;
  duration_minutes?: number;
  video_duration?: number;
  video_url?: string;
  bunny_video_id?: string;
  unit_title?: string;
  is_completed?: boolean;
}

interface Unit {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface CourseSidebarProps {
  units: Unit[];
  currentLessonId?: number;
  onLessonClick: (lesson: Lesson) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLessonComplete?: (lessonId: number) => void;
}

export default function CourseSidebar({ units, currentLessonId, onLessonClick, isCollapsed, onToggleCollapse, onLessonComplete }: CourseSidebarProps) {
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(
    new Set(units.map(u => u.id))
  );

  const toggleUnit = (unitId: number) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const totalLessons = units.reduce((acc, unit) => acc + unit.lessons.length, 0);
  const completedLessons = units.reduce(
    (acc, unit) => acc + unit.lessons.filter(l => l.is_completed).length, 
    0
  );

  return (
    <motion.div 
      initial={false}
      animate={{ 
        width: isCollapsed ? '60px' : '100%'
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full flex flex-col bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-xl relative"
    >
      {/* زر الإخفاء/الإظهار - Desktop Only */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex absolute -left-4 top-24 z-50 w-10 h-14 bg-gradient-primary rounded-l-xl shadow-2xl items-center justify-center transition-all hover:shadow-primary/50 hover:-left-5 group"
        title={isCollapsed ? 'إظهار القائمة' : 'إخفاء القائمة'}
      >
        <div className="relative">
          {isCollapsed ? (
            <>
              <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-white/20 rounded-full blur-sm animate-pulse"></div>
            </>
          ) : (
            <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-primary/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  محتوى الدورة
                </h2>
              </div>
              
              {/* إحصائيات التقدم */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    التقدم الإجمالي
                  </span>
                  <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {Math.round((completedLessons / totalLessons) * 100)}%
                  </span>
                </div>
                
                {/* شريط التقدم */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedLessons / totalLessons) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-primary rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </motion.div>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{completedLessons} دروس مكتملة</span>
                  <span>{totalLessons - completedLessons} متبقية</span>
                </div>
              </div>
            </div>

            {/* قائمة الوحدات */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-slate-200 dark:scrollbar-track-slate-700">
              {units.map((unit, unitIndex) => (
                <div 
                  key={unit.id}
                  className="border-b border-slate-200 dark:border-slate-700"
                >
                  {/* رأس الوحدة */}
                  <button
                    onClick={() => toggleUnit(unit.id)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-gradient-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-primary text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                        {unitIndex + 1}
                      </div>
                      <div className="text-right flex-1">
                        <p className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">
                          {unit.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <PlayCircle className="w-3 h-3" />
                          {unit.lessons.length} دروس
                        </p>
                      </div>
                    </div>
                    <ChevronDown 
                      className={`w-5 h-5 text-slate-400 group-hover:text-primary transition-all ${
                        expandedUnits.has(unit.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* قائمة الدروس */}
                  <AnimatePresence>
                    {expandedUnits.has(unit.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 py-2">
                          {unit.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className={`w-full px-5 py-3 flex items-start gap-3 transition-all group relative ${
                                currentLessonId === lesson.id
                                  ? 'bg-gradient-primary/10 border-r-4 border-primary shadow-sm'
                                  : 'hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700'
                              }`}
                              dir="ltr"
                            >
                              {/* Checkbox - على اليسار */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Checkbox clicked for lesson:', lesson.id);
                                  if (onLessonComplete) {
                                    onLessonComplete(lesson.id);
                                  } else {
                                    console.warn('onLessonComplete is not provided');
                                  }
                                }}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                }}
                                className="shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-110 z-10 relative
                                  border-slate-300 dark:border-slate-600 hover:border-primary
                                  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1
                                  bg-white dark:bg-slate-800"
                                style={{
                                  background: lesson.is_completed 
                                    ? 'var(--gradient-primary)' 
                                    : undefined,
                                  borderColor: lesson.is_completed ? 'var(--color-primary)' : undefined
                                }}
                                title={lesson.is_completed ? 'إلغاء إكمال الدرس' : 'إكمال الدرس'}
                              >
                                {lesson.is_completed && (
                                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>

                              {/* معلومات الدرس - Clickable */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onLessonClick(lesson);
                                }}
                                className="flex-1 text-right"
                                dir="rtl"
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex-1">
                                    <p className={`text-sm font-semibold line-clamp-2 leading-tight mb-1.5 ${
                                      currentLessonId === lesson.id
                                        ? 'text-primary'
                                        : 'text-slate-900 dark:text-white group-hover:text-primary'
                                    }`}>
                                      {lesson.title}
                                    </p>
                                    {lesson.video_duration && (
                                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="font-medium">{Math.round(lesson.video_duration / 60)} دقيقة</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* رقم أو أيقونة الدرس - على اليمين */}
                                  <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 transition-all ${
                                    lesson.is_completed
                                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                      : currentLessonId === lesson.id
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                  }`}>
                                    {lesson.is_completed ? (
                                      <CheckCircle className="w-4 h-4" />
                                    ) : currentLessonId === lesson.id ? (
                                      <PlayCircle className="w-4 h-4" />
                                    ) : (
                                      <span className="text-xs font-bold">{lessonIndex + 1}</span>
                                    )}
                                  </div>
                                </div>
                              </button>

                              {/* مؤشر الدرس النشط */}
                              {currentLessonId === lesson.id && (
                                <motion.div
                                  layoutId="activeLesson"
                                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-primary"
                                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* عرض الوحدات عند الإغلاق */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center py-6 gap-4 overflow-y-auto">
          {units.map((unit, unitIndex) => (
            <button
              key={unit.id}
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-xl bg-gradient-primary text-white flex items-center justify-center text-sm font-bold shadow-lg hover:shadow-xl hover:scale-110 transition-all"
              title={unit.title}
            >
              {unitIndex + 1}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

