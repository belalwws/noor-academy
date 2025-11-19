'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Clock, Sparkles, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReminders } from '@/lib/store/hooks/useReminder';
import { useRouter } from 'next/navigation';

const iconMap = {
  prayer: Clock,
  hadith: BookOpen,
  quran: BookOpen,
  'quran-verse': BookOpen,
  dhikr: Sparkles,
  friday: Calendar,
};

const colorMap = {
  prayer: { bg: 'from-amber-500 to-orange-600', icon: 'bg-amber-100 text-amber-700' },
  hadith: { bg: 'from-amber-500 to-orange-600', icon: 'bg-amber-100 text-amber-700' },
  quran: { bg: 'from-emerald-500 to-teal-600', icon: 'bg-emerald-100 text-emerald-700' },
  'quran-verse': { bg: 'from-emerald-500 to-teal-600', icon: 'bg-emerald-100 text-emerald-700' },
  dhikr: { bg: 'from-amber-500 to-orange-600', icon: 'bg-amber-100 text-amber-700' },
  friday: { bg: 'from-amber-500 to-orange-600', icon: 'bg-amber-100 text-amber-700' },
};

export function ReminderNotification() {
  const { currentReminder, closeCurrentReminder } = useReminders();
  const router = useRouter();

  if (!currentReminder) return null;

  const Icon = iconMap[currentReminder.type] || BookOpen;
  const colors = colorMap[currentReminder.type] || colorMap.hadith;

  const handleAction = () => {
    closeCurrentReminder();
    
    switch (currentReminder.type) {
      case 'prayer':
        router.push('/prayer-times');
        break;
      case 'hadith':
        router.push('/hadith');
        break;
      case 'quran-verse':
        router.push('/quran');
        break;
      case 'friday':
        router.push('/quran/18');
        break;
      case 'dhikr':
        router.push('/dhikr');
        break;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {currentReminder && (
        <motion.div
          key={currentReminder.id}
          initial={{ opacity: 0, y: 400, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 400, scale: 0.9 }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          className="fixed bottom-4 right-4 z-[9999] w-[85vw] sm:w-[380px] max-w-sm"
        >
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-amber-200 dark:border-amber-800">
              {/* Compact Header */}
              <div className={`relative bg-gradient-to-r ${colors.bg} px-3 py-2.5`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${colors.icon} dark:bg-white/20 dark:text-white flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">
                      {currentReminder.title}
                    </h3>
                  </div>

                  <button
                    onClick={closeCurrentReminder}
                    className="w-6 h-6 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                <div className="p-3 space-y-2.5">
                  {/* Hadith Display */}
                  {currentReminder.type === 'hadith' && (
                    <div className="space-y-2">
                      {currentReminder.data?.hadith ? (
                        <>
                          {/* Arabic Text */}
                          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/40 shadow-sm">
                            <p className="text-lg leading-loose text-right text-slate-900 dark:text-slate-100 font-arabic" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
                              {currentReminder.data.hadith.arabic}
                            </p>
                          </div>

                          {/* Translation */}
                          {currentReminder.data.hadith.translation && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
                              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                                📖 {currentReminder.data.hadith.translation}
                              </p>
                            </div>
                          )}

                          {/* Source */}
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-amber-700 dark:text-amber-400 font-medium">
                              📚 {currentReminder.data.hadith.source || 'مصدر الحديث'}
                            </span>
                            {currentReminder.data.hadith.grade && (
                              <span className="text-green-700 dark:text-green-400 font-semibold px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded">
                                ✓ {currentReminder.data.hadith.grade}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/40">
                          <p className="text-lg leading-loose text-right text-slate-900 dark:text-slate-100 font-arabic" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
                            {currentReminder.message || 'الحديث اليومي'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quran Verse Display */}
                  {currentReminder.type === 'quran-verse' && (
                    <div className="space-y-2">
                      {currentReminder.data?.verse ? (
                        <>
                          {/* Arabic Text */}
                          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40 shadow-sm">
                            <p className="text-lg leading-loose text-right text-slate-900 dark:text-slate-100 font-arabic" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
                              {currentReminder.data.verse.arabic}
                            </p>
                          </div>

                          {/* Translation */}
                          {currentReminder.data.verse.translation && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
                              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                                📖 {currentReminder.data.verse.translation}
                              </p>
                            </div>
                          )}

                          {/* Reference */}
                          {currentReminder.data.verse.reference && (
                            <div className="flex items-center justify-center text-sm pt-1">
                              <span className="text-emerald-700 dark:text-emerald-400 font-medium px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                � {currentReminder.data.verse.reference}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
                          <p className="text-lg leading-loose text-right text-slate-900 dark:text-slate-100 font-arabic" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
                            {currentReminder.message || 'آية قرآنية'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prayer time */}
                  {currentReminder.type === 'prayer' && (
                    <div className="space-y-3">
                      {currentReminder.data?.prayerName && (
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/40 shadow-sm">
                          <p className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-3 text-center">
                            🕌 صلاة {currentReminder.data.prayerName}
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 text-center mb-3 leading-relaxed">
                            {currentReminder.message}
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-100 dark:border-amber-900/30">
                          <p className="text-right text-base font-arabic text-slate-900 dark:text-slate-100 mb-2 leading-loose" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
                            اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">التكبير عند الإقامة</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-100 dark:border-amber-900/30">
                          <p className="text-right text-base font-arabic text-slate-900 dark:text-slate-100 mb-2 leading-loose" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
                            الصَّلاَةُ خَيْرٌ مِنَ النَّوْمِ
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">للفجر خاصة</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Friday Quran */}
                  {currentReminder.type === 'friday' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/40 shadow-sm">
                        <p className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-3 text-center">
                          📗 سورة الكهف - يوم الجمعة المبارك
                        </p>
                        
                        {/* First Ayah */}
                        <div className="mb-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-100 dark:border-amber-900/30">
                          <p className="text-base leading-loose text-right text-slate-900 dark:text-slate-100 font-arabic mb-3" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
                            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                          </p>
                          <p className="text-base leading-loose text-right text-slate-900 dark:text-slate-100 font-arabic" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
                            الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَل لَّهُ عِوَجًا ۜ
                          </p>
                        </div>

                        {/* Hadith about reading Al-Kahf */}
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                          <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-2 font-semibold">✨ فضل قراءة سورة الكهف:</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            "من قرأ سورة الكهف في يوم الجمعة أضاء له من النور ما بين الجمعتين"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dhikr */}
                  {currentReminder.type === 'dhikr' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/40 shadow-sm">
                        <p className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-3 text-center">
                          ✨ {currentReminder.title}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-100 dark:border-amber-900/30">
                          <p className="text-right text-base font-arabic text-slate-900 dark:text-slate-100 mb-2 leading-loose" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
                            سُبْحَانَ اللَّهِ وَبِحَمْدِهِ
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">100 مرة - تُحط خطاياه وإن كانت مثل زبد البحر</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-100 dark:border-amber-900/30">
                          <p className="text-right text-base font-arabic text-slate-900 dark:text-slate-100 mb-2 leading-loose" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
                            لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">10 مرات - كمن أعتق أربعة من ولد إسماعيل</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                <Button
                  onClick={handleAction}
                  size="sm"
                  className={`flex-1 h-8 bg-gradient-to-r ${colors.bg} hover:opacity-90 text-white text-xs font-semibold shadow-sm rounded-md transition-all`}
                >
                  {currentReminder.type === 'prayer' && '📿 مواقيت الصلاة'}
                  {currentReminder.type === 'hadith' && '📖 المزيد'}
                  {currentReminder.type === 'quran-verse' && '📗 القرآن الكريم'}
                  {currentReminder.type === 'friday' && '📗 اقرأ الآن'}
                  {currentReminder.type === 'dhikr' && '✨ الأذكار'}
                </Button>
                <Button
                  onClick={closeCurrentReminder}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-xs"
                >
                  إغلاق
                </Button>
              </div>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


