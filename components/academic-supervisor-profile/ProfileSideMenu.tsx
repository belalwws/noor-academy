import React from 'react';
import { 
  User, 
  UserCheck, 
  Briefcase, 
  Camera, 
  Shield
} from 'lucide-react';

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
      description: 'معلومات عامة عن الملف الشخصي'
    },
    {
      id: 'personal',
      label: 'المعلومات الشخصية',
      icon: UserCheck,
      description: 'البيانات الشخصية والتواصل'
    },
    {
      id: 'professional',
      label: 'المعلومات المهنية',
      icon: Briefcase,
      description: 'التخصص والخبرة المهنية'
    },
    {
      id: 'profile-image',
      label: 'الصورة الشخصية',
      icon: Camera,
      description: 'إدارة الصورة الشخصية'
    },
    {
      id: 'security',
      label: 'الأمان',
      icon: Shield,
      description: 'كلمة المرور والأمان'
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-gradient-to-r from-green-600 to-green-700 rounded-full"></div>
        قائمة الإعدادات
      </h3>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full text-right p-4 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-105'
                  : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-green-50 text-gray-700 hover:text-green-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-green-100 group-hover:bg-green-100 group-hover:text-green-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {item.label}
                  </div>
                  <div className={`text-xs mt-1 ${
                    isActive ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </div>
              
              {isActive && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ProfileSideMenu;
