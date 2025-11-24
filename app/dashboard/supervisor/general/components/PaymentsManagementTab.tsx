'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  User,
  BookOpen,
  Calendar,
  FileText,
  Eye,
  Filter,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import liveEducationApi from '@/lib/api/live-education';
import type { PaymentStatusInfo } from '@/lib/types/live-education';

const PaymentsManagementTab: React.FC = () => {
  const [payments, setPayments] = useState<PaymentStatusInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_review' | 'paid' | 'rejected'>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentStatusInfo | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [filterStatus]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      // Get current user info
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      
      console.log('👤 Current User Info:', {
        id: user?.id,
        email: user?.email,
        role: user?.role,
        is_staff: user?.is_staff,
        username: user?.username,
        hasTeacherProfile: user?.has_teacher_profile || 'unknown',
        hasSupervisorProfile: user?.has_supervisor_profile || 'unknown'
      });
      
      console.log('🔍 Fetching payments with params:', params);
      console.log('🌐 API URL: /live-education/payments/');
      console.log('🔑 Auth token exists:', !!localStorage.getItem('access_token'));
      
      // Test direct fetch
      const token = localStorage.getItem('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const testUrl = `${apiUrl}/live-education/payments/`;
      
      console.log('🧪 Testing direct API call to:', testUrl);
      
      try {
        const directResponse = await fetch(testUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('🧪 Direct response status:', directResponse.status);
        const directData = await directResponse.json();
        console.log('🧪 Direct response data:', directData);
      } catch (testError) {
        console.error('🧪 Direct test failed:', testError);
      }
      
      const response = await liveEducationApi.payments.list(params);
      
      console.log('📦 Payments API response:', response);
      console.log('📊 Response structure:', {
        hasResults: !!response.results,
        resultsType: typeof response.results,
        resultsLength: response.results?.length || 0,
        count: response.count,
        next: response.next,
        previous: response.previous
      });
      console.log('💰 Number of payments:', response.results?.length || 0);
      
      if (response.results && response.results.length > 0) {
        console.log('📋 First payment sample:', response.results[0]);
        console.log('📋 All payment IDs:', response.results.map((p: any) => p.id));
      } else {
        console.warn('⚠️ No payments returned from API');
        console.log('🔍 Check your user role and permissions');
      }
      
      setPayments(response.results || []);
    } catch (error) {
      console.error('❌ Error fetching payments:', error);
      console.error('❌ Error details:', {
        message: (error as Error).message,
        name: (error as Error).name,
        stack: (error as Error).stack
      });
      toast.error('حدث خطأ في تحميل بيانات الدفع');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async () => {
    if (!selectedPayment) return;

    try {
      setIsReviewing(true);
      
      // Step 1: Approve payment
      const response = await liveEducationApi.payments.review(
        selectedPayment.id,
        { status: 'paid' }
      );

      if (response.ok) {
        // Step 2: Auto-approve corresponding application
        try {
          console.log('📝 Looking for corresponding application...');
          const applicationsResponse = await liveEducationApi.applications.list({
            course: selectedPayment.course,
            status: 'pending'
          });
          
          if (applicationsResponse.ok) {
            const applicationsData = await applicationsResponse.json();
            const applications = applicationsData.results || [];
            
            // Find application for this student
            const studentApplication = applications.find(
              (app: any) => app.student === selectedPayment.student
            );
            
            if (studentApplication) {
              console.log('✅ Found application, auto-approving...');
              const approveResponse = await liveEducationApi.applications.approve(studentApplication.id);
              
              if (approveResponse.ok) {
                console.log('✅ Application approved automatically');
              } else {
                console.warn('⚠️ Failed to approve application');
              }
            } else {
              console.log('ℹ️ No pending application found (might be already approved)');
            }
          }
        } catch (appError) {
          console.warn('⚠️ Error auto-approving application:', appError);
          // Don't fail the whole process
        }
        
        toast.success('تم قبول الدفع بنجاح! ✅', {
          description: 'تم تحديث حالة الطالب تلقائياً'
        });
        setShowReviewModal(false);
        setSelectedPayment(null);
        fetchPayments();
      } else {
        toast.error('حدث خطأ في قبول الدفع');
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      toast.error('يرجى إدخال سبب الرفض');
      return;
    }

    try {
      setIsReviewing(true);
      const response = await liveEducationApi.payments.review(
        selectedPayment.id,
        { 
          status: 'rejected',
          rejection_reason: rejectionReason.trim()
        }
      );

      if (response.ok) {
        toast.success('تم رفض الدفع');
        setShowReviewModal(false);
        setSelectedPayment(null);
        setRejectionReason('');
        fetchPayments();
      } else {
        toast.error('حدث خطأ في رفض الدفع');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsReviewing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_review: { label: 'قيد المراجعة', className: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
      paid: { label: 'مقبول ✓', className: 'bg-blue-100 text-blue-800 border-blue-300', icon: CheckCircle },
      rejected: { label: 'مرفوض ✗', className: 'bg-red-100 text-red-800 border-red-300', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_review;
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} border font-semibold flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredPayments = payments.filter(payment =>
    payment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending_review').length,
    approved: payments.filter(p => p.status === 'paid').length,
    rejected: payments.filter(p => p.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin text-orange-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل بيانات الدفع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-semibold">إجمالي الدفعات</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border-2 border-yellow-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-semibold">قيد المراجعة</p>
              <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-semibold">مقبول</p>
              <p className="text-3xl font-bold text-blue-900">{stats.approved}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border-2 border-red-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-semibold">مرفوض</p>
              <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <Input
              type="text"
              placeholder="البحث بالاسم، البريد الإلكتروني، أو الدورة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              className={filterStatus === 'all' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              الكل
            </Button>
            <Button
              variant={filterStatus === 'pending_review' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('pending_review')}
              className={filterStatus === 'pending_review' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            >
              قيد المراجعة
            </Button>
            <Button
              variant={filterStatus === 'paid' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('paid')}
              className={filterStatus === 'paid' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              مقبول
            </Button>
            <Button
              variant={filterStatus === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('rejected')}
              className={filterStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              مرفوض
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={fetchPayments}
            className="border-orange-200 hover:bg-orange-50"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </div>
      </Card>

      {/* Payments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredPayments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full"
            >
              <Card className="p-12 text-center">
                <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد دفعات</p>
              </Card>
            </motion.div>
          ) : (
            filteredPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow border-2 border-gray-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-800 bg-white dark:bg-slate-900">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                            {payment.student_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.student_email}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>

                    {/* Course Info */}
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-900">الدورة:</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {payment.course_title}
                      </p>
                    </div>

                    {/* Learning Type */}
                    {payment.learning_type && (
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="font-semibold">
                          {payment.learning_type === 'individual' ? '👤 تعليم فردي' : '👥 تعليم جماعي'}
                        </Badge>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(payment.uploaded_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    )}

                    {/* Student Notes */}
                    {payment.student_notes && (
                      <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>ملاحظات الطالب:</strong> {payment.student_notes}
                        </p>
                      </div>
                    )}

                    {/* Payment Status Details */}
                    {payment.status === 'paid' && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          تم التحقق من الدفع بنجاح
                        </p>
                        {payment.reviewed_by_name && (
                          <p className="text-xs text-blue-600 mt-1">
                            تمت المراجعة بواسطة: {payment.reviewed_by_name}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {payment.status === 'pending_review' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowReviewModal(true);
                          }}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          مراجعة الدفع
                        </Button>
                      </div>
                    )}

                    {payment.status === 'rejected' && payment.rejection_reason && (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <p className="text-sm text-red-600">
                          <strong className="flex items-center gap-1 mb-1">
                            <AlertTriangle className="w-4 h-4" />
                            سبب الرفض:
                          </strong>
                          {payment.rejection_reason}
                        </p>
                        {payment.reviewed_by_name && (
                          <p className="text-xs text-red-500 mt-2">
                            تمت المراجعة بواسطة: {payment.reviewed_by_name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Review Payment Modal */}
      <Dialog open={showReviewModal} onOpenChange={(open) => {
        if (!open) {
          setShowReviewModal(false);
          setSelectedPayment(null);
          setRejectionReason('');
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-900 !bg-white dark:!bg-slate-900 backdrop-blur-none">
          <DialogHeader className="pb-4 border-b border-gray-200 dark:border-slate-700 !bg-white dark:!bg-slate-900 bg-white dark:bg-slate-900">
            <DialogTitle className="text-2xl font-bold text-orange-900 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              مراجعة الدفع
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
              راجع تفاصيل الدفع وإيصال التحويل قبل الموافقة أو الرفض
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6 py-4 !bg-white dark:!bg-slate-900 bg-white dark:bg-slate-900">
              {/* Student Info */}
              <Card className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-orange-200">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-orange-900">معلومات الطالب</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400 block">الاسم الكامل:</span>
                      <p className="font-semibold text-base text-gray-900 dark:text-gray-100">{selectedPayment.student_name}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400 block">البريد الإلكتروني:</span>
                      <p className="font-semibold text-base text-gray-900 dark:text-gray-100 break-all">{selectedPayment.student_email}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Course Info */}
              <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-blue-200">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-blue-900">معلومات الدورة</span>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-sm text-gray-600 block">اسم الدورة:</span>
                      <p className="font-semibold text-base text-gray-900">{selectedPayment.course_title}</p>
                    </div>
                    {selectedPayment.learning_type && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-semibold text-sm">
                          {selectedPayment.learning_type === 'individual' ? '👤 تعليم فردي' : '👥 تعليم جماعي'}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>تاريخ الرفع: {new Date(selectedPayment.uploaded_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    )}
                    {selectedPayment.student_notes && (
                      <div className="bg-white/60 p-3 rounded-lg border border-blue-100">
                        <span className="text-sm text-gray-600 block mb-1">ملاحظات الطالب:</span>
                        <p className="text-sm font-medium text-gray-900">{selectedPayment.student_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Payment Receipt Image */}
              <Card className="p-5 bg-gray-50 border-2 border-gray-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-gray-900">إيصال الدفع</span>
                  </div>
                  {selectedPayment.receipt_url ? (
                    <div className="bg-white rounded-xl border-2 border-gray-300 overflow-hidden shadow-md">
                      <div className="relative bg-gray-100 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-hidden">
                        <img 
                          src={selectedPayment.receipt_url} 
                          alt="إيصال الدفع" 
                          className="w-full h-full object-contain max-h-[500px]"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Prevent infinite loop by checking if already set to placeholder
                            if (!target.src.includes('placeholder')) {
                              target.onerror = null; // Remove error handler to prevent loop
                              target.style.display = 'none'; // Hide broken image
                            }
                          }}
                        />
                      </div>
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                        <a 
                          href={selectedPayment.receipt_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          عرض الصورة بالحجم الكامل في تبويب جديد
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                      <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                      <p className="text-base text-gray-500 font-medium">
                        لم يتم رفع إيصال الدفع بعد
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Rejection Reason Input */}
              <Card className="p-5 bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-red-200">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <label className="block text-base font-bold text-red-900">
                      سبب الرفض <span className="text-sm font-normal text-gray-600">(مطلوب عند الرفض)</span>
                    </label>
                  </div>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="أدخل سبب رفض الدفع (مثال: الإيصال غير واضح، المبلغ غير مطابق، معلومات غير صحيحة)..."
                    className="min-h-[120px] text-base bg-white border-2 border-gray-300 focus:border-red-400 focus:ring-red-400"
                  />
                  <p className="text-xs text-gray-500">
                    💡 ملاحظة: سيتم إرسال سبب الرفض للطالب عبر البريد الإلكتروني
                  </p>
                </div>
              </Card>
            </div>
          )}

          <DialogFooter className="flex gap-3 flex-col sm:flex-row !bg-white bg-white pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setShowReviewModal(false);
                setSelectedPayment(null);
                setRejectionReason('');
              }}
              disabled={isReviewing}
              className="w-full sm:w-auto"
            >
              إلغاء
            </Button>
            <Button
              variant="outline"
              onClick={handleRejectPayment}
              disabled={isReviewing || !rejectionReason.trim()}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto"
            >
              <XCircle className="w-4 h-4 ml-2" />
              {isReviewing ? 'جاري الرفض...' : 'رفض الدفع'}
            </Button>
            <Button
              onClick={handleApprovePayment}
              disabled={isReviewing}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white w-full sm:w-auto"
            >
              <CheckCircle className="w-4 h-4 ml-2" />
              {isReviewing ? 'جاري القبول...' : 'قبول الدفع'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsManagementTab;

