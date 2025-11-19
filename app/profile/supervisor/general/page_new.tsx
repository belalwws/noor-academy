'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { updateUser } from '@/lib/store';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SupervisorProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    specialization: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // تحميل البيانات عند بداية الصفحة
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        department: '',
        specialization: ''
      });
    }
  }, [user]);

  // تحديث البيانات عند الكتابة
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // حفظ البيانات
  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      console.log('🔍 Saving profile...');
      
      // الحصول على التوكن
      const { getAuthToken } = await import('@/lib/auth');
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة');
      }

      // إعداد البيانات للإرسال
      const userData = {
        first_name: profileData.full_name.split(' ')[0] || '',
        last_name: profileData.full_name.split(' ').slice(1).join(' ') || '',
        full_name: profileData.full_name,
        email: profileData.email,
        phone_number: profileData.phone
      };

      console.log('🔍 Sending data:', userData);

      // إرسال البيانات للـ API
      const response = await fetch('https://lisan-alhekma.onrender.com/api/auth/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      console.log('🔍 Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Success:', result);
        
        // تحديث Redux store
        dispatch(updateUser({
          ...user,
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: profileData.full_name,
          email: userData.email,
          phone: userData.phone_number
        }));
        
        setMessage('تم حفظ البيانات بنجاح!');
      } else {
        const errorText = await response.text();
        console.error('❌ Error:', errorText);
        throw new Error('فشل في حفظ البيانات');
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      setMessage('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['supervisor', 'general_supervisor']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* العنوان */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">الملف الشخصي</h1>
            <p className="text-gray-600">تحديث بياناتك الشخصية</p>
          </div>

          {/* النموذج */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* الاسم الكامل */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              {/* البريد الإلكتروني */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="your@email.com"
                />
              </div>

              {/* رقم الهاتف */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="05xxxxxxxx"
                />
              </div>

              {/* القسم */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  القسم
                </label>
                <input
                  type="text"
                  name="department"
                  value={profileData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="اسم القسم"
                />
              </div>

              {/* التخصص */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التخصص
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={profileData.specialization}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="تخصصك"
                />
              </div>
            </div>

            {/* رسالة النتيجة */}
            {message && (
              <div className={`mt-4 p-3 rounded-md ${
                message.includes('نجاح') 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* زر الحفظ */}
            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'جاري الحفظ...' : 'حفظ البيانات'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
