'use client'

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Trash2, 
  Camera,
  X
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentImageUrl?: string | null
  previewImageUrl?: string | null
  uploadingImage: boolean
  deletingImage: boolean
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  onImageUpload: () => void
  onImageDelete: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
}

const ImageUploadDialog: React.FC<ImageUploadDialogProps> = ({
  open,
  onOpenChange,
  currentImageUrl,
  previewImageUrl,
  uploadingImage,
  deletingImage,
  onImageSelect,
  onImageUpload,
  onImageDelete,
  fileInputRef
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-secondary" />
            إدارة الصورة الشخصية
          </DialogTitle>
          <DialogDescription>
            يمكنك رفع صورة شخصية جديدة أو حذف الصورة الحالية
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Debug info */}
          {(() => {
            console.log('🔍 ImageUploadDialog render:', {
              previewImageUrl: !!previewImageUrl,
              currentImageUrl: !!currentImageUrl,
              uploadingImage,
              deletingImage,
              hasOnImageUpload: !!onImageUpload
            });
            return null;
          })()}
          
          {/* Current/Preview Image */}
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {previewImageUrl ? (
                <img 
                  src={previewImageUrl} 
                  alt="صورة المعاينة"
                  className="w-full h-full object-cover"
                  onLoad={() => console.log('✅ Preview image loaded')}
                  onError={(e) => {
                    console.error('❌ Preview image failed to load')
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (currentImageUrl && 
                   !currentImageUrl.includes('default-avatar') &&
                   currentImageUrl !== '/default-avatar.png') ? (
                <img 
                  src={currentImageUrl}
                  alt="الصورة الحالية"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onLoad={() => console.log('✅ Current image loaded:', currentImageUrl)}
                  onError={(e) => {
                    console.error('❌ Current image failed to load:', currentImageUrl)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <Camera className="w-16 h-16 text-gray-400" />
              )}
            </div>
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onImageSelect}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                console.log('🔘 Select image button clicked');
                fileInputRef.current?.click();
              }}
              disabled={uploadingImage || deletingImage}
              className="w-full bg-secondary hover:bg-secondary-dark text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              اختيار صورة جديدة
            </Button>

            {previewImageUrl ? (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔘 Upload button clicked!');
                  console.log('📁 previewImageUrl:', previewImageUrl);
                  console.log('📤 onImageUpload function:', onImageUpload);
                  console.log('⏳ uploadingImage:', uploadingImage);
                  console.log('🗑️ deletingImage:', deletingImage);
                  if (!uploadingImage && !deletingImage && onImageUpload) {
                    console.log('✅ Calling onImageUpload...');
                    onImageUpload();
                  } else {
                    console.warn('⚠️ Button disabled or no function, cannot upload', {
                      uploadingImage,
                      deletingImage,
                      hasFunction: !!onImageUpload
                    });
                  }
                }}
                disabled={uploadingImage || deletingImage || !onImageUpload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {uploadingImage ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    رفع الصورة
                  </>
                )}
              </Button>
            ) : (
              <div className="text-xs text-gray-500 text-center p-2">
                اختر صورة أولاً لعرض زر الرفع
              </div>
            )}

            {currentImageUrl && 
             !currentImageUrl.includes('default-avatar') &&
             currentImageUrl !== '/default-avatar.png' && (
              <Button
                onClick={onImageDelete}
                disabled={uploadingImage || deletingImage}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {deletingImage ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    حذف الصورة الحالية
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              disabled={uploadingImage || deletingImage}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              إلغاء
            </Button>
          </div>

          {/* Upload Guidelines */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold mb-1">إرشادات الرفع:</p>
            <ul className="space-y-1">
              <li>• الحد الأقصى لحجم الملف: 5 ميجابايت</li>
              <li>• الصيغ المدعومة: JPEG, PNG, WebP</li>
              <li>• يُفضل استخدام صور مربعة للحصول على أفضل نتيجة</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ImageUploadDialog
