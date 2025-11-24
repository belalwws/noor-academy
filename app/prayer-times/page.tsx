"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
// PrayerTimesProvider removed - using Redux now
import { Layout } from "./components/layout";
import { Summary } from "./components/summary";
import { Location } from "./components/location";
import { List } from "./components/list";
import { Settings } from "./components/settings";
import { usePrayerTimes } from "@/lib/store/hooks/usePrayerTimes";

export default function PrayerTimesPage() {
  const [showSettings, setShowSettings] = useState(false);
  const { getCurrentLocation, settings } = usePrayerTimes();

  // Log page load
  useEffect(() => {
    console.log('🕌 [Prayer Times Page] Prayer times page loaded');
  }, []);

  // Request location permission on page load
  useEffect(() => {
    // Only request if no location is set
    if (!settings.city && !settings.latitude && !settings.longitude) {
      getCurrentLocation().catch((error) => {
        // Silently fail - user can manually request location
        console.log('Location permission not granted or failed:', error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-28 pb-16 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-5rem] right-[-6rem] h-96 w-96 rounded-full bg-cyan-200/25 blur-3xl dark:bg-cyan-500/10" />
          <div className="absolute bottom-[-5rem] left-[-6rem] h-80 w-80 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-500/10" />
        </div>

        <Layout>
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-600 to-teal-600 p-8 text-white shadow-2xl shadow-teal-500/20 dark:from-teal-700 dark:via-cyan-800 dark:to-teal-800 dark:shadow-cyan-900/40 md:p-10"
          >
            <motion.div
              animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-8 left-8"
            >
              <Sparkles className="h-6 w-6 text-cyan-200 dark:text-cyan-300" />
            </motion.div>
            <motion.div
              animate={{ rotate: [360, 0], scale: [1, 1.25, 1] }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-8 right-8"
            >
              <Sparkles className="h-8 w-8 text-teal-200 dark:text-teal-300" />
            </motion.div>

            <div className="relative z-10 space-y-4 text-center">
              <motion.h1
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-4xl font-bold md:text-5xl"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                مواقيت الصلاة لحياتك اليومية
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mx-auto max-w-2xl text-lg text-white/90"
              >
                تعرّف على أوقات الأذان في مدينتك، نظّم تنبيهاتك، وراقب أجواء اليوم الروحية بسهولة
                وبدعم كامل للوضع الليلي.
              </motion.p>
            </div>
          </motion.section>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <section className="lg:col-span-2 space-y-4">
              <div className="rounded-3xl border border-white/30 bg-white/85 p-8 shadow-2xl backdrop-blur dark:border-white/5 dark:bg-slate-900/60">
                <header className="mb-6 flex items-center justify-end gap-3 text-2xl font-bold text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1e40af] to-[#2563eb] text-sm text-white">
                    ⏱️
                  </span>
                  جدول الأذان اليومي
                </header>
                <List />
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/30 bg-white/85 p-6 shadow-2xl backdrop-blur dark:border-white/5 dark:bg-slate-900/60">
                <header className="mb-4 flex items-center justify-end gap-2 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#1e40af] to-[#2563eb] text-xs text-white">
                    📌
                  </span>
                  ملخص اليوم
                </header>
                <Summary />
              </div>

              <div className="rounded-3xl border border-white/30 bg-white/85 p-6 shadow-2xl backdrop-blur dark:border-white/5 dark:bg-slate-900/60">
                <header className="mb-4 flex items-center justify-end gap-2 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#1e40af] to-[#2563eb] text-xs text-white">
                    📍
                  </span>
                  موقعك الحالي
                </header>
                <Location onOpenSettings={() => setShowSettings(true)} />
              </div>

              <div className="rounded-3xl border border-white/30 bg-white/85 p-6 shadow-2xl backdrop-blur dark:border-white/5 dark:bg-slate-900/60">
                <header className="mb-4 flex items-center justify-end gap-2 text-xl font-semibold text-slate-900 dark:text-white">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#1e40af] to-[#2563eb] text-xs text-white">
                    🔔
                  </span>
                  التذكيرات والإشعارات
                </header>
                <Button
                  onClick={() => setShowSettings(true)}
                  className="w-full bg-gradient-to-r from-[#1e40af] to-[#2563eb] text-white hover:from-[#1e3a8a] hover:to-[#1e40af]"
                >
                  إدارة التنبيهات والإعدادات
                </Button>
              </div>
            </aside>
          </div>

          <footer className="mt-12 text-center">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur dark:border-white/5 dark:bg-white/5">
              <p className="text-sm text-white/70">
                «إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَاباً مَوْقُوتاً» – النساء: 103
              </p>
            </div>
          </footer>
        </Layout>

        <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </div>
  );
}
