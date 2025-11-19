'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerProps {
  lessonId: number;
  videoId: string;
  lessonTitle: string;
  onEnded?: () => void;
  onComplete?: () => void;
}

export default function VideoPlayer({ lessonId, videoId, lessonTitle, onEnded, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const hlsRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // تحميل الفيديو باستخدام HLS
  useEffect(() => {
    if (!lessonId || !videoRef.current) return;

    const initPlayer = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // الحصول على HLS URL من الـ API
        const token = localStorage.getItem('access_token');
        const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
        
        const response = await fetch(
          `${API_BASE_URL}/recorded-courses/lessons/${lessonId}/hls-url/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load video URL');
        }

        const data = await response.json();
        const hlsUrl = data.hls_url;

        console.log('✅ HLS URL:', hlsUrl);

        // استيراد hls.js
        const Hls = (await import('hls.js')).default;

        if (Hls.isSupported()) {
          // تنظيف النسخة السابقة
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }

          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            xhrSetup: (xhr: XMLHttpRequest) => {
              xhr.withCredentials = false;
            }
          });

          hls.loadSource(hlsUrl);
          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            console.log('✅ Video ready to play');
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('❌ HLS Error:', data);
            if (data.fatal) {
              setError(true);
              setIsLoading(false);
            }
          });

          hlsRef.current = hls;
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // دعم أصلي لـ HLS (Safari)
          videoRef.current.src = hlsUrl;
          videoRef.current.addEventListener('loadedmetadata', () => {
            setIsLoading(false);
          });
        } else {
          setError(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing player:', err);
        setError(true);
        setIsLoading(false);
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [lessonId]);

  // معالجات الفيديو
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setVideoEnded(true);
      // Auto-complete lesson when video ends
      if (onComplete) {
        onComplete();
      }
      onEnded?.();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);

  // Reset videoEnded when video changes
  useEffect(() => {
    setVideoEnded(false);
  }, [lessonId]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    // Always show controls on mouse move
    setShowControls(true);
    
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    
    // Hide controls after 3 seconds if playing (only if mouse is still over)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleMouseEnter = () => {
    // Show controls immediately when mouse enters
    setShowControls(true);
    
    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    // Clear timeout when mouse leaves
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    
    // Hide controls immediately if playing
    if (isPlaying) {
      setShowControls(false);
    }
  };

  // Show controls when video is paused
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
    }
  }, [isPlaying]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative bg-gradient-to-br from-slate-900 via-black to-slate-800 w-full aspect-video group shadow-2xl transition-all ${
        !showControls && isPlaying ? 'cursor-none' : 'cursor-pointer'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        className="w-full h-full bg-black"
        onClick={togglePlay}
        playsInline
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-800 z-50">
          <div className="text-center text-white">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#E9A821] border-r-[#FFB347] animate-spin"></div>
            </div>
            <p className="text-lg font-semibold text-slate-300 animate-pulse">جاري تحميل الفيديو...</p>
            <p className="text-sm text-slate-500 mt-2">يرجى الانتظار</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-800">
          <div className="text-center text-white p-8">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">فشل في تحميل الفيديو</h3>
            <p className="text-slate-400 mb-6">حدث خطأ أثناء تحميل الفيديو</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-[#E9A821] to-[#FFB347] rounded-lg hover:shadow-lg hover:shadow-[#E9A821]/50 transition-all font-semibold"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* Video Ended Overlay */}
      {videoEnded && !isLoading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/95 via-slate-900/95 to-black/95"
        >
          <div className="text-center text-white p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/50"
            >
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              أحسنت! 🎉
            </h3>
            <p className="text-slate-300 mb-8 text-lg">
              لقد أكملت مشاهدة هذا الدرس
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={async () => {
                  // Call onComplete to mark lesson as completed
                  if (onComplete) {
                    await onComplete();
                  }
                  // Reset video ended state
                  setVideoEnded(false);
                }}
                className="px-8 py-4 bg-gradient-to-r from-[#E9A821] to-[#FFB347] rounded-xl hover:shadow-2xl hover:shadow-[#E9A821]/50 transition-all font-bold text-lg flex items-center gap-2 group"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                إكمال الدرس والانتقال للتالي
              </button>
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    setVideoEnded(false);
                    videoRef.current.play();
                  }
                }}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-semibold flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                إعادة المشاهدة
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* عناصر التحكم المخصصة */}
      <AnimatePresence>
        {(showControls || !isPlaying) && !isLoading && !error && !videoEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60 pointer-events-none"
          >
            {/* زر التشغيل الكبير */}
            {!isPlaying && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-auto"
              >
                <button
                  onClick={togglePlay}
                  className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#E9A821] to-[#FFB347] hover:from-[#FFB347] hover:to-[#E9A821] flex items-center justify-center transition-all transform hover:scale-110 shadow-2xl shadow-[#E9A821]/50"
                >
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                  <Play className="w-12 h-12 text-white ml-2 relative z-10" fill="white" />
                </button>
              </motion.div>
            )}

            {/* العنوان والمعلومات */}
            <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white text-lg font-bold drop-shadow-lg mb-1">{lessonTitle}</h3>
                  {duration > 0 && (
                    <p className="text-white/80 text-sm">
                      <span className="bg-black/40 px-2 py-1 rounded">
                        مدة الفيديو: {formatTime(duration)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* عناصر التحكم السفلية */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent pointer-events-auto" dir="ltr">
              {/* شريط التقدم المحسّن */}
              <div 
                className="w-full h-2 bg-white/20 rounded-full mb-4 cursor-pointer group relative overflow-hidden"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-gradient-to-r from-[#E9A821] to-[#FFB347] rounded-full transition-all relative"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex items-center justify-between text-white">
                {/* الأزرار الشمال (left) */}
                <div className="flex items-center gap-3">
                  {/* زر التشغيل/الإيقاف */}
                  <button 
                    onClick={togglePlay} 
                    className="p-2 rounded-lg bg-gradient-to-br from-[#E9A821] to-[#FFB347] hover:shadow-lg hover:shadow-[#E9A821]/50 transition-all"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  {/* أزرار التقديم/التأخير */}
                  <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1">
                    <button 
                      onClick={() => skipTime(-10)} 
                      className="p-2 hover:bg-white/10 rounded transition-colors relative group"
                    >
                      <SkipBack className="w-4 h-4" />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        -10 ثانية
                      </span>
                    </button>
                    <button 
                      onClick={() => skipTime(10)} 
                      className="p-2 hover:bg-white/10 rounded transition-colors relative group"
                    >
                      <SkipForward className="w-4 h-4" />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        +10 ثانية
                      </span>
                    </button>
                  </div>

                  {/* التحكم في الصوت */}
                  <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-2">
                    <button onClick={toggleMute} className="hover:text-[#E9A821] transition-colors">
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const newVolume = parseFloat(e.target.value);
                        if (videoRef.current) {
                          videoRef.current.volume = newVolume;
                          videoRef.current.muted = newVolume === 0;
                        }
                      }}
                      className="w-20 accent-[#E9A821]"
                    />
                  </div>

                  {/* الوقت */}
                  <div className="bg-black/40 px-3 py-2 rounded-lg font-mono text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* زر Fullscreen اليمين (right) */}
                <button 
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-black/40 hover:bg-[#E9A821] transition-all"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

