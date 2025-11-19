'use client';

import { motion } from 'framer-motion';
import { FlaskConical, Plus, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { StepProps, KnowledgeLabData } from '../types';

export function Step6KnowledgeLab({ formData, updateFormData }: StepProps) {
  const [knowledgeLab, setKnowledgeLab] = useState<KnowledgeLabData>(
    formData.knowledgeLab || {
      enabled: false,
      title: '',
      description: '',
      objective: '',
      topics: '',
      country: '',
      subject: '',
      academic_year: '',
      thumbnail: null,
      thumbnailPreview: '',
      cover_image: null,
      coverImagePreview: '',
    }
  );

  useEffect(() => {
    updateFormData('knowledgeLab', knowledgeLab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knowledgeLab]);

  const handleToggle = (enabled: boolean) => {
    setKnowledgeLab(prev => ({ ...prev, enabled }));
  };

  const handleFieldChange = (field: keyof KnowledgeLabData, value: any) => {
    setKnowledgeLab(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field: 'thumbnail' | 'cover_image', file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setKnowledgeLab(prev => ({
          ...prev,
          [field]: file,
          [`${field}Preview`]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setKnowledgeLab(prev => ({
        ...prev,
        [field]: null,
        [`${field}Preview`]: '',
      }));
    }
  };

  const removeImage = (field: 'thumbnail' | 'cover_image') => {
    setKnowledgeLab(prev => ({
      ...prev,
      [field]: null,
      [`${field}Preview`]: '',
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <FlaskConical className="w-6 h-6 text-orange-600" />
          مختبر المعرفة (اختياري)
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          أنشئ مختبر معرفة خاص بالدورة يحتوي على بنك أسئلة وتمارين تفاعلية
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <div>
              <Label htmlFor="enable-knowledge-lab" className="text-base font-semibold text-gray-900 dark:text-white cursor-pointer">
                إنشاء مختبر معرفة خاص بالدورة
              </Label>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                سيتم ربط مختبر المعرفة بهذه الدورة تلقائياً
              </p>
            </div>
          </div>
          <Switch
            id="enable-knowledge-lab"
            checked={knowledgeLab.enabled}
            onCheckedChange={handleToggle}
          />
        </div>
      </div>

      {/* Knowledge Lab Form - Only show if enabled */}
      {knowledgeLab.enabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">المعلومات الأساسية</h3>
            
            <div className="space-y-2">
              <Label htmlFor="lab-title">عنوان مختبر المعرفة *</Label>
              <Input
                id="lab-title"
                value={knowledgeLab.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="مثال: مختبر معرفة - دورة الرياضيات"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lab-description">الوصف</Label>
              <Textarea
                id="lab-description"
                value={knowledgeLab.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="وصف مختبر المعرفة"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lab-objective">الهدف</Label>
              <Textarea
                id="lab-objective"
                value={knowledgeLab.objective}
                onChange={(e) => handleFieldChange('objective', e.target.value)}
                placeholder="هدف مختبر المعرفة"
                rows={3}
              />
            </div>
          </div>

          {/* Topics and Additional Info */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">معلومات إضافية</h3>
            
            <div className="space-y-2">
              <Label htmlFor="lab-topics">المواضيع (مفصولة بفواصل)</Label>
              <Input
                id="lab-topics"
                value={knowledgeLab.topics}
                onChange={(e) => handleFieldChange('topics', e.target.value)}
                placeholder="رياضيات، جبر، هندسة"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lab-country">البلد</Label>
                <Input
                  id="lab-country"
                  value={knowledgeLab.country}
                  onChange={(e) => handleFieldChange('country', e.target.value)}
                  placeholder="السعودية"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lab-subject">المادة</Label>
                <Input
                  id="lab-subject"
                  value={knowledgeLab.subject}
                  onChange={(e) => handleFieldChange('subject', e.target.value)}
                  placeholder="الرياضيات"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lab-academic-year">العام الدراسي</Label>
                <Input
                  id="lab-academic-year"
                  value={knowledgeLab.academic_year}
                  onChange={(e) => handleFieldChange('academic_year', e.target.value)}
                  placeholder="2024-2025"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">الصور (اختياري)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thumbnail */}
              <div className="space-y-2">
                <Label htmlFor="lab-thumbnail">صورة مصغرة</Label>
                {knowledgeLab.thumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={knowledgeLab.thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage('thumbnail')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">اضغط لرفع صورة</span>
                    <input
                      type="file"
                      id="lab-thumbnail"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleImageUpload('thumbnail', file);
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="lab-cover-image">صورة الغلاف</Label>
                {knowledgeLab.coverImagePreview ? (
                  <div className="relative">
                    <img
                      src={knowledgeLab.coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage('cover_image')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">اضغط لرفع صورة</span>
                    <input
                      type="file"
                      id="lab-cover-image"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleImageUpload('cover_image', file);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>ملاحظة:</strong> سيتم إنشاء مختبر المعرفة تلقائياً بعد إنشاء الدورة وربطه بها. يمكنك إضافة الأسئلة والتمارين لاحقاً من صفحة إدارة مختبر المعرفة.
            </p>
          </div>
        </motion.div>
      )}

      {/* Info when disabled */}
      {!knowledgeLab.enabled && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 text-center">
          <FlaskConical className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">
            يمكنك تفعيل هذا الخيار لإنشاء مختبر معرفة خاص بالدورة
          </p>
        </div>
      )}
    </div>
  );
}


