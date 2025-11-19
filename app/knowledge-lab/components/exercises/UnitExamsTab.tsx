'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookMarked, Plus, Trash2, Clock, FileQuestion, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { knowledgeLabApi } from '@/lib/api/knowledge-lab';
import type { UnitExam } from '@/lib/api/knowledge-lab';
import { CreateUnitExamForm } from './CreateUnitExamForm';

interface UnitExamsTabProps {
  labId: string;
  courseId?: string;
}

export function UnitExamsTab({ labId, courseId }: UnitExamsTabProps) {
  const router = useRouter();
  const [exams, setExams] = useState<UnitExam[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchExams();
  }, [labId]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await knowledgeLabApi.listUnitExams({
        knowledge_lab: labId,
      });
      if (response.success && response.data) {
        setExams(response.data.results || []);
      } else {
        toast.error(response.error || 'فشل في تحميل الاختبارات');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل الاختبارات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return;

    try {
      const response = await knowledgeLabApi.deleteUnitExam(id);
      if (response.success) {
        toast.success('تم حذف الاختبار بنجاح');
        fetchExams();
      } else {
        toast.error(response.error || 'فشل في حذف الاختبار');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف الاختبار');
    }
  };

  const handleCreate = () => {
    setShowCreateForm(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchExams();
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {showCreateForm && (
        <CreateUnitExamForm
          labId={labId}
          courseId={courseId}
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">اختبارات الوحدات</h3>
        <Button 
          onClick={handleCreate}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white" 
          dir="rtl"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة اختبار وحدة
        </Button>
      </div>

      {exams.length === 0 ? (
        <Card className="border-orange-100" dir="rtl">
          <CardContent className="py-12 text-center text-gray-500">
            <BookMarked className="w-16 h-16 mx-auto mb-4 text-amber-300" />
            <p className="text-lg font-semibold mb-2">لا توجد اختبارات للوحدات</p>
            <p className="text-sm">أنشئ اختبار وحدة جديد من بنك الأسئلة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exams.map(exam => (
            <Card key={exam.id} className="border-orange-100 hover:shadow-md transition-shadow" dir="rtl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{exam.title}</CardTitle>
                    {exam.unit_title && (
                      <CardDescription className="mb-2">الوحدة: {exam.unit_title}</CardDescription>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <FileQuestion className="w-3 h-3" />
                        {exam.questions?.length || 0} سؤال
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(exam.time_limit / 60)} دقيقة
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        router.push(`/knowledge-lab/${labId}/exercises/${exam.id}?type=unit-exam`);
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(exam.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

