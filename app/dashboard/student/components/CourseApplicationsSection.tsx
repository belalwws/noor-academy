"use client";

import React, { useEffect, useState } from "react";
import { liveEducationApi } from "@/lib/api/live-education";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  RefreshCw,
  FileText,
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

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
  learning_type_display?: string;
  rejection_reason?: string;
  reviewed_by?: number;
  reviewed_by_name?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

const CourseApplicationsSection: React.FC = () => {
  const router = useRouter();
  const [applications, setApplications] = useState<CourseApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadApplications = async (page = 1, showRefreshToast = false) => {
    try {
      if (!showRefreshToast) {
        setIsLoading(true);
      }

      console.log('🔍 Loading student course applications...');
      
      const params: any = {
        page,
        ordering: '-created_at'
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      // API automatically filters by current student
      const response = await liveEducationApi.applications.list(params);
      
      // Filter out enrolled applications - they should appear in enrolled courses section
      // Only show pending, ready_for_teacher, or rejected applications
      
      console.log('✅ Student applications loaded:', response);
      
      // Handle paginated response
      let allApplications: CourseApplication[] = [];
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          allApplications = response;
        } else {
          // Paginated response
          const data = response as any;
          allApplications = data.results || data.data || [];
        }
      }
      
      // Filter out enrolled applications - they should appear in enrolled courses section
      // Only show pending, ready_for_teacher, or rejected applications
      const filteredApps = allApplications.filter((app: CourseApplication) => 
        app.status !== 'enrolled'
      );
      
      setApplications(filteredApps);
      setTotalCount(filteredApps.length);
      setTotalPages(Math.ceil((filteredApps.length) / 10));

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
  }, [currentPage, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any; color: string }> = {
      pending_review: {
        label: 'قيد المراجعة',
        variant: 'secondary',
        icon: Clock,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800'
      },
      ready_for_teacher: {
        label: 'جاهز للمعلم',
        variant: 'default',
        icon: CheckCircle,
        color: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
      },
      rejected: {
        label: 'مرفوض',
        variant: 'destructive',
        icon: XCircle,
        color: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800'
      },
      enrolled: {
        label: 'مسجل',
        variant: 'default',
        icon: CheckCircle,
        color: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
      }
    };

    const config = statusConfig[status] || { 
      label: status, 
      variant: 'outline' as const, 
      icon: FileText,
      color: 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900/20 dark:border-gray-800'
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending_review':
        return 'طلبك قيد المراجعة من قبل المشرف الأكاديمي';
      case 'ready_for_teacher':
        return 'تم قبول طلبك! في انتظار المعلم لإضافتك إلى دفعة';
      case 'rejected':
        return 'تم رفض طلبك من قبل المشرف الأكاديمي';
      case 'enrolled':
        return 'تم قبولك في الدورة بنجاح!';
      default:
        return 'حالة غير معروفة';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.course_title?.toLowerCase().includes(searchLower) ||
        app.student_notes?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (isLoading && applications.length === 0) {
    return (
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-amber-200/50 dark:border-amber-700/30">
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <div className="text-center space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400">جاري تحميل طلبات التسجيل...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render if no applications and not loading
  if (!isLoading && applications.length === 0 && !searchTerm && statusFilter === 'all') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            طلبات التسجيل
          </h2>
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => loadApplications(currentPage, true)}
          className="h-8"
        >
          <RefreshCw className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Compact Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="ابحث عن دورة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9 h-9 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 h-9">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="pending_review">قيد المراجعة</SelectItem>
            <SelectItem value="ready_for_teacher">جاهز للمعلم</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filteredApplications.length === 0 ? (
          <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-amber-200/50 dark:border-amber-700/30">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد طلبات تسجيل
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'لم يتم العثور على طلبات تطابق معايير البحث'
                  : 'لم تقم بتقديم أي طلبات تسجيل بعد'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  onClick={() => router.push('/courses')}
                  size="sm"
                  variant="outline"
                >
                  <BookOpen className="w-4 h-4 ml-2" />
                  تصفح الدورات المتاحة
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>

            {/* Compact Applications Cards */}
            {filteredApplications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-amber-200/50 dark:border-amber-700/30 hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Compact Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <BookOpen className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                              {application.course_title || `دورة ${application.course}`}
                            </h3>
                            {getStatusBadge(application.status)}
                          </div>
                          
                          {/* Compact Status Message */}
                          <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                                {getStatusMessage(application.status)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Compact Details Row */}
                      <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                          {application.learning_type && (
                            <Badge variant="outline" className="text-xs">
                              {application.learning_type_display || (application.learning_type === 'individual' ? 'فردي' : 'جماعي')}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(application.created_at).toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>
                        {application.receipt_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(application.receipt_url, '_blank')}
                            className="h-7 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 ml-1.5" />
                            الإيصال
                          </Button>
                        )}
                      </div>

                      {/* Student Notes - Compact */}
                      {application.student_notes && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-2">
                          <p className="text-xs text-blue-800 dark:text-blue-200 line-clamp-2">
                            <span className="font-semibold">ملاحظاتك:</span> {application.student_notes}
                          </p>
                        </div>
                      )}

                      {/* Rejection Reason - Compact */}
                      {application.rejection_reason && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
                          <p className="text-xs text-red-800 dark:text-red-200 line-clamp-2">
                            <span className="font-semibold">سبب الرفض:</span> {application.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Compact Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 text-xs"
                >
                  السابق
                </Button>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  صفحة {currentPage} من {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 text-xs"
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default CourseApplicationsSection;

