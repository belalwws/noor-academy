import React, { useState, useEffect } from 'react';
import { X, ArrowRight, BookOpen, Clock, Users, Calendar, User, Mail, Award, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { courseDetailsAPI, CourseDetails, CourseEditRequestDetails, Lesson } from '@/lib/api/course-details';

interface CourseComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onApprove?: (request: any, notes?: string) => void;
  onReject?: (request: any, reason?: string) => void;
  isLoading?: boolean;
}

export const CourseComparisonModal: React.FC<CourseComparisonModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
  isLoading = false
}) => {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showLessonsComparison, setShowLessonsComparison] = useState(false);
  
  // New state for API data
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [editRequestDetails, setEditRequestDetails] = useState<CourseEditRequestDetails | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && request?.id && request?.course) {
      loadComparisonData();
    }
  }, [isOpen, request?.id, request?.course]);

  const loadComparisonData = async () => {
    if (!request?.id || !request?.course) return;
    
    setLoadingData(true);
    setDataError(null);
    
    try {
      const data = await courseDetailsAPI.getCourseComparisonData(request.course, request.id);
      setCourseDetails(data.courseDetails);
      setEditRequestDetails(data.editRequestDetails);
    } catch (error: any) {
      console.error('Error loading comparison data:', error);
      setDataError(error.message || 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoadingData(false);
    }
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove(request, approvalNotes);
      setShowApprovalForm(false);
      setApprovalNotes('');
      onClose();
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(request, rejectionReason);
      setShowRejectionForm(false);
      setRejectionReason('');
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'معلقة';
      case 'approved': return 'موافق عليها';
      case 'rejected': return 'مرفوضة';
      default: return 'غير محددة';
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

  // Helper function to safely convert values to string
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20 backdrop-blur-md">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-6 rounded-t-3xl shadow-lg">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-3 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-start gap-4 pr-12">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">مقارنة تفاصيل الدورة</h2>
              <div className="flex items-center gap-4 text-blue-100">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {request.teacher_name || 'غير محدد'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status || 'pending')}`}>
                  {getStatusText(request.status || 'pending')}
                </span>
                <span className="text-sm">
                  {formatDate(request.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Loading State */}
          {loadingData && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600">جاري تحميل تفاصيل الدورة...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {dataError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                <X className="w-5 h-5" />
                خطأ في تحميل البيانات
              </h3>
              <p className="text-red-800">{dataError}</p>
              <Button 
                onClick={loadComparisonData}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white"
              >
                إعادة المحاولة
              </Button>
            </div>
          )}

          {/* Main Content - Only show when data is loaded */}
          {!loadingData && !dataError && courseDetails && editRequestDetails && (
            <>
              {/* Edit Reason */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 mb-8 shadow-lg">
                <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-orange-200 to-orange-300 rounded-xl shadow-md">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                  </div>
                  سبب التعديل
                </h3>
                <p className="text-orange-800 leading-relaxed text-lg">{safeString(editRequestDetails.edit_reason)}</p>
              </div>

          {/* Main Comparison */}
          <div className="relative mb-8">
            {/* Arrow for large screens */}
            <div className="hidden xl:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full p-4 shadow-xl border border-blue-200">
                <ArrowRight className="w-7 h-7 text-blue-600" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Current Values */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 h-fit sticky top-4 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-md"></div>
                <h3 className="text-xl font-bold text-red-900">القيم الحالية</h3>
              </div>
              
              <div className="space-y-5">
                <div className="bg-white rounded-lg p-4 border border-red-100">
                  <p className="text-sm text-red-700 mb-2 font-medium">عنوان الدورة</p>
                  <p className="text-red-900 font-semibold text-lg">{safeString(courseDetails.title) || 'غير محدد'}</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-red-100">
                  <p className="text-sm text-red-700 mb-2 font-medium">وصف الدورة</p>
                  <p className="text-red-900 text-sm leading-relaxed">
                    {safeString(courseDetails.description) || 'لا يوجد وصف متاح'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-red-700 mb-1">نوع الدورة</p>
                    <p className="text-red-900 flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {courseDetails.course_type_display || courseDetails.course_type || 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-red-700 mb-1">الحد الأقصى للطلاب</p>
                    <p className="text-red-900 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {courseDetails.max_students || 'غير محدد'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-red-700 mb-1">المسجلين حالياً</p>
                    <p className="text-red-900 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {courseDetails.enrolled_count || '0'} طالب
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-red-700 mb-1">المقاعد المتاحة</p>
                    <p className="text-red-900 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {courseDetails.available_spots || 'غير محدد'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-red-700 mb-1">حالة الموافقة</p>
                    <p className="text-red-900 flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {courseDetails.approval_status_display || courseDetails.approval_status || 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-red-700 mb-1">منشورة</p>
                    <p className="text-red-900 flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {courseDetails.is_published ? 'نعم' : 'لا'}
                    </p>
                  </div>
                </div>

                {courseDetails.learning_outcomes && (
                  <div>
                    <p className="text-sm text-red-700 mb-1">نواتج التعلم</p>
                    <p className="text-red-900 text-sm leading-relaxed">
                      {safeString(courseDetails.learning_outcomes)}
                    </p>
                  </div>
                )}

                {courseDetails.subjects && (
                  <div>
                    <p className="text-sm text-red-700 mb-1">المواضيع</p>
                    <p className="text-red-900 text-sm">{safeString(courseDetails.subjects)}</p>
                  </div>
                )}

                {courseDetails.trial_session_url && (
                  <div>
                    <p className="text-sm text-red-700 mb-1">رابط الحصة التجريبية</p>
                    <a 
                      href={courseDetails.trial_session_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-800 text-sm underline break-all"
                    >
                      {courseDetails.trial_session_url}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* New Values */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 h-fit sticky top-4 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-md"></div>
                <h3 className="text-xl font-bold text-green-900">القيم الجديدة</h3>
              </div>
              
              <div className="space-y-5">
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-green-700 mb-2 font-medium">عنوان الدورة</p>
                  <p className="text-green-900 font-semibold text-lg">{safeString(editRequestDetails.title) || 'غير محدد'}</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-green-700 mb-2 font-medium">وصف الدورة</p>
                  <p className="text-green-900 text-sm leading-relaxed">
                    {safeString(editRequestDetails.description) || 'لا يوجد وصف متاح'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-700 mb-1">نوع الدورة</p>
                    <p className="text-green-900 flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {editRequestDetails.course_type || 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 mb-1">مدة الدورة</p>
                    <p className="text-green-900 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {editRequestDetails.duration_weeks || 0} أسبوع
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-700 mb-1">مدة الجلسة</p>
                    <p className="text-green-900 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {editRequestDetails.session_duration || 60} دقيقة
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 mb-1">السعر</p>
                    <p className="text-green-900 flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {editRequestDetails.price || 'غير محدد'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-700 mb-1">حالة الطلب</p>
                    <p className="text-green-900 flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {editRequestDetails.status === 'pending' ? 'معلق' : 
                       editRequestDetails.status === 'approved' ? 'موافق عليه' :
                       editRequestDetails.status === 'rejected' ? 'مرفوض' : 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 mb-1">تاريخ الطلب</p>
                    <p className="text-green-900 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(editRequestDetails.created_at)}
                    </p>
                  </div>
                </div>

                {editRequestDetails.learning_outcomes && (
                  <div>
                    <p className="text-sm text-green-700 mb-1">نواتج التعلم</p>
                    <p className="text-green-900 text-sm leading-relaxed">
                      {safeString(editRequestDetails.learning_outcomes)}
                    </p>
                  </div>
                )}

                {editRequestDetails.subjects && (
                  <div>
                    <p className="text-sm text-green-700 mb-1">المواضيع</p>
                    <p className="text-green-900 text-sm">{safeString(editRequestDetails.subjects)}</p>
                  </div>
                )}

                {editRequestDetails.trial_session_url && (
                  <div>
                    <p className="text-sm text-green-700 mb-1">رابط الحصة التجريبية</p>
                    <a 
                      href={editRequestDetails.trial_session_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 text-sm underline break-all"
                    >
                      {editRequestDetails.trial_session_url}
                    </a>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>

          {/* Teacher Information */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl shadow-md">
                <User className="w-5 h-5 text-gray-700" />
              </div>
              معلومات المعلم
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">الاسم</p>
                <p className="text-gray-900">{safeString(courseDetails.teacher_name || editRequestDetails.teacher_name) || 'غير محدد'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                <p className="text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  {safeString(courseDetails.teacher_email || editRequestDetails.teacher_name) || 'غير محدد'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">تاريخ الطلب</p>
                <p className="text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  {formatDate(editRequestDetails.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Trial Session URL */}
          {request.trial_session_url && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                رابط الحصة التجريبية
              </h3>
              <a 
                href={request.trial_session_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 text-sm underline break-all"
              >
                {request.trial_session_url}
              </a>
            </div>
          )}

          {/* Lessons Comparison */}
          {(courseDetails.lessons?.length > 0 || editRequestDetails.lessons_data) && (
            <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl shadow-md">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  مقارنة الدروس
                </h3>
                <button
                  onClick={() => setShowLessonsComparison(!showLessonsComparison)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {showLessonsComparison ? 'إخفاء الدروس' : 'عرض الدروس'}
                  {showLessonsComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showLessonsComparison && (
                <div className="space-y-6">
                  {/* Current Lessons */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      الدروس الحالية ({courseDetails.lessons?.length || 0})
                    </h4>
                    {courseDetails.lessons?.length > 0 ? (
                      <div className="space-y-3">
                        {courseDetails.lessons.map((lesson, index) => (
                          <div key={lesson.id} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <div className="flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold">
                              {lesson.order || index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-red-900">{lesson.title}</h5>
                              {lesson.description && (
                                <p className="text-sm text-red-700 mt-1">{lesson.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-red-600 mt-2">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration_minutes} دقيقة
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-red-700 text-sm">لا توجد دروس حالياً</p>
                    )}
                  </div>

                  {/* New Lessons Data */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      بيانات الدروس الجديدة
                    </h4>
                    {editRequestDetails.lessons_data ? (
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-green-800 text-sm mb-2">بيانات الدروس المحدثة:</p>
                        <pre className="text-xs text-green-700 bg-green-100 p-3 rounded overflow-x-auto">
                          {typeof editRequestDetails.lessons_data === 'string' 
                            ? editRequestDetails.lessons_data 
                            : JSON.stringify(editRequestDetails.lessons_data, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-green-700 text-sm">لا توجد تغييرات على الدروس</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Approval/Rejection Forms */}
          {showApprovalForm && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 mb-8 shadow-lg">
              <h3 className="text-xl font-bold text-green-900 mb-6 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-green-200 to-green-300 rounded-xl shadow-md">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                الموافقة على التعديل
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-green-700 mb-2">
                  ملاحظات الموافقة (اختياري)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="أضف أي ملاحظات أو توجيهات للمعلم..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? 'جاري الموافقة...' : 'تأكيد الموافقة'}
                </Button>
                <Button
                  onClick={() => setShowApprovalForm(false)}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}

          {showRejectionForm && (
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
              <h3 className="text-xl font-bold text-red-900 mb-6 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-red-200 to-red-300 rounded-xl shadow-md">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                رفض التعديل
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-red-700 mb-2">
                  سبب الرفض (مطلوب)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="اذكر الأسباب التي أدت لرفض التعديل..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleReject}
                  disabled={isLoading || !rejectionReason.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? 'جاري الرفض...' : 'تأكيد الرفض'}
                </Button>
                <Button
                  onClick={() => setShowRejectionForm(false)}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!loadingData && !dataError && courseDetails && editRequestDetails && editRequestDetails.status === 'pending' && !showApprovalForm && !showRejectionForm && (
          <div className="sticky bottom-0 bg-gradient-to-r from-white to-gray-50 border-t border-gray-200 p-6 rounded-b-3xl shadow-xl">
            <div className="flex gap-4 justify-end">
              <Button
                onClick={() => setShowRejectionForm(true)}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                رفض التعديل
              </Button>
              <Button
                onClick={() => setShowApprovalForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                الموافقة على التعديل
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseComparisonModal;
