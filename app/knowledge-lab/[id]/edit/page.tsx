'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  FlaskConical, Save, ArrowLeft, Upload, X, Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ProtectedRoute from '@/components/ProtectedRoute';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

interface KnowledgeLabFormData {
  title: string;
  description: string;
  thumbnail: string;
  cover_image: string;
  objective: string;
  topics: string;
  country: string;
  subject: string;
  academic_year: string;
  price: string;
}

const KnowledgeLabEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const labId = params['id'] as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState<KnowledgeLabFormData>({
    title: '',
    description: '',
    thumbnail: '',
    cover_image: '',
    objective: '',
    topics: '',
    country: '',
    subject: '',
    academic_year: '',
    price: ''
  });

  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    fetchLabDetails();
  }, [labId]);

  const fetchLabDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('يرجى تسجيل الدخول');
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/knowledge-lab/labs/${labId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOriginalData(data);
        
        // Convert topics array to comma-separated string for editing
        let topicsString = '';
        if (data.topics) {
          if (Array.isArray(data.topics)) {
            topicsString = data.topics.join(', ');
          } else if (typeof data.topics === 'string') {
            topicsString = data.topics;
          }
        }
        
        setFormData({
          title: data.title || '',
          description: data.description || '',
          thumbnail: data.thumbnail || '',
          cover_image: data.cover_image || '',
          objective: data.objective || '',
          topics: topicsString,
          country: data.country || '',
          subject: data.subject || '',
          academic_year: data.academic_year || '',
          price: data.price || ''
        });
      } else {
        toast.error('فشل في تحميل بيانات المختبر');
        router.push('/knowledge-lab');
      }
    } catch (error) {
      console.error('Error fetching lab:', error);
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'thumbnail' | 'cover_image'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة صالحة');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    try {
      setUploadingImage(true);
      
      // TODO: Implement actual image upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      const imageUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({ ...prev, [field]: imageUrl }));
      toast.success('تم رفع الصورة بنجاح');
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('فشل رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان المختبر');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('يرجى إدخال وصف المختبر');
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً');
        router.push('/login');
        return;
      }

      // Only send changed fields (PATCH)
      const changedFields: any = {};
      Object.keys(formData).forEach((key) => {
        const fieldKey = key as keyof KnowledgeLabFormData;
        
        // Special handling for topics - convert to JSON array
        if (key === 'topics' && formData.topics !== (originalData.topics || '')) {
          const topicsArray = formData.topics
            .split(',')
            .map(topic => topic.trim())
            .filter(topic => topic.length > 0);
          changedFields[key] = topicsArray;
        } else if (formData[fieldKey] !== (originalData[fieldKey] || '')) {
          changedFields[key] = formData[fieldKey] || null;
        }
      });

      if (Object.keys(changedFields).length === 0) {
        toast.info('لم يتم تغيير أي بيانات');
        return;
      }

      console.log('🔄 Updating Knowledge Lab:', changedFields);

      const response = await fetch(`${API_BASE_URL}/knowledge-lab/labs/${labId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(changedFields)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم تحديث المختبر بنجاح! ✨');
        router.push(`/knowledge-lab/${labId}/manage`);
      } else {
        console.error('❌ Error response:', data);
        toast.error(data.detail || 'حدث خطأ أثناء التحديث');
      }

    } catch (error) {
      console.error('❌ Submit error:', error);
      toast.error('حدث خطأ أثناء التحديث');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-8 px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="border-orange-200 hover:bg-orange-50"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة
              </Button>
              <div className="flex items-center gap-3">
                <FlaskConical className="w-10 h-10 text-orange-600" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  تعديل مختبر المعرفة
                </h1>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-orange-100 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10">
                <CardTitle className="text-2xl text-orange-900">تعديل البيانات</CardTitle>
                <CardDescription>
                  قم بتعديل معلومات المختبر
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-semibold">
                      عنوان المختبر *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="text-lg"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-semibold">
                      وصف المختبر *
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      required
                    />
                  </div>

                  {/* Objective */}
                  <div className="space-y-2">
                    <Label htmlFor="objective" className="text-base font-semibold">
                      الأهداف التعليمية *
                    </Label>
                    <Textarea
                      id="objective"
                      name="objective"
                      value={formData.objective}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>

                  {/* Topics */}
                  <div className="space-y-2">
                    <Label htmlFor="topics" className="text-base font-semibold">
                      المواضيع المشمولة
                    </Label>
                    <Input
                      id="topics"
                      name="topics"
                      value={formData.topics}
                      onChange={handleInputChange}
                      placeholder="مثال: الجبر، الهندسة، التفاضل (افصل بفواصل)"
                    />
                    <p className="text-xs text-gray-500">
                      أدخل المواضيع مفصولة بفواصل (،)
                    </p>
                  </div>

                  {/* Images Upload */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Thumbnail */}
                    <div className="space-y-2">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-orange-600" />
                        صورة مصغرة
                      </Label>
                      <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 text-center hover:border-orange-500 transition-colors">
                        {formData.thumbnail ? (
                          <div className="relative">
                            <img 
                              src={formData.thumbnail} 
                              alt="Thumbnail" 
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <Upload className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">رفع صورة مصغرة</p>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, 'thumbnail')}
                              disabled={uploadingImage}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-2">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-orange-600" />
                        صورة الغلاف
                      </Label>
                      <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 text-center hover:border-orange-500 transition-colors">
                        {formData.cover_image ? (
                          <div className="relative">
                            <img 
                              src={formData.cover_image} 
                              alt="Cover" 
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <Upload className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">رفع صورة الغلاف</p>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, 'cover_image')}
                              disabled={uploadingImage}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">الدولة</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">المادة</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="academic_year">السنة الدراسية</Label>
                      <Input
                        id="academic_year"
                        name="academic_year"
                        value={formData.academic_year}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Price (if standalone) */}
                  {originalData?.is_standalone && (
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-base font-semibold">
                        السعر (بالجنيه المصري)
                      </Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1"
                      disabled={saving}
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving || uploadingImage}
                      className="flex-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white shadow-lg"
                    >
                      {saving ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 ml-2" />
                          حفظ التعديلات
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default KnowledgeLabEditPage;
