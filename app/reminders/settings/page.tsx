'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, Settings as SettingsIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useReminders } from '@/lib/store/hooks/useReminder';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ReminderSettingsPage() {
  const router = useRouter();
  const { settings, updateSettings, requestNotificationPermission } = useReminders();
  const [localSettings, setLocalSettings] = useState(settings);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasOldSettings, setHasOldSettings] = useState(false);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setLocalSettings(settings);
      // Check if settings are old (15 minutes instead of 180/240)
      const isOld = 
        settings.dailyHadithRepeatInterval === 15 || 
        settings.dailyQuranVerseRepeatInterval === 15 ||
        settings.prayerReminderMinutes === 5;
      setHasOldSettings(isOld);
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [settings]);

  // Update notification permission when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const checkPermission = () => {
        setNotificationPermission(Notification.permission);
      };
      
      // Check periodically
      const interval = setInterval(checkPermission, 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('💾 Saving settings:', localSettings);
      console.log('📋 Current settings before save:', settings);
      
      // Save settings directly to localStorage first to ensure persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('reminder-settings', JSON.stringify(localSettings));
        console.log('💾 Settings saved directly to localStorage');
      }
      
      // Update settings in context (this will also trigger reminder update)
      updateSettings(localSettings);
      
      // Wait for settings to be saved and propagated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Settings saved to service');
      
      // Verify settings were saved by reading from localStorage
      const savedSettings = localStorage.getItem('reminder-settings');
      const parsedSettings = savedSettings ? JSON.parse(savedSettings) : null;
      console.log('💾 Saved in localStorage:', parsedSettings);
      console.log('🔍 Verifying interval values:', {
        hadithInterval: parsedSettings?.dailyHadithRepeatInterval,
        quranInterval: parsedSettings?.dailyQuranVerseRepeatInterval,
        prayerMinutes: parsedSettings?.prayerReminderMinutes
      });
      
      toast.success('✅ تم حفظ الإعدادات بنجاح!', {
        description: 'جاري تحديث التذكيرات...',
        duration: 2000,
      });
      
      // Reload page to ensure settings are applied
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      toast.error('❌ حدث خطأ في حفظ الإعدادات');
      setIsSaving(false);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      toast.success('تم تفعيل الإشعارات بنجاح');
    } else {
      toast.error('لم يتم السماح بالإشعارات');
    }
  };

  const handleResetSettings = () => {
    if (confirm('هل أنت متأكد من حذف جميع الإعدادات وإعادة التعيين؟\nسيتم إيقاف جميع التذكيرات.')) {
      router.push('/reminders/reset');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                إعدادات التذكيرات
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                قم بتخصيص تذكيراتك اليومية
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Old Settings Warning */}
          {hasOldSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-red-300 dark:border-red-800 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-red-900 dark:text-red-100 mb-2">
                        ⚠️ تنبيه: إعدادات قديمة
                      </h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        يبدو أنك تستخدم الإعدادات القديمة (تكرار كل 15 دقيقة). 
                        النظام الجديد يستخدم نمطاً ذكياً متوازناً (كل 3-4 ساعات) لتجنب الإزعاج.
                      </p>
                      <Button
                        onClick={handleResetSettings}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        🗑️ مسح الإعدادات القديمة وتطبيق النمط الجديد
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Smart Timing Info */}
          <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <Clock className="w-5 h-5" />
                نمط التوقيت الذكي
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                تم تصميم التذكيرات لتكون متوازنة وغير مزعجة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-amber-900/80 dark:text-amber-100/80">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">📖 الأحاديث:</span>
                  <span>كل 3 ساعات من 8 صباحًا (~8 مرات يوميًا)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">📗 القرآن:</span>
                  <span>كل 4 ساعات من 9:30 صباحًا (~6 مرات يوميًا)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">🤲 الأذكار:</span>
                  <span>3 أوقات ثابتة (صباحًا 6 ص، مساءً 5 م، ليلًا 10 م)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">🕌 الصلاة:</span>
                  <span>10 دقائق قبل كل صلاة (5 مرات يوميًا)</span>
                </div>
                <div className="pt-2 border-t border-amber-200 dark:border-amber-800 mt-3">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    ⏱️ المعدل: ~22 تذكير يوميًا على مدار 16 ساعة = تذكير واحد كل ~40 دقيقة
                  </p>
                  <p className="text-xs mt-1 text-amber-700 dark:text-amber-300">
                    يمكنك تخصيص جميع الأوقات والفترات أدناه حسب رغبتك
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enable/Disable All */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                تفعيل التذكيرات
              </CardTitle>
              <CardDescription>
                قم بتفعيل أو إلغاء جميع التذكيرات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-all" className="text-base">
                  تفعيل نظام التذكيرات
                </Label>
                <Switch
                  id="enable-all"
                  checked={localSettings.enabled}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, enabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Browser Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                إشعارات المتصفح
              </CardTitle>
              <CardDescription>
                تفعيل الإشعارات في المتصفح
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="browser-notifications" className="text-base">
                  تفعيل إشعارات المتصفح
                </Label>
                <Switch
                  id="browser-notifications"
                  checked={localSettings.browserNotifications}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, browserNotifications: checked })
                  }
                />
              </div>
              
              {notificationPermission !== 'granted' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                    {notificationPermission === 'denied'
                      ? 'تم رفض الإشعارات. يرجى تفعيلها من إعدادات المتصفح.'
                      : 'يجب السماح بالإشعارات لعرض التذكيرات في المتصفح.'}
                  </p>
                  <Button
                    onClick={handleRequestPermission}
                    disabled={notificationPermission === 'denied'}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    طلب الإذن
                  </Button>
                </div>
              )}
              
              {notificationPermission === 'granted' && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">تم تفعيل الإشعارات بنجاح</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prayer Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                تذكيرات مواقيت الصلاة
              </CardTitle>
              <CardDescription>
                تذكير قبل موعد كل صلاة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="prayer-reminders" className="text-base">
                  تفعيل تذكيرات الصلاة
                </Label>
                <Switch
                  id="prayer-reminders"
                  checked={localSettings.prayerReminders}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, prayerReminders: checked })
                  }
                />
              </div>
              
              {localSettings.prayerReminders && (
                <div className="space-y-2">
                  <Label htmlFor="prayer-minutes">دقائق قبل موعد الصلاة</Label>
                  <Input
                    id="prayer-minutes"
                    type="number"
                    min="1"
                    max="30"
                    value={localSettings.prayerReminderMinutes ?? 10}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setLocalSettings({
                        ...localSettings,
                        prayerReminderMinutes: isNaN(value) ? 10 : Math.max(1, Math.min(30, value)),
                      });
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Hadith */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                الحديث اليومي
              </CardTitle>
              <CardDescription>
                تذكير يومي بعرض حديث شريف
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-hadith" className="text-base">
                  تفعيل الحديث اليومي
                </Label>
                <Switch
                  id="daily-hadith"
                  checked={localSettings.dailyHadith}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, dailyHadith: checked })
                  }
                />
              </div>
              
              {localSettings.dailyHadith && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hadith-time">وقت عرض الحديث (24 ساعة)</Label>
                    <Input
                      id="hadith-time"
                      type="time"
                      value={localSettings.dailyHadithTime}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, dailyHadithTime: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hadith-repeat" className="text-base">
                      تفعيل التكرار
                    </Label>
                    <Switch
                      id="hadith-repeat"
                      checked={localSettings.dailyHadithRepeat || false}
                      onCheckedChange={(checked) =>
                        setLocalSettings({ ...localSettings, dailyHadithRepeat: checked })
                      }
                    />
                  </div>
                  {localSettings.dailyHadithRepeat && (
                    <div className="space-y-2">
                      <Label htmlFor="hadith-repeat-interval">مدة التكرار (بالدقائق)</Label>
                      <Input
                        id="hadith-repeat-interval"
                        type="number"
                        min="1"
                        max="1440"
                        value={localSettings.dailyHadithRepeatInterval ?? 180}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setLocalSettings({
                            ...localSettings,
                            dailyHadithRepeatInterval: isNaN(value) ? 180 : Math.max(1, Math.min(1440, value)),
                          });
                        }}
                        placeholder="180"
                      />
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        سيتم عرض التذكير كل {localSettings.dailyHadithRepeatInterval ?? 180} دقيقة ({Math.round((localSettings.dailyHadithRepeatInterval ?? 180) / 60)} ساعة) من وقت البدء حتى نهاية اليوم
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        ✨ <strong>ملاحظة:</strong> يتم تغيير الحديث تلقائياً في كل مرة
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Quran Verse */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                الآية القرآنية اليومية
              </CardTitle>
              <CardDescription>
                تذكير يومي بآية قرآنية ملهمة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-quran-verse" className="text-base">
                  تفعيل الآية القرآنية
                </Label>
                <Switch
                  id="daily-quran-verse"
                  checked={localSettings.dailyQuranVerse || false}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, dailyQuranVerse: checked })
                  }
                />
              </div>
              
              {localSettings.dailyQuranVerse && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quran-verse-time">وقت عرض الآية (24 ساعة)</Label>
                    <Input
                      id="quran-verse-time"
                      type="time"
                      value={localSettings.dailyQuranVerseTime || '09:30'}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, dailyQuranVerseTime: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quran-verse-repeat" className="text-base">
                      تفعيل التكرار
                    </Label>
                    <Switch
                      id="quran-verse-repeat"
                      checked={localSettings.dailyQuranVerseRepeat || false}
                      onCheckedChange={(checked) =>
                        setLocalSettings({ ...localSettings, dailyQuranVerseRepeat: checked })
                      }
                    />
                  </div>
                  {localSettings.dailyQuranVerseRepeat && (
                    <div className="space-y-2">
                      <Label htmlFor="quran-verse-repeat-interval">مدة التكرار (بالدقائق)</Label>
                      <Input
                        id="quran-verse-repeat-interval"
                        type="number"
                        min="1"
                        max="1440"
                        value={localSettings.dailyQuranVerseRepeatInterval ?? 240}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setLocalSettings({
                            ...localSettings,
                            dailyQuranVerseRepeatInterval: isNaN(value) ? 240 : Math.max(1, Math.min(1440, value)),
                          });
                        }}
                        placeholder="240"
                      />
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        سيتم عرض آية قرآنية كل {localSettings.dailyQuranVerseRepeatInterval ?? 240} دقيقة ({Math.round((localSettings.dailyQuranVerseRepeatInterval ?? 240) / 60)} ساعة) من وقت البدء حتى نهاية اليوم
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        ✨ <strong>ملاحظة:</strong> يتم تغيير الآية القرآنية تلقائياً في كل مرة
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Friday Quran */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                سورة الكهف يوم الجمعة
              </CardTitle>
              <CardDescription>
                تذكير بقراءة سورة الكهف يوم الجمعة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="friday-quran" className="text-base">
                  تفعيل تذكير الجمعة
                </Label>
                <Switch
                  id="friday-quran"
                  checked={localSettings.fridayQuran}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, fridayQuran: checked })
                  }
                />
              </div>
              
              {localSettings.fridayQuran && (
                <div className="space-y-2">
                  <Label htmlFor="friday-time">وقت التذكير يوم الجمعة (24 ساعة)</Label>
                  <Input
                    id="friday-time"
                    type="time"
                    value={localSettings.fridayQuranTime}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, fridayQuranTime: e.target.value })
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Dhikr */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                أذكار الصباح والمساء
              </CardTitle>
              <CardDescription>
                تذكيران يومياً: أذكار الصباح (6:00 ص) وأذكار المساء (5:00 م)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-dhikr" className="text-base">
                  تفعيل أذكار الصباح والمساء
                </Label>
                <Switch
                  id="daily-dhikr"
                  checked={localSettings.dailyDhikr}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, dailyDhikr: checked })
                  }
                />
              </div>
              
              {localSettings.dailyDhikr && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    ✨ <strong>التوقيتات الثابتة:</strong>
                  </p>
                  <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                    <li>🌅 أذكار الصباح: 6:00 صباحاً (بعد الفجر)</li>
                    <li>🌆 أذكار المساء: 5:00 مساءً (بعد العصر)</li>
                  </ul>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    💡 مرتان يومياً فقط - لا تكرار
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="sticky bottom-4 z-50 flex justify-center gap-4 p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent">
            <Button
              onClick={handleResetSettings}
              variant="outline"
              className="border-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 px-6 py-6 text-base font-semibold"
            >
              🗑️ مسح جميع الإعدادات
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-10 py-6 text-lg font-bold shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  💾 حفظ الإعدادات
                </>
              )}
            </Button>
          </div>
          
          {/* Instructions */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-300 dark:border-blue-700">
              <div className="flex items-start gap-3">
                <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    📝 كيفية حفظ التغييرات
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                    1️⃣ قم بتعديل الإعدادات كما تريد<br />
                    2️⃣ اضغط على زر "💾 حفظ الإعدادات" في الأسفل<br />
                    3️⃣ انتظر رسالة "✅ تم حفظ الإعدادات بنجاح"
                  </p>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    💡 التغييرات لن تُطبق حتى تضغط على زر الحفظ!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reset warning */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 mb-24">
            <p className="text-sm text-red-800 dark:text-red-200 mb-2">
              ⚠️ <strong>هل التذكيرات تظهر كل دقيقة؟</strong>
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 mb-3">
              إذا كانت التذكيرات تظهر بشكل متكرر جداً، اضغط على زر "مسح الإعدادات القديمة" أعلاه، ثم فعّل فقط ما تحتاجه بفترات أطول (15-30 دقيقة).
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
              ملاحظة: جميع التذكيرات مُلغاة افتراضياً. فعّل فقط ما تحتاجه!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

