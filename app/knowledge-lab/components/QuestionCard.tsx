'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { Question } from '@/types/knowledge-lab';

interface QuestionCardProps {
  question: Question;
  onEdit?: (question: Question) => void;
  onDelete?: () => void;
}

export function QuestionCard({
  question,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const API_BASE_URL =
        process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

      const response = await fetch(
        `${API_BASE_URL}/knowledge-lab/questions/${question.id}/`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('تم حذف السؤال بنجاح! ✨');
        onDelete?.();
      } else {
        toast.error('فشل حذف السؤال');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Parse options/choices from JSON
  let choices: any[] = [];
  let parsedOptions: any[] = [];
  
  // Try to parse options (new format)
  if (question.options) {
    try {
      parsedOptions = typeof question.options === 'string' 
        ? JSON.parse(question.options) 
        : question.options;
      if (Array.isArray(parsedOptions)) {
        choices = parsedOptions.map((opt: any) => {
          if (typeof opt === 'object' && opt.text) {
            return opt.label ? `${opt.label}. ${opt.text}` : opt.text;
          }
          return String(opt);
        });
      }
    } catch (e) {
      // Fallback to choices
    }
  }
  
  // Fallback to choices (legacy format)
  if (choices.length === 0 && question.choices) {
    try {
      const parsed = JSON.parse(question.choices);
      if (Array.isArray(parsed)) {
        choices = parsed.map((opt: any) => {
          if (typeof opt === 'object' && opt.text) {
            return opt.label ? `${opt.label}. ${opt.text}` : opt.text;
          }
          return String(opt);
        });
      }
    } catch {
      choices = (question.choices || '').split(',').map(c => c.trim()).filter(c => c);
    }
  }
  
  // Get question text
  const questionText = question.text || question.question_text || 'نص السؤال...';
  
  // Get correct answer
  let correctAnswer: string | string[] = question.correct_answer || '';
  if (typeof correctAnswer === 'string') {
    try {
      const parsed = JSON.parse(correctAnswer);
      if (Array.isArray(parsed)) {
        correctAnswer = parsed[0] || '';
      }
    } catch {
      // Keep as string
    }
  } else if (Array.isArray(correctAnswer)) {
    correctAnswer = correctAnswer[0] || '';
  }

  return (
    <>
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader>
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {question.question_type_display || question.question_type}
                </Badge>
                <Badge className="bg-amber-100 text-amber-800">
                  {question.points} نقطة
                </Badge>
              </div>
              <CardTitle className="text-base">{questionText}</CardTitle>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit?.(question)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Choices */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">الخيارات:</p>
            <div className="space-y-1">
              {choices.length > 0 ? (
                choices.map((choice, idx) => {
                  const choiceText = typeof choice === 'string' ? choice : (choice.text || String(choice));
                  const choiceId = typeof choice === 'object' ? choice.id : String(idx);
                  const isCorrect = choiceId === correctAnswer || choiceText.includes(String(correctAnswer));
                  
                  return (
                    <p
                      key={idx}
                      className={`text-sm p-2 rounded ${
                        isCorrect
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : 'bg-gray-100'
                      }`}
                    >
                      {choiceText}
                      {isCorrect && ' ✓ صحيح'}
                    </p>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">لا توجد خيارات متاحة</p>
              )}
            </div>
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="pt-2 border-t">
              <p className="text-xs font-medium text-gray-600 mb-1">الشرح:</p>
              <p className="text-sm text-gray-700">{question.explanation}</p>
            </div>
          )}

          {/* Meta Info */}
          <div className="pt-2 border-t text-xs text-gray-500 space-y-1">
            <p>الترتيب: #{question.order}</p>
            <p>تاريخ الإنشاء: {new Date(question.created_at).toLocaleDateString('ar-EG')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف السؤال</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
