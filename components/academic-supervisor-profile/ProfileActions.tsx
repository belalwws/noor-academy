import React from 'react';
import { Save, CheckCircle, RefreshCw, AlertCircle, X } from 'lucide-react';

interface ProfileActionsProps {
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  onSave: () => void;
  onComplete: () => void;
  onRefresh: () => void;
  onResetError: () => void;
  isComplete: boolean;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  isSaving,
  isLoading,
  error,
  onSave,
  onComplete,
  onRefresh,
  onResetError,
  isComplete
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">حدث خطأ</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={onResetError}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}


      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={isSaving || isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              حفظ التغييرات
            </>
          )}
        </button>

        {/* Complete Profile Button */}
        {!isComplete && (
          <button
            onClick={onComplete}
            disabled={isSaving || isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <CheckCircle className="w-4 h-4" />
            إكمال الملف الشخصي
          </button>
        )}

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading || isSaving}
          className="px-6 py-3 border-2 border-green-300 text-green-700 font-medium rounded-xl hover:border-green-500 hover:text-green-800 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              جاري التحديث...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              تحديث
            </>
          )}
        </button>
      </div>

      {/* Completion Status */}
      {isComplete && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-green-800 font-medium">تم إكمال الملف الشخصي</p>
            <p className="text-green-700 text-sm">جميع المعلومات المطلوبة متوفرة</p>
          </div>
        </div>
      )}
    </div>
  );
};
