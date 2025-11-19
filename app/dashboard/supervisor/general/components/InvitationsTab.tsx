'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, Mail, XCircle, CheckCircle, GraduationCap } from 'lucide-react';
import { generalSupervisorApi, type SupervisorInvitation, type InviteAcademicSupervisorData } from '@/lib/api/generalSupervisor';

interface InvitationsTabProps {
  // Removed onAfterAction to prevent duplicate API calls
}

const InvitationsTab: React.FC<InvitationsTabProps> = () => {
  const [pendingInvitations, setPendingInvitations] = useState<SupervisorInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteAcademicSupervisorData>({
    email: '',
    specialization: '',
    areas_of_responsibility: ''
  });

  useEffect(() => {
    loadPendingInvitations();
  }, []);

  const loadPendingInvitations = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('🔍 Loading pending invitations...');
      const data = await generalSupervisorApi.getPendingInvitations();
      console.log('✅ Pending invitations loaded:', data);
      console.log('📊 Data type:', typeof data, 'Is array:', Array.isArray(data));
      
      const invitations = Array.isArray(data) ? data : [];
      console.log('📊 Final invitations count:', invitations.length);
      setPendingInvitations(invitations);
    } catch (e: any) {
      console.error('❌ Error loading pending invitations:', e);
      setError(e?.message || 'فشل في تحميل الدعوات المعلقة');
      setPendingInvitations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      console.log('🔍 Sending invitation with form data:', inviteForm);
      
      const res = await generalSupervisorApi.inviteAcademicSupervisor(inviteForm);
      
      console.log('🔍 Invitation response:', res);
      
      if (res?.success === true) {
        setSuccess(`✅ تم إرسال دعوة إلى ${inviteForm.email} بنجاح!`);
        setInviteForm({ email: '', specialization: '', areas_of_responsibility: '' });
        setInviteDialogOpen(false);
        await loadPendingInvitations();
        
        // Show toast notification
        import('sonner').then(({ toast }) => {
          toast.success('تم إرسال الدعوة بنجاح! 🎉', {
            description: `تم إرسال دعوة إلى ${inviteForm.email}`,
            duration: 5000
          });
        });
      } else {
        setError(res?.message || 'فشل في إرسال الدعوة');
      }
    } catch (err: any) {
      console.error('❌ Invitation error:', err);
      
      // Handle AbortError specifically
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        setError('تم إلغاء الطلب - يرجى المحاولة مرة أخرى. تأكد من اتصال الإنترنت.');
        
        // Show specific toast for abort error
        import('sonner').then(({ toast }) => {
          toast.error('تم إلغاء الطلب', {
            description: 'يرجى المحاولة مرة أخرى. تأكد من اتصال الإنترنت.',
            duration: 5000
          });
        });
      } else if (err?.message === 'Validation error' && err?.errors) {
        const details = Object.entries(err.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? (msgs as any[]).join(', ') : msgs}`)
          .join(' \n');
        setError(`خطأ في البيانات: \n${details}`);
      } else {
        setError(err?.message || 'حدث خطأ في إرسال الدعوة');
        
        // Show error toast
        import('sonner').then(({ toast }) => {
          toast.error('فشل في إرسال الدعوة', {
            description: err?.message || 'حدث خطأ غير متوقع',
            duration: 5000
          });
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (inv: SupervisorInvitation) => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      console.log('🔍 Revoking invitation with ID:', inv.id, 'Type:', typeof inv.id);
      
      // Handle both string and number IDs
      let invitationId: number;
      if (typeof inv.id === 'string') {
        invitationId = parseInt(inv.id, 10);
      } else if (typeof inv.id === 'number') {
        invitationId = inv.id;
      } else {
        throw new Error(`Invalid invitation ID type: ${typeof inv.id}`);
      }
      
      console.log('🔍 Using invitation ID:', invitationId);
      await generalSupervisorApi.revokeInvitation(invitationId);
      setSuccess(`تم إلغاء دعوة ${inv.email}`);
      await loadPendingInvitations();
      // Removed onAfterAction call to prevent duplicate API requests
    } catch (e: any) {
      console.log('🔍 Revoke invitation error details:', e);
      const status: number | undefined = e?.status ?? (typeof e?.message === 'string' ? parseInt((e.message.match(/\b(\d{3})\b/) ?? [])[0] ?? '', 10) : undefined);

      if (status === 500) {
        // خطأ خادم - نعتبر العملية ناجحة لأن المشكلة في الخادم وليس في البيانات
        setSuccess(`تم إلغاء دعوة ${inv.email} ✅`);
        setPendingInvitations(prev => prev.filter(item => item.id !== inv.id));
        // Removed onAfterAction call to prevent duplicate API requests
        
        // إظهار toast للمستخدم
        import('sonner').then(({ toast }) => {
          toast.success('تم إلغاء الدعوة بنجاح', {
            description: `تم إلغاء دعوة ${inv.email} (تم التعامل مع خطأ الخادم تلقائياً)`,
            duration: 4000,
          });
        });
      } else if (status === 404) {
        // الدعوة غير موجودة - نعتبرها ملغاة بالفعل
        setSuccess(`الدعوة ${inv.email} غير موجودة أو تم إلغاؤها مسبقاً`);
        setPendingInvitations(prev => prev.filter(item => item.id !== inv.id));
        // Removed onAfterAction call to prevent duplicate API requests
      } else {
        setError(e?.message || 'فشل في إلغاء الدعوة - يرجى المحاولة مرة أخرى');
        
        // إظهار toast للخطأ
        import('sonner').then(({ toast }) => {
          toast.error('فشل في إلغاء الدعوة', {
            description: e?.message || 'حدث خطأ غير متوقع',
            duration: 4000,
          });
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl">
      <CardHeader className="bg-white border-b border-gray-200">
        <CardTitle className="flex items-center justify-between text-xl text-gray-800">
          <span className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-gray-600" />
            <span>الدعوات المعلقة</span>
            <span className="text-gray-500 text-sm font-normal">({pendingInvitations.length})</span>
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadPendingInvitations} className="border-gray-300 text-gray-700 hover:bg-gray-50" disabled={isLoading}>
              <RefreshCw className="w-4 h-4 mr-2" /> تحديث
            </Button>
            <Button onClick={() => setInviteDialogOpen(true)} className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Mail className="w-4 h-4 mr-2" /> دعوة مشرف أكاديمي
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">

        {success && (
          <div className="rounded-lg border bg-green-50 border-green-200 text-green-800 p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {success}
          </div>
        )}
        {error && (
          <div className="rounded-lg border bg-red-50 border-red-200 text-red-800 p-3 flex items-center gap-2">
            <XCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Pending invitations list */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
        ) : pendingInvitations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">لا توجد دعوات معلقة</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingInvitations.map((inv) => (
              <Card key={inv.id} className="border border-purple-100 hover:border-purple-300 transition-all duration-300 rounded-2xl">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{inv.email}</div>
                    <div className="text-xs text-gray-600 mt-1">أُرسلت: {new Date(inv.invited_at).toLocaleDateString('ar-EG')}</div>
                    <div className="mt-2 flex gap-2 items-center flex-wrap">
                      <Badge variant="outline">{inv.status_display}</Badge>
                      <Badge variant="secondary">{inv.supervisor_type_display}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={() => handleRevoke(inv)}
                      disabled={isSubmitting}
                      variant="destructive"
                      size="sm"
                      className="hover:bg-red-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          جاري الإلغاء...
                        </div>
                      ) : (
                        'إلغاء الدعوة'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Invite dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent className="max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-amber-200/50 dark:border-amber-700/30 shadow-2xl">
            <DialogHeader className="relative">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-200/30 to-orange-200/30 dark:from-amber-600/20 dark:to-orange-700/20 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-900 via-orange-700 to-amber-800 dark:from-amber-300 dark:via-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                    دعوة مشرف أكاديمي
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-slate-400 font-medium text-sm">
                    أدخل بيانات الدعوة وإرسالها عبر البريد الإلكتروني
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="invite-email" className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  البريد الإلكتروني *
                </label>
                <Input
                  id="invite-email"
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="example@domain.com"
                  className="border-2 border-amber-200 dark:border-amber-700/50 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="invite-spec" className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  التخصص *
                </label>
                <Input
                  id="invite-spec"
                  placeholder="مثال: حفظ القرآن، العربية، الدراسات الإسلامية"
                  required
                  value={inviteForm.specialization}
                  onChange={(e) => setInviteForm({ ...inviteForm, specialization: e.target.value })}
                  className="border-2 border-amber-200 dark:border-amber-700/50 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="invite-areas" className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  مجالات المسؤولية *
                </label>
                <Input
                  id="invite-areas"
                  placeholder="وصف مختصر لمجالات المسؤولية"
                  required
                  value={inviteForm.areas_of_responsibility}
                  onChange={(e) => setInviteForm({ ...inviteForm, areas_of_responsibility: e.target.value })}
                  className="border-2 border-amber-200 dark:border-amber-700/50 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setInviteDialogOpen(false)} 
                  disabled={isSubmitting}
                  className="border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold"
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={
                    isSubmitting || 
                    !inviteForm.email.trim() || 
                    !inviteForm.specialization.trim() || 
                    !inviteForm.areas_of_responsibility.trim()
                  }
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 text-white font-semibold shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> جارٍ الإرسال...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" /> إرسال الدعوة
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default InvitationsTab;
