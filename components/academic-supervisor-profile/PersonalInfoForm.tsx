import React from 'react';
import { AcademicSupervisorProfileData } from '@/lib/api/academic-supervisor-profile';
import { User } from 'lucide-react';

interface PersonalInfoFormProps {
  data: AcademicSupervisorProfileData;
  onFieldChange: (field: keyof AcademicSupervisorProfileData, value: string | number) => void;
  disabled?: boolean;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ 
  data, 
  onFieldChange, 
  disabled = false 
}) => {
  const handleInputChange = (field: keyof AcademicSupervisorProfileData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    console.log(`PersonalInfoForm: Field ${field} changed to:`, value);
    onFieldChange(field, value);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          المعلومات الشخصية
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 text-sm">
            💡 <strong>تعليمات:</strong> يمكنك تعديل البيانات في الحقول أدناه، ثم اضغط على "حفظ التغييرات" لحفظ البيانات نهائياً.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* الاسم الأول */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الاسم الأول *
          </label>
          <input
            type="text"
            value={data.first_name || ''}
            onChange={handleInputChange('first_name')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="أدخل الاسم الأول"
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
            value={data.last_name || ''}
            onChange={handleInputChange('last_name')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="أدخل الاسم الأخير"
            required
          />
        </div>

        {/* البريد الإلكتروني */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            البريد الإلكتروني *
          </label>
          <input
            type="email"
            value={data.email || ''}
            onChange={handleInputChange('email')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="أدخل البريد الإلكتروني"
            required
          />
        </div>

        {/* رقم الهاتف */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم الهاتف *
          </label>
          <div className="flex gap-2">
            <select
              value={data.country_code || '+966'}
              onChange={handleInputChange('country_code')}
              disabled={disabled}
              className="px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            >
              <option value="+966">+966</option>
              <option value="+971">+971</option>
              <option value="+973">+973</option>
              <option value="+974">+974</option>
              <option value="+965">+965</option>
              <option value="+968">+968</option>
              <option value="+20">+20</option>
            </select>
            <input
              type="tel"
              value={data.phone_number || ''}
              onChange={handleInputChange('phone_number')}
              disabled={disabled}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
              placeholder="مثال: 123456789"
              required
            />
          </div>
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
            min="18"
            max="100"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="مثال: 35"
            required
          />
        </div>

        {/* الجنس */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الجنس *
          </label>
          <select
            value={data.gender || ''}
            onChange={handleInputChange('gender')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            required
          >
            <option value="">اختر الجنس</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
        </div>

        {/* النبذة الشخصية */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            النبذة الشخصية
          </label>
          <textarea
            value={data.bio || ''}
            onChange={handleInputChange('bio')}
            disabled={disabled}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="اكتب نبذة مختصرة عن نفسك وخبراتك الأكاديمية..."
          />
        </div>
      </div>
    </div>
  );
};
