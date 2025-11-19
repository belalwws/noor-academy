'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

interface CourseEnrollment {
  id: string;
  course: string;
  course_title: string;
  student: string;
  student_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  status_display: string;
  enrolled_at: string;
  approved_at?: string;
  notes?: string;
  is_family_enrollment?: string;
  family_name?: string;
  family_enrollment?: string;
  general_supervisor_approved: boolean;
  general_supervisor_approved_at?: string;
}

interface EnrollmentManagementProps {
  userRole?: 'supervisor' | 'teacher' | 'student';
  courseId?: string; // If provided, show enrollments for specific course
}

export default function EnrollmentManagement({ userRole = 'supervisor', courseId }: EnrollmentManagementProps) {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<CourseEnrollment | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionNotes, setActionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      
      if (userRole === 'supervisor') {
        // Supervisors see pending enrollments or all enrollments
        if (selectedStatus === 'pending') {
          response = await apiClient.getPendingEnrollments();
        } else {
          const filters: any = {};
          if (selectedStatus !== 'all') {
            filters.status = selectedStatus;
          }
          if (courseId) {
            filters.course = courseId;
          }
          response = await apiClient.getEnrollments(filters);
        }
      } else if (userRole === 'teacher' && courseId) {
        // Teachers see enrollments for their courses
        const filters: any = {};
        if (selectedStatus !== 'all') {
          filters.status = selectedStatus;
        }
        response = await apiClient.getCourseEnrollments(courseId, filters);
      } else if (userRole === 'student') {
        // Students see their own enrollments
        const filters: any = {};
        if (selectedStatus !== 'all') {
          filters.status = selectedStatus;
        }
        response = await apiClient.getMyEnrollments(filters);
      } else {
        throw new Error('Invalid configuration');
      }

      setEnrollments(response.data.results || []);
    } catch (error: any) {
      console.error('Failed to load enrollments:', error);
      setError('فشل في تحميل التسجيلات');
      toast.error('فشل في تحميل التسجيلات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, [selectedStatus, courseId, userRole]);

  const handleAction = async (enrollment: CourseEnrollment, action: 'approve' | 'reject') => {
    setSelectedEnrollment(enrollment);
    setActionType(action);
    setActionNotes('');
    setActionDialog(true);
  };

  const executeAction = async () => {
    if (!selectedEnrollment) return;

    try {
      setProcessing(true);

      if (actionType === 'approve') {
        await apiClient.approveEnrollment(selectedEnrollment.id, actionNotes);
        toast.success('تم قبول التسجيل بنجاح');
      } else {
        await apiClient.rejectEnrollment(selectedEnrollment.id, actionNotes);
        toast.success('تم رفض التسجيل');
      }

      setActionDialog(false);
      setSelectedEnrollment(null);
      setActionNotes('');
      await loadEnrollments();
    } catch (error: any) {
      console.error('Action failed:', error);
      toast.error('فشل في تنفيذ العملية');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning text-dark';
      case 'approved': return 'bg-success text-white';
      case 'rejected': return 'bg-danger text-white';
      case 'completed': return 'bg-info text-white';
      default: return 'bg-secondary text-white';
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
        <p className="mt-3">جاري تحميل التسجيلات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
        <button 
          className="btn btn-outline-danger btn-sm ms-3"
          onClick={loadEnrollments}
        >
          <i className="fas fa-retry me-1"></i>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="enrollment-management">
      {/* Header and Filters */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">
          <i className="fas fa-users me-2"></i>
          إدارة التسجيلات
        </h4>
        
        <div className="d-flex gap-2">
          <select 
            className="form-select form-select-sm"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">جميع التسجيلات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="approved">مقبولة</option>
            <option value="rejected">مرفوضة</option>
            <option value="completed">مكتملة</option>
          </select>
          
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={loadEnrollments}
          >
            <i className="fas fa-sync-alt me-1"></i>
            تحديث
          </button>
        </div>
      </div>

      {/* Enrollments List */}
      {enrollments.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">لا توجد تسجيلات</h5>
          <p className="text-muted">لم يتم العثور على تسجيلات تطابق المعايير المحددة</p>
        </div>
      ) : (
        <div className="row g-3">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-3">
                      <h6 className="mb-1">{enrollment.student_name}</h6>
                      <small className="text-muted">
                        <i className="fas fa-user me-1"></i>
                        الطالب
                      </small>
                    </div>
                    
                    <div className="col-md-3">
                      <h6 className="mb-1">{enrollment.course_title}</h6>
                      <small className="text-muted">
                        <i className="fas fa-book me-1"></i>
                        الدورة
                      </small>
                    </div>
                    
                    <div className="col-md-2">
                      <span className={`badge ${getStatusBadgeClass(enrollment.status)}`}>
                        {enrollment.status_display}
                      </span>
                      <div className="small text-muted mt-1">
                        {formatDate(enrollment.enrolled_at)}
                      </div>
                    </div>
                    
                    <div className="col-md-2">
                      {enrollment.notes && (
                        <div className="small text-muted">
                          <i className="fas fa-sticky-note me-1"></i>
                          {enrollment.notes.length > 30 
                            ? `${enrollment.notes.substring(0, 30)}...`
                            : enrollment.notes
                          }
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-2">
                      {userRole === 'supervisor' && enrollment.status === 'pending' && (
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            className="btn btn-outline-success"
                            onClick={() => handleAction(enrollment, 'approve')}
                            title="قبول التسجيل"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleAction(enrollment, 'reject')}
                            title="رفض التسجيل"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )}
                      
                      {userRole === 'student' && enrollment.status === 'pending' && (
                        <button
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => {
                            // Handle cancellation
                            if (confirm('هل أنت متأكد من إلغاء التسجيل؟')) {
                              apiClient.cancelEnrollment(enrollment.id)
                                .then(() => {
                                  toast.success('تم إلغاء التسجيل');
                                  loadEnrollments();
                                })
                                .catch(() => {
                                  toast.error('فشل في إلغاء التسجيل');
                                });
                            }
                          }}
                        >
                          <i className="fas fa-times me-1"></i>
                          إلغاء
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      {actionDialog && selectedEnrollment && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {actionType === 'approve' ? 'قبول التسجيل' : 'رفض التسجيل'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setActionDialog(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>الطالب:</strong> {selectedEnrollment.student_name}<br />
                  <strong>الدورة:</strong> {selectedEnrollment.course_title}
                </p>
                
                <div className="mb-3">
                  <label className="form-label">
                    {actionType === 'approve' ? 'ملاحظات الموافقة (اختيارية)' : 'سبب الرفض'}
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder={actionType === 'approve' 
                      ? 'أضف ملاحظات إضافية...' 
                      : 'يرجى توضيح سبب الرفض...'
                    }
                    required={actionType === 'reject'}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setActionDialog(false)}
                  disabled={processing}
                >
                  إلغاء
                </button>
                <button 
                  type="button" 
                  className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                  onClick={executeAction}
                  disabled={processing || (actionType === 'reject' && !actionNotes.trim())}
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <i className={`fas ${actionType === 'approve' ? 'fa-check' : 'fa-times'} me-2`}></i>
                      {actionType === 'approve' ? 'قبول' : 'رفض'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
