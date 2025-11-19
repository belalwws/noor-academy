'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle, Clock, BookOpen, PlayCircle,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

interface Lesson {
  id: number;
  title: string;
  description: string;
  order: number;
  duration_minutes?: number;
  video_duration?: number;
  bunny_video_id?: string;
  unit_title?: string;
  is_completed?: boolean;
}

function CoursePlayerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  const lessonId = searchParams.get('lesson');
  const courseId = searchParams.get('course');
  const videoId = searchParams.get('videoId');

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [hlsUrl, setHlsUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Load lesson details and HLS URL
  useEffect(() => {
    const loadLesson = async () => {
      if (!lessonId || !courseId) {
        toast.error('معلومات الدرس غير متوفرة');
        router.push(`/course/${courseId}/recorded-content`);
        return;
      }

      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');

        if (!token) {
          toast.error('يجب تسجيل الدخول أولاً');
          router.push('/login');
          return;
        }

        // Load lesson details
        const lessonResponse = await fetch(
          `${API_BASE_URL}/recorded-courses/lessons/${lessonId}/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (lessonResponse.ok) {
          const lessonData = await lessonResponse.json();
          setLesson(lessonData);
        }

        // Load HLS URL
        const hlsResponse = await fetch(
          `${API_BASE_URL}/recorded-courses/lessons/${lessonId}/hls-url/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (hlsResponse.ok) {
          const hlsData = await hlsResponse.json();
          setHlsUrl(hlsData.hls_url);
          console.log('✅ HLS URL loaded:', hlsData.hls_url);
        } else {
          setVideoError(true);
          toast.error('فشل في تحميل الفيديو');
        }
      } catch (error) {
        console.error('❌ Error loading lesson:', error);
        toast.error('حدث خطأ في تحميل الدرس');
        setVideoError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadLesson();
  }, [lessonId, courseId, router]);

  // Initialize HLS player
  useEffect(() => {
    if (!hlsUrl || !videoRef.current) return;

    const initPlayer = async () => {
      try {
        // Dynamically import hls.js
        const Hls = (await import('hls.js')).default;

        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
          });

          hls.loadSource(hlsUrl);
          hls.attachMedia(videoRef.current!);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('✅ HLS manifest parsed, ready to play');
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('❌ HLS Error:', data);
            if (data.fatal) {
              setVideoError(true);
              toast.error('حدث خطأ في تشغيل الفيديو');
            }
          });

          hlsRef.current = hls;
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          videoRef.current.src = hlsUrl;
        } else {
          setVideoError(true);
          toast.error('المتصفح لا يدعم تشغيل الفيديو');
        }
      } catch (error) {
        console.error('❌ Error initializing HLS player:', error);
        setVideoError(true);
        toast.error('فشل في تهيئة مشغل الفيديو');
      }
    };

    initPlayer();

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [hlsUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-white text-lg">جاري تحميل الدرس...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Navigation Bar */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push(`/course/${courseId}/recorded-content`)}
              className="text-white hover:bg-slate-700 gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              العودة للدورة
            </Button>
            {lesson && (
              <div className="flex items-center gap-4">
                <Badge className="bg-orange-500 text-white px-3 py-1">
                  {lesson.unit_title}
                </Badge>
                {lesson.video_duration && (
                  <Badge variant="outline" className="text-slate-300 border-slate-600">
                    <Clock className="w-4 h-4 ml-1" />
                    {Math.round(lesson.video_duration / 60)} دقيقة
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl"
            >
              {/* Video Container */}
              <div className="relative w-full aspect-video bg-black">
                {videoError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <div className="text-center text-white p-8">
                      <PlayCircle className="w-20 h-20 mx-auto mb-4 opacity-30" />
                      <p className="text-xl font-semibold mb-2">فشل في تحميل الفيديو</p>
                      <p className="text-sm text-slate-400 mb-4">يرجى المحاولة مرة أخرى</p>
                      <Button
                        onClick={() => window.location.reload()}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        إعادة المحاولة
                      </Button>
                    </div>
                  </div>
                ) : hlsUrl ? (
                  <video
                    ref={videoRef}
                    controls
                    autoPlay
                    className="w-full h-full"
                    controlsList="nodownload"
                  >
                    متصفحك لا يدعم تشغيل الفيديو
                  </video>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
                  </div>
                )}
              </div>

              {/* Lesson Info */}
              {lesson && (
                <div className="p-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    {lesson.title}
                  </h1>
                  {lesson.description && (
                    <p className="text-slate-300 leading-relaxed mb-4">
                      {lesson.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      <CheckCircle className="w-5 h-5 ml-2" />
                      إكمال الدرس
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Course Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800 rounded-xl p-6 shadow-2xl sticky top-24"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-orange-500" />
                معلومات الدرس
              </h3>
              {lesson && (
                <div className="space-y-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">الوحدة</p>
                    <p className="text-white font-semibold">{lesson.unit_title || 'غير محدد'}</p>
                  </div>
                  {lesson.video_duration && (
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm text-slate-400 mb-1">المدة</p>
                      <p className="text-white font-semibold">
                        {Math.round(lesson.video_duration / 60)} دقيقة
                      </p>
                    </div>
                  )}
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">الحالة</p>
                    <Badge className={lesson.is_completed ? 'bg-green-600' : 'bg-slate-600'}>
                      {lesson.is_completed ? 'مكتمل' : 'جاري المشاهدة'}
                    </Badge>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursePlayerPageWrapper() {
  return (
    <ProtectedRoute>
      <CoursePlayerPage />
    </ProtectedRoute>
  );
}