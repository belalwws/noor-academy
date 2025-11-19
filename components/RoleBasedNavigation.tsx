'use client';

import { useAppSelector } from '@/lib/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: string[];
}

const navigationItems: NavItem[] = [
  // Student Navigation
  {
    href: '/dashboard/student',
    label: 'لوحة التحكم',
    icon: '🏠',
    roles: ['student']
  },
  {
    href: '/courses',
    label: 'الدورات',
    icon: '📚',
    roles: ['student', 'teacher', 'supervisor']
  },
  {
    href: '/featured-courses',
    label: 'الدورات المميزة',
    icon: '⭐',
    roles: ['student', 'teacher', 'supervisor']
  },
  {
    href: '/testimonials',
    label: 'شهادات الطلاب',
    icon: '💬',
    roles: ['student', 'teacher', 'supervisor']
  },
  {
    href: '/faq',
    label: 'الأسئلة الشائعة',
    icon: '❓',
    roles: ['student', 'teacher', 'supervisor']
  },
  {
    href: '/assignments',
    label: 'الواجبات',
    icon: '📝',
    roles: ['student', 'teacher']
  },
  {
    href: '/progress',
    label: 'التقدم',
    icon: '📊',
    roles: ['student']
  },
  
  // Teacher Navigation
  {
    href: '/dashboard/teacher',
    label: 'لوحة تحكم المدرس',
    icon: '🧑‍🏫',
    roles: ['teacher']
  },
  {
    href: '/teacher/courses',
    label: 'إدارة الدورات',
    icon: '📖',
    roles: ['teacher']
  },
  {
    href: '/teacher/assignments',
    label: 'إدارة الواجبات',
    icon: '📋',
    roles: ['teacher']
  },
  {
    href: '/teacher/students',
    label: 'الطلاب',
    icon: '👥',
    roles: ['teacher']
  },
  {
    href: '/teacher/sessions',
    label: 'الجلسات المباشرة',
    icon: '🎥',
    roles: ['teacher']
  },
  
  // Supervisor Navigation
  {
    href: '/dashboard/supervisor',
    label: 'لوحة تحكم المشرف',
    icon: '👨‍💼',
    roles: ['supervisor']
  },
  {
    href: '/supervisor/teachers',
    label: 'إدارة المدرسين',
    icon: '👨‍🏫',
    roles: ['supervisor']
  },
  {
    href: '/supervisor/courses',
    label: 'مراجعة الدورات',
    icon: '✅',
    roles: ['supervisor']
  },
  {
    href: '/supervisor/reports',
    label: 'التقارير',
    icon: '📈',
    roles: ['supervisor']
  },
  
  // Common Navigation
  {
    href: '/profile',
    label: 'الملف الشخصي',
    icon: '👤',
    roles: ['student', 'teacher', 'supervisor']
  },
  {
    href: '/notifications',
    label: 'الإشعارات',
    icon: '🔔',
    roles: ['student', 'teacher', 'supervisor']
  },
  {
    href: '/help',
    label: 'المساعدة',
    icon: '❓',
    roles: ['student', 'teacher', 'supervisor']
  }
];

interface RoleBasedNavigationProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showIcons?: boolean;
  showForGuests?: boolean;
}

export default function RoleBasedNavigation({ 
  className = '', 
  orientation = 'horizontal',
  showIcons = true,
  showForGuests = false
}: RoleBasedNavigationProps) {
  const { user } = useAppSelector(state => state.auth);
  const pathname = usePathname();
  
  // Get user role from Redux or localStorage (client-side only)
  const currentUser = user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {});
  const userRole = currentUser.role || currentUser.user_type || null;
  
  // Public navigation items for non-authenticated users
  const publicItems = [
    {
      href: '/courses',
      label: 'الدورات',
      icon: '📚',
      roles: ['public']
    },
    {
      href: '/featured-courses',
      label: 'الدورات المميزة',
      icon: '⭐',
      roles: ['public']
    },
    {
      href: '/testimonials',
      label: 'شهادات الطلاب',
      icon: '💬',
      roles: ['public']
    },
    {
      href: '/faq',
      label: 'الأسئلة الشائعة',
      icon: '❓',
      roles: ['public']
    }
  ];
  
  // For guests, always show public items when showForGuests is true
  // For authenticated users, show role-based items
  const allowedItems = !userRole && showForGuests 
    ? publicItems 
    : userRole 
      ? navigationItems.filter(item => item.roles.includes(userRole))
      : [];
  
  const baseClasses = orientation === 'horizontal' 
    ? 'd-flex flex-wrap' 
    : 'd-flex flex-column';
    
  const itemClasses = orientation === 'horizontal'
    ? 'nav-link px-3 py-2 me-2'
    : 'nav-link px-4 py-3 mb-1';

  return (
    <nav className={`${baseClasses} ${className}`}>
      {allowedItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== '/' && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              ${itemClasses}
              ${isActive 
                ? 'active bg-primary text-white' 
                : 'text-light'
              }
              d-flex align-items-center
            `}
            style={{
              textDecoration: 'none',
              borderRadius: '0.375rem',
              transition: 'all 0.3s ease'
            }}
          >
            {showIcons && <span className="me-2" style={{ fontSize: '1.1rem' }}>{item.icon}</span>}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// Hook for getting role-specific navigation items
export function useRoleNavigation() {
  const { user } = useAppSelector(state => state.auth);
  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = currentUser.role || currentUser.user_type || 'student';
  
  return {
    userRole,
    navigationItems: navigationItems.filter(item => 
      item.roles.includes(userRole)
    ),
    getDashboardPath: () => {
      switch (userRole) {
        case 'teacher':
          return '/dashboard/teacher';
        case 'supervisor':
          return '/dashboard/supervisor';
        case 'student':
        default:
          return '/dashboard/student';
      }
    }
  };
}
