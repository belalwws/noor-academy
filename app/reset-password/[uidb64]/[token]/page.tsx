'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, KeyRound, ArrowRight } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Password validation
  const passwordValidation = {
    minLength: formData.new_password.length >= 8,
    hasMatch: formData.new_password && formData.new_password === formData.confirm_password,
    isValid: formData.new_password.length >= 8 && formData.new_password === formData.confirm_password
  };

  useEffect(() => {
    // Verify token is present
    const uidb64 = params?.uidb64 as string;
    const token = params?.token as string;

    if (!uidb64 || !token) {
      setStatus('error');
      toast.error('رابط إعادة تعيين كلمة المرور غير صحيح');
      return;
    }

    // Token will be validated when user submits the form
    setStatus('ready');
  }, [params]);

  // Countdown for redirect after success
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      router.push('/login');
    }
  }, [status, countdown, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.new_password) {
      newErrors.new_password = 'كلمة المرور مطلوبة';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'كلمات المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const uidb64 = params?.uidb64 as string;
      const token = params?.token as string;

      const response = await fetch(getApiUrl('/auth/reset-password/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uidb64,
          token,
          new_password: formData.new_password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        toast.success('تم تغيير كلمة المرور بنجاح!');
        setFormData({ new_password: '', confirm_password: '' });
      } else {
        // Handle validation errors
        if (data.errors) {
          const newErrors: Record<string, string> = {};
          Object.keys(data.errors).forEach(key => {
            if (Array.isArray(data.errors[key])) {
              newErrors[key] = data.errors[key][0];
            } else {
              newErrors[key] = data.errors[key];
            }
          });
          setErrors(newErrors);
        }
        
        toast.error(data.message || 'حدث خطأ في تغيير كلمة المرور');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
          <p className="text-gray-600">جاري التحقق من الرابط...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">رابط غير صالح</h1>
          <p className="text-gray-600 mb-6">
            رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/forgot-password')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-5 h-5" />
              طلب رابط جديد
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تم بنجاح!</h1>
          <p className="text-gray-600 mb-6">
            تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            تسجيل الدخول الآن
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-gray-500 mt-4">
            سيتم التوجيه تلقائياً خلال {countdown} ثوانٍ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            إعادة تعيين كلمة المرور
          </h1>
          <p className="text-gray-600">
            أدخل كلمة المرور الجديدة أدناه
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label htmlFor="new_password" className="block text-sm font-semibold text-gray-700 mb-2">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.new_password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : passwordValidation.minLength
                    ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200'
                    : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'
                }`}
                placeholder="أدخل كلمة المرور الجديدة"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.new_password && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                {errors.new_password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-700 mb-2">
              تأكيد كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.confirm_password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : passwordValidation.hasMatch && formData.confirm_password
                    ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200'
                    : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'
                }`}
                placeholder="أعد إدخال كلمة المرور"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                {errors.confirm_password}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-700 mb-2">متطلبات كلمة المرور:</p>
            <div className="space-y-1">
              <div className={`text-sm flex items-center gap-2 ${passwordValidation.minLength ? 'text-emerald-600' : 'text-gray-500'}`}>
                {passwordValidation.minLength ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                8 أحرف على الأقل
              </div>
              <div className={`text-sm flex items-center gap-2 ${passwordValidation.hasMatch && formData.confirm_password ? 'text-emerald-600' : 'text-gray-500'}`}>
                {passwordValidation.hasMatch && formData.confirm_password ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                كلمات المرور متطابقة
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !passwordValidation.isValid}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <>
                <Spinner size="md" tone="contrast" />
                جاري التغيير...
              </>
            ) : (
              <>
                <KeyRound className="w-5 h-5" />
                تغيير كلمة المرور
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
          >
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
}


