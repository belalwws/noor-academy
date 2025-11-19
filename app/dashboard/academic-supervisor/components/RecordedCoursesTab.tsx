'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import {
  PlayCircle,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  RefreshCw
} from 'lucide-react';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

interface RecordedCourseApplication {
  id: string;
  course: string;
  course_title: string;
  student: string;
  student_name: string;
  student_email: string;
  receipt_url: string;
  student_notes?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  status_display: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

interface RecordedCourseEnrollment {
  id: string;
  student_name: string;
  course_title: string;
  status: 'active' | 'suspended' | 'completed';
  enrolled_at: string;
}

interface ApplicationModalData {
  application: RecordedCourseApplication;
  action: 'approved' | 'rejected' | 'view';
}

export default function RecordedCoursesTab() {
  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'enrollments'>('applications');
  const [applications, setApplications] = useState<RecordedCourseApplication[]>([]);
  const [enrollments, setEnrollments] = useState<RecordedCourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationModalData | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      console.log('🔍 Fetching recorded courses data...', { activeSubTab, hasToken: !!token });

      if (activeSubTab === 'applications') {
        // Fetch applications
        const response = await fetch(`${API_BASE_URL}/recorded-courses/applications/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📥 Applications response:', { status: response.status, ok: response.ok });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Applications data:', data);
          
          // Handle paginated response
          const applicationsArray = data.results || [];
          console.log('📋 Applications array:', applicationsArray.length, 'items');
          setApplications(applicationsArray);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Applications error:', { status: response.status, errorData });
          
          if (response.status === 401) {
            toast.error('غير مصرح لك بالوصول - تأكد من صلاحياتك كمشرف أكاديمي');
          } else {
            toast.error('حدث خطأ في تحميل طلبات التسجيل');
          }
        }
      } else {
        // Fetch enrollments
        const response = await fetch(`${API_BASE_URL}/recorded-courses/enrollments/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📥 Enrollments response:', { status: response.status, ok: response.ok });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Enrollments data:', data);
          
          // Handle paginated response
          const enrollmentsArray = data.results || [];
          console.log('📋 Enrollments array:', enrollmentsArray.length, 'items');
          setEnrollments(enrollmentsArray);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Enrollments error:', { status: response.status, errorData });
          
          if (response.status === 401) {
            toast.error('غير مصرح لك بالوصول - تأكد من صلاحياتك كمشرف أكاديمي');
          } else {
            toast.error('حدث خطأ في تحميل المسجلين');
          }
        }
      }
    } catch (error) {
      console.error('💥 Error fetching data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      // Validate rejection reason if rejecting
      if (status === 'rejected' && !rejectionReason.trim()) {
        toast.error('يجب إدخال سبب الرفض');
        return;
      }

      setIsSubmitting(true);
      const token = localStorage.getItem('access_token');

      // Prepare request body
      const requestBody: any = { status };
      
      // Only add rejection_reason if status is rejected
      if (status === 'rejected') {
        requestBody.rejection_reason = rejectionReason.trim();
      }

      console.log('🔍 Review application request:', {
        applicationId,
        status,
        rejectionReason: rejectionReason || '(empty)',
        requestBody
      });

      const response = await fetch(
        `${API_BASE_URL}/recorded-courses/applications/${applicationId}/review_application/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      console.log('📥 Review response:', { status: response.status, ok: response.ok });

      if (response.ok) {
        toast.success(status === 'approved' ? '✅ تم قبول الطلب بنجاح!' : '❌ تم رفض الطلب');
        setSelectedApp(null);
        setRejectionReason('');
        fetchData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Review error:', errorData);
        
        // Handle validation errors
        if (errorData.rejection_reason) {
          toast.error(`خطأ: ${errorData.rejection_reason}`);
        } else {
          toast.error(errorData.detail || errorData.error || 'فشل في معالجة الطلب');
        }
      }
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في معالجة الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">قيد المراجعة</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">معتمد</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">مرفوض</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">نشط</Badge>;
      case 'suspended':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">معلق</Badge>;
      case 'completed':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">مكتمل</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8 text-purple-600" />
        <span className="mr-3 text-gray-600">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex gap-2 bg-purple-50 p-2 rounded-lg">
        <Button
          variant={activeSubTab === 'applications' ? 'primary' : 'outline'}
          onClick={() => setActiveSubTab('applications')}
          className={activeSubTab === 'applications' 
            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
            : 'text-gray-700 hover:bg-purple-100'
          }
        >
          <FileText className="w-4 h-4 ml-2" />
          طلبات التسجيل ({applications.length})
        </Button>
        <Button
          variant={activeSubTab === 'enrollments' ? 'primary' : 'outline'}
          onClick={() => setActiveSubTab('enrollments')}
          className={activeSubTab === 'enrollments' 
            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
            : 'text-gray-700 hover:bg-purple-100'
          }
        >
          <Users className="w-4 h-4 ml-2" />
          المسجلين ({enrollments.length})
        </Button>
        <Button
          variant="outline"
          onClick={fetchData}
          className="mr-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Applications Tab */}
      {activeSubTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">لا توجد طلبات تسجيل</p>
            </Card>
          ) : (
            applications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <PlayCircle className="w-5 h-5 text-purple-600" />
                          <h3 className="font-bold text-lg">{app.course_title}</h3>
                          {getStatusBadge(app.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">اسم الطالب</p>
                            <p className="font-semibold">{app.student_name}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">البريد الإلكتروني</p>
                            <p className="font-semibold text-sm">{app.student_email}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">تاريخ التقديم</p>
                            <p className="font-semibold">
                              {new Date(app.created_at).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          {app.student_notes && (
                            <div className="col-span-2">
                              <p className="text-gray-500">ملاحظات الطالب</p>
                              <p className="font-semibold text-sm bg-gray-50 p-2 rounded">
                                {app.student_notes}
                              </p>
                            </div>
                          )}
                          {app.rejection_reason && (
                            <div className="col-span-2">
                              <p className="text-gray-500">سبب الرفض</p>
                              <p className="font-semibold text-sm text-red-700 bg-red-50 p-2 rounded">
                                {app.rejection_reason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedApp({ application: app, action: 'view' })}
                        >
                          <Eye className="w-4 h-4 ml-1" />
                          عرض الإيصال
                        </Button>
                        
                        {app.status === 'pending_review' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => setSelectedApp({ application: app, action: 'approved' })}
                            >
                              <CheckCircle className="w-4 h-4 ml-1" />
                              قبول
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => setSelectedApp({ application: app, action: 'rejected' })}
                            >
                              <XCircle className="w-4 h-4 ml-1" />
                              رفض
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Enrollments Tab */}
      {activeSubTab === 'enrollments' && (
        <div className="space-y-4">
          {enrollments.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">لا يوجد طلاب مسجلين</p>
            </Card>
          ) : (
            enrollments.map((enrollment, index) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-indigo-600" />
                          <h3 className="font-bold text-lg">{enrollment.student_name}</h3>
                          {getStatusBadge(enrollment.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">الدورة</p>
                            <p className="font-semibold">{enrollment.course_title}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">تاريخ التسجيل</p>
                            <p className="font-semibold">
                              {new Date(enrollment.enrolled_at).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Modal for Application Review */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-amber-200 dark:border-amber-800"
          >
            <div className="p-6 border-b border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <div className="flex items-center gap-3">
                {selectedApp.action === 'approved' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                )}
                {selectedApp.action === 'rejected' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                )}
                {selectedApp.action === 'view' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedApp.action === 'view' ? 'عرض الإيصال' :
                   selectedApp.action === 'approved' ? 'قبول الطلب' :
                   'رفض الطلب'}
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Receipt Image */}
              {selectedApp.application.receipt_url && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    إيصال الدفع
                  </p>
                  <img 
                    src={selectedApp.application.receipt_url} 
                    alt="إيصال الدفع"
                    className="w-full rounded-lg border-2 border-amber-200 dark:border-amber-800 shadow-sm"
                  />
                </div>
              )}

              {/* Application Details */}
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">الطالب</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedApp.application.student_name}</p>
                </div>
                <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">الدورة</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedApp.application.course_title}</p>
                </div>
                {selectedApp.application.student_notes && (
                  <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">ملاحظات الطالب</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {selectedApp.application.student_notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Rejection Reason Input */}
              {selectedApp.action === 'rejected' && (
                <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <label className="block text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                    سبب الرفض <span className="text-red-600 dark:text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-red-200 dark:border-red-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    rows={4}
                    placeholder="اذكر سبب رفض الطلب..."
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedApp(null);
                  setRejectionReason('');
                }}
                disabled={isSubmitting}
                className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                إلغاء
              </Button>
              
              {selectedApp.action !== 'view' && (
                <Button
                  className={selectedApp.action === 'approved' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg' 
                    : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg'
                  }
                  onClick={() => handleReviewApplication(
                    selectedApp.application.id,
                    selectedApp.action as 'approved' | 'rejected'
                  )}
                  disabled={isSubmitting || (selectedApp.action === 'rejected' && !rejectionReason.trim())}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="w-4 h-4 ml-2" />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      {selectedApp.action === 'approved' ? (
                        <>
                          <CheckCircle className="w-4 h-4 ml-2" />
                          قبول الطلب
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 ml-2" />
                          رفض الطلب
                        </>
                      )}
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
