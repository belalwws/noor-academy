'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, FileCheck, Calendar, Sparkles } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import Lottie from 'lottie-react';

const features = [
  {
    icon: FileCheck,
    title: 'خطة حفظ ومراجعة لضمان الإتقان',
    description: 'برنامج منظم يجمع بين الحفظ الجديد والمراجعة المستمرة',
    color: 'from-[#1e40af] to-[#2563eb]',
  },
  {
    icon: Clock,
    title: 'متابعة مستمرة',
    description: 'متابعة يومية لضمان التقدم المستمر في الحفظ',
    color: 'from-[#2563eb] to-[#3b82f6]',
  },
  {
    icon: BookOpen,
    title: 'منهج مخصص حسب مستوى الطالب',
    description: 'برنامج تعليمي مصمم خصيصاً لمستوى كل طالب',
    color: 'from-[#1e40af] to-[#2563eb]',
  },
  {
    icon: Calendar,
    title: 'حلقات مرنة جدًا حسب ظروفك',
    description: 'جدول مرن يتناسب مع انشغالاتك اليومية',
    color: 'from-[#2563eb] to-[#C5A15A]',
  },
];

export const BusyAdultsSection: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [ramadanMuslimAnimation, setRamadanMuslimAnimation] = useState<any>(null);

  useEffect(() => {
    fetch('/Muslim reads the Koran in the month of Ramadan.json')
      .then((res) => res.json())
      .then((data) => setRamadanMuslimAnimation(data))
      .catch((err) => console.error('Error loading animation:', err));
  }, []);

  const handleRegister = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/register');
    }
  };

  return (
    <section id="busy-adults" className="relative py-4 sm:py-5 md:py-6 lg:py-6 bg-gradient-to-b from-white via-[#2563eb]/4 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden" dir="rtl">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #1e40af 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      {/* Sophisticated Gradient Accents */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-[#1e40af]/6 via-[#2563eb]/4 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-[#C5A15A]/6 via-[#2563eb]/4 to-transparent rounded-full blur-[120px]" />

      <div className="container mx-auto max-w-6xl px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8 lg:gap-16 items-center mx-auto">
          {/* Content - Takes 7 columns */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-7 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-r from-[#1e40af]/10 via-[#2563eb]/8 to-[#1e40af]/10 dark:from-[#1e40af]/20 dark:via-[#2563eb]/15 dark:to-[#1e40af]/20 px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full border border-[#1e40af]/20 dark:border-blue-400/30 shadow-lg backdrop-blur-sm text-xs sm:text-sm"
            >
              <Sparkles className="text-[#1e40af] dark:text-blue-400" size={14} style={{ width: '14px', height: '14px' }} />
              <span className="font-bold text-[#1e40af] dark:text-blue-400 tracking-wide">للأشخاص المشغولين</span>
            </motion.div>

            <h2 className="text-base sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.2] tracking-tight">
              <span className="text-[#222222] dark:text-slate-50 block mb-2 sm:mb-3 md:mb-3 lg:mb-4">حتى لو وقتك ضيق…</span>
              <span className="text-[#1e40af] dark:text-blue-400 font-extrabold block my-2 sm:my-3 md:my-3 lg:my-4">
                ما زال بإمكانك حفظ القرآن
              </span>
            </h2>
            
            <p className="hidden sm:block text-lg md:text-xl text-[#555555] dark:text-slate-300 leading-relaxed font-light">
              نحن نتفهم أن الحياة العصرية مليئة بالانشغالات، لذلك صممنا برامجنا لتتناسب مع جدولك المزدحم.
            </p>

            {/* Features Grid - Enhanced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -40, scale: 0.95 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative bg-white dark:bg-slate-900 rounded-xl p-2.5 sm:p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#1e40af]/10 dark:border-slate-700/50 hover:border-[#1e40af]/30 dark:hover:border-blue-400/30"
                  >
                    <div className="flex items-start gap-2 sm:gap-4">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 8 }}
                        className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      >
                        <Icon className="text-white" size={20} style={{ width: '20px', height: '20px' }} />
                      </motion.div>
                      <div className="flex-1 pt-0.5 sm:pt-1">
                        <h3 className="text-xs sm:text-sm lg:text-lg font-extrabold text-[#222222] dark:text-slate-50 mb-0.5 sm:mb-1 leading-tight">
                          {feature.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs sm:text-sm text-[#555555] dark:text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-none">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA Button - Enhanced */}
            <Button
              onClick={handleRegister}
              className="group relative bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#1e40af] hover:from-[#1e3a8a] hover:via-[#1e40af] hover:to-[#1e3a8a] text-white px-4 sm:px-10 py-2.5 sm:py-6 text-xs sm:text-base lg:text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-xl"
              size="lg"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <BookOpen className="ml-2 group-hover:rotate-12 transition-transform relative z-10" size={16} style={{ width: '16px', height: '16px' }} />
              <span className="relative z-10">احجز الآن</span>
            </Button>
          </motion.div>

          {/* Illustration - Takes 5 columns */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            <div className="relative">
              {/* Multi-layer Glow Effects */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-full h-full max-w-lg bg-gradient-to-br from-[#C5A15A]/18 to-[#2563eb]/12 rounded-full blur-3xl" />
                <div className="absolute w-[90%] h-[90%] bg-gradient-to-br from-[#1e40af]/10 to-[#2563eb]/8 rounded-full blur-2xl" />
              </div>
              
              {/* Card - Enhanced */}
              <div className="relative bg-gradient-to-br from-white via-white to-[#C5A15A]/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-10 shadow-2xl border-2 border-[#C5A15A]/10 dark:border-[#C5A15A]/20 backdrop-blur-xl">
                {/* Decorative Corners */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#C5A15A]/10 via-[#2563eb]/6 to-transparent rounded-tl-3xl rounded-br-full" />
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-[#1e40af]/10 via-[#C5A15A]/6 to-transparent rounded-bl-3xl rounded-tl-full" />
                
                {/* Content */}
                <div className="relative z-10 text-center space-y-6">
                  <motion.div
                    animate={{ 
                      y: [0, -15, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 6, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="w-full h-80 mx-auto flex items-center justify-center relative"
                  >
                    {/* Glow Background for Animation - Gold & Blue theme */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-full h-full max-w-[300px] bg-gradient-to-br from-[#C5A15A]/30 via-[#2563eb]/25 to-[#C5A15A]/20 rounded-full blur-3xl animate-pulse" />
                      <div className="absolute w-[85%] h-[85%] bg-gradient-to-br from-[#2563eb]/20 via-[#D4B16B]/15 to-[#2563eb]/10 rounded-full blur-2xl" />
                    </div>
                    {ramadanMuslimAnimation ? (
                      <Lottie
                        animationData={ramadanMuslimAnimation}
                        loop={true}
                        className="w-full h-full relative z-10"
                      />
                    ) : (
                      <div className="w-40 h-40 mx-auto bg-gradient-to-br from-[#C5A15A] to-[#2563eb] rounded-2xl flex items-center justify-center shadow-2xl relative z-10">
                        <div className="text-8xl">⏰📖</div>
                      </div>
                    )}
                  </motion.div>
                  
                  <div className="space-y-2 pt-4 border-t-2 border-[#C5A15A]/10 dark:border-[#C5A15A]/20">
                    <h3 className="text-2xl font-extrabold text-[#222222] dark:text-slate-50">جدول مرن</h3>
                    <p className="text-lg text-[#555555] dark:text-slate-300 font-semibold">يناسبك</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
