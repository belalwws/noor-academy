'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, ArrowRight, RefreshCw, LogIn, Home, Check } from 'lucide-react';
import Lottie from 'lottie-react';
import { sendEmailVerification } from '@/lib/api/profile';
import { Button } from '@/components/ui/button';

export default function RegistrationSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendMessageType, setResendMessageType] = useState<'success' | 'error' | ''>('');
  const [countdown, setCountdown] = useState(0);
  const [lottieData, setLottieData] = useState<any>(null);

  // Load email from query params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      // If no email, redirect to register page
      router.push('/register');
    }
  }, [searchParams, router]);

  // Load Lottie animation data
  useEffect(() => {
    fetch('/register-sucuess.json')
      .then((res) => res.json())
      .then((data) => setLottieData(data))
      .catch((err) => console.error('Failed to load Lottie animation:', err));
  }, []);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendVerification = async () => {
    if (!email) {
      setResendMessage('البريد الإلكتروني مطلوب');
      setResendMessageType('error');
      return;
    }

    if (countdown > 0) {
      return;
    }

    setIsResending(true);
    setResendMessage('');
    setResendMessageType('');

    try {
      await sendEmailVerification(email);
      setResendMessage('✅ تم إرسال رابط التحقق بنجاح! يرجى فحص بريدك الإلكتروني.');
      setResendMessageType('success');
      setCountdown(60); // 60 second cooldown
    } catch (error: any) {
      setResendMessage(error?.message || '❌ حدث خطأ في إرسال رابط التحقق');
      setResendMessageType('error');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center py-6 px-4 relative overflow-hidden pt-24">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl z-10"
      >
        <div className="rounded-3xl p-6 lg:p-10 bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl">
          {/* Desktop Layout: Content Left, Animation Right */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center lg:items-start">
            {/* Left: Content (Desktop) */}
            <div className="flex-1 w-full order-1 lg:order-1 space-y-6">
              {/* Success Header - Compact & Efficient */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-row items-center gap-4 lg:gap-5"
              >
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
                  className="relative flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full blur-2xl opacity-40 animate-pulse" />
                  <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl ring-2 ring-amber-100 dark:ring-amber-900/30">
                    <CheckCircle className="w-8 h-8 lg:w-10 lg:h-10 text-white" strokeWidth={2.5} />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex-1"
                >
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 dark:from-amber-400 dark:via-orange-400 dark:to-amber-400 bg-clip-text text-transparent leading-tight">
                    تم إنشاء حسابك بنجاح!
                  </h1>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1.5">
                    خطوات بسيطة لتفعيل حسابك والبدء في رحلتك التعليمية
                  </p>
                </motion.div>
              </motion.div>

              {/* Email Info - Compact Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative p-4 lg:p-5 rounded-xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30 border border-amber-200/50 dark:border-amber-800/50 shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      تم إرسال رابط التحقق إلى:
                    </p>
                    <p className="text-base font-bold text-amber-700 dark:text-amber-300 break-all mb-2">
                      {email}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      💡 يرجى فحص صندوق الوارد والرسائل المزعجة (Spam)
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Next Steps - Compact Design */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-3"
              >
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-amber-500" />
                  خطوات التالية:
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="group flex flex-col items-center text-center p-4 rounded-lg bg-gradient-to-br from-slate-50 to-amber-50/30 dark:from-slate-800/50 dark:to-amber-950/20 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all"
                  >
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:scale-110 transition-transform mb-3">
                      1
                    </span>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      تحقق من بريدك الإلكتروني
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="group flex flex-col items-center text-center p-4 rounded-lg bg-gradient-to-br from-slate-50 to-amber-50/30 dark:from-slate-800/50 dark:to-amber-950/20 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all"
                  >
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:scale-110 transition-transform mb-3">
                      2
                    </span>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      اضغط على رابط التحقق في البريد
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="group flex flex-col items-center text-center p-4 rounded-lg bg-gradient-to-br from-slate-50 to-amber-50/30 dark:from-slate-800/50 dark:to-amber-950/20 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all"
                  >
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:scale-110 transition-transform mb-3">
                      3
                    </span>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      سجل الدخول بحسابك الجديد
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Resend Message - Compact */}
              {resendMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-start gap-2 rounded-lg border px-4 py-3 ${
                    resendMessageType === 'success'
                      ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-200'
                      : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200'
                  }`}
                >
                  {resendMessageType === 'success' ? (
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <p className="text-xs font-medium whitespace-pre-line">{resendMessage}</p>
                </motion.div>
              )}

              {/* Action Buttons - Compact & Efficient */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="space-y-3"
              >
                {/* Primary CTA - Login Button */}
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-colors py-5"
                  style={{ transform: 'none' }}
                >
                  <LogIn className="w-5 h-5 ml-2" />
                  تسجيل الدخول
                </Button>

                {/* Secondary CTA - Resend Verification Button */}
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending || countdown > 0}
                  variant="outline"
                  className="w-full border-2 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-500 dark:hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed py-5 transition-colors font-semibold"
                  style={{ transform: 'none' }}
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2" />
                      إعادة الإرسال ({countdown} ثانية)
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2" />
                      إعادة إرسال رابط التحقق
                    </>
                  )}
                </Button>

                {/* Home Link - Centered */}
                <div className="flex justify-center pt-3">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm font-medium"
                  >
                    <Home className="w-4 h-4" />
                    العودة للرئيسية
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right: Lottie Animation (Desktop) - Optimized Size */}
            {lottieData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5, type: 'spring' }}
                className="w-48 h-48 lg:w-72 lg:h-72 flex-shrink-0 order-2 lg:order-2 lg:self-center relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 to-orange-200/20 dark:from-amber-800/10 dark:to-orange-800/10 rounded-full blur-2xl" />
                <div className="relative">
                  <Lottie
                    animationData={lottieData}
                    loop={true}
                    autoplay={true}
                    className="w-full h-full drop-shadow-xl"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

