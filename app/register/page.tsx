'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Eye, EyeOff, AlertCircle, Check, Home, LogIn
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getApiUrl } from '@/lib/config';
import { Spinner } from '@/components/ui/spinner';
import Lottie from 'lottie-react';

/* ------------------------- Zod Schema (unchanged) ------------------------- */
const registerSchema = z.object({
  first_name: z.string().min(1, { message: 'الاسم الأول مطلوب' }),
  last_name: z.string().min(1, { message: 'الاسم الأخير مطلوب' }),
  email: z.string().email({ message: 'البريد الإلكتروني غير صحيح' }),
  password: z.string()
    .min(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
    .regex(/[A-Z]/, { message: 'كلمة المرور يجب أن تحتوي على حرف كبير على الأقل' })
    .regex(/[a-z]/, { message: 'كلمة المرور يجب أن تحتوي على حرف صغير على الأقل' })
    .regex(/\d/, { message: 'كلمة المرور يجب أن تحتوي على رقم على الأقل' })
    .refine(val => !(/password|123456|qwerty/i.test(val)), {
      message: 'كلمة المرور ضعيفة جداً - استخدم كلمة مرور أكثر تعقيداً'
    }),
  password2: z.string(),
  phone: z.string()
    .min(1, { message: 'رقم الهاتف مطلوب' })
    .min(7, { message: 'رقم الهاتف قصير جداً - يجب أن يكون 7 أرقام على الأقل (مثال: 501234567)' })
    .max(14, { message: 'رقم الهاتف طويل جداً - يجب أن يكون 14 رقم على الأكثر' })
    .regex(/^\d+$/, { message: 'رقم الهاتف يجب أن يحتوي على أرقام فقط (بدون رمز الدولة أو مسافات أو رموز)' })
    .refine((phone) => {
      const length = phone.length;
      return length >= 7 && length <= 14;
    }, { message: 'رقم الهاتف غير مكتمل - تأكد من إدخال الرقم كاملاً (7-14 رقم)' }),
  country_code: z.string(),
  gender: z.string().min(1, { message: 'النوع مطلوب' }),
  age: z.number()
    .min(13, { message: 'العمر يجب أن يكون 13 سنة على الأقل' })
    .max(100, { message: 'العمر يجب أن يكون 100 سنة على الأكثر' }),
  preferred_language: z.string(),
  accept_terms: z.boolean().refine((v) => v === true, { message: 'يجب الموافقة على الشروط والأحكام' })
}).refine(data => data.password === data.password2, {
  message: 'كلمات المرور غير متطابقة',
  path: ['password2']
});

type FormData = z.infer<typeof registerSchema>;

/* --------------------------------- Page ---------------------------------- */
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    console.log('📝 [Register Page] Register page loaded');
  }, []);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [usernameWarning, setUsernameWarning] = useState('');
  const [phoneWarning, setPhoneWarning] = useState('');
  const [lottieData, setLottieData] = useState<any>(null);

  /* ------------------------- RHF (kept as original) ------------------------ */
  const form = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password: '',
      password2: '',
      phone: '',
      country_code: '+966',
      gender: '',
      age: 0,
      preferred_language: 'ar',
      accept_terms: false
    }
  });

  const { watch, setValue, trigger, handleSubmit: rhfHandleSubmit } = form;
  const formData = watch();

  /* ------------------------------ useEffect ------------------------------- */
  // Note: Success redirect is now handled directly in onSubmit

  // Load Lottie animation data
  useEffect(() => {
    fetch('/Reading in Quran.json')
      .then((res) => res.json())
      .then((data) => setLottieData(data))
      .catch((err) => console.error('Failed to load Lottie animation:', err));
  }, []);

  /* ---------------------- helpers (kept / slightly polished) -------------- */
  const getFieldError = (field: string): string | undefined => {
    const rhfMsg = (form.formState.errors as any)?.[field]?.message as string | undefined;
    return rhfMsg || errors[field];
  };

  const getInputClassName = (hasError: boolean) => {
    return `w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
        : 'border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900'
    } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500`;
  };

  const containsArabic = (text: string): boolean => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  const updateFormField = (name: string, value: any) => {
    setValue(name as any, value, { shouldValidate: true, shouldDirty: true });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'phone' && phoneWarning) {
      // phone warning is controlled in handlePhoneChange
    }
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    score += checks.length ? 20 : 0;
    score += checks.uppercase ? 20 : 0;
    score += checks.lowercase ? 20 : 0;
    score += checks.numbers ? 20 : 0;
    score += checks.special ? 20 : 0;
    return { score, checks };
  };

  // نستخدم عرض progress عبر classes (بدون inline style)
  const getPasswordStrengthBucket = (score: number) => {
    if (score >= 80) return { w: 'w-full', color: 'bg-emerald-500 dark:bg-emerald-400' };
    if (score >= 60) return { w: 'w-4/5', color: 'bg-yellow-500' };
    if (score >= 40) return { w: 'w-3/5', color: 'bg-orange-500' };
    if (score >= 20) return { w: 'w-2/5', color: 'bg-red-500' };
    return { w: 'w-1/5', color: 'bg-gray-400 dark:bg-gray-600' };
  };

  const getPasswordStrengthText = (score: number) => {
    if (score >= 80) return 'قوية جداً';
    if (score >= 60) return 'قوية';
    if (score >= 40) return 'متوسطة';
    if (score >= 20) return 'ضعيفة';
    return 'ضعيفة جداً';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    let digits = raw.replace(/\D/g, '');
    if (digits.length > 14) digits = digits.substring(0, 14);
    if (digits.length > 0 && digits.length < 7) {
      setPhoneWarning(`⚠️ رقم الهاتف قصير (${digits.length}/7 على الأقل) - أكمل إدخال الرقم`);
    } else if (digits.length > 14) {
      setPhoneWarning('⚠️ رقم الهاتف طويل جداً - تحقق من الرقم');
    } else {
      setPhoneWarning('');
    }
    updateFormField('phone', digits);
    trigger('phone');
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const ageValue = parseInt(value, 10);
    updateFormField('age', isNaN(ageValue) ? 0 : ageValue);
    trigger('age');
  };

  const clearGeneralError = () => {
    if (error) setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement & HTMLSelectElement;
    const { name, type } = target as any;
    clearGeneralError();

    if (name === 'phone') {
      handlePhoneChange(e as React.ChangeEvent<HTMLInputElement>);
      return;
    }
    if (name === 'age') {
      handleAgeChange(e as React.ChangeEvent<HTMLSelectElement>);
      return;
    }

    const value = (type === 'checkbox') ? (target as HTMLInputElement).checked : target.value;

    if (name === 'username' && typeof value === 'string') {
      if (containsArabic(value)) {
        setUsernameWarning('⚠️ اسم المستخدم يجب أن يكون بالأحرف الإنجليزية فقط');
      } else {
        setUsernameWarning('');
      }
    }

    updateFormField(name, value);
  };

  /* -------------------------------- Submit ------------------------------- */
  const onSubmit = rhfHandleSubmit(async (data: FormData) => {
    setIsSubmitting(true);
    setError('');
    
    console.log('🔍 [Register] بدء عملية التسجيل...', {
      email: data.email.trim().toLowerCase(),
      timestamp: new Date().toISOString()
    });
    
    try {
      const registrationData = {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        password2: data.password2,
        country_code: data.country_code,
        phone: data.phone.trim(),
        gender: data.gender,
        age: data.age || 0,
        preferred_language: data.preferred_language,
        accept_terms: data.accept_terms
      };

      const apiUrl = getApiUrl('/auth/register/');
      console.log('📡 [Register] Sending request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(registrationData),
      });

      console.log('📡 [Register] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        timestamp: new Date().toISOString()
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || errorData.message || 'فشل في إنشاء الحساب';
        
        console.error('❌ [Register] Registration failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          errorData: errorData,
          email: data.email.trim().toLowerCase(),
          timestamp: new Date().toISOString()
        });
        
        throw new Error(errorMessage);
      }

      console.log('✅ [Register] Registration successful:', {
        email: data.email.trim().toLowerCase(),
        timestamp: new Date().toISOString()
      });

      setErrors({});
      setUsernameWarning('');
      setPhoneWarning('');

      // Redirect to success page with email
      router.push(`/register/success?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ ما';
      
      console.error('❌ [Register] Registration error:', {
        error: errorMessage,
        errorType: err instanceof TypeError && err.message.includes('CORS') ? 'CORS_ERROR' : 
                   err instanceof TypeError && err.message.includes('fetch') ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      });
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  });

  /* --------------------------- Derived UI values -------------------------- */
  const { score } = getPasswordStrength(formData.password || '');
  const strengthBucket = getPasswordStrengthBucket(score);
  const strengthText = getPasswordStrengthText(score);

  const ageOptions = Array.from({ length: 100 - 13 + 1 }, (_, i) => 13 + i);

  /* --------------------------------- UI ---------------------------------- */
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center py-10 px-4 relative overflow-hidden pt-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#0A5734]/10 to-[#4A8F5C]/10 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#C5A15A]/10 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl z-10"
      >
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left brand / hero - Now in front */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="order-1 rounded-3xl p-8 lg:p-12 bg-gradient-to-br from-[#0A5734]/5 to-[#4A8F5C]/5 dark:from-[#0A5734]/10 dark:to-[#4A8F5C]/10 backdrop-blur-xl shadow-2xl border border-[#0A5734]/20 dark:border-[#4A8F5C]/20 flex flex-col justify-center relative z-10"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A5734] to-[#4A8F5C] rounded-2xl blur-2xl opacity-30" />
                <Image
                  src="/logo.png"
                  alt="شعار أكاديمية نور"
                  width={100}
                  height={100}
                  className="relative rounded-2xl shadow-2xl"
                  priority
                />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0A5734] to-[#4A8F5C] dark:from-[#4A8F5C] dark:to-[#5BA86D] bg-clip-text text-transparent">
                  أكاديمية نور
                </h1>
                <p className="mt-3 text-lg text-[#0A5734]/70 dark:text-[#4A8F5C]/70 font-medium">
                  بيئة قرآنية تربوية متكاملة
                </p>
              </div>
              <p className="text-[#0A5734]/60 dark:text-[#4A8F5C]/60 leading-relaxed max-w-sm">
                انضم لرحلة تعليمية مُنظمة وممتعة مع أفضل المعلمين والمحتوى الإسلامي الموثوق
              </p>

              <div className="mt-8 w-full h-48 rounded-2xl bg-gradient-to-br from-[#0A5734]/20 to-[#4A8F5C]/20 dark:from-[#0A5734]/10 dark:to-[#4A8F5C]/10 border border-[#0A5734]/30 dark:border-[#4A8F5C]/30 shadow-inner flex items-center justify-center overflow-hidden">
                {lottieData ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <Lottie
                      animationData={lottieData}
                      loop={true}
                      autoplay={true}
                      className="w-full h-full"
                    />
                  </motion.div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2 animate-pulse">📚</div>
                    <p className="text-sm text-[#0A5734]/60 dark:text-[#4A8F5C]/60">تعليم إسلامي متميز</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right form - Now behind */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="order-2 rounded-3xl p-8 lg:p-10 bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl relative z-0"
          >
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                إنشاء حساب جديد
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                انضم إلى آلاف الطلاب الذين يتعلمون معنا
              </p>
            </div>

            {/* messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-red-700 dark:text-red-200"
              >
                <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
                <p className="whitespace-pre-line text-sm">{error}</p>
              </motion.div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              {/* names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">الاسم الأول</label>
                  <input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="أحمد"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                      getFieldError('first_name')
                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
                        : 'border-slate-200 dark:border-slate-700 focus:border-[#0A5734] focus:ring-2 focus:ring-[#0A5734]/20 dark:focus:ring-[#4A8F5C]/20'
                    } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white`}
                    required
                  />
                  {getFieldError('first_name') && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('first_name')}</p>}
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">الاسم الأخير</label>
                  <input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="محمد"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                      getFieldError('last_name')
                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
                        : 'border-slate-200 dark:border-slate-700 focus:border-[#0A5734] focus:ring-2 focus:ring-[#0A5734]/20 dark:focus:ring-[#4A8F5C]/20'
                    } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white`}
                    required
                  />
                  {getFieldError('last_name') && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('last_name')}</p>}
                </div>
              </div>

              {/* email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">البريد الإلكتروني</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className={getInputClassName(!!getFieldError('email'))}
                  required
                />
                {getFieldError('email') && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('email')}</p>}
              </div>

              {/* passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">كلمة المرور</label>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`${getInputClassName(!!getFieldError('password'))} pr-10`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-11 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>

                  {/* strength */}
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                        <span>قوة كلمة المرور</span>
                        <span className={`px-2 py-1 rounded-full text-white text-xs font-bold ${
                          score >= 80 ? 'bg-emerald-500' :
                          score >= 60 ? 'bg-yellow-500' :
                          score >= 40 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}>
                          {strengthText}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-2 rounded-full ${strengthBucket.color}`}
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <span className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-500'}`}>
                          {formData.password.length >= 8 ? '✓' : '○'} ٨ أحرف
                        </span>
                        <span className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-500'}`}>
                          {/[A-Z]/.test(formData.password) ? '✓' : '○'} حرف كبير
                        </span>
                        <span className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-500'}`}>
                          {/[a-z]/.test(formData.password) ? '✓' : '○'} حرف صغير
                        </span>
                        <span className={`flex items-center gap-1 ${/\d/.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-500'}`}>
                          {/\d/.test(formData.password) ? '✓' : '○'} رقم
                        </span>
                      </div>
                    </motion.div>
                  )}
                  {getFieldError('password') && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{getFieldError('password')}</p>}
                </div>

                <div className="relative">
                  <label htmlFor="password2" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">تأكيد كلمة المرور</label>
                  <input
                    id="password2"
                    name="password2"
                    type={showPassword2 ? 'text' : 'password'}
                    value={formData.password2}
                    onChange={handleInputChange}
                    className={`${getInputClassName(!!getFieldError('password2'))} pr-10`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword2 ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="absolute left-3 top-11 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
                  >
                    {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {getFieldError('password2') && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{getFieldError('password2')}</p>}
                </div>
              </div>

              {/* phone */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label htmlFor="country_code" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">الدولة</label>
                  <select
                    id="country_code"
                    name="country_code"
                    value={formData.country_code}
                    onChange={handleInputChange}
                    className={`${getInputClassName(!!errors['country_code'])} appearance-none`}
                    required
                  >
                    <option value="+966">🇸🇦 السعودية</option>
                    <option value="+971">🇦🇪 الإمارات</option>
                    <option value="+965">🇰🇼 الكويت</option>
                    <option value="+973">🇧🇭 البحرين</option>
                    <option value="+974">🇶🇦 قطر</option>
                    <option value="+968">🇴🇲 عُمان</option>
                    <option value="+20">🇪🇬 مصر</option>
                  </select>
                  {errors['country_code'] && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors['country_code']}</p>}
                </div>
                <div className="col-span-2">
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">رقم الهاتف</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="501234567"
                    className={`${getInputClassName(!!getFieldError('phone'))} ltr text-right`}
                    required
                  />
                  {getFieldError('phone') && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('phone')}</p>}
                  {phoneWarning && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-start gap-2 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 text-yellow-800 dark:text-yellow-200"
                    >
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /> <span className="text-sm">{phoneWarning}</span>
                    </motion.div>
                  )}
                  <div className="mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="font-semibold text-[#0A5734] dark:text-[#4A8F5C] mb-1">💡 إرشاد:</div>
                    <div>
                      أدخل الرقم بدون رمز الدولة (مثال: <span className="font-semibold text-slate-900 dark:text-slate-200">501234567</span>) — من 7 إلى 14 رقم فقط.
                    </div>
                  </div>
                </div>
              </div>

              {/* selects */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">العمر</label>
                  <select
                    id="age"
                    name="age"
                    value={formData.age || ''}
                    onChange={handleInputChange}
                    className={`${getInputClassName(!!getFieldError('age'))} appearance-none`}
                    required
                  >
                    <option value="" disabled>اختر عمرك</option>
                    {ageOptions.map(v => (
                      <option key={v} value={v}>{v} سنة</option>
                    ))}
                  </select>
                  {getFieldError('age') && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('age')}</p>}
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">النوع</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`${getInputClassName(!!getFieldError('gender'))} appearance-none`}
                    required
                  >
                    <option value="" disabled>اختر جنسك</option>
                    <option value="male">👨 ذكر</option>
                    <option value="female">👩 أنثى</option>
                  </select>
                  {getFieldError('gender') && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('gender')}</p>}
                </div>
              </div>

              {/* preferred language hidden */}
              <input type="hidden" name="preferred_language" value="ar" />

              {/* terms */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <input
                  id="accept_terms"
                  name="accept_terms"
                  type="checkbox"
                  checked={formData.accept_terms}
                  onChange={handleInputChange}
                  className="mt-1 h-5 w-5 rounded border-2 border-slate-300 dark:border-slate-600 text-[#0A5734] focus:ring-2 focus:ring-[#0A5734]/20 dark:focus:ring-[#4A8F5C]/20 cursor-pointer"
                  required
                />
                <label htmlFor="accept_terms" className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  أوافق على <Link href="/terms" className="text-[#0A5734] dark:text-[#4A8F5C] hover:underline font-medium">الشروط والأحكام</Link> و <Link href="/privacy" className="text-[#0A5734] dark:text-[#4A8F5C] hover:underline font-medium">سياسة الخصوصية</Link>
                </label>
              </div>
              {errors['accept_terms'] && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors['accept_terms']}</p>}

              {/* actions */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#0A5734] to-[#4A8F5C] hover:from-[#073D24] hover:to-[#3A7148] text-white font-bold py-3 shadow-lg hover:shadow-xl transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-[#0A5734] disabled:hover:to-[#4A8F5C]"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="md" tone="contrast" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    إنشاء حساب جديد
                  </>
                )}
              </motion.button>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <Link href="/login" className="inline-flex items-center gap-2 text-[#0A5734] dark:text-[#4A8F5C] hover:text-[#073D24] dark:hover:text-[#3A7148] font-medium transition">
                    <LogIn size={16} /> لديك حساب؟ تسجيل الدخول
                  </Link>
                  <span className="hidden sm:block text-slate-300 dark:text-slate-600">•</span>
                  <Link href="/" className="inline-flex items-center gap-2 text-[#0A5734] dark:text-[#4A8F5C] hover:text-[#073D24] dark:hover:text-[#3A7148] font-medium transition">
                    <Home size={16} /> العودة للرئيسية
                  </Link>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

