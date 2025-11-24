'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getReminderService } from '@/lib/services/reminder-service';

export default function QuickTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [remindersCount, setRemindersCount] = useState(0);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('📱 Page loaded');
    
    const service = getReminderService();
    addLog('✅ Service retrieved');
    
    const settings = service.getSettings();
    addLog(`⚙️ Settings: ${JSON.stringify({
      enabled: settings.enabled,
      dailyHadith: settings.dailyHadith,
      dailyQuranVerse: settings.dailyQuranVerse,
      dailyDhikr: settings.dailyDhikr,
    })}`);
    
    const upcoming = service.getUpcomingReminders(20);
    setRemindersCount(upcoming.length);
    addLog(`📋 Found ${upcoming.length} upcoming reminders`);
    
    if (upcoming.length > 0) {
      upcoming.slice(0, 5).forEach((r, i) => {
        addLog(`  ${i + 1}. ${r.type} - ${r.title} at ${r.time.toLocaleTimeString()}`);
      });
    }
  }, []);

  const testNow = () => {
    const service = getReminderService();
    
    // Add a test reminder for 5 seconds from now
    const testTime = new Date(Date.now() + 5000);
    addLog(`🧪 Creating test reminder for ${testTime.toLocaleTimeString()}`);
    
    service.setOnReminderCallback((reminder) => {
      addLog(`🔔 REMINDER TRIGGERED: ${reminder.title}`);
      alert(`تذكير: ${reminder.title}\n\n${reminder.message}`);
    });
    
    // Force update with current settings
    service.updateReminders();
    
    const upcoming = service.getUpcomingReminders(20);
    setRemindersCount(upcoming.length);
    addLog(`📊 Total reminders after update: ${upcoming.length}`);
  };

  const clearOldSettings = () => {
    localStorage.removeItem('reminder-settings');
    localStorage.removeItem('reminders-last-update');
    addLog('🗑️ Cleared all settings!');
    addLog('🔄 Please refresh the page');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-4">🔔 اختبار سريع للتذكيرات</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            عدد التذكيرات القادمة: <span className="font-bold text-2xl text-blue-600">{remindersCount}</span>
          </p>
          
          <div className="flex gap-3 mb-6">
            <Button onClick={testNow} className="bg-blue-600 hover:bg-blue-700">
              🔄 تحديث التذكيرات
            </Button>
            <Button onClick={clearOldSettings} variant="outline" className="border-red-500 text-red-600">
              🗑️ مسح الإعدادات القديمة
            </Button>
            <Button onClick={() => window.location.href = '/reminders/settings'} variant="outline">
              ⚙️ الإعدادات
            </Button>
          </div>

          <div className="bg-slate-900 text-blue-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-slate-500">جاري التحميل...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 bg-amber-50 dark:bg-amber-950/30 border-amber-300">
          <h2 className="text-xl font-bold mb-3 text-amber-900 dark:text-amber-100">📝 تعليمات</h2>
          <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
            <li>✅ إذا كان عدد التذكيرات أكبر من 0 - النظام يعمل!</li>
            <li>✅ افتح الـ Console (F12) لرؤية السجلات الكاملة</li>
            <li>⚠️ إذا كان العدد 0 - اضغط "مسح الإعدادات القديمة" ثم اعمل refresh</li>
            <li>📅 التذكيرات تتولد لليوم الحالي فقط</li>
            <li>🔔 إذا فات وقت التذكير اليوم، سيظهر غداً</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
