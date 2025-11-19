'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TasbihRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dhikr');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A5734] dark:border-[#4A8F5C] mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-300">جاري التحويل إلى صفحة الذكر والتسبيح...</p>
      </div>
    </div>
  );
}
