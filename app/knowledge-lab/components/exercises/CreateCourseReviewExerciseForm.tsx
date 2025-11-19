'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { knowledgeLabApi } from '@/lib/api/knowledge-lab';
import type { Question } from '@/types/knowledge-lab';

interface CreateCourseReviewExerciseFormProps {
  labId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

export function CreateCourseReviewExerciseForm({ labId, onSuccess, onCancel }: CreateCourseReviewExerciseFormProps) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchQuestions();
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

    setLoading(true);
    try {
      const payload = {
        knowledge_lab: labId,
        title: formData.title,
        description: formData.description || '',
        question_ids: selectedQuestions,
      };

      console.log('📤 Creating course review exercise with payload:', payload);

      const response = await knowledgeLabApi.createCourseReviewExercise(payload);

      if (response.success) {
        toast.success('تم إنشاء التمرين بنجاح! ✨');
        onSuccess();
      } else {
        toast.error(response.error || 'فشل في إنشاء التمرين');
      }
    } catch (error: any) {
      console.error('❌ Error creating course review exercise:', error);
      toast.error(error?.message || 'حدث خطأ أثناء إنشاء التمرين');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-orange-200" dir="rtl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>إضافة تمرين مراجعة دورة</CardTitle>
            <CardDescription>اختر الأسئلة من بنك الأسئلة لإنشاء تمرين مراجعة</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان التمرين *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: مراجعة الوحدة الأولى"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف التمرين (اختياري)"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>اختر الأسئلة *</Label>
            {loadingQuestions ? (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                جاري تحميل الأسئلة...
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>لا توجد أسئلة متاحة</p>
                <p className="text-sm mt-2">يرجى إضافة أسئلة إلى بنك الأسئلة أولاً</p>
              </div>
            ) : (
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={() => handleQuestionToggle(question.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{question.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {question.question_type_display} • {question.points} نقطة
                      </p>
                    </div>
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

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedQuestions.length === 0}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
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



