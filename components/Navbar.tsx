'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSimpleAuth } from '@/lib/hooks/useSimpleAuth';
import NotificationCenter from './NotificationCenter';
import { getProxiedImageUrl } from '@/lib/imageUtils';

// Helper to conditionally log only in development
const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

export default function Navbar() {
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const profileImageCache = useRef<{ [key: string]: string }>({});
  const lastLoadTime = useRef<number>(0);

  // Get current pathname to check if we should hide auth buttons
  const pathname = usePathname();
  
  // Get user data from auth hook
  const { user, isAuthenticated, logout } = useSimpleAuth();
  
  // User authentication state from useSimpleAuth
  
  // Pages where auth buttons should be hidden
  const hideAuthButtonsPages = [
    '/', // Home page (has hero section with auth buttons)
    '/login',
    '/register', 
    '/teacher-register',
    '/teacher',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/change-password'
  ];
  
  // Check if current page should hide auth buttons
  const shouldHideAuthButtons = hideAuthButtonsPages.some(path => {
    // Special case for home page - exact match only
    if (path === '/') {
      return pathname === '/';
    }
    // For other pages, use startsWith for flexibility with sub-routes
    return pathname?.startsWith(path);
  });

  // Profile image state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Initialize profile image from user object immediately when user is available
  useEffect(() => {
    if (user) {
      const userImageUrl = (user as any)?.profile_image_thumbnail_url || 
                          (user as any)?.profile_image_url ||
                          (user as any)?.profile_image;
      if (userImageUrl && !userImageUrl.includes('default-avatar') && userImageUrl !== '/default-avatar.png') {
        setProfileImage(userImageUrl);
      }
    }
  }, [user]); // Always update when user changes

  // Load profile image like in student dashboard
  useEffect(() => {
    const loadProfileImage = async () => {
      if (!user?.id || !isAuthenticated) {
        // Try to get image from user object directly as last resort
        const userImageUrl = (user as any)?.profile_image_thumbnail_url || 
                            (user as any)?.profile_image_url ||
                            (user as any)?.profile_image;
        if (userImageUrl && !userImageUrl.includes('default-avatar') && userImageUrl !== '/default-avatar.png') {
          setProfileImage(userImageUrl);
        }
        return;
      }
      
      const userId = user.id.toString();
      const now = Date.now();
      const CACHE_DURATION = 30000; // 30 seconds cache
      
      // Check cache first
      if (profileImageCache.current[userId] && (now - lastLoadTime.current) < CACHE_DURATION) {
        setProfileImage(profileImageCache.current[userId]);
        return;
      }
      
      try {
        // Get auth token
        const { getAuthToken } = await import('@/lib/auth');
        const token = getAuthToken();
        
        if (!token) {
          return;
        }
        
        // Fetch signed URLs from the new endpoint
        const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/image/urls/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok || response.status === 404) {
          const data = await response.json();
          
          // Handle both success and 404 (no images found) cases
          if (data && (data.success || (data.data && data.data))) {
            const actualData = data.data?.data || data.data || {};
            // Use thumbnail URL (preferred) or full URL
            const imageUrl = actualData.profile_image_thumbnail_url || 
                            actualData.profile_image_url ||
                            data.data?.profile_image_thumbnail_url ||
                            data.data?.profile_image_url;
            
            if (imageUrl && !imageUrl.includes('default-avatar') && imageUrl !== '/default-avatar.png') {
              setProfileImage(imageUrl);
              profileImageCache.current[userId] = imageUrl;
              lastLoadTime.current = now;
            } else {
              // Fallback to user object profile image
              const userImageUrl = (user as any)?.profile_image_thumbnail_url || 
                                  (user as any)?.profile_image_url;
              if (userImageUrl && !userImageUrl.includes('default-avatar') && userImageUrl !== '/default-avatar.png') {
                setProfileImage(userImageUrl);
                profileImageCache.current[userId] = userImageUrl;
                lastLoadTime.current = now;
              } else {
                setProfileImage(null);
              }
            }
          } else {
            // Try fallback to user object
            const userImageUrl = (user as any)?.profile_image_thumbnail_url || 
                                (user as any)?.profile_image_url;
            if (userImageUrl && !userImageUrl.includes('default-avatar') && userImageUrl !== '/default-avatar.png') {
              setProfileImage(userImageUrl);
              profileImageCache.current[userId] = userImageUrl;
              lastLoadTime.current = now;
            }
          }
        } else {
          // Try fallback to user object
          const userImageUrl = (user as any)?.profile_image_thumbnail_url || 
                              (user as any)?.profile_image_url;
          if (userImageUrl && !userImageUrl.includes('default-avatar') && userImageUrl !== '/default-avatar.png') {
            setProfileImage(userImageUrl);
            profileImageCache.current[userId] = userImageUrl;
            lastLoadTime.current = now;
          }
        }
      } catch (error) {
        // Try fallback to user object even on error
        const userImageUrl = (user as any)?.profile_image_thumbnail_url || 
                            (user as any)?.profile_image_url;
        if (userImageUrl && !userImageUrl.includes('default-avatar') && userImageUrl !== '/default-avatar.png') {
          setProfileImage(userImageUrl);
          profileImageCache.current[userId] = userImageUrl;
          lastLoadTime.current = Date.now();
        }
      }
    };

    loadProfileImage();
    
    // Listen for profile image updates
    const handleProfileImageUpdate = (event: CustomEvent) => {
      if (event.detail?.imageUrl) {
        setProfileImage(event.detail.imageUrl);
        // Update cache
        if (user?.id) {
          profileImageCache.current[user.id.toString()] = event.detail.imageUrl;
          lastLoadTime.current = Date.now();
        }
      }
    };
    
    window.addEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener);
    
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener);
    };
  }, [user, isAuthenticated, user?.id]); // Include user?.id to trigger on user changes

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isDropdownOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
    return undefined;
  }, [isDropdownOpen]);

  // Get user display name
  const getUserName = () => {
    if (!user) return 'المستخدم';
    return user.full_name ||
           `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
           user.username ||
           'المستخدم';
  };

  // Get user avatar letter
  const getAvatarLetter = () => {
    if (!user) return 'م';
    return user.first_name?.charAt(0) ||
           user.full_name?.charAt(0) ||
           user.username?.charAt(0) ||
           'م';
  };

  // Get user role in Arabic
  const getUserRole = () => {
    if (!user?.role) return '';
    const roleMap: Record<string, string> = {
      'student': 'طالب',
      'teacher': 'مدرس',
      'supervisor': 'مشرف',
      'general_supervisor': 'مشرف عام',
      'academic_supervisor': 'مشرف أكاديمي',
      'admin': 'مدير'
    };
    return roleMap[user.role] || user.role;
  };

  // Get profile URL based on user role
  const getProfileUrl = () => {
    if (!user?.role) return '/profile';
    
    switch (user.role) {
      case 'supervisor':
      case 'general_supervisor':
        return '/profile/supervisor/general';
      case 'academic_supervisor':
        return '/profile/supervisor/academic';
      case 'teacher':
        return '/profile/teacher';
      case 'student':
        return '/profile/student';
      case 'admin':
        return '/profile/admin';
      default:
        return '/profile';
    }
  };

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm gradient-navbar" style={{
        minHeight: '70px'
      }}>
        <div className="container-fluid px-3">
          {/* Brand */}
          <Link className="navbar-brand d-flex align-items-center" href="/">
            <i className="fas fa-mosque me-2 fs-4"></i>
            <span style={{ fontFamily: 'Cairo, sans-serif', fontWeight: 600, fontSize: '1.25rem' }}>
              أكاديمية رُشد
            </span>
          </Link>



          {/* Center - Navigation Menu */}
          {/* <div className="navbar-nav d-none d-lg-flex flex-row mx-auto">
            <Link href="/courses" className="nav-link text-white mx-2 d-flex align-items-center px-3 py-2 rounded-pill">
              <i className="fas fa-book me-2"></i>
              الدورات
            </Link>
            <Link href="/community" className="nav-link text-white mx-2 d-flex align-items-center px-3 py-2 rounded-pill">
              <i className="fas fa-users me-2"></i>
              المجتمع التفاعلي
            </Link>
            <Link href="/featured-courses" className="nav-link text-white mx-2 d-flex align-items-center px-3 py-2 rounded-pill">
              <i className="fas fa-star me-2"></i>
              الدورات المميزة
            </Link>
            <Link href="/testimonials" className="nav-link text-white mx-2 d-flex align-items-center px-3 py-2 rounded-pill">
              <i className="fas fa-comments me-2"></i>
              شهادات الطلاب
            </Link>
            <Link href="/faq" className="nav-link text-white mx-2 d-flex align-items-center px-3 py-2 rounded-pill">
              <i className="fas fa-question-circle me-2"></i>
              الأسئلة الشائعة
            </Link>
          </div> */}

          {/* Right side - Auth section */}
          <div className="d-flex align-items-center">
            {!isAuthenticated || !user ? (
              // Not authenticated - show login/register buttons (unless on auth pages)
              !shouldHideAuthButtons && (
                <div className="d-flex align-items-center gap-2">
                  <Link
                    className="btn btn-outline-light btn-sm px-3"
                    href="/login"
                    style={{ borderRadius: '20px' }}
                  >
                    <i className="fas fa-sign-in-alt me-1"></i>
                    تسجيل الدخول
                  </Link>
                  <Link
                    className="btn btn-light btn-sm px-3 text-blue fw-bold"
                    href="/register"
                    style={{ borderRadius: '20px' }}
                  >
                    إنشاء حساب
                  </Link>
                </div>
              )
            ) : (
              // Authenticated - show notifications and user dropdown
              <div className="d-flex align-items-center gap-2">
                {/* Notification Center */}
                <NotificationCenter />

                {/* User Dropdown */}
                <div className="position-relative">
                <button
                  ref={buttonRef}
                  className="btn btn-outline-light d-flex align-items-center px-3 py-2"
                  onClick={toggleDropdown}
                  style={{
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '25px',
                    background: isDropdownOpen
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isDropdownOpen ? 'scale(1.05) translateY(-1px)' : 'scale(1)',
                    boxShadow: isDropdownOpen
                      ? '0 12px 30px rgba(0,0,0,0.2), 0 4px 15px rgba(40,167,69,0.3)'
                      : '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Avatar */}
                  <div className="me-2">
                    <div className="position-relative">
                      {profileImage ? (
                        <>
                          <img
                            src={getProxiedImageUrl(profileImage!, true)}
                            alt={getUserName()}
                            className="rounded-circle"
                            style={{
                              width: '35px',
                              height: '35px',
                              border: '2px solid rgba(255,255,255,0.3)',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const currentSrc = (e.target as HTMLImageElement).src
                              const originalUrl = profileImage
                              // If backend proxy fails, try direct URL
                              if (currentSrc.includes('/auth/image-proxy/')) {
                                (e.target as HTMLImageElement).src = originalUrl
                              } else {
                                // All attempts failed, hide image and show fallback
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }
                            }}
                          />
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
                            style={{
                              width: '35px',
                              height: '35px',
                              border: '2px solid rgba(255,255,255,0.3)',
                              fontSize: '14px',
                              display: 'none'
                            }}
                          >
                            {getAvatarLetter()}
                          </div>
                        </>
                      ) : (
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
                          style={{
                            width: '35px',
                            height: '35px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            fontSize: '14px'
                          }}
                        >
                          {getAvatarLetter()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User name */}
                  <span className="text-white me-2" style={{ fontSize: '14px', fontWeight: '500' }}>
                    {getUserName()}
                  </span>

                  {/* Dropdown arrow */}
                  <i className="fas fa-chevron-down text-white"
                     style={{
                       fontSize: '12px',
                       transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                       transform: isDropdownOpen ? 'rotate(180deg) scale(1.2)' : 'rotate(0deg) scale(1)'
                     }}></i>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="position-absolute bg-white dark:bg-slate-800 rounded-3 shadow-2xl border-0"
                    style={{
                      top: '100%',
                      left: '0',
                      width: '340px',
                      maxWidth: '90vw',
                      zIndex: 999999,
                      animation: 'dropdownSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                      direction: 'rtl',
                      boxShadow: '0 25px 70px rgba(0,0,0,0.2), 0 10px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      maxHeight: '80vh',
                      overflowY: 'hidden',
                      marginTop: '12px',
                      transformOrigin: 'top left',
                      backdropFilter: 'blur(20px)',
                      background: 'rgba(255, 255, 255, 0.99)',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#e2e8f0 transparent',
                      msOverflowStyle: 'none'
                    }}
                  >
                    {/* User Info Header */}
                    <div className="p-4 border-bottom dark:border-slate-700" style={{
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 100%)',
                      borderRadius: '1rem 1rem 0 0',
                      borderBottom: '1px solid rgba(0,0,0,0.08)'
                    }}>
                      <div className="d-flex align-items-center">
                        {/* User Avatar/Image */}
                        <div className="position-relative me-3">
                          <div className="position-relative">
                            {profileImage ? (
                              <>
                                <img
                                  src={getProxiedImageUrl(profileImage!, true)}
                                  alt={getUserName()}
                                  className="rounded-circle"
                                  style={{
                                    width: '50px',
                                    height: '50px',
                                    border: '3px solid var(--color-secondary)',
                                    objectFit: 'cover',
                                    display: 'block'
                                  }}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    const currentSrc = (e.target as HTMLImageElement).src
                                    const originalUrl = profileImage
                                    // If backend proxy fails, try direct URL
                                    if (currentSrc.includes('/auth/image-proxy/')) {
                                      (e.target as HTMLImageElement).src = originalUrl
                                    } else {
                                      // All attempts failed, hide image and show fallback
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const fallback = target.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }
                                  }}
                                />
                                <div 
                                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                  style={{
                                    width: '50px',
                                    height: '50px',
                                    border: '3px solid var(--color-secondary)',
                                    backgroundColor: 'var(--color-secondary)',
                                    fontSize: '18px',
                                    display: 'none'
                                  }}
                                >
                                  {getAvatarLetter()}
                                </div>
                              </>
                            ) : (
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  border: '3px solid var(--color-secondary)',
                                  backgroundColor: 'var(--color-secondary)',
                                  fontSize: '18px'
                                }}
                              >
                                {getAvatarLetter()}
                              </div>
                            )}
                            {/* Online indicator */}
                            <div
                              className="position-absolute rounded-circle"
                              style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: 'var(--color-success)',
                                border: '3px solid white',
                                bottom: '2px',
                                right: '2px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                animation: 'pulse 2s infinite'
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-grow-1">
                          <div className="fw-bold text-dark dark:text-slate-100 mb-1" style={{ fontSize: '17px', fontWeight: '600' }}>
                            {getUserName()}
                          </div>
                          <div className="text-muted dark:text-slate-400 small mb-1" style={{ fontSize: '13px', opacity: '0.8' }}>
                            {user?.email || 'user@example.com'}
                          </div>
                          {getUserRole() && (
                            <div className="d-inline-block mt-1">
                              <span
                                className="badge px-2 py-1 shadow-sm gradient-navbar"
                                style={{
                                  fontSize: '11px',
                                  color: 'white',
                                  fontWeight: '500'
                                }}
                              >
                                <i className="fas fa-user-tag me-1"></i>
                                {getUserRole()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div 
                      className="py-2 hide-scrollbar" 
                      style={{ 
                        padding: '8px 0',
                        maxHeight: '60vh',
                        overflowY: 'auto',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#e2e8f0 transparent'
                      }}
                    >
                      <Link
                        href={getProfileUrl()}
                        className="dropdown-item d-flex align-items-center px-4 py-3 text-decoration-none text-dark dark:text-slate-200"
                        onClick={closeDropdown}
                        style={{
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          borderRadius: '10px',
                          fontSize: '14px',
                          margin: '4px 12px',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f1f5f9';
                          e.currentTarget.style.transform = 'translateX(-4px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm"
                          style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            transition: 'all 0.25s ease',
                            boxShadow: '0 2px 6px rgba(25, 118, 210, 0.2)'
                          }}
                        >
                          <i className="fas fa-user" style={{ fontSize: '15px' }}></i>
                        </div>
                        <span className="fw-500">الملف الشخصي</span>
                      </Link>

                      <Link
                        href="/dashboard"
                        className="dropdown-item d-flex align-items-center px-4 py-3 text-decoration-none text-dark dark:text-slate-200"
                        onClick={closeDropdown}
                        style={{
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          borderRadius: '10px',
                          fontSize: '14px',
                          margin: '4px 12px',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f1f5f9';
                          e.currentTarget.style.transform = 'translateX(-4px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm"
                          style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: '#e8f5e8',
                            color: '#2e7d32',
                            transition: 'all 0.25s ease',
                            boxShadow: '0 2px 6px rgba(46, 125, 50, 0.2)'
                          }}
                        >
                          <i className="fas fa-tachometer-alt" style={{ fontSize: '15px' }}></i>
                        </div>
                        <span className="fw-500">لوحة التحكم</span>
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          href="/dashboard/supervisor"
                          className="dropdown-item d-flex align-items-center px-4 py-3 text-decoration-none text-dark dark:text-slate-200"
                          onClick={closeDropdown}
                          style={{
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '10px',
                            fontSize: '14px',
                            margin: '4px 12px',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                            e.currentTarget.style.transform = 'translateX(-4px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm"
                            style={{
                              width: '36px',
                              height: '36px',
                              backgroundColor: '#ffebee',
                              color: '#c62828',
                              transition: 'all 0.25s ease',
                              boxShadow: '0 2px 6px rgba(198, 40, 40, 0.2)'
                            }}
                          >
                            <i className="fas fa-cogs" style={{ fontSize: '15px' }}></i>
                          </div>
                          <span className="fw-500">لوحة الإدارة</span>
                        </Link>
                      )}



                      <hr className="dropdown-divider mx-4 my-3 dark:border-slate-700" style={{ 
                        opacity: 0.15, 
                        borderColor: '#e2e8f0',
                        margin: '12px 20px',
                        borderTopWidth: '1px'
                      }} />

                      <button
                        className="dropdown-item d-flex align-items-center px-4 py-3 text-danger border-0 bg-transparent w-100 dark:text-red-400"
                        onClick={() => {
                          closeDropdown();
                          logout();
                        }}
                        style={{
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          borderRadius: '10px',
                          fontSize: '14px',
                          margin: '4px 12px',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.transform = 'translateX(-4px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm"
                          style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            transition: 'all 0.25s ease',
                            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.2)'
                          }}
                        >
                          <i className="fas fa-sign-out-alt" style={{ fontSize: '15px' }}></i>
                        </div>
                        <span className="fw-500">تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>



      {/* Custom Styles */}
      <style jsx>{`
        @keyframes dropdownSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-15px) scale(0.9);
            filter: blur(2px);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-5px) scale(0.98);
            filter: blur(1px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }

        @keyframes pulse {
          0% {
            box-shadow: 0 2px 4px rgba(0,0,0,0.2), 0 0 0 0 rgba(40, 167, 69, 0.7);
          }
          70% {
            box-shadow: 0 2px 4px rgba(0,0,0,0.2), 0 0 0 6px rgba(40, 167, 69, 0);
          }
          100% {
            box-shadow: 0 2px 4px rgba(0,0,0,0.2), 0 0 0 0 rgba(40, 167, 69, 0);
          }
        }
        }

        .dropdown-item {
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa !important;
          transform: translateX(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .dropdown-item:hover .rounded-circle {
          transform: scale(1.15);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .dropdown-item:active {
          transform: translateX(-1px) scale(0.98);
        }

        .nav-link:hover {
          background-color: rgba(255,255,255,0.1) !important;
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }

        .navbar-brand:hover {
          transform: scale(1.02);
          transition: transform 0.2s ease;
        }
      `}</style>
    </>
  );
}
