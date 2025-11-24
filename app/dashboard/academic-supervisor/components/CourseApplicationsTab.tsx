"use client";

import React, { useEffect, useState } from "react";
import { liveEducationApi } from "@/lib/api/live-education";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  RefreshCw,
  FileText,
  User,
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  Mail,
  Receipt,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CourseApplication {
  id: string;
  course: string;
  course_title?: string;
  student: number;
  student_name?: string;
  student_email?: string;
  status: 'pending_review' | 'ready_for_teacher' | 'rejected' | 'enrolled';
  status_display?: string;
  receipt_url?: string;
  student_notes?: string;
  learning_type?: 'individual' | 'group';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

const CourseApplicationsTab: React.FC = () => {
  const [applications, setApplications] = useState<CourseApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Review modal states
  const [selectedApplication, setSelectedApplication] = useState<CourseApplication | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [learningType, setLearningType] = useState<'individual' | 'group'>('individual');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const loadApplications = async (page = 1, showRefreshToast = false) => {
    try {
      if (!showRefreshToast) {
        setIsLoading(true);
      }

      console.log('🔍 Loading course applications...');
      
      const params: any = {
        page,
        ordering: '-created_at'
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (courseFilter !== 'all') {
        params.course = courseFilter;
      }

      const response = await liveEducationApi.applications.list(params);
      
      console.log('✅ Applications loaded:', response);
      
      // Handle paginated response
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          setApplications(response);
          setTotalCount(response.length);
          setTotalPages(1);
        } else {
          // Paginated response
          const data = response as any;
          setApplications(data.results || data.data || []);
          setTotalCount(data.count || 0);
          setTotalPages(Math.ceil((data.count || 0) / (data.page_size || 10)));
        }
      } else {
        setApplications([]);
        setTotalCount(0);
        setTotalPages(1);
      }

      if (showRefreshToast) {
        toast.success('تم تحديث البيانات بنجاح ✨');
      }
    } catch (err: any) {
      console.error('❌ Error loading applications:', err);
      toast.error('حدث خطأ أثناء تحميل طلبات التسجيل');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications(currentPage);
  }, [currentPage, statusFilter, courseFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending_review: {
        label: 'قيد المراجعة',
        className: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400',
        icon: Clock
      },
      ready_for_teacher: {
        label: 'جاهز للمعلم',
        className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400',
        icon: CheckCircle
      },
      rejected: {
        label: 'مرفوض',
        className: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400',
        icon: XCircle
      },
      enrolled: {
        label: 'مسجل',
        className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400',
        icon: CheckCircle
      }
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-300', icon: FileText };
    const Icon = config.icon;

    return (
      <Badge className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold border-2 shadow-sm ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </Badge>
    );
  };

  const filteredApplications = applications.filter(app => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.student_name?.toLowerCase().includes(searchLower) ||
        app.student_email?.toLowerCase().includes(searchLower) ||
        app.course_title?.toLowerCase().includes(searchLower) ||
        app.student_notes?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleOpenReviewModal = (application: CourseApplication, action: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setReviewAction(action);
    setShowReviewModal(true);
    setLearningType(application.learning_type || 'individual');
    setRejectionReason('');
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedApplication(null);
    setReviewAction(null);
    setLearningType('individual');
    setRejectionReason('');
  };

  const handleReviewApplication = async () => {
    if (!selectedApplication || !reviewAction) return;

    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      toast.error('يرجى إدخال سبب الرفض');
      return;
    }

    try {
      setIsReviewing(true);
      
      if (reviewAction === 'approve') {
        await liveEducationApi.applications.review(selectedApplication.id, {
          status: 'ready_for_teacher',
          learning_type: learningType
        });
      } else {
        await liveEducationApi.applications.review(selectedApplication.id, {
          status: 'rejected',
          rejection_reason: rejectionReason.trim()
        });
      }

        toast.success(
          reviewAction === 'approve' 
            ? 'تم قبول الطلب بنجاح ✅' 
            : 'تم رفض الطلب بنجاح'
        );
        handleCloseReviewModal();
        await loadApplications(currentPage, false);
    } catch (error: any) {
      console.error('Error reviewing application:', error);
      const errorMessage = error?.message || `حدث خطأ أثناء ${reviewAction === 'approve' ? 'قبول' : 'رفض'} الطلب`;
      toast.error(errorMessage);
    } finally {
      setIsReviewing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
          <p className="text-gray-600">جاري تحميل طلبات التسجيل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-amber-200/50 dark:border-amber-700/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ابحث عن طالب أو دورة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="حالة الطلب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending_review">قيد المراجعة</SelectItem>
                  <SelectItem value="ready_for_teacher">جاهز للمعلم</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="enrolled">مسجل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              onClick={() => loadApplications(currentPage, true)}
              className="whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-amber-200/50 dark:border-amber-700/30">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد طلبات تسجيل
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'لم يتم العثور على طلبات تطابق معايير البحث'
                  : 'لا توجد طلبات تسجيل في الوقت الحالي'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>إجمالي الطلبات: {totalCount}</span>
              <span>عرض {filteredApplications.length} من {totalCount}</span>
            </div>

            {/* Applications Cards */}
            {filteredApplications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 backdrop-blur-xl border-2 border-amber-200/60 dark:border-amber-700/40 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-orange-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:via-orange-500/5 group-hover:to-amber-500/5 transition-all duration-300 pointer-events-none" />
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Application Info */}
                      <div className="flex-1 space-y-4">
                        {/* Header Section */}
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-amber-200/50 dark:border-amber-800/50">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
                                <div className="relative p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-xl shadow-lg">
                                  <BookOpen className="w-5 h-5 text-white" />
                                </div>
                              </div>
                        <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                              {application.course_title || `دورة ${application.course}`}
                            </h3>
                                <div className="flex items-center gap-2">
                            {getStatusBadge(application.status)}
                                </div>
                              </div>
                            </div>
                          </div>
                          </div>
                          
                        {/* Student Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-amber-100 dark:border-amber-900/30 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg">
                              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">الطالب</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {application.student_name || `طالب #${application.student}`}
                              </p>
                            </div>
                          </div>

                            {application.student_email && (
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-amber-100 dark:border-amber-900/30 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                              <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg">
                                <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">البريد الإلكتروني</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {application.student_email}
                                </p>
                              </div>
                              </div>
                            )}

                            {application.learning_type && (
                            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-amber-100 dark:border-amber-900/30">
                              <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-800/40 rounded-lg">
                                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">نوع التعليم</p>
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 font-semibold">
                                  {application.learning_type === 'individual' ? 'فردي 👤' : 'جماعي 👥'}
                              </Badge>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg">
                              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">تاريخ التقديم</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(application.created_at).toLocaleDateString('ar-SA', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                        </div>
                      </div>

                        {/* Notes and Rejection Reason */}
                      {application.student_notes && (
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">ملاحظات الطالب</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {application.student_notes}
                          </p>
                              </div>
                            </div>
                        </div>
                      )}

                      {application.rejection_reason && (
                          <div className="bg-gradient-to-r from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
                            <div className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-red-800 dark:text-red-300 mb-1">سبب الرفض</p>
                                <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                                  {application.rejection_reason}
                          </p>
                        </div>
                        </div>
                          </div>
                        )}
                    </div>

                      {/* Actions Section */}
                      <div className="flex flex-col gap-3 lg:min-w-[220px]">
                      {application.receipt_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(application.receipt_url, '_blank')}
                            className="w-full border-2 border-amber-300 dark:border-amber-700 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-600 hover:text-white hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 font-semibold"
                        >
                            <Receipt className="w-4 h-4 ml-2" />
                          عرض الإيصال
                        </Button>
                      )}
                      
                      {/* Review Actions - Only show for pending_review status */}
                      {application.status === 'pending_review' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleOpenReviewModal(application, 'approve')}
                              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                              style={{ transform: 'none' }}
                          >
                            <CheckCircle className="w-4 h-4 ml-2" />
                            قبول الطلب
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleOpenReviewModal(application, 'reject')}
                              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                              style={{ transform: 'none' }}
                          >
                            <XCircle className="w-4 h-4 ml-2" />
                            رفض الطلب
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  صفحة {currentPage} من {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Application Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className={`sm:max-w-[450px] max-h-[calc(100vh-80px)] overflow-y-auto bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-700 shadow-2xl ${reviewAction === 'reject' ? 'pt-0 mt-0' : 'pt-2'}`}>
          <DialogHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-700/50">
            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold">
              {reviewAction === 'approve' ? (
                <>
                  <div className="p-1.5 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-gray-900 dark:text-white">قبول طلب التسجيل</span>
                </>
              ) : (
                <>
                  <div className="p-1.5 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-gray-900 dark:text-white">رفض طلب التسجيل</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">
              {reviewAction === 'approve' 
                ? 'يرجى تحديد نوع التعليم قبل قبول الطلب'
                : 'يرجى إدخال سبب الرفض'}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className={`space-y-4 ${reviewAction === 'reject' ? 'py-2' : 'py-4'}`}>
              {/* Application Info */}
              <div className={`bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl ${reviewAction === 'reject' ? 'p-2 space-y-2' : 'p-3 space-y-2.5'}`}>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded-lg">
                    <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">الدورة</p>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      {selectedApplication.course_title || `دورة ${selectedApplication.course}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 pt-2 border-t border-amber-200 dark:border-amber-800">
                  <div className="p-1.5 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">الطالب</p>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {selectedApplication.student_name || `طالب #${selectedApplication.student}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Approve Form */}
              {reviewAction === 'approve' && (
                <div className="space-y-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="space-y-2.5">
                    <Label htmlFor="learning_type" className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>نوع التعليم</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select value={learningType} onValueChange={(value: 'individual' | 'group') => setLearningType(value)}>
                      <SelectTrigger id="learning_type" className="h-10 text-sm bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-amber-700 focus:border-amber-500 dark:focus:border-amber-500">
                        <SelectValue placeholder="اختر نوع التعليم" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">فردي</SelectItem>
                        <SelectItem value="group">جماعي</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-start gap-2 p-2.5 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        سيتم إرسال إشعار للمعلم لإضافة الطالب إلى دفعة
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reject Form */}
              {reviewAction === 'reject' && (
                <div className="space-y-2.5 bg-gradient-to-r from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-3">
                  <div className="space-y-2">
                    <Label htmlFor="rejection_reason" className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>سبب الرفض</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="rejection_reason"
                      placeholder="أدخل سبب رفض الطلب بالتفصيل..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="resize-none text-sm bg-white dark:bg-slate-800 border-2 border-red-200 dark:border-red-700 focus:border-red-400 dark:focus:border-red-500"
                    />
                    <div className="flex items-start gap-2 p-2.5 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <XCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        سيتم إرسال سبب الرفض للطالب عبر البريد الإلكتروني
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2.5 pt-3 border-t border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-slate-800/50 dark:to-slate-800/50 -mx-6 -mb-6 px-4 py-3 rounded-b-lg">
            <Button
              variant="outline"
              onClick={handleCloseReviewModal}
              disabled={isReviewing}
              className="flex-1 border-2 border-amber-200 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-semibold text-sm h-9"
              style={{ transform: 'none' }}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleReviewApplication}
              disabled={isReviewing || (reviewAction === 'reject' && !rejectionReason.trim())}
              className={
                reviewAction === 'approve'
                  ? 'flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-colors text-sm h-9'
                  : 'flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-colors text-sm h-9'
              }
              style={{ transform: 'none' }}
            >
              {isReviewing ? (
                <>
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  جاري المعالجة...
                </>
              ) : reviewAction === 'approve' ? (
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
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseApplicationsTab;

