import React from 'react';
import { Briefcase } from 'lucide-react';
import { SupervisorProfileData } from '@/lib/api/supervisor-profile';

interface ProfessionalInfoFormProps {
  data: SupervisorProfileData;
  onFieldChange: (field: keyof SupervisorProfileData, value: string | number) => void;
  disabled?: boolean;
}

export const ProfessionalInfoForm: React.FC<ProfessionalInfoFormProps> = ({ 
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
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        البيانات المهنية
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* القسم */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            القسم *
          </label>
          <input
            type="text"
            value={data.department || ''}
            onChange={handleInputChange('department')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="اسم القسم"
            required
          />
        </div>

        {/* التخصص */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            التخصص *
          </label>
          <input
            type="text"
            value={data.specialization || ''}
            onChange={handleInputChange('specialization')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="تخصصك"
            required
          />
        </div>

        {/* مجالات المسؤولية */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مجالات المسؤولية *
          </label>
          <textarea
            value={data.areas_of_responsibility || ''}
            onChange={handleInputChange('areas_of_responsibility')}
            disabled={disabled}
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="اكتب مجالات مسؤوليتك (مثل: مراجعة الدورات، إدارة المعلمين، إلخ)"
            required
          />
        </div>

        {/* الخبرة */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الخبرة المهنية *
          </label>
          <textarea
            value={data.experience || ''}
            onChange={handleInputChange('experience')}
            disabled={disabled}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="اكتب خبرتك المهنية وتفاصيلها"
            required
          />
        </div>

        {/* الإنجازات */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الإنجازات *
          </label>
          <textarea
            value={data.achievements || ''}
            onChange={handleInputChange('achievements')}
            disabled={disabled}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="اكتب إنجازاتك المهنية والأكاديمية"
            required
          />
        </div>
      </div>
    </div>
  );
};
