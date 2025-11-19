'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon, RotateCcw, CheckCircle, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Dhikr {
  id: string;
  text: string;
  translation?: string;
  count: number;
  completed: boolean;
  source?: string;
}

const morningAdhkar: Dhikr[] = [
  {
    id: 'm-1',
    text: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
    translation: 'آية الكرسي تحفظ العبد حتى يمسي.',
    count: 1,
    completed: false,
    source: 'صحيح البخاري'
  },
  {
    id: 'm-2',
    text: 'اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور.',
    translation: 'تفويض الأمر لله عند بداية اليوم.',
    count: 1,
    completed: false,
    source: 'سنن الترمذي'
  },
  {
    id: 'm-3',
    text: 'أصبحنا على فطرة الإسلام وعلى كلمة الإخلاص وعلى دين نبينا محمد صلى الله عليه وسلم.',
    translation: 'تجديد العهد مع الله في الصباح.',
    count: 1,
    completed: false,
    source: 'سنن أبي داود'
  },
  {
    id: 'm-4',
    text: 'أعوذ بكلمات الله التامات من شر ما خلق.',
    translation: 'تحصين من كل سوء ظاهر أو خفي.',
    count: 3,
    completed: false,
    source: 'صحيح مسلم'
  },
  {
    id: 'm-5',
    text: 'سبحان الله وبحمده سبحان الله العظيم.',
    translation: 'ذكر يسير ثقيل في الميزان.',
    count: 100,
    completed: false,
    source: 'صحيح مسلم'
  },
  {
    id: 'm-6',
    text: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.',
    translation: 'كلمات توحيدية تجلب الأجر العظيم.',
    count: 10,
    completed: false,
    source: 'سنن الترمذي'
  }
];

const eveningAdhkar: Dhikr[] = [
  {
    id: 'e-1',
    text: 'قُلْ هُوَ اللَّهُ أَحَدٌ، قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، قُلْ أَعُوذُ بِرَبِّ النَّاسِ.',
    translation: 'قراءة الإخلاص والمعوذتين ثلاثاً تكفي من كل شيء.',
    count: 3,
    completed: false,
    source: 'صحيح الترمذي'
  },
  {
    id: 'e-2',
    text: 'اللهم ما أمسى بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر.',
    translation: 'اعتراف بفضل الله وشكره على النعم عند المساء.',
    count: 1,
    completed: false,
    source: 'سنن أبي داود'
  },
  {
    id: 'e-3',
    text: 'اللهم إني أمسيت أشهدك وأشهد حملة عرشك وملائكتك وجميع خلقك أنك أنت الله لا إله إلا أنت وحدك لا شريك لك وأن محمداً عبدك ورسولك.',
    translation: 'شهادة التوحيد أربع مرات في المساء.',
    count: 4,
    completed: false,
    source: 'سنن النسائي'
  },
  {
    id: 'e-4',
    text: 'حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.',
    translation: 'الاعتماد على الله ودفع الهم.',
    count: 7,
    completed: false,
    source: 'سنن الترمذي'
  },
  {
    id: 'e-5',
    text: 'باسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.',
    translation: 'حماية من الشرور في المساء ثلاث مرات.',
    count: 3,
    completed: false,
    source: 'سنن أبي داود'
  },
  {
    id: 'e-6',
    text: 'اللهم إني أعوذ بك من الهم والحَزَن، وأعوذ بك من العجز والكسل، وأعوذ بك من الجُبن والبخل، وأعوذ بك من غلبة الدَّين وقهر الرجال.',
    translation: 'دعاء جامع لرفع الكربات.',
    count: 1,
    completed: false,
    source: 'صحيح البخاري'
  }
];

type AdhkarTab = 'morning' | 'evening';

export default function AdhkarSection() {
  const [activeTab, setActiveTab] = useState<AdhkarTab>('morning');
  const [morningProgress, setMorningProgress] = useState<Dhikr[]>(morningAdhkar);
  const [eveningProgress, setEveningProgress] = useState<Dhikr[]>(eveningAdhkar);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const savedMorning = localStorage.getItem('morning-adhkar-progress');
    const savedEvening = localStorage.getItem('evening-adhkar-progress');

    if (savedMorning) {
      setMorningProgress(JSON.parse(savedMorning));
    }
    if (savedEvening) {
      setEveningProgress(JSON.parse(savedEvening));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const saveProgress = (type: AdhkarTab, progress: Dhikr[]) => {
    localStorage.setItem(`${type}-adhkar-progress`, JSON.stringify(progress));
  };

  const toggleDhikrCompletion = (id: string) => {
    if (activeTab === 'morning') {
      const updated = morningProgress.map(dhikr =>
        dhikr.id === id ? { ...dhikr, completed: !dhikr.completed } : dhikr
      );
      setMorningProgress(updated);
      saveProgress('morning', updated);
    } else {
      const updated = eveningProgress.map(dhikr =>
        dhikr.id === id ? { ...dhikr, completed: !dhikr.completed } : dhikr
      );
      setEveningProgress(updated);
      saveProgress('evening', updated);
    }
  };

  const resetProgress = () => {
    if (activeTab === 'morning') {
      setMorningProgress(morningAdhkar);
      saveProgress('morning', morningAdhkar);
    } else {
      setEveningProgress(eveningAdhkar);
      saveProgress('evening', eveningAdhkar);
    }
  };

  const currentProgress = activeTab === 'morning' ? morningProgress : eveningProgress;
  const completedCount = currentProgress.filter(dhikr => dhikr.completed).length;
  const totalCount = currentProgress.length;
  const progressPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) {
      return { text: 'صباحٌ مُزهر بذكر الله', icon: Sun, hint: 'ابدأ يومك بقراءة وردك الثابت.' };
    }
    if (hour >= 16 && hour < 21) {
      return { text: 'مساءٌ مطمئن بالراحة', icon: Moon, hint: 'هيئ قلبك لسكينة المساء.' };
    }
    return { text: 'لحظات نور تتجدد', icon: Sparkles, hint: 'اجعل الذكر رفيقك في كل وقت.' };
  }, [currentTime]);

  const GreetingIcon = greeting.icon;

  const timeDisplay = currentTime.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col gap-6 rounded-3xl bg-white/70 p-6 shadow-xl backdrop-blur dark:bg-slate-900/60 md:flex-row md:items-center md:justify-between md:p-8"
      >
        <div className="space-y-4 text-right">
          <div className="flex items-center justify-end gap-3 text-[#0A5734] dark:text-[#4A8F5C]">
            <GreetingIcon className="h-8 w-8" />
            <span className="font-semibold">{timeDisplay}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            {greeting.text}
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            {greeting.hint}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant={activeTab === 'morning' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('morning')}
              className={`min-w-[120px] ${
                activeTab === 'morning'
                  ? 'bg-gradient-to-r from-[#0A5734] to-[#4A8F5C] hover:from-[#073D24] hover:to-[#3A7148]'
                  : ''
              }`}
            >
              أذكار الصباح
            </Button>
            <Button
              variant={activeTab === 'evening' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('evening')}
              className={`min-w-[120px] ${
                activeTab === 'evening'
                  ? 'bg-gradient-to-r from-[#0A5734] to-[#4A8F5C] hover:from-[#073D24] hover:to-[#3A7148]'
                  : ''
              }`}
            >
              أذكار المساء
            </Button>
          </div>
        </div>

        <Card className="w-full max-w-sm border-[#0A5734]/20 bg-[#0A5734]/5 text-right shadow-md dark:border-[#4A8F5C]/20 dark:bg-[#4A8F5C]/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0A5734] dark:text-[#4A8F5C]">
              تقدمك اليومي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm text-[#0A5734] dark:text-[#4A8F5C]">
              <span>المكتمل</span>
              <span>{completedCount} / {totalCount}</span>
            </div>
            <Progress value={progressPercentage} className="h-3 overflow-hidden rounded-full bg-[#0A5734]/20 dark:bg-[#4A8F5C]/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0A5734] to-[#4A8F5C]"
                style={{ width: `${progressPercentage}%` }}
              />
            </Progress>
            <div className="flex items-center justify-between text-sm text-[#0A5734]/90 dark:text-[#4A8F5C]">
              <span>النسبة</span>
              <span>{progressPercentage}%</span>
            </div>
            <Button
              variant="outline"
              className="w-full border-[#0A5734]/30 text-[#0A5734] hover:bg-[#0A5734]/10 dark:border-[#4A8F5C]/40 dark:text-[#4A8F5C] dark:hover:bg-[#4A8F5C]/10"
              onClick={resetProgress}
            >
              <RotateCcw className="ml-2 h-4 w-4" />
              إعادة التصفير
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {currentProgress.map((dhikr, index) => (
          <motion.div
            key={dhikr.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`relative h-full overflow-hidden border-0 bg-white/80 shadow-lg transition-all hover:shadow-xl dark:bg-slate-900/70 ${dhikr.completed ? 'ring-2 ring-emerald-500' : ''}`}>
              <CardHeader className="flex items-start justify-between">
                <Badge variant="outline" className="bg-[#0A5734]/10 text-[#0A5734] dark:bg-[#4A8F5C]/20 dark:text-[#4A8F5C]">
                  تكرار: {dhikr.count} ×
                </Badge>
                {dhikr.completed && (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                )}
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p className="text-lg leading-8 text-slate-900 dark:text-slate-100" style={{ fontFamily: "'Amiri', serif" }}>
                  {dhikr.text}
                </p>
                {dhikr.translation && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {dhikr.translation}
                  </p>
                )}
                {dhikr.source && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    المصدر: {dhikr.source}
                  </div>
                )}
                <Button
                  variant={dhikr.completed ? 'secondary' : 'default'}
                  className={`w-full ${
                    !dhikr.completed
                      ? 'bg-gradient-to-r from-[#0A5734] to-[#4A8F5C] hover:from-[#073D24] hover:to-[#3A7148]'
                      : ''
                  }`}
                  onClick={() => toggleDhikrCompletion(dhikr.id)}
                >
                  {dhikr.completed ? 'تعطيل التحديد' : 'وضع علامة مكتمل'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {progressPercentage === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="mt-10"
          >
            <Card className="mx-auto max-w-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-2xl">
              <CardContent className="space-y-4 p-8 text-center">
                <motion.div
                  animate={{ rotate: [0, 6, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15"
                >
                  <CheckCircle className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold">
                  أحسنت! أتممت وردك لهذا الوقت.
                </h3>
                <p className="text-emerald-100">
                  اجعل قلبك معلَّقاً بذكر الله، فبذكره تطمئن القلوب.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

