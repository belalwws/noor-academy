'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Users, CheckCircle, XCircle, User } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

interface FamilyRequestsTabProps {
  // Removed onAfterAction to prevent duplicate API calls
}

const FamilyRequestsTab: React.FC<FamilyRequestsTabProps> = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      // Placeholder - API not implemented yet
      setRequests([]);
    } catch (error) {
      console.error('Error loading family requests:', error);
      toast.error('فشل في تحميل طلبات العائلات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = (request: any, actionType: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setAction(actionType);
    setNotes('');
    setActionDialog(true);
  };

  const submitAction = async () => {
    if (!selectedRequest) return;
    
    try {
      setSubmitting(true);
      
      // Placeholder - API not implemented yet
      if (action === 'approve') {
        toast.success('تم قبول طلب العائلة بنجاح');
      } else {
        toast.success('تم رفض طلب العائلة');
      }
      
      setActionDialog(false);
      loadRequests();
      // Removed onAfterAction call to prevent duplicate API requests
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ في العملية');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" tone="muted" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">لا توجد طلبات عائلات معلقة</h3>
        <p className="text-gray-500 dark:text-gray-400">جميع الطلبات تم مراجعتها</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {requests.map((request) => (
          <Card key={request.id} className="group relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 dark:from-purple-950/30 to-pink-100 dark:to-pink-950/30 opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-pink-300/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <CardContent className="relative p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors duration-300">
                    عائلة {request.family_name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{request.course_title}</p>
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>مقدم الطلب: {request.submitted_by_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>عدد الأعضاء: {request.member_count}</span>
                    </div>
                    <div className="mt-3">
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                        {request.status_display}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => handleAction(request, 'approve')}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  قبول
                </Button>
                <Button
                  onClick={() => handleAction(request, 'reject')}
                  variant="destructive"
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  رفض
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialog} onOpenChange={setActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'قبول طلب العائلة' : 'رفض طلب العائلة'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                عائلة {selectedRequest?.family_name}
              </p>
            </div>
            <div>
              <Textarea
                placeholder={action === 'approve' ? 'ملاحظات الموافقة (اختياري)' : 'سبب الرفض *'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required={action === 'reject'}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setActionDialog(false)}
                disabled={submitting}
              >
                إلغاء
              </Button>
              <Button
                onClick={submitAction}
                disabled={submitting || (action === 'reject' && !notes.trim())}
                className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {submitting ? (
                  <Spinner size="sm" tone="contrast" className="mr-2" />
                ) : null}
                {action === 'approve' ? 'قبول' : 'رفض'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FamilyRequestsTab;





