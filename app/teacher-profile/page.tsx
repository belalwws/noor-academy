'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../lib/hooks';
import { logout, updateUser, setProfileImageTimestamp } from '../../lib/store';
import apiService from '../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProfileImages } from '@/hooks/use-profile-images';
import UserAvatar from '@/components/UserAvatar';
import { getAuthData, clearAuthData } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';

interface TeacherStats {
  total_students: number;
  active_courses: number;
  completed_sessions: number;
  upcoming_sessions: number;
  total_hours: number;
  success_rate: number;
}

interface TeacherSchedule {
  id: string;
  course_title: string;
  student_name: string;
  session_time: string;
  prayer_period: string;
  status: string;
  session_type: string;
}

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
  phone?: string;
  bio?: string;
  profile_image_url?: string;
}

interface TeacherProfile {
  id: string;
  user: User;
  qualifications: string;
  years_of_experience: number;
  specialization: string;
  primary_teaching_language: string;
  secondary_teaching_language?: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  is_active: boolean;
  biography: string;
}

export default function TeacherProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  
  const [teacherStats, setTeacherStats] = useState<TeacherStats>({
    total_students: 0,
    active_courses: 0,
    completed_sessions: 0,
    upcoming_sessions: 0,
    total_hours: 0,
    success_rate: 0
  });
  
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  
  const [upcomingSessions, setUpcomingSessions] = useState<TeacherSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remainingTime: number; isLimited: boolean }>({
    remainingTime: 0,
    isLimited: false
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modal, setModal] = useState({
    isOpen: false,
    onClose: () => {},
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'info'
  });

  // Use signed URLs for profile images
  const { imageUrls, loading: signedUrlsLoading, error: signedUrlsError } = useProfileImages({
    refreshOnFocus: true,
    refreshInterval: 30 * 60 * 1000 // Refresh every 30 minutes
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTeacherData();
    }
  }, [isAuthenticated]);

  // Timer for rate limiting countdown
  useEffect(() => {
    if (rateLimitInfo.isLimited && rateLimitInfo.remainingTime > 0) {
      const timer = setInterval(() => {
        setRateLimitInfo(prev => {
          const newTime = Math.max(0, prev.remainingTime - 1);
          if (newTime === 0) {
            return { remainingTime: 0, isLimited: false };
          }
          return { ...prev, remainingTime: newTime };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [rateLimitInfo.isLimited, rateLimitInfo.remainingTime]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadTeacherData = async () => {
    setIsLoading(true);
    try {
      const [profileResult, statsResult, sessionsResult] = await Promise.all([
        apiService.getTeacherProfile(),
        apiService.getTeacherStats(),
        apiService.getTeacherUpcomingSessions()
      ]);

      if (profileResult.success && profileResult.data) {
        setTeacherProfile(profileResult.data);
      }

      if (statsResult.success && statsResult.data) {
        setTeacherStats(statsResult.data);
      }

      if (sessionsResult.success && sessionsResult.data) {
        setUpcomingSessions(sessionsResult.data.sessions || []);
      }

    } catch (error) {
      console.error('Error loading teacher data:', error);
      // Optionally, show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check authentication first
    if (!isAuthenticated || !user) {
      setModal({
        isOpen: true,
        onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
        title: 'خطأ في المصادقة',
        message: 'يجب تسجيل الدخول أولاً لرفع الصورة',
        type: 'error'
      });
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setModal({
        isOpen: true,
        onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
        title: 'خطأ في نوع الملف',
        message: 'نوع الملف غير مدعوم. يرجى استخدام JPEG, PNG, أو WebP',
        type: 'error'
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setModal({
        isOpen: true,
        onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
        title: 'خطأ في حجم الملف',
        message: 'حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت',
        type: 'error'
      });
      return;
    }

    // Validate image dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      
      if (img.width < 50 || img.height < 50) {
        setModal({
          isOpen: true,
          onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
          title: 'خطأ في أبعاد الصورة',
          message: 'أبعاد الصورة صغيرة جداً. الحد الأدنى 50x50 بكسل',
          type: 'error'
        });
        return;
      }
      
      if (img.width > 2048 || img.height > 2048) {
        setModal({
          isOpen: true,
          onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
          title: 'خطأ في أبعاد الصورة',
          message: 'أبعاد الصورة كبيرة جداً. الحد الأقصى 2048x2048 بكسل',
          type: 'error'
        });
        return;
      }

      // Proceed with upload
      try {
        setIsUploading(true);
        const result = await apiService.uploadTeacherProfileImage(file);
        
        if (result.success && result.data) {
          setModal({
            isOpen: true,
            onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
            title: 'تم رفع الصورة بنجاح',
            message: 'تم تحديث صورة الملف الشخصي بنجاح.',
            type: 'success'
          });

          // Update Redux store to reflect changes globally
          dispatch(updateUser({
            profile_image_url: result.data.profile_image_url,
            profile_image_thumbnail_url: result.data.profile_image_thumbnail_url
          }));

          // Force image refresh across the app by updating the timestamp
          dispatch(setProfileImageTimestamp(Date.now()));

          // Update local state for immediate feedback on the current page
          setTeacherProfile(prev => prev ? { 
            ...prev, 
            profile_image_url: result.data.profile_image_url, 
            profile_image_thumbnail_url: result.data.profile_image_thumbnail_url 
          } : null);

        } else {
          let errorTitle = 'خطأ غير معروف';
          let errorMessage = result.error || 'حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.';
          // Check for specific error types
          if (result.error?.includes('Authentication credentials were not provided') || 
              result.error?.includes('يجب تسجيل الدخول أولاً')) {
            errorTitle = 'خطأ في المصادقة';
            errorMessage = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
            // Redirect to login
            setTimeout(() => {
              router.push('/login');
            }, 2000);
          } else if (result.error?.includes('throttled') || result.error?.includes('rate limit')) {
            errorTitle = 'تم تجاوز الحد المسموح';
            errorMessage = 'لقد وصلت للحد الأقصى من محاولات رفع الصور (5 محاولات في الساعة). يرجى المحاولة لاحقاً.';
            
            // Extract remaining time from error message if available
            const timeMatch = result.error.match(/(\d+)\s*seconds?/i);
            if (timeMatch) {
              const remainingSeconds = parseInt(timeMatch[1]);
              setRateLimitInfo({
                remainingTime: remainingSeconds,
                isLimited: true
              });
            }
          } else if (result.error?.includes('size') || result.error?.includes('dimension')) {
            errorTitle = 'خطأ في حجم الصورة';
            errorMessage = 'حجم أو أبعاد الصورة غير مناسبة. يرجى اختيار صورة أصغر.';
          } else if (result.error?.includes('format') || result.error?.includes('type')) {
            errorTitle = 'خطأ في نوع الملف';
            errorMessage = 'نوع الملف غير مدعوم. يرجى استخدام JPEG, PNG, أو WebP.';
          }
          
          setModal({
            isOpen: true,
            onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
            title: errorTitle,
            message: errorMessage,
            type: 'error'
          });
        }
      } catch (error) {
        setModal({
          isOpen: true,
          onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
          title: 'خطأ في رفع الصورة',
          message: process.env.NODE_ENV === 'development' 
            ? `خطأ في الاتصال: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
            : 'حدث خطأ أثناء رفع الصورة',
          type: 'error'
        });
      } finally {
        setIsUploading(false);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setModal({
        isOpen: true,
        onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
        title: 'خطأ في قراءة الصورة',
        message: 'لا يمكن قراءة الصورة. تأكد من أن الملف صورة صحيحة',
        type: 'error'
      });
    };
    
    img.src = objectUrl;
  };

  const handleDeleteImage = async () => {
    try {
      const result = await apiService.deleteTeacherProfileImage();
      
      if (result.success) {
        setModal({
          isOpen: true,
          onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
          title: 'تم حذف الصورة بنجاح',
          message: 'تم حذف صورة الملف الشخصي بنجاح.',
          type: 'success'
        });
        
        // Reload profile to get updated image
        loadTeacherData();
      } else {
        setModal({
          isOpen: true,
          onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
          title: 'خطأ في حذف الصورة',
          message: result.error || 'حدث خطأ أثناء حذف الصورة',
          type: 'error'
        });
      }
    } catch (error) {
      setModal({
        isOpen: true,
        onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
        title: 'خطأ في حذف الصورة',
        message: 'حدث خطأ أثناء حذف الصورة',
        type: 'error'
      });
    }
  };

  const handleLogout = async () => {
    try {
      // Get auth data to send refresh token
      const authData = getAuthData();
      
      if (authData?.tokens?.refresh) {
        // Send logout request to API with refresh token
        await apiService.logout(authData.tokens.refresh);
      } else {
        // Fallback: logout without refresh token
      await apiService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth data and redirect to login
      clearAuthData();
      dispatch(logout());
      router.push('/login');
    }
  };

  const formatPrayerPeriod = (period: string) => {
    const periods = {
      'fajr-duha': 'بين الفجر والضحى',
      'duha-dhuhr': 'بين الضحى والظهر',
      'dhuhr-asr': 'بين الظهر والعصر',
      'asr-maghrib': 'بين العصر والمغرب',
      'maghrib-isha': 'بين المغرب والعشاء',
      'after-isha': 'بعد العشاء'
    };
    return periods[period as keyof typeof periods] || period;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'success';
      case 'PENDING': return 'warning';
      case 'ACTIVE': return 'primary';
      case 'COMPLETED': return 'secondary';
      default: return 'info';
    }
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      'SCHEDULED': 'مجدولة',
      'PENDING': 'بانتظار التحديد',
      'ACTIVE': 'جارية',
      'COMPLETED': 'مكتملة',
      'CANCELLED': 'ملغية'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const formatRemainingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours} ساعة و ${minutes} دقيقة`;
    } else if (minutes > 0) {
      return `${minutes} دقيقة و ${remainingSeconds} ثانية`;
    } else {
      return `${remainingSeconds} ثانية`;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      {modal.isOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 bg-gradient-primary text-white">
                <h5 className="modal-title">
                  <i className={`fas ${modal.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                  {modal.title}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={modal.onClose}></button>
              </div>
              <div className="modal-body text-center py-4">
                <i className={`fas ${modal.type === 'success' ? 'fa-check-circle text-success' : 'fa-exclamation-triangle text-danger'} fa-3x mb-3`}></i>
                <p className="mb-0">{modal.message}</p>
              </div>
              <div className="modal-footer border-0 justify-content-center">
                <button type="button" className="btn btn-primary px-4" onClick={modal.onClose}>
                  <i className="fas fa-check me-2"></i>
                  حسناً
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        :root { --primary-color: #2D7D32; --secondary-color: #1B5E20; --accent-color: #FFD700; --text-color: #333; --bg-color: #f8f9fa; }
        body { font-family: 'Cairo', sans-serif; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); min-height: 100vh; color: #333; overflow-x: hidden; }
        .profile-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .profile-header { background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%); color: white; border-radius: 25px; padding: 30px; margin-bottom: 30px; text-align: center; position: relative; overflow: hidden; }
        .profile-avatar { width: 140px; height: 140px; border-radius: 50%; object-fit: cover; border: 6px solid rgba(255,255,255,0.3); box-shadow: 0 10px 30px rgba(0,0,0,0.3); transition: all 0.4s ease; position: relative; z-index: 2; }
        .profile-avatar-container { position: relative; display: inline-block; margin-bottom: 20px; }
        .avatar-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(46,125,50,.8), rgba(76,175,80,.8)); border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0; transition: all .3s ease; cursor: pointer; z-index: 3; }
        .profile-avatar-container:hover .avatar-overlay { opacity: 1; backdrop-filter: blur(2px); }
        .quick-actions { display: flex; gap: 10px; justify-content: center; margin-top: 10px; }
        .btn-outline-light { border: 2px solid rgba(255,255,255,0.3); color: white; background: rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-top: 20px; }
        .stats-card { background: white; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
      `}</style>

      <nav className="navbar navbar-dark bg-gradient-primary">
        <div className="container-fluid">
          <Link href="/" className="navbar-brand arabic-text">
            <i className="fas fa-mosque me-2"></i>
            أكاديمية لسان الحكمة
          </Link>
          <div className="d-flex align-items-center">
            <div className="dropdown me-3">
              <button className="btn btn-outline-light dropdown-toggle d-flex align-items-center" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                {user && (
                  <UserAvatar user={user} size="sm" useSignedUrls={true} />
                )}
                <span className="d-none d-sm-inline">{user?.first_name} {user?.last_name}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li>
                  <Link href="/teacher-profile" className="dropdown-item">
                    <i className="fas fa-user me-2"></i>
                    الملف الشخصي
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/teacher" className="dropdown-item">
                    <i className="fas fa-tachometer-alt me-2"></i>
                    لوحة التحكم
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button onClick={handleLogout} className="dropdown-item text-danger">
                    <i className="fas fa-sign-out-alt me-2"></i>
                    تسجيل الخروج
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-container">
                  <img
                    src={imageUrls?.profile_image_url || teacherProfile?.user?.profile_image_url || '/default-avatar.png'}
                    alt="صورة الملف الشخصي"
              className="profile-avatar"
                  />
                <div className="avatar-overlay">
                  <label htmlFor="teacher-profile-image" style={{ cursor: 'pointer', color: 'white' }}>
                    <i className="fas fa-camera fa-2x"></i>
                  </label>
              <input id="teacher-profile-image" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </div>
              </div>
              <h2 className="mb-2 fw-bold">{teacherProfile?.user?.first_name} {teacherProfile?.user?.last_name}</h2>
          <p className="mb-2"><i className="fas fa-chalkboard-teacher me-2"></i>مدرس في أكاديمية لسان الحكمة</p>
          <div className="quick-actions">
            <Link href="/meetings/create" className="btn btn-success btn-sm me-2">
              <i className="fas fa-video me-2"></i>
              إنشاء ميتنج
            </Link>
            <Link href="/course-creation" className="btn btn-outline-light btn-sm me-2">
              <i className="fas fa-plus me-2"></i>
              إنشاء دورة جديدة
            </Link>
            <Link href="/dashboard/teacher" className="btn btn-outline-light btn-sm">
              <i className="fas fa-tachometer-alt me-2"></i>
              لوحة التحكم
            </Link>
          </div>
        </div>

        <div className="row mt-3">
            <div className="col-lg-8">
              <div className="card h-100">
                <div className="card-header bg-white border-bottom">
                <h5 className="mb-0"><i className="fas fa-calendar-alt text-primary me-2"></i>الجلسات القادمة</h5>
                </div>
                <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">جاري التحميل...</span>
                      </div>
                    </div>
                  ) : upcomingSessions.length > 0 ? (
                    upcomingSessions.map((session, index) => (
                      <div key={index} className="session-card">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold text-primary"><i className="fas fa-book me-2"></i>{session.course_title}</h6>
                          <p className="mb-1"><i className="fas fa-user-graduate me-2 text-info"></i>{session.student_name}</p>
                          <div className="session-time"><i className="fas fa-clock me-2"></i>{new Date(session.session_time).toLocaleString('ar-SA')}</div>
                          <div className="session-prayer"><i className="fas fa-mosque me-2"></i>{formatPrayerPeriod(session.prayer_period)}</div>
                          </div>
                          <div className="text-end">
                          <span className={`badge bg-${getStatusColor(session.status)} mb-2`}>{getStatusText(session.status)}</span>
                            <br />
                          <span className="badge bg-light text-dark">{session.session_type}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                      <p className="text-muted">لا توجد جلسات قادمة</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card mb-4">
                <div className="card-header bg-white border-bottom">
                <h5 className="mb-0"><i className="fas fa-bolt text-warning me-2"></i>إجراءات سريعة</h5>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                  <Link href="/course-creation" className="btn btn-success">
                    <i className="fas fa-plus-circle me-2"></i>
                    إنشاء دورة جديدة
                  </Link>
                  <Link href="/dashboard/teacher" className="btn btn-primary">
                      <i className="fas fa-tachometer-alt me-2"></i>
                      لوحة التحكم
                    </Link>
                    <Link href="/teacher-courses" className="btn btn-info">
                      <i className="fas fa-book-open me-2"></i>
                      دوراتي
                    </Link>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-header bg-white border-bottom">
                <h5 className="mb-0"><i className="fas fa-info-circle text-info me-2"></i>معلومات المدرس</h5>
                </div>
                <div className="card-body">
                <div className="mb-2"><strong>البريد:</strong> <span className="text-muted">{teacherProfile?.user?.email}</span></div>
                {teacherProfile?.user?.phone && (
                  <div className="mb-2"><strong>الهاتف:</strong> <span className="text-muted">{teacherProfile?.user?.phone}</span></div>
                )}
                {teacherProfile?.specialization && (
                  <div className="mb-2"><strong>التخصص:</strong> <span className="text-muted">{teacherProfile.specialization}</span></div>
                )}
                {(teacherProfile?.years_of_experience ?? 0) > 0 && (
                  <div className="mb-2"><strong>الخبرة:</strong> <span className="text-muted">{teacherProfile?.years_of_experience} سنة</span></div>
                )}
                    </div>
                  </div>
                    </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
