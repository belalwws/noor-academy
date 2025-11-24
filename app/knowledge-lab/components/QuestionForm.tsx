'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QuestionType, QuestionFormData } from '@/types/knowledge-lab';
import { Plus, X, Eye, Trash2 } from 'lucide-react';

interface QuestionFormProps {
  labId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
}

interface Option {
  id: string;
  text: string;
  label: string; // The display label (A, B, C, D or أ, ب, ج, د or custom)
}

type OptionStyle = 'english' | 'arabic' | 'custom';

export function QuestionForm({
  labId,
  onSuccess,
  onCancel,
  initialData,
}: QuestionFormProps) {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [questionText, setQuestionText] = useState(initialData?.text || initialData?.question_text || '');
  const [questionType, setQuestionType] = useState<QuestionType>(
    initialData?.question_type || 'multiple_choice'
  );
  const [points, setPoints] = useState(initialData?.points || 1);
  const [order, setOrder] = useState(initialData?.order || 1);
  const [explanation, setExplanation] = useState(initialData?.explanation || '');
  
  // Option style state
  const [optionStyle, setOptionStyle] = useState<OptionStyle>('arabic');
  
  // Options state for multiple choice
  const [options, setOptions] = useState<Option[]>(() => {
    if (initialData?.options) {
      try {
        const parsed = typeof initialData.options === 'string' 
          ? JSON.parse(initialData.options) 
          : initialData.options;
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if options have labels
          const hasLabels = parsed.some((opt: any) => opt.label);
          if (hasLabels) {
            // Detect style from first option
            const firstLabel = parsed[0]?.label || parsed[0]?.id || 'a';
            if (['أ', 'ب', 'ج', 'د'].includes(firstLabel)) {
              setOptionStyle('arabic');
            } else if (['a', 'b', 'c', 'd'].includes(firstLabel.toLowerCase())) {
              setOptionStyle('english');
            } else {
              setOptionStyle('custom');
            }
            return parsed.map((opt: any) => ({
              id: opt.id,
              text: opt.text,
              label: opt.label || opt.id,
            }));
          } else {
            // Old format, convert to new format
            return parsed.map((opt: any, idx: number) => {
              const labels = ['أ', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح'];
              return {
                id: opt.id || opt,
                text: typeof opt === 'string' ? '' : (opt.text || ''),
                label: opt.label || labels[idx] || String.fromCharCode(97 + idx),
              };
            });
          }
        }
      } catch (e) {
        // Fallback to default
      }
    }
    return [
      { id: 'a', text: '', label: 'أ' },
      { id: 'b', text: '', label: 'ب' },
      { id: 'c', text: '', label: 'ج' },
      { id: 'd', text: '', label: 'د' },
    ];
  });

  // Correct answer state
  const [correctAnswer, setCorrectAnswer] = useState<string>(() => {
    if (initialData?.correct_answer) {
      try {
        const parsed = typeof initialData.correct_answer === 'string'
          ? JSON.parse(initialData.correct_answer)
          : initialData.correct_answer;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } catch (e) {
        // Fallback
      }
    }
    return '';
  });

  // True/False state
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<'true' | 'false'>(() => {
    if (initialData?.correct_answer) {
      try {
        const parsed = typeof initialData.correct_answer === 'string'
          ? JSON.parse(initialData.correct_answer)
          : initialData.correct_answer;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0] === 'true' ? 'true' : 'false';
        }
      } catch (e) {
        // Fallback
      }
    }
    return 'true';
  });

  // Get labels based on style
  const getLabels = (style: OptionStyle, count: number): string[] => {
    if (style === 'arabic') {
      const arabicLabels = ['أ', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح', 'ط', 'ي', 'ك', 'ل', 'م', 'ن', 'س', 'ع', 'ف', 'ص', 'ق', 'ر', 'ش', 'ت', 'ث', 'خ', 'ذ', 'ض', 'ظ', 'غ'];
      return arabicLabels.slice(0, count);
    } else if (style === 'english') {
      return Array.from({ length: count }, (_, i) => String.fromCharCode(97 + i).toUpperCase());
    } else {
      // Custom - use existing labels or generate
      return options.slice(0, count).map(opt => opt.label);
    }
  };

  // Reset form when initialData changes (especially when it becomes null after adding a question)
  useEffect(() => {
    if (!initialData) {
      // Reset all form fields when initialData is null (new question mode)
      setQuestionText('');
      setQuestionType('multiple_choice');
      setPoints(1);
      setOrder(1);
      setExplanation('');
      setOptionStyle('arabic');
      setOptions([
        { id: 'a', text: '', label: 'أ' },
        { id: 'b', text: '', label: 'ب' },
        { id: 'c', text: '', label: 'ج' },
        { id: 'd', text: '', label: 'د' },
      ]);
      setCorrectAnswer('');
      setTrueFalseAnswer('true');
      setShowPreview(false);
    } else {
      // Load data when editing
      setQuestionText(initialData?.text || initialData?.question_text || '');
      setQuestionType(initialData?.question_type || 'multiple_choice');
      setPoints(initialData?.points || 1);
      setOrder(initialData?.order || 1);
      setExplanation(initialData?.explanation || '');
      
      // Load options
      if (initialData?.options) {
        try {
          const parsed = typeof initialData.options === 'string' 
            ? JSON.parse(initialData.options) 
            : initialData.options;
          if (Array.isArray(parsed) && parsed.length > 0) {
            const hasLabels = parsed.some((opt: any) => opt.label);
            if (hasLabels) {
              const firstLabel = parsed[0]?.label || parsed[0]?.id || 'a';
              if (['أ', 'ب', 'ج', 'د'].includes(firstLabel)) {
                setOptionStyle('arabic');
              } else if (['a', 'b', 'c', 'd'].includes(firstLabel.toLowerCase())) {
                setOptionStyle('english');
              } else {
                setOptionStyle('custom');
              }
              setOptions(parsed.map((opt: any) => ({
                id: opt.id,
                text: opt.text,
                label: opt.label || opt.id,
              })));
            }
          }
        } catch (e) {
          // Fallback
        }
      }
      
      // Load correct answer
      if (initialData?.correct_answer) {
        try {
          const parsed = typeof initialData.correct_answer === 'string'
            ? JSON.parse(initialData.correct_answer)
            : initialData.correct_answer;
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (initialData?.question_type === 'true_false') {
              setTrueFalseAnswer(parsed[0] === 'true' ? 'true' : 'false');
            } else {
              setCorrectAnswer(parsed[0]);
            }
          }
        } catch (e) {
          // Fallback
        }
      }
    }
  }, [initialData]);

  // Update options when style changes
  useEffect(() => {
    if (questionType === 'multiple_choice' && optionStyle !== 'custom' && !initialData) {
      const labels = getLabels(optionStyle, options.length);
      setOptions(options.map((opt, idx) => ({
        ...opt,
        label: labels[idx] || opt.label,
      })));
    }
  }, [optionStyle]);

  // Initialize options for true/false
  useEffect(() => {
    if (questionType === 'true_false') {
      setOptions([
        { id: 'true', text: 'صح', label: 'أ' },
        { id: 'false', text: 'خطأ', label: 'ب' },
      ]);
    } else if (options.length === 0 || options[0]?.id === 'true') {
      const labels = getLabels(optionStyle, 4);
      setOptions([
        { id: 'a', text: '', label: labels[0] },
        { id: 'b', text: '', label: labels[1] },
        { id: 'c', text: '', label: labels[2] },
        { id: 'd', text: '', label: labels[3] },
      ]);
    }
  }, [questionType]);

  const addOption = () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const nextId = letters[options.length];
    const labels = getLabels(optionStyle, options.length + 1);
    const newLabel = optionStyle === 'custom' 
      ? String.fromCharCode(97 + options.length).toUpperCase()
      : labels[options.length];
    
    setOptions([...options, { id: nextId, text: '', label: newLabel }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
      // Reset correct answer if it was the removed option
      if (correctAnswer === options[index].id) {
        setCorrectAnswer('');
      }
    } else {
      toast.error('يجب أن يكون هناك خياران على الأقل');
    }
  };

  const updateOption = (index: number, text: string) => {
    const updated = [...options];
    updated[index].text = text;
    setOptions(updated);
  };

  const updateOptionLabel = (index: number, label: string) => {
    const updated = [...options];
    updated[index].label = label;
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!questionText.trim()) {
        toast.error('يرجى إدخال نص السؤال');
        setLoading(false);
        return;
      }

      if (questionType === 'multiple_choice') {
        const emptyOptions = options.filter(opt => !opt.text.trim());
        if (emptyOptions.length > 0) {
          toast.error('يرجى ملء جميع الخيارات');
          setLoading(false);
          return;
        }
        if (!correctAnswer) {
          toast.error('يرجى اختيار الإجابة الصحيحة');
          setLoading(false);
          return;
        }
      }

      const token = localStorage.getItem('access_token');
      const API_BASE_URL =
        process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

      const url = initialData
        ? `${API_BASE_URL}/knowledge-lab/questions/${initialData.id}/`
        : `${API_BASE_URL}/knowledge-lab/questions/`;

      const method = initialData ? 'PATCH' : 'POST';

      // Prepare options and correct_answer in the format expected by API
      const formattedOptions = questionType === 'true_false'
        ? [
            { id: 'true', text: 'صح' },
            { id: 'false', text: 'خطأ' },
          ]
        : options.filter(opt => opt.text.trim()).map(opt => ({
            id: opt.id,
            text: opt.text,
            ...(optionStyle === 'custom' && { label: opt.label }),
          }));

      const formattedCorrectAnswer = questionType === 'true_false'
        ? [trueFalseAnswer]
        : [correctAnswer];

      const payload = {
        knowledge_lab: labId,
        question_type: questionType,
        text: questionText,
        options: formattedOptions,
        correct_answer: formattedCorrectAnswer,
        points: points,
        order: order || 1,
        ...(explanation && { explanation: explanation }),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          initialData ? 'تم تحديث السؤال بنجاح! ✨' : 'تم إضافة السؤال بنجاح! ✨'
        );
        
        // Call onSuccess which will reset the form via useEffect when initialData becomes null
        onSuccess?.();
      } else {
        console.error('❌ Error:', data);
        const errorMsg = Object.values(data).flat().join(', ');
        toast.error(errorMsg || 'حدث خطأ أثناء حفظ السؤال');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-orange-200" dir="rtl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-orange-600">
            {initialData ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="border-orange-200 hover:bg-orange-50"
          >
            <Eye className="w-4 h-4 ml-2" />
            {showPreview ? 'إخفاء المعاينة' : 'معاينة السؤال'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showPreview && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="font-bold text-lg mb-3 text-orange-700">معاينة السؤال:</h3>
            <div className="space-y-3">
              <p className="text-gray-800 font-medium">{questionText || 'نص السؤال...'}</p>
              {questionType === 'multiple_choice' ? (
                <div className="space-y-2">
                  {options.filter(opt => opt.text.trim()).map((opt, idx) => (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-lg border-2 ${
                        correctAnswer === opt.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-orange-600">{opt.label}.</span>
                        <span>{opt.text || 'نص الخيار...'}</span>
                        {correctAnswer === opt.id && (
                          <Badge className="bg-blue-500 text-white mr-auto">✓ الإجابة الصحيحة</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    className={`p-3 rounded-lg border-2 ${
                      trueFalseAnswer === 'true'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-orange-600">أ.</span>
                      <span>صح</span>
                      {trueFalseAnswer === 'true' && (
                        <Badge className="bg-blue-500 text-white mr-auto">✓ الإجابة الصحيحة</Badge>
                      )}
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg border-2 ${
                      trueFalseAnswer === 'false'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-orange-600">ب.</span>
                      <span>خطأ</span>
                      {trueFalseAnswer === 'false' && (
                        <Badge className="bg-blue-500 text-white mr-auto">✓ الإجابة الصحيحة</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-4 pt-3 border-t border-orange-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">الدرجات:</span> {points} نقطة
                </p>
                {explanation && (
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-semibold">الشرح:</span> {explanation}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          {/* Question Type */}
          <div>
            <Label className="text-base font-semibold mb-2 block">نوع السؤال *</Label>
            <Select
              value={questionType}
              onValueChange={value => {
                setQuestionType(value as QuestionType);
                setCorrectAnswer('');
              }}
            >
              <SelectTrigger className="h-12 text-right" dir="rtl">
                <SelectValue placeholder="اختر نوع السؤال" />
              </SelectTrigger>
              <SelectContent dir="rtl" className="text-right">
                <SelectItem value="multiple_choice" className="text-right cursor-pointer">
                  الاختيار من متعدد
                </SelectItem>
                <SelectItem value="true_false" className="text-right cursor-pointer">صحيح / خطأ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Text */}
          <div>
            <Label className="text-base font-semibold mb-2 block">نص السؤال *</Label>
            <Textarea
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="اكتب السؤال هنا..."
              required
              className="min-h-24 text-base"
            />
          </div>

          {/* Options Section */}
          {questionType === 'multiple_choice' ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">الخيارات *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="border-orange-200 hover:bg-orange-50"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة خيار
                </Button>
              </div>
              
              {/* Option Style Selector */}
              <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Label className="text-sm font-semibold mb-2 block text-orange-700">
                  نوع الحروف/الرموز:
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOptionStyle('arabic')}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      optionStyle === 'arabic'
                        ? 'border-orange-500 bg-orange-100 text-orange-700 font-bold'
                        : 'border-gray-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">أ ب ج د</div>
                    <div className="text-xs">عربي</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOptionStyle('english')}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      optionStyle === 'english'
                        ? 'border-orange-500 bg-orange-100 text-orange-700 font-bold'
                        : 'border-gray-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">A B C D</div>
                    <div className="text-xs">إنجليزي</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOptionStyle('custom')}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      optionStyle === 'custom'
                        ? 'border-orange-500 bg-orange-100 text-orange-700 font-bold'
                        : 'border-gray-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    <div className="text-xl mb-1">✏️</div>
                    <div className="text-xs">مخصص</div>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {optionStyle === 'custom' ? (
                      <Input
                        value={option.label}
                        onChange={e => updateOptionLabel(index, e.target.value)}
                        placeholder="رمز"
                        className="w-16 h-12 text-center font-bold text-lg"
                        maxLength={2}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 text-orange-700 font-bold text-xl">
                        {option.label}
                      </div>
                    )}
                    <Input
                      value={option.text}
                      onChange={e => updateOption(index, e.target.value)}
                      placeholder={`أدخل نص الخيار ${option.label}`}
                      className="flex-1 h-12"
                      required
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Label className="text-base font-semibold mb-3 block">الإجابة الصحيحة *</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTrueFalseAnswer('true')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    trueFalseAnswer === 'true'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">✓</div>
                    <div className="font-semibold">صح</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTrueFalseAnswer('false')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    trueFalseAnswer === 'false'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">✗</div>
                    <div className="font-semibold">خطأ</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Correct Answer for Multiple Choice */}
          {questionType === 'multiple_choice' && (
            <div>
              <Label className="text-base font-semibold mb-2 block">الإجابة الصحيحة *</Label>
              <Select
                value={correctAnswer}
                onValueChange={setCorrectAnswer}
                required
              >
                <SelectTrigger className="h-12 text-right" dir="rtl">
                  <SelectValue placeholder="اختر الإجابة الصحيحة" />
                </SelectTrigger>
                <SelectContent dir="rtl" className="text-right">
                  {options.filter(opt => opt.text.trim()).map(opt => (
                    <SelectItem key={opt.id} value={opt.id} className="text-right cursor-pointer">
                      {opt.label}. {opt.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Points and Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-semibold mb-2 block">الدرجات *</Label>
              <Input
                type="number"
                value={points}
                onChange={e => setPoints(parseInt(e.target.value) || 1)}
                min="1"
                required
                className="h-12"
              />
            </div>
            <div>
              <Label className="text-base font-semibold mb-2 block">الترتيب</Label>
              <Input
                type="number"
                value={order || 1}
                onChange={e => setOrder(parseInt(e.target.value) || 1)}
                min="1"
                className="h-12"
              />
            </div>
          </div>

          {/* Explanation */}
          <div>
            <Label className="text-base font-semibold mb-2 block">الشرح (اختياري)</Label>
            <Textarea
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              placeholder="شرح الإجابة الصحيحة (اختياري)"
              className="min-h-20"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white h-12 text-base font-semibold"
            >
              {loading ? 'جاري الحفظ...' : initialData ? 'تحديث السؤال' : 'حفظ السؤال'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-12 text-base border-orange-200 hover:bg-orange-50"
              >
                إلغاء
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
