/**
 * ProfileImageUploader Component
 * Allows users to upload, view, and delete their profile image
 * Features: Drag & drop, preview, size validation, Wasabi S3 integration
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface ProfileImageUploaderProps {
  currentImageUrl: string | null;
  currentThumbnailUrl?: string | null;
  onUpload: (file: File) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  loading?: boolean;
  className?: string;
}

export function ProfileImageUploader({
  currentImageUrl,
  currentThumbnailUrl,
  onUpload,
  onDelete,
  loading = false,
  className = '',
}: ProfileImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get display image (preview > thumbnail > full > default)
  const displayImage = preview || currentThumbnailUrl || currentImageUrl || '/default-avatar.png';

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file) return;

    setError(null);

    // Client-side validation
    if (!file.type.startsWith('image/')) {
      setError('الملف المحدد ليس صورة صالحة');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const success = await onUpload(file);
    if (success) {
      setPreview(null); // Clear preview after successful upload
    } else {
      setPreview(null);
    }
  }, [onUpload]);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setError(null);
    const success = await onDelete();
    if (success) {
      setPreview(null);
    }
  };

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Image Preview */}
      <Card
        className={`relative w-48 h-48 rounded-full overflow-hidden border-4 transition-all cursor-pointer group ${
          isDragging
            ? 'border-orange-500 bg-orange-50 scale-105'
            : 'border-slate-200 dark:border-slate-700 hover:border-orange-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
      >
        {/* Image */}
        <div className="relative w-full h-full">
          <Image
            src={displayImage}
            alt="الصورة الشخصية"
            fill
            className="object-cover"
            priority
          />
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}

          {/* Hover Overlay */}
          {!loading && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex flex-col items-center gap-2 text-white">
                <Camera className="w-8 h-8" />
                <span className="text-sm font-medium">تغيير الصورة</span>
              </div>
            </div>
          )}

          {/* Drag & Drop Indicator */}
          {isDragging && (
            <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center border-4 border-dashed border-orange-500">
              <div className="text-orange-600 dark:text-orange-400 text-center">
                <Upload className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm font-semibold">اسحب الصورة هنا</p>
              </div>
            </div>
          )}
        </div>

        {/* Success Indicator */}
        {currentImageUrl && !loading && (
          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        )}
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={openFilePicker}
          disabled={loading}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {currentImageUrl ? 'تغيير الصورة' : 'رفع صورة'}
        </Button>

        {currentImageUrl && (
          <Button
            onClick={handleDelete}
            disabled={loading}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            حذف الصورة
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-lg">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">
        الأنواع المدعومة: JPEG, PNG, WebP<br />
        الحجم الأقصى: 5 ميجابايت<br />
        معدل الرفع: 5 صور في الساعة
      </p>
    </div>
  );
}
