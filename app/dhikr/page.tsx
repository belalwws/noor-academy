'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Rows3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

// Lazy load components
const AdhkarSection = dynamic(() => import('./components/AdhkarSection'), {
  loading: () => <div className="flex items-center justify-center min-h-[400px]">جاري التحميل...</div>
});

const TasbihSection = dynamic(() => import('./components/TasbihSection'), {
  loading: () => <div className="flex items-center justify-center min-h-[400px]">جاري التحميل...</div>
});

type MainTab = 'adhkar' | 'tasbih';

const mainTabs: Array<{ id: MainTab; label: string; icon: any; description: string }> = [
  { 
    id: 'adhkar', 
    label: 'الأذكار',
    icon: BookOpen,
    description: 'أذكار الصباح والمساء'
  },
  { 
    id: 'tasbih', 
    label: 'المسبحة الرقمية',
    icon: Rows3,
    description: 'عدّاد التسبيح والإحصائيات'
  }
];

export default function DhikrPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('adhkar');

  useEffect(() => {
    console.log('🕌 [Dhikr Page] Dhikr page loaded');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-5rem] right-[-6rem] h-96 w-96 rounded-full bg-gradient-to-br from-[#0A5734]/25 to-[#4A8F5C]/20 blur-3xl dark:from-[#0A5734]/10 dark:to-[#4A8F5C]/8"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-6rem] left-[-6rem] h-80 w-80 rounded-full bg-gradient-to-br from-[#4A8F5C]/20 to-[#0A5734]/15 blur-3xl dark:from-[#4A8F5C]/8 dark:to-[#0A5734]/6"
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A5734] via-[#4A8F5C] to-[#0A5734] text-white shadow-2xl shadow-[#0A5734]/20 dark:from-[#0A5734] dark:via-[#4A8F5C] dark:to-[#0A5734]"
        >
          <div className="relative p-8 md:p-10">
            {/* Floating Icons */}
            <motion.div
              animate={{ 
                rotate: [0, 360], 
                scale: [1, 1.15, 1],
                x: [0, 20, 0],
                y: [0, -15, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-8 left-8"
            >
              <Sparkles className="h-6 w-6 text-white/80 dark:text-white/90 drop-shadow-lg" />
            </motion.div>
            <motion.div
              animate={{ 
                rotate: [360, 0], 
                scale: [1, 1.2, 1],
                x: [0, -15, 0],
                y: [0, 20, 0]
              }}
              transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-8 right-8"
            >
              <Sparkles className="h-8 w-8 text-white/80 dark:text-white/90 drop-shadow-lg" />
            </motion.div>

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-xl border border-white/30"
              >
                <span className="text-3xl">🕌</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold md:text-4xl mb-2"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                منطقة الذكر والتسبيح
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mx-auto max-w-2xl text-white/90"
              >
                اجعل قلبك معلقاً بذكر الله، واحفظ أذكارك اليومية، وسبّح الله في كل حين
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Main Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 grid grid-cols-2 gap-3 md:gap-4"
        >
          {mainTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <motion.div
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full rounded-2xl p-6 transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-[#0A5734] via-[#4A8F5C] to-[#0A5734] text-white shadow-xl shadow-[#0A5734]/30'
                      : 'bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 shadow-lg'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Icon className={`w-8 h-8 ${isActive ? 'text-white' : 'text-[#0A5734] dark:text-[#4A8F5C]'}`} />
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-1">{tab.label}</h3>
                      <p className={`text-sm ${isActive ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'}`}>
                        {tab.description}
                      </p>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'adhkar' && <AdhkarSection />}
          {activeTab === 'tasbih' && <TasbihSection />}
        </motion.div>
      </div>
    </div>
  );
}

