import React from 'react';
import { SupervisorProfileData, ProfileCompletionStatus } from '@/lib/api/supervisor-profile';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Award, CheckCircle, AlertCircle, Clock, Star, TrendingUp } from 'lucide-react';
import { useProfileImage } from '@/hooks/useProfileImage';
import ProfileImage from './ProfileImage';
import { useAppSelector } from '@/lib/hooks';

interface ProfileOverviewProps {
  profileData: SupervisorProfileData;
  profileStatus: ProfileCompletionStatus | null;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({ 
  profileData, 
  profileStatus 
}) => {
  const { displayImageUrl, profileImageUrl, isLoading: imageLoading } = useProfileImage();
  const user = useAppSelector((state) => state.auth.user);
  const authState = useAppSelector((state) => state.auth);
  const fullState = useAppSelector((state) => state);
  
  // Use REAL API data - NO FAKE DATA
  const displayData = {
    email: profileData.email || user?.email || 'غير محدد',
    phone_number: profileData.phone_number || user?.phone_number || '',
    country_code: profileData.country_code || user?.country_code || '',
    age: profileData.age || user?.age || 0,
    gender: profileData.gender || user?.gender || '',
    bio: profileData.bio || user?.bio || '',
    department: profileData.department || 'غير محدد',
    specialization: profileData.specialization || 'غير محدد',
    areas_of_responsibility: profileData.areas_of_responsibility || '',
    experience: profileData.experience || '',
    first_name: profileData.first_name || user?.first_name || '',
    last_name: profileData.last_name || user?.last_name || '',
    full_name: profileData.full_name || user?.full_name || '',
    username: profileData.username || user?.username || '',
    role: profileData.role || user?.role || '',
    role_display: profileData.role === 'general_supervisor' ? 'مشرف عام' : 
                  profileData.role === 'academic_supervisor' ? 'مشرف أكاديمي' :
                  profileData.role === 'teacher' ? 'معلم' :
                  profileData.role === 'student' ? 'طالب' : 'مستخدم',
    join_date: profileData.date_joined ? new Date(profileData.date_joined).toLocaleDateString('ar-SA') : '',
    is_verified: profileData.is_verified || false,
    is_active: profileData.is_active || false,
    is_staff: profileData.is_staff || false,
    is_superuser: profileData.is_superuser || false,
    learning_goal: profileData.learning_goal || '',
    preferred_language: profileData.preferred_language || 'ar',
    last_login: profileData.last_login ? new Date(profileData.last_login).toLocaleDateString('ar-SA') : 'لم يسجل دخول من قبل',
    profile_image_url: profileData.profile_image_url || '',
    profile_image_thumbnail_url: profileData.profile_image_thumbnail_url || ''
  };
  
  // Debug profile data - keeping minimal logs
  console.log('🔄 ProfileOverview - Display Data:', displayData);
  console.log('🔄 ProfileOverview - ProfileData from API:', profileData);
  console.log('🔄 ProfileOverview - User from Redux:', user);
  console.log('🔄 ProfileOverview - profileData.email:', profileData.email);
  console.log('🔄 ProfileOverview - profileData.phone_number:', profileData.phone_number);
  console.log('🔄 ProfileOverview - profileData.age:', profileData.age);
  console.log('🔄 ProfileOverview - profileData keys:', Object.keys(profileData));
  const getCompletionColor = (percentage: number) => {
    if (percentage === 100) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionBgColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-50 border-green-200';
    if (percentage >= 70) return 'bg-blue-50 border-blue-200';
    if (percentage >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center gap-6 mb-6">
          <ProfileImage
            displayImageUrl={displayImageUrl}
            originalImageUrl={profileImageUrl}
            isLoading={imageLoading}
            size="md"
            className="rounded-2xl"
          />
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {displayData.first_name && displayData.last_name ? 
                `${displayData.first_name} ${displayData.last_name}` : 
                user?.full_name || 'اسم المشرف'}
            </h2>
            <p className="text-gray-600 text-lg">@{user?.username || profileData.username}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-sm text-white bg-gradient-to-r from-green-600 to-green-700 px-3 py-1 rounded-full font-medium">
                {displayData.role_display}
              </span>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {displayData.department}
              </span>
              {displayData.is_active && (
                <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  نشط
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Completion Status */}
        {profileStatus && (
          <div className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${
              profileStatus.completion_percentage === 100 ? 'from-green-50 via-emerald-50 to-green-100' :
              profileStatus.completion_percentage >= 70 ? 'from-blue-50 via-indigo-50 to-blue-100' :
              profileStatus.completion_percentage >= 40 ? 'from-yellow-50 via-orange-50 to-yellow-100' :
              'from-red-50 via-pink-50 to-red-100'
            } rounded-2xl`} />
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-white/40 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${
                    profileStatus.completion_percentage === 100 ? 'from-green-500 to-emerald-600' :
                    profileStatus.completion_percentage >= 70 ? 'from-blue-500 to-indigo-600' :
                    profileStatus.completion_percentage >= 40 ? 'from-yellow-500 to-orange-600' :
                    'from-red-500 to-pink-600'
                  }`}>
                    {profileStatus.is_complete ? (
                      <Star className="w-5 h-5 text-white" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">حالة البروفايل</h4>
                    <p className={`text-sm font-medium ${
                      profileStatus.completion_percentage === 100 ? 'text-green-700' :
                      profileStatus.completion_percentage >= 70 ? 'text-blue-700' :
                      profileStatus.completion_percentage >= 40 ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>
                      {profileStatus.is_complete ? 'مكتمل بنجاح' : 'يحتاج إلى إكمال'}
                    </p>
                  </div>
                </div>
                
                <div className={`px-4 py-2 rounded-full font-bold text-lg shadow-lg ${
                  profileStatus.is_complete 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                }`}>
                  {profileStatus.completion_percentage}%
                </div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
                <div 
                  className={`h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                    profileStatus.completion_percentage === 100 ? 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-500' :
                    profileStatus.completion_percentage >= 70 ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500' :
                    profileStatus.completion_percentage >= 40 ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-red-400 via-red-500 to-pink-500'
                  }`}
                  style={{ width: `${profileStatus.completion_percentage}%` }}
                >
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
              
              {/* Success Message */}
              {profileStatus.is_complete && (
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-green-800 font-semibold">
                    <Star className="w-4 h-4" />
                    <span>مبروك! البروفايل مكتمل</span>
                    <Star className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          المعلومات الشخصية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/40">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-700">البريد الإلكتروني</p>
              <p className="font-bold text-blue-900">
                {displayData.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/40">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700">رقم الهاتف</p>
              <p className="font-bold text-green-900">
                {displayData.phone_number ? 
                  `${displayData.country_code} ${displayData.phone_number}` : 
                  'غير محدد'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200/40">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-700">العمر</p>
              <p className="font-bold text-purple-900">
                {displayData.age && displayData.age > 0 ? `${displayData.age} سنة` : 'غير محدد'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200/40">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-700">الجنس</p>
              <p className="font-bold text-orange-900">
                {displayData.gender === 'male' ? 'ذكر' : 
                 displayData.gender === 'female' ? 'أنثى' : 
                 'غير محدد'}
              </p>
            </div>
          </div>
        </div>
        {displayData.bio && displayData.bio.trim() && (
          <div className="mt-6">
            <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200/40">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-slate-800">نبذة شخصية</h4>
              </div>
              <p className="text-slate-700 leading-relaxed">{displayData.bio}</p>
            </div>
          </div>
        )}
      </div>

      {/* Account Status */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          حالة الحساب
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border ${displayData.is_active ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/40' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200/40'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${displayData.is_active ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-pink-600'}`}>
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className={`font-bold ${displayData.is_active ? 'text-green-800' : 'text-red-800'}`}>حالة الحساب</h4>
                <p className={`text-sm ${displayData.is_active ? 'text-green-700' : 'text-red-700'}`}>
                  {displayData.is_active ? 'نشط' : 'غير نشط'}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border ${displayData.is_verified ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/40' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200/40'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${displayData.is_verified ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-yellow-500 to-orange-600'}`}>
                <Award className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className={`font-bold ${displayData.is_verified ? 'text-blue-800' : 'text-yellow-800'}`}>حالة التحقق</h4>
                <p className={`text-sm ${displayData.is_verified ? 'text-blue-700' : 'text-yellow-700'}`}>
                  {displayData.is_verified ? 'محقق' : 'غير محقق'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200/40">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-violet-700">المنصب</p>
              <p className="font-bold text-violet-900">
                {displayData.role_display}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200/40">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-700">تاريخ الانضمام</p>
              <p className="font-bold text-amber-900">
                {displayData.join_date || 'غير محدد'}
              </p>
            </div>
          </div>
          
          {displayData.learning_goal && (
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200/40">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-cyan-700">الهدف التعليمي</p>
                <p className="font-bold text-cyan-900">
                  {displayData.learning_goal === 'memorize_quran' ? 'حفظ القرآن الكريم' :
                   displayData.learning_goal === 'learn_arabic' ? 'تعلم اللغة العربية' :
                   displayData.learning_goal === 'islamic_studies' ? 'الدراسات الإسلامية' :
                   displayData.learning_goal}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200/40">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">آخر تسجيل دخول</p>
              <p className="font-bold text-slate-900">
                {displayData.last_login}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
