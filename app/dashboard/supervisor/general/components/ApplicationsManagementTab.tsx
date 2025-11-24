'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Eye,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import liveEducationApi from '@/lib/api/live-education';
import type { CourseApplication } from '@/lib/types/live-education';

const ApplicationsManagementTab: React.FC = () => {
  const [applications, setApplications] = useState<CourseApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedApplication, setSelectedApplication] = useState<CourseApplication | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      const response = await liveEducationApi.applications.list(params);
      setApplications(response.results || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('حدث خطأ في تحميل طلبات التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    console.log('🔄 Approving application:', applicationId);
    
    try {
      const response = await liveEducationApi.applications.approve(applicationId);
      console.log('📥 Approve response:', { status: response.status, ok: response.ok });
      
      if (response.ok) {
        toast.success('تم قبول الطلب بنجاح! ✅');
        await fetchApplications();
      } else {
        // Try to get error details
        const contentType = response.headers.get('content-type');
        let errorMessage = 'حدث خطأ في قبول الطلب';
        
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          console.error('❌ Error response:', errorData);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          console.error('❌ Error response (text):', errorText);
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error approving application:', error);
      toast.error('حدث خطأ في الاتصال بالخادم');
    }
  };

  const handleReject = async (applicationId: string, reason: string) => {
    console.log('🔄 Rejecting application:', applicationId, 'Reason:', reason);
    
    try {
      const response = await liveEducationApi.applications.reject(applicationId, reason);
      console.log('📥 Reject response:', { status: response.status, ok: response.ok });
      
      if (response.ok) {
        toast.success('تم رفض الطلب');
        await fetchApplications();
      } else {
        // Try to get error details
        const contentType = response.headers.get('content-type');
        let errorMessage = 'حدث خطأ في رفض الطلب';
        
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          console.error('❌ Error response:', errorData);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          console.error('❌ Error response (text):', errorText);
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error rejecting application:', error);
      toast.error('حدث خطأ في الاتصال بالخادم');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'قيد المراجعة', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      approved: { label: 'مقبول', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      rejected: { label: 'مرفوض', className: 'bg-red-100 text-red-800 border-red-300' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge className={`${config.className} border font-semibold`}>
        {config.label}
      </Badge>
    );
  };

  const filteredApplications = applications.filter(app =>
    app.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin text-orange-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل طلبات التسجيل...</p>
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
              <p className="text-sm text-blue-600 font-semibold">إجمالي الطلبات</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
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

          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              className={filterStatus === 'all' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <Filter className="w-4 h-4 ml-2" />
              الكل
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('pending')}
              className={filterStatus === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            >
              قيد المراجعة
            </Button>
            <Button
              variant={filterStatus === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('approved')}
              className={filterStatus === 'approved' ? 'bg-blue-600 hover:bg-blue-700' : ''}
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
            onClick={fetchApplications}
            className="border-orange-200 hover:bg-orange-50"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </div>
      </Card>

      {/* Applications List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredApplications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full"
            >
              <Card className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد طلبات تسجيل</p>
              </Card>
            </motion.div>
          ) : (
            filteredApplications.map((application, index) => (
              <motion.div
                key={application.id}
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
                            {application.student_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {application.student_email}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>

                    {/* Course Info */}
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-900">الدورة:</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {application.course_title}
                      </p>
                    </div>

                    {/* Application Type */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">النوع:</span>
                        <Badge variant="outline" className="font-semibold">
                          {application.preferred_type === 'individual' ? '👤 فردي' : '👥 جماعي'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">التاريخ:</span>
                        <span className="font-medium text-gray-800">
                          {new Date(application.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    {application.notes && (
                      <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>ملاحظات:</strong> {application.notes}
                        </p>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {application.status === 'rejected' && application.rejection_reason && (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <p className="text-sm text-red-600">
                          <strong>سبب الرفض:</strong> {application.rejection_reason}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {application.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleApprove(application.id)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 ml-2" />
                          قبول
                        </Button>
                        <Button
                          onClick={() => {
                            const reason = prompt('يرجى إدخال سبب الرفض:');
                            if (reason) {
                              handleReject(application.id, reason);
                            }
                          }}
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 ml-2" />
                          رفض
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ApplicationsManagementTab;

