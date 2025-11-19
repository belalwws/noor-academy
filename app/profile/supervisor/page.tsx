'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { updateUser, logout } from '@/lib/store';
import { getAuthData, saveAuthData, clearAuthData } from '@/lib/auth';
import { apiService } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Camera, Save, LogOut, Users, BookOpen, Award, TrendingUp, Clock, Star, Shield, Settings, Eye, UserCheck } from 'lucide-react';

interface ProfileData {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  learning_goal: string;
  preferred_language: string;
  bio: string;
  is_profile_public: boolean;
  profile_image_url: string;
  role: string;
  department?: string;
  supervision_area?: string;
  years_of_experience?: string;
  certification_level?: string;
  country_code?: string;
  experience?: string;
  achievements?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'info';
  message: string;
}

const ResponseModal: React.FC<ModalProps> = ({ isOpen, onClose, type, message }) => {
  if (!isOpen) return null;

  const bgColor = type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50';
  const textColor = type === 'success' ? 'text-green-800' : type === 'error' ? 'text-red-800' : 'text-blue-800';
  const borderColor = type === 'success' ? 'border-green-200' : type === 'error' ? 'border-red-200' : 'border-blue-200';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${bgColor} ${borderColor} border rounded-lg p-6 max-w-md w-full mx-4`}>
        <p className={`${textColor} text-center mb-4`}>{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          موافق
        </button>
      </div>
    </div>
  );
};

const SupervisorProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    age: '',
    gender: 'male',
    learning_goal: 'personal_development',
    preferred_language: 'ar',
    bio: '',
    is_profile_public: false,
    profile_image_url: '',
    role: 'supervisor',
    department: '',
    supervision_area: '',
    years_of_experience: '',
    certification_level: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [modal, setModal] = useState<ModalProps>({
    isOpen: false,
    onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
    type: 'info',
    message: ''
  });

  useEffect(() => {
    const loadSupervisorProfile = async () => {
      if (!user || user.role !== 'supervisor') {
        setIsLoadingProfile(false);
        return;
      }

      try {
        console.log('🔍 Loading supervisor profile...');
        const response = await apiService.getSupervisorProfile();
        
        if (response.success && response.data) {
          const profile = response.data;
          console.log('🔍 Profile loaded:', profile);
          
          setProfileData({
            full_name: profile.user?.full_name || '',
            username: profile.user?.username || '',
            email: profile.user?.email || '',
            phone: profile.user?.phone_number || '',
            age: profile.user?.age?.toString() || '',
            gender: profile.user?.gender || 'male',
            learning_goal: profile.user?.learning_goal || 'personal_development',
            preferred_language: profile.user?.preferred_language || 'ar',
            bio: profile.user?.bio || '',
            is_profile_public: profile.user?.is_profile_public || false,
            profile_image_url: profile.user?.profile_image_url || '',
            role: profile.user?.role || 'supervisor',
            department: profile.department || '',
            supervision_area: profile.areas_of_responsibility || '',
            years_of_experience: '',
            certification_level: profile.specialization || ''
          });
        } else {
          // If no profile data, use user data as fallback
          setProfileData({
            full_name: user.full_name || '',
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            age: user.age?.toString() || '',
            gender: user.gender || 'male',
            learning_goal: user.learning_goal || 'personal_development',
            preferred_language: user.preferred_language || 'ar',
            bio: user.bio || '',
            is_profile_public: user.is_profile_public || false,
            profile_image_url: user.profile_image_url || '',
            role: user.role || 'supervisor',
            department: '',
            supervision_area: '',
            years_of_experience: '',
            certification_level: ''
          });
        }
      } catch (error) {
        console.error('❌ Error loading supervisor profile:', error);
        // Use user data as fallback
        if (user) {
          setProfileData({
            full_name: user.full_name || '',
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            age: user.age?.toString() || '',
            gender: user.gender || 'male',
            learning_goal: user.learning_goal || 'personal_development',
            preferred_language: user.preferred_language || 'ar',
            bio: user.bio || '',
            is_profile_public: user.is_profile_public || false,
            profile_image_url: user.profile_image_url || '',
            role: user.role || 'supervisor',
            department: '',
            supervision_area: '',
            years_of_experience: '',
            certification_level: ''
          });
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadSupervisorProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Saving academic supervisor profile...');
      
      // الحصول على التوكن
      const { getAuthToken } = await import('@/lib/auth');
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة');
      }

      // إعداد البيانات للإرسال حسب API الجديد
      const supervisorData = {
        first_name: profileData.full_name.split(' ')[0] || '',
        last_name: profileData.full_name.split(' ').slice(1).join(' ') || '',
        username: profileData.username.trim(),
        phone_number: profileData.phone.trim(),
        country_code: '+966',
        gender: profileData.gender,
        age: parseInt(profileData.age) || 0,
        bio: profileData.bio.trim(),
        department: profileData.department.trim(),
        specialization: profileData.certification_level.trim(),
        areas_of_responsibility: profileData.supervision_area.trim(),
        experience: profileData.years_of_experience.trim(),
        achievements: ''
      };

      // التحقق من وجود بيانات للحفظ
      const hasData = Object.values(supervisorData).some(value => 
        value !== '' && value !== 0 && value !== null && value !== undefined
      );
      
      if (!hasData) {
        setModal({
          isOpen: true,
          onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
          type: 'error',
          message: 'يرجى ملء بعض البيانات قبل الحفظ'
        });
        setIsLoading(false);
        return;
      }

      // التحقق من العمر إذا تم إدخاله
      if (supervisorData.age > 0 && (supervisorData.age < 18 || supervisorData.age > 100)) {
        setModal({
          isOpen: true,
          onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
          type: 'error',
          message: 'العمر يجب أن يكون بين 18 و 100 سنة'
        });
        setIsLoading(false);
        return;
      }

      // أرسل فقط الحقول غير الفارغة
      const dataToSend = Object.fromEntries(
        Object.entries(supervisorData).filter(([_, value]) => 
          value !== '' && value !== 0 && value !== null && value !== undefined
        )
      );

      console.log('🔍 Sending academic supervisor data:', dataToSend);

      // إرسال البيانات للـ API الجديد
      const response = await fetch('https://lisan-alhekma.onrender.com/api/supervisors/profile/complete/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      console.log('🔍 Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Success:', result);
        
        // تحديث Redux store
        dispatch(updateUser({
          ...user,
          ...supervisorData,
          full_name: `${supervisorData.first_name} ${supervisorData.last_name}`.trim()
        }));
        
        setModal({
          isOpen: true,
          onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
          type: 'success',
          message: 'تم حفظ البيانات بنجاح!'
        });
      } else {
        // التحقق من نوع المحتوى قبل محاولة تحليل JSON
        const contentType = response.headers.get('content-type');
        console.log('🔍 Content-Type:', contentType);
        
        let errorMessage = 'فشل في حفظ البيانات';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            console.error('❌ Error:', errorData);
            
            if (errorData.detail) {
              errorMessage = `خطأ: ${errorData.detail}`;
            } else if (errorData.non_field_errors) {
              errorMessage = `خطأ: ${errorData.non_field_errors.join(', ')}`;
            } else if (errorData.error) {
              errorMessage = `خطأ: ${errorData.error}`;
            } else {
              // عرض أخطاء الحقول الفردية
              const fieldErrors = [];
              for (const [field, errors] of Object.entries(errorData)) {
                if (Array.isArray(errors)) {
                  fieldErrors.push(`${field}: ${errors.join(', ')}`);
                } else if (typeof errors === 'string') {
                  fieldErrors.push(`${field}: ${errors}`);
                }
              }
              
              if (fieldErrors.length > 0) {
                errorMessage = `أخطاء في البيانات: ${fieldErrors.join(' | ')}`;
              }
            }
          } catch (jsonError) {
            console.error('❌ JSON Parse Error:', jsonError);
            errorMessage = `خطأ في الخادم (${response.status}): فشل في تحليل الاستجابة`;
          }
        } else {
          // إذا لم تكن الاستجابة JSON، احصل على النص
          try {
            const errorText = await response.text();
            console.error('❌ Error Text:', errorText);
            
            if (response.status === 500) {
              errorMessage = 'خطأ في الخادم (500): يرجى المحاولة مرة أخرى لاحقاً';
            } else if (response.status === 400) {
              errorMessage = 'خطأ في البيانات المرسلة: يرجى التحقق من جميع الحقول';
            } else if (response.status === 401) {
              errorMessage = 'غير مصرح لك: يرجى تسجيل الدخول مرة أخرى';
            } else if (response.status === 403) {
              errorMessage = 'غير مسموح: ليس لديك صلاحية لإكمال الملف الشخصي';
            } else {
              errorMessage = `خطأ في الخادم (${response.status}): ${errorText.substring(0, 100)}`;
            }
          } catch (textError) {
            console.error('❌ Text Parse Error:', textError);
            errorMessage = `خطأ في الخادم (${response.status}): فشل في قراءة الاستجابة`;
          }
        }
        
        setModal({
          isOpen: true,
          onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
          type: 'error',
          message: errorMessage
        });
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      setModal({
        isOpen: true,
        onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
        type: 'error',
        message: 'حدث خطأ أثناء حفظ البيانات'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    clearAuthData();
  };

  if (isLoadingProfile) {
    return (
      <ProtectedRoute allowedRoles={['supervisor', 'general_supervisor', 'academic_supervisor']}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">جاري تحميل الملف الشخصي...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['supervisor', 'general_supervisor', 'academic_supervisor']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : 'M'}
                </div>
                <button className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <div className="text-center md:text-right flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {profileData.full_name || 'مشرف النظام'}
                </h1>
                <p className="text-purple-600 font-medium mb-2">مشرف تعليمي</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Shield size={14} className="inline ml-1" />
                    صلاحيات إشراف
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Users size={14} className="inline ml-1" />
                    إدارة المستخدمين
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المعلمين المُشرف عليهم</p>
                  <p className="text-2xl font-bold text-purple-600">24</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الطلاب النشطين</p>
                  <p className="text-2xl font-bold text-blue-600">156</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الدورات المُراقبة</p>
                  <p className="text-2xl font-bold text-green-600">18</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">معدل الأداء</p>
                  <p className="text-2xl font-bold text-orange-600">94%</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="ml-2" size={20} />
                المعلومات الشخصية
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    name="full_name"
                    value={profileData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم</label>
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">العمر</label>
                    <input
                      type="number"
                      name="age"
                      value={profileData.age}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الجنس</label>
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Supervision Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="ml-2" size={20} />
                معلومات الإشراف
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">القسم</label>
                  <select
                    name="department"
                    value={profileData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">اختر القسم</option>
                    <option value="arabic">اللغة العربية</option>
                    <option value="islamic">التربية الإسلامية</option>
                    <option value="quran">القرآن الكريم</option>
                    <option value="general">عام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">مجال الإشراف</label>
                  <select
                    name="supervision_area"
                    value={profileData.supervision_area}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">اختر مجال الإشراف</option>
                    <option value="teachers">إشراف على المعلمين</option>
                    <option value="students">إشراف على الطلاب</option>
                    <option value="courses">إشراف على الدورات</option>
                    <option value="content">إشراف على المحتوى</option>
                    <option value="general">إشراف عام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سنوات الخبرة</label>
                  <input
                    type="number"
                    name="years_of_experience"
                    value={profileData.years_of_experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">مستوى الشهادة</label>
                  <select
                    name="certification_level"
                    value={profileData.certification_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">اختر مستوى الشهادة</option>
                    <option value="bachelor">بكالوريوس</option>
                    <option value="master">ماجستير</option>
                    <option value="phd">دكتوراه</option>
                    <option value="diploma">دبلوم</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نبذة عن الخبرة الإشرافية</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="اكتب نبذة عن خبرتك في الإشراف التعليمي..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_profile_public"
                    checked={profileData.is_profile_public}
                    onChange={handleInputChange}
                    className="ml-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">جعل الملف الشخصي عام</label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
              ) : (
                <Save className="ml-2" size={20} />
              )}
              {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
            
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <LogOut className="ml-2" size={20} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
      <ResponseModal {...modal} />
    </ProtectedRoute>
  );
};

export default SupervisorProfilePage;
