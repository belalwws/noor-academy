'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X, ChevronDown, Moon, Sun, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/store/hooks/useTheme';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [dashboardLink, setDashboardLink] = useState('/dashboard');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in
    const checkAuthState = async () => {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');
      if (token && user) {
        setIsLoggedIn(true);
        try {
          const userData = JSON.parse(user);
          setUserName(userData.first_name || userData.email);
          setUserRole(userData.role || '');
          
          // Load profile image - fetch fresh signed URLs from API
          try {
            const { apiService } = await import('@/lib/api');
            
            const imageResponse = await apiService.getProfileImageUrls();
            
            if (imageResponse.success && imageResponse.data) {
              // The actual URLs are in imageResponse.data.data (nested structure)
              const actualData = imageResponse.data.data || imageResponse.data;
              
              const signedUrl = actualData.profile_image_thumbnail_url || 
                              actualData.profile_image_url;
              
              if (signedUrl) {
                // Check if it's a real image (not default avatar path)
                const isDefaultAvatar = signedUrl === '/default-avatar.png' || 
                                       signedUrl.includes('/default-avatar.png') ||
                                       signedUrl.endsWith('default-avatar.png');
                
                if (!isDefaultAvatar) {
                  setProfileImage(signedUrl);
                } else {
                  setProfileImage(null);
                }
              } else {
                setProfileImage(null);
              }
            } else {
              // Fallback to localStorage
              const userImageUrl = userData.profile_image_thumbnail_url || 
                                  userData.profile_image_url ||
                                  userData.profile_image;
              if (userImageUrl && !userImageUrl.includes('default-avatar') && userImageUrl !== '/default-avatar.png') {
                setProfileImage(userImageUrl);
              }
            }
          } catch (error) {
            // Fallback to localStorage
            const userImageUrl = userData.profile_image_thumbnail_url || 
                                userData.profile_image_url ||
                                userData.profile_image;
            if (userImageUrl && !userImageUrl.includes('default-avatar') && userImageUrl !== '/default-avatar.png') {
              setProfileImage(userImageUrl);
            }
          }
          
          // Determine dashboard link based on user role
          if (userData.role === 'teacher') {
            // Check teacher status
            try {
              const { getApiUrl } = await import('@/lib/config');
              const statusResponse = await fetch(getApiUrl('/teachers/join-request/status/'), {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              
              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                const joinStatus = statusData.data || statusData;
                
                // If teacher has pending request or is not active, link to choose-supervisor
                if (joinStatus.has_pending_request || !joinStatus.is_active_teacher) {
                  setDashboardLink('/choose-supervisor');
                } else {
                  setDashboardLink('/dashboard/teacher');
                }
              } else {
                setDashboardLink('/choose-supervisor');
              }
            } catch (error) {
              setDashboardLink('/choose-supervisor');
            }
          } else {
            // For other roles, use default dashboard
            setDashboardLink('/dashboard');
          }
        } catch (e) {
          setUserName('المستخدم');
          setUserRole('');
          setDashboardLink('/dashboard');
        }
      } else {
        setIsLoggedIn(false);
        setUserName('');
        setUserRole('');
        setDashboardLink('/dashboard');
      }
    };
    
    // Initial check
    checkAuthState();
    
    // Listen for auth state changes
    const handleAuthChange = () => {
      checkAuthState();
    };
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'access_token') {
        checkAuthState();
      }
    };
    
    const handleProfileImageUpdate = async (event: any) => {
      // Fetch fresh signed URLs from API
      try {
        const { apiService } = await import('@/lib/api');
        
        const imageResponse = await apiService.getProfileImageUrls();
        
        if (imageResponse.success && imageResponse.data) {
          const signedUrl = imageResponse.data.profile_image_thumbnail_url || 
                          imageResponse.data.profile_image_url;
          
          if (signedUrl) {
            setProfileImage(signedUrl);
            
            // Update user in localStorage with signed URL
            const userStr = localStorage.getItem('user');
            if (userStr) {
              try {
                const user = JSON.parse(userStr);
                user.profile_image_thumbnail_url = imageResponse.data.profile_image_thumbnail_url;
                user.profile_image_url = imageResponse.data.profile_image_url;
                localStorage.setItem('user', JSON.stringify(user));
              } catch (e) {
                // Failed to update user in localStorage
              }
            }
          }
        }
      } catch (error) {
        // Fallback to event data if API call fails
        const { imageUrl } = event.detail || {};
        if (imageUrl) {
          setProfileImage(imageUrl);
        }
      }
    };
    
    window.addEventListener('authStateChanged', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Import clearAuthData from auth service
      const { clearAuthData } = await import('@/lib/auth');
      
      // Clear auth data (this now calls logout API internally)
      await clearAuthData();
      
      // Update local state
      setIsLoggedIn(false);
      setUserName('');
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('authStateChanged'));
      
      // Redirect to home
      router.push('/');
    } catch (error) {
      // Fallback: clear localStorage manually
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokens');
      localStorage.removeItem('refresh_token');
      setIsLoggedIn(false);
      setUserName('');
      window.dispatchEvent(new Event('authStateChanged'));
      router.push('/');
    }
  };

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname?.startsWith(href)) return true;
    return false;
  };

  const navItems = [
    { label: 'الرئيسية', href: '/' },
    { label: 'عن الأكاديمية', href: '/about' },
    { label: 'تواصل معنا', href: '/contact-us' },
  ];

  // قائمة الدورات
  const coursesMenu = [
    { label: 'دورات مباشرة', href: '/live-courses', icon: '🎥' },
    { label: 'دورات مسجلة', href: '/recorded-courses', icon: '📹' },
  ];

  const islamicTools = [
    { label: 'منطقة الذكر والتسبيح', href: '/dhikr' },
    { label: 'مواقيت الصلاة', href: '/prayer-times' },
    { label: 'قارئ القرآن الكريم', href: '/quran' },
    { label: 'الحديث اليومي', href: '/hadith' },
  ];

  return (
    <header className="fixed top-0 right-0 left-0 z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-soft border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link href="/">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <Image
                src="/logo.png"
                alt="شعار أكاديمية نور"
                width={48}
                height={48}
                className="object-contain rounded-xl shadow-glow"
                priority
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-[#1e40af] dark:text-blue-400">أكاديمية نور</h1>
                <p className="text-xs text-[#555555] dark:text-slate-400">نور يهتدي به في دروب الحياة</p>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center min-w-0">
            {/* الرئيسية */}
            <Link href="/">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 * 0.1 }}
                className={`font-medium transition-colors cursor-pointer relative pb-1 ${
                  isActive('/')
                    ? 'text-[#1e40af] dark:text-blue-400 border-b-2 border-[#1e40af] dark:border-blue-400'
                    : 'text-[#222222] dark:text-slate-200 hover:text-[#1e40af] dark:hover:text-blue-400'
                }`}
              >
                الرئيسية
              </motion.span>
            </Link>

            {/* الدورات Dropdown */}
            <div className="relative group/courses">
              <button className="text-[#222222] dark:text-slate-200 hover:text-[#1e40af] dark:hover:text-blue-400 font-medium transition-colors flex items-center gap-1 py-2">
                الدورات
                <ChevronDown size={16} className="group-hover/courses:rotate-180 transition-transform" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-0 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-glow z-50 opacity-0 invisible group-hover/courses:opacity-100 group-hover/courses:visible transition-all duration-300 pointer-events-none group-hover/courses:pointer-events-auto border border-gray-200 dark:border-slate-600">
                {coursesMenu.map((course, idx) => (
                  <Link
                    key={course.label}
                    href={course.href}
                    className={`block px-6 py-4 text-[#555555] dark:text-slate-300 hover:text-[#1e40af] dark:hover:text-blue-400 hover:bg-[#1e40af]/5 dark:hover:bg-blue-400/10 transition-colors font-medium ${
                      idx === 0 ? 'rounded-t-2xl pt-6' : ''
                    } ${idx === coursesMenu.length - 1 ? 'rounded-b-2xl pb-6' : ''}`}
                  >
                    <span className="mr-2">{course.icon}</span>
                    {course.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* الألعاب التفاعلية */}
            <Link href="/interactive-learning">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 * 0.1 }}
                className={`font-medium transition-colors cursor-pointer relative pb-1 ${
                  isActive('/interactive-learning')
                    ? 'text-[#1e40af] dark:text-blue-400 border-b-2 border-[#1e40af] dark:border-blue-400'
                    : 'text-[#222222] dark:text-slate-200 hover:text-[#1e40af] dark:hover:text-blue-400'
                }`}
              >
                الألعاب التفاعلية
              </motion.span>
            </Link>

            {/* الأدوات الإسلامية Dropdown */}
            <div className="relative group/islamic">
              <button className="text-[#222222] dark:text-slate-200 hover:text-[#1e40af] dark:hover:text-blue-400 font-medium transition-colors flex items-center gap-1 py-2">
                الأدوات الإسلامية
                <ChevronDown size={16} className="group-hover/islamic:rotate-180 transition-transform" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-0 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-glow z-50 opacity-0 invisible group-hover/islamic:opacity-100 group-hover/islamic:visible transition-all duration-300 pointer-events-none group-hover/islamic:pointer-events-auto border border-gray-200 dark:border-slate-600">
                {islamicTools.map((tool, idx) => (
                  <Link
                    key={tool.label}
                    href={tool.href}
                    className={`block px-6 py-4 text-[#555555] dark:text-slate-300 hover:text-[#1e40af] dark:hover:text-blue-400 hover:bg-[#1e40af]/5 dark:hover:bg-blue-400/10 transition-colors font-medium ${
                      idx === 0 ? 'rounded-t-2xl pt-6' : ''
                    } ${idx === islamicTools.length - 1 ? 'rounded-b-2xl pb-6' : ''}`}
                  >
                    {tool.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* عن الأكاديمية */}
            <Link href="/about">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 4 * 0.1 }}
                className={`font-medium transition-colors cursor-pointer relative pb-1 ${
                  isActive('/about')
                    ? 'text-[#1e40af] dark:text-blue-400 border-b-2 border-[#1e40af] dark:border-blue-400'
                    : 'text-[#222222] dark:text-slate-200 hover:text-[#1e40af] dark:hover:text-blue-400'
                }`}
              >
                عن الأكاديمية
              </motion.span>
            </Link>

            {/* تواصل معنا */}
            <Link href="/contact-us">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 5 * 0.1 }}
                className={`font-medium transition-colors cursor-pointer relative pb-1 ${
                  isActive('/contact-us')
                    ? 'text-[#1e40af] dark:text-blue-400 border-b-2 border-[#1e40af] dark:border-blue-400'
                    : 'text-[#222222] dark:text-slate-200 hover:text-[#1e40af] dark:hover:text-blue-400'
                }`}
              >
                تواصل معنا
              </motion.span>
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-text-primary dark:text-slate-200"
              aria-label="تبديل الوضع الليلي"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isLoggedIn ? (
              <div className="relative group/profile">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-text-primary dark:text-slate-200 font-medium">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt={userName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary dark:border-amber-400"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const userIcon = e.currentTarget.nextElementSibling as HTMLElement;
                        if (userIcon) userIcon.style.display = 'block';
                      }}
                    />
                  ) : (
                    <span style={{ display: 'none' }}>No profile image</span>
                  )}
                  <User 
                    size={18} 
                    style={{ display: profileImage ? 'none' : 'block' }}
                  />
                  {userName}
                </button>
                <div className="absolute left-0 mt-0 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-glow z-50 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-300 pointer-events-none group-hover/profile:pointer-events-auto border border-gray-200 dark:border-slate-600">
                  <Link
                    href={dashboardLink}
                    className="block px-6 py-3 text-text-secondary dark:text-slate-300 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors font-medium rounded-t-lg"
                  >
                    {userRole === 'teacher' && dashboardLink === '/choose-supervisor' ? 'اختر مشرفك' : 'لوحة التحكم'}
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-6 py-3 text-text-secondary dark:text-slate-300 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors font-medium"
                  >
                    الملف الشخصي
                  </Link>
                  <Link
                    href="/reminders/settings"
                    className="block px-6 py-3 text-text-secondary dark:text-slate-300 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors font-medium flex items-center gap-2"
                  >
                    <Settings size={18} />
                    إعدادات التذكيرات
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-6 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium rounded-b-lg flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white">
                    إنشاء حساب
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button + Theme Toggle */}
          <div className="flex items-center lg:hidden gap-2">
            <Link href="/reminders/settings">
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-text-primary dark:text-slate-200"
                aria-label="إعدادات التذكيرات"
                title="إعدادات التذكيرات"
              >
                <Settings size={20} />
              </button>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-text-primary dark:text-slate-200"
              aria-label="تبديل الوضع الليلي"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-text-primary dark:text-slate-200 hover:text-primary transition-colors"
              aria-label="تبديل القائمة"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden py-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <nav className="flex flex-col gap-4">
              {/* الرئيسية */}
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors py-2 border-r-4 pr-2 ${
                  isActive('/')
                    ? 'text-[#1e40af] dark:text-blue-400 border-r-[#1e40af] dark:border-r-[#2563eb]'
                    : 'text-[#222222] dark:text-slate-200 hover:text-[#1e40af] border-r-transparent'
                }`}
              >
                الرئيسية
              </Link>

              {/* Mobile Courses Dropdown */}
              <div className="py-2">
                <button className="w-full text-right text-text-primary dark:text-slate-200 hover:text-primary font-medium transition-colors flex items-center gap-2">
                  الدورات
                  <ChevronDown size={16} />
                </button>
                <div className="mt-2 ml-4 flex flex-col gap-2">
                  {coursesMenu.map((course) => (
                    <Link
                      key={course.label}
                      href={course.href}
                      className="text-[#555555] dark:text-slate-300 hover:text-[#1e40af] transition-colors py-1 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-2">{course.icon}</span>
                      {course.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Interactive */}
              <Link
                href="/interactive-learning"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors py-2 border-r-4 pr-2 ${
                  isActive('/interactive-learning')
                    ? 'text-primary dark:text-amber-400 border-r-primary dark:border-r-amber-400'
                    : 'text-text-primary dark:text-slate-200 hover:text-primary border-r-transparent'
                }`}
              >
                الألعاب التفاعلية
              </Link>

              {/* Mobile Islamic Tools */}
              <div className="py-2">
                <button className="w-full text-right text-text-primary dark:text-slate-200 hover:text-primary font-medium transition-colors flex items-center gap-2">
                  الأدوات الإسلامية
                  <ChevronDown size={16} />
                </button>
                <div className="mt-2 ml-4 flex flex-col gap-2">
                  {islamicTools.map((tool) => (
                    <Link
                      key={tool.label}
                      href={tool.href}
                      className="text-[#555555] dark:text-slate-300 hover:text-[#1e40af] transition-colors py-1 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {tool.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* عن الأكاديمية */}
              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors py-2 border-r-4 pr-2 ${
                  isActive('/about')
                    ? 'text-primary dark:text-amber-400 border-r-primary dark:border-r-amber-400'
                    : 'text-text-primary dark:text-slate-200 hover:text-primary border-r-transparent'
                }`}
              >
                عن الأكاديمية
              </Link>

              {/* تواصل معنا */}
              <Link
                href="/contact-us"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors py-2 border-r-4 pr-2 ${
                  isActive('/contact-us')
                    ? 'text-primary dark:text-amber-400 border-r-primary dark:border-r-amber-400'
                    : 'text-text-primary dark:text-slate-200 hover:text-primary border-r-transparent'
                }`}
              >
                تواصل معنا
              </Link>

              <div className="flex flex-col gap-2 mt-4 border-t border-gray-200 dark:border-slate-700 pt-4">
                {isLoggedIn ? (
                  <>
                    <Link href="/dashboard" className="w-full">
                      <Button variant="outline" size="md" className="w-full">
                        لوحة التحكم
                      </Button>
                    </Link>
                    <Link href="/profile" className="w-full">
                      <Button variant="outline" size="md" className="w-full">
                        الملف الشخصي
                      </Button>
                    </Link>
                    <Link href="/reminders/settings" className="w-full">
                      <Button variant="outline" size="md" className="w-full flex items-center justify-center gap-2">
                        <Settings size={18} />
                        إعدادات التذكيرات
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      تسجيل الخروج
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="w-full">
                      <Button variant="outline" size="md" className="w-full">
                        تسجيل الدخول
                      </Button>
                    </Link>
                    <Link href="/register" className="w-full">
                      <Button variant="primary" size="md" className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white">
                        إنشاء حساب
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};
