import React from 'react';
import { User, Briefcase, Shield, Camera } from 'lucide-react';

interface ProfileSideMenuProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const ProfileSideMenu: React.FC<ProfileSideMenuProps> = ({ 
  activeSection, 
  onSectionChange 
}) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'نظرة عامة',
      icon: User,
      description: 'معلوماتك الأساسية'
    },
    {
      id: 'personal',
      label: 'البيانات الشخصية',
      icon: User,
      description: 'الاسم، الهاتف، الجنس، إلخ'
    },
    {
      id: 'professional',
      label: 'البيانات المهنية',
      icon: Briefcase,
      description: 'القسم، التخصص، الخبرة'
    },
    {
      id: 'profile-image',
      label: 'الصورة الشخصية',
      icon: Camera,
      description: 'رفع وإدارة الصورة الشخصية'
    },
    {
      id: 'security',
      label: 'الأمان',
      icon: Shield,
      description: 'كلمة المرور، المصادقة'
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        قائمة التنقل
      </h3>
      
      <nav className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl text-right transition-all duration-300 group ${
                isActive
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-105'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50 hover:text-gray-900 hover:shadow-md hover:transform hover:scale-102'
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-white/20' 
                  : 'bg-gray-100 group-hover:bg-green-100'
              }`}>
                <Icon className={`w-5 h-5 ${
                  isActive ? 'text-white' : 'text-gray-600 group-hover:text-green-600'
                }`} />
              </div>
              <div className="flex-1 text-right">
                <div className={`font-semibold ${
                  isActive ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.label}
                </div>
                <div className={`text-xs ${
                  isActive ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {item.description}
                </div>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
