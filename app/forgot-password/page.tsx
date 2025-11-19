'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { getApiUrl } from '@/lib/config';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return;
    }

    if (!validateEmail(email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/auth/password-reset/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast.success('تم إرسال رابط إعادة تعيين كلمة المرور بنجاح!');
      } else {
        if (response.status === 429) {
          setError('تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.');
        } else if (response.status === 404) {
          setError('البريد الإلكتروني غير مسجل في النظام');
        } else if (response.status >= 500) {
          setError('خطأ في الخادم. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني.');
        } else {
          setError(data.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">استعادة كلمة المرور</h1>
          <p className="text-gray-600">أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center text-gray-800">
              {isSuccess ? 'تم الإرسال بنجاح!' : 'نسيت كلمة المرور؟'}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {isSuccess
                ? 'تحقق من بريدك الإلكتروني للحصول على رابط إعادة التعيين'
                : 'لا تقلق، سنرسل لك رابط إعادة تعيين كلمة المرور'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isSuccess ? (
              // Success State
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <Alert className="border-green-200 bg-green-50">
                  <Mail className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>تم إرسال الرابط بنجاح!</strong>
                    <br />
                    تحقق من بريدك الإلكتروني: <strong>{email}</strong>
                  </AlertDescription>
                </Alert>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <div className="flex items-start gap-2 mb-2">
                    <Clock className="w-4 h-4 mt-0.5 text-blue-600" />
                    <div>
                      <p className="font-medium">تعليمات مهمة:</p>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• تحقق من صندوق الوارد ومجلد الرسائل المزعجة</li>
                        <li>• الرابط صالح لمدة 30 دقيقة فقط</li>
                        <li>• لا تشارك الرابط مع أي شخص</li>
                        <li>• إذا لم تطلب إعادة التعيين، تجاهل الرسالة</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail('');
                      setError('');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    إرسال رابط جديد
                  </Button>

                  <Button
                    onClick={() => router.push('/login')}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    العودة لتسجيل الدخول
                  </Button>
                </div>
              </div>
            ) : (
              // Form State
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    البريد الإلكتروني
                  </Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="أدخل بريدك الإلكتروني"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className="pr-10 text-right"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2.5"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" tone="contrast" className="mr-2" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      إرسال رابط إعادة التعيين
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    العودة لتسجيل الدخول
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>تحتاج مساعدة؟</p>
          <Link
            href="mailto:support@lisan-alhekma.com"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            تواصل مع الدعم الفني
          </Link>
        </div>
      </div>
    </div>
  );
}



