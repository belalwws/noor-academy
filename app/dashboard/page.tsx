'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../lib/hooks';
import { logout, login } from '../../lib/store';
import { useRouter } from 'next/navigation';
import { API_CONFIG, getApiUrl } from '../../lib/config';
import { getAuthData, clearAuthData } from '../../lib/auth';
import Link from 'next/link';
import UserAvatar from '@/components/UserAvatar';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check authentication and redirect based on role
  useEffect(() => {
    const authData = getAuthData();
    if (authData && !isAuthenticated) {
      // Update Redux with auth data from cookies/localStorage
      dispatch(login({
        user: authData.user,
        tokens: {
          access: authData.tokens?.access || '',
          refresh: authData.tokens?.refresh || ''
        }
      }));
    } else if (!authData && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Redirect based on user role
    if (isAuthenticated && user?.role && !isRedirecting) {
      setIsRedirecting(true);
      const roleRoutes = {
        student: '/dashboard/student',
        teacher: '/dashboard/teacher',
        general_supervisor: '/dashboard/supervisor',
        academic_supervisor: '/dashboard/academic-supervisor',
        admin: '/dashboard/admin' // توجيه لداشبورد المدير في الفرونت إند
      };

      const targetRoute = roleRoutes[user.role as keyof typeof roleRoutes];
      if (targetRoute) {
        console.log(`🎯 توجيه المستخدم (${user.role}) إلى: ${targetRoute}`);
        router.replace(targetRoute);
      } else {
        // Fallback for unknown roles
        console.warn(`Unknown user role: ${user.role}`);
        router.replace('/dashboard/student');
      }
    }
  }, [isAuthenticated, user, dispatch, router, isRedirecting]);

  // Show loading while redirecting
  if (isRedirecting || (isAuthenticated && user?.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري التوجيه إلى لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const authData = getAuthData();
      
      if (authData?.tokens?.access) {
        await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGOUT), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authData.tokens.access}`,
          },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      dispatch(logout());
      router.push('/');
    }
  };

  return (
    <>
      {/* Navigation */}
      <nav className="navbar navbar-dark bg-gradient-primary">
        <div className="container-fluid">
          <Link href="/" className="navbar-brand arabic-text">
            <i className="fas fa-mosque me-2"></i>
            أكاديمية لسان الحكمة
          </Link>
          
          <div className="d-flex align-items-center">
            {isAuthenticated && user ? (
              <>
                <div className="dropdown me-3">
                  <button 
                    className="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                    type="button" 
                    id="userDropdown" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <UserAvatar user={user} useSignedUrls={true} />
                    <span className="d-none d-sm-inline">{user.full_name}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li>
                      <Link href="/profile" className="dropdown-item">
                        <i className="fas fa-user me-2"></i>
                        الملف الشخصي
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard" className="dropdown-item">
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
                <Link href="/dashboard" className="btn btn-warning btn-sm me-2">
                  <i className="fas fa-tachometer-alt me-1"></i>
                  لوحة التحكم
                </Link>
              </>
            ) : (
              <Link href="/login" className="nav-link">
                <i className="fas fa-sign-in-alt me-1"></i>تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      </nav>

      <style jsx>{`
        body {
          font-family: 'Cairo', sans-serif;
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
          min-height: 100vh;
          padding: 20px 0;
        }
        
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .dashboard-header {
          background: white;
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          text-align: center;
        }
        
        .welcome-text {
          font-size: 2rem;
          font-weight: 600;
          color: #2E7D32;
          margin-bottom: 10px;
        }
        
        .subtitle {
          font-size: 1.1rem;
          color: #666;
        }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .dashboard-card {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          transition: transform 0.2s ease;
        }
        
        .dashboard-card:hover {
          transform: translateY(-5px);
        }
        
        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .card-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 15px;
          color: white;
          font-size: 1.5rem;
        }
        
        .card-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #2E7D32;
        }
        
        .card-content {
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        
        .card-actions {
          display: flex;
          gap: 10px;
        }
        
        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(46, 125, 50, 0.3);
          color: white;
        }
        
        .btn-outline {
          background: transparent;
          color: #2E7D32;
          border: 2px solid #2E7D32;
        }
        
        .btn-outline:hover {
          background: #2E7D32;
          color: white;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: white;
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #2E7D32;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 0 10px;
          }
          
          .dashboard-header {
            padding: 20px;
          }
          
          .welcome-text {
            font-size: 1.5rem;
          }
          
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: #FFD700;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1B5E20;
          font-weight: 600;
          font-size: 14px;
        }
        
        .dropdown-menu {
          background: white;
          border: 1px solid rgba(0,0,0,.15);
          border-radius: 8px;
          box-shadow: 0 6px 12px rgba(0,0,0,.175);
          z-index: 1050;
        }
        
        .dropdown-item {
          padding: 8px 16px;
          color: #333;
          text-decoration: none;
          transition: background-color 0.2s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: right;
        }
        
        .dropdown-item:hover {
          background-color: #f8f9fa;
          color: #2E7D32;
        }
        
        .dropdown-item.text-danger:hover {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .btn-outline-light {
          border-color: rgba(255,255,255,.5);
          color: white;
        }
        
        .btn-outline-light:hover {
          background-color: rgba(255,255,255,.1);
          border-color: rgba(255,255,255,.75);
          color: white;
        }
        
        .dropdown-divider {
          height: 1px;
          background: #e9ecef;
          margin: 5px 0;
        }
        
        @media (max-width: 768px) {
          .d-sm-inline {
            display: none !important;
          }
        }
      `}</style>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="welcome-text">مرحباً بك في لوحة التحكم</div>
          <div className="subtitle">أكاديمية لسان الحكمة - {user?.full_name}</div>
        </div>
        
        {/* إحصائيات سريعة */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">الدورات المسجلة</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">الآيات المحفوظة</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">ساعات التعلم</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">الإنجازات</div>
          </div>
        </div>
        
        {/* البطاقات الرئيسية */}
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-book-open"></i>
              </div>
              <div className="card-title">الدورات التعليمية</div>
            </div>
            <div className="card-content">
              ابدأ رحلتك التعليمية مع دوراتنا المتنوعة في القرآن الكريم والعلوم الشرعية واللغة العربية.
            </div>
            <div className="card-actions">
              <Link href="/courses" className="btn btn-primary">
                <i className="fas fa-search me-2"></i>
                استكشف الدورات
              </Link>
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-quran"></i>
              </div>
              <div className="card-title">حفظ القرآن الكريم</div>
            </div>
            <div className="card-content">
              ابدأ في حفظ القرآن الكريم مع أدواتنا المتطورة وطرق الحفظ المثبتة علمياً.
            </div>
            <div className="card-actions">
              <Link href="/quran" className="btn btn-primary">
                <i className="fas fa-play me-2"></i>
                ابدأ الحفظ
              </Link>
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="card-title">المجتمع التعليمي</div>
            </div>
            <div className="card-content">
              انضم إلى مجتمعنا التعليمي وتواصل مع الطلاب والمعلمين من جميع أنحاء العالم.
            </div>
            <div className="card-actions">
              <Link href="/community" className="btn btn-outline">
                <i className="fas fa-comments me-2"></i>
                انضم للمجتمع
              </Link>
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="card-title">تقدمي التعليمي</div>
            </div>
            <div className="card-content">
              تابع تقدمك التعليمي وإنجازاتك مع رسوم بيانية تفصيلية وإحصائيات دقيقة.
            </div>
            <div className="card-actions">
              <Link href="/progress" className="btn btn-outline">
                <i className="fas fa-chart-bar me-2"></i>
                عرض التقدم
              </Link>
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-user-edit"></i>
              </div>
              <div className="card-title">إعدادات الحساب</div>
            </div>
            <div className="card-content">
              عدّل معلوماتك الشخصية، غير كلمة المرور، وحدّث إعدادات الحساب.
            </div>
            <div className="card-actions">
              <Link href="/profile" className="btn btn-outline">
                <i className="fas fa-cog me-2"></i>
                إعدادات الحساب
              </Link>
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-headset"></i>
              </div>
              <div className="card-title">الدعم والمساعدة</div>
            </div>
            <div className="card-content">
              احصل على المساعدة والدعم الفني من فريقنا المتخصص في أي وقت.
            </div>
            <div className="card-actions">
              <Link href="/support" className="btn btn-outline">
                <i className="fas fa-question-circle me-2"></i>
                احصل على المساعدة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
