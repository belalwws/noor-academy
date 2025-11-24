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
    color: 'from-[#1e40af] to-[#2563eb]',
  },
  {
    icon: Image,
    title: 'ربط الآيات بالصور والمواقف',
    description: 'نستخدم الصور والقصص لربط الآيات بمواقف حياتية يسهل تذكرها',
    color: 'from-[#2563eb] to-[#3b82f6]',
  },
  {
    icon: Headphones,
    title: 'الاستماع والترديد لتثبيت الحفظ',
    description: 'جلسات استماع وترديد منتظمة لضمان تثبيت الحفظ بشكل صحيح',
    color: 'from-[#1e40af] to-[#2563eb]',
  },
  {
    icon: BookOpen,
    title: 'البدء بالسور القصيرة لزيادة الدافعية',
    description: 'نبدأ بالسور القصيرة لبناء الثقة وزيادة الدافعية لدى الطفل',
    color: 'from-[#2563eb] to-[#C5A15A]',
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
    <section id="kids-learning" className="relative py-2 sm:py-4 md:py-5 lg:py-5 bg-gradient-to-b from-white via-[#1e40af]/4 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden" dir="rtl">
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

      <div className="container mx-auto max-w-6xl px-3 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-3 sm:gap-6 md:gap-8 lg:gap-16 items-center mx-auto">
          {/* Content - Takes 7 columns */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-7 space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-4"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center gap-1 sm:gap-2.5 bg-gradient-to-r from-[#1e40af]/10 via-[#2563eb]/8 to-[#1e40af]/10 dark:from-[#1e40af]/20 dark:via-[#2563eb]/15 dark:to-[#1e40af]/20 px-2 sm:px-5 lg:px-6 py-1 sm:py-2 lg:py-3 rounded-full border border-[#1e40af]/20 dark:border-blue-400/30 shadow-lg backdrop-blur-sm text-[10px] sm:text-sm"
            >
              <Sparkles className="text-[#1e40af] dark:text-blue-400" size={12} style={{ width: '12px', height: '12px' }} />
              <span className="font-bold text-[#1e40af] dark:text-blue-400 tracking-wide">تعليم الأطفال</span>
            </motion.div>

            <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold leading-[1.2] tracking-tight">
              <span className="text-[#222222] dark:text-slate-50 block mb-1 sm:mb-2 md:mb-2 lg:mb-3">هل ترغبين أن يُقبل طفلك</span>
              <span className="text-[#1e40af] dark:text-blue-400 font-extrabold block my-1 sm:my-2 md:my-2 lg:my-3">
                على القرآن بحب؟
              </span>
            </h2>
            
            <p className="hidden sm:block text-sm md:text-base text-[#555555] dark:text-slate-300 leading-relaxed font-light">
              كثير من الأمهات يشتكين من صعوبة الحفظ لدى أطفالهن، لكن في <span className="font-bold text-[#1e40af] dark:text-blue-400">أكاديمية نور</span> جعلنا الحفظ رحلة ممتعة مليئة بالتحفيز والبهجة 💚
            </p>

            {/* Highlight Box - Enhanced */}
            <div className="bg-gradient-to-r from-[#1e40af]/12 via-[#2563eb]/10 to-[#1e40af]/12 dark:from-[#1e40af]/20 dark:via-[#2563eb]/18 dark:to-[#1e40af]/20 rounded-lg p-3 border-r-4 border-[#1e40af] dark:border-blue-400 shadow-xl">
              <p className="text-xs md:text-base font-bold text-[#1e40af] dark:text-blue-400 leading-relaxed">
                نستخدم أساليب تربوية حديثة تُحبّب الطفل في الحفظ:
              </p>
            </div>

            {/* Methods Grid - Enhanced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
              {methods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -40, scale: 0.95 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative bg-white dark:bg-slate-900 rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#1e40af]/10 dark:border-slate-700/50 hover:border-[#1e40af]/30 dark:hover:border-blue-400/30"
                  >
                    <div className="flex items-start gap-2.5">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 8 }}
                        className={`w-10 h-10 rounded-md bg-gradient-to-br ${method.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      >
                        <Icon className="text-white" size={18} />
                      </motion.div>
                      <div className="flex-1 pt-0.5">
                        <h3 className="text-xs lg:text-base font-extrabold text-[#222222] dark:text-slate-50 mb-0.5 leading-tight">
                          {method.title}
                        </h3>
                        <p className="text-[10px] text-[#555555] dark:text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-none">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Goal Box - Enhanced */}
            <div className="hidden sm:block bg-gradient-to-r from-[#C5A15A]/12 via-[#D4B16B]/10 to-[#C5A15A]/12 dark:from-[#C5A15A]/20 dark:via-[#D4B16B]/18 dark:to-[#C5A15A]/20 rounded-lg p-3 border-r-4 border-[#C5A15A] dark:border-[#C5A15A] shadow-xl">
              <p className="text-sm md:text-lg font-extrabold text-[#1e40af] dark:text-blue-400 leading-relaxed">
                هدفنا: زرع حب القرآن قبل حفظه.
              </p>
            </div>

            {/* CTA Button - Enhanced */}
            <Button
              onClick={handleRegister}
              className="group relative bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#1e40af] hover:from-[#1e3a8a] hover:via-[#1e40af] hover:to-[#1e3a8a] text-white px-5 py-3 text-xs lg:text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-xl"
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
                <div className="absolute w-full h-full max-w-lg bg-gradient-to-br from-[#1e40af]/18 to-[#2563eb]/12 rounded-full blur-3xl" />
                <div className="absolute w-[90%] h-[90%] bg-gradient-to-br from-[#C5A15A]/10 to-[#2563eb]/8 rounded-full blur-2xl" />
              </div>
              
              {/* Card - Enhanced */}
              <div className="relative bg-gradient-to-br from-white via-white to-[#1e40af]/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-10 shadow-2xl border-2 border-[#1e40af]/10 dark:border-blue-400/20 backdrop-blur-xl">
                {/* Decorative Corners */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#1e40af]/10 via-[#2563eb]/6 to-transparent rounded-tl-3xl rounded-br-full" />
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-[#C5A15A]/10 via-[#2563eb]/6 to-transparent rounded-bl-3xl rounded-tl-full" />
                
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
                    className="w-full h-80 mx-auto flex items-center justify-center relative"
                  >
                    {/* Glow Background for Animation - Blue theme */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-full h-full max-w-[300px] bg-gradient-to-br from-[#1e40af]/35 via-[#2563eb]/30 to-[#1e40af]/25 rounded-full blur-3xl animate-pulse" />
                      <div className="absolute w-[85%] h-[85%] bg-gradient-to-br from-[#2563eb]/25 via-[#3b82f6]/20 to-[#2563eb]/15 rounded-full blur-2xl" />
                    </div>
                    {ramadanAnimation ? (
                      <Lottie
                        animationData={ramadanAnimation}
                        loop={true}
                        className="w-full h-full relative z-10"
                      />
                    ) : (
                      <div className="w-40 h-40 mx-auto bg-gradient-to-br from-[#1e40af] to-[#2563eb] rounded-2xl flex items-center justify-center shadow-2xl relative z-10">
                        <div className="text-8xl">👶📖</div>
                      </div>
                    )}
                  </motion.div>
                  
                  <div className="space-y-2 pt-4 border-t-2 border-[#1e40af]/10 dark:border-blue-400/20">
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
