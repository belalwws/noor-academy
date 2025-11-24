'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, User, Calendar, Heart, Sparkles, Quote, CheckCircle2 } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import Lottie from 'lottie-react';

const features = [
  {
    icon: User,
    title: 'متابعة فردية',
    description: 'اهتمام شخصي بكل طالبة لضمان أفضل النتائج',
    color: 'from-[#1e40af] to-[#2563eb]',
  },
  {
    icon: BookOpen,
    title: 'خطة مناسبة لمستواك',
    description: 'برنامج تعليمي مخصص حسب مستوى كل طالبة',
    color: 'from-[#2563eb] to-[#3b82f6]',
  },
  {
    icon: Calendar,
    title: 'مرونة كاملة في اختيار الأوقات',
    description: 'اختيار الأوقات التي تناسب جدولك اليومي',
    color: 'from-[#1e40af] to-[#2563eb]',
  },
  {
    icon: Heart,
    title: 'تشجيع مستمر وغرس حب القرآن',
    description: 'بيئة داعمة ومشجعة لتحفيز الطالبات',
    color: 'from-[#2563eb] to-[#C5A15A]',
  },
];

export const WomenAdultsSection: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [girlAnimation, setGirlAnimation] = useState<any>(null);

  useEffect(() => {
    fetch('/girl reciting Holy Quran.json')
      .then((res) => res.json())
      .then((data) => setGirlAnimation(data))
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
    <section id="women-adults" className="relative py-4 sm:py-5 md:py-6 lg:py-6 bg-white dark:bg-slate-950 overflow-hidden" dir="rtl">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, #1e40af 1px, transparent 1px), linear-gradient(-45deg, #1e40af 1px, transparent 1px)`,
          backgroundSize: '68px 68px'
        }} />
      </div>

      {/* Sophisticated Gradient Accents */}
      <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-gradient-to-br from-[#2563eb]/6 via-[#1e40af]/4 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-[#1e40af]/6 via-[#2563eb]/4 to-transparent rounded-full blur-[120px]" />

      <div className="container mx-auto max-w-6xl px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8 lg:gap-16 items-center mx-auto">
          {/* Illustration - Takes 5 columns */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-5 relative order-2 lg:order-1 hidden lg:block"
          >
            <div className="relative">
              {/* Multi-layer Glow Effects */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-full h-full max-w-lg bg-gradient-to-br from-[#2563eb]/18 to-[#1e40af]/12 rounded-full blur-3xl" />
                <div className="absolute w-[90%] h-[90%] bg-gradient-to-br from-[#C5A15A]/10 to-[#1e40af]/8 rounded-full blur-2xl" />
              </div>
              
              {/* Card - Enhanced */}
              <div className="relative bg-gradient-to-br from-white via-white to-[#2563eb]/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-10 shadow-2xl border-2 border-[#2563eb]/10 dark:border-blue-400/20 backdrop-blur-xl">
                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-[#2563eb]/10 via-[#1e40af]/6 to-transparent rounded-tr-3xl rounded-bl-full" />
                <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-[#C5A15A]/10 via-[#2563eb]/6 to-transparent rounded-bl-3xl rounded-tr-full" />
                
                {/* Content */}
                <div className="relative z-10 text-center space-y-6">
                  <motion.div
                    animate={{ 
                      y: [0, -15, 0],
                      rotate: [0, -4, 4, 0]
                    }}
                    transition={{ 
                      duration: 7, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="w-full h-80 mx-auto flex items-center justify-center relative"
                  >
                    {/* Glow Background for Animation - Blue theme (lighter blue) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-full h-full max-w-[300px] bg-gradient-to-br from-[#2563eb]/35 via-[#3b82f6]/30 to-[#2563eb]/25 rounded-full blur-3xl animate-pulse" />
                      <div className="absolute w-[85%] h-[85%] bg-gradient-to-br from-[#3b82f6]/25 via-[#60a5fa]/20 to-[#2563eb]/15 rounded-full blur-2xl" />
                    </div>
                    {girlAnimation ? (
                      <Lottie
                        animationData={girlAnimation}
                        loop={true}
                        className="w-full h-full relative z-10"
                      />
                    ) : (
                      <div className="w-40 h-40 mx-auto bg-gradient-to-br from-[#2563eb] to-[#1e40af] rounded-2xl flex items-center justify-center shadow-2xl relative z-10">
                        <div className="text-8xl">👩📖</div>
                      </div>
                    )}
                  </motion.div>
                  
                  <div className="space-y-2 pt-4 border-t-2 border-[#2563eb]/10 dark:border-blue-400/20">
                    <h3 className="text-2xl font-extrabold text-[#222222] dark:text-slate-50">بيئة هادئة</h3>
                    <p className="text-lg text-[#555555] dark:text-slate-300 font-semibold">ومحترفة</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content - Takes 7 columns */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-7 order-1 lg:order-2 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-r from-[#1e40af]/10 via-[#2563eb]/8 to-[#1e40af]/10 dark:from-[#1e40af]/20 dark:via-[#2563eb]/15 dark:to-[#1e40af]/20 px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full border border-[#1e40af]/20 dark:border-blue-400/30 shadow-lg backdrop-blur-sm text-xs sm:text-sm"
            >
              <Sparkles className="text-[#1e40af] dark:text-blue-400" size={18} />
              <span className="text-sm font-bold text-[#1e40af] dark:text-blue-400 tracking-wide">تعليم النساء</span>
            </motion.div>

            <h2 className="text-base sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.2] tracking-tight">
              <span className="text-[#222222] dark:text-slate-50 block mb-2 sm:mb-4">تعليم القرآن للنساء</span>
              <span className="text-[#1e40af] dark:text-blue-400 font-extrabold block my-2 sm:my-4">
                بيئة هادئة ومحترفة
              </span>
            </h2>
            
            <p className="hidden sm:block text-lg md:text-xl text-[#555555] dark:text-slate-300 leading-relaxed font-light">
              نقدم تجربة مميزة لحفظ القرآن عن بُعد مع نخبة من المعلمات المتقنات:
            </p>

            {/* Features Grid - Enhanced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 40, scale: 0.95 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative bg-gradient-to-br from-[#1e40af]/8 via-[#2563eb]/6 to-[#1e40af]/8 dark:from-[#1e40af]/15 dark:via-[#2563eb]/12 dark:to-[#1e40af]/15 rounded-xl p-2.5 sm:p-5 border-r-4 border-[#1e40af] dark:border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300"
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

            {/* Quote Box - Enhanced */}
            <div className="hidden sm:block relative bg-gradient-to-r from-[#C5A15A]/12 via-[#D4B16B]/10 to-[#C5A15A]/12 dark:from-[#C5A15A]/20 dark:via-[#D4B16B]/18 dark:to-[#C5A15A]/20 rounded-2xl p-6 border-r-4 border-[#C5A15A] dark:border-[#C5A15A] shadow-xl">
              <Quote className="absolute top-4 right-4 text-[#C5A15A] opacity-25" size={40} />
              <p className="text-lg md:text-xl italic text-[#1e40af] dark:text-blue-400 font-semibold leading-relaxed relative z-10">
                "وراء كل طالبة متقنة للقرآن، معلمة مخلصة تقودها بحب وصبر."
              </p>
            </div>

            {/* CTA Button - Enhanced */}
            <Button
              onClick={handleRegister}
              className="group relative bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#1e40af] hover:from-[#1e3a8a] hover:via-[#1e40af] hover:to-[#1e3a8a] text-white px-4 sm:px-10 py-2.5 sm:py-6 text-xs sm:text-base lg:text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-xl"
              size="lg"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <BookOpen className="ml-2 group-hover:rotate-12 transition-transform relative z-10" size={16} style={{ width: '16px', height: '16px' }} />
              <span className="relative z-10">ابدئي الآن</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
