import { motion } from 'framer-motion';
import { Plus, X, Upload, Video, CheckCircle, Loader2, FileVideo, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { recordedCoursesApi } from '@/lib/api/recorded-courses';
import type { StepProps, Unit, Lesson } from '../types';
import { useState, useEffect, useRef } from 'react';

export function Step4Lessons({ formData, updateFormData, courseType }: StepProps) {
  const [uploadingVideos, setUploadingVideos] = useState<{ [key: string]: boolean }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadSpeed, setUploadSpeed] = useState<{ [key: string]: string }>({});
  const [uploadTimeRemaining, setUploadTimeRemaining] = useState<{ [key: string]: string }>({});
  const [uploadedBytes, setUploadedBytes] = useState<{ [key: string]: number }>({});
  const [selectedVideoFiles, setSelectedVideoFiles] = useState<{ [key: string]: { file: File; fileName: string } }>({});
  const [dragActive, setDragActive] = useState<{ [key: string]: boolean }>({});

  const isRecordedCourse = courseType === 'recorded';
  
  // Listen for course creation to enable video uploads
  useEffect(() => {
    const handleCourseCreated = (event: CustomEvent) => {
      const courseId = event.detail.courseId;
      console.log('🎉 Course created in Step4Lessons, courseId:', courseId);
      // Course is now available, units can be saved and videos can be uploaded
    };
    
    window.addEventListener('recordedCourseCreated', handleCourseCreated as EventListener);
    
    return () => {
      window.removeEventListener('recordedCourseCreated', handleCourseCreated as EventListener);
    };
  }, []);

  const addLesson = (unitId: string) => {
    const unitLessons = formData.lessons.filter((l: Lesson) => l.unitId === unitId);
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      unitId,
      title: '',
      description: '',
      learning_outcomes: '',
      order: unitLessons.length + 1,
      videoFile: null,
      videoUploaded: false,
    };
    updateFormData('lessons', [...formData.lessons, newLesson]);
  };

  const removeLesson = (id: string, unitId: string) => {
    const updatedLessons = formData.lessons
      .filter((l: Lesson) => l.id !== id)
      .map((l: Lesson) => {
        if (l.unitId === unitId) {
          const unitLessons = formData.lessons.filter(lesson => lesson.unitId === unitId && lesson.id !== id);
          const newOrder = unitLessons.filter(lesson => lesson.order < l.order).length + 1;
          return { ...l, order: newOrder };
        }
        return l;
      });
    updateFormData('lessons', updatedLessons);
  };

  const updateLesson = (id: string, field: keyof Lesson, value: any) => {
    console.log('🔄 updateLesson called:', { id, field, value: value instanceof File ? `File: ${value.name}` : value });
    const updatedLessons = formData.lessons.map((l: Lesson) =>
      l.id === id ? { ...l, [field]: value } : l
    );
    console.log('🔄 Calling updateFormData with updated lessons');
    updateFormData('lessons', updatedLessons);
  };

  const handleVideoFileChange = (lessonId: string, file: File | null) => {
    console.log('📹 handleVideoFileChange called:', { lessonId, file: file?.name });
    
    if (!file) {
      // Clear local state
      setSelectedVideoFiles(prev => {
        const updated = { ...prev };
        delete updated[lessonId];
        return updated;
      });
      updateLesson(lessonId, 'videoFile', null);
      updateLesson(lessonId, 'videoFileName', undefined);
      return;
    }

    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validVideoTypes.includes(file.type)) {
      console.error('❌ Invalid file type:', file.type);
      toast.error('يرجى اختيار ملف فيديو صالح (MP4, WebM, OGG, MOV)');
      return;
    }

    // Validate file size (e.g., max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size);
      toast.error('حجم الملف كبير جداً. الحد الأقصى 2 جيجابايت');
      return;
    }

    console.log('✅ File validated, storing in local state and updating lesson:', {
      lessonId,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileType: file.type
    });
    
    // Store in local state for immediate UI update
    setSelectedVideoFiles(prev => ({
      ...prev,
      [lessonId]: { file, fileName: file.name }
    }));
    
    // Also update parent state
    updateLesson(lessonId, 'videoFile', file);
    updateLesson(lessonId, 'videoFileName', file.name);
    updateLesson(lessonId, 'videoUploaded', false);
    
    console.log('✅ Lesson updated with video file');
  };



  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          الدروس
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          أضف دروساً تفصيلية لكل وحدة
        </p>
      </div>

      <div className="space-y-6">
        {formData.units.map((unit: Unit) => {
          const unitLessons = formData.lessons.filter((l: Lesson) => l.unitId === unit.id);

          return (
            <div key={unit.id} className="border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-amber-700 dark:text-amber-400">
                  📚 {unit.title || 'وحدة بدون عنوان'}
                </h3>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {unitLessons.length} درس
                </span>
              </div>

              <div className="space-y-3">
                {unitLessons.map((lesson: Lesson, index: number) => {
                  // Get fresh lesson data from formData to ensure UI updates
                  const currentLesson = formData.lessons.find(l => l.id === lesson.id) || lesson;
                  
                  // Get selected video from local state (for immediate UI feedback)
                  const selectedVideo = selectedVideoFiles[lesson.id];
                  const displayFileName = selectedVideo?.fileName || currentLesson.videoFileName;
                  // hasVideo should check uploaded status first, then selected files, then videoFile
                  const hasVideo = currentLesson.videoUploaded || !!selectedVideo || !!currentLesson.videoFile;
                  
                  console.log('🎨 Rendering lesson:', {
                    lessonId: lesson.id,
                    displayFileName,
                    hasVideo,
                    videoUploaded: currentLesson.videoUploaded,
                    bunnyVideoId: currentLesson.bunnyVideoId,
                    videoUploadUrl: currentLesson.videoUploadUrl,
                    selectedVideoExists: !!selectedVideo,
                    selectedVideoFilesKeys: Object.keys(selectedVideoFiles),
                    videoFileName: currentLesson.videoFileName,
                    hasVideoLogic: `videoUploaded:${currentLesson.videoUploaded} || selectedVideo:${!!selectedVideo} || videoFile:${!!currentLesson.videoFile}`
                  });
                  
                  return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold">الدرس {index + 1}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeLesson(lesson.id, unit.id)}
                        className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Input
                        value={currentLesson.title}
                        onChange={(e) => updateLesson(lesson.id, 'title', e.target.value)}
                        placeholder="عنوان الدرس (مثال: أحكام النون الساكنة)"
                        className="text-sm"
                      />
                      <Textarea
                        value={currentLesson.description}
                        onChange={(e) => updateLesson(lesson.id, 'description', e.target.value)}
                        placeholder="وصف الدرس ومحتواه..."
                        rows={2}
                        className="text-sm"
                      />
                      <Textarea
                        value={currentLesson.learning_outcomes}
                        onChange={(e) => updateLesson(lesson.id, 'learning_outcomes', e.target.value)}
                        placeholder="مخرجات التعلم لهذا الدرس (ماذا سيتعلم الطالب؟)"
                        rows={2}
                        className="text-sm"
                      />

                      {/* Video Upload for Recorded Courses */}
                      {isRecordedCourse && (
                        <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Video className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            فيديو الدرس (مطلوب للدورات المسجلة)
                          </label>
                          
                          {currentLesson.videoUploaded ? (
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                  تم رفع الفيديو بنجاح
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-500 truncate">
                                  {currentLesson.videoFileName}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <input
                                  id={`video-input-${lesson.id}`}
                                  type="file"
                                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    handleVideoFileChange(lesson.id, file);
                                  }}
                                  className="hidden"
                                  disabled={uploadingVideos[lesson.id]}
                                />
                                <label 
                                  htmlFor={`video-input-${lesson.id}`}
                                  className={`flex-1 flex items-center gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                                    uploadingVideos[lesson.id]
                                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/10 cursor-wait'
                                      : hasVideo 
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-600' 
                                      : 'border-gray-300 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10'
                                  }`}
                                >
                                  <div className={`p-2 rounded-lg ${
                                    hasVideo 
                                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                                      : 'bg-gray-100 dark:bg-gray-700'
                                  }`}>
                                    <Upload className={`w-5 h-5 ${
                                      hasVideo 
                                        ? 'text-blue-600 dark:text-blue-400' 
                                        : 'text-gray-400 dark:text-gray-500'
                                    }`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-sm font-medium block ${
                                      hasVideo 
                                        ? 'text-blue-700 dark:text-blue-400' 
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                    {displayFileName || 'اختر ملف فيديو (MP4, WebM, OGG, MOV)'}
                                  </span>
                                    {displayFileName && selectedVideo?.file && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        حجم الملف: {((selectedVideo.file.size / (1024 * 1024)).toFixed(2))} MB
                                      </span>
                                    )}
                                  </div>
                                </label>
                              </div>

                              {hasVideo && !currentLesson.videoUploaded && !uploadingVideos[lesson.id] && (
                                    <Button
                                      type="button"
                                      onClick={async (e) => {
                                        console.log('🚀 BUTTON CLICKED!!!', { lessonId: lesson.id });
                                        e.preventDefault();
                                        
                                        // Get video file from local state or lesson state
                                        const selectedVideo = selectedVideoFiles[lesson.id];
                                        const videoFile = selectedVideo?.file || currentLesson.videoFile;
                                        const videoFileName = selectedVideo?.fileName || currentLesson.videoFileName;
                                        
                                        console.log('🔍 Validation checks:', {
                                          hasSelectedVideo: !!selectedVideo,
                                          hasVideoFile: !!videoFile,
                                          videoFileName,
                                          lessonTitle: currentLesson.title,
                                          lessonDescription: currentLesson.description,
                                          currentLesson: currentLesson
                                        });
                                        
                                        if (!videoFile) {
                                          console.error('❌ Validation failed: No video file');
                                          toast.error('يرجى اختيار ملف فيديو أولاً');
                                          return;
                                        }

                                        if (!currentLesson.title || !currentLesson.description) {
                                          console.error('❌ Validation failed: Missing title or description', {
                                            title: currentLesson.title,
                                            description: currentLesson.description
                                          });
                                          toast.error('يرجى ملء عنوان ووصف الدرس أولاً');
                                          return;
                                        }

                                        console.log('✅ All validations passed, starting upload...');

                                        try {
                                          console.log('🚀 Starting upload process...', {
                                            lessonId: lesson.id,
                                            hasVideoFile: !!videoFile,
                                            videoFileName,
                                            videoFileSize: videoFile?.size,
                                            lessonTitle: currentLesson.title,
                                            lessonDescription: currentLesson.description,
                                            unitId: lesson.unitId,
                                            videoFileType: videoFile?.type,
                                            videoFileLastModified: videoFile?.lastModified
                                          });
                                          
                                          // Double check video file is still valid
                                          if (!videoFile || !(videoFile instanceof File)) {
                                            console.error('❌ Video file is invalid:', videoFile);
                                            toast.error('ملف الفيديو غير صالح');
                                            return;
                                          }
                                          
                                          setUploadingVideos(prev => ({ ...prev, [lesson.id]: true }));
                                          setUploadProgress(prev => ({ ...prev, [lesson.id]: 0 }));

                                          toast.loading(`جاري رفع الفيديو: ${videoFileName}`, { id: `upload-${lesson.id}` });

                                          console.log('📤 Step 1: Creating video entry in Bunny Stream...');
                                          
                                          let uploadedLesson;
                                          
                                          // Step 1: Create video entry in Bunny Stream to get upload URL
                                          // Note: create-video endpoint only needs title
                                          const createVideoPayload = {
                                            title: currentLesson.title,
                                          };
                                          
                                          console.log('📤 createVideo payload:', createVideoPayload);
                                          
                                          let createdVideo;
                                          try {
                                            createdVideo = await recordedCoursesApi.createVideo(createVideoPayload);
                                            console.log('✅ Step 1: Video entry created successfully:', createdVideo);
                                          } catch (createError: any) {
                                            console.error('❌ Step 1 failed: Error creating video entry:', createError);
                                            console.error('   Error details:', {
                                              message: createError?.message,
                                              response: createError?.response,
                                              data: createError?.data,
                                              status: createError?.status
                                            });
                                            throw new Error(`فشل إنشاء الفيديو: ${createError?.message || 'خطأ غير معروف'}`);
                                          }
                                          
                                          if (!createdVideo || !createdVideo.upload_url) {
                                            console.error('❌ Step 1 failed: Invalid response from createVideo:', createdVideo);
                                            throw new Error('لم يتم الحصول على رابط الرفع من الخادم');
                                          }
                                          
                                          console.log('✅ Step 1: Video entry created, got upload URL:', {
                                            video_id: createdVideo.video_id,
                                            library_id: createdVideo.library_id,
                                            upload_url: createdVideo.upload_url,
                                            has_api_key: !!createdVideo.api_key
                                          });
                                          
                                          // Step 2: Upload actual video file to Bunny Stream with progress tracking
                                          console.log('📤 Step 2: Uploading actual video file...');
                                          const fileSizeMB = (videoFile.size / 1024 / 1024).toFixed(2);
                                          toast.loading(`جاري رفع الملف الفعلي (${fileSizeMB} MB)...`, { id: `upload-${lesson.id}` });
                                          
                                          try {
                                            // Use XMLHttpRequest for progress tracking
                                            await new Promise<void>((resolve, reject) => {
                                              const xhr = new XMLHttpRequest();
                                              const startTime = Date.now();
                                              let lastLoaded = 0;
                                              let lastTime = startTime;
                                              
                                              // Track upload progress
                                              xhr.upload.addEventListener('progress', (e) => {
                                                if (e.lengthComputable) {
                                                  const percentComplete = Math.round((e.loaded / e.total) * 100);
                                                  const currentTime = Date.now();
                                                  const timeDiff = (currentTime - lastTime) / 1000; // seconds
                                                  const bytesDiff = e.loaded - lastLoaded;
                                                  
                                                  // Update progress
                                                  setUploadProgress(prev => ({ ...prev, [lesson.id]: percentComplete }));
                                                  setUploadedBytes(prev => ({ ...prev, [lesson.id]: e.loaded }));
                                                  
                                                  // Calculate speed (bytes per second)
                                                  if (timeDiff > 0) {
                                                    const speedBps = bytesDiff / timeDiff;
                                                    const speedMBps = (speedBps / (1024 * 1024)).toFixed(2);
                                                    setUploadSpeed(prev => ({ ...prev, [lesson.id]: `${speedMBps} MB/s` }));
                                                    
                                                    // Calculate time remaining
                                                    const remainingBytes = e.total - e.loaded;
                                                    const secondsRemaining = remainingBytes / speedBps;
                                                    if (secondsRemaining > 0 && secondsRemaining < 3600) {
                                                      const minutes = Math.floor(secondsRemaining / 60);
                                                      const seconds = Math.floor(secondsRemaining % 60);
                                                      setUploadTimeRemaining(prev => ({ 
                                                        ...prev, 
                                                        [lesson.id]: minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}ث`
                                                      }));
                                                    }
                                                  }
                                                  
                                                  lastLoaded = e.loaded;
                                                  lastTime = currentTime;
                                                }
                                              });
                                              
                                              xhr.addEventListener('load', () => {
                                                if (xhr.status >= 200 && xhr.status < 300) {
                                                  console.log('✅ Step 2: Video file uploaded successfully to Bunny Stream');
                                                  resolve();
                                                } else {
                                                  reject(new Error(`Failed to upload: ${xhr.status} ${xhr.statusText}`));
                                                }
                                              });
                                              
                                              xhr.addEventListener('error', () => {
                                                reject(new Error('Network error during upload'));
                                              });
                                              
                                              xhr.addEventListener('abort', () => {
                                                reject(new Error('Upload aborted'));
                                              });
                                              
                                              // Open and send request
                                              xhr.open('PUT', createdVideo.upload_url);
                                              xhr.setRequestHeader('AccessKey', createdVideo.api_key);
                                              xhr.setRequestHeader('Content-Type', 'application/octet-stream');
                                              xhr.send(videoFile);
                                            });
                                          } catch (uploadError: any) {
                                            console.error('❌ Step 2 failed: Video file upload error:', uploadError);
                                            throw new Error(`فشل رفع الملف: ${uploadError.message}`);
                                          }
                                          
                                          // Step 3: Store metadata in frontend state
                                          uploadedLesson = {
                                            id: createdVideo.video_id,
                                            bunny_video_id: createdVideo.video_id,
                                            video_url: `https://iframe.mediadelivery.net/embed/${createdVideo.library_id}/${createdVideo.video_id}`,
                                            title: currentLesson.title,
                                            description: currentLesson.description,
                                            learning_outcomes: currentLesson.learning_outcomes || '',
                                            order: currentLesson.order,
                                          };
                                          
                                          console.log('✅ Step 3: Video metadata prepared for frontend:', uploadedLesson);

                                          // CRITICAL FIX: Update ALL fields in ONE call to avoid race conditions
                                          const updatedLessons = formData.lessons.map((l: Lesson) =>
                                            l.id === lesson.id
                                              ? {
                                                  ...l,
                                                  apiId: uploadedLesson.id,
                                                  bunnyVideoId: uploadedLesson.bunny_video_id,
                                                  videoUploadUrl: uploadedLesson.video_url,
                                                  videoUploaded: true,
                                                  videoFileName: videoFileName,
                                                }
                                              : l
                                          );
                                          
                                          updateFormData('lessons', updatedLessons);
                                          setUploadProgress(prev => ({ ...prev, [lesson.id]: 100 }));
                                          
                                          // Log successful upload
                                          console.log('✅ Video upload completed and formData updated:', {
                                            lessonId: lesson.id,
                                            videoUploaded: true,
                                            bunnyVideoId: uploadedLesson.bunny_video_id,
                                            videoUploadUrl: uploadedLesson.video_url,
                                            videoFileName: videoFileName
                                          });
                                          
                          // Clear local state since video is now uploaded
                          setSelectedVideoFiles(prev => {
                            const updated = { ...prev };
                            delete updated[lesson.id];
                            return updated;
                          });
                          
                          // Clear upload stats
                          setUploadProgress(prev => {
                            const updated = { ...prev };
                            delete updated[lesson.id];
                            return updated;
                          });
                          setUploadSpeed(prev => {
                            const updated = { ...prev };
                            delete updated[lesson.id];
                            return updated;
                          });
                          setUploadTimeRemaining(prev => {
                            const updated = { ...prev };
                            delete updated[lesson.id];
                            return updated;
                          });
                          setUploadedBytes(prev => {
                            const updated = { ...prev };
                            delete updated[lesson.id];
                            return updated;
                          });
                          
                          toast.success(`✅ تم رفع الفيديو بنجاح: ${videoFileName}`, { id: `upload-${lesson.id}` });
                                        } catch (error: any) {
                                          console.error('❌ Error uploading video:', error);
                                          console.error('   Error stack:', error?.stack);
                                          console.error('   Error details:', {
                                            message: error?.message,
                                            response: error?.response,
                                            data: error?.data,
                                            status: error?.status,
                                            name: error?.name
                                          });
                                          
                                          let errorMessage = 'فشل رفع الفيديو';
                                          if (error?.message) {
                                            errorMessage = error.message;
                                          } else if (error?.data?.error) {
                                            errorMessage = error.data.error;
                                          } else if (error?.data?.detail) {
                                            errorMessage = error.data.detail;
                                          } else if (typeof error === 'string') {
                                            errorMessage = error;
                                          }
                                          
                                          toast.error(`❌ ${errorMessage}`, { id: `upload-${lesson.id}` });
                                          updateLesson(lesson.id, 'videoUploaded', false);
                                          setUploadProgress(prev => ({ ...prev, [lesson.id]: 0 }));
                                          
                                          // Clear upload stats on error
                                          setUploadSpeed(prev => {
                                            const updated = { ...prev };
                                            delete updated[lesson.id];
                                            return updated;
                                          });
                                          setUploadTimeRemaining(prev => {
                                            const updated = { ...prev };
                                            delete updated[lesson.id];
                                            return updated;
                                          });
                                          setUploadedBytes(prev => {
                                            const updated = { ...prev };
                                            delete updated[lesson.id];
                                            return updated;
                                          });
                                        } finally {
                                          setUploadingVideos(prev => ({ ...prev, [lesson.id]: false }));
                                        }
                                      }}
                                      disabled={!hasVideo}
                                      size="sm"
                                      className="w-full bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                          <Upload className="w-4 h-4 ml-2" />
                                          رفع الفيديو
                                    </Button>
                              )}
                              
                              {uploadingVideos[lesson.id] && (
                                    <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                          جاري رفع الفيديو...
                                        </span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                          {uploadProgress[lesson.id] || 0}%
                                        </span>
                                  </div>
                                  
                                      {/* Progress Bar */}
                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                                        <motion.div
                                          className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 h-4 rounded-full flex items-center justify-end pr-2"
                                          style={{ width: `${uploadProgress[lesson.id] || 0}%` }}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${uploadProgress[lesson.id] || 0}%` }}
                                          transition={{ duration: 0.3, ease: "easeOut" }}
                                        >
                                          {uploadProgress[lesson.id] > 10 && (
                                          <span className="text-xs text-white font-semibold">
                                            {uploadProgress[lesson.id]}%
                                          </span>
                                          )}
                                        </motion.div>
                                      </div>
                                      
                                      {/* Upload Stats */}
                                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-3">
                                          {uploadedBytes[lesson.id] && selectedVideo?.file && (
                                            <span>
                                              {((uploadedBytes[lesson.id] / (1024 * 1024)).toFixed(2))} MB / {((selectedVideo.file.size / (1024 * 1024)).toFixed(2))} MB
                                            </span>
                                          )}
                                          {uploadSpeed[lesson.id] && (
                                            <span className="flex items-center gap-1">
                                              <span>⚡</span>
                                              {uploadSpeed[lesson.id]}
                                            </span>
                                          )}
                                        </div>
                                        {uploadTimeRemaining[lesson.id] && (
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            متبقي: {uploadTimeRemaining[lesson.id]}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
                })}

                <Button
                  onClick={() => addLesson(unit.id)}
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed gap-2 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                >
                  <Plus className="w-4 h-4" />
                  إضافة درس للوحدة
                </Button>
              </div>
            </div>
          );
        })}

        {formData.units.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg mb-2">📚 لا توجد وحدات بعد</p>
            <p className="text-sm">يرجى إضافة وحدات أولاً من الخطوة السابقة</p>
          </div>
        )}
      </div>
    </div>
  );
}

