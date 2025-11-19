'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  PlayCircle,
  Shield,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { simpleAuthService } from '@/lib/auth/simpleAuth';

// Academic Supervisor Interface
interface AcademicSupervisor {
  name: string;
  title: string;
  phone: string;
  email: string;
  whatsapp: string;
  specialization?: string;
}

interface RecordedCourse {
  id: string;
  title: string;
  description: string;
  price: string;
  final_price?: string | number;
  thumbnail_url?: string;
  total_lessons?: number;
  approval_status: string;
}

interface Application {
  id: string;
  course: string;
  student: string;
  student_name: string;
  receipt_url?: string;
  student_notes?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  status_display: string;
  rejection_reason?: string;
  created_at: string;
}

interface Enrollment {
  id: string;
  course: string;
  student: string;
  status: 'active' | 'suspended' | 'completed';
  enrolled_at: string;
}

export default function RecordedCourseEnrollmentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params['id'] as string;

  const [course, setCourse] = useState<RecordedCourse | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [supervisor, setSupervisor] = useState<AcademicSupervisor | null>(null);
  const [loading, setLoading] = useState(true);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [studentNotes, setStudentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch course
      const courseResponse = await fetch(`${API_BASE_URL}/recorded-courses/courses/${courseId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        setCourse(courseData);
      } else {
        throw new Error('فشل في تحميل بيانات الدورة');
      }

      // Fetch Academic Supervisor Info
      try {
        const supervisorResponse = await fetch(`${API_BASE_URL}/recorded-courses/courses/${courseId}/academic-supervisor/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        if (supervisorResponse.ok) {
          const supervisorData = await supervisorResponse.json();
          setSupervisor({
            name: supervisorData.name || 'المشرف الأكاديمي',
            title: supervisorData.title || 'مشرف أكاديمي',
            phone: supervisorData.phone || '',
            email: supervisorData.email || '',
            whatsapp: supervisorData.whatsapp || supervisorData.phone || '',
            specialization: supervisorData.specialization
          });
        } else {
          // Fallback to localStorage if API fails
          const storedSupervisor = localStorage.getItem('academic_supervisor_info');
          if (storedSupervisor) {
            const parsedSupervisor = JSON.parse(storedSupervisor);
            setSupervisor({
              name: parsedSupervisor.name || 'المشرف الأكاديمي',
              title: parsedSupervisor.title || 'مشرف أكاديمي',
              phone: parsedSupervisor.phone || '',
              email: parsedSupervisor.email || '',
              whatsapp: parsedSupervisor.whatsapp || parsedSupervisor.phone || '',
              specialization: parsedSupervisor.specialization
            });
          }
        }
      } catch (supervisorError) {
        console.log('Could not fetch supervisor, using fallback...');
        // Fallback supervisor data
        const storedSupervisor = localStorage.getItem('academic_supervisor_info');
        if (storedSupervisor) {
          const parsedSupervisor = JSON.parse(storedSupervisor);
          setSupervisor({
            name: parsedSupervisor.name || 'المشرف الأكاديمي',
            title: parsedSupervisor.title || 'مشرف أكاديمي',
            phone: parsedSupervisor.phone || '',
            email: parsedSupervisor.email || '',
            whatsapp: parsedSupervisor.whatsapp || parsedSupervisor.phone || '',
            specialization: parsedSupervisor.specialization
          });
        }
      }

      // Check for existing application
      const currentUser = simpleAuthService.getUser();
      if (currentUser) {
        const applicationsResponse = await fetch(`${API_BASE_URL}/recorded-courses/applications/?course=${courseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          const userApplications = applicationsData.results?.filter((app: Application) => 
            String(app.student) === String(currentUser.id) || app.student_name === currentUser.full_name
          );
          
          if (userApplications && userApplications.length > 0) {
            setApplication(userApplications[0]);
          }
        }

        // Check for enrollment
        const enrollmentsResponse = await fetch(`${API_BASE_URL}/recorded-courses/enrollments/?course=${courseId}&student=${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json();
          if (enrollmentsData.results && enrollmentsData.results.length > 0) {
            setEnrollment(enrollmentsData.results[0]);
          }
        }
      }

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReceipt = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى رفع صورة فقط (PNG, JPG, JPEG)');
      return;
    }

    setUploadingReceipt(true);
    
    try {
      // For testing: Use a placeholder URL with timestamp
      // TODO: In production, upload to proper storage (Cloudinary, S3, etc.)
      const receiptUrl = `https://via.placeholder.com/600x800.png?text=Receipt+${Date.now()}`;
      
      console.log('✅ Using placeholder receipt URL:', receiptUrl);
      setReceiptUrl(receiptUrl);
      
      toast.success('تم رفع الإيصال بنجاح!');
    } catch (error) {
      console.error('❌ Error uploading receipt:', error);
      toast.error('فشل في رفع الإيصال. يرجى المحاولة مرة أخرى');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!receiptUrl) {
      toast.error('يرجى رفع إيصال الدفع أولاً');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('📤 Submitting application:', {
        course: courseId,
        receipt_url: receiptUrl,
        student_notes: studentNotes || ''
      });

      const response = await fetch(`${API_BASE_URL}/recorded-courses/applications/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          course: courseId,
          receipt_url: receiptUrl,
          student_notes: studentNotes || ''
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Application submitted successfully:', data);
        setApplication(data);
        toast.success('✅ تم إرسال طلب الانضمام بنجاح!', {
          description: 'سيقوم المشرف الأكاديمي بمراجعة طلبك'
        });
        
        // Clear form fields
        setReceiptUrl('');
        setStudentNotes('');
        
        // Refresh data
        fetchData();
      } else {
        const errorData = await response.json();
        console.error('❌ API Error Response:', errorData);
        
        // Extract more detailed error message
        let errorMessage = 'فشل في إرسال الطلب';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.course) {
          errorMessage = `خطأ في الدورة: ${errorData.course[0]}`;
        } else if (errorData.receipt_url) {
          errorMessage = `خطأ في الإيصال: ${errorData.receipt_url[0]}`;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusInfo = () => {
    // If already enrolled
    if (enrollment) {
      if (enrollment.status === 'active') {
        return {
          icon: CheckCircle,
          color: 'green',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-300 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-300',
          title: 'مسجل في الدورة! 🎉',
          description: 'يمكنك الآن الوصول إلى جميع دروس الدورة'
        };
      } else if (enrollment.status === 'suspended') {
        return {
          icon: AlertCircle,
          color: 'red',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-300 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-300',
          title: 'الاشتراك معلق ⚠️',
          description: 'تم إيقاف وصولك للدورة مؤقتاً'
        };
      }
    }

    // If application exists
    if (application) {
      if (application.status === 'pending_review') {
        return {
          icon: Clock,
          color: 'orange',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-300 dark:border-orange-800',
          textColor: 'text-orange-800 dark:text-orange-300',
          title: 'قيد المراجعة ⏳',
          description: 'جاري مراجعة طلبك من قبل المشرف الأكاديمي'
        };
      } else if (application.status === 'approved') {
        return {
          icon: CheckCircle,
          color: 'green',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-300 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-300',
          title: 'تمت الموافقة! ✅',
          description: 'جاري تفعيل اشتراكك في الدورة'
        };
      } else if (application.status === 'rejected') {
        return {
          icon: AlertCircle,
          color: 'red',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-300 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-300',
          title: 'تم رفض الطلب ❌',
          description: application.rejection_reason || 'يرجى التواصل مع المشرف الأكاديمي'
        };
      }
    }

    // No application yet
    return {
      icon: AlertCircle,
      color: 'gray',
      bgColor: 'bg-gray-50 dark:bg-slate-800',
      borderColor: 'border-gray-200 dark:border-slate-700',
      textColor: 'text-gray-800 dark:text-gray-300',
      title: 'جاهز للتسجيل؟',
      description: 'ابدأ بتقديم طلب الانضمام للدورة'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 dark:border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">الدورة غير موجودة</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">لم نتمكن من العثور على هذه الدورة</p>
          <Button onClick={() => router.back()} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
            العودة
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => router.back()}
            className="mb-4 gap-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-700 dark:text-gray-300"
            variant="outline"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للدورة
          </Button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-amber-900/50">
              <PlayCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                التسجيل في الدورة المسجلة
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">{course.title}</p>
              <div className="flex items-center gap-3 mt-2">
                {course.total_lessons && (
                  <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                    {course.total_lessons} درس
                  </Badge>
                )}
                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                  {course.final_price || course.price} ر.س
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`p-6 mb-6 ${statusInfo.bgColor} border-2 ${statusInfo.borderColor}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${statusInfo.bgColor} rounded-xl flex items-center justify-center`}>
                <statusInfo.icon className={`w-6 h-6 ${statusInfo.textColor}`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${statusInfo.textColor} mb-2`}>
                  {statusInfo.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {statusInfo.description}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Supervisor Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-800 dark:to-amber-950/20 border-2 border-amber-200 dark:border-amber-800 h-full shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-6 pb-4 border-b border-amber-200 dark:border-amber-800">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 dark:bg-amber-600 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {supervisor?.name || 'جاري التحميل...'}
                  </h2>
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse"></span>
                    {supervisor?.title || 'المشرف الأكاديمي'}
                  </p>
                  {supervisor?.specialization && (
                    <Badge className="mt-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                      {supervisor.specialization}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Phone */}
                {supervisor?.phone && (
                  <motion.a
                    href={`tel:${supervisor.phone}`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/20 dark:hover:to-orange-950/20 transition-all border border-gray-100 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 shadow-sm hover:shadow group"
                  >
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                      <Phone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">الهاتف</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        {supervisor.phone}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors transform rotate-180" />
                  </motion.a>
                )}

                {/* Email */}
                {supervisor?.email && (
                  <motion.a
                    href={`mailto:${supervisor.email}`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/20 dark:hover:to-orange-950/20 transition-all border border-gray-100 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 shadow-sm hover:shadow group"
                  >
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                      <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">البريد الإلكتروني</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">
                        {supervisor.email}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors transform rotate-180" />
                  </motion.a>
                )}

                {/* WhatsApp */}
                {supervisor?.whatsapp && (
                  <motion.a
                    href={`https://wa.me/${supervisor.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg group"
                  >
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-green-100 mb-0.5">تواصل عبر واتساب</p>
                      <p className="text-sm font-bold text-white">
                        {supervisor.whatsapp}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white transform rotate-180" />
                  </motion.a>
                )}

                {/* Working Hours */}
                <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">ساعات العمل</p>
                      <p className="text-sm text-amber-700 dark:text-amber-400">متاح للرد على استفساراتكم</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Instructions Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-800 dark:to-amber-950/20 border-2 border-amber-200 dark:border-amber-800 h-full shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-200 dark:border-amber-800">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">خطوات التسجيل</h2>
              </div>

              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-bold text-base">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                      تواصل مع المشرف
                      <MessageCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      اتصل بالمشرف الأكاديمي عبر الواتساب أو الهاتف للاستفسار عن التفاصيل
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-bold text-base">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                      رفع إيصال الدفع
                      <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      بعد الدفع، قم برفع صورة الإيصال من خلال النموذج أدناه
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-orange-100 dark:border-orange-900/30 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-bold text-base">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                      مراجعة المشرف
                      <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      سيقوم المشرف الأكاديمي بمراجعة الإيصال والموافقة عليه
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border-2 border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-bold text-base">4</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-1.5 flex items-center gap-2">
                      ابدأ التعلم
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                      بعد الموافقة، ستحصل على وصول فوري لجميع دروس الدورة!
                    </p>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Current Application Status (if exists) */}
        {application && application.status !== 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <Card className={`p-6 border-2 ${
              application.status === 'pending_review' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-800' :
              application.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800' :
              'bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  application.status === 'pending_review' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  application.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-gray-100 dark:bg-slate-700'
                }`}>
                  {application.status === 'pending_review' ? (
                    <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  ) : application.status === 'rejected' ? (
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  ) : (
                    <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 ${
                    application.status === 'pending_review' ? 'text-orange-900 dark:text-orange-300' :
                    application.status === 'rejected' ? 'text-red-900 dark:text-red-300' :
                    'text-gray-900 dark:text-white'
                  }`}>
                    {application.status === 'pending_review' ? 'طلبك السابق قيد المراجعة ⏳' :
                     application.status === 'rejected' ? 'تم رفض طلبك السابق ❌' :
                     'آخر طلب مقدم'}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    application.status === 'pending_review' ? 'text-orange-700 dark:text-orange-400' :
                    application.status === 'rejected' ? 'text-red-700 dark:text-red-400' :
                    'text-gray-700 dark:text-gray-300'
                  }`}>
                    {application.status === 'pending_review' 
                      ? 'جاري مراجعة طلبك من قبل المشرف الأكاديمي.'
                      : application.rejection_reason 
                        ? `سبب الرفض: ${application.rejection_reason}`
                        : 'يرجى التواصل مع المشرف الأكاديمي للمزيد من المعلومات'}
                  </p>
                  {application.student_notes && (
                    <div className="mt-2 p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ملاحظاتك السابقة:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{application.student_notes}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    تاريخ التقديم: {new Date(application.created_at).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Application Form */}
        {!enrollment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-8 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 dark:from-slate-800 dark:via-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800 shadow-lg">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {!application ? 'جاهز للتسجيل؟' : 
                   application.status === 'pending_review' ? 'طلبك قيد المراجعة' :
                   application.status === 'approved' ? 'تم قبول طلبك! 🎉' :
                   application.status === 'rejected' ? 'تم رفض طلبك ❌' :
                   'تقديم طلب جديد'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {!application ? 'قم برفع إيصال الدفع لتقديم طلب الانضمام' : 
                   application.status === 'pending_review' ? 'جاري مراجعة طلبك من قبل المشرف الأكاديمي' :
                   application.status === 'approved' ? 'جاري تفعيل اشتراكك في الدورة' :
                   application.status === 'rejected' ? 'تم رفض طلبك السابق. يرجى التواصل مع المشرف الأكاديمي للمزيد من المعلومات' :
                   'تقديم طلب جديد'}
                </p>
              </div>
              
              {(!application || application.status === 'rejected') && (
                <div className="space-y-6">
                  {/* Receipt Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <Upload className="w-4 h-4 inline ml-1" />
                      إيصال الدفع <span className="text-red-600 dark:text-red-400">*</span>
                    </label>
                    
                    <div className="border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-lg p-6 text-center hover:border-amber-500 dark:hover:border-amber-600 transition-colors cursor-pointer bg-amber-50/50 dark:bg-amber-950/20">
                      <input
                        type="file"
                        id="receipt-upload"
                        accept="image/*"
                        onChange={handleUploadReceipt}
                        className="hidden"
                        disabled={uploadingReceipt || application?.status === 'pending_review'}
                      />
                      <label htmlFor="receipt-upload" className="cursor-pointer">
                        {uploadingReceipt ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-amber-500 dark:border-amber-400 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-600 dark:text-gray-300">جاري الرفع...</p>
                          </div>
                        ) : receiptUrl ? (
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">تم رفع الإيصال بنجاح</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">اضغط لتغيير الصورة</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">اضغط لرفع صورة الإيصال</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG حتى 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Student Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <MessageCircle className="w-4 h-4 inline ml-1" />
                      ملاحظات إضافية (اختياري)
                    </label>
                    <textarea
                      value={studentNotes}
                      onChange={(e) => setStudentNotes(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      rows={4}
                      placeholder="أي معلومات إضافية تريد إضافتها..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div>
                    <Button
                      onClick={handleSubmitApplication}
                      disabled={!receiptUrl || isSubmitting}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 dark:from-amber-600 dark:to-orange-600 dark:hover:from-amber-700 dark:hover:to-orange-700 text-white py-6 text-lg rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-6 h-6 ml-2" />
                          {application ? 'تقديم طلب جديد' : 'تقديم طلب الانضمام'}
                        </>
                      )}
                    </Button>
                  </div>

                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
