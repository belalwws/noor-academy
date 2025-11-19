'use client';

import React, { useState, useEffect } from 'react';
import { Compass, MapPin, Navigation, AlertCircle, CheckCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface Location {
  latitude: number;
  longitude: number;
}

interface QiblaData {
  direction: number;
  distance: number;
}

export default function QiblaPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [distance, setDistance] = useState<number>(0);

  // Kaaba coordinates
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  // Calculate Qibla direction using great circle bearing
  const calculateQiblaDirection = (lat: number, lng: number): QiblaData => {
    const lat1 = (lat * Math.PI) / 180;
    const lat2 = (KAABA_LAT * Math.PI) / 180;
    const deltaLng = ((KAABA_LNG - lng) * Math.PI) / 180;

    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    let bearing = Math.atan2(y, x);
    bearing = (bearing * 180) / Math.PI;
    bearing = (bearing + 360) % 360;

    // Calculate distance
    const R = 6371; // Earth's radius in km
    const dLat = lat2 - lat1;
    const dLng = deltaLng;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return { direction: bearing, distance };
  };

  // Get user location
  const getCurrentLocation = async () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('الموقع الجغرافي غير مدعوم في هذا المتصفح');
      setLoading(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      
      const qiblaData = calculateQiblaDirection(latitude, longitude);
      setQiblaDirection(qiblaData.direction);
      setDistance(qiblaData.distance);
      setPermissionGranted(true);
    } catch (err: any) {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError('تم رفض الإذن للوصول إلى الموقع. يرجى السماح بالوصول للموقع في إعدادات المتصفح');
          break;
        case err.POSITION_UNAVAILABLE:
          setError('الموقع غير متاح حالياً');
          break;
        case err.TIMEOUT:
          setError('انتهت مهلة الحصول على الموقع');
          break;
        default:
          setError('حدث خطأ في الحصول على الموقع');
      }
    }
    setLoading(false);
  };

  // Handle device orientation
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setDeviceHeading(360 - event.alpha);
      }
    };

    // Request permission for iOS 13+
    const requestOrientationPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch (error) {
          console.error('Error requesting orientation permission:', error);
        }
      } else {
        // For non-iOS devices
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    requestOrientationPermission();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Calculate the relative direction to Qibla
  const qiblaRelativeDirection = (qiblaDirection - deviceHeading + 360) % 360;

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #2d7d32 0%, #1b5e20 50%, #0d3e10 100%)',
        fontFamily: "'Cairo', sans-serif",
        direction: 'rtl'
      }}
    >
      {/* Header */}
      <div
        className="backdrop-blur-md border-b"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderColor: 'rgba(255, 215, 0, 0.3)'
        }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Compass className="w-8 h-8" style={{ color: '#ffd700' }} />
              <h1
                className="text-4xl font-bold text-white"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                اتجاه القبلة
              </h1>
            </div>
            <p className="text-lg text-white/80">
              بوصلة تفاعلية لتحديد اتجاه القبلة الشريفة
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Location Permission */}
          {!permissionGranted && (
            <div
              className="backdrop-blur-md rounded-2xl shadow-lg p-6 mb-6"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4" style={{ color: '#ffd700' }} />
                <h3
                  className="text-xl font-bold mb-2 text-white"
                  style={{ fontFamily: "'Amiri', serif" }}
                >
                  تحديد موقعك
                </h3>
                <p className="text-white/80 mb-4">
                  نحتاج إلى موقعك الحالي لحساب اتجاه القبلة بدقة
                </p>
                <button
                  onClick={getCurrentLocation}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 mx-auto text-white"
                  style={{
                    background: loading
                      ? 'rgba(255, 215, 0, 0.5)'
                      : 'linear-gradient(135deg, #ffd700 0%, #ffc107 100%)',
                    color: loading ? 'rgba(255, 255, 255, 0.7)' : '#1b5e20'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner size="md" />
                      جاري التحديد...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5" />
                      تحديد الموقع
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className="rounded-2xl p-4 mb-6"
              style={{
                background: 'rgba(220, 53, 69, 0.1)',
                border: '1px solid rgba(220, 53, 69, 0.3)'
              }}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6" style={{ color: '#ff6b6b' }} />
                <div>
                  <h4 className="font-semibold" style={{ color: '#ff6b6b' }}>خطأ</h4>
                  <p className="text-white/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Compass */}
          {permissionGranted && location && (
            <>
              {/* Location Info */}
              <div
                className="backdrop-blur-md rounded-2xl shadow-lg p-6 mb-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6" style={{ color: '#ffd700' }} />
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Amiri', serif" }}>
                    معلومات الموقع
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(255, 215, 0, 0.1)',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    <div className="text-sm mb-1" style={{ color: '#ffd700' }}>خط العرض</div>
                    <div className="font-bold text-white">
                      {location.latitude.toFixed(6)}°
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(255, 215, 0, 0.1)',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    <div className="text-sm mb-1" style={{ color: '#ffd700' }}>خط الطول</div>
                    <div className="font-bold text-white">
                      {location.longitude.toFixed(6)}°
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(255, 215, 0, 0.1)',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    <div className="text-sm mb-1" style={{ color: '#ffd700' }}>اتجاه القبلة</div>
                    <div className="font-bold text-white">
                      {qiblaDirection.toFixed(1)}°
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(255, 215, 0, 0.1)',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    <div className="text-sm mb-1" style={{ color: '#ffd700' }}>المسافة إلى مكة</div>
                    <div className="font-bold text-white">
                      {distance.toFixed(0)} كم
                    </div>
                  </div>
                </div>
              </div>

              {/* Compass Widget */}
              <div
                className="backdrop-blur-md rounded-2xl shadow-lg p-8"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Amiri', serif" }}>
                    البوصلة
                  </h3>
                  <p className="text-white/80">وجه جهازك نحو السهم الذهبي</p>
                </div>

                {/* Compass Circle */}
                <div className="relative w-80 h-80 mx-auto">
                  {/* Outer Circle */}
                  <div
                    className="absolute inset-0 rounded-full border-4 shadow-lg"
                    style={{
                      borderColor: 'rgba(255, 215, 0, 0.5)',
                      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)'
                    }}
                  >
                    {/* Direction Markers */}
                    {[0, 90, 180, 270].map((angle) => (
                      <div
                        key={angle}
                        className="absolute w-1 h-8 rounded-full"
                        style={{
                          top: '10px',
                          left: '50%',
                          transformOrigin: '50% 150px',
                          transform: `translateX(-50%) rotate(${angle}deg)`,
                          background: '#ffd700'
                        }}
                      />
                    ))}

                    {/* Direction Labels */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 font-bold" style={{ color: '#ffd700' }}>ش</div>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 font-bold" style={{ color: '#ffd700' }}>ق</div>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 font-bold" style={{ color: '#ffd700' }}>ج</div>
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 font-bold" style={{ color: '#ffd700' }}>غ</div>
                  </div>

                  {/* Qibla Arrow */}
                  <div
                    className="absolute top-1/2 left-1/2 w-2 h-32 rounded-full shadow-lg transition-transform duration-300"
                    style={{
                      transformOrigin: '50% 100%',
                      transform: `translate(-50%, -100%) rotate(${qiblaRelativeDirection}deg)`,
                      background: 'linear-gradient(to top, #ffd700, #ffc107)',
                      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.5)'
                    }}
                  >
                    {/* Arrow Head */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-emerald-600" />
                  </div>

                  {/* Center Dot */}
                  <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-emerald-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg" />

                  {/* Kaaba Icon */}
                  <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${qiblaRelativeDirection}deg) translateY(-120px)`
                    }}
                  >
                    <div className="bg-gray-800 w-6 h-6 rounded transform -rotate-45" />
                  </div>
                </div>

                {/* Direction Info */}
                <div className="text-center mt-6">
                  <div className="bg-emerald-50 rounded-xl p-4 inline-block">
                    <div className="text-sm text-emerald-600 mb-1">الاتجاه النسبي</div>
                    <div className="text-2xl font-bold text-emerald-800">
                      {qiblaRelativeDirection.toFixed(0)}°
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                  <h4 className="font-semibold text-emerald-800 mb-2">تعليمات الاستخدام:</h4>
                  <ul className="text-emerald-700 text-sm space-y-1">
                    <li>• امسك الجهاز بشكل مسطح</li>
                    <li>• وجه الجهاز نحو السهم الأخضر</li>
                    <li>• عندما يشير السهم للأعلى تكون متجهاً للقبلة</li>
                    <li>• تأكد من عدم وجود معادن قريبة تؤثر على البوصلة</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


