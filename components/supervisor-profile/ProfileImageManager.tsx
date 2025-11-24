'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  Upload, 
  Trash2, 
  User, 
  AlertCircle, 
  CheckCircle,
  X,
  Eye
} from 'lucide-react';
import { useProfileImage } from '@/hooks/useProfileImage';
import ProfileImage from './ProfileImage';
import { Spinner } from '@/components/ui/spinner';

interface ProfileImageManagerProps {
  className?: string;
}

const ProfileImageManager: React.FC<ProfileImageManagerProps> = ({ 
  className = '' 
}) => {
  const {
    profileImageUrl,
    thumbnailUrl,
    isLoading,
    isUploading,
    isDeleting,
    error,
    uploadProgress,
    hasProfileImage,
    displayImageUrl,
    displayThumbnailUrl,
    loadProfileImages,
    uploadProfileImage,
    deleteProfileImage,
    createImagePreview,
    validateImageFile,
    clearError
  } = useProfileImage();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous error
    clearError();

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return;
    }

    try {
      // Create preview
      const preview = await createImagePreview(file);
      setPreviewUrl(preview);
      setSelectedFile(file);
      setShowPreview(true);
    } catch (err) {
      console.error('Error creating preview:', err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadProfileImage(selectedFile);
      // Clear preview after successful upload
      setPreviewUrl(null);
      setSelectedFile(null);
      setShowPreview(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!hasProfileImage) return;

    const confirmed = window.confirm('هل أنت متأكد من حذف الصورة الشخصية؟');
    if (!confirmed) return;

    try {
      await deleteProfileImage();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleCancelPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setShowPreview(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 via-blue-50/60 to-slate-50/80 rounded-xl" />
        <div className="relative bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">الصورة الشخصية</h3>
          </div>
          <p className="text-slate-600 text-sm">
            رفع وإدارة صورتك الشخصية. الأنواع المدعومة: JPEG, PNG, WebP (حد أقصى 5 ميجابايت)
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-50/80 to-rose-50/80 rounded-xl" />
          <div className="relative bg-red-50/90 backdrop-blur-sm border-2 border-red-200/60 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">خطأ!</h4>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Current Profile Image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-slate-50/40 to-white/80 rounded-xl" />
        <div className="relative bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 shadow-sm">
          <h4 className="font-semibold text-slate-800 mb-4">الصورة الحالية</h4>
          
          <div className="flex items-center gap-6">
            {/* Profile Image Display */}
            <div className="relative">
              <ProfileImage
                displayImageUrl={displayImageUrl}
                originalImageUrl={profileImageUrl}
                isLoading={isLoading}
                size="lg"
                className="border-slate-200"
              />
              
              {/* Loading Overlay */}
              {(isUploading || isDeleting) && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Spinner size="lg" tone="contrast" />
                </div>
              )}
            </div>

            {/* Image Info & Actions */}
            <div className="flex-1">
              {hasProfileImage ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">تم رفع الصورة الشخصية</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={openFileDialog}
                      disabled={isUploading || isDeleting}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Upload className="w-4 h-4 ml-2" />
                      تغيير الصورة
                    </Button>
                    
                    <Button
                      onClick={handleDelete}
                      disabled={isUploading || isDeleting}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    >
                      {isDeleting ? (
                        <Spinner size="sm" className="ml-2" tone="contrast" />
                      ) : (
                        <Trash2 className="w-4 h-4 ml-2" />
                      )}
                      حذف الصورة
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">لا توجد صورة شخصية</span>
                  </div>
                  
                  <Button
                    onClick={openFileDialog}
                    disabled={isUploading || isDeleting}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Upload className="w-4 h-4 ml-2" />
                    رفع صورة شخصية
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl" />
          <div className="relative bg-blue-50/90 backdrop-blur-sm border border-blue-200/60 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Spinner size="sm" className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">جاري رفع الصورة...</span>
              <span className="text-sm text-blue-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 via-white/90 to-slate-50/80 rounded-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-800">معاينة الصورة الجديدة</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelPreview}
                className="text-slate-600 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Preview Image */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-200 shadow-lg">
                <img
                  src={previewUrl}
                  alt="معاينة الصورة"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* File Info */}
              <div className="flex-1">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    <strong>اسم الملف:</strong> {selectedFile?.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>الحجم:</strong> {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} ميجابايت
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>النوع:</strong> {selectedFile?.type}
                  </p>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isUploading ? (
                      <Spinner size="sm" className="ml-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 ml-2" />
                    )}
                    تأكيد الرفع
                  </Button>
                  
                  <Button
                    onClick={handleCancelPreview}
                    disabled={isUploading}
                    size="sm"
                    variant="outline"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Guidelines */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 rounded-xl" />
        <div className="relative bg-amber-50/90 backdrop-blur-sm border border-amber-200/60 rounded-xl p-4">
          <h4 className="font-medium text-amber-900 mb-2">إرشادات رفع الصورة:</h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• الأنواع المدعومة: JPEG, PNG, WebP</li>
            <li>• الحد الأقصى للحجم: 5 ميجابايت</li>
            <li>• الأبعاد المثلى: 400x400 بكسل</li>
            <li>• سيتم تحسين الصورة تلقائياً</li>
            <li>• يمكنك رفع 5 صور فقط في الساعة</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default ProfileImageManager;
