'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logout } from '@/lib/store';
import { clearAuthData } from '@/lib/auth';
import apiService from '@/lib/api';
import { getProxiedImageUrl } from '@/lib/imageUtils';

interface UserDropdownProps {
  className?: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ className = '' }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  


  // Load profile image on component mount
  useEffect(() => {
    const loadProfileImage = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        // First try to get from API
        const imageResponse = await apiService.getProfileImageUrls();
        
        // Handle both success and 404 (no images found) cases
        if (imageResponse && (imageResponse.success || (imageResponse.data && imageResponse.data.data))) {
          const actualData = imageResponse.data?.data || imageResponse.data || {};
          const imageUrl = actualData.profile_image_thumbnail_url ||
                          actualData.profile_image_url ||
                          actualData.image_url ||
                          actualData.url ||
                          actualData.profile_image ||
                          actualData.image ||
                          actualData.thumbnail_url ||
                          actualData.original_url ||
                          actualData.file_url;
          
          if (imageUrl && !imageUrl.includes('default-avatar') && imageUrl !== '/default-avatar.png') {
            console.log('✅ UserDropdown - Setting profile image from API:', imageUrl);
            setProfileImage(imageUrl);
            return;
          } else {
            console.log('⚠️ UserDropdown - Image URL is default avatar or invalid:', imageUrl);
          }
        }
        
        // Fallback to user object profile image
        const userImageUrl = (user as any)?.profile_image_thumbnail_url || 
                            (user as any)?.profile_image_url ||
                            user?.profile_image_url;
        
        if (userImageUrl && !userImageUrl.includes('default-avatar') && userImageUrl !== '/default-avatar.png') {
          console.log('✅ UserDropdown - Setting profile image from user object:', userImageUrl);
          setProfileImage(userImageUrl);
        } else {
          console.log('⚠️ UserDropdown - No valid profile image found, using initials');
        }
      } catch (error) {
        console.log('No profile image found, using fallback:', error);
        // Fallback to user object profile image
        const userImageUrl = (user as any)?.profile_image_thumbnail_url || 
                            (user as any)?.profile_image_url ||
                            user?.profile_image_url;
        
        if (userImageUrl && !userImageUrl.includes('default-avatar') && userImageUrl !== '/default-avatar.png') {
          setProfileImage(userImageUrl);
        }
      }
    };

    loadProfileImage();
  }, [isAuthenticated, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user role
  const getUserRole = () => {
    const userRole = user?.role || (user as any)?.user_type || (user as any)?.role || 'student';
    
    console.log('🔍 getUserRole - userRole:', userRole, 'user:', user);
    
    // If role is supervisor or general_supervisor, check supervisor_type from localStorage
    if (userRole === 'supervisor' || userRole === 'general_supervisor') {
      const supervisorType = localStorage.getItem('supervisor_type') || 'general';
      console.log('🔍 Supervisor type from localStorage:', supervisorType);
      
      if (supervisorType === 'academic') {
        return 'academic_supervisor';
      } else {
        return 'general_supervisor';
      }
    }
    
    // If already general_supervisor or academic_supervisor, return as is
    if (userRole === 'general_supervisor' || userRole === 'academic_supervisor') {
      return userRole;
    }
    
    return userRole;
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'teacher':
        return 'مدرس';
      case 'supervisor':
        return 'مشرف';
      case 'student':
      default:
        return 'طالب';
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher':
        return 'fas fa-chalkboard-teacher';
      case 'supervisor':
        return 'fas fa-user-tie';
      case 'student':
      default:
        return 'fas fa-user-graduate';
    }
  };

  // Get dashboard path
  const getDashboardPath = () => {
    const role = getUserRole();
    switch (role) {
      case 'teacher':
        return '/dashboard/teacher';
      case 'general_supervisor':
        return '/dashboard/supervisor/general';
      case 'academic_supervisor':
        return '/dashboard/supervisor/academic';
      case 'supervisor':
        // Fallback: check supervisor_type from localStorage
        const supervisorType = localStorage.getItem('supervisor_type') || 'general';
        return supervisorType === 'general' ? '/dashboard/supervisor/general' : '/dashboard/supervisor/academic';
      case 'student':
      default:
        return '/dashboard/student';
    }
  };

  // Get profile path
  const getProfilePath = () => {
    const role = getUserRole();
    let path;
    
    console.log('🔍 getProfilePath - role:', role, 'user:', user);
    
    // Try to get supervisor_type from multiple sources
    let supervisorType = localStorage.getItem('supervisor_type');
    
    // If not in localStorage, try to get it from user object or API
    if (!supervisorType) {
      // Check if user has supervisor_type property
      if ((user as any)?.supervisor_type) {
        supervisorType = (user as any).supervisor_type;
        localStorage.setItem('supervisor_type', supervisorType);
        console.log('💾 Saved supervisor_type to localStorage:', supervisorType);
      } else if (role === 'supervisor' || role === 'general_supervisor' || role === 'academic_supervisor') {
        // Default to general if supervisor but type not specified
        supervisorType = 'general';
        localStorage.setItem('supervisor_type', supervisorType);
        console.log('💾 Set default supervisor_type to general');
      }
    }
    
    supervisorType = supervisorType || 'general';
    console.log('🔍 localStorage supervisor_type:', supervisorType);
    
    // Check multiple sources to determine if it's general supervisor
    const isGeneralSupervisor = 
      role === 'general_supervisor' ||
      (role === 'supervisor' && supervisorType === 'general') ||
      (user as any)?.supervisor_type === 'general' ||
      (user as any)?.role === 'general_supervisor';
    
    console.log('🔍 isGeneralSupervisor:', isGeneralSupervisor, {
      role,
      supervisorType,
      userRole: (user as any)?.role,
      userSupervisorType: (user as any)?.supervisor_type
    });
    
    switch (role) {
      case 'teacher':
        path = '/dashboard/teacher?section=profile_personal';
        break;
      case 'general_supervisor':
        path = '/profile/general-supervisor';
        break;
      case 'academic_supervisor':
        path = '/profile/supervisor/academic';
        break;
      case 'supervisor':
        // Fallback: check supervisor_type from localStorage
        if (supervisorType === 'general') {
          path = '/profile/general-supervisor';
        } else {
          path = '/profile/supervisor';
        }
        break;
      case 'student':
      default:
        path = '/dashboard/student?section=profile_personal';
        break;
    }
    
    // Final check: if we determined it's general supervisor but path is wrong, fix it
    if (isGeneralSupervisor && path !== '/profile/general-supervisor') {
      console.log('⚠️ Fixing path - should be general supervisor');
      path = '/profile/general-supervisor';
    }
    
    console.log('🔗 Final profile path:', path);
    return path;
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.first_name || user?.last_name) {
      return `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    }
    return user?.username || 'مستخدم';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name === 'مستخدم') return 'م';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle logout
  const handleLogout = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      // Close dropdown first
      setIsOpen(false);
      
      // Clear local auth data (this now calls logout API internally)
      await clearAuthData();
      dispatch(logout());
      
      // Immediate redirect using replace for better UX
      router.replace('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still clear local data and redirect
      await clearAuthData();
      dispatch(logout());
      router.replace('/login');
    }
  };

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }
  const userRole = getUserRole();
  const displayName = getUserDisplayName();
  const initials = getUserInitials();

  return (
    <div className={`user-dropdown ${className}`} ref={dropdownRef}>
      <style jsx>{`
        .user-dropdown {
          position: relative;
        }
        
        .dropdown-toggle {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 50px;
          padding: 8px 16px;
          color: white;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          cursor: pointer;
          min-height: 48px;
        }
        
        .dropdown-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .dropdown-toggle:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
        }
        
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          flex-shrink: 0;
          overflow: hidden;
        }
        
        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
        }
        
        .user-name {
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }
        
        .user-role {
          font-size: 12px;
          opacity: 0.8;
          font-weight: 400;
        }
        
        .dropdown-arrow {
          transition: transform 0.3s ease;
          font-size: 12px;
        }
        
        .dropdown-arrow.open {
          transform: rotate(180deg);
        }
        
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
          min-width: 280px;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          margin-top: 8px;
        }
        
        .dropdown-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        
        .dropdown-header {
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
          text-align: center;
        }
        
        .header-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        
        .header-name {
          font-size: 16px;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 4px;
        }
        
        .header-email {
          font-size: 14px;
          color: #718096;
          margin-bottom: 8px;
        }
        
        .header-role {
          display: inline-flex;
          align-items: center;
          background: #f7fafc;
          color: #4a5568;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .dropdown-item {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          color: #4a5568;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: right;
          font-size: 14px;
        }
        
        .dropdown-item:hover {
          background: #f7fafc;
          color: #2d3748;
        }
        
        .dropdown-item i {
          margin-left: 12px;
          width: 16px;
          text-align: center;
          color: #718096;
        }
        
        .dropdown-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 8px 0;
        }
        
        .logout-item {
          color: #e53e3e;
          border-top: 1px solid #e2e8f0;
          margin-top: 8px;
        }
        
        .logout-item:hover {
          background: #fed7d7;
          color: #c53030;
        }
        
        .logout-item i {
          color: #e53e3e;
        }
      `}</style>
      
      <button
        className="dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="user-avatar">
          {profileImage && !profileImage.includes('default-avatar') && profileImage !== '/default-avatar.png' ? (
            <img 
              src={getProxiedImageUrl(profileImage, true)} 
              alt={displayName}
              onError={(e) => {
                const currentSrc = e.currentTarget.src
                // If backend proxy fails, try direct URL
                if (currentSrc.includes('/auth/image-proxy/')) {
                  e.currentTarget.src = profileImage
                } else {
                  // All attempts failed, hide image and show initials
                  e.currentTarget.style.display = 'none'
                  const avatarDiv = e.currentTarget.parentElement
                  if (avatarDiv && !avatarDiv.textContent?.trim()) {
                    avatarDiv.textContent = initials
                  }
                }
              }}
            />
          ) : (
            initials
          )}
        </div>
        
        <div className="user-info">
          <div className="user-name">{displayName}</div>
          <div className="user-role">{getRoleDisplayName(userRole)}</div>
        </div>
        
        <i className={`fas fa-chevron-down dropdown-arrow ${isOpen ? 'open' : ''}`}></i>
      </button>
      
      <div className={`dropdown-menu ${isOpen ? 'show' : ''}`}>
        {/* Header */}
        <div className="dropdown-header">
          <div className="header-avatar">
            {profileImage && !profileImage.includes('default-avatar') && profileImage !== '/default-avatar.png' ? (
              <img 
                src={getProxiedImageUrl(profileImage, true)} 
                alt={displayName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
                onError={(e) => {
                  const currentSrc = e.currentTarget.src
                  // If backend proxy fails, try direct URL
                  if (currentSrc.includes('/auth/image-proxy/')) {
                    e.currentTarget.src = profileImage
                  } else {
                    // All attempts failed, hide image and show initials
                    e.currentTarget.style.display = 'none'
                    const avatarDiv = e.currentTarget.parentElement
                    if (avatarDiv && !avatarDiv.textContent?.trim()) {
                      avatarDiv.textContent = initials
                      avatarDiv.style.display = 'flex'
                      avatarDiv.style.alignItems = 'center'
                      avatarDiv.style.justifyContent = 'center'
                    }
                  }
                }}
              />
            ) : (
              initials
            )}
          </div>
          <div className="header-name">{displayName}</div>
          <div className="header-email">{user.email}</div>
          <div className="header-role">
            <i className={getRoleIcon(userRole)} style={{marginLeft: '6px'}}></i>
            {getRoleDisplayName(userRole)}
          </div>
        </div>
        
        {/* Menu Items */}
        <Link
          href={getProfilePath()}
          className="dropdown-item"
          onClick={(e) => {
            const profilePath = getProfilePath();
            const currentRole = getUserRole();
            console.log('🔗 Navigating to profile path:', profilePath);
            console.log('🔗 Current role:', currentRole);
            console.log('🔗 Link href:', e.currentTarget.href);
            setIsOpen(false);
            
            // Force navigation if path is wrong
            if (!profilePath.includes('/profile/general-supervisor')) {
              const supervisorType = localStorage.getItem('supervisor_type') || 'general';
              const isGeneralSupervisor = 
                currentRole === 'general_supervisor' ||
                (currentRole === 'supervisor' && supervisorType === 'general') ||
                (user as any)?.supervisor_type === 'general' ||
                (user as any)?.role === 'general_supervisor';
              
              if (isGeneralSupervisor) {
                console.log('⚠️ Forcing navigation to /profile/general-supervisor');
                e.preventDefault();
                window.location.href = '/profile/general-supervisor';
              }
            }
          }}
        >
          <i className="fas fa-user"></i>
          المعلومات الشخصية
        </Link>
        
        <Link href="/notifications" className="dropdown-item" onClick={() => setIsOpen(false)}>
          <i className="fas fa-bell"></i>
          الإشعارات
        </Link>
        
        <Link href={getDashboardPath()} className="dropdown-item" onClick={() => setIsOpen(false)}>
          <i className="fas fa-tachometer-alt"></i>
          لوحة التحكم
        </Link>
        
        {/* Role-specific items */}
        {userRole === 'teacher' && (
          <>
            <Link href="/teacher/courses" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <i className="fas fa-book"></i>
              إدارة الدورات
            </Link>
            <Link href="/teacher/students" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <i className="fas fa-users"></i>
              الطلاب
            </Link>
          </>
        )}
        
        {userRole === 'supervisor' && (
          <>
            <Link href="/supervisor/teachers" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <i className="fas fa-chalkboard-teacher"></i>
              إدارة المدرسين
            </Link>
            <Link href="/supervisor/reports" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <i className="fas fa-chart-bar"></i>
              التقارير
            </Link>
          </>
        )}
        
        <div className="dropdown-divider"></div>
        
        <button 
          type="button"
          onClick={handleLogout} 
          className="dropdown-item logout-item"
        >
          <i className="fas fa-sign-out-alt"></i>
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
