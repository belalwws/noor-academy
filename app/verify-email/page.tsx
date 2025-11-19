'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/apiClient';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const uidb64 = searchParams.get('uidb64');
        const token = searchParams.get('token');

        if (!uidb64 || !token) {
          setStatus('error');
          setMessage('رابط التحقق غير صحيح. يرجى التأكد من الرابط المرسل إلى بريدك الإلكتروني.');
          return;
        }

        console.log('🔍 Verifying email with:', { uidb64, token });
        
        const result = await apiClient.confirmEmailVerification(uidb64, token);
        
        if (result.success) {
          console.log('✅ Email verification successful:', result.data);
          
          setStatus('success');
          setMessage('تم تأكيد بريدك الإلكتروني بنجاح! مرحباً بك في أكاديمية رُشد.');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            setIsRedirecting(true);
            router.push('/login?verified=true');
          }, 3000);
          
        } else {
          console.log('❌ Email verification failed:', result.error);
          
          setStatus('error');
          
          if (result.error?.includes('expired') || result.error?.includes('invalid')) {
            setMessage('انتهت صلاحية رابط التحقق أو أنه غير صحيح. يرجى طلب رابط جديد.');
          } else {
            setMessage(result.error || 'حدث خطأ في تأكيد البريد الإلكتروني. يرجى المحاولة مرة أخرى.');
          }
        }
        
      } catch (error) {
        console.error('❌ Email verification error:', error);
        setStatus('error');
        setMessage('حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-2 border-gray-200 dark:border-slate-700">
          <CardContent className="p-8 text-center">
            {/* Icon */}
            <div className="mb-6">
              {status === 'verifying' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30"
                >
                  <Loader2 className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                </motion.div>
              )}
              {status === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30"
                >
                  <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </motion.div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {status === 'verifying' && 'جاري التحقق...'}
              {status === 'success' && 'تم التحقق بنجاح!'}
              {status === 'error' && 'فشل التحقق'}
            </h1>

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {status === 'verifying' && 'جاري تأكيد بريدك الإلكتروني، يرجى الانتظار...'}
              {status === 'success' && message}
              {status === 'error' && message}
            </p>

            {/* Actions */}
            {status === 'success' && (
              <div className="space-y-4">
                {isRedirecting ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    جاري التوجه إلى صفحة تسجيل الدخول...
                  </p>
                ) : (
                  <>
                    <Button
                      onClick={() => router.push('/login?verified=true')}
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      size="lg"
                    >
                      <ArrowRight className="w-5 h-5 ml-2" />
                      الذهاب إلى تسجيل الدخول
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      سيتم التوجه تلقائياً خلال 3 ثوانٍ...
                    </p>
                  </>
                )}
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/login')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  العودة لتسجيل الدخول
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  size="lg"
                >
                  الصفحة الرئيسية
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

