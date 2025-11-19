'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getAuthData } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const hasRedirected = useRef(false);
  const isInitialCheck = useRef(true);
  const checkAttempts = useRef(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Prevent multiple redirects
        if (hasRedirected.current) {
          return;
        }

        checkAttempts.current += 1;

        // Check if login is in progress
        const loginInProgress = localStorage.getItem('login_in_progress');
        if (loginInProgress === 'true') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Clear stale flag if it's still there
          localStorage.removeItem('login_in_progress');
        }

        // On initial check, give Redux and localStorage more time to initialize
        if (isInitialCheck.current) {
          isInitialCheck.current = false;
          // Give more time for auth data to be saved (especially after login)
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Re-check after waiting
          const recheckAuthData = getAuthData();
          const recheckAuthenticated = isAuthenticated();
          
          if (!(recheckAuthenticated && recheckAuthData?.user)) {
            // If still no data, retry with longer wait
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
        
        // Final check
        const finalAuthData = getAuthData();
        const finalAuthenticated = isAuthenticated();
        
        // If localStorage has auth data, we're authenticated
        if (finalAuthenticated && finalAuthData?.user) {
          
          // Check role-based access
          if (allowedRoles.length > 0) {
            const userRole: string = finalAuthData.user.role || 'student';
            const supervisorType = localStorage.getItem('supervisor_type') || 'general';

            // تحديد الدور الفعلي للمشرف
            let effectiveRole: string = userRole;
            if (userRole === 'supervisor') {
              effectiveRole = supervisorType === 'academic' ? 'academic_supervisor' : 'general_supervisor';
            }

            // التحقق من الوصول للأدوار المسموحة
            const hasAccess = allowedRoles.includes(userRole) ||
                             allowedRoles.includes(effectiveRole) ||
                             // دعم الأدوار الجديدة
                             (userRole === 'general_supervisor' && allowedRoles.includes('supervisor')) ||
                             (userRole === 'academic_supervisor' && allowedRoles.includes('academic_supervisor')) ||
                             // Supervisor with correct type - general supervisor can access supervisor routes
                             (userRole === 'supervisor' && allowedRoles.includes('supervisor') && 
                              (supervisorType === 'general' || supervisorType === 'academic' || !supervisorType)) ||
                             // General supervisor can access supervisor routes
                             (userRole === 'supervisor' && supervisorType === 'general' && allowedRoles.includes('general_supervisor'));

            if (!hasAccess) {
              // Redirect based on user role
              const roleRedirects: { [key: string]: string } = {
                'student': '/dashboard/student',
                'teacher': '/dashboard/teacher',
                'supervisor': '/dashboard/supervisor',
                'general_supervisor': '/dashboard/supervisor',
                'academic_supervisor': '/dashboard/academic-supervisor',
                'admin': '/dashboard/admin'
              };

              hasRedirected.current = true;
              router.replace(roleRedirects[userRole] || roleRedirects[effectiveRole] || '/dashboard');
              return;
            }
          }

          setAuthorized(true);
          return;
        }

        // If no localStorage auth data, redirect to login
        hasRedirected.current = true;
        setAuthorized(false);
        router.replace(redirectTo);
        return;
      } catch (error) {
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.replace(redirectTo);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectTo, allowedRoles]); // Simplified dependencies

  // Listen for storage changes (logout from another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === 'user' || e.key === 'refresh_token') && !e.newValue && !hasRedirected.current) {
        // Auth data was removed, redirect to login
        hasRedirected.current = true;
        setAuthorized(false);
        setLoading(false);
        router.replace(redirectTo);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router, redirectTo]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-200/20 dark:from-amber-900/10 dark:to-orange-900/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 dark:from-purple-900/10 dark:to-pink-900/10 rounded-full blur-3xl"></div>
        </div>

        <div className="text-center relative z-10">
          {/* Animated Logo/Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto relative">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 rounded-full border-4 border-amber-200 dark:border-amber-800 opacity-20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 dark:border-t-amber-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              
              {/* Middle rotating ring - opposite direction */}
              <div className="absolute inset-2 rounded-full border-4 border-orange-200 dark:border-orange-800 opacity-20"></div>
              <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-orange-500 dark:border-r-orange-600 border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            جاري التحقق من الصلاحيات
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            الرجاء الانتظار...
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-amber-500 dark:bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-orange-500 dark:bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-amber-500 dark:bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
