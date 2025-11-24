import React from 'react';
import { AcademicSupervisorProfileData, ProfileStatus } from '@/lib/api/academic-supervisor-profile';
import { User, Mail, Phone, Calendar, CheckCircle, Clock, Star, TrendingUp } from 'lucide-react';
import { useProfileImage } from '@/hooks/useProfileImage';
import ProfileImage from '@/components/supervisor-profile/ProfileImage';
import { useAppSelector } from '@/lib/hooks';

interface ProfileOverviewProps {
  profileData: AcademicSupervisorProfileData;
  profileStatus: ProfileStatus | null;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ 
  profileData, 
  profileStatus 
}) => {
  const { displayImageUrl, profileImageUrl, isLoading: imageLoading } = useProfileImage();
  const user = useAppSelector((state) => state.auth.user);
  
  // Combine API data with Redux fallbacks
  const displayData = {
    // Personal Information (API first, then Redux fallback)
    email: profileData.email || user?.email || 'غير محدد',
    phone_number: profileData.phone_number || (user as any)?.phone_number || '',
    country_code: profileData.country_code || (user as any)?.country_code || '',
    age: profileData.age || user?.age || 0,
    gender: profileData.gender || user?.gender || '',
    bio: profileData.bio || user?.bio || '',
    first_name: profileData.first_name || user?.first_name || '',
    last_name: profileData.last_name || user?.last_name || '',
    full_name: profileData.full_name || user?.full_name || '',
    username: profileData.username || user?.username || '',
    role: profileData.role || user?.role || '',
    role_display: profileData.role === 'academic_supervisor' ? 'مشرف أكاديمي' : 
                  profileData.role === 'general_supervisor' ? 'مشرف عام' :
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
    profile_image_url: profileData.profile_image_url || user?.profile_image_url || '',
    profile_image_thumbnail_url: profileData.profile_image_thumbnail_url || user?.profile_image_thumbnail_url || '',
  };

  const completionPercentage = profileStatus?.completion_percentage || 0;
  const isComplete = profileStatus?.is_complete || false;

  return (
    <div className="space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <ProfileImage
                displayImageUrl={displayImageUrl}
                originalImageUrl={profileImageUrl}
                isLoading={imageLoading}
                size="lg"
                className="w-24 h-24 rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {displayData.full_name || `${displayData.first_name} ${displayData.last_name}`.trim() || displayData.username || 'المشرف الأكاديمي'}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-full">
                    {displayData.role_display}
                  </span>
                  {displayData.is_verified && (
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      موثق
                    </span>
                  )}
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {displayData.bio || 'لم يتم إضافة نبذة شخصية بعد'}
                </p>
              </div>

              {/* Completion Status */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-50 border border-blue-200 rounded-xl p-4 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  {isComplete ? (
                    <Star className="w-5 h-5 text-blue-600" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="font-medium text-blue-900">
                    {isComplete ? 'مكتمل' : 'غير مكتمل'}
                  </span>
                </div>
                
                {/* Enhanced Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-blue-200 rounded-full h-3 mb-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{ width: `${completionPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700">
                      {completionPercentage}%
                    </span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < Math.floor(completionPercentage / 20) 
                              ? 'bg-blue-500' 
                              : 'bg-blue-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            المعلومات الشخصية
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* البريد الإلكتروني */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-blue-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                <p className="font-medium text-gray-900 truncate">{displayData.email}</p>
              </div>
            </div>
            
            {/* رقم الهاتف */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Phone className="w-5 h-5 text-blue-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">رقم الهاتف</p>
                <p className="font-medium text-gray-900 truncate">
                  {displayData.phone_number 
                    ? `${displayData.country_code || '+966'} ${displayData.phone_number}`
                    : 'غير محدد'
                  }
                </p>
              </div>
            </div>
            
            {/* العمر */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">العمر</p>
                <p className="font-medium text-gray-900">
                  {displayData.age ? `${displayData.age} سنة` : 'غير محدد'}
                </p>
              </div>
            </div>
            
            {/* الجنس */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <User className="w-5 h-5 text-blue-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">الجنس</p>
                <p className="font-medium text-gray-900">
                  {displayData.gender === 'male' ? 'ذكر' : 
                   displayData.gender === 'female' ? 'أنثى' : 'غير محدد'}
                </p>
              </div>
            </div>
          </div>
      </div>

      {/* System Information Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          معلومات النظام
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">تاريخ الانضمام</p>
            <p className="font-medium text-gray-900">{displayData.join_date || 'غير محدد'}</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">آخر تسجيل دخول</p>
            <p className="font-medium text-gray-900">{displayData.last_login}</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">اللغة المفضلة</p>
            <p className="font-medium text-gray-900">
              {displayData.preferred_language === 'ar' ? 'العربية' : 
               displayData.preferred_language === 'en' ? 'English' : 'العربية'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
