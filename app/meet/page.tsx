'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import { encodePassphrase, generateRoomId, randomString } from '@/lib/client-utils';
import { getApiUrl } from '@/lib/config';

function Tabs(props: React.PropsWithChildren<{}>) {
  const searchParams = useSearchParams();
  const tabIndex = searchParams?.get('tab') === 'custom' ? 1 : 0;

  const router = useRouter();
  function onTabSelected(index: number) {
    const tab = index === 1 ? 'custom' : 'demo';
    router.push(`/meet?tab=${tab}`);
  }

  let tabs = React.Children.map(props.children, (child, index) => {
    return (
      <button
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          tabIndex === index
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
            : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
        }`}
        onClick={() => {
          if (onTabSelected) {
            onTabSelected(index);
          }
        }}
        aria-pressed={tabIndex === index}
      >
        {/* @ts-ignore */}
        {child?.props.label}
      </button>
    );
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex gap-4 justify-center mb-8">{tabs}</div>
      {/* @ts-ignore */}
      {props.children[tabIndex]}
    </div>
  );
}

function DemoMeetingTab(props: { label: string }) {
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));
  const [duration, setDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  
  const startMeeting = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/sessions/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `جلسة مباشرة - ${duration} دقيقة`,
          duration_minutes: duration,
        }),
      });
      
      if (!response.ok) {
        throw new Error('فشل في إنشاء الجلسة');
      }
      
      const session = await response.json();
      const roomId = session.session_id;
      
      if (e2ee) {
        router.push(`/meet/rooms/${roomId}#${encodePassphrase(sharedPassphrase)}`);
      } else {
        router.push(`/meet/rooms/${roomId}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('فشل في إنشاء جلسة الاجتماع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">ابدأ جلسة مباشرة</h3>
        <p className="text-gray-600">جرب منصة لسان الحكمة للاجتماعات المرئية المباشرة</p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-xl p-6">
          <label htmlFor="duration" className="block text-sm font-medium text-blue-800 mb-3">
            مدة الجلسة:
          </label>
          <select
            id="duration"
            value={duration}
            onChange={(ev) => setDuration(Number(ev.target.value))}
            className="w-full px-4 py-3 rounded-lg border border-blue-200 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value={2}>دقيقتان</option>
            <option value={5}>5 دقائق</option>
            <option value={30}>30 دقيقة</option>
            <option value={60}>60 دقيقة</option>
          </select>
        </div>
        
        <button 
          onClick={startMeeting}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              جاري إنشاء الجلسة...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ابدأ الجلسة الآن
            </>
          )}
        </button>
        
        <div className="border-t border-blue-100 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <input
              id="use-e2ee"
              type="checkbox"
              checked={e2ee}
              onChange={(ev) => setE2ee(ev.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="use-e2ee" className="text-sm font-medium text-gray-700">
              تفعيل التشفير من طرف إلى طرف
            </label>
          </div>
          
          {e2ee && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <label htmlFor="passphrase" className="block text-sm font-medium text-yellow-800 mb-2">
                كلمة المرور للتشفير:
              </label>
              <input
                id="passphrase"
                type="password"
                value={sharedPassphrase}
                onChange={(ev) => setSharedPassphrase(ev.target.value)}
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="أدخل كلمة مرور قوية"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomConnectionTab(props: { label: string }) {
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const serverUrl = formData.get('serverUrl');
    const token = formData.get('token');
    if (e2ee) {
      router.push(
        `/meet/custom/?liveKitUrl=${serverUrl}&token=${token}#${encodePassphrase(sharedPassphrase)}`,
      );
    } else {
      router.push(`/meet/custom/?liveKitUrl=${serverUrl}&token=${token}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">اتصال مخصص</h3>
        <p className="text-gray-600">اتصل بخادم LiveKit مخصص باستخدام رمز الوصول الخاص بك</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700 mb-2">
            رابط الخادم:
          </label>
          <input
            id="serverUrl"
            name="serverUrl"
            type="url"
            placeholder="wss://*.livekit.cloud"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
            رمز الوصول:
          </label>
          <textarea
            id="token"
            name="token"
            placeholder="أدخل رمز الوصول هنا..."
            required
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <input
              id="use-e2ee-custom"
              type="checkbox"
              checked={e2ee}
              onChange={(ev) => setE2ee(ev.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="use-e2ee-custom" className="text-sm font-medium text-gray-700">
              تفعيل التشفير من طرف إلى طرف
            </label>
          </div>

          {e2ee && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <label htmlFor="passphrase-custom" className="block text-sm font-medium text-yellow-800 mb-2">
                كلمة المرور للتشفير:
              </label>
              <input
                id="passphrase-custom"
                type="password"
                value={sharedPassphrase}
                onChange={(ev) => setSharedPassphrase(ev.target.value)}
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="أدخل كلمة مرور قوية"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          اتصل الآن
        </button>
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2"> لسان الحكمة اكاديمية</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <Tabs>
            <DemoMeetingTab label="جلسة تجريبية" />
            <CustomConnectionTab label="اتصال مخصص" />
          </Tabs>
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
              </svg>
            </div>
            <span className="text-xl font-bold">لسان الحكمة</span>
          </div>
          <p className="text-gray-400 mb-4">
            مستضاف على{' '}
            <a href="https://livekit.io/cloud?ref=meet" className="text-blue-400 hover:text-blue-300 transition-colors" rel="noopener">
              LiveKit Cloud
            </a>
            {' '}• الكود المصدري على{' '}
            <a href="https://github.com/livekit/meet?ref=meet" className="text-blue-400 hover:text-blue-300 transition-colors" rel="noopener">
              GitHub
            </a>
          </p>
          <div className="text-sm text-gray-500">
            2024 لسان الحكمة - جميع الحقوق محفوظة
          </div>
        </div>
      </footer>
    </div>
  );
}
