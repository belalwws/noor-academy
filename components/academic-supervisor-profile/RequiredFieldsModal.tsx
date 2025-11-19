import React from 'react';
import { AlertTriangle, X, User, Phone, Calendar, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RequiredFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingFields: string[];
  onFillFields: () => void;
}

const fieldTranslations: Record<string, { name: string; icon: React.ElementType; description: string }> = {
  phone_number: {
    name: 'رقم الهاتف',
    icon: Phone,
    description: 'رقم هاتفك المحمول للتواصل'
  },
  country_code: {
    name: 'رمز البلد',
    icon: Globe,
    description: 'رمز البلد (مثل +966 للسعودية)'
  },
  age: {
    name: 'العمر',
    icon: Calendar,
    description: 'عمرك بالسنوات'
  },
  first_name: {
    name: 'الاسم الأول',
    icon: User,
    description: 'اسمك الأول'
  },
  last_name: {
    name: 'اسم العائلة',
    icon: User,
    description: 'اسم العائلة'
  },
  gender: {
    name: 'الجنس',
    icon: User,
    description: 'ذكر أو أنثى'
  },
  bio: {
    name: 'نبذة شخصية',
    icon: User,
    description: 'معلومات مختصرة عنك'
  }
};

export const RequiredFieldsModal: React.FC<RequiredFieldsModalProps> = ({
  isOpen,
  onClose,
  missingFields,
  onFillFields
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-white/20 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">حقول مطلوبة</h2>
              <p className="text-white/90 text-sm">يجب إكمال هذه الحقول للمتابعة</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 text-sm mb-4">
              لحفظ البيانات، يجب ملء الحقول التالية أولاً:
            </p>
            
            {/* Missing Fields List */}
            <div className="space-y-3">
              {missingFields.map((field) => {
                const fieldInfo = fieldTranslations[field] || {
                  name: field,
                  icon: User,
                  description: `حقل ${field} مطلوب`
                };
                const IconComponent = fieldInfo.icon;
                
                return (
                  <div 
                    key={field}
                    className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <div className="p-2 bg-red-100 rounded-lg">
                      <IconComponent className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-red-900">{fieldInfo.name}</h4>
                      <p className="text-xs text-red-700">{fieldInfo.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">كيفية إكمال البيانات:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. اذهب إلى قسم "المعلومات الشخصية"</li>
                  <li>2. املأ الحقول المطلوبة المذكورة أعلاه</li>
                  <li>3. احفظ البيانات</li>
                  <li>4. جرب الحفظ مرة أخرى</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onFillFields}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
              <User className="w-4 h-4 mr-2" />
              اذهب لإكمال البيانات
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6 border-gray-300 hover:bg-gray-50"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequiredFieldsModal;
