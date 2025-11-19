'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, Image, Headphones, BookMarked, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import Lottie from 'lottie-react';

const methods = [
  {
    icon: BookMarked,
    title: 'تقسيم السور إلى مقاطع صغيرة',
    description: 'نقسم السور إلى أجزاء صغيرة يسهل على الطفل حفظها وتذكرها',
    color: 'from-[#0A5734] to-[#4A8F5C]',
  },
  {
    icon: Image,
    title: 'ربط الآيات بالصور والمواقف',
    description: 'نستخدم الصور والقصص لربط الآيات بمواقف حياتية يسهل تذكرها',
    color: 'from-[#4A8F5C] to-[#5BA86D]',
  },
  {
    icon: Headphones,
    title: 'الاستماع والترديد لتثبيت الحفظ',
    description: 'جلسات استماع وترديد منتظمة لضمان تثبيت الحفظ بشكل صحيح',
    color: 'from-[#0A5734] to-[#4A8F5C]',
  },
  {
    icon: BookOpen,
    title: 'البدء بالسور القصيرة لزيادة الدافعية',
    description: 'نبدأ بالسور القصيرة لبناء الثقة وزيادة الدافعية لدى الطفل',
    color: 'from-[#4A8F5C] to-[#C5A15A]',
  },
];

export const KidsLearningSection: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [ramadanAnimation, setRamadanAnimation] = useState<any>(null);

  useEffect(() => {
    fetch('/Koran im Ramadan lesen.json')
      .then((res) => res.json())
      .then((data) => setRamadanAnimation(data))
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
    <section id="kids-learning" className="relative py-4 md:py-6 lg:py-6 bg-gradient-to-b from-white via-[#0A5734]/4 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden" dir="rtl">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #0A5734 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      {/* Sophisticated Gradient Accents */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-[#0A5734]/6 via-[#4A8F5C]/4 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-[#C5A15A]/6 via-[#4A8F5C]/4 to-transparent rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Content - Takes 7 columns */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-7 space-y-3 sm:space-y-4 lg:space-y-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-r from-[#0A5734]/10 via-[#4A8F5C]/8 to-[#0A5734]/10 dark:from-[#0A5734]/20 dark:via-[#4A8F5C]/15 dark:to-[#0A5734]/20 px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full border border-[#0A5734]/20 dark:border-[#4A8F5C]/30 shadow-lg backdrop-blur-sm text-xs sm:text-sm"
            >
              <Sparkles className="text-[#0A5734] dark:text-[#4A8F5C]" size={14} style={{ width: '14px', height: '14px' }} />
              <span className="font-bold text-[#0A5734] dark:text-[#4A8F5C] tracking-wide">تعليم الأطفال</span>
            </motion.div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.2] tracking-tight">
              <span className="text-[#222222] dark:text-slate-50 block mb-2 sm:mb-3 lg:mb-4">هل ترغبين أن يُقبل طفلك</span>
              <span className="text-[#0A5734] dark:text-[#4A8F5C] font-extrabold block my-2 sm:my-3 lg:my-4">
                على القرآن بحب؟
              </span>
            </h2>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#555555] dark:text-slate-300 leading-relaxed font-light">
              كثير من الأمهات يشتكين من صعوبة الحفظ لدى أطفالهن، لكن في <span className="font-bold text-[#0A5734] dark:text-[#4A8F5C]">أكاديمية نور</span> جعلنا الحفظ رحلة ممتعة مليئة بالتحفيز والبهجة 💚
            </p>

            {/* Highlight Box - Enhanced */}
            <div className="bg-gradient-to-r from-[#0A5734]/12 via-[#4A8F5C]/10 to-[#0A5734]/12 dark:from-[#0A5734]/20 dark:via-[#4A8F5C]/18 dark:to-[#0A5734]/20 rounded-2xl p-6 border-r-4 border-[#0A5734] dark:border-[#4A8F5C] shadow-xl">
              <p className="text-lg md:text-xl font-bold text-[#0A5734] dark:text-[#4A8F5C] leading-relaxed">
                نستخدم أساليب تربوية حديثة تُحبّب الطفل في الحفظ:
              </p>
            </div>

            {/* Methods Grid - Enhanced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {methods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -40, scale: 0.95 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative bg-white dark:bg-slate-900 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#0A5734]/10 dark:border-slate-700/50 hover:border-[#0A5734]/30 dark:hover:border-[#4A8F5C]/30"
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 8 }}
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      >
                        <Icon className="text-white" size={28} />
                      </motion.div>
                      <div className="flex-1 pt-1">
                        <h3 className="text-base lg:text-lg font-extrabold text-[#222222] dark:text-slate-50 mb-1.5 leading-tight">
                          {method.title}
                        </h3>
                        <p className="text-sm text-[#555555] dark:text-slate-300 leading-relaxed">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Goal Box - Enhanced */}
            <div className="bg-gradient-to-r from-[#C5A15A]/12 via-[#D4B16B]/10 to-[#C5A15A]/12 dark:from-[#C5A15A]/20 dark:via-[#D4B16B]/18 dark:to-[#C5A15A]/20 rounded-2xl p-6 border-r-4 border-[#C5A15A] dark:border-[#C5A15A] shadow-xl">
              <p className="text-xl md:text-2xl font-extrabold text-[#0A5734] dark:text-[#4A8F5C] leading-relaxed">
                هدفنا: زرع حب القرآن قبل حفظه.
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
              <span className="relative z-10">سجّلي الآن</span>
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
                <div className="absolute w-full h-full max-w-lg bg-gradient-to-br from-[#0A5734]/18 to-[#4A8F5C]/12 rounded-full blur-3xl" />
                <div className="absolute w-[90%] h-[90%] bg-gradient-to-br from-[#C5A15A]/10 to-[#4A8F5C]/8 rounded-full blur-2xl" />
              </div>
              
              {/* Card - Enhanced */}
              <div className="relative bg-gradient-to-br from-white via-white to-[#0A5734]/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-10 shadow-2xl border-2 border-[#0A5734]/10 dark:border-[#4A8F5C]/20 backdrop-blur-xl">
                {/* Decorative Corners */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#0A5734]/10 via-[#4A8F5C]/6 to-transparent rounded-tl-3xl rounded-br-full" />
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-[#C5A15A]/10 via-[#4A8F5C]/6 to-transparent rounded-bl-3xl rounded-tl-full" />
                
                {/* Content */}
                <div className="relative z-10 text-center space-y-6">
                  <motion.div
                    animate={{ 
                      y: [0, -15, 0],
                      rotate: [0, 3, -3, 0]
                    }}
                    transition={{ 
                      duration: 6, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="w-full h-80 mx-auto flex items-center justify-center"
                  >
                    {ramadanAnimation ? (
                      <Lottie
                        animationData={ramadanAnimation}
                        loop={true}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-40 h-40 mx-auto bg-gradient-to-br from-[#0A5734] to-[#4A8F5C] rounded-2xl flex items-center justify-center shadow-2xl">
                        <div className="text-8xl">👶📖</div>
                      </div>
                    )}
                  </motion.div>
                  
                  <div className="space-y-2 pt-4 border-t-2 border-[#0A5734]/10 dark:border-[#4A8F5C]/20">
                    <h3 className="text-2xl font-extrabold text-[#222222] dark:text-slate-50">تعليم ممتع</h3>
                    <p className="text-lg text-[#555555] dark:text-slate-300 font-semibold">لأطفالك</p>
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
