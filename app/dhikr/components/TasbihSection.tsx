'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TasbihCounter } from '@/app/tasbih/components/tasbih-counter';
import { TasbihStats } from '@/app/tasbih/components/tasbih-stats';
import { TasbihHistory } from '@/app/tasbih/components/tasbih-history';
import { TasbihSettings } from '@/app/tasbih/components/tasbih-settings';
import { useTasbihStore } from '@/lib/store/hooks/useTasbih';

type TasbihTab = 'counter' | 'stats' | 'history' | 'settings';

const tabs: Array<{ id: TasbihTab; label: string; badge: string }> = [
  { id: 'counter', label: 'العدّاد', badge: '🔢' },
  { id: 'stats', label: 'الإحصاءات', badge: '📊' },
  { id: 'history', label: 'السجل', badge: '🕰️' },
  { id: 'settings', label: 'الإعدادات', badge: '⚙️' }
];

export default function TasbihSection() {
  const [activeTab, setActiveTab] = useState<TasbihTab>('counter');
  const { initializeStore } = useTasbihStore();

  useEffect(() => {
    initializeStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div>
      <motion.nav
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10 flex flex-col gap-2 md:gap-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-2 shadow-2xl border border-slate-200/50 dark:border-slate-700/50 md:flex-row"
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex-1"
            >
              <Button
                onClick={() => setActiveTab(tab.id)}
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold transition-all duration-300 md:py-4 relative overflow-hidden group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0A5734] via-[#4A8F5C] to-[#0A5734] dark:from-[#4A8F5C] dark:via-[#5BA86D] dark:to-[#4A8F5C] text-white shadow-xl shadow-[#0A5734]/30 dark:shadow-[#4A8F5C]/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-[#0A5734]/10 dark:hover:bg-[#4A8F5C]/20 hover:text-[#0A5734] dark:hover:text-[#4A8F5C]'
                }`}
              >
                {!isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#0A5734]/10 to-[#4A8F5C]/10 dark:from-[#0A5734]/10 dark:to-[#4A8F5C]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span aria-hidden className="text-lg relative z-10">
                  {tab.badge}
                </span>
                <span className="relative z-10">{tab.label}</span>
              </Button>
            </motion.div>
          );
        })}
      </motion.nav>

      <motion.section
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'counter' && <TasbihCounter />}
        {activeTab === 'stats' && <TasbihStats />}
        {activeTab === 'history' && <TasbihHistory />}
        {activeTab === 'settings' && <TasbihSettings />}
      </motion.section>
    </div>
  );
}

