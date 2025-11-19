'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Home } from 'lucide-react';
import { useAppDispatch } from '../../lib/hooks';
import { validateEmail } from '../../lib/utils/validation';
import { simpleLogin } from '../../lib/simpleAPI';
import { errorHandler } from '../../lib/utils/errorHandler';
import { authService } from '../../lib/auth/authService';
import { login as setLoginState } from '../../lib/store';
import type { User } from '../../lib/types/auth';



export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const searchParams = useSearchParams();

  useEffect(() => {
    console.log('🔐 [Login Page] Login page loaded');
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [userError, setUserError] = useState(''); // رسالة خطأ للمستخدم فقط
  const [isTeacherPendingError, setIsTeacherPendingError] = useState(false); // تتبع خطأ المعلم في انتظار الموافقة

  // Check for session expiry message from sessionStorage
  useEffect(() => {
    const loginMessage = sessionStorage.getItem('login_message');
    if (loginMessage) {
      setUserError(loginMessage);
      sessionStorage.removeItem('login_message');
    }
  }, []);

  // Check for password change success message
  useEffect(() => {
    const message = searchParams?.get('message');
    if (message === 'password_changed') {
      setSuccess('🎉 تم تغيير كلمة المرور بنجاح!\n\nيرجى تسجيل الدخول بكلمة المرور الجديدة.');
      router.replace('/login');
    } else if (message === 'password_reset_success') {
      setSuccess('🎉 تم إعادة تعيين كلمة المرور بنجاح!\n\nيمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.');
      router.replace('/login');
    } else if (message === 'registration_success') {
      setSuccess('🎉 تم إنشاء حسابك بنجاح!\n\nيمكنك الآن تسجيل الدخول بحسابك الجديد.');
      router.replace('/login');
    } else if (message === 'teacher_registered') {
      setSuccess('🎉 تم تسجيل حسابك كمعلم بنجاح!\n\n⏳ حسابك في انتظار موافقة المشرف العام.\n📋 تم إرسال طلب الانضمام بنجاح.\n\n✅ يمكنك تسجيل الدخول الآن، لكن لن تتمكن من الوصول إلى لوحة التحكم حتى يوافق المشرف على طلبك.');
      router.replace('/login');
    }
  }, [searchParams, router]);

  // Check for success message from registration or password change
  useEffect(() => {
    const success = searchParams.get('success');
    const teacher = searchParams.get('teacher');

    if (success === 'password-changed') {
      setSuccess('🎉 تم تغيير كلمة المرور بنجاح!\n\nيمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.');
    } else if (success === 'password-reset') {
      setSuccess('🎉 تم إعادة تعيين كلمة المرور بنجاح!\n\nيمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.');
    } else if (teacher === 'pending') {
      const pendingTeacher = localStorage.getItem('pendingTeacher');
      if (pendingTeacher) {
        const teacherInfo = JSON.parse(pendingTeacher);
        setSuccess(`🎉 مرحباً ${teacherInfo.first_name}!\n\n✅ تم تسجيلك كمدرس بنجاح\n📋 حالة الطلب: في انتظار الموافقة\n\n🔐 يمكنك تسجيل الدخول الآن وستتم توجيهك لصفحة المدرس.`);
        setFormData(prev => ({ ...prev, email: teacherInfo.email }));
      }
    }
  }, [searchParams]);

  // Don't use automatic redirect on isAuthenticated change
  // This causes race conditions during login
  // Redirect happens explicitly after successful login in handleSubmit

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      errors['email'] = 'البريد الإلكتروني مطلوب';
    } else if (!validateEmail(formData.email)) {
      errors['email'] = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.password) {
      errors['password'] = 'كلمة المرور مطلوبة';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // مسح الأخطاء السابقة
    setValidationErrors({});
    setUserError('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSuccess('');

      console.log('🔍 بدء عملية تسجيل الدخول...');

      // استخدام الخدمة الموحدة الجديدة
      const result = await simpleLogin({
        email: formData.email.trim(),
        password: formData.password
      });

      if (result.success && result.data) {
        console.log('✅ تم تسجيل الدخول بنجاح');

        // Set flag to indicate login is in progress
        localStorage.setItem('login_in_progress', 'true');

        // حفظ بيانات المصادقة
        console.log('💾 حفظ بيانات المصادقة');
        console.log('📦 Full result object:', JSON.stringify(result, null, 2));

        // Extract user and tokens from nested data structure
        // simpleLogin returns: { success, data: { success, data: { user, tokens } } }
        const userData = result.data?.data?.user || result.data?.user;
        const tokensData = result.data?.data?.tokens || result.data?.tokens;

        console.log('📦 Extracted data:', { 
          hasUser: !!userData, 
          hasTokens: !!tokensData,
          userKeys: userData ? Object.keys(userData) : [],
          tokenKeys: tokensData ? Object.keys(tokensData) : [],
          userData: userData,
          tokensData: tokensData
        });

        if (!userData || !tokensData) {
          console.error('❌ Missing user or tokens data');
          localStorage.removeItem('login_in_progress');
          setUserError('بيانات المصادقة غير كاملة');
          return;
        }

        const authDataSaved = authService.saveAuthData(userData, tokensData);

        if (!authDataSaved) {
          console.error('❌ فشل حفظ بيانات المصادقة');
          localStorage.removeItem('login_in_progress');
          setUserError('حدث خطأ أثناء حفظ بيانات المصادقة');
          return;
        }

        // ✅ Update Redux auth state to avoid race with ProtectedRoute
        dispatch(setLoginState({ user: userData, tokens: tokensData }));

        // Wait a moment to ensure localStorage is fully written
        await new Promise(resolve => setTimeout(resolve, 150));

        // Verify data was saved
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('refresh_token');
        
        if (!savedUser || !savedToken) {
          console.error('❌ بيانات المصادقة لم يتم حفظها في localStorage');
          localStorage.removeItem('login_in_progress');
          setUserError('حدث خطأ أثناء حفظ بيانات تسجيل الدخول');
          return;
        }

        console.log('✅ تم التحقق من حفظ البيانات في localStorage');

        // تحديد مسار التوجيه حسب دور المستخدم
        const redirectPath = await getRedirectPath(userData);

        setSuccess('✅ تم تسجيل الدخول بنجاح! جاري التوجيه...');

        // Dispatch auth state changed event
        window.dispatchEvent(new Event('authStateChanged'));
        window.dispatchEvent(new Event('storage'));

        // Clear the login flag
        localStorage.removeItem('login_in_progress');

        // التوجيه بعد تأكيد حفظ البيانات
        setTimeout(() => {
          console.log('🚀 التوجيه إلى:', redirectPath);
          router.push(redirectPath);
        }, 100); // Reduced from 300ms

      } else {
        // عرض رسالة الخطأ للمستخدم فقط
        const errorMessage = result.error || 'فشل في تسجيل الدخول';
        
        // This error handling is no longer needed since we allow pending teachers to login
        setUserError(errorMessage);
        setIsTeacherPendingError(false);
      }
    } catch (error) {
      // معالجة أخطاء الشبكة
      const appError = errorHandler.handleNetworkError(error, {
        action: 'login',
        email: formData.email
      });
      setUserError(appError.userMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // وظيفة تحديد مسار التوجيه حسب دور المستخدم
  const getRedirectPath = async (user: User): Promise<string> => {
    console.log('🎯 تحديد مسار التوجيه للمستخدم:', { role: user.role, user });

    switch (user.role) {
      case 'admin':
        console.log('🔑 توجيه المدير إلى لوحة الإدارة في الفرونت إند');
        return '/dashboard/admin';
      case 'teacher':
        console.log('👨‍🏫 فحص حالة المعلم...');
        // Check teacher status (pending or has supervisor)
        try {
          const token = localStorage.getItem('token');
          
          // Check join request status first
          const statusResponse = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/teachers/join-request/status/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            const joinStatus = statusData.data || statusData;
            
            // If teacher has pending request or is not active, redirect to choose supervisor
            if (joinStatus.has_pending_request || !joinStatus.is_active_teacher) {
              console.log('⚠️ المعلم لديه طلب pending أو غير نشط - توجيه لصفحة المشرفين');
              return '/choose-supervisor';
            }
            
            // If teacher is active and has supervisor, go to dashboard
            if (joinStatus.is_active_teacher && joinStatus.general_supervisor) {
              console.log('✅ المعلم نشط ولديه مشرف - توجيه للداشبورد');
              return '/dashboard/teacher';
            }
            
            // Fallback: no supervisor assigned yet
            console.log('⚠️ المعلم ليس لديه مشرف - توجيه لصفحة المشرفين');
            return '/choose-supervisor';
          }
        } catch (error) {
          console.error('❌ خطأ في فحص حالة المعلم:', error);
        }
        
        // Default fallback: redirect to choose supervisor
        console.log('👨‍🏫 توجيه افتراضي لصفحة المشرفين');
        return '/choose-supervisor';
      case 'general_supervisor':
        console.log('👨‍💼 توجيه المشرف العام إلى لوحة المشرف العام');
        return '/dashboard/supervisor';
      case 'academic_supervisor':
        console.log('🎓 توجيه المشرف الأكاديمي إلى لوحة المشرف الأكاديمي');
        return '/dashboard/academic-supervisor';
      case 'supervisor':
        // للتوافق مع النظام القديم
        console.log('👨‍💼 توجيه المشرف (نظام قديم) إلى لوحة المشرف العام');
        return '/dashboard/supervisor';
      case 'student':
      default:
        console.log('👨‍🎓 توجيه الطالب إلى لوحة الطالب');
        return '/dashboard/student';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear user error and teacher pending flag when user starts typing
    if (userError) {
      setUserError('');
      setIsTeacherPendingError(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden pt-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#0A5734]/10 to-[#4A8F5C]/10 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#C5A15A]/10 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md z-10"
      >
        {/* Logo & Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A5734]/10 to-[#4A8F5C]/10 rounded-2xl blur-xl"></div>
            <Image
              src="/logo.png"
              alt="شعار أكاديمية نور"
              width={64}
              height={64}
              className="relative object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0A5734] to-[#4A8F5C] dark:from-[#4A8F5C] dark:to-[#5BA86D] bg-clip-text text-transparent mb-2">أكاديمية نور</h1>
          <p className="text-lg text-[#0A5734]/70 dark:text-[#4A8F5C]/70 font-medium">بيئة قرآنية تربوية متكاملة</p>
        </motion.div>

        {/* Success Message */}
        {success && (
          <motion.div
            variants={itemVariants}
            className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          >
            <p className="text-green-800 dark:text-green-200 text-sm whitespace-pre-line">{success}</p>
          </motion.div>
        )}

        {/* Error Message */}
        {userError && (
          <motion.div
            variants={itemVariants}
            className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <p className="text-red-800 dark:text-red-200 text-sm whitespace-pre-line">{userError}</p>
          </motion.div>
        )}

        {/* Form Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className={`w-full pr-10 pl-4 py-3 rounded-lg border-2 transition-all bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none ${
                    validationErrors['email']
                      ? 'border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
                      : 'border-slate-200 dark:border-slate-700 focus:border-[#0A5734] focus:ring-2 focus:ring-[#0A5734]/20 dark:focus:ring-[#4A8F5C]/20'
                  }`}
                />
              </div>
              {validationErrors['email'] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors['email']}</p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full pr-10 pl-12 py-3 rounded-lg border-2 transition-all bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none ${
                    validationErrors['password']
                      ? 'border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
                      : 'border-slate-200 dark:border-slate-700 focus:border-[#0A5734] focus:ring-2 focus:ring-[#0A5734]/20 dark:focus:ring-[#4A8F5C]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors['password'] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors['password']}</p>
              )}
            </motion.div>

            {/* Forgot Password Link */}
            <motion.div variants={itemVariants} className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-[#0A5734] hover:text-[#073D24] dark:text-[#4A8F5C] transition-colors font-medium"
              >
                نسيت كلمة المرور؟
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#0A5734] to-[#4A8F5C] hover:from-[#073D24] hover:to-[#3A7148] hover:shadow-lg hover:shadow-[#0A5734]/30'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري التحميل...
                </>
              ) : (
                <>
                  تسجيل الدخول
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer Links */}
          <motion.div variants={itemVariants} className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-4">
              ليس لديك حساب؟
              <Link
                href="/register"
                className="text-[#0A5734] dark:text-[#4A8F5C] hover:text-[#073D24] dark:hover:text-[#3A7148] font-semibold transition-colors mr-1"
              >
                إنشاء حساب جديد
              </Link>
            </p>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium"
            >
              <Home className="w-4 h-4" />
              العودة للصفحة الرئيسية
            </Link>
          </motion.div>
        </motion.div>

        {/* Security Note */}
        <motion.div variants={itemVariants} className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>🔒 بيانات آمنة مشفرة</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
