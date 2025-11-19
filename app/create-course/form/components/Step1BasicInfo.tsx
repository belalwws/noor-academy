import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StepProps } from '../types';

export function Step1BasicInfo({ formData, updateFormData, courseType }: StepProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnail' | 'cover_image') => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData(field, file);
      
      // Create preview - map field names correctly
      const previewField = field === 'thumbnail' ? 'thumbnailPreview' : 'coverImagePreview';
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormData(previewField as any, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (field: 'thumbnail' | 'cover_image') => {
    updateFormData(field, null);
    const previewField = field === 'thumbnail' ? 'thumbnailPreview' : 'coverImagePreview';
    updateFormData(previewField as any, '');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          المعلومات الأساسية
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          أدخل المعلومات الأساسية للدورة
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-base font-semibold">
            عنوان الدورة <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            placeholder="مثال: دورة تعليم اللغة العربية للمبتدئين"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-base font-semibold">
            وصف الدورة <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            placeholder="اكتب وصفاً مفصلاً عن الدورة وما سيتعلمه الطلاب..."
            rows={4}
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date" className="text-base font-semibold">
              تاريخ البدء <span className="text-red-500">*</span>
            </Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => updateFormData('start_date', e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="end_date" className="text-base font-semibold">
              تاريخ الانتهاء <span className="text-red-500">*</span>
            </Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => updateFormData('end_date', e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div>
          <Label className="text-base font-semibold">صورة الغلاف (Thumbnail)</Label>
          <div className="mt-2">
            {formData.thumbnailPreview ? (
              <div className="relative inline-block">
                <img
                  src={formData.thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 left-2"
                  onClick={() => removeImage('thumbnail')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-500">انقر لرفع صورة الغلاف</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'thumbnail')}
                />
              </label>
            )}
          </div>
        </div>

        {/* Cover Image Upload */}
        <div>
          <Label className="text-base font-semibold">صورة الخلفية (Cover Image)</Label>
          <div className="mt-2">
            {formData.coverImagePreview ? (
              <div className="relative inline-block w-full">
                <img
                  src={formData.coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 left-2"
                  onClick={() => removeImage('cover_image')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-500">انقر لرفع صورة الخلفية</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'cover_image')}
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
          <input
            type="checkbox"
            id="accepting_applications"
            checked={formData.accepting_applications}
            onChange={(e) => updateFormData('accepting_applications', e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          <Label htmlFor="accepting_applications" className="cursor-pointer font-medium">
            قبول طلبات التسجيل من الطلاب
          </Label>
        </div>
      </div>
    </div>
  );
}

