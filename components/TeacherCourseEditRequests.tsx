'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { liveCourseEditRequestsApi } from '@/lib/api/live-course-edit-requests';
import { LiveCourseEditRequest } from '@/lib/types/live-course-edit-requests';
import { Eye, Clock, CheckCircle, XCircle, AlertCircle, Edit } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function TeacherCourseEditRequests() {
  const [requests, setRequests] = useState<LiveCourseEditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<LiveCourseEditRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadRequests = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await liveCourseEditRequestsApi.listEditRequests({
        page,
        ordering: '-created_at'
      });
      setRequests(response.results);
      setTotalPages(Math.ceil(response.count / 10)); // Assuming 10 items per page
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Error loading course edit requests:', error);
      setError(`حدث خطأ في تحميل طلبات التعديل: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">في الانتظار</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">موافق عليه</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Helper function to parse JSON data
  const parseJsonData = (jsonString: string) => {
    try {
      return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch {
      return {};
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (request: CourseEditRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <Skeleton className="h-10 w-64 mx-auto bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <Skeleton className="h-5 w-96 mx-auto bg-slate-200 dark:bg-slate-700 rounded" />
        </motion.div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                      <Skeleton className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                    <Skeleton className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <Skeleton className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  </div>
                  <Skeleton className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Alert className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3 md:space-y-4"
      >
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-3"
        >
          <motion.div
            whileHover={{ rotate: 5, scale: 1.1 }}
            className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 rounded-xl shadow-lg"
          >
            <Edit className="w-6 h-6 md:w-7 md:h-7 text-orange-600 dark:text-orange-400" />
          </motion.div>
          <span>طلبات تعديل الدورات</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 dark:text-slate-400 text-sm md:text-base"
        >
          عرض وإدارة طلبات تعديل الدورات الخاصة بك
        </motion.p>
      </motion.div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800/90 backdrop-blur-sm text-center py-12 md:py-16">
            <CardContent className="bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-slate-800/50 dark:to-orange-900/10 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg border border-orange-200/50 dark:border-orange-700/50"
              >
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Edit className="w-8 h-8 md:w-10 md:h-10 text-orange-400 dark:text-orange-500" />
                </motion.div>
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                لا توجد طلبات تعديل حالياً
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-slate-500 dark:text-slate-400 text-sm md:text-base"
              >
                سيتم عرض طلبات تعديل الدورات هنا عند إرسالها
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid gap-6"
        >
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden border-l-4 border-l-orange-500 dark:border-l-orange-600">
                <CardHeader className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 p-4 md:p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 truncate">
                        {request.course_title}
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">
                        طلب تعديل بتاريخ: {formatDate(request.created_at)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {getStatusIcon(request.status)}
                      </motion.div>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    {/* Request Summary */}
                    {request.teacher_notes && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg md:rounded-xl border border-slate-200 dark:border-slate-600"
                      >
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-sm md:text-base">ملاحظات المعلم</h4>
                        <p className="text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed">
                          {request.teacher_notes}
                        </p>
                      </motion.div>
                    )}

                    {/* Changes Summary */}
                    {request.changes_summary && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg md:rounded-xl border border-orange-200 dark:border-orange-700"
                      >
                        <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2 text-sm md:text-base">ملخص التغييرات</h4>
                        <p className="text-orange-700 dark:text-orange-400 text-xs md:text-sm leading-relaxed">
                          {request.changes_summary}
                        </p>
                      </motion.div>
                    )}

                    {/* Key Changes */}
                    {(() => {
                      const newData = parseJsonData(request.new_data);
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {newData.title && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="bg-blue-50 dark:bg-blue-900/30 p-3 md:p-4 rounded-lg md:rounded-xl border border-blue-200 dark:border-blue-700"
                            >
                              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1 text-sm md:text-base">العنوان الجديد</h5>
                              <p className="text-blue-700 dark:text-blue-400 text-xs md:text-sm">{newData.title}</p>
                            </motion.div>
                          )}
                          {newData.start_date && (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="bg-green-50 dark:bg-green-900/30 p-3 md:p-4 rounded-lg md:rounded-xl border border-green-200 dark:border-green-700"
                            >
                              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1 text-sm md:text-base">تاريخ البداية</h5>
                              <p className="text-green-700 dark:text-green-400 text-xs md:text-sm">{newData.start_date}</p>
                            </motion.div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex gap-2 pt-4"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => handleViewDetails(request)}
                          variant="outline"
                          className="flex items-center gap-2 border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <Eye className="w-4 h-4" />
                          عرض التفاصيل
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center items-center gap-2 md:gap-4 flex-wrap"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              onClick={() => loadRequests(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </Button>
          </motion.div>
          <span className="px-4 py-2 text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
            صفحة {currentPage} من {totalPages}
          </span>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              onClick={() => loadRequests(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl" dir="rtl">
          {selectedRequest && (
            <>
              <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DialogTitle className="flex items-center gap-3 md:gap-4 text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      className="p-2.5 md:p-3 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 rounded-xl md:rounded-2xl shadow-lg"
                    >
                      <Edit className="w-5 h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
                    </motion.div>
                    <span>تفاصيل طلب التعديل</span>
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm md:text-base mt-2">
                    طلب تعديل دورة: <strong>{selectedRequest.course_title}</strong>
                  </DialogDescription>
                </motion.div>
              </DialogHeader>

              <div className="space-y-4 md:space-y-6 py-4">
                {/* Status and Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg md:rounded-xl border border-slate-200 dark:border-slate-600"
                  >
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-sm md:text-base">حالة الطلب</h4>
                    <div className="flex items-center gap-2">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {getStatusIcon(selectedRequest.status)}
                      </motion.div>
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg md:rounded-xl border border-slate-200 dark:border-slate-600"
                  >
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-sm md:text-base">تاريخ الطلب</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-xs md:text-sm">{formatDate(selectedRequest.created_at)}</p>
                  </motion.div>
                </div>

                {/* Teacher Notes */}
                {selectedRequest.teacher_notes && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-orange-50 dark:bg-orange-900/30 p-4 md:p-5 rounded-lg md:rounded-xl border border-orange-200 dark:border-orange-700"
                  >
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2 text-sm md:text-base">ملاحظات المعلم</h4>
                    <p className="text-orange-700 dark:text-orange-400 text-xs md:text-sm leading-relaxed">{selectedRequest.teacher_notes}</p>
                  </motion.div>
                )}

                {/* Changes Summary */}
                {selectedRequest.changes_summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-blue-50 dark:bg-blue-900/30 p-4 md:p-5 rounded-lg md:rounded-xl border border-blue-200 dark:border-blue-700"
                  >
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 text-sm md:text-base">ملخص التغييرات</h4>
                    <p className="text-blue-700 dark:text-blue-400 text-xs md:text-sm leading-relaxed">{selectedRequest.changes_summary}</p>
                  </motion.div>
                )}

                {/* Current vs New Values */}
                {(() => {
                  const oldData = parseJsonData(selectedRequest.old_data);
                  const newData = parseJsonData(selectedRequest.new_data);
                  
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-red-50 dark:bg-red-900/30 p-4 md:p-5 rounded-lg md:rounded-xl border border-red-200 dark:border-red-700"
                      >
                        <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3 text-sm md:text-base">القيم الحالية</h4>
                        <div className="space-y-2 text-xs md:text-sm text-red-700 dark:text-red-400">
                          {oldData.title && <div><strong>العنوان:</strong> {oldData.title}</div>}
                          {oldData.description && <div><strong>الوصف:</strong> {oldData.description.substring(0, 100)}...</div>}
                          {oldData.start_date && <div><strong>تاريخ البداية:</strong> {oldData.start_date}</div>}
                          {oldData.end_date && <div><strong>تاريخ النهاية:</strong> {oldData.end_date}</div>}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-green-50 dark:bg-green-900/30 p-4 md:p-5 rounded-lg md:rounded-xl border border-green-200 dark:border-green-700"
                      >
                        <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3 text-sm md:text-base">القيم الجديدة</h4>
                        <div className="space-y-2 text-xs md:text-sm text-green-700 dark:text-green-400">
                          {newData.title && <div><strong>العنوان:</strong> {newData.title}</div>}
                          {newData.description && <div><strong>الوصف:</strong> {newData.description.substring(0, 100)}...</div>}
                          {newData.start_date && <div><strong>تاريخ البداية:</strong> {newData.start_date}</div>}
                          {newData.end_date && <div><strong>تاريخ النهاية:</strong> {newData.end_date}</div>}
                        </div>
                      </motion.div>
                    </div>
                  );
                })()}

                {/* Additional Details */}
                {(() => {
                  const newData = parseJsonData(selectedRequest.new_data);
                  return (
                    <div className="space-y-4">
                      {newData.learning_outcomes && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          whileHover={{ scale: 1.01 }}
                          className="bg-blue-50 dark:bg-blue-900/30 p-4 md:p-5 rounded-lg md:rounded-xl border border-blue-200 dark:border-blue-700"
                        >
                          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 text-sm md:text-base">نواتج التعلم</h4>
                          <p className="text-blue-700 dark:text-blue-400 text-xs md:text-sm whitespace-pre-line">{newData.learning_outcomes}</p>
                        </motion.div>
                      )}

                      {newData.topics && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                          whileHover={{ scale: 1.01 }}
                          className="bg-purple-50 dark:bg-purple-900/30 p-4 md:p-5 rounded-lg md:rounded-xl border border-purple-200 dark:border-purple-700"
                        >
                          <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2 text-sm md:text-base">المواضيع</h4>
                          <p className="text-purple-700 dark:text-purple-400 text-xs md:text-sm">{newData.topics}</p>
                        </motion.div>
                      )}
                    </div>
                  );
                })()}

                {/* Supervisor Notes */}
                {selectedRequest.supervisor_notes && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-yellow-50 dark:bg-yellow-900/30 p-4 md:p-5 rounded-lg md:rounded-xl border border-yellow-200 dark:border-yellow-700"
                  >
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 text-sm md:text-base">ملاحظات المشرف</h4>
                    <p className="text-yellow-700 dark:text-yellow-400 text-xs md:text-sm">{selectedRequest.supervisor_notes}</p>
                  </motion.div>
                )}

                {/* Rejection Reason */}
                {selectedRequest.rejection_reason && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-red-50 dark:bg-red-900/30 p-4 md:p-5 rounded-lg md:rounded-xl border border-red-200 dark:border-red-700"
                  >
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2 text-sm md:text-base">سبب الرفض</h4>
                    <p className="text-red-700 dark:text-red-400 text-xs md:text-sm">{selectedRequest.rejection_reason}</p>
                  </motion.div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

