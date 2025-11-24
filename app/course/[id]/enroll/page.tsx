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
  User,
  BookOpen,
  Shield,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import liveEducationApi from '@/lib/api/live-education';
import type { LiveCourse, Enrollment } from '@/lib/types/live-education';
import PaymentVerificationModal from '@/components/student/PaymentVerificationModal';
import PaymentUploadModal from '@/components/student/PaymentUploadModal';
import type { CourseApplication } from '@/lib/types/live-education';
import { simpleAuthService } from '@/lib/auth/simpleAuth';

// نوع بيانات المشرف الأكاديمي
interface AcademicSupervisorInfo {
  name: string;
  title: string;
  phone: string;
  email: string;
  whatsapp: string;
  specialization?: string;
}

export default function CourseEnrollmentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<LiveCourse | null>(null);
  // Payment info is now tracked through application.receipt_url
  const [application, setApplication] = useState<CourseApplication | null>(null);
  const [supervisor, setSupervisor] = useState<AcademicSupervisorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [showPaymentUploadModal, setShowPaymentUploadModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // First, try to determine if this is a recorded course
      try {
        const recordedCourseResponse = await fetch(`${API_BASE_URL}/recorded-courses/courses/${courseId}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        if (recordedCourseResponse.ok) {
          // This is a recorded course, redirect to recorded-enroll page
          console.log('🎥 This is a recorded course, redirecting...');
          setRedirecting(true);
          router.replace(`/course/${courseId}/recorded-enroll`);
          return; // Stop execution
        }
      } catch (recordedError) {
        console.log('Not a recorded course, trying live course...');
      }
      
      // Fetch live course
      try {
        const courseData = await liveEducationApi.courses.get(courseId);
        setCourse(courseData);

        // Fetch real academic supervisor data
        try {
          const supervisorData = await liveEducationApi.courses.getAcademicSupervisor(courseId);
          setSupervisor({
            name: supervisorData.name,
            title: 'المشرف الأكاديمي',
            email: supervisorData.email,
            phone: supervisorData.phone,
            whatsapp: supervisorData.phone.replace(/\s/g, ''), // Remove spaces for WhatsApp
            specialization: supervisorData.specialization
          });
        } catch (error) {
          console.error('Failed to fetch academic supervisor:', error);
          // Fallback to default if API fails
          setSupervisor({
            name: 'المشرف الأكاديمي',
            title: 'المشرف الأكاديمي',
            email: 'support@lisan-alhekma.com',
            phone: 'غير متاح',
            whatsapp: '',
          });
      }

      // Check for existing application (for current student only)
      // Note: Application contains receipt_url, so we use it to track payment status
      try {
        const currentUser = simpleAuthService.getUser();
        
        const applicationsData = await liveEducationApi.applications.list({
          course: courseId
        });
        
        console.log('📦 All applications:', applicationsData.results);
        
        if (applicationsData.results && applicationsData.results.length > 0 && currentUser) {
          // Filter applications to only show current student's applications
          const currentStudentApplications = applicationsData.results.filter(a => 
            a.student === currentUser.id || 
            a.student === currentUser.pk || 
            a.student_name === currentUser.full_name ||
            a.student_name === currentUser.username
          );
          
          console.log('📝 Current student applications:', currentStudentApplications);
          
          if (currentStudentApplications.length > 0) {
            const latestApplication = currentStudentApplications[0];
            setApplication(latestApplication);
            console.log('✅ Application found for current student:', latestApplication);
          } else {
            console.log('📋 No applications found for current student');
          }
        }
      } catch (appError) {
        console.warn('⚠️ Could not fetch applications:', appError);
      }
      } catch (liveError) {
        console.error('❌ Error fetching live course:', liveError);
        toast.error('الدورة غير موجودة');
      }

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!course) return;

    // Check if application already exists
    if (application) {
      toast.info('لديك طلب انضمام موجود بالفعل في هذه الدورة! 📋');
      return;
    }

    try {
      setIsSubmittingApplication(true);
      
      const response = await liveEducationApi.applications.apply({
        course: courseId
      });

      if (response.ok) {
        toast.success('✅ تم إرسال طلب الانضمام بنجاح!', {
          description: 'سيقوم المعلم بمراجعة طلبك وإضافتك للمجموعة المناسبة'
        });
        fetchData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || errorData.error || 'حدث خطأ في إرسال الطلب');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const getStatusInfo = () => {
    // Check application status (application contains receipt_url)
    if (application) {
      if (application.status === 'pending') {
        return {
          icon: Clock,
          color: 'orange',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-300',
          textColor: 'text-orange-800',
          title: 'قيد المراجعة ⏳',
          description: 'جاري مراجعة إيصال الدفع وطلب الانضمام من قبل المشرف الأكاديمي والمعلم'
            };
      } else if (application.status === 'approved') {
            return {
              icon: CheckCircle,
              color: 'blue',
              bgColor: 'bg-blue-50',
              borderColor: 'border-blue-300',
              textColor: 'text-blue-800',
              title: 'تم قبول طلبك! 🎉',
          description: 'تمت الموافقة على إيصال الدفع وطلب الانضمام. سيتم إضافتك للمجموعة المناسبة قريباً'
            };
          } else if (application.status === 'rejected') {
            return {
              icon: AlertCircle,
              color: 'red',
              bgColor: 'bg-red-50',
              borderColor: 'border-red-300',
              textColor: 'text-red-800',
              title: 'تم رفض الطلب ❌',
          description: application.rejection_reason || 'يرجى التواصل مع المشرف الأكاديمي أو المعلم لمعرفة السبب'
            };
          }
    }

    // No application yet - need to upload receipt
    return {
      icon: AlertCircle,
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-800',
      title: 'لم يتم رفع إيصال الدفع بعد',
      description: 'يرجى رفع إيصال الدفع بعد التواصل مع المشرف الأكاديمي'
    };
  };

  const canSubmitApplication = false; // Applications are submitted with receipt upload, not separately

  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-yellow-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 dark:border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-300 text-lg font-medium">
            {redirecting ? 'جاري التوجيه...' : 'جاري التحميل...'}
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-yellow-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">الدورة غير موجودة</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6">لم نتمكن من العثور على هذه الدورة</p>
          <Button onClick={() => router.back()} className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 dark:from-orange-600 dark:to-amber-700">
            العودة
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-yellow-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="mb-4 gap-2 hover:bg-orange-50 dark:hover:bg-slate-800"
            >
              <ArrowRight className="w-4 h-4" />
              العودة للدورة
            </Button>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-orange-900/50">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                  التسجيل في الدورة
                </h1>
                <p className="text-lg text-gray-600 dark:text-slate-400">{course?.title}</p>
              </div>
            </div>
          </motion.div>

          {/* Status Card */}
          {statusInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className={`p-6 mb-6 ${statusInfo.bgColor} dark:bg-slate-800/50 border-2 ${statusInfo.borderColor} dark:border-slate-600`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${statusInfo.bgColor} dark:bg-slate-700 rounded-xl flex items-center justify-center`}>
                    <statusInfo.icon className={`w-6 h-6 ${statusInfo.textColor} dark:text-slate-300`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold ${statusInfo.textColor} dark:text-slate-200 mb-2`}>
                      {statusInfo.title}
                    </h3>
                    <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                      {statusInfo.description}
                    </p>
                    
                    {application?.preferred_type && (
                      <div className="mt-3">
                        <Badge className="bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200">
                          نوع التعليم: {application.preferred_type === 'individual' ? 'فردي 👤' : 'جماعي 👥'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Supervisor Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-slate-800/50 border-2 border-orange-200 dark:border-slate-700 h-full shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-6 pb-4 border-b border-orange-100 dark:border-slate-700">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 dark:bg-orange-600 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">
                      {supervisor?.name || 'جاري التحميل...'}
                    </h2>
                    <p className="text-sm text-orange-700 dark:text-orange-400 font-medium flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full animate-pulse"></span>
                      {supervisor?.title || 'المشرف الأكاديمي'}
                    </p>
                    {supervisor?.specialization && (
                      <Badge className="mt-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                        {supervisor.specialization}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Phone */}
                  <motion.a
                    href={`tel:${supervisor?.phone}`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-slate-700 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all border border-gray-100 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-600 shadow-sm hover:shadow group"
                  >
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                      <Phone className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">الهاتف</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-200 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">
                        {supervisor?.phone || 'جاري التحميل...'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors transform rotate-180" />
                  </motion.a>

                  {/* Email */}
                  <motion.a
                    href={`mailto:${supervisor?.email}`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-slate-700 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all border border-gray-100 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-600 shadow-sm hover:shadow group"
                  >
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                      <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">البريد الإلكتروني</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-200 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors truncate">
                        {supervisor?.email || 'جاري التحميل...'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors transform rotate-180" />
                  </motion.a>

                  {/* WhatsApp */}
                  <motion.a
                    href={`https://wa.me/${supervisor?.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg group"
                  >
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-100 mb-0.5">تواصل عبر واتساب</p>
                      <p className="text-sm font-bold text-white">
                        {supervisor?.whatsapp || 'جاري التحميل...'}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white transform rotate-180" />
                  </motion.a>

                  {/* Working Hours */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">ساعات العمل</p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                        </p>
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
              <Card className="p-6 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-slate-800/50 border-2 border-orange-200 dark:border-slate-700 h-full shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-orange-100 dark:border-slate-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">خطوات التسجيل</h2>
                </div>

                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-4 p-4 bg-white dark:bg-slate-700 rounded-xl border border-orange-100 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-600 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-base">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-1.5 flex items-center gap-2">
                        تواصل مع المشرف
                        <MessageCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                        اتصل بالمشرف الأكاديمي عبر الواتساب أو الهاتف للاستفسار عن التفاصيل
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-4 p-4 bg-white dark:bg-slate-700 rounded-xl border border-orange-100 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-600 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-base">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-1.5 flex items-center gap-2">
                        رفع إيصال الدفع
                        <Upload className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                        بعد الدفع، قم برفع صورة الإيصال من خلال الزر أدناه
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-4 p-4 bg-white dark:bg-slate-700 rounded-xl border border-amber-100 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-600 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 dark:from-amber-600 dark:to-yellow-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-base">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-1.5 flex items-center gap-2">
                        مراجعة المشرف
                        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                        سيقوم المشرف الأكاديمي بمراجعة إيصال الدفع والموافقة عليه
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-4 p-4 bg-white dark:bg-slate-700 rounded-xl border border-blue-100 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-base">4</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-1.5 flex items-center gap-2">
                        طلب انضمام للمعلم
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                        بعد موافقة المشرف، أرسل طلب انضمام للمعلم
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border-2 border-orange-300 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-600 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-base">5</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-orange-900 dark:text-orange-300 mb-1.5 flex items-center gap-2">
                        ابدأ التعلم
                        <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </h3>
                      <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed font-medium">
                        سيقوم المعلم بإضافتك للمجموعة المناسبة وتبدأ رحلتك التعليمية!
                      </p>
                    </div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-8 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30 dark:from-slate-800 dark:via-slate-800/50 dark:to-slate-800/30 border-2 border-orange-200 dark:border-slate-700 shadow-lg">
              <div className="text-center space-y-5">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                    {!application ? 'جاهز للتسجيل؟' : 
                     application.status === 'pending' ? 'تم إرسال الإيصال بنجاح! ✅' :
                     application.status === 'approved' ? 'تم قبول طلبك! 🎉' :
                     'تم إرسال الإيصال بنجاح! ✅'}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-300">
                    {!application ? 'ابدأ بتواصل مع المشرف الأكاديمي ثم ارفع إيصال الدفع' : 
                     application.status === 'pending' ? 'تم إرسال إيصال الدفع بنجاح. بمجرد أن يؤكد المشرف الأكاديمي الدورة، ستفتح لك الدورة تلقائياً' :
                     application.status === 'approved' ? 'تمت الموافقة على طلبك! سيتم إضافتك للمجموعة قريباً' :
                     application.status === 'rejected' ? 'تم رفض الطلب. يرجى التواصل مع المشرف الأكاديمي' :
                     'تم إرسال إيصال الدفع بنجاح. بمجرد أن يؤكد المشرف الأكاديمي الدورة، ستفتح لك الدورة تلقائياً'}
                  </p>
                </div>
                
                {!application ? (
                  <div>
                    <Button
                      onClick={() => setShowPaymentUploadModal(true)}
                      className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-10 py-7 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-colors font-bold"
                      style={{ transform: 'none' }}
                    >
                      <Upload className="w-6 h-6 ml-2" />
                      رفع إيصال الدفع
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-slate-400 text-center mt-2">
                      💡 تواصل مع المشرف الأكاديمي أولاً لإتمام الدفع
                    </p>
                  </div>
                ) : application.status === 'pending' ? (
                  <motion.div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                    <p className="text-sm text-orange-800 dark:text-orange-300 font-medium flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 animate-pulse" />
                      جاري مراجعة إيصال الدفع وطلب الانضمام من قبل المشرف الأكاديمي...
                    </p>
                  </motion.div>
                ) : application.status === 'rejected' ? (
                  <motion.div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-800 dark:text-red-300 font-medium flex items-center justify-center gap-2 mb-3">
                      <AlertCircle className="w-4 h-4" />
                      {application.rejection_reason || 'تم رفض الطلب. يرجى التواصل مع المشرف الأكاديمي'}
                    </p>
                    <Button
                      onClick={() => setShowPaymentUploadModal(true)}
                      className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 dark:from-orange-600 dark:to-amber-700 text-white transition-colors"
                      style={{ transform: 'none' }}
                    >
                      <Upload className="w-4 h-4 ml-2" />
                      رفع إيصال جديد
                    </Button>
                  </motion.div>
                ) : application.status === 'approved' ? (
                  <motion.div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      تم قبول طلبك! سيتم إضافتك للمجموعة المناسبة قريباً
                    </p>
                  </motion.div>
                ) : null}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Payment Upload Modal */}
        <PaymentUploadModal
          isOpen={showPaymentUploadModal}
          onClose={() => setShowPaymentUploadModal(false)}
          courseId={courseId}
          onSuccess={fetchData}
        />
      </div>
  );
}

