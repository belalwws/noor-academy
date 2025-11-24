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

interface CreateCourseExamFormProps {
  labId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

export function CreateCourseExamForm({ labId, onSuccess, onCancel }: CreateCourseExamFormProps) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit: 60,
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
      toast.error('يرجى إدخال عنوان الاختبار');
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
        time_limit: formData.time_limit * 60, // Convert minutes to seconds
      };

      console.log('📤 Creating course exam with payload:', payload);

      const response = await knowledgeLabApi.createCourseExam(payload);

      if (response.success) {
        toast.success('تم إنشاء الاختبار بنجاح! ✨');
        onSuccess();
      } else {
        console.error('❌ Failed to create course exam:', response);
        const errorMsg = response.error || response.errors?.detail || 'فشل في إنشاء الاختبار';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error creating course exam:', error);
      toast.error('حدث خطأ أثناء إنشاء الاختبار');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 shadow-lg" dir="rtl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">إنشاء اختبار دورة جديد</CardTitle>
            <CardDescription>اختر الأسئلة من بنك الأسئلة وأنشئ اختبار دورة شامل</CardDescription>
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
            <Label htmlFor="title">عنوان الاختبار *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: اختبار نهاية الدورة"
              required
              dir="rtl"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">وصف الاختبار</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف مختصر للاختبار (اختياري)"
              rows={3}
              dir="rtl"
            />
          </div>

          {/* Time Limit */}
          <div className="space-y-2">
            <Label htmlFor="time_limit">المدة الزمنية (بالدقائق) *</Label>
            <Input
              id="time_limit"
              type="number"
              min="1"
              value={formData.time_limit}
              onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) || 60 })}
              required
              dir="rtl"
            />
          </div>

          {/* Questions Selection */}
          <div className="space-y-2">
            <Label>اختر الأسئلة *</Label>
            {loadingQuestions ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري تحميل الأسئلة...
              </div>
            ) : questions.length === 0 ? (
              <p className="text-sm text-gray-500">لا توجد أسئلة متاحة في بنك الأسئلة</p>
            ) : (
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto" dir="rtl">
                {questions.map(question => (
                  <div key={question.id} className="flex items-start gap-2 py-2 border-b last:border-0">
                    <Checkbox
                      id={`question-${question.id}`}
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={() => handleQuestionToggle(question.id)}
                    />
                    <Label
                      htmlFor={`question-${question.id}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {question.text || question.question_text || 'سؤال بدون نص'}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            {selectedQuestions.length > 0 && (
              <p className="text-sm text-blue-600">
                تم اختيار {selectedQuestions.length} سؤال
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} dir="rtl">
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedQuestions.length === 0}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              dir="rtl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء الاختبار'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

