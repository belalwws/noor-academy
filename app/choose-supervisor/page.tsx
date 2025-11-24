'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, BookOpen, CheckCircle, Loader2, AlertCircle, Home, Send, X } from 'lucide-react';
import { getApiUrl } from '@/lib/config';
import { Spinner } from '@/components/ui/spinner';

// ==================== Types ====================
interface AvailableSupervisor {
  id: string;
  user_name: string;
  user_email: string;
  profile_image_url?: string;
  department?: string;
  areas_of_responsibility?: string;
  supervised_teachers_count: number;
}

interface JoinRequestStatus {
  has_pending_request: boolean;
  is_active_teacher: boolean;
  pending_request: any;
  general_supervisor: any;
  academic_supervisor: any;
  can_create_request: boolean;
}

// ==================== Alert Components ====================
function PendingRequestAlert() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <CheckCircle className="flex-shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5" size={24} />
        <div className="text-right flex-1">
          <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">
            📝 طلبك قيد المراجعة
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-300 leading-relaxed">
            تم إرسال طلب الانضمام بنجاح. المشرف المختار مميز باللون الأصفر أدناه.
            <br />
            يمكنك إلغاء الطلب وإرسال طلب جديد لمشرف آخر إذا رغبت.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function WarningAlert() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto mb-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" size={24} />
        <div className="text-right">
          <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-2">
            ⚠️ تنبيه هام
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            يجب عليك التسجيل تحت مشرف عام للتمكن من الوصول إلى لوحة التحكم الخاصة بك.
            <br />
            لن تتمكن من إنشاء الدورات أو إدارة الطلاب حتى تقوم باختيار مشرف عام.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function MessageAlert({ type, message, onRefresh }: { type: 'error' | 'success'; message: string; onRefresh?: () => void }) {
  const isError = type === 'error';
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className={`mb-6 max-w-2xl mx-auto rounded-xl border px-4 py-3 ${
        isError 
          ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200'
          : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {isError ? (
          <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
        ) : (
          <CheckCircle className="mt-0.5 flex-shrink-0" size={18} />
        )}
        <p className="text-sm flex-1">{message}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs font-semibold underline hover:no-underline whitespace-nowrap"
          >
            تحديث
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ==================== Supervisor Card Component ====================
interface SupervisorCardProps {
  supervisor: AvailableSupervisor;
  index: number;
  hasPendingRequest: boolean;
  isPendingForThisSupervisor: boolean;
  submitting: boolean;
  onSelectSupervisor: (supervisor: AvailableSupervisor) => void;
  onCancelRequest: () => void;
}

function SupervisorCard({
  supervisor,
  index,
  hasPendingRequest,
  isPendingForThisSupervisor,
  submitting,
  onSelectSupervisor,
  onCancelRequest,
}: SupervisorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl transition-all"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-2xl font-bold">
          {supervisor.user_name?.charAt(0) || 'M'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            {supervisor.user_name}
          </h3>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
            <Mail size={14} />
            <span>{supervisor.user_email}</span>
          </div>
          {supervisor.department && (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
              <BookOpen size={14} />
              <span>{supervisor.department}</span>
            </div>
          )}
          {supervisor.areas_of_responsibility && (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <MapPin size={14} />
              <span>{supervisor.areas_of_responsibility}</span>
            </div>
          )}
        </div>
        
        {isPendingForThisSupervisor ? (
          <div className="w-full">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 mb-2">
              <div className="flex items-center justify-center gap-2 text-yellow-700 dark:text-yellow-300 text-sm font-bold mb-2">
                <CheckCircle size={20} />
                <span>✅ طلبك مُرسل لهذا المشرف</span>
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
                في انتظار موافقة المشرف
              </p>
            </div>
            <button
              onClick={onCancelRequest}
              disabled={submitting}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>جاري الإلغاء...</span>
                </>
              ) : (
                <>
                  <X size={18} />
                  <span>إلغاء وإرسال لمشرف آخر</span>
                </>
              )}
            </button>
          </div>
        ) : hasPendingRequest ? (
          <button
            disabled
            className="w-full bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold py-3 px-6 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
          >
            <AlertCircle size={18} />
            <span>لديك طلب معلق بالفعل</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectSupervisor(supervisor)}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            <span>تقديم طلب انضمام</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ==================== Request Modal Component ====================
interface RequestModalProps {
  supervisor: AvailableSupervisor;
  requestMessage: string;
  submitting: boolean;
  error: string;
  onClose: () => void;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
}

function RequestModal({
  supervisor,
  requestMessage,
  submitting,
  error,
  onClose,
  onMessageChange,
  onSubmit,
}: RequestModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-lg"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              طلب الانضمام للمشرف
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {supervisor.user_name}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Supervisor Info */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
            <Mail size={14} />
            <span>{supervisor.user_email}</span>
          </div>
          {supervisor.department && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
              <BookOpen size={14} />
              <span>{supervisor.department}</span>
            </div>
          )}
          {supervisor.areas_of_responsibility && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <User size={14} />
              <span>{supervisor.areas_of_responsibility}</span>
            </div>
          )}
        </div>

        {/* Request Message */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            رسالة الطلب <span className="text-red-500">*</span>
          </label>
          <textarea
            value={requestMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            disabled={submitting}
            rows={5}
            maxLength={500}
            placeholder="اكتب رسالة توضح فيها سبب رغبتك في الانضمام تحت إشراف هذا المشرف..."
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              اكتب رسالة واضحة ومهنية
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {requestMessage.length}/500
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-red-700 dark:text-red-200">
            <AlertCircle className="mt-0.5 flex-shrink-0" size={16} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إلغاء
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting || !requestMessage.trim()}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>جاري الإرسال...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>إرسال الطلب</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== Main Page Component ====================

export default function ChooseSupervisorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teacherId = searchParams.get('teacher_id');
  
  const [supervisors, setSupervisors] = useState<AvailableSupervisor[]>([]);
  const [joinStatus, setJoinStatus] = useState<JoinRequestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<AvailableSupervisor | null>(null);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    checkJoinStatus();
    fetchAvailableSupervisors();
  }, [router]);
  
  // Debug: Log joinStatus changes
  useEffect(() => {
    console.log('📊 joinStatus changed:', joinStatus);
  }, [joinStatus]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        console.log('⏰ Auto-hiding success message');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-hide error message after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        console.log('⏰ Auto-hiding error message');
        setError('');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('teacher_access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const checkJoinStatus = async () => {
    try {
      console.log('🔍 Checking join status...');
      const response = await fetch(
        getApiUrl('/teachers/join-request/status/'),
        { headers: getAuthHeaders() }
      );
      
      console.log('📡 Join status response status:', response.status);
      const data = await response.json();
      console.log('📦 Join status response data:', data);
      
      if (response.ok) {
        console.log('✅ Join status updated:', data.data);
        console.log('🔑 Has pending request:', data.data?.has_pending_request);
        console.log('🔑 Pending request object:', data.data?.pending_request);
        console.log('🔑 Pending request ID:', data.data?.pending_request?.id);
        console.log('🔑 Pending request ID type:', typeof data.data?.pending_request?.id);
        console.log('🔑 Full pending_request JSON:', JSON.stringify(data.data?.pending_request, null, 2));
        setJoinStatus(data.data);
        
        // If teacher is already active, redirect to dashboard
        if (data.data.is_active_teacher) {
          console.log('✅ Teacher is active, redirecting to dashboard');
          router.push('/dashboard/teacher');
          return;
        }
        
        return data.data; // Return the data for immediate use
      } else {
        console.error('❌ Join status check failed:', data);
      }
    } catch (err) {
      console.error('❌ Failed to check join status:', err);
    }
  };

  const fetchAvailableSupervisors = async (setLoadingState = true) => {
    try {
      console.log('📚 Fetching available supervisors...');
      const response = await fetch(
        getApiUrl('/teachers/join-request/available-supervisors/'),
        { headers: getAuthHeaders() }
      );
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Supervisors loaded:', data.data?.length || 0);
        setSupervisors(data.data || []);
      } else {
        console.error('❌ Failed to load supervisors:', data);
        setError('فشل في تحميل قائمة المشرفين');
      }
    } catch (err) {
      console.error('❌ Error fetching supervisors:', err);
      setError('حدث خطأ في الاتصال');
    } finally {
      if (setLoadingState) {
        setLoading(false);
      }
    }
  };

  const openModal = (supervisor: AvailableSupervisor) => {
    setSelectedSupervisor(supervisor);
    const dept = supervisor.department || 'التعليم';
    setRequestMessage(`أرغب في الانضمام كمعلم تحت إشرافكم. لدي خبرة في مجال ${dept} وأتطلع للعمل معكم.`);
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSupervisor(null);
    setRequestMessage('');
  };

  const handleSubmitRequest = async () => {
    if (!selectedSupervisor) {
      console.log('❌ No supervisor selected');
      return;
    }

    if (!requestMessage.trim()) {
      setError('يرجى كتابة رسالة الطلب');
      return;
    }

    console.log('📤 Submitting join request to supervisor:', selectedSupervisor.user_name);
    setSubmitting(true);
    setError('');

    try {
      const requestBody = {
        general_supervisor: selectedSupervisor.id,
        message: requestMessage.trim()
      };
      console.log('📦 Request body:', requestBody);
      
      const response = await fetch(
        getApiUrl('/teachers/join-request/create/'),
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(requestBody)
        }
      );

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok) {
        console.log('✅ Join request created successfully:', data);
        
        // Close modal first
        closeModal();
        
        // Show success message
        setSuccess('تم إرسال طلبك بنجاح! سيتم مراجعته من قبل المشرف.');
        
        // Reload status to show pending request screen
        console.log('🔄 Reloading join status...');
        setLoading(true); // Show loading while fetching status
        const updatedStatus = await checkJoinStatus();
        console.log('✅ Status reloaded:', updatedStatus);
        setLoading(false); // Hide loading after status is fetched
        
        // Reload supervisors list
        await fetchAvailableSupervisors();
      } else {
        console.error('❌ Request failed:', data);
        throw new Error(data.detail || data.message || 'فشل في إرسال الطلب');
      }
    } catch (err: any) {
      console.error('❌ Error submitting request:', err);
      setError(err.message || 'حدث خطأ ما');
    } finally {
      setSubmitting(false);
      console.log('✅ Submit process completed');
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Refreshing data...');
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await checkJoinStatus();
      await fetchAvailableSupervisors();
      console.log('✅ Data refreshed successfully');
    } catch (err) {
      console.error('❌ Failed to refresh data:', err);
      setError('فشل في تحديث البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    console.log('🗑️ handleCancelRequest called');
    console.log('📊 Full joinStatus:', JSON.stringify(joinStatus, null, 2));
    console.log('📊 pending_request:', joinStatus?.pending_request);
    console.log('📊 pending_request.id:', joinStatus?.pending_request?.id);
    console.log('📊 pending_request keys:', joinStatus?.pending_request ? Object.keys(joinStatus.pending_request) : 'N/A');
    
    // Check if there's a pending request
    if (!joinStatus?.has_pending_request || !joinStatus?.pending_request) {
      console.log('❌ No pending request to cancel');
      console.log('❌ has_pending_request:', joinStatus?.has_pending_request);
      console.log('❌ pending_request:', joinStatus?.pending_request);
      setError('لا يوجد طلب معلق لإلغائه. يرجى تحديث الصفحة.');
      return;
    }

    // Check if request has ID
    const requestId = joinStatus.pending_request.id;
    console.log('🔍 Extracted requestId:', requestId);
    console.log('🔍 requestId type:', typeof requestId);
    console.log('🔍 requestId is falsy?', !requestId);
    
    if (!requestId) {
      console.log('❌ Pending request has no ID');
      console.log('❌ pending_request full data:', JSON.stringify(joinStatus.pending_request, null, 2));
      console.log('❌ All keys in pending_request:', Object.keys(joinStatus.pending_request));
      console.log('❌ All values:', Object.values(joinStatus.pending_request));
      setError('خطأ: الطلب المعلق لا يحتوي على معرف. يرجى تحديث الصفحة.');
      // Try to reload status
      await checkJoinStatus();
      return;
    }

    // Check if request status is pending
    if (joinStatus.pending_request.status && joinStatus.pending_request.status !== 'pending') {
      console.log('❌ Request is not pending:', joinStatus.pending_request.status);
      setError(`لا يمكن إلغاء الطلب. الحالة الحالية: ${joinStatus.pending_request.status_display || joinStatus.pending_request.status}`);
      await checkJoinStatus();
      return;
    }

    if (!confirm('هل أنت متأكد من إلغاء الطلب؟ \nستتمكن من إرسال طلب جديد لمشرف آخر بعد الإلغاء.')) {
      console.log('ℹ️ User cancelled the cancellation');
      return;
    }

    console.log('🗑️ Cancelling request:', joinStatus.pending_request.id);
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const cancelUrl = getApiUrl(`/teachers/join-request/${requestId}/cancel/`);
      console.log('🔗 Cancel URL:', cancelUrl);
      
      const response = await fetch(cancelUrl, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      console.log('📡 Cancel response status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('📦 Cancel response data:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        throw new Error('فشل في قراءة الاستجابة من السيرفر');
      }

      if (response.ok) {
        console.log('✅ Request cancelled successfully');
        
        // Clear the join status immediately
        setJoinStatus({
          has_pending_request: false,
          is_active_teacher: false,
          pending_request: null,
          general_supervisor: null,
          academic_supervisor: null,
          can_create_request: true
        });
        
        setSuccess('✅ تم إلغاء الطلب بنجاح! يمكنك الآن إرسال طلب جديد.');
        
        // Reload status and supervisors in background
        console.log('🔄 Reloading status and supervisors...');
        await checkJoinStatus();
        await fetchAvailableSupervisors(false); // Don't set loading state
        console.log('✅ Data reloaded');
      } else {
        // Handle different error cases
        let errorMsg = 'فشل في إلغاء الطلب';
        
        if (response.status === 404) {
          errorMsg = 'لم يتم العثور على الطلب. قد يكون تم إلغاؤه أو معالجته مسبقاً.';
          // Reload status to get updated data
          await checkJoinStatus();
        } else if (response.status === 400) {
          errorMsg = data?.detail || data?.message || 'لا يمكن إلغاء الطلب. قد يكون تمت معالجته بالفعل.';
          // Reload status to get updated data
          await checkJoinStatus();
        } else if (response.status === 403) {
          errorMsg = 'ليس لديك صلاحية لإلغاء هذا الطلب.';
        } else {
          errorMsg = data?.detail || data?.message || data?.error || 'فشل في إلغاء الطلب';
        }
        
        console.error('❌ Cancel failed:', errorMsg, 'Status:', response.status);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ Error cancelling request:', err);
      const errorMessage = err.message || 'فشل في إلغاء الطلب. يرجى المحاولة مرة أخرى.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 px-4 pt-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Roshd Logo" width={80} height={80} className="rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-900 to-orange-900 dark:from-amber-300 dark:to-orange-300 bg-clip-text text-transparent mb-2">
            اختر المشرف العام المناسب
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            اختر المشرف العام الذي يتناسب مع تخصصك ومنطقتك
          </p>
          
          {/* Alerts */}
          {joinStatus?.has_pending_request && <PendingRequestAlert />}
          {!joinStatus?.has_pending_request && <WarningAlert />}
        </motion.div>

        {/* Messages */}
        {error && <MessageAlert type="error" message={error} onRefresh={handleRefresh} />}
        {success && <MessageAlert type="success" message={success} />}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supervisors.map((supervisor, index) => (
              <SupervisorCard
                key={supervisor.id}
                supervisor={supervisor}
                index={index}
                hasPendingRequest={joinStatus?.has_pending_request || false}
                isPendingForThisSupervisor={joinStatus?.pending_request?.general_supervisor === supervisor.id}
                submitting={submitting}
                onSelectSupervisor={openModal}
                onCancelRequest={handleCancelRequest}
              />
            ))}
          </div>
        )}

        {!loading && supervisors.length === 0 && (
          <div className="text-center py-20">
            <AlertCircle className="mx-auto mb-4 text-slate-400" size={48} />
            <p className="text-slate-600 dark:text-slate-400">لا يوجد مشرفين متاحين حالياً</p>
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-semibold">
            <Home size={20} />
            <span>العودة للرئيسية</span>
          </Link>
        </motion.div>
      </div>

      {/* Modal for Request Message */}
      {showModal && selectedSupervisor && (
        <RequestModal
          supervisor={selectedSupervisor}
          requestMessage={requestMessage}
          submitting={submitting}
          error={error}
          onClose={closeModal}
          onMessageChange={setRequestMessage}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  );
}


