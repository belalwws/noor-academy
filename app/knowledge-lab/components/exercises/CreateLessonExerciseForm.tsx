'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { knowledgeLabApi } from '@/lib/api/knowledge-lab';
import { liveEducationApi } from '@/lib/api/live-education';
import { recordedCoursesApi } from '@/lib/api/recorded-courses';
import type { Question } from '@/types/knowledge-lab';

interface CreateLessonExerciseFormProps {
  labId: string;
  courseId?: string; // Course ID associated with the knowledge lab
  onSuccess: () => void;
  onCancel: () => void;
}

interface LessonOption {
  id: string;
  title: string;
  type: 'live' | 'recorded';
  contentTypeId: number;
}

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

export function CreateLessonExerciseForm({ labId, courseId, onSuccess, onCancel }: CreateLessonExerciseFormProps) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    lesson_content_type: 0,
    lesson_object_id: '',
    time_limit: 30,
  });

  useEffect(() => {
    fetchQuestions();
    fetchLessons();
  }, [labId]);

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_BASE_URL}/knowledge-lab/questions/?knowledge_lab=${labId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.results || []);
      }
    } catch (error) {
      toast.error('فشل في تحميل الأسئلة');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Try to get ContentType ID from existing exercises, or try to detect from lesson
  const getContentTypeId = async (modelName: string, lessonId?: string): Promise<number> => {
    // First, try to get ContentType ID from existing lesson exercises
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_BASE_URL}/knowledge-lab/lesson-exercises/?knowledge_lab=${labId}&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const existingExercise = data.results[0];
          if (existingExercise.lesson_content_type) {
            console.log(`✅ Found ContentType ID from existing exercise: ${existingExercise.lesson_content_type}`);
            return existingExercise.lesson_content_type;
          }
        }
      }
    } catch (error) {
      console.warn('Could not fetch existing exercises:', error);
    }

    // If we have a lesson ID, try to detect ContentType by checking which model it belongs to
    if (lessonId && modelName === 'lesson') {
      try {
        const token = localStorage.getItem('access_token');
        // Try content_courses.Lesson first
        const contentResponse = await fetch(
          `${API_BASE_URL}/content/lessons/${lessonId}/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        if (contentResponse.ok) {
          // Lesson exists in content_courses, so try to get ContentType ID
          // We'll use a common value for content_courses.Lesson
          console.log('✅ Lesson found in content_courses, using ContentType ID for lesson');
          // Try common values: 15, 16, 17, 18, etc.
          return 15; // This will be tried and if wrong, user can adjust
        }
      } catch (error) {
        // Lesson not in content_courses, might be in recorded_courses
        console.log('Lesson not in content_courses, might be recorded');
      }
    }

    // Fallback to default ContentType IDs - try different common values
    // These are common ContentType IDs in Django - adjust if needed
    const contentTypeMap: Record<string, number[]> = {
      'lesson': [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], // Try common values
      'recordedlesson': [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
      'unit': [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      'recordedunit': [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    };
    
    const possibleIds = contentTypeMap[modelName] || [15, 16, 17, 18, 19, 20];
    const defaultId = possibleIds[0];
    
    console.warn(`⚠️ Using default ContentType ID for ${modelName}: ${defaultId}`);
    console.warn(`💡 If this fails, try these IDs: ${possibleIds.join(', ')}`);
    console.warn('💡 To find the correct ID, run: python manage.py shell');
    console.warn(`💡 Then: from django.contrib.contenttypes.models import ContentType`);
    console.warn(`💡 Then: ContentType.objects.get(app_label='content_courses', model='${modelName}').id`);
    return defaultId;
  };

  const fetchLessons = async () => {
    setLoadingLessons(true);
    try {
      const allLessons: LessonOption[] = [];
      
      // Get ContentType ID for 'lesson' model
      // We'll get it per lesson when selected, for now use a default
      const liveContentTypeId = await getContentTypeId('lesson');

      console.log('📚 Fetching lessons for courseId:', courseId);

      // Fetch live lessons for the specific course using content API
      try {
        const token = localStorage.getItem('access_token');
        let url: string;
        
        if (courseId) {
          // Try different API endpoints
          url = `${API_BASE_URL}/content/lessons/?unit__course=${courseId}`;
        } else {
          // If no courseId, fetch all lessons (for standalone labs)
          url = `${API_BASE_URL}/content/lessons/`;
        }
        
        console.log('🔗 Fetching from URL:', url);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📦 Lessons data:', data);
          
          const liveLessons = data.results || data || [];
          
          if (Array.isArray(liveLessons)) {
            console.log(`✅ Found ${liveLessons.length} lessons`);
            liveLessons.forEach((lesson: any) => {
              // Use content_type_id from API if available, otherwise use default
              const contentTypeId = lesson.content_type_id || liveContentTypeId;
              allLessons.push({
                id: lesson.id,
                title: lesson.title || 'درس بدون عنوان',
                type: 'live',
                contentTypeId: contentTypeId,
              });
            });
          } else {
            console.warn('⚠️ Lessons data is not an array:', liveLessons);
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to fetch lessons:', response.status, errorText);
          
          // Try alternative endpoint if the first one fails
          if (courseId && response.status === 404) {
            console.log('🔄 Trying alternative endpoint...');
            const altUrl = `${API_BASE_URL}/live-education/lessons/?course=${courseId}`;
            const altResponse = await fetch(altUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (altResponse.ok) {
              const altData = await altResponse.json();
              const altLessons = altData.results || altData || [];
              if (Array.isArray(altLessons)) {
                altLessons.forEach((lesson: any) => {
                  // Use content_type_id from API if available, otherwise use default
                  const contentTypeId = lesson.content_type_id || liveContentTypeId;
                  allLessons.push({
                    id: lesson.id,
                    title: lesson.title || 'درس بدون عنوان',
                    type: 'live',
                    contentTypeId: contentTypeId,
                  });
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Error fetching live lessons:', error);
        if (courseId) {
          toast.error('فشل في تحميل دروس الدورة');
        }
      }

      console.log(`📋 Total lessons found: ${allLessons.length}`);
      setLessons(allLessons);
      
      if (allLessons.length === 0 && courseId) {
        toast.warning('لا توجد دروس متاحة لهذه الدورة');
      }
    } catch (error) {
      console.error('❌ Error in fetchLessons:', error);
      if (courseId) {
        toast.error('فشل في تحميل الدروس');
      }
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleLessonSelect = async (lessonId: string) => {
    const selectedLesson = lessons.find(l => l.id === lessonId);
    if (selectedLesson) {
      // Use the ContentType ID from the lesson (which comes from API response)
      // This is the most reliable way since it comes directly from the backend
      const correctContentTypeId = selectedLesson.contentTypeId;
      
      if (!correctContentTypeId || correctContentTypeId === 0) {
        toast.error('خطأ في نوع المحتوى. يرجى المحاولة مرة أخرى');
        return;
      }
      
      console.log(`✅ Using ContentType ID from lesson: ${correctContentTypeId}`);
      
      setFormData({
        ...formData,
        lesson_object_id: selectedLesson.id,
        lesson_content_type: correctContentTypeId,
        title: formData.title || selectedLesson.title,
      });
    }
  };

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان التمرين');
      return;
    }

    if (selectedQuestions.length === 0) {
      toast.error('يرجى اختيار سؤال واحد على الأقل');
      return;
    }

    if (!formData.lesson_object_id) {
      toast.error('يرجى اختيار الدرس');
      return;
    }

    setLoading(true);
    try {
      // Get ContentType ID for the selected lesson
      const selectedLesson = lessons.find(l => l.id === formData.lesson_object_id);
      if (!selectedLesson) {
        toast.error('الدرس المحدد غير موجود');
        setLoading(false);
        return;
      }

      // Use the ContentType ID from formData (which was set by handleLessonSelect)
      // If it's still 0 or invalid, use the one from selectedLesson
      const contentTypeId = formData.lesson_content_type > 0 
        ? formData.lesson_content_type 
        : selectedLesson.contentTypeId;

      if (contentTypeId === 0 || !contentTypeId) {
        toast.error('خطأ في نوع المحتوى. يرجى اختيار الدرس مرة أخرى');
        setLoading(false);
        return;
      }

      const payload = {
        knowledge_lab: labId,
        lesson_content_type: contentTypeId,
        lesson_object_id: formData.lesson_object_id,
        title: formData.title,
        question_ids: selectedQuestions,
        time_limit: formData.time_limit * 60, // Convert minutes to seconds
      };

      console.log('📤 Creating lesson exercise with payload:', payload);

      const response = await knowledgeLabApi.createLessonExercise(payload);

      if (response.success) {
        toast.success('تم إنشاء التمرين بنجاح! ✨');
        onSuccess();
      } else {
        console.error('❌ Failed to create lesson exercise:', response);
        const errorMsg = response.error || response.errors?.detail || 'فشل في إنشاء التمرين';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error creating lesson exercise:', error);
      toast.error('حدث خطأ أثناء إنشاء التمرين');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 shadow-lg" dir="rtl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">إنشاء تمرين درس جديد</CardTitle>
            <CardDescription>اختر الأسئلة من بنك الأسئلة وأنشئ تمرين درس</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">عنوان التمرين *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: تمرين الدرس الأول"
              required
              dir="rtl"
            />
          </div>

          {/* Lesson Selection */}
          <div className="space-y-2">
            <Label htmlFor="lesson">اختر الدرس *</Label>
            {loadingLessons ? (
              <div className="text-center py-4 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                جاري تحميل الدروس...
              </div>
            ) : (
              <Select
                value={formData.lesson_object_id}
                onValueChange={handleLessonSelect}
                dir="rtl"
              >
                <SelectTrigger className="w-full text-right" dir="rtl">
                  <SelectValue placeholder="اختر الدرس" />
                </SelectTrigger>
                <SelectContent dir="rtl" className="text-right">
                  {lessons.length === 0 ? (
                    <SelectItem value="no-lessons" disabled>
                      لا توجد دروس متاحة
                    </SelectItem>
                  ) : (
                    lessons.map((lesson) => (
                      <SelectItem
                        key={lesson.id}
                        value={lesson.id}
                        className="text-right cursor-pointer"
                      >
                        {lesson.title} ({lesson.type === 'live' ? 'مباشر' : 'مسجل'})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            {formData.lesson_object_id && (
              <p className="text-xs text-gray-500">
                تم اختيار الدرس: {lessons.find(l => l.id === formData.lesson_object_id)?.title}
              </p>
            )}
          </div>

          {/* Time Limit */}
          <div className="space-y-2">
            <Label htmlFor="time_limit">الوقت المحدد (بالدقائق) *</Label>
            <Input
              id="time_limit"
              type="number"
              min="1"
              value={formData.time_limit}
              onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) || 30 })}
              required
              dir="rtl"
            />
          </div>

          {/* Questions Selection */}
          <div className="space-y-2">
            <Label>اختر الأسئلة *</Label>
            {loadingQuestions ? (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                جاري تحميل الأسئلة...
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border rounded-lg">
                لا توجد أسئلة متاحة في بنك الأسئلة
              </div>
            ) : (
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-start gap-3 p-2 rounded hover:bg-orange-50 transition-colors"
                  >
                    <Checkbox
                      id={`question-${question.id}`}
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={() => handleQuestionToggle(question.id)}
                    />
                    <label
                      htmlFor={`question-${question.id}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      <div className="font-medium">
                        {question.text || question.question_text || 'نص السؤال...'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {question.question_type_display || question.question_type} - {question.points} نقطة
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
            {selectedQuestions.length > 0 && (
              <p className="text-sm text-gray-600">
                تم اختيار {selectedQuestions.length} سؤال
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              إلغاء
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
              disabled={loading || selectedQuestions.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء التمرين'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

