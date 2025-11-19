'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { updateUser, logout } from '@/lib/store';
import { getAuthData, saveAuthData, clearAuthData } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';
import { Camera, Save, LogOut, Users, BookOpen, Award, TrendingUp, Clock, Star, Shield, Settings, Eye, UserCheck, Database, Server, Activity } from 'lucide-react';

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
  admin_level?: string;
  department?: string;
  access_permissions?: string[];
  last_login?: string;
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

const AdminProfilePage: React.FC = () => {
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
    role: 'admin',
    admin_level: 'super_admin',
    department: 'system_administration',
    access_permissions: ['all'],
    last_login: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<ModalProps>({
    isOpen: false,
    onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
    type: 'info',
    message: ''
  });

  useEffect(() => {
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
        role: user.role || 'admin',
        admin_level: user.admin_level || 'super_admin',
        department: user.department || 'system_administration',
        access_permissions: user.access_permissions || ['all'],
        last_login: user.last_login || ''
      });
    }
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setModal({
        isOpen: true,
        onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
        type: 'success',
        message: 'تم حفظ البيانات بنجاح!'
      });
    } catch (error) {
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : 'A'}
                </div>
                <button className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <div className="text-center md:text-right flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {profileData.full_name || 'مدير النظام'}
                </h1>
                <p className="text-red-600 font-medium mb-2">مدير عام</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Shield size={14} className="inline ml-1" />
                    صلاحيات كاملة
                  </span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Database size={14} className="inline ml-1" />
                    إدارة النظام
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Server size={14} className="inline ml-1" />
                    إدارة الخوادم
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Statistics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-red-600">1,247</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الدورات</p>
                  <p className="text-2xl font-bold text-blue-600">89</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">حالة النظام</p>
                  <p className="text-2xl font-bold text-green-600">99.9%</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المستخدمين النشطين</p>
                  <p className="text-2xl font-bold text-purple-600">892</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-purple-600" />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم</label>
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الجنس</label>
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Administrative Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="ml-2" size={20} />
                معلومات الإدارة
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">مستوى الإدارة</label>
                  <select
                    name="admin_level"
                    value={profileData.admin_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="super_admin">مدير عام</option>
                    <option value="admin">مدير</option>
                    <option value="moderator">مشرف</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">القسم الإداري</label>
                  <select
                    name="department"
                    value={profileData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="system_administration">إدارة النظام</option>
                    <option value="content_management">إدارة المحتوى</option>
                    <option value="user_management">إدارة المستخدمين</option>
                    <option value="technical_support">الدعم التقني</option>
                    <option value="quality_assurance">ضمان الجودة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">آخر تسجيل دخول</label>
                  <input
                    type="text"
                    value={new Date().toLocaleDateString('ar-EG')}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الصلاحيات</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" checked readOnly className="ml-2 h-4 w-4 text-red-600" />
                      <label className="text-sm text-gray-700">إدارة المستخدمين</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked readOnly className="ml-2 h-4 w-4 text-red-600" />
                      <label className="text-sm text-gray-700">إدارة المحتوى</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked readOnly className="ml-2 h-4 w-4 text-red-600" />
                      <label className="text-sm text-gray-700">إدارة النظام</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked readOnly className="ml-2 h-4 w-4 text-red-600" />
                      <label className="text-sm text-gray-700">التقارير والإحصائيات</label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نبذة إدارية</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="اكتب نبذة عن دورك الإداري ومسؤولياتك..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_profile_public"
                    checked={profileData.is_profile_public}
                    onChange={handleInputChange}
                    className="ml-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
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
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
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

        <ResponseModal {...modal} />
      </div>
    </AuthGuard>
  );
};

export default AdminProfilePage;
