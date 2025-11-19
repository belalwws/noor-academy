/**
 * ChangePasswordForm Component
 * Allows users to change their password
 * Features: Password visibility toggle, validation, security tips
 */

'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface ChangePasswordFormProps {
  onSubmit: (oldPassword: string, newPassword: string) => Promise<boolean>;
  loading?: boolean;
  className?: string;
}

export function ChangePasswordForm({
  onSubmit,
  loading = false,
  className = '',
}: ChangePasswordFormProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength checker
  const getPasswordStrength = (password: string): {
    score: number;
    label: string;
    color: string;
  } => {
    if (!password) {
      return { score: 0, label: '', color: '' };
    }

    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character diversity
    if (/[a-z]/.test(password)) score++; // lowercase
    if (/[A-Z]/.test(password)) score++; // uppercase
    if (/[0-9]/.test(password)) score++; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) score++; // special chars

    if (score <= 2) {
      return { score, label: 'ضعيفة', color: 'bg-red-500' };
    } else if (score <= 4) {
      return { score, label: 'متوسطة', color: 'bg-yellow-500' };
    } else {
      return { score, label: 'قوية', color: 'bg-green-500' };
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Validation
  const validateForm = (): boolean => {
    setError(null);

    if (!oldPassword) {
      setError('الرجاء إدخال كلمة المرور الحالية');
      return false;
    }

    if (!newPassword) {
      setError('الرجاء إدخال كلمة المرور الجديدة');
      return false;
    }

    if (newPassword.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return false;
    }

    if (newPassword === oldPassword) {
      setError('كلمة المرور الجديدة يجب أن تكون مختلفة عن القديمة');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمة المرور وتأكيدها غير متطابقين');
      return false;
    }

    return true;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const success = await onSubmit(oldPassword, newPassword);
    
    if (success) {
      // Reset form on success
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              تغيير كلمة المرور
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              حافظ على أمان حسابك بكلمة مرور قوية
            </p>
          </div>
        </div>

        {/* Old Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            كلمة المرور الحالية
          </label>
          <div className="relative">
            <Input
              type={showOldPassword ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الحالية"
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            كلمة المرور الجديدة
          </label>
          <div className="relative">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الجديدة"
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">قوة كلمة المرور:</span>
                <span className={`font-semibold ${
                  passwordStrength.score <= 2 ? 'text-red-600' :
                  passwordStrength.score <= 4 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            تأكيد كلمة المرور
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد إدخال كلمة المرور الجديدة"
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Match Indicator */}
          {confirmPassword && (
            <div className="flex items-center gap-2 text-xs">
              {newPassword === confirmPassword ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">كلمات المرور متطابقة</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-600">كلمات المرور غير متطابقة</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Security Tips */}
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p className="font-semibold">نصائح لكلمة مرور قوية:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>استخدم 8 أحرف على الأقل</li>
                <li>اجمع بين الأحرف الكبيرة والصغيرة</li>
                <li>أضف أرقام ورموز خاصة (!@#$%)</li>
                <li>تجنب المعلومات الشخصية الواضحة</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !oldPassword || !newPassword || !confirmPassword}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              جاري تغيير كلمة المرور...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              تغيير كلمة المرور
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
