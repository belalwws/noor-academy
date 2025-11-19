'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DollarSign, Info, User, Mail, Phone, Loader2 } from 'lucide-react';
import type { StepProps } from '../types';
import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';

interface AcademicSupervisor {
  id?: number | string;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  country?: string;
  specialization?: string;
  type?: 'academic' | 'general';
}

export function Step3Pricing({ formData, updateFormData, courseType }: StepProps) {
  const [supervisor, setSupervisor] = useState<AcademicSupervisor | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSupervisorInfo = async () => {
      if (courseType !== 'recorded') {
        return;
      }

      try {
        setLoading(true);
        
        const token = await getAuthToken();
        const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
        
        // Fetch academic supervisor from API
        // The endpoint is /teachers/profiles/my-supervisors/ (action method in TeacherProfileViewSet)
        const response = await fetch(
          `${API_BASE_URL}/teachers/profiles/my-supervisors/?type=academic`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Academic supervisor API response:', data);
          
          // Handle different response structures
          let supervisors = [];
          if (data.supervisors && Array.isArray(data.supervisors)) {
            supervisors = data.supervisors;
          } else if (Array.isArray(data)) {
            supervisors = data;
          } else if (data.data && Array.isArray(data.data)) {
            supervisors = data.data;
          }
          
          // Get the first academic supervisor
          const academicSupervisorData = supervisors.find((s: AcademicSupervisor) => s.type === 'academic') || supervisors[0];
          
          if (academicSupervisorData) {
            const supervisorInfo: AcademicSupervisor = {
              id: academicSupervisorData.id,
              name: academicSupervisorData.name || academicSupervisorData.full_name || '',
              full_name: academicSupervisorData.full_name || academicSupervisorData.name || '',
              email: academicSupervisorData.email || '',
              phone: academicSupervisorData.phone || academicSupervisorData.phone_number || '',
              country: academicSupervisorData.country || '',
              specialization: academicSupervisorData.specialization || '',
              type: 'academic',
            };
            
            console.log('✅ Academic Supervisor found:', supervisorInfo);
            setSupervisor(supervisorInfo);
          } else {
            console.warn('⚠️ No academic supervisor found in API response');
          }
        } else {
          const errorText = await response.text();
          console.error('❌ API Error:', response.status, errorText);
          console.warn('⚠️ Could not fetch academic supervisor from API:', response.status);
        }
      } catch (err) {
        console.error('❌ Error fetching academic supervisor:', err);
        // Check if it's a connection error
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          console.warn('⚠️ Could not connect to API server. Please make sure the Django server is running on http://localhost:8000');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisorInfo();
  }, [courseType]);
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          التسعير
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          حدد سعر الدورة للطلاب
        </p>
      </div>

      <div className="space-y-4">
        {courseType === 'recorded' ? (
          <div className="space-y-4">
            {/* Price Input */}
            <div>
              <Label htmlFor="price" className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                سعر الدورة الأساسي (ريال سعودي)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={(e) => updateFormData('price', e.target.value)}
                placeholder="0.00"
                className="mt-2 text-lg"
              />
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  💡 سيتم إضافة نسبة المنصة تلقائياً على السعر الأساسي
                </p>
              </div>
            </div>

            {/* Academic Supervisor Contact Info */}
            {loading ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 text-slate-600 dark:text-slate-400 animate-spin" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    جاري تحميل معلومات المشرف الأكاديمي...
                  </p>
                </div>
              </div>
            ) : supervisor ? (
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      المشرف الأكاديمي
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      للاستفسار عن نسبة العمولة والتفاصيل
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {supervisor.full_name && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">الاسم</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{supervisor.full_name}</p>
                      </div>
                    </div>
                  )}
                  
                  {supervisor.email && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400">البريد الإلكتروني</p>
                        <a 
                          href={`mailto:${supervisor.email}`}
                          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                        >
                          {supervisor.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {supervisor.phone && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <Phone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">رقم الهاتف</p>
                        <a 
                          href={`tel:${supervisor.phone}`}
                          className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {supervisor.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {supervisor.specialization && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">التخصص</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {supervisor.specialization}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {supervisor.country && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">البلد</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {supervisor.country}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      💡 تواصل مع المشرف الأكاديمي لمعرفة نسبة عمولة المنصة وأي تفاصيل أخرى قبل تحديد سعر الدورة
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
            <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              الدورات المباشرة لا تحتاج إلى تسعير في هذه المرحلة
            </p>
          </div>
        )}
      </div>
    </div>
  );
}










