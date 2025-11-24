'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Video, FileText, ArrowRight, CheckCircle, Upload } from 'lucide-react';

interface LessonData {
  title: string;
  description: string;
  content: string;
  lessonType: 'video' | 'text' | 'mixed';
  duration: number;
  order: number;
  videoUrl: string;
  materials: string;
}

export default function AddLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [lessonData, setLessonData] = useState<LessonData>({
    title: '',
    description: '',
    content: '',
    lessonType: 'mixed',
    duration: 30,
    order: 1,
    videoUrl: '',
    materials: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof LessonData, value: any) => {
    setLessonData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Lesson added:', lessonData);
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push('/dashboard/teacher');
      }, 2000);
      
    } catch (error) {
      console.error('Error adding lesson:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">تم إضافة الدرس بنجاح!</h2>
                <p className="text-gray-600 mb-4">الدرس متاح الآن للطلاب المسجلين</p>
                <Button onClick={() => router.push('/dashboard/teacher')} className="w-full">
                  العودة للوحة التحكم
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">إضافة درس جديد</h1>
            <p className="text-gray-600 mt-2">أضف درساً جديداً للدورة التدريبية</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    تفاصيل الدرس
                  </CardTitle>
                  <CardDescription>
                    املأ البيانات التالية لإضافة الدرس
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Lesson Title */}
                    <div>
                      <Label htmlFor="title">عنوان الدرس *</Label>
                      <Input
                        id="title"
                        value={lessonData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="مثال: الدرس الأول - مقدمة في النحو"
                        required
                      />
                    </div>

                    {/* Lesson Description */}
                    <div>
                      <Label htmlFor="description">وصف الدرس</Label>
                      <Textarea
                        id="description"
                        value={lessonData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="اكتب وصفاً مختصراً لمحتوى الدرس وأهدافه"
                        rows={3}
                      />
                    </div>

                    {/* Lesson Type */}
                    <div>
                      <Label htmlFor="lessonType">نوع الدرس *</Label>
                      <Select value={lessonData.lessonType} onValueChange={(value: 'video' | 'text' | 'mixed') => handleInputChange('lessonType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">فيديو فقط</SelectItem>
                          <SelectItem value="text">نص فقط</SelectItem>
                          <SelectItem value="mixed">مختلط (فيديو + نص)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Duration and Order */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration">مدة الدرس (بالدقائق)</Label>
                        <Select value={lessonData.duration.toString()} onValueChange={(value) => handleInputChange('duration', parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 دقيقة</SelectItem>
                            <SelectItem value="30">30 دقيقة</SelectItem>
                            <SelectItem value="45">45 دقيقة</SelectItem>
                            <SelectItem value="60">60 دقيقة</SelectItem>
                            <SelectItem value="90">90 دقيقة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="order">ترتيب الدرس</Label>
                        <Input
                          id="order"
                          type="number"
                          min="1"
                          value={lessonData.order}
                          onChange={(e) => handleInputChange('order', parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* Video URL (if video lesson) */}
                    {(lessonData.lessonType === 'video' || lessonData.lessonType === 'mixed') && (
                      <div>
                        <Label htmlFor="videoUrl">رابط الفيديو</Label>
                        <Input
                          id="videoUrl"
                          value={lessonData.videoUrl}
                          onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          يمكنك استخدام روابط من YouTube أو Vimeo أو رفع الفيديو مباشرة
                        </p>
                      </div>
                    )}

                    {/* Lesson Content (if text lesson) */}
                    {(lessonData.lessonType === 'text' || lessonData.lessonType === 'mixed') && (
                      <div>
                        <Label htmlFor="content">محتوى الدرس</Label>
                        <Textarea
                          id="content"
                          value={lessonData.content}
                          onChange={(e) => handleInputChange('content', e.target.value)}
                          placeholder="اكتب محتوى الدرس هنا..."
                          rows={8}
                        />
                      </div>
                    )}

                    {/* Additional Materials */}
                    <div>
                      <Label htmlFor="materials">مواد إضافية</Label>
                      <Textarea
                        id="materials"
                        value={lessonData.materials}
                        onChange={(e) => handleInputChange('materials', e.target.value)}
                        placeholder="روابط لمواد إضافية، تمارين، أو ملفات مساعدة"
                        rows={3}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          جاري الإضافة...
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4 mr-2" />
                          إضافة الدرس
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Lesson Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    ملخص الدرس
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-gray-500" />
                    <span>الدرس رقم {lessonData.order}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="w-4 h-4 text-gray-500" />
                    <span>{lessonData.duration} دقيقة</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>
                      {lessonData.lessonType === 'video' ? 'فيديو فقط' : 
                       lessonData.lessonType === 'text' ? 'نص فقط' : 'مختلط'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">نصائح لإنشاء الدروس</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <p>• اجعل عنوان الدرس واضحاً ومحدداً</p>
                  <p>• قسم المحتوى إلى أجزاء قصيرة ومفهومة</p>
                  <p>• أضف أمثلة عملية وتطبيقية</p>
                  <p>• استخدم الفيديوهات للشرح المرئي</p>
                  <p>• أرفق مواد إضافية للمراجعة</p>
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">رفع الملفات</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    رفع ملف
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    يمكنك رفع ملفات PDF، Word، أو صور
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
