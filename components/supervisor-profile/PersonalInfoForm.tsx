import React from 'react';
import { User } from 'lucide-react';
import { SupervisorProfileData } from '@/lib/api/supervisor-profile';

interface PersonalInfoFormProps {
  data: SupervisorProfileData;
  onFieldChange: (field: keyof SupervisorProfileData, value: string | number) => void;
  disabled?: boolean;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ 
  data, 
  onFieldChange, 
  disabled = false 
}) => {
  const handleInputChange = (field: keyof SupervisorProfileData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    onFieldChange(field, value);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
          <User className="w-5 h-5 text-white" />
        </div>
        البيانات الشخصية
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* الاسم الأول */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الاسم الأول *
          </label>
          <input
            type="text"
            value={data.first_name}
            onChange={handleInputChange('first_name')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="الاسم الأول"
            required
          />
        </div>

        {/* الاسم الأخير */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الاسم الأخير *
          </label>
          <input
            type="text"
            value={data.last_name}
            onChange={handleInputChange('last_name')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="الاسم الأخير"
            required
          />
        </div>

        {/* اسم المستخدم */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم المستخدم *
          </label>
          <input
            type="text"
            value={data.username}
            onChange={handleInputChange('username')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="اسم المستخدم"
            required
          />
        </div>

        {/* رقم الهاتف */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم الهاتف *
          </label>
          <input
            type="tel"
            value={data.phone_number}
            onChange={handleInputChange('phone_number')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="05xxxxxxxx"
            required
          />
        </div>

        {/* رمز البلد */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رمز البلد *
          </label>
          <select
            value={data.country_code}
            onChange={handleInputChange('country_code')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            required
          >
            <option value="+966">+966 (السعودية)</option>
            <option value="+20">+20 (مصر)</option>
            <option value="+971">+971 (الإمارات)</option>
            <option value="+965">+965 (الكويت)</option>
            <option value="+973">+973 (البحرين)</option>
            <option value="+974">+974 (قطر)</option>
            <option value="+968">+968 (عمان)</option>
            <option value="+962">+962 (الأردن)</option>
          </select>
        </div>

        {/* الجنس */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الجنس *
          </label>
          <select
            value={data.gender}
            onChange={handleInputChange('gender')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            required
          >
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
        </div>

        {/* العمر */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            العمر *
          </label>
          <input
            type="number"
            value={data.age || ''}
            onChange={handleInputChange('age')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="العمر"
            min="18"
            max="100"
            required
          />
        </div>

        {/* نبذة شخصية */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نبذة شخصية *
          </label>
          <textarea
            value={data.bio}
            onChange={handleInputChange('bio')}
            disabled={disabled}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="اكتب نبذة مختصرة عن نفسك وخبرتك"
            required
          />
        </div>
      </div>
    </div>
  );
};
