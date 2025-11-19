'use client';

import React from 'react';
import { decodePassphrase } from '@/lib/client-utils';
import { DebugMode } from '@/lib/Debug';
import { KeyboardShortcuts } from '@/lib/KeyboardShortcuts';
import { RecordingIndicator } from '@/lib/RecordingIndicator';
import { SettingsMenu } from '@/lib/SettingsMenu';
import { SessionTimer } from '@/lib/SessionTimer';
import { ConnectionDetails } from '@/lib/types';
import {
  formatChatMessageLinks,
  LocalUserChoices,
  RoomContext,
  VideoConference,
} from '@livekit/components-react';
import {
  ExternalE2EEKeyProvider,
  RoomOptions,
  VideoCodec,
  VideoPresets,
  Room,
  DeviceUnsupportedError,
  RoomConnectOptions,
  RoomEvent,
  TrackPublishDefaults,
  VideoCaptureOptions,
  Track,
  createLocalVideoTrack,
  createLocalAudioTrack,
} from 'livekit-client';
import { useRouter } from 'next/navigation';
import { useSetupE2EE } from '@/lib/useSetupE2EE';
import { useLowCPUOptimizer } from '@/lib/usePerfomanceOptimiser';
import { getApiUrl, getLiveKitUrl } from '@/lib/config';
import { getAccessToken } from '@/lib/auth';
import { authService } from '@/lib/auth/authService';
import { RecordingControls } from '../components/RecordingControls';

const CONN_DETAILS_ENDPOINT = getApiUrl('/sessions/connection-details/');

// Custom PreJoin Component with Arabic UI and Platform Theme
function CustomPreJoin({
  userName,
  onSubmit,
  onError,
  disabled,
}: {
  userName: string;
  onSubmit: (values: LocalUserChoices) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}) {
  const [videoEnabled, setVideoEnabled] = React.useState(true);
  const [audioEnabled, setAudioEnabled] = React.useState(true);
  const [videoTrack, setVideoTrack] = React.useState<Track | null>(null);
  const [audioTrack, setAudioTrack] = React.useState<Track | null>(null);
  const [isReady, setIsReady] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const videoTrackRef = React.useRef<Track | null>(null);
  const audioTrackRef = React.useRef<Track | null>(null);

  // Initialize video/audio tracks (only if user explicitly enabled them)
  React.useEffect(() => {
    const initializeTracks = async () => {
      setIsInitializing(true);
      try {
        if (videoEnabled) {
          try {
            const track = await createLocalVideoTrack({});
            setVideoTrack(track);
            videoTrackRef.current = track;
            if (videoRef.current) {
              track.attach(videoRef.current);
            }
          } catch (error: any) {
            // Handle permission errors gracefully
            if (error?.name === 'NotAllowedError' || error?.message?.includes('Permission denied')) {
              console.warn('Camera permission denied - disabling video');
              // Automatically disable video if permission is denied
              setVideoTrack(null);
              setVideoEnabled(false);
            } else {
              console.error('Failed to initialize video track:', error);
              // For other errors, also disable video to prevent issues
              setVideoTrack(null);
              setVideoEnabled(false);
            }
          }
        }
        if (audioEnabled) {
          try {
            const track = await createLocalAudioTrack({});
            setAudioTrack(track);
            audioTrackRef.current = track;
          } catch (error: any) {
            // Handle permission errors gracefully
            if (error?.name === 'NotAllowedError' || error?.message?.includes('Permission denied')) {
              console.warn('Microphone permission denied - disabling audio');
              // Automatically disable audio if permission is denied
              setAudioTrack(null);
              setAudioEnabled(false);
            } else {
              console.error('Failed to initialize audio track:', error);
              // For other errors, also disable audio to prevent issues
              setAudioTrack(null);
              setAudioEnabled(false);
            }
          }
        }
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize tracks:', error);
        // Don't call onError for permission issues - allow user to proceed
        setIsReady(true); // Allow proceeding even if tracks fail
      } finally {
        setIsInitializing(false);
      }
    };

    initializeTracks();

    return () => {
      try { videoTrackRef.current?.stop(); } catch {}
      try { audioTrackRef.current?.stop(); } catch {}
      videoTrackRef.current = null;
      audioTrackRef.current = null;
    };
  }, [videoEnabled, audioEnabled]);

  // Ensure devices are closed if user closes tab while on pre-join
  React.useEffect(() => {
    const stopOnUnload = () => {
      try { videoTrackRef.current?.stop(); } catch {}
      try { audioTrackRef.current?.stop(); } catch {}
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', stopOnUnload);
      return () => window.removeEventListener('beforeunload', stopOnUnload);
    }
    return;
  }, []);

  React.useEffect(() => {
    if (videoRef.current && videoTrack) {
      if (videoEnabled) {
        videoTrack.attach(videoRef.current);
      } else {
        videoTrack.detach();
      }
    }
  }, [videoTrack, videoEnabled]);

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!disabled && isReady && !isInitializing) {
        onSubmit({
          username: userName,
          videoEnabled,
          audioEnabled,
          videoDeviceId: undefined,
          audioDeviceId: undefined,
        });
      }
    },
    [userName, videoEnabled, audioEnabled, disabled, isReady, isInitializing, onSubmit]
  );

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-2 sm:p-4" dir="rtl">
      <div className="bg-white rounded-[12px] sm:rounded-[16px] shadow-[0_4px_15px_rgba(45,125,50,0.1)] p-4 sm:p-6 md:p-8 w-full max-w-md border border-[#dee2e6]">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#a5d6a7] rounded-full mb-3 sm:mb-4">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#2d7d32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2E2E2E] mb-1 sm:mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>الانضمام إلى الجلسة</h2>
          <p className="text-xs sm:text-sm text-[#6c757d]" style={{ fontFamily: 'Cairo, sans-serif' }}>تحضير الكاميرا والمايكروفون</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">

          {/* Video Preview */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-[#2E2E2E]" style={{ fontFamily: 'Cairo, sans-serif' }}>
              معاينة الكاميرا
            </label>
            <div className="relative bg-gray-900 rounded-[8px] sm:rounded-[12px] overflow-hidden aspect-video">
              {videoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }} // Mirror effect
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                    <span className="text-gray-400 text-sm" style={{ fontFamily: 'Cairo, sans-serif' }}>الكاميرا مغلقة</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3 sm:gap-4">
            {/* Video Toggle */}
            <button
              type="button"
              onClick={toggleVideo}
              className={`p-3 sm:p-4 rounded-full transition-all duration-200 touch-manipulation ${
                videoEnabled
                  ? 'bg-[#a5d6a7] text-[#2d7d32] active:bg-[#81c784]'
                  : 'bg-red-100 text-[#dc3545] active:bg-red-200'
              }`}
              title={videoEnabled ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
            >
              {videoEnabled ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`p-3 sm:p-4 rounded-full transition-all duration-200 touch-manipulation ${
                audioEnabled
                  ? 'bg-[#a5d6a7] text-[#2d7d32] active:bg-[#81c784]'
                  : 'bg-red-100 text-[#dc3545] active:bg-red-200'
              }`}
              title={audioEnabled ? 'كتم المايكروفون' : 'تشغيل المايكروفون'}
            >
              {audioEnabled ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1m0 0V5a2 2 0 012-2h2a2 2 0 012 2v8.5m0 0V19a2 2 0 002 2h2a2 2 0 002-2V9a2 2 0 00-2-2h-2a2 2 0 00-2 2v.5zM9 9l3 3m0 0l3-3M12 12l3 3m-3-3l-3 3" />
                </svg>
              )}
            </button>
          </div>

          {/* Settings Labels */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 sm:gap-8 sm:space-x-reverse text-[10px] sm:text-xs text-[#6c757d]" style={{ fontFamily: 'Cairo, sans-serif' }}>
            <span className={videoEnabled ? 'text-[#2d7d32]' : 'text-[#dc3545]'}>
              {videoEnabled ? 'الكاميرا قيد التشغيل' : 'الكاميرا مغلقة'}
            </span>
            <span className={audioEnabled ? 'text-[#2d7d32]' : 'text-[#dc3545]'}>
              {audioEnabled ? 'المايكروفون قيد التشغيل' : 'المايكروفون مكتوم'}
            </span>
          </div>

          {/* Join Button */}
          <button
            type="submit"
            disabled={disabled || !isReady || isInitializing}
            className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-[10px] sm:rounded-[12px] font-semibold text-sm sm:text-base text-white transition-all duration-200 touch-manipulation ${
              disabled || !isReady || isInitializing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#2d7d32] active:bg-[#1b5e20] shadow-[0_4px_15px_rgba(45,125,50,0.3)] active:shadow-[0_2px_8px_rgba(45,125,50,0.4)] active:scale-[0.98]'
            }`}
            style={{ fontFamily: 'Cairo, sans-serif' }}
          >
            {disabled || !isReady || isInitializing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full ml-2"></div>
                <span className="text-xs sm:text-sm">{isInitializing ? 'جاري التحضير...' : 'جاري الاتصال...'}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10.5V18a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18V5.25A2.25 2.25 0 016.75 3h10.5A2.25 2.25 0 0119.5 5.25z" />
                </svg>
                <span className="text-xs sm:text-sm md:text-base">الانضمام إلى الجلسة</span>
              </div>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-[10px] sm:text-xs text-[#6c757d]" style={{ fontFamily: 'Cairo, sans-serif' }}>
            تأكد من إعطاء الإذن للكاميرا والمايكروفون للمشاركة بشكل صحيح
          </p>
        </div>
      </div>
    </div>
  );
}

function PermissionDeniedError({ roomName, errorMessage, onRetry }: { 
  roomName: string; 
  errorMessage?: string; 
  onRetry: () => void;
}) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" dir="rtl">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 text-red-500 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            غير مصرح لك بالدخول
          </h2>
          <p className="text-gray-600 mb-6">
            {errorMessage || 'ليس لديك صلاحية للوصول إلى هذه الجلسة'}
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                  </svg>
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-red-800">
                    أسباب محتملة لعدم إمكانية الوصول:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>لم تقم بالتسجيل في الدورة المرتبطة بهذه الجلسة</li>
                      <li>طلب التسجيل في الدورة لم يتم الموافقة عليه بعد</li>
                      <li>الجلسة خاصة بمعلمين أو مشرفين فقط</li>
                      <li>انتهت صلاحية الجلسة أو تم إلغاؤها</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={onRetry}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                إعادة المحاولة
              </button>
              
              <button
                onClick={handleGoHome}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                العودة إلى الصفحة الرئيسية
              </button>
              
              <button
                onClick={handleGoBack}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                العودة للصفحة السابقة
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            تحتاج مساعدة؟{' '}
            <a href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
              تواصل مع الدعم الفني
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export function PageClientImpl(props: {
  roomName: string;
  region?: string;
  hq: boolean;
  codec: VideoCodec;
}) {
  const [preJoinChoices, setPreJoinChoices] = React.useState<LocalUserChoices | undefined>(
    undefined,
  );
  const preJoinDefaults = React.useMemo(() => {
    return {
      username: '',
      videoEnabled: true,
      audioEnabled: true,
    };
  }, []);
  const [connectionDetails, setConnectionDetails] = React.useState<ConnectionDetails | undefined>(
    undefined,
  );
  const [permissionError, setPermissionError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<string>('');
  const [isTeacher, setIsTeacher] = React.useState(false);

  // Get current user name and role
  React.useEffect(() => {
    const getUserInfo = async () => {
      try {
        const authData = authService.getStoredAuthData();
        if (authData?.user) {
          const displayName = authData.user.first_name && authData.user.last_name 
            ? `${authData.user.first_name} ${authData.user.last_name}`
            : authData.user.username || authData.user.email || 'مستخدم';
          setCurrentUser(displayName);
          
          // Check if user is teacher
          setIsTeacher(authData.user.role === 'teacher');
        } else {
          setCurrentUser('مستخدم');
          setIsTeacher(false);
        }
      } catch (error) {
        console.error('Error getting user info:', error);
        setCurrentUser('مستخدم');
        setIsTeacher(false);
      }
    };
    getUserInfo();
  }, []);

  const handlePreJoinSubmit = React.useCallback(async (values: LocalUserChoices) => {
    setIsLoading(true);
    setPermissionError(null);
    
    try {
      setPreJoinChoices(values);
      const url = new URL(CONN_DETAILS_ENDPOINT);
      url.searchParams.append('roomName', props.roomName);
      url.searchParams.append('participantName', currentUser || values.username || '');
      if (props.region) {
        url.searchParams.append('region', props.region);
      }

      // Ensure we have a valid token and handle 401 by retrying once after refresh
      let token = await authService.getValidAccessToken();
      let connectionDetailsResp = await fetch(url.toString(), {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (connectionDetailsResp.status === 401) {
        const refreshed = await authService.refreshAccessToken();
        if (refreshed) {
          token = authService.getAccessToken();
          connectionDetailsResp = await fetch(url.toString(), {
            headers: {
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
          });
        }
      }

      if (!connectionDetailsResp.ok) {
        const errText = await connectionDetailsResp.text();
        
        if (connectionDetailsResp.status === 401 && typeof window !== 'undefined') {
          alert('يجب تسجيل الدخول للانضمام إلى الجلسة. سيتم تحويلك إلى صفحة تسجيل الدخول.');
          const next = window.location.pathname;
          window.location.href = `/login?next=${encodeURIComponent(next)}`;
          return;
        }
        
        if (connectionDetailsResp.status === 403) {
          // Handle permission denied error gracefully
          let errorMsg = 'ليس لديك صلاحية للوصول إلى هذه الجلسة';
          try {
            const errorData = JSON.parse(errText);
            if (errorData.error) {
              errorMsg = errorData.error;
            }
          } catch (e) {
            // Keep default message if JSON parsing fails
          }
          setPermissionError(errorMsg);
          return;
        }
        
        throw new Error(`Failed to get connection details (${connectionDetailsResp.status}): ${errText}`);
      }
      
      const data = await connectionDetailsResp.json();

      // Normalize and validate connection details
      const normalized: ConnectionDetails = {
        serverUrl: data.serverUrl || getLiveKitUrl(),
        roomName: data.roomName || props.roomName,
        participantName: currentUser || values.username || data.participantName || '',
        participantToken: data.participantToken,
      };

      if (!normalized.serverUrl || typeof normalized.serverUrl !== 'string') {
        console.error('❌ Invalid LiveKit serverUrl from backend:', data.serverUrl);
        throw new Error('Invalid LiveKit server URL');
      }
      if (!normalized.participantToken || typeof normalized.participantToken !== 'string') {
        console.error('❌ Missing participant token from backend:', data);
        throw new Error('Missing participant token');
      }

      console.log('🔌 Using LiveKit connection:', normalized);
      setConnectionDetails(normalized);
    } catch (error) {
      console.error('❌ Error in handlePreJoinSubmit:', error);
      // Handle other errors (network issues, etc.)
      if (error instanceof Error && !permissionError) {
        setPermissionError(`حدث خطأ: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [props.roomName, props.region, currentUser]);

  const handleRetry = React.useCallback(() => {
    setPermissionError(null);
    setConnectionDetails(undefined);
    setPreJoinChoices(undefined);
  }, []);

  const handlePreJoinError = React.useCallback((e: any) => console.error(e), []);

  // Show permission error UI
  if (permissionError) {
    return (
      <PermissionDeniedError 
        roomName={props.roomName}
        errorMessage={permissionError}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <main 
      data-lk-theme="default" 
      className="w-full h-screen overflow-hidden"
      style={{ 
        height: '100vh',
        height: '100dvh', // Dynamic viewport height for mobile
        touchAction: 'manipulation' // Prevent double-tap zoom
      }}
    >
      {connectionDetails === undefined || preJoinChoices === undefined ? (
        <CustomPreJoin
          userName={currentUser}
          onSubmit={handlePreJoinSubmit}
          onError={handlePreJoinError}
          disabled={isLoading}
        />
      ) : (
        <VideoConferenceComponent
          connectionDetails={connectionDetails}
          userChoices={preJoinChoices}
          options={{ codec: props.codec, hq: props.hq }}
          roomName={props.roomName}
          isTeacher={isTeacher}
        />
      )}
    </main>
  );
}

function VideoConferenceComponent(props: {
  userChoices: LocalUserChoices;
  connectionDetails: ConnectionDetails;
  options: {
    hq: boolean;
    codec: VideoCodec;
  };
  roomName: string;
  isTeacher: boolean;
}) {
  const keyProvider = new ExternalE2EEKeyProvider();
  const { worker, e2eePassphrase } = useSetupE2EE();
  const e2eeEnabled = !!(e2eePassphrase && worker);

  const [e2eeSetupComplete, setE2eeSetupComplete] = React.useState(false);

  const roomOptions = React.useMemo((): RoomOptions => {
    let videoCodec: VideoCodec | undefined = props.options.codec ? props.options.codec : 'vp9';
    if (e2eeEnabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
      videoCodec = undefined;
    }
    const videoCaptureDefaults: VideoCaptureOptions = {
      deviceId: (props.userChoices.videoDeviceId || undefined),
      resolution: props.options.hq ? VideoPresets.h2160 : VideoPresets.h720,
    };
    const publishDefaults: TrackPublishDefaults = {
      dtx: false,
      videoSimulcastLayers: props.options.hq
        ? [VideoPresets.h1080, VideoPresets.h720]
        : [VideoPresets.h540, VideoPresets.h216],
      red: !e2eeEnabled,
      videoCodec,
    };
    return {
      videoCaptureDefaults: videoCaptureDefaults,
      publishDefaults: publishDefaults,
      audioCaptureDefaults: {
        deviceId: (props.userChoices.audioDeviceId || undefined),
      },
      adaptiveStream: true,
      dynacast: true,
      e2ee: keyProvider && worker && e2eeEnabled ? { keyProvider, worker } : undefined,
    };
  }, [props.userChoices, props.options.hq, props.options.codec]);

  const room = React.useMemo(() => new Room(roomOptions), []);

  React.useEffect(() => {
    if (e2eeEnabled) {
      keyProvider
        .setKey(decodePassphrase(e2eePassphrase))
        .then(() => {
          room.setE2EEEnabled(true).catch((e) => {
            if (e instanceof DeviceUnsupportedError) {
              alert(
                `You're trying to join an encrypted meeting, but your browser does not support it. Please update it to the latest version and try again.`,
              );
              console.error(e);
            } else {
              throw e;
            }
          });
        })
        .then(() => setE2eeSetupComplete(true));
    } else {
      setE2eeSetupComplete(true);
    }
  }, [e2eeEnabled, room, e2eePassphrase]);

  const connectOptions = React.useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true,
    };
  }, []);

  React.useEffect(() => {
    room.on(RoomEvent.Disconnected, handleOnLeave);
    room.on(RoomEvent.EncryptionError, handleEncryptionError);
    room.on(RoomEvent.MediaDevicesError, handleError);
    room.on(RoomEvent.Connected, handleOnJoin);
    room.on(RoomEvent.ParticipantConnected, handleParticipantJoined);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantLeft);

    if (e2eeSetupComplete) {
      room
        .connect(
          props.connectionDetails.serverUrl,
          props.connectionDetails.participantToken,
          connectOptions,
        )
        .catch((error) => {
          handleError(error);
        });
      // Try to enable camera/microphone only if user explicitly enabled them
      // Don't show errors for permission issues - user can continue without camera/microphone
      if (props.userChoices.videoEnabled) {
        // Delay slightly to ensure room is fully connected
        setTimeout(() => {
          room.localParticipant.setCameraEnabled(true).catch((error: any) => {
            // Silently handle permission errors - user can continue without camera
            if (error?.name === 'NotAllowedError' || error?.message?.includes('Permission denied')) {
              console.warn('Camera permission denied - user can continue without video');
            } else if (!error?.message?.includes('publishing rejected') && !error?.message?.includes('timeout')) {
              // Only log non-permission, non-connection errors
              console.error('Failed to enable camera:', error);
            }
          });
        }, 100);
      }
      if (props.userChoices.audioEnabled) {
        // Delay slightly to ensure room is fully connected
        setTimeout(() => {
          room.localParticipant.setMicrophoneEnabled(true).catch((error: any) => {
            // Silently handle permission errors - user can continue without microphone
            if (error?.name === 'NotAllowedError' || error?.message?.includes('Permission denied')) {
              console.warn('Microphone permission denied - user can continue without audio');
            } else if (!error?.message?.includes('publishing rejected') && !error?.message?.includes('timeout')) {
              // Only log non-permission, non-connection errors
              console.error('Failed to enable microphone:', error);
            }
          });
        }, 100);
      }
    }
    // CLEANUP: stop all local tracks (camera/mic) when leaving/unmounting
    return () => {
      // Try disabling via LiveKit API first (ensures unpublish & stop)
      try { room?.localParticipant?.setCameraEnabled(false).catch(() => {}); } catch {}
      try { room?.localParticipant?.setMicrophoneEnabled(false).catch(() => {}); } catch {}
      // Stop any remaining tracks defensively
      try {
        const pubs = room?.localParticipant?.tracks ? Array.from(room.localParticipant.tracks.values()) : [];
        pubs.forEach((pub) => pub.track?.stop());
      } catch {}
      // Disconnect the room (safe even if already disconnected)
      try { room?.disconnect && room.disconnect(); } catch {}
      room.off(RoomEvent.Disconnected, handleOnLeave);
      room.off(RoomEvent.EncryptionError, handleEncryptionError);
      room.off(RoomEvent.MediaDevicesError, handleError);
      room.off(RoomEvent.Connected, handleOnJoin);
      room.off(RoomEvent.ParticipantConnected, handleParticipantJoined);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantLeft);
    };
  }, [e2eeSetupComplete, room, props.connectionDetails, props.userChoices]);

  const lowPowerMode = useLowCPUOptimizer(room);

  const router = useRouter();
  const handleOnLeave = React.useCallback(() => {
    // Notify backend that participant is leaving
    const token = getAccessToken();
    fetch(getApiUrl(`/sessions/${props.roomName}/leave/`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    }).catch(console.error);
    
    router.push('/');
  }, [router, props.roomName]);

  const handleOnJoin = React.useCallback(() => {
    // Notify backend that participant joined (local participant only)
    const token = getAccessToken();
    fetch(getApiUrl(`/sessions/${props.roomName}/join/`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    }).catch(console.error);
  }, [props.roomName]);

  const handleParticipantJoined = React.useCallback(() => {
    // Remote participant joined - do not notify backend for local user
    console.debug('[Room] Remote participant connected');
  }, []);

  const handleParticipantLeft = React.useCallback(() => {
    // Remote participant left - do not notify backend for local user
    console.debug('[Room] Remote participant disconnected');
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error(error);
    // Don't show alert for permission errors - these are handled gracefully
    if (error.name === 'NotAllowedError' || error.message?.includes('Permission denied')) {
      console.warn('Permission denied - user can continue without camera/microphone');
      return;
    }
    // Only show alert for unexpected errors (not permission-related)
    if (!error.message?.includes('publishing rejected') && !error.message?.includes('timeout')) {
      // These are usually connection issues that resolve themselves
      console.warn('Error handled silently:', error.message);
    }
  }, []);

  const handleEncryptionError = React.useCallback((error: Error) => {
    console.error('Encryption error:', error);
    // Don't show alert - just log the error
    // Encryption errors are usually non-critical and don't prevent the session from working
    console.warn('Encryption error handled silently - session will continue without encryption');
  }, []);

  React.useEffect(() => {
    if (lowPowerMode) {
      console.warn('Low power mode enabled');
    }
  }, [lowPowerMode]);

  return (
    <div className="lk-room-container w-full h-screen overflow-hidden">
      <RoomContext.Provider value={room}>
        {/* Recording Controls - Only visible for teachers */}
        <RecordingControls sessionId={props.roomName} isTeacher={props.isTeacher} />
        
        <KeyboardShortcuts />
        <VideoConference
          chatMessageFormatter={formatChatMessageLinks}
          SettingsComponent={process.env.NEXT_PUBLIC_SHOW_SETTINGS_MENU === 'true' ? SettingsMenu : undefined}
        />
        <SessionTimer roomName={props.roomName} />
        <DebugMode />
        <RecordingIndicator />
      </RoomContext.Provider>
    </div>
  );
}
