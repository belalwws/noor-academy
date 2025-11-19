'use client';

import { useEffect } from 'react';
import { useAppSelector } from '../../lib/hooks';
import { useRouter } from 'next/navigation';
import { refreshAccessToken } from '../../lib/auth';

export default function ProfilePage() {
  console.log('🚀 ProfilePage Component Loaded - Starting Debug');
  
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  
  console.log('🔍 Initial Auth State:', {
    isAuthenticated,
    hasUser: !!user,
    userId: user?.id,
    userRole: user?.role
  });

  // Redirect to role-specific profile page
  useEffect(() => {
    const redirectToRoleProfile = async () => {
      // Check authentication first
      if (!isAuthenticated) {
        const refreshSuccess = await refreshAccessToken();
        if (!refreshSuccess) {
          router.push('/login');
          return;
        }
      }

      // Get user role and redirect to appropriate profile page
      if (user?.role) {
        // Check supervisor_type from localStorage for supervisors
        const supervisorType = localStorage.getItem('supervisor_type') || 'general';
        const isGeneralSupervisor = 
          user.role === 'general_supervisor' ||
          (user.role === 'supervisor' && supervisorType === 'general') ||
          (user as any)?.supervisor_type === 'general';
        
        const roleRoutes: Record<string, string> = {
          student: '/profile/student',
          teacher: '/profile/teacher',
          supervisor: isGeneralSupervisor ? '/profile/general-supervisor' : '/profile/supervisor',
          general_supervisor: '/profile/general-supervisor',
          academic_supervisor: '/profile/supervisor/academic',
          admin: '/profile/admin'
        };
        
        const targetRoute = roleRoutes[user.role] || (isGeneralSupervisor ? '/profile/general-supervisor' : null);
        if (targetRoute) {
          console.log(`Redirecting ${user.role} to ${targetRoute}`);
          router.replace(targetRoute);
          return;
        }
      }
      
      // Fallback: redirect to student profile if role is unknown
      console.log('Unknown role, redirecting to student profile');
      router.replace('/profile/student');
    };

    redirectToRoleProfile();
  }, [isAuthenticated, user, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري تحميل الملف الشخصي...</p>
      </div>
    </div>
  );
}
