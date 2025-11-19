/**
 * ProfileEditForm Component
 * Comprehensive form for editing user profile information
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Save, User, Mail, Phone, Calendar, Globe, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import type { UserProfile, ProfileUpdateData } from '@/lib/api/profile';

interface ProfileEditFormProps {
  profile: UserProfile;
  onUpdate: (data: Partial<ProfileUpdateData>) => Promise<UserProfile | null>;
  loading?: boolean;
  className?: string;
}

export function ProfileEditForm({
  profile,
  onUpdate,
  loading = false,
  className = '',
}: ProfileEditFormProps) {
  const [formData, setFormData] = useState<ProfileUpdateData>({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    phone_number: profile.phone_number || '',
    country_code: profile.country_code || '',
    age: profile.age || 0,
    gender: profile.gender || 'male',
    bio: profile.bio || '',
    preferred_language: profile.preferred_language || 'ar',
    is_profile_public: profile.is_profile_public ?? false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDirty, setIsDirty] = useState(false);

  // Update form when profile changes
  useEffect(() => {
    setFormData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      phone_number: profile.phone_number || '',
      country_code: profile.country_code || '',
      age: profile.age || 0,
      gender: profile.gender || 'male',
      bio: profile.bio || '',
      preferred_language: profile.preferred_language || 'ar',
      is_profile_public: profile.is_profile_public ?? false,
    });
  }, [profile]);

  // Handle input change
  const handleChange = (field: keyof ProfileUpdateData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.first_name?.trim()) {
      newErrors['first_name'] = 'الاسم الأول مطلوب';
    }

    if (!formData.last_name?.trim()) {
      newErrors['last_name'] = 'اسم العائلة مطلوب';
    }

    if (formData.phone_number && !/^[\d+\-() ]+$/.test(formData.phone_number)) {
      newErrors['phone_number'] = 'رقم الهاتف غير صالح';
    }

    if (formData.age && (formData.age < 5 || formData.age > 120)) {
      newErrors['age'] = 'العمر يجب أن يكون بين 5 و 120';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const result = await onUpdate(formData);
    if (result) {
      setIsDirty(false);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                تحرير الملف الشخصي
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                قم بتحديث معلوماتك الشخصية
              </p>
            </div>
          </div>
          
          {isDirty && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>تغييرات غير محفوظة</span>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              الاسم الأول *
            </label>
            <Input
              value={formData.first_name || ''}
              onChange={(e) => handleChange('first_name', e.target.value)}
              placeholder="أدخل الاسم الأول"
              disabled={loading}
              className={errors['first_name'] ? 'border-red-500' : ''}
            />
            {errors['first_name'] && (
              <p className="text-xs text-red-600">{errors['first_name']}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              اسم العائلة *
            </label>
            <Input
              value={formData.last_name || ''}
              onChange={(e) => handleChange('last_name', e.target.value)}
              placeholder="أدخل اسم العائلة"
              disabled={loading}
              className={errors['last_name'] ? 'border-red-500' : ''}
            />
            {errors['last_name'] && (
              <p className="text-xs text-red-600">{errors['last_name']}</p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email (Read-only) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              <Mail className="w-4 h-4 inline-block ml-1" />
              البريد الإلكتروني
            </label>
            <Input
              type="email"
              value={profile.email}
              disabled
              className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
            />
            {!profile.is_verified && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                ⚠️ البريد الإلكتروني غير موثق
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              <Phone className="w-4 h-4 inline-block ml-1" />
              رقم الهاتف
            </label>
            <Input
              type="tel"
              value={formData.phone_number || ''}
              onChange={(e) => handleChange('phone_number', e.target.value)}
              placeholder="+966 XX XXX XXXX"
              disabled={loading}
              className={errors['phone_number'] ? 'border-red-500' : ''}
            />
            {errors['phone_number'] && (
              <p className="text-xs text-red-600">{errors['phone_number']}</p>
            )}
          </div>
        </div>

        {/* Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Age */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 inline-block ml-1" />
              العمر
            </label>
            <Input
              type="number"
              value={formData.age || ''}
              onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
              placeholder="25"
              min="5"
              max="120"
              disabled={loading}
              className={errors['age'] ? 'border-red-500' : ''}
            />
            {errors['age'] && (
              <p className="text-xs text-red-600">{errors['age']}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              الجنس
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value as 'male' | 'female')}
              disabled={loading}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>

          {/* Country Code */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              <Globe className="w-4 h-4 inline-block ml-1" />
              كود البلد
            </label>
            <Input
              value={formData.country_code || ''}
              onChange={(e) => handleChange('country_code', e.target.value)}
              placeholder="+966"
              disabled={loading}
            />
          </div>
        </div>

        {/* Preferred Language */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            <Globe className="w-4 h-4 inline-block ml-1" />
            اللغة المفضلة
          </label>
          <select
            value={formData.preferred_language}
            onChange={(e) => handleChange('preferred_language', e.target.value as 'ar' | 'en')}
            disabled={loading}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            نبذة عني
          </label>
          <textarea
            value={formData.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="اكتب نبذة عن نفسك..."
            disabled={loading}
            rows={4}
            maxLength={500}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 text-left">
            {(formData.bio || '').length} / 500
          </p>
        </div>

        {/* Privacy */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <input
            type="checkbox"
            id="is_profile_public"
            checked={formData.is_profile_public ?? false}
            onChange={(e) => handleChange('is_profile_public', e.target.checked)}
            disabled={loading}
            className="w-5 h-5 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
          />
          <label
            htmlFor="is_profile_public"
            className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            اجعل ملفي الشخصي عامًا (يمكن للآخرين رؤية معلوماتي)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading || !isDirty}
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                حفظ التغييرات
              </>
            )}
          </Button>

          {isDirty && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  first_name: profile.first_name || '',
                  last_name: profile.last_name || '',
                  phone_number: profile.phone_number || '',
                  country_code: profile.country_code || '',
                  age: profile.age || 0,
                  gender: profile.gender || 'male',
                  bio: profile.bio || '',
                  preferred_language: profile.preferred_language || 'ar',
                  is_profile_public: profile.is_profile_public ?? false,
                });
                setIsDirty(false);
                setErrors({});
              }}
              disabled={loading}
            >
              إلغاء
            </Button>
          )}
        </div>

        {/* Success Indicator */}
        {!isDirty && !loading && Object.keys(errors).length === 0 && formData.first_name && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-950/30 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم حفظ جميع التغييرات</span>
          </div>
        )}
      </form>
    </Card>
  );
}
