'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ResetRemindersPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all reminder data
    localStorage.removeItem('reminder-settings');
    localStorage.removeItem('reminders-last-update');
    
    // Show success message
    toast.success('تم مسح جميع الإعدادات بنجاح!');
    
    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/reminders/settings');
    }, 2000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          جاري مسح الإعدادات القديمة...
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          سيتم توجيهك لصفحة الإعدادات قريباً
        </p>
      </div>
    </div>
  );
}
