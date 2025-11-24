import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      {/* Error Message */}
      {error && (
        <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-red-900">خطأ!</h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onResetError}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              إخفاء الخطأ
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        {/* Save Button */}
        <Button
          onClick={onSave}
          disabled={isSaving || isLoading}
          className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              حفظ التغييرات
            </>
          )}
        </Button>

        {/* Complete Profile Button */}
        {!isComplete && (
          <Button
            onClick={onComplete}
            disabled={isSaving || isLoading}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                جاري الإكمال...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                إكمال البروفايل
              </>
            )}
          </Button>
        )}

        {/* Refresh Button */}
        <Button
          onClick={onRefresh}
          disabled={isLoading || isSaving}
          variant="outline"
          className="flex items-center gap-3 bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-700 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {/* Status Message */}
      {isComplete && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center shadow-lg">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-blue-800 font-bold text-lg">
              البروفايل مكتمل بنجاح! 🎉
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
