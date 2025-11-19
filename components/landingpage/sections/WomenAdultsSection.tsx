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
    color: 'from-[#0A5734] to-[#4A8F5C]',
  },
  {
    icon: BookOpen,
    title: 'خطة مناسبة لمستواك',
    description: 'برنامج تعليمي مخصص حسب مستوى كل طالبة',
    color: 'from-[#4A8F5C] to-[#5BA86D]',
  },
  {
    icon: Calendar,
    title: 'مرونة كاملة في اختيار الأوقات',
    description: 'اختيار الأوقات التي تناسب جدولك اليومي',
    color: 'from-[#0A5734] to-[#4A8F5C]',
  },
  {
    icon: Heart,
    title: 'تشجيع مستمر وغرس حب القرآن',
    description: 'بيئة داعمة ومشجعة لتحفيز الطالبات',
    color: 'from-[#4A8F5C] to-[#C5A15A]',
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
    <section id="women-adults" className="relative py-8 md:py-12 lg:py-14 bg-white dark:bg-slate-950 overflow-hidden" dir="rtl">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, #0A5734 1px, transparent 1px), linear-gradient(-45deg, #0A5734 1px, transparent 1px)`,
          backgroundSize: '68px 68px'
        }} />
      </div>

      {/* Sophisticated Gradient Accents */}
      <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-gradient-to-br from-[#4A8F5C]/6 via-[#0A5734]/4 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-[#0A5734]/6 via-[#4A8F5C]/4 to-transparent rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
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
                <div className="absolute w-full h-full max-w-lg bg-gradient-to-br from-[#4A8F5C]/18 to-[#0A5734]/12 rounded-full blur-3xl" />
                <div className="absolute w-[90%] h-[90%] bg-gradient-to-br from-[#C5A15A]/10 to-[#0A5734]/8 rounded-full blur-2xl" />
              </div>
              
              {/* Card - Enhanced */}
              <div className="relative bg-gradient-to-br from-white via-white to-[#4A8F5C]/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-10 shadow-2xl border-2 border-[#4A8F5C]/10 dark:border-[#4A8F5C]/20 backdrop-blur-xl">
                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-[#4A8F5C]/10 via-[#0A5734]/6 to-transparent rounded-tr-3xl rounded-bl-full" />
                <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-[#C5A15A]/10 via-[#4A8F5C]/6 to-transparent rounded-bl-3xl rounded-tr-full" />
                
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
                    className="w-full h-80 mx-auto flex items-center justify-center"
                  >
                    {girlAnimation ? (
                      <Lottie
                        animationData={girlAnimation}
                        loop={true}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-40 h-40 mx-auto bg-gradient-to-br from-[#4A8F5C] to-[#0A5734] rounded-2xl flex items-center justify-center shadow-2xl">
                        <div className="text-8xl">👩📖</div>
                      </div>
                    )}
                  </motion.div>
                  
                  <div className="space-y-2 pt-4 border-t-2 border-[#4A8F5C]/10 dark:border-[#4A8F5C]/20">
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
            className="lg:col-span-7 order-1 lg:order-2 space-y-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#0A5734]/10 via-[#4A8F5C]/8 to-[#0A5734]/10 dark:from-[#0A5734]/20 dark:via-[#4A8F5C]/15 dark:to-[#0A5734]/20 px-6 py-3 rounded-full border border-[#0A5734]/20 dark:border-[#4A8F5C]/30 shadow-lg backdrop-blur-sm"
            >
              <Sparkles className="text-[#0A5734] dark:text-[#4A8F5C]" size={18} />
              <span className="text-sm font-bold text-[#0A5734] dark:text-[#4A8F5C] tracking-wide">تعليم النساء</span>
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.2] tracking-tight">
              <span className="text-[#222222] dark:text-slate-50 block mb-4">تعليم القرآن للنساء</span>
              <span className="text-[#0A5734] dark:text-[#4A8F5C] font-extrabold block my-4">
                بيئة هادئة ومحترفة
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-[#555555] dark:text-slate-300 leading-relaxed font-light">
              نقدم تجربة مميزة لحفظ القرآن عن بُعد مع نخبة من المعلمات المتقنات:
            </p>

            {/* Features Grid - Enhanced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 40, scale: 0.95 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative bg-gradient-to-br from-[#0A5734]/8 via-[#4A8F5C]/6 to-[#0A5734]/8 dark:from-[#0A5734]/15 dark:via-[#4A8F5C]/12 dark:to-[#0A5734]/15 rounded-xl p-5 border-r-4 border-[#0A5734] dark:border-[#4A8F5C] shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 8 }}
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      >
                        <Icon className="text-white" size={28} />
                      </motion.div>
                      <div className="flex-1 pt-1">
                        <h3 className="text-base lg:text-lg font-extrabold text-[#222222] dark:text-slate-50 mb-1.5 leading-tight">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-[#555555] dark:text-slate-300 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quote Box - Enhanced */}
            <div className="relative bg-gradient-to-r from-[#C5A15A]/12 via-[#D4B16B]/10 to-[#C5A15A]/12 dark:from-[#C5A15A]/20 dark:via-[#D4B16B]/18 dark:to-[#C5A15A]/20 rounded-2xl p-6 border-r-4 border-[#C5A15A] dark:border-[#C5A15A] shadow-xl">
              <Quote className="absolute top-4 right-4 text-[#C5A15A] opacity-25" size={40} />
              <p className="text-lg md:text-xl italic text-[#0A5734] dark:text-[#4A8F5C] font-semibold leading-relaxed relative z-10">
                "وراء كل طالبة متقنة للقرآن، معلمة مخلصة تقودها بحب وصبر."
              </p>
            </div>

            {/* CTA Button - Enhanced */}
            <Button
              onClick={handleRegister}
              className="group relative bg-gradient-to-r from-[#0A5734] via-[#4A8F5C] to-[#0A5734] hover:from-[#073D24] hover:via-[#3A7148] hover:to-[#073D24] text-white px-10 py-6 text-base lg:text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-xl"
              size="lg"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <BookOpen className="ml-2 group-hover:rotate-12 transition-transform relative z-10" size={20} />
              <span className="relative z-10">ابدئي الآن</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
