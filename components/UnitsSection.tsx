'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Clock, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Play,
  Lock,
  Video
} from 'lucide-react';

interface Lesson {
  id: string | number;
  title: string;
  description: string;
  order: number;
  unit?: string;
  learning_outcomes?: string;
  duration_minutes?: number | null;
  objectives?: string;
  materials?: string;
  homework?: string;
  sessions_count?: number;
  created_at: string;
  updated_at: string;
  video_url?: string;
  bunny_video_id?: string;
  video_duration?: number;
  video_size?: number;
}

interface Unit {
  id: string;
  course: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  lesson_count: number;
  created_at: string;
  updated_at: string;
}

interface UnitsSectionProps {
  units: Unit[];
  onLessonClick: (lessonId: string | number) => void;
  selectedLesson: Lesson | null;
  isRecordedCourse?: boolean;
}

export default function UnitsSection({ 
  units, 
  onLessonClick, 
  selectedLesson,
  isRecordedCourse = false
}: UnitsSectionProps) {
  
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  const toggleUnit = (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedUnits(new Set());
    } else {
      const allUnitIds = new Set(units.map(u => u.id));
      setExpandedUnits(allUnitIds);
    }
    setExpandAll(!expandAll);
  };

  // Sort units by order
  const sortedUnits = [...units].sort((a, b) => a.order - b.order);

  // Calculate total lessons count and total duration
  const totalLessons = units.reduce((sum, unit) => sum + (unit.lessons?.length || 0), 0);
  
  // Format duration helper
  const formatDuration = (minutes: number) => {
    if (!minutes || minutes === 0) return '0 د';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours} س ${mins} د`;
    } else if (hours > 0) {
      return `${hours} س`;
    } else {
      return `${mins} د`;
    }
  };

  // Format video duration from seconds to readable format (MM:SS or HH:MM:SS)
  const formatVideoDuration = (seconds: number | undefined | null): string | null => {
    if (!seconds || seconds === 0 || isNaN(seconds)) return null;
    
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  // Calculate unit total duration
  const getUnitDuration = (unit: Unit) => {
    const totalMinutes = (unit.lessons || []).reduce((sum, lesson) => {
      return sum + (lesson.duration_minutes || 0);
    }, 0);
    return formatDuration(totalMinutes);
  };

  if (!units || units.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">محتويات الدورة</h2>
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors duration-300">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">لا توجد وحدات متاحة</h3>
          <p className="text-gray-600 dark:text-slate-400">لم يتم إضافة وحدات لهذه الدورة بعد</p>
        </div>
      </div>
    );
  }

  // Calculate total duration
  const totalDuration = units.reduce((sum, unit) => {
    return sum + (unit.lessons || []).reduce((lessonSum, lesson) => {
      return lessonSum + (lesson.duration_minutes || 0);
    }, 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">محتوى الدورة</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleExpandAll}
            className="text-sm border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            {expandAll ? 'طي جميع الأقسام' : 'توسيع جميع الأقسام'}
          </Button>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-400">
          <span>{units.length} من الأقسام</span>
          <span>•</span>
          <span>{totalLessons} من المحاضرات</span>
          {isRecordedCourse && totalDuration > 0 && (
            <>
          <span>•</span>
          <span>إجمالي المدة {formatDuration(totalDuration)}</span>
            </>
          )}
        </div>
      </div>

      {/* Units List - Udemy Style */}
      <div className="border border-gray-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 transition-colors duration-300">
        {sortedUnits.map((unit, unitIndex) => {
          const isUnitExpanded = expandedUnits.has(unit.id);
          const unitLessons = (unit.lessons || []).sort((a, b) => a.order - b.order);
          const unitDuration = getUnitDuration(unit);
          
          return (
            <div 
              key={unit.id} 
              className="border-b border-gray-300 dark:border-slate-700 last:border-b-0"
            >
              {/* Unit Header - Udemy Style */}
              <div 
                className="px-4 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors border-b border-gray-200 dark:border-slate-700"
                onClick={() => toggleUnit(unit.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Expand/Collapse Icon */}
                    <div className="flex-shrink-0">
                      {isUnitExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                      )}
                    </div>
                    
                    {/* Unit Title */}
                    <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 flex-1">
                      {unit.title}
                    </h3>
                    
                    {/* Unit Stats */}
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                      <span>{unitLessons.length} من المحاضرات</span>
                      {isRecordedCourse && unitDuration && unitDuration !== '0 د' && (
                        <>
                      <span className="text-gray-400">-</span>
                      <span>{unitDuration}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Unit Lessons (Expanded) - Udemy Style */}
              {isUnitExpanded && unitLessons.length > 0 && (
                <div className="bg-gray-50 dark:bg-slate-900/50">
                  {unitLessons.map((lesson, lessonIndex) => {
                    const isSelected = selectedLesson?.id === lesson.id;
                    const lessonDuration = lesson.duration_minutes 
                      ? formatDuration(lesson.duration_minutes) 
                      : '';
                    const hasVideo = lesson.video_url || lesson.bunny_video_id;
                    // Format video duration if available and valid
                    const videoDuration = hasVideo && lesson.video_duration && lesson.video_duration > 0
                      ? formatVideoDuration(lesson.video_duration) 
                      : null;
                    
                    return (
                      <div 
                        key={lesson.id}
                        className={`px-4 py-3 border-b border-gray-200 dark:border-slate-700 last:border-b-0 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${
                          isSelected ? 'bg-blue-50 dark:bg-orange-900/20' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          {/* Lesson Info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Video Icon / Play Icon / Lock Icon */}
                            <div className="flex-shrink-0">
                              {hasVideo ? (
                                <Video className="w-4 h-4 text-blue-600 dark:text-orange-500" />
                              ) : lesson.duration_minutes ? (
                                <Play className="w-4 h-4 text-gray-600 dark:text-slate-400" />
                              ) : (
                                <Lock className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                              )}
                            </div>
                            
                            {/* Lesson Title */}
                            <div className="flex-1 min-w-0">
                              <h4 
                                className="text-sm font-medium text-gray-900 dark:text-slate-100 cursor-pointer hover:text-blue-600 dark:hover:text-orange-400 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onLessonClick(lesson.id);
                                }}
                              >
                                {lesson.title}
                              </h4>
                            </div>
                            
                            {/* Video Duration or Lesson Duration */}
                            {hasVideo && videoDuration ? (
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-slate-400 flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                <span>{videoDuration}</span>
                              </div>
                            ) : isRecordedCourse && lessonDuration && lessonDuration !== '0 د' ? (
                              <div className="text-sm text-gray-600 dark:text-slate-400 flex-shrink-0">
                                {lessonDuration}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty Unit State */}
              {isUnitExpanded && unitLessons.length === 0 && (
                <div className="px-4 py-6 bg-gray-50 dark:bg-slate-900/50 text-center border-t border-gray-200 dark:border-slate-700 transition-colors duration-300">
                  <p className="text-sm text-gray-500 dark:text-slate-400">لا توجد دروس في هذه الوحدة</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Lesson Details - Optional detailed view */}
      {selectedLesson && (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 mt-6 transition-colors duration-300">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {(selectedLesson.video_url || selectedLesson.bunny_video_id) ? (
                <Video className="w-5 h-5 text-blue-600 dark:text-orange-500" />
              ) : (
                <Play className="w-5 h-5 text-blue-600 dark:text-orange-500" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {selectedLesson.title}
              </h3>
            </div>
            
            {selectedLesson.description && selectedLesson.description.trim() && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2">وصف الدرس</h4>
                <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                  {selectedLesson.description}
                </p>
              </div>
            )}
            
            {selectedLesson.learning_outcomes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2">مخرجات التعلم</h4>
                <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {selectedLesson.learning_outcomes}
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-400 pt-2 border-t border-gray-200 dark:border-slate-700">
              {(selectedLesson.video_url || selectedLesson.bunny_video_id) && selectedLesson.video_duration && selectedLesson.video_duration > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatVideoDuration(selectedLesson.video_duration)}</span>
                </div>
              )}
              {isRecordedCourse && selectedLesson.duration_minutes && selectedLesson.duration_minutes > 0 && (!selectedLesson.video_duration || selectedLesson.video_duration === 0) && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(selectedLesson.duration_minutes)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(selectedLesson.created_at).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

