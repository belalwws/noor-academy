'use client';

import { useEffect, useState } from 'react';
import { useReminders } from '@/lib/store/hooks/useReminder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Sparkles, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function ReminderTestPage() {
  const { showReminder, settings, updateSettings, getUpcomingReminders } = useReminders();
  const [testResults, setTestResults] = useState<{ type: string; success: boolean; message: string }[]>([]);

  // تفعيل جميع التذكيرات عند فتح الصفحة
  useEffect(() => {
    updateSettings({
      enabled: true,
      dailyHadith: true,
      dailyHadithTime: '08:00',
      dailyHadithRepeat: true,
      dailyHadithRepeatInterval: 15,
      dailyQuranVerse: true,
      dailyQuranVerseTime: '10:00',
      dailyQuranVerseRepeat: true,
      dailyQuranVerseRepeatInterval: 15,
      dailyDhikr: true,
      dailyDhikrTime: '09:00',
      fridayQuran: true,
      fridayQuranTime: '07:00',
      prayerReminders: true,
      prayerReminderMinutes: 5,
    });
  }, [updateSettings]);

  const testHadithReminder = () => {
    try {
      const testRem = {
        id: 'test-hadith-' + Date.now(),
        type: 'hadith' as const,
        title: 'الحديث اليومي',
        message: 'تذكير اختبار للحديث',
        time: new Date(),
        shown: false,
        data: {
          hadith: {
            id: 1,
            arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوْ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ',
            translation: 'Actions are judged by intentions, so each man will have what he intended.',
            source: 'صحيح البخاري',
            grade: 'صحيح',
          }
        }
      };
      
      showReminder(testRem);
      setTestResults(prev => [...prev, { type: 'hadith', success: true, message: 'تم اختبار تذكير الحديث بنجاح' }]);
    } catch (error) {
      setTestResults(prev => [...prev, { type: 'hadith', success: false, message: 'فشل اختبار تذكير الحديث' }]);
    }
  };

  const testQuranReminder = () => {
    try {
      const testRem = {
        id: 'test-quran-' + Date.now(),
        type: 'quran-verse' as const,
        title: 'آية قرآنية',
        message: 'تذكير اختبار للآية القرآنية',
        time: new Date(),
        shown: false,
        data: {
          verse: {
            arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا * إِنَّ مَعَ الْعُسْرِ يُسْرًا',
            translation: 'For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.',
            reference: 'سورة الشرح: 5-6'
          }
        }
      };
      
      showReminder(testRem);
      setTestResults(prev => [...prev, { type: 'quran', success: true, message: 'تم اختبار تذكير الآية القرآنية بنجاح' }]);
    } catch (error) {
      setTestResults(prev => [...prev, { type: 'quran', success: false, message: 'فشل اختبار تذكير الآية القرآنية' }]);
    }
  };

  const testPrayerReminder = () => {
    try {
      const testRem = {
        id: 'test-prayer-' + Date.now(),
        type: 'prayer' as const,
        title: 'تذكير بموعد الصلاة',
        message: 'موعد صلاة الظهر بعد 5 دقائق',
        time: new Date(),
        shown: false,
        data: {
          prayerName: 'الظهر',
          prayerIndex: 1
        }
      };
      
      showReminder(testRem);
      setTestResults(prev => [...prev, { type: 'prayer', success: true, message: 'تم اختبار تذكير الصلاة بنجاح' }]);
    } catch (error) {
      setTestResults(prev => [...prev, { type: 'prayer', success: false, message: 'فشل اختبار تذكير الصلاة' }]);
    }
  };

  const testFridayReminder = () => {
    try {
      const testRem = {
        id: 'test-friday-' + Date.now(),
        type: 'friday' as const,
        title: 'قراءة سورة الكهف',
        message: 'يوم الجمعة المبارك، اقرأ سورة الكهف',
        time: new Date(),
        shown: false,
        data: {
          surahNumber: 18,
          surahName: 'الكهف'
        }
      };
      
      showReminder(testRem);
      setTestResults(prev => [...prev, { type: 'friday', success: true, message: 'تم اختبار تذكير يوم الجمعة بنجاح' }]);
    } catch (error) {
      setTestResults(prev => [...prev, { type: 'friday', success: false, message: 'فشل اختبار تذكير يوم الجمعة' }]);
    }
  };

  const testDhikrReminder = () => {
    try {
      const testRem = {
        id: 'test-dhikr-' + Date.now(),
        type: 'dhikr' as const,
        title: 'أذكار الصباح',
        message: 'حان وقت أذكار الصباح',
        time: new Date(),
        shown: false,
        data: {
          period: 'morning'
        }
      };
      
      showReminder(testRem);
      setTestResults(prev => [...prev, { type: 'dhikr', success: true, message: 'تم اختبار تذكير الذكر بنجاح' }]);
    } catch (error) {
      setTestResults(prev => [...prev, { type: 'dhikr', success: false, message: 'فشل اختبار تذكير الذكر' }]);
    }
  };

  const clearLocalStorage = () => {
    if (confirm('هل أنت متأكد من حذف جميع إعدادات التذكير وإعادة تحميل الصفحة؟')) {
      localStorage.removeItem('reminder-settings');
      localStorage.removeItem('reminders-last-update');
      alert('تم حذف الإعدادات. سيتم إعادة تحميل الصفحة...');
      window.location.reload();
    }
  };

  const upcomingReminders = getUpcomingReminders(10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <span className="text-4xl">🔔</span>
              صفحة اختبار نظام التذكيرات الدينية
            </CardTitle>
            <CardDescription className="text-base">
              اختبر جميع أنواع التذكيرات للتأكد من عملها بشكل صحيح
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Test Buttons */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-xl">اختبارات التذكيرات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button
                onClick={testHadithReminder}
                className="h-20 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 flex flex-col items-center gap-2"
              >
                <BookOpen className="w-6 h-6" />
                <span>اختبار تذكير الحديث</span>
              </Button>

              <Button
                onClick={testQuranReminder}
                className="h-20 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 flex flex-col items-center gap-2"
              >
                <BookOpen className="w-6 h-6" />
                <span>اختبار تذكير القرآن</span>
              </Button>

              <Button
                onClick={testPrayerReminder}
                className="h-20 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 flex flex-col items-center gap-2"
              >
                <Clock className="w-6 h-6" />
                <span>اختبار تذكير الصلاة</span>
              </Button>

              <Button
                onClick={testFridayReminder}
                className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex flex-col items-center gap-2"
              >
                <Calendar className="w-6 h-6" />
                <span>اختبار تذكير الجمعة</span>
              </Button>

              <Button
                onClick={testDhikrReminder}
                className="h-20 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 flex flex-col items-center gap-2"
              >
                <Sparkles className="w-6 h-6" />
                <span>اختبار تذكير الذكر</span>
              </Button>

              <Button
                onClick={clearLocalStorage}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <XCircle className="w-6 h-6" />
                <span>حذف البيانات</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <CardTitle className="text-xl">نتائج الاختبارات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg flex items-center gap-3 ${
                      result.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-1">
                        {result.type}
                      </Badge>
                      <p className="text-sm">{result.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Display */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-xl">الإعدادات الحالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-semibold">✅ التذكيرات مفعلة: {settings.enabled ? 'نعم' : 'لا'}</p>
                <p>📖 الحديث اليومي: {settings.dailyHadith ? '✓' : '✗'}</p>
                <p>📗 الآية اليومية: {settings.dailyQuranVerse ? '✓' : '✗'}</p>
                <p>🕌 تذكير الصلاة: {settings.prayerReminders ? '✓' : '✗'}</p>
              </div>
              <div className="space-y-2">
                <p>📅 سورة الكهف (الجمعة): {settings.fridayQuran ? '✓' : '✗'}</p>
                <p>✨ الذكر اليومي: {settings.dailyDhikr ? '✓' : '✗'}</p>
                <p>🔔 إشعارات المتصفح: {settings.browserNotifications ? '✓' : '✗'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-xl">
              التذكيرات القادمة ({upcomingReminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400 text-center py-4">
                لا توجد تذكيرات قادمة حالياً
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingReminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{rem.type}</Badge>
                          <p className="font-semibold text-lg">{rem.title}</p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {rem.message.substring(0, 100)}
                          {rem.message.length > 100 && '...'}
                        </p>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="text-sm font-mono">{rem.time.toLocaleTimeString('ar-EG')}</p>
                        <p className="text-xs text-slate-500">{rem.time.toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl">📋 تعليمات الاستخدام</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>اضغط على أي زر اختبار لرؤية التذكير فوراً</li>
              <li>تحقق من أن جميع البيانات تظهر بشكل صحيح (النص العربي، الترجمة، المصدر)</li>
              <li>التذكيرات التلقائية ستظهر حسب الأوقات المحددة في الإعدادات</li>
              <li>استخدم زر "حذف البيانات" لإعادة ضبط جميع الإعدادات</li>
              <li>تحقق من قسم "التذكيرات القادمة" لرؤية التذكيرات المجدولة</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
