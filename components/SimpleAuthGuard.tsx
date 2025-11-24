'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { simpleAuthService } from '@/lib/auth/simpleAuth';

interface SimpleAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function SimpleAuthGuard({ 
  children, 
  requireAuth = true,
  allowedRoles = [],
  redirectTo = '/login'
}: SimpleAuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Initialize auth service
        simpleAuthService.initialize();
        
        // Check if authentication is required
        if (!requireAuth) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Check if user is authenticated
        if (!simpleAuthService.isAuthenticated()) {
          router.replace(redirectTo);
          setIsLoading(false);
          return;
        }

        // Check role-based access
        if (allowedRoles.length > 0) {
          const user = simpleAuthService.getUser();
          if (!user) {
            router.replace(redirectTo);
            setIsLoading(false);
            return;
          }

          const userRole = user.role || 'student';
          const hasAccess = allowedRoles.includes(userRole);
          
          if (!hasAccess) {
            // Redirect based on user role
            const roleRedirects: { [key: string]: string } = {
              'student': '/dashboard/student',
              'teacher': '/dashboard/teacher',
              'supervisor': '/dashboard/supervisor',
              'admin': '/dashboard/admin'
            };
            
            router.replace(roleRedirects[userRole] || '/dashboard');
            setIsLoading(false);
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        router.replace(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requireAuth, allowedRoles, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
