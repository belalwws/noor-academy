import React from 'react';
import { AcademicSupervisorProfileData } from '@/lib/api/academic-supervisor-profile';
import { Briefcase } from 'lucide-react';

interface ProfessionalInfoFormProps {
  data: AcademicSupervisorProfileData;
  onFieldChange: (field: keyof AcademicSupervisorProfileData, value: string | number) => void;
  disabled?: boolean;
}

export const ProfessionalInfoForm: React.FC<ProfessionalInfoFormProps> = ({ 
  data, 
  onFieldChange, 
  disabled = false 
}) => {
  const handleInputChange = (field: keyof AcademicSupervisorProfileData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    onFieldChange(field, value);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          المعلومات المهنية والأكاديمية
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 text-sm">
            💼 <strong>معلومات مهنية:</strong> أدخل بياناتك المهنية والأكاديمية. يمكنك التعديل ثم الحفظ لاحقاً.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* القسم */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            القسم الأكاديمي *
          </label>
          <input
            type="text"
            value={data.department || ''}
            onChange={handleInputChange('department')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="اسم القسم الأكاديمي"
            required
          />
        </div>

        {/* التخصص */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            التخصص الأكاديمي *
          </label>
          <input
            type="text"
            value={data.specialization || ''}
            onChange={handleInputChange('specialization')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="تخصصك الأكاديمي"
            required
          />
        </div>

        {/* المؤهل العلمي */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المؤهل العلمي *
          </label>
          <select
            value={data.academic_degree || ''}
            onChange={handleInputChange('academic_degree')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            required
          >
            <option value="">اختر المؤهل العلمي</option>
            <option value="bachelor">بكالوريوس</option>
            <option value="master">ماجستير</option>
            <option value="phd">دكتوراه</option>
            <option value="postdoc">ما بعد الدكتوراه</option>
          </select>
        </div>

        {/* سنوات الخبرة */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            سنوات الخبرة *
          </label>
          <input
            type="number"
            value={data.years_of_experience || ''}
            onChange={handleInputChange('years_of_experience')}
            disabled={disabled}
            min="0"
            max="50"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="عدد سنوات الخبرة"
            required
          />
        </div>

        {/* مجالات الإشراف */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مجالات الإشراف الأكاديمي *
          </label>
          <textarea
            value={data.areas_of_responsibility || ''}
            onChange={handleInputChange('areas_of_responsibility')}
            disabled={disabled}
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="اكتب مجالات إشرافك الأكاديمي (مثل: الإشراف على المعلمين، مراجعة المناهج، تقييم الأداء، إلخ)"
            required
          />
        </div>

        {/* الخبرة الأكاديمية */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الخبرة الأكاديمية والمهنية *
          </label>
          <textarea
            value={data.experience || ''}
            onChange={handleInputChange('experience')}
            disabled={disabled}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="اكتب خبرتك الأكاديمية والمهنية وتفاصيلها"
            required
          />
        </div>

        {/* الإنجازات الأكاديمية */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الإنجازات الأكاديمية والبحثية *
          </label>
          <textarea
            value={data.achievements || ''}
            onChange={handleInputChange('achievements')}
            disabled={disabled}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="اكتب إنجازاتك الأكاديمية والبحثية (مثل: الأبحاث المنشورة، المؤتمرات، الجوائز، إلخ)"
            required
          />
        </div>

        {/* المهارات التقنية */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المهارات التقنية والأكاديمية
          </label>
          <textarea
            value={data.technical_skills || ''}
            onChange={handleInputChange('technical_skills')}
            disabled={disabled}
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            placeholder="اكتب مهاراتك التقنية والأكاديمية (مثل: إدارة المناهج، التقييم الأكاديمي، البحث العلمي، إلخ)"
          />
        </div>
      </div>
    </div>
  );
};
