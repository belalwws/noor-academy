'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Users, Clock, CheckCircle, XCircle, GraduationCap, Calendar, Power } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { generalSupervisorApi } from '@/lib/api/generalSupervisor';
import { notificationService } from '@/lib/notificationService';

interface TeacherListItem {
  id: number;
  user_name: string;
  user_email: string;
  specialization: string;
  specialization_display: string;
  approval_status: string;
  approval_status_display: string;
  academic_supervisor?: number;
  academic_supervisor_name?: string;
  years_of_experience: number;
  created_at: string;
  approved_at?: string;
  relationship_id?: number | null;
}

interface AcademicSupervisorListItem {
  id: number;
  user_name: string;
  specialization: string;
}

interface TeachersTabProps {
  // Removed onRefreshTeachers to prevent duplicate API calls
}

const TeachersTab: React.FC<TeachersTabProps> = () => {
  const [pendingTeachers, setPendingTeachers] = useState<TeacherListItem[]>([]);
  const [approvedTeachers, setApprovedTeachers] = useState<TeacherListItem[]>([]);
  const [academicSupervisors, setAcademicSupervisors] = useState<AcademicSupervisorListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const [teacherActionDialog, setTeacherActionDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherListItem | null>(null);
  const [teacherAction, setTeacherAction] = useState<'approve' | 'reject'>('approve');
  const [teacherActionForm, setTeacherActionForm] = useState({
    academic_supervisor_id: '',
    approval_notes: '',
    rejection_reason: ''
  });

  useEffect(() => {
    void loadTeachersData();
  }, []);

  const loadTeachersData = async () => {
    try {
      setIsLoading(true);
      const [pending, approved, supervisors] = await Promise.all([
        generalSupervisorApi.getPendingTeachers(),
        generalSupervisorApi.getApprovedTeachers(),
        generalSupervisorApi.getAcademicSupervisors(),
      ]);
      setPendingTeachers(Array.isArray(pending) ? pending : []);
      setApprovedTeachers(Array.isArray(approved) ? approved : []);
      setAcademicSupervisors(Array.isArray(supervisors) ? supervisors : []);
    } catch (error) {
      console.error('Error loading teachers data:', error);
      setPendingTeachers([]);
      setApprovedTeachers([]);
      setAcademicSupervisors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openTeacherDialog = (teacher: TeacherListItem, action: 'approve' | 'reject') => {
    setSelectedTeacher(teacher);
    setTeacherAction(action);
    setTeacherActionDialog(true);
    setTeacherActionForm({ academic_supervisor_id: '', approval_notes: '', rejection_reason: '' });
  };

  const handleActivateApprovedTeachers = async () => {
    try {
      setIsActivating(true);
      
      const result = await generalSupervisorApi.activateApprovedTeachers();
      
      if (result.success) {
        toast.success(`✅ تم تفعيل ${result.activated_count || 0} مدرس بنجاح!`, {
          description: 'المدرسين المعتمدين أصبحوا قادرين على تسجيل الدخول',
          duration: 5000
        });
        
        // Refresh the data
        await loadTeachersData();
      } else {
        toast.error(result.error || 'حدث خطأ أثناء تفعيل المدرسين');
      }
    } catch (error) {
      console.error('Error activating teachers:', error);
      toast.error('حدث خطأ أثناء تفعيل المدرسين');
    } finally {
      setIsActivating(false);
    }
  };

  const handleTeacherActionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTeacher) return;

    try {
      setIsSubmitting(true);

      // Use teacher ID directly as per API documentation
      const teacherId = selectedTeacher.id;

      if (teacherAction === 'approve') {
        // Validate that academic supervisor is selected
        if (!teacherActionForm.academic_supervisor_id.trim()) {
          toast.error('يجب اختيار مشرف أكاديمي للمدرس');
          return;
        }

        console.log('🔍 Approving teacher:', {
          teacherId,
          teacherName: selectedTeacher.user_name,
          academicSupervisorId: teacherActionForm.academic_supervisor_id,
          approvalNotes: teacherActionForm.approval_notes
        });

        const result = await generalSupervisorApi.approveTeacher(teacherId, {
          academic_supervisor_id: parseInt(teacherActionForm.academic_supervisor_id, 10),
          approval_notes: teacherActionForm.approval_notes,
        });
        
        console.log('🔍 Approval result:', result);
        
        // Check if the API call was successful (handle different response formats)
        if (result && (result.success === true || result.status === 'success' || result.message)) {
          toast.success(`✅ تم اعتماد ${selectedTeacher.user_name} بنجاح!`, {
            description: `تم تعيين المشرف الأكاديمي للمدرس`,
            duration: 5000
          });
          
          // Send notification about teacher approval
          try {
            notificationService.teacherEvents.approved(selectedTeacher.id.toString(), selectedTeacher.user_name);
          } catch (notificationError) {
            console.warn('Notification error:', notificationError);
          }
        } else {
          console.error('❌ Approval failed:', result);
          toast.error(result?.error || result?.message || 'حدث خطأ أثناء اعتماد المدرس');
          return;
        }
      } else {
        console.log('🔍 Rejecting teacher:', {
          teacherId,
          teacherName: selectedTeacher.user_name,
          rejectionReason: teacherActionForm.rejection_reason
        });

        const result = await generalSupervisorApi.rejectTeacher(teacherId, {
          rejection_reason: teacherActionForm.rejection_reason,
        });
        
        console.log('🔍 Rejection result:', result);
        
        // Check if the API call was successful (handle different response formats)
        if (result && (result.success === true || result.status === 'success' || result.message)) {
          toast.success(`❌ تم رفض ${selectedTeacher.user_name}`, {
            description: `تم رفض طلب المعلم بنجاح`,
            duration: 5000
          });
          
          // Send notification about teacher rejection
          try {
            notificationService.teacherEvents.rejected(selectedTeacher.id.toString(), selectedTeacher.user_name);
          } catch (notificationError) {
            console.warn('Notification error:', notificationError);
          }
        } else {
          console.error('❌ Rejection failed:', result);
          toast.error(result?.error || result?.message || 'حدث خطأ أثناء رفض المدرس');
          return;
        }
      }

      setTeacherActionDialog(false);
      setSelectedTeacher(null);
      setTeacherActionForm({ academic_supervisor_id: '', approval_notes: '', rejection_reason: '' });
      
      // Refresh the data
      await loadTeachersData();
      
      // Show additional success message after data refresh
      if (teacherAction === 'approve') {
        toast.success(`🎉 تم تحديث قائمة المعلمين - ${selectedTeacher?.user_name} أصبح معتمداً`, {
          duration: 3000
        });
      } else {
        toast.success(`🔄 تم تحديث قائمة المعلمين - تم رفض ${selectedTeacher?.user_name}`, {
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error processing teacher:', error);
      toast.error('حدث خطأ أثناء معالجة الطلب.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingSummary = useMemo(() => pendingTeachers.length, [pendingTeachers]);
  const approvedSummary = useMemo(() => approvedTeachers.length, [approvedTeachers]);

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 space-y-4"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 dark:from-amber-600/20 dark:to-orange-700/20 rounded-full blur-2xl"
          />
          <Spinner size="lg" />
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-slate-300">جارٍ تحميل بيانات المدرسين...</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-amber-50/80 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-amber-900/20 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-700/30 shadow-lg overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-200/20 dark:from-amber-600/20 dark:to-orange-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/20 to-amber-200/30 dark:from-orange-600/10 dark:to-amber-700/20 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-900 via-orange-700 to-amber-800 dark:from-amber-300 dark:via-orange-400 dark:to-amber-400 bg-clip-text text-transparent mb-2">
            إدارة المدرسين
          </h2>
          <p className="text-gray-700 dark:text-slate-300 font-medium">اعتماد المعلمين الجدد وإدارة المعتمدين</p>
        </div>
      </motion.div>

      <Tabs defaultValue="pending" className="space-y-4" dir="rtl">
        <TabsList className="inline-flex h-14 w-full items-center justify-start rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-2 gap-2 border-2 border-amber-200/50 dark:border-amber-800/40 shadow-lg overflow-hidden">
          <TabsTrigger 
            value="pending" 
            className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">طلبات معلقة ({pendingSummary})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="approved" 
            className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:via-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-green-50/60 dark:data-[state=inactive]:hover:bg-green-950/30 data-[state=inactive]:hover:text-green-700 dark:data-[state=inactive]:hover:text-green-400"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">مدرسين معتمدين ({approvedSummary})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-700/50">
            <div className="p-6">
          {pendingTeachers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <Clock className="w-16 h-16 text-amber-400 dark:text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-slate-300 mb-2">لا توجد طلبات معلقة</h3>
              <p className="text-gray-500 dark:text-slate-400">جميع طلبات الاعتماد تمت مراجعتها</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingTeachers.map((teacher, index) => (
                <motion.div 
                  key={teacher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200/50 dark:border-amber-700/30 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 to-orange-100/80 dark:from-amber-900/20 dark:to-orange-900/20 opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-200/30 to-orange-300/30 dark:from-amber-600/20 dark:to-orange-700/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 dark:from-amber-500 dark:to-orange-700 rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 text-white font-bold">
                          {teacher.user_name?.charAt(0) ?? 'م'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors duration-300">{teacher.user_name}</h3>
                        <p className="text-gray-600 dark:text-slate-400 text-sm">{teacher.user_email}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">التخصص</p>
                        <p className="font-medium text-gray-800 dark:text-slate-100">{teacher.specialization_display}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
                          <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">سنوات الخبرة</p>
                          <p className="font-medium text-gray-800 dark:text-slate-100">{teacher.years_of_experience}</p>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
                          <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">تاريخ التقديم</p>
                          <p className="font-medium text-gray-800 dark:text-slate-100 text-sm">{new Date(teacher.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full text-sm font-medium border border-amber-200 dark:border-amber-700">
                          <Clock className="w-3 h-3" />
                          {teacher.approval_status_display}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.div className="flex-1">
                        <Button 
                          onClick={() => openTeacherDialog(teacher, 'approve')} 
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> اعتماد
                        </Button>
                      </motion.div>
                      <motion.div className="flex-1">
                        <Button 
                          variant="destructive" 
                          onClick={() => openTeacherDialog(teacher, 'reject')}
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <XCircle className="w-4 h-4 mr-2" /> رفض
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-700/50">
            <div className="p-6">
              {/* Activate Button */}
              <div className="mb-6 flex justify-end">
                <motion.div>
                  <Button 
                    onClick={handleActivateApprovedTeachers}
                    disabled={isActivating || approvedTeachers.length === 0}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 dark:from-green-600 dark:to-emerald-700 dark:hover:from-green-700 dark:hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isActivating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> جارٍ التفعيل...
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-2" /> تفعيل جميع المدرسين المعتمدين
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
              
          {approvedTeachers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <CheckCircle className="w-16 h-16 text-amber-400 dark:text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-slate-300 mb-2">لا يوجد مدرسون معتمدون</h3>
              <p className="text-gray-500 dark:text-slate-400">لم يتم اعتماد أي مدرس بعد</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {approvedTeachers.map((teacher, index) => (
                <motion.div 
                  key={teacher.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200/50 dark:border-amber-700/30 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 to-orange-100/70 dark:from-amber-900/15 dark:to-orange-900/15 opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-200/30 to-orange-300/30 dark:from-amber-600/20 dark:to-orange-700/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 dark:from-amber-500 dark:to-orange-700 rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                        <div className="relative w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 text-white font-bold">
                          {teacher.user_name?.charAt(0) ?? 'م'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors duration-300">{teacher.user_name}</h3>
                        <p className="text-gray-600 dark:text-slate-400 text-xs">{teacher.user_email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
                        <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">التخصص</p>
                        <p className="font-medium text-sm text-gray-800 dark:text-slate-100">{teacher.specialization_display}</p>
                      </div>

                      {teacher.academic_supervisor_name && (
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
                          <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">المشرف الأكاديمي</p>
                          <p className="font-medium text-sm text-gray-800 dark:text-slate-100">{teacher.academic_supervisor_name}</p>
                        </div>
                      )}

                      {teacher.approved_at && (
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
                          <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">تاريخ الاعتماد</p>
                          <p className="font-medium text-sm text-gray-800 dark:text-slate-100">{new Date(teacher.approved_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                      )}

                      <div className="text-center pt-2">
                        <span className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-700">
                          <CheckCircle className="w-3 h-3" />
                          معتمد ونشط
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action dialog */}
      <Dialog open={teacherActionDialog} onOpenChange={setTeacherActionDialog}>
        <DialogContent className="max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-amber-200/50 dark:border-amber-700/30 shadow-2xl">
          <DialogHeader className="relative">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-200/30 to-orange-200/30 dark:from-amber-600/20 dark:to-orange-700/20 rounded-full blur-2xl" />
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-900 via-orange-700 to-amber-800 dark:from-amber-300 dark:via-orange-400 dark:to-amber-400 bg-clip-text text-transparent relative z-10">
              {teacherAction === 'approve' ? 'اعتماد المدرس' : 'رفض المدرس'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-slate-400 font-medium relative z-10">
              {selectedTeacher ? `المدرس: ${selectedTeacher.user_name}` : ''}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTeacherActionSubmit} className="space-y-5">
            {teacherAction === 'approve' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    اختر المشرف الأكاديمي *
                  </label>
                  <Select
                    value={teacherActionForm.academic_supervisor_id}
                    onValueChange={(value) =>
                      setTeacherActionForm((prev) => ({
                        ...prev,
                        academic_supervisor_id: value,
                      }))
                    }
                    required
                  >
                    <SelectTrigger className="border-2 border-amber-200 dark:border-amber-700/50 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600">
                      <SelectValue placeholder="اختر المشرف الأكاديمي" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-amber-700/50">
                      {academicSupervisors.map((supervisor) => (
                        <SelectItem 
                          key={supervisor.id} 
                          value={supervisor.id.toString()}
                          className="text-gray-900 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:bg-amber-100 dark:focus:bg-amber-900/30"
                        >
                          {supervisor.user_name} – {supervisor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">ملاحظات المشرف (اختياري)</label>
                  <Textarea
                    value={teacherActionForm.approval_notes}
                    onChange={(event) =>
                      setTeacherActionForm((prev) => ({
                        ...prev,
                        approval_notes: event.target.value,
                      }))
                    }
                    placeholder="أضف ملاحظات إذا لزم الأمر..."
                    className="border-2 border-amber-200 dark:border-amber-700/50 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">سبب الرفض *</label>
                <Textarea
                  value={teacherActionForm.rejection_reason}
                  onChange={(event) =>
                    setTeacherActionForm((prev) => ({
                      ...prev,
                      rejection_reason: event.target.value,
                    }))
                  }
                  placeholder="اذكر السبب بوضوح..."
                  required
                  className="border-2 border-red-200 dark:border-red-700/50 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-600 resize-none"
                  rows={4}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setTeacherActionDialog(false)} 
                  disabled={isSubmitting}
                  className="border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold"
                >
                  إلغاء
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className={teacherAction === 'approve' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 text-white font-semibold shadow-lg' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white font-semibold shadow-lg'}
                  disabled={isSubmitting || 
                    (teacherAction === 'reject' && !teacherActionForm.rejection_reason.trim()) ||
                    (teacherAction === 'approve' && !teacherActionForm.academic_supervisor_id.trim())
                  }
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> جارٍ المعالجة...
                    </>
                  ) : teacherAction === 'approve' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" /> اعتماد المدرس
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" /> رفض الطلب
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeachersTab;





