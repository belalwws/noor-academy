'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Plus, Trash2, Clock, FileQuestion, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { knowledgeLabApi } from '@/lib/api/knowledge-lab';
import type { UnitExercise } from '@/lib/api/knowledge-lab';
import { CreateUnitExerciseForm } from './CreateUnitExerciseForm';

interface UnitExercisesTabProps {
  labId: string;
  courseId?: string;
}

export function UnitExercisesTab({ labId, courseId }: UnitExercisesTabProps) {
  const router = useRouter();
  const [exercises, setExercises] = useState<UnitExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, [labId]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await knowledgeLabApi.listUnitExercises({
        knowledge_lab: labId,
      });
      if (response.success && response.data) {
        setExercises(response.data.results || []);
      } else {
        toast.error(response.error || 'فشل في تحميل التمارين');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل التمارين');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التمرين؟')) return;

    try {
      const response = await knowledgeLabApi.deleteUnitExercise(id);
      if (response.success) {
        toast.success('تم حذف التمرين بنجاح');
        fetchExercises();
      } else {
        toast.error(response.error || 'فشل في حذف التمرين');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف التمرين');
    }
  };

  const handleCreate = () => {
    setShowCreateForm(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchExercises();
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {showCreateForm && (
        <CreateUnitExerciseForm
          labId={labId}
          courseId={courseId}
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">تمارين الوحدات</h3>
        <Button 
          onClick={handleCreate}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white" 
          dir="rtl"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة تمرين وحدة
        </Button>
      </div>

      {exercises.length === 0 ? (
        <Card className="border-orange-100" dir="rtl">
          <CardContent className="py-12 text-center text-gray-500">
            <Layers className="w-16 h-16 mx-auto mb-4 text-amber-300" />
            <p className="text-lg font-semibold mb-2">لا توجد تمارين للوحدات</p>
            <p className="text-sm">أنشئ تمرين وحدة جديد من بنك الأسئلة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exercises.map(exercise => (
            <Card key={exercise.id} className="border-orange-100 hover:shadow-md transition-shadow" dir="rtl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{exercise.title}</CardTitle>
                    {exercise.unit_title && (
                      <CardDescription className="mb-2">الوحدة: {exercise.unit_title}</CardDescription>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <FileQuestion className="w-3 h-3" />
                        {exercise.questions?.length || 0} سؤال
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(exercise.time_limit / 60)} دقيقة
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        router.push(`/knowledge-lab/${labId}/exercises/${exercise.id}?type=unit-exercise`);
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(exercise.id)}
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

