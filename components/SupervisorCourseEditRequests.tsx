'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LiveCourseEditRequestsAPI } from '@/lib/api/live-course-edit-requests';
import { LiveCourseEditRequest } from '@/lib/types/live-course-edit-requests';
import { Eye, Clock, CheckCircle, XCircle, AlertCircle, Check, X } from 'lucide-react';
import CourseComparisonModal from './CourseComparisonModal';
import { Spinner } from '@/components/ui/spinner';

interface SupervisorCourseEditRequestsProps {
  onShowComparison?: (request: LiveCourseEditRequest) => void;
  isActive?: boolean;
}

export default function SupervisorCourseEditRequests({ onShowComparison, isActive }: SupervisorCourseEditRequestsProps = {}) {
  const [requests, setRequests] = useState<LiveCourseEditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<LiveCourseEditRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  const loadRequests = async (page: number = 1) => {
    try {
      setLoading(true);
      console.log('🔍 Loading course edit requests for page:', page);
      
      const response = await LiveCourseEditRequestsAPI.listEditRequests({ page });
      console.log('🔍 Received response:', response);
      console.log('🔍 Results:', response.results);
      console.log('🔍 Count:', response.count);
      
      setRequests(response.results || []);
      setTotalPages(Math.ceil((response.count || 0) / 10));
      setCurrentPage(page);
      
      if (!response.results || response.results.length === 0) {
        console.log('🔍 No edit requests found');
      } else {
        console.log('🔍 Found', response.results.length, 'edit requests');
      }
    } catch (error: any) {
      console.error('🔍 Error loading course edit requests:', error);
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
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">في الانتظار</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">موافق عليه</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">مرفوض</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (request: LiveCourseEditRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
    setApprovalNotes('');
    setRejectionReason('');
    setRejectionNotes('');
  };

  const handleViewComparison = (request: LiveCourseEditRequest) => {
    if (onShowComparison) {
      onShowComparison(request);
    } else {
      setSelectedRequest(request);
      setIsComparisonOpen(true);
      setApprovalNotes('');
      setRejectionReason('');
      setRejectionNotes('');
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      await LiveCourseEditRequestsAPI.reviewEditRequest(selectedRequest.id, {
        action: 'approve',
        supervisor_notes: approvalNotes || 'تم الموافقة على طلب التعديل'
      });
      toast.success('تم الموافقة على طلب التعديل بنجاح');
      loadRequests(currentPage);
      setIsDetailsOpen(false);
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error(`حدث خطأ في الموافقة: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      await LiveCourseEditRequestsAPI.reviewEditRequest(selectedRequest.id, {
        action: 'reject',
        rejection_reason: rejectionReason || 'غير مناسب',
        supervisor_notes: rejectionNotes || 'تم رفض طلب التعديل'
      });
      toast.success('تم رفض طلب التعديل بنجاح');
      loadRequests(currentPage);
      setIsDetailsOpen(false);
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(`حدث خطأ في الرفض: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Parse JSON data safely
  const parseJsonData = (jsonString: string) => {
    try {
      return jsonString ? JSON.parse(jsonString) : {};
    } catch (e) {
      return {};
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-300 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">إدارة طلبات تعديل الدورات</h2>
        <p className="text-gray-600">مراجعة وموافقة على طلبات تعديل الدورات</p>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500 text-lg">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>لا توجد طلبات تعديل حالياً</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800 mb-2">
                      {request.course_title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      من المعلم: {request.teacher_name} | تاريخ الطلب: {formatDate(request.created_at)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Request Summary */}
                  {request.teacher_notes && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">ملاحظات المعلم</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {request.teacher_notes}
                      </p>
                    </div>
                  )}

                  {/* Changes Summary */}
                  {request.changes_summary && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">ملخص التغييرات</h4>
                      <p className="text-blue-700 text-sm leading-relaxed">
                        {request.changes_summary}
                      </p>
                    </div>
                  )}

                  {/* Key Changes */}
                  {(() => {
                    const newData = parseJsonData(request.new_data);
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {newData.title && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h5 className="font-semibold text-blue-800 mb-1">العنوان الجديد</h5>
                            <p className="text-blue-700 text-sm">{newData.title}</p>
                          </div>
                        )}
                        {newData.start_date && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h5 className="font-semibold text-blue-800 mb-1">تاريخ البداية</h5>
                            <p className="text-blue-700 text-sm">{newData.start_date}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleViewDetails(request)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      عرض التفاصيل
                    </Button>
                    <Button
                      onClick={() => handleViewComparison(request)}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      مقارنة التفاصيل
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => loadRequests(currentPage - 1)}
            disabled={currentPage === 1}
          >
            السابق
          </Button>
          <span className="px-4 py-2 text-sm text-gray-600">
            صفحة {currentPage} من {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => loadRequests(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            التالي
          </Button>
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900" dir="rtl">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  مراجعة طلب التعديل
                </DialogTitle>
                <DialogDescription>
                  طلب تعديل دورة: {selectedRequest.course_title} من المعلم: {selectedRequest.teacher_name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status and Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">حالة الطلب</h4>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedRequest.status)}
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">تاريخ الطلب</h4>
                    <p className="text-gray-700 text-sm">{formatDate(selectedRequest.created_at)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">المعلم</h4>
                    <p className="text-gray-700 text-sm">{selectedRequest.teacher_name}</p>
                  </div>
                </div>

                {/* Teacher Notes */}
                {selectedRequest.teacher_notes && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-2">ملاحظات المعلم</h4>
                    <p className="text-orange-700 text-sm leading-relaxed">{selectedRequest.teacher_notes}</p>
                  </div>
                )}

                {/* Changes Summary */}
                {selectedRequest.changes_summary && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">ملخص التغييرات</h4>
                    <p className="text-blue-700 text-sm leading-relaxed">{selectedRequest.changes_summary}</p>
                  </div>
                )}

                {/* Current vs New Values */}
                {(() => {
                  const oldData = parseJsonData(selectedRequest.old_data);
                  const newData = parseJsonData(selectedRequest.new_data);
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-800 mb-3">القيم الحالية</h4>
                          <div className="space-y-2 text-sm">
                            {oldData.title && <div><strong>العنوان:</strong> {oldData.title}</div>}
                            {oldData.description && <div><strong>الوصف:</strong> {oldData.description}</div>}
                            {oldData.start_date && <div><strong>تاريخ البداية:</strong> {oldData.start_date}</div>}
                            {oldData.end_date && <div><strong>تاريخ النهاية:</strong> {oldData.end_date}</div>}
                          </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-3">القيم الجديدة</h4>
                          <div className="space-y-2 text-sm">
                            {newData.title && <div><strong>العنوان:</strong> {newData.title}</div>}
                            {newData.description && <div><strong>الوصف:</strong> {newData.description}</div>}
                            {newData.start_date && <div><strong>تاريخ البداية:</strong> {newData.start_date}</div>}
                            {newData.end_date && <div><strong>تاريخ النهاية:</strong> {newData.end_date}</div>}
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="space-y-4">
                        {(oldData.learning_outcomes || newData.learning_outcomes) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {oldData.learning_outcomes && (
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-2">نواتج التعلم (الحالية)</h4>
                                <p className="text-blue-700 text-sm whitespace-pre-line">{oldData.learning_outcomes}</p>
                              </div>
                            )}
                            {newData.learning_outcomes && (
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-2">نواتج التعلم (الجديدة)</h4>
                                <p className="text-blue-700 text-sm whitespace-pre-line">{newData.learning_outcomes}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {(oldData.topics || newData.topics) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {oldData.topics && (
                              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h4 className="font-semibold text-purple-800 mb-2">المواضيع (الحالية)</h4>
                                <p className="text-purple-700 text-sm">{oldData.topics}</p>
                              </div>
                            )}
                            {newData.topics && (
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-2">المواضيع (الجديدة)</h4>
                                <p className="text-blue-700 text-sm">{newData.topics}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}

                {/* Action Section */}
                {selectedRequest.status === 'pending' && (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4">إجراءات المشرف</h4>
                    
                    {/* Approval Section */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="approval-notes" className="text-sm font-medium text-gray-700">
                          ملاحظات الموافقة (اختياري)
                        </Label>
                        <Textarea
                          id="approval-notes"
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          placeholder="أضف ملاحظات للموافقة..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleApprove}
                          disabled={actionLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          موافقة
                        </Button>
                      </div>
                    </div>

                    {/* Rejection Section */}
                    <div className="space-y-4 mt-6 pt-6 border-t border-gray-300">
                      <div>
                        <Label htmlFor="rejection-reason" className="text-sm font-medium text-gray-700">
                          سبب الرفض *
                        </Label>
                        <Textarea
                          id="rejection-reason"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="اذكر سبب رفض الطلب..."
                          className="mt-1"
                          rows={2}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="rejection-notes" className="text-sm font-medium text-gray-700">
                          ملاحظات إضافية (اختياري)
                        </Label>
                        <Textarea
                          id="rejection-notes"
                          value={rejectionNotes}
                          onChange={(e) => setRejectionNotes(e.target.value)}
                          placeholder="أضف ملاحظات إضافية..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleReject}
                          disabled={actionLoading || !rejectionReason.trim()}
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          رفض
                        </Button>
                      </div>
                    </div>
                  </div>
                )}


                {/* Supervisor Notes */}
                {selectedRequest.supervisor_notes && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">ملاحظات المشرف</h4>
                    <p className="text-yellow-700 text-sm">{selectedRequest.supervisor_notes}</p>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedRequest.rejection_reason && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">سبب الرفض</h4>
                    <p className="text-red-700 text-sm">{selectedRequest.rejection_reason}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Course Comparison Modal - Only show if no external handler provided */}
      {!onShowComparison && (
        <CourseComparisonModal
          isOpen={isComparisonOpen}
          onClose={() => {
            setIsComparisonOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onApprove={async (request, notes) => {
            if (!request) return;
            setActionLoading(true);
            try {
              await LiveCourseEditRequestsAPI.reviewEditRequest(request.id, {
                action: 'approve',
                supervisor_notes: notes || 'تم الموافقة على طلب التعديل'
              });
              toast.success('تم الموافقة على طلب التعديل بنجاح');
              loadRequests(currentPage);
              setIsComparisonOpen(false);
            } catch (error: any) {
              console.error('Error approving request:', error);
              toast.error(`حدث خطأ في الموافقة: ${error.message}`);
            } finally {
              setActionLoading(false);
            }
          }}
          onReject={async (request, reason) => {
            if (!request) return;
            setActionLoading(true);
            try {
              await LiveCourseEditRequestsAPI.reviewEditRequest(request.id, {
                action: 'reject',
                rejection_reason: reason || 'غير مناسب',
                supervisor_notes: 'تم رفض طلب التعديل'
              });
              toast.success('تم رفض طلب التعديل بنجاح');
              loadRequests(currentPage);
              setIsComparisonOpen(false);
            } catch (error: any) {
              console.error('Error rejecting request:', error);
              toast.error(`حدث خطأ في الرفض: ${error.message}`);
            } finally {
              setActionLoading(false);
            }
          }}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}
