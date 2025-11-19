'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Users, GraduationCap, RefreshCw, Search, CheckCircle, XCircle, Calendar, BookOpen, User } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { generalSupervisorApi, type CourseEnrollment } from '@/lib/api/generalSupervisor';

interface EnrollmentsTabProps {
  // Removed onAfterAction to prevent duplicate API calls
}

const EnrollmentsTab: React.FC<EnrollmentsTabProps> = () => {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Action dialog states
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<CourseEnrollment | null>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [actionForm, setActionForm] = useState({
    notes: '',
    rejection_reason: ''
  });
  const [processingAction, setProcessingAction] = useState(false);

  const loadEnrollments = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      let enrollmentsData: CourseEnrollment[] = [];
      
      if (statusFilter === 'pending') {
        // Use the pending endpoint for better performance
        enrollmentsData = await generalSupervisorApi.getPendingEnrollments();
      } else {
        // Use the general endpoint with filters
        const response = await generalSupervisorApi.getEnrollments({
          status: statusFilter as any,
          ordering: '-enrolled_at'
        });
        enrollmentsData = response.results;
      }

      setEnrollments(enrollmentsData);

      if (showRefreshToast) {
        toast.success(`تم تحديث القائمة (${enrollmentsData.length})`, { id: 'refresh-enrollments' });
      }
    } catch {
      setEnrollments([]);
      toast.error('فشل في تحميل طلبات التسجيل');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  // Filter enrollments based on search query
  const filteredEnrollments = enrollments.filter(enrollment => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    
    return (
      enrollment.student_name?.toLowerCase().includes(q) ||
      enrollment.course_title?.toLowerCase().includes(q) ||
      enrollment.notes?.toLowerCase().includes(q) ||
      enrollment.family_name?.toLowerCase().includes(q)
    );
  });

  const openActionDialog = (enrollment: CourseEnrollment, actionType: 'approve' | 'reject') => {
    setSelectedEnrollment(enrollment);
    setAction(actionType);
    setActionForm({ notes: '', rejection_reason: '' });
    setActionDialog(true);
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    try {
      setProcessingAction(true);

      if (action === 'approve') {
        await generalSupervisorApi.approveEnrollment(
          selectedEnrollment.id,
          actionForm.notes
        );
        toast.success('تم قبول طلب التسجيل بنجاح');
      } else {
        if (!actionForm.rejection_reason.trim()) {
          toast.error('يرجى إدخال سبب الرفض');
          return;
        }
        await generalSupervisorApi.rejectEnrollment(
          selectedEnrollment.id,
          actionForm.rejection_reason
        );
        toast.success('تم رفض طلب التسجيل');
      }

      setActionDialog(false);
      await loadEnrollments();
      // Removed onAfterAction call to prevent duplicate API requests
    } catch (error) {
      console.error('Action error:', error);
      toast.error(`فشل في ${action === 'approve' ? 'قبول' : 'رفض'} طلب التسجيل`);
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'قيد المراجعة', variant: 'secondary' as const,  },
      approved: { label: 'مقبول', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'مرفوض', variant: 'destructive' as const, icon: XCircle },
      completed: { label: 'مكتمل', variant: 'default' as const, icon: CheckCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        {status === 'pending' ? (
          <Spinner size="sm" tone="muted" className="w-3 h-3" />
        ) : Icon ? (
          <Icon className="w-3 h-3" />
        ) : null}
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
          <Spinner size="md" />
          <span className="text-sm">جاري تحميل طلبات التسجيل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">طلبات التسجيل في الدورات</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{filteredEnrollments.length} طلب</p>
        </div>
        <Button 
          onClick={() => loadEnrollments(true)} 
          variant="outline"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Spinner size="sm" tone="muted" className="mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          تحديث
        </Button>
      </div>

      {/* Filters */}
      <Card className="border bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث بالاسم أو الدورة..."
                className="pl-10"
              />
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Enrollments List */}
      <Card className="border bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
        <CardContent className="pt-6">
          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">لا توجد طلبات تسجيل</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="group relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 dark:from-blue-950/30 to-indigo-100 dark:to-indigo-950/30 opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <CardContent className="relative p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-300">
                          {enrollment.student_name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">{enrollment.course_title}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {enrollment.family_name && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {enrollment.family_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(enrollment.enrolled_at).toLocaleDateString('ar-EG')}
                          </span>
                          {getStatusBadge(enrollment.status)}
                        </div>
                      </div>
                    </div>

                    {enrollment.notes && (
                      <div className="bg-gray-50/80 dark:bg-slate-700/80 backdrop-blur-sm p-3 rounded-xl border border-gray-100 dark:border-slate-600 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">ملاحظات الطالب:</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{enrollment.notes}</p>
                      </div>
                    )}

                    {enrollment.status === 'pending' && (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => openActionDialog(enrollment, 'approve')}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          قبول
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => openActionDialog(enrollment, 'reject')}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          رفض
                        </Button>
                      </div>
                    )}

                    {enrollment.approved_at && (
                      <div className="text-center pt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          تم القبول في: {new Date(enrollment.approved_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialog} onOpenChange={setActionDialog}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'قبول طلب التسجيل' : 'رفض طلب التسجيل'}
            </DialogTitle>
          </DialogHeader>

          {selectedEnrollment && (
            <form onSubmit={handleActionSubmit} className="space-y-6">
              {/* Enrollment Summary */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-2">تفاصيل الطلب:</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">الطالب:</span> {selectedEnrollment.student_name}</p>
                  <p><span className="font-medium">الدورة:</span> {selectedEnrollment.course_title}</p>
                  {selectedEnrollment.family_name && (
                    <p><span className="font-medium">العائلة:</span> {selectedEnrollment.family_name}</p>
                  )}
                  {selectedEnrollment.notes && (
                    <p><span className="font-medium">ملاحظات الطالب:</span> {selectedEnrollment.notes}</p>
                  )}
                </div>
              </div>

              {/* Action Form */}
              {action === 'approve' ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ملاحظات الموافقة (اختياري)
                  </label>
                  <Textarea
                    placeholder="أي ملاحظات إضافية للطالب..."
                    value={actionForm.notes}
                    onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    سبب الرفض *
                  </label>
                  <Textarea
                    placeholder="يرجى توضيح سبب رفض طلب التسجيل..."
                    value={actionForm.rejection_reason}
                    onChange={(e) => setActionForm({ ...actionForm, rejection_reason: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActionDialog(false)}
                  disabled={processingAction}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={processingAction}
                  className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                  variant={action === 'reject' ? 'destructive' : 'default'}
                >
                  {processingAction ? (
                    <Spinner size="sm" tone="contrast" className="mr-2" />
                  ) : action === 'approve' ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  {action === 'approve' ? 'قبول الطلب' : 'رفض الطلب'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnrollmentsTab;





