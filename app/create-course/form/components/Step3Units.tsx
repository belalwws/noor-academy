'use client';

import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Edit, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { recordedCoursesApi } from '@/lib/api/recorded-courses';
import { Spinner } from '@/components/ui/spinner';
import type { StepProps, Unit } from '../types';

interface UnitWithApiId extends Unit {
  apiId?: string; // API ID if unit is saved
  isSaving?: boolean;
  isDeleting?: boolean;
}

export function Step3Units({ formData, updateFormData }: StepProps) {
  const [units, setUnits] = useState<UnitWithApiId[]>(formData.units);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);

  // Check if course is already created (for editing existing course)
  useEffect(() => {
    // Try to get courseId from formData or localStorage
    const savedCourseId = localStorage.getItem('currentRecordedCourseId');
    if (savedCourseId && savedCourseId !== 'null' && savedCourseId !== 'undefined') {
      setCourseId(savedCourseId);
      loadUnits(savedCourseId);
    }
    
    // Listen for course creation event
    const handleCourseCreated = (event: CustomEvent) => {
      const newCourseId = event.detail.courseId;
      console.log('🎉 Course created event received:', newCourseId);
      setCourseId(newCourseId);
      // Optionally load units if needed
      // loadUnits(newCourseId);
    };
    
    window.addEventListener('recordedCourseCreated', handleCourseCreated as EventListener);
    
    return () => {
      window.removeEventListener('recordedCourseCreated', handleCourseCreated as EventListener);
    };
  }, []);

  // Update units when formData changes
  useEffect(() => {
    setUnits(formData.units);
  }, [formData.units]);

  const loadUnits = async (courseId: string) => {
    try {
      setLoadingUnits(true);
      const response = await recordedCoursesApi.listUnits({ course: courseId });
      const apiUnits = response.results || [];
      
      // Transform API units to form units
      const transformedUnits: UnitWithApiId[] = apiUnits.map((unit: any) => ({
        id: unit.id,
        apiId: unit.id,
        title: unit.title,
        description: unit.description,
        order: unit.order,
        isSaving: false,
        isDeleting: false,
      }));
      
      setUnits(transformedUnits);
      updateFormData('units', transformedUnits);
      toast.success(`تم تحميل ${transformedUnits.length} وحدة`);
    } catch (error: any) {
      console.error('Error loading units:', error);
      toast.error('فشل في تحميل الوحدات');
    } finally {
      setLoadingUnits(false);
    }
  };

  const addUnit = () => {
    const newUnit: UnitWithApiId = {
      id: `unit-${Date.now()}`,
      title: '',
      description: '',
      order: units.length + 1,
      isSaving: false,
      isDeleting: false,
    };
    const updatedUnits = [...units, newUnit];
    setUnits(updatedUnits);
    updateFormData('units', updatedUnits);
    setEditingUnit(newUnit.id);
  };

  const saveUnit = async (unit: UnitWithApiId) => {
    if (!courseId) {
      toast.error('يرجى إنشاء الدورة أولاً قبل إضافة الوحدات');
      return;
    }

    if (!unit.title || !unit.description) {
      toast.error('يرجى ملء عنوان ووصف الوحدة');
      return;
    }

    try {
      // Mark unit as saving
      setUnits(prev => prev.map(u => 
        u.id === unit.id ? { ...u, isSaving: true } : u
      ));

      if (unit.apiId) {
        // Update existing unit
        const updatedUnit = await recordedCoursesApi.updateUnit(unit.apiId, {
          title: unit.title,
          description: unit.description,
          order: unit.order,
        });
        
        setUnits(prev => prev.map(u => 
          u.id === unit.id ? { ...u, ...updatedUnit, apiId: updatedUnit.id, isSaving: false } : u
        ));
        
        toast.success('تم تحديث الوحدة بنجاح');
      } else {
        // Create new unit
        const createdUnit = await recordedCoursesApi.createUnit({
          course: courseId,
          title: unit.title,
          description: unit.description,
          order: unit.order,
        });
        
        setUnits(prev => prev.map(u => 
          u.id === unit.id ? { ...u, apiId: createdUnit.id, isSaving: false } : u
        ));
        
        // Update formData with API ID
        const updatedFormUnits = units.map(u => 
          u.id === unit.id ? { ...u, apiId: createdUnit.id } : u
        );
        updateFormData('units', updatedFormUnits);
        
        toast.success('تم حفظ الوحدة بنجاح');
      }
      
      setEditingUnit(null);
    } catch (error: any) {
      console.error('Error saving unit:', error);
      toast.error('فشل في حفظ الوحدة');
      setUnits(prev => prev.map(u => 
        u.id === unit.id ? { ...u, isSaving: false } : u
      ));
    }
  };

  const deleteUnit = async (unit: UnitWithApiId) => {
    if (!unit.apiId) {
      // Unit not saved yet, just remove from local state
      removeUnitLocal(unit.id);
      return;
    }

    if (!confirm('هل أنت متأكد من حذف هذه الوحدة؟ سيتم حذف جميع الدروس المرتبطة بها.')) {
      return;
    }

    try {
      setUnits(prev => prev.map(u => 
        u.id === unit.id ? { ...u, isDeleting: true } : u
      ));

      await recordedCoursesApi.deleteUnit(unit.apiId);
      
      removeUnitLocal(unit.id);
      toast.success('تم حذف الوحدة بنجاح');
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      toast.error('فشل في حذف الوحدة');
      setUnits(prev => prev.map(u => 
        u.id === unit.id ? { ...u, isDeleting: false } : u
      ));
    }
  };

  const removeUnitLocal = (id: string) => {
    const updatedUnits = units.filter((u: UnitWithApiId) => u.id !== id)
      .map((u, index) => ({ ...u, order: index + 1 }));
    setUnits(updatedUnits);
    updateFormData('units', updatedUnits);
    
    // Remove lessons associated with this unit
    const updatedLessons = formData.lessons.filter(l => l.unitId !== id);
    updateFormData('lessons', updatedLessons);
  };

  const updateUnit = (id: string, field: keyof Unit, value: any) => {
    const updatedUnits = units.map((u: UnitWithApiId) =>
      u.id === id ? { ...u, [field]: value } : u
    );
    setUnits(updatedUnits);
    updateFormData('units', updatedUnits);
  };

  const startEditing = (unitId: string) => {
    setEditingUnit(unitId);
  };

  const cancelEditing = (unit: UnitWithApiId) => {
    if (!unit.apiId) {
      // If unit is not saved, remove it
      removeUnitLocal(unit.id);
    } else {
      // Reload unit from API or reset to original values
      setEditingUnit(null);
    }
  };

  // Expose courseId setter to parent component
  useEffect(() => {
    // Store courseId in a way that parent can access
    (window as any).__recordedCourseId = courseId;
  }, [courseId]);

  if (loadingUnits) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
        <span className="ml-4 text-slate-600">جاري تحميل الوحدات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          الوحدات الدراسية
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          قسّم دورتك إلى وحدات منظمة ومترابطة
        </p>
        {courseId && (
          <div className="mt-2 text-sm text-green-600 dark:text-green-400">
            ✓ الدورة محفوظة - يمكنك حفظ الوحدات مباشرة
          </div>
        )}
        {!courseId && (
          <div className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            ⚠ سيتم حفظ الوحدات بعد إنشاء الدورة
          </div>
        )}
      </div>

      <div className="space-y-4">
        {units.map((unit: UnitWithApiId, index: number) => {
          const isEditing = editingUnit === unit.id;
          const isSaved = !!unit.apiId;
          
          return (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 border-2 rounded-lg bg-white dark:bg-slate-800 ${
                isSaved 
                  ? 'border-green-200 dark:border-green-800' 
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold text-lg">الوحدة {index + 1}</h3>
                  {isSaved && (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded">
                      محفوظة
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      {courseId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => saveUnit(unit)}
                          disabled={unit.isSaving}
                          className="text-green-500 hover:text-green-700 hover:bg-green-50"
                        >
                          {unit.isSaving ? (
                            <Spinner className="w-4 h-4" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelEditing(unit)}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {courseId && !isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(unit.id)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteUnit(unit)}
                        disabled={unit.isDeleting}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        {unit.isDeleting ? (
                          <Spinner className="w-4 h-4" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  value={unit.title}
                  onChange={(e) => updateUnit(unit.id, 'title', e.target.value)}
                  placeholder="عنوان الوحدة (مثال: مقدمة في التجويد)"
                  className="font-medium"
                  disabled={!isEditing && isSaved}
                />
                <Textarea
                  value={unit.description}
                  onChange={(e) => updateUnit(unit.id, 'description', e.target.value)}
                  placeholder="وصف الوحدة وما تحتويه من مواضيع..."
                  rows={3}
                  disabled={!isEditing && isSaved}
                />
                {courseId && isEditing && (
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => saveUnit(unit)}
                      disabled={unit.isSaving || !unit.title || !unit.description}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {unit.isSaving ? (
                        <>
                          <Spinner className="w-4 h-4 ml-2" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 ml-2" />
                          حفظ الوحدة
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        <Button
          onClick={addUnit}
          variant="outline"
          className="w-full border-dashed border-2 h-14 gap-2 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:border-amber-500"
        >
          <Plus className="w-5 h-5" />
          إضافة وحدة جديدة
        </Button>

        {units.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            👆 ابدأ بإضافة وحدتك الأولى
          </div>
        )}
      </div>
    </div>
  );
}

