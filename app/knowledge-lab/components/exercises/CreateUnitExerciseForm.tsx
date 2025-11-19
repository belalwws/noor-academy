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
import { recordedCoursesApi } from '@/lib/api/recorded-courses';
import type { Question } from '@/types/knowledge-lab';

interface CreateUnitExerciseFormProps {
  labId: string;
  courseId?: string; // Course ID associated with the knowledge lab
  onSuccess: () => void;
  onCancel: () => void;
}

interface UnitOption {
  id: string;
  title: string;
  type: 'live' | 'recorded';
  contentTypeId: number;
}

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

export function CreateUnitExerciseForm({ labId, courseId, onSuccess, onCancel }: CreateUnitExerciseFormProps) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    unit_content_type: 0,
    unit_object_id: '',
    time_limit: 30,
  });

  useEffect(() => {
    fetchQuestions();
    fetchUnits();
  }, [labId, courseId]);

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

  // Try to get ContentType ID from existing exercises, or use defaults
  const getContentTypeId = async (modelName: string): Promise<number> => {
    // First, try to get ContentType ID from existing unit exercises
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_BASE_URL}/knowledge-lab/unit-exercises/?knowledge_lab=${labId}&limit=1`,
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
          if (existingExercise.unit_content_type) {
            console.log(`✅ Found ContentType ID from existing exercise: ${existingExercise.unit_content_type}`);
            // Check if it matches the model we need
            if (modelName === 'unit' || modelName === 'recordedunit') {
              return existingExercise.unit_content_type;
            }
          }
        }
      }
    } catch (error) {
      console.warn('Could not fetch existing exercises:', error);
    }

    // Fallback to default ContentType IDs
    const contentTypeMap: Record<string, number> = {
      'lesson': 15,        // Try common values - adjust if needed
      'recordedlesson': 16, // Try common values - adjust if needed
      'unit': 13,          // Try common values - adjust if needed
      'recordedunit': 14,  // Try common values - adjust if needed
    };
    
    console.warn(`⚠️ Using default ContentType ID for ${modelName}: ${contentTypeMap[modelName] || 13}`);
    return contentTypeMap[modelName] || 13;
  };

  const fetchUnits = async () => {
    setLoadingUnits(true);
    try {
      const allUnits: UnitOption[] = [];
      
      console.log('📚 Fetching units for courseId:', courseId);
      
      if (!courseId) {
        console.warn('⚠️ No courseId provided, cannot fetch units');
        toast.warning('لا يمكن جلب الوحدات بدون معرف الدورة');
        setLoadingUnits(false);
        return;
      }
      
      // Get ContentType IDs for 'unit' and 'recordedunit' models
      const liveUnitContentTypeId = await getContentTypeId('unit');
      const recordedUnitContentTypeId = await getContentTypeId('recordedunit');

      // Fetch live units for the specific course using content API
      try {
        const token = localStorage.getItem('access_token');
        const url = `${API_BASE_URL}/content/units/?course=${courseId}`;
        
        console.log('🔗 Fetching live units from:', url);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const liveUnits = data.results || data || [];
          
          console.log(`✅ Found ${liveUnits.length} live units`);
          
          if (Array.isArray(liveUnits)) {
            liveUnits.forEach((unit: any) => {
              // Use content_type_id from API if available, otherwise use default
              const contentTypeId = unit.content_type_id || liveUnitContentTypeId!;
              allUnits.push({
                id: unit.id,
                title: unit.title || 'وحدة بدون عنوان',
                type: 'live',
                contentTypeId: contentTypeId,
              });
            });
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to fetch live units:', response.status, errorText);
        }
      } catch (error) {
        console.error('❌ Error fetching live units:', error);
      }

      // Fetch recorded units for the specific course
      try {
        console.log('🔗 Fetching recorded units for course:', courseId);
        const recordedUnitsResponse = await recordedCoursesApi.listUnits({ course: courseId });
        if (recordedUnitsResponse.results) {
          console.log(`✅ Found ${recordedUnitsResponse.results.length} recorded units`);
          recordedUnitsResponse.results.forEach((unit: any) => {
            // Use content_type_id from API if available, otherwise use default
            const contentTypeId = unit.content_type_id || recordedUnitContentTypeId!;
            allUnits.push({
              id: unit.id,
              title: unit.title || 'وحدة بدون عنوان',
              type: 'recorded',
              contentTypeId: contentTypeId,
            });
          });
        }
      } catch (error) {
        console.error('❌ Error fetching recorded units:', error);
      }
      
      console.log(`📋 Total units found: ${allUnits.length}`);
      
      if (allUnits.length === 0) {
        toast.warning('لا توجد وحدات متاحة لهذه الدورة');
      }
      
      setUnits(allUnits);
    } catch (error) {
      console.error('❌ Error in fetchUnits:', error);
      toast.error('فشل في تحميل الوحدات');
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleUnitSelect = (unitId: string) => {
    const selectedUnit = units.find(u => u.id === unitId);
    if (selectedUnit) {
      setFormData({
        ...formData,
        unit_object_id: selectedUnit.id,
        unit_content_type: selectedUnit.contentTypeId,
        title: formData.title || selectedUnit.title,
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

    if (!formData.unit_object_id) {
      toast.error('يرجى اختيار الوحدة');
      return;
    }

    setLoading(true);
    try {

      // Get ContentType ID for the selected unit
      const selectedUnit = units.find(u => u.id === formData.unit_object_id);
      if (!selectedUnit) {
        toast.error('الوحدة المحددة غير موجودة');
        setLoading(false);
        return;
      }

      const payload = {
        knowledge_lab: labId,
        unit_content_type: selectedUnit.contentTypeId,
        unit_object_id: formData.unit_object_id,
        title: formData.title,
        question_ids: selectedQuestions,
        time_limit: formData.time_limit * 60, // Convert minutes to seconds
      };

      const response = await knowledgeLabApi.createUnitExercise(payload);

      if (response.success) {
        toast.success('تم إنشاء التمرين بنجاح! ✨');
        onSuccess();
      } else {
        const errorMsg = response.error || response.errors?.detail || 'فشل في إنشاء التمرين';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error creating unit exercise:', error);
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
            <CardTitle className="text-xl">إنشاء تمرين وحدة جديد</CardTitle>
            <CardDescription>اختر الأسئلة من بنك الأسئلة وأنشئ تمرين وحدة</CardDescription>
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
              placeholder="مثال: تمرين الوحدة الأولى"
              required
              dir="rtl"
            />
          </div>

          {/* Unit Selection */}
          <div className="space-y-2">
            <Label htmlFor="unit">اختر الوحدة *</Label>
            {loadingUnits ? (
              <div className="text-center py-4 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                جاري تحميل الوحدات...
              </div>
            ) : (
              <Select
                value={formData.unit_object_id}
                onValueChange={handleUnitSelect}
                dir="rtl"
              >
                <SelectTrigger className="w-full text-right" dir="rtl">
                  <SelectValue placeholder="اختر الوحدة" />
                </SelectTrigger>
                <SelectContent dir="rtl" className="text-right">
                  {units.length === 0 ? (
                    <SelectItem value="no-units" disabled>
                      لا توجد وحدات متاحة
                    </SelectItem>
                  ) : (
                    units.map((unit) => (
                      <SelectItem
                        key={unit.id}
                        value={unit.id}
                        className="text-right cursor-pointer"
                      >
                        {unit.title} ({unit.type === 'live' ? 'مباشر' : 'مسجل'})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            {formData.unit_object_id && (
              <p className="text-xs text-gray-500">
                تم اختيار الوحدة: {units.find(u => u.id === formData.unit_object_id)?.title}
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

