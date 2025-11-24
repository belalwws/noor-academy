'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  FlaskConical, BookOpen, DollarSign, Globe, Calendar, 
  Upload, Image as ImageIcon, Target, Tag, ArrowRight, 
  Sparkles, CheckCircle, AlertCircle, X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/ProtectedRoute';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

// Content Type IDs - Update these based on your Django ContentType IDs
// You can find these in Django Admin or by running:
// ContentType.objects.get(app_label='courses', model='course').id
const CONTENT_TYPE_IDS = {
  LIVE_COURSE: 1,      // Update with actual ID
  RECORDED_COURSE: 2   // Update with actual ID
};

interface KnowledgeLabFormData {
  title: string;
  description: string;
  thumbnail: File | null;
  thumbnailPreview: string;
  cover_image: File | null;
  coverImagePreview: string;
  objective: string;
  topics: string;
  is_standalone: boolean;
  course_type: string | null; // 'live' or 'recorded'
  course_id: string | null;
  country: string;
  subject: string;
  academic_year: string;
  price: string;
}

const KnowledgeLabCreatePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get course info from URL params if linking to existing course
  const courseId = searchParams.get('courseId');
  const courseType = searchParams.get('courseType'); // 'live' or 'recorded'
  const courseName = searchParams.get('courseName');

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState<KnowledgeLabFormData>({
    title: '',
    description: '',
    thumbnail: null,
    thumbnailPreview: '',
    cover_image: null,
    coverImagePreview: '',
    objective: '',
    topics: '',
    is_standalone: !courseId, // If no courseId, default to standalone
    course_type: courseType || null,
    course_id: courseId || null,
    country: '',
    subject: '',
    academic_year: '',
    price: ''
  });

  useEffect(() => {
    // If linked to a course, pre-fill the course info
    if (courseId && courseType) {
      setFormData(prev => ({
        ...prev,
        is_standalone: false,
        course_type: courseType,
        course_id: courseId
      }));
    }
  }, [courseId, courseType]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      is_standalone: checked,
      course_type: checked ? null : prev.course_type,
      course_id: checked ? null : prev.course_id
    }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'thumbnail' | 'cover_image'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة صالحة');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    try {
      setUploadingImage(true);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Store the file and preview
      if (field === 'thumbnail') {
        setFormData(prev => ({ 
          ...prev, 
          thumbnail: file,
          thumbnailPreview: previewUrl
        }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          cover_image: file,
          coverImagePreview: previewUrl
        }));
      }
      
      toast.success('تم تحديد الصورة بنجاح');
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('فشل تحديد الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان المختبر');
      return false;
    }

    if (!formData.description.trim()) {
      toast.error('يرجى إدخال وصف المختبر');
      return false;
    }

    if (!formData.objective.trim()) {
      toast.error('يرجى إدخال أهداف المختبر');
      return false;
    }

    if (formData.is_standalone && !formData.price) {
      toast.error('يرجى تحديد سعر المختبر المستقل');
      return false;
    }

    if (!formData.is_standalone && !formData.course_id) {
      toast.error('يرجى تحديد الدورة المرتبطة');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً');
        router.push('/login');
        return;
      }

      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('objective', formData.objective);
      formDataToSend.append('is_standalone', formData.is_standalone.toString());
      
      // Add optional text fields
      // topics should be JSON array - convert comma-separated string to array
      if (formData.topics) {
        const topicsArray = formData.topics
          .split(',')
          .map(topic => topic.trim())
          .filter(topic => topic.length > 0);
        formDataToSend.append('topics', JSON.stringify(topicsArray));
      }
      if (formData.country) formDataToSend.append('country', formData.country);
      if (formData.subject) formDataToSend.append('subject', formData.subject);
      if (formData.academic_year) formDataToSend.append('academic_year', formData.academic_year);
      
      // Add course info if not standalone
      if (!formData.is_standalone && formData.course_id) {
        // Backend expects course_type as model name: 'course' for live, 'recordedcourse' for recorded
        const courseTypeBackend = formData.course_type === 'live' ? 'course' : 'recordedcourse';
        formDataToSend.append('course_type', courseTypeBackend);
        formDataToSend.append('course_id', formData.course_id);
        
        // For GenericForeignKey, we also need content_type and object_id
        if (formData.course_type === 'live') {
          formDataToSend.append('content_type', CONTENT_TYPE_IDS.LIVE_COURSE.toString());
        } else if (formData.course_type === 'recorded') {
          formDataToSend.append('content_type', CONTENT_TYPE_IDS.RECORDED_COURSE.toString());
        }
        formDataToSend.append('object_id', formData.course_id);
      }
      
      // Add price if standalone
      if (formData.is_standalone && formData.price) {
        formDataToSend.append('price', formData.price);
      }
      
      // Add image files if present
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }
      if (formData.cover_image) {
        formDataToSend.append('cover_image', formData.cover_image);
      }

      console.log('🧪 Creating Knowledge Lab with FormData');
      console.log('📦 FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`   ${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`   ${key}:`, value);
        }
      }

      const response = await fetch(`${API_BASE_URL}/knowledge-lab/labs/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم إنشاء مختبر المعرفة بنجاح! ✨');
        
        // Navigate to the lab management page
        router.push(`/knowledge-lab/${data.id}/manage`);
      } else {
        console.error('❌ Error response:', data);
        console.error('❌ Full error details:', JSON.stringify(data, null, 2));
        
        // Display specific field errors
        if (typeof data === 'object' && !data.detail) {
          Object.keys(data).forEach(key => {
            const errors = data[key];
            if (Array.isArray(errors)) {
              errors.forEach(error => toast.error(`${key}: ${error}`));
            } else {
              toast.error(`${key}: ${errors}`);
            }
          });
        } else {
          toast.error(data.detail || 'حدث خطأ أثناء إنشاء المختبر');
        }
      }

    } catch (error) {
      console.error('❌ Submit error:', error);
      toast.error('حدث خطأ أثناء إنشاء المختبر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-8 px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <FlaskConical className="w-12 h-12 text-orange-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                إنشاء مختبر المعرفة
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              أنشئ مختبر تمارين وأسئلة تفاعلي لطلابك
            </p>
            
            {/* Course Link Badge */}
            {courseId && courseName && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4"
              >
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 text-sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  مرتبط بالدورة: {courseName}
                </Badge>
              </motion.div>
            )}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-orange-100 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10">
                <CardTitle className="text-2xl text-orange-900">معلومات المختبر</CardTitle>
                <CardDescription>
                  املأ البيانات التالية لإنشاء مختبر المعرفة
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Standalone Switch */}
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                      <div>
                        <Label className="text-base font-semibold text-gray-900">
                          مختبر مستقل
                        </Label>
                        <p className="text-sm text-gray-600">
                          {formData.is_standalone 
                            ? 'مختبر مستقل بسعر خاص (يحتاج موافقة المشرف)'
                            : 'مرتبط بدورة تعليمية'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.is_standalone}
                      onCheckedChange={handleSwitchChange}
                      disabled={!!courseId} // Disable if coming from course page
                    />
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2">
                      <Tag className="w-4 h-4 text-orange-600" />
                      عنوان المختبر *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="مثال: مختبر الرياضيات - الصف الثالث الثانوي"
                      className="text-lg"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-orange-600" />
                      وصف المختبر *
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="وصف تفصيلي للمختبر ومحتواه..."
                      rows={4}
                      required
                    />
                  </div>

                  {/* Objective */}
                  <div className="space-y-2">
                    <Label htmlFor="objective" className="text-base font-semibold flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-600" />
                      الأهداف التعليمية *
                    </Label>
                    <Textarea
                      id="objective"
                      name="objective"
                      value={formData.objective}
                      onChange={handleInputChange}
                      placeholder="ما الذي سيتعلمه الطلاب من هذا المختبر؟"
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
                      placeholder="مثال: الجبر، الهندسة، التفاضل، المعادلات (افصل بفواصل)"
                    />
                    <p className="text-xs text-gray-500">
                      أدخل المواضيع مفصولة بفواصل (،) - سيتم تحويلها تلقائياً
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
                        {formData.thumbnailPreview ? (
                          <div className="relative">
                            <img 
                              src={formData.thumbnailPreview} 
                              alt="Thumbnail" 
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                thumbnail: null,
                                thumbnailPreview: '' 
                              }))}
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
                        {formData.coverImagePreview ? (
                          <div className="relative">
                            <img 
                              src={formData.coverImagePreview} 
                              alt="Cover" 
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                cover_image: null,
                                coverImagePreview: '' 
                              }))}
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
                      <Label htmlFor="country" className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-orange-600" />
                        الدولة
                      </Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="مثال: مصر"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-orange-600" />
                        المادة
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="مثال: رياضيات"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="academic_year" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        السنة الدراسية
                      </Label>
                      <Input
                        id="academic_year"
                        name="academic_year"
                        value={formData.academic_year}
                        onChange={handleInputChange}
                        placeholder="مثال: 2024/2025"
                      />
                    </div>
                  </div>

                  {/* Price (only for standalone) */}
                  {formData.is_standalone && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="price" className="text-base font-semibold flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-orange-600" />
                        السعر (بالجنيه المصري) *
                      </Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="100.00"
                        required={formData.is_standalone}
                      />
                      <p className="text-sm text-gray-500">
                        سيتم خصم عمولة المنصة تلقائياً
                      </p>
                    </motion.div>
                  )}

                  {/* Info Alert */}
                  <div className={`p-4 rounded-lg border ${
                    formData.is_standalone 
                      ? 'bg-amber-50 border-amber-200' 
                      : formData.course_type === 'live'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {formData.is_standalone ? (
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">
                          {formData.is_standalone 
                            ? '⚠️ يحتاج موافقة المشرف العام'
                            : formData.course_type === 'live'
                              ? '✅ موافقة تلقائية (دورة مباشرة)'
                              : '⚠️ يحتاج موافقة المشرف (دورة مسجلة)'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formData.is_standalone 
                            ? 'سيتم مراجعة المختبر من قبل المشرف العام قبل نشره'
                            : formData.course_type === 'live'
                              ? 'المختبرات المرتبطة بالدورات المباشرة لا تحتاج موافقة'
                              : 'سيتم مراجعة المختبر من قبل المشرف الأكاديمي'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1"
                      disabled={loading}
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || uploadingImage}
                      className="flex-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white shadow-lg"
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          جاري الإنشاء...
                        </>
                      ) : (
                        <>
                          <FlaskConical className="w-5 h-5 mr-2" />
                          إنشاء مختبر المعرفة
                          <ArrowRight className="w-5 h-5 mr-2" />
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

export default KnowledgeLabCreatePage;
