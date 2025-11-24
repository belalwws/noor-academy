'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, Award, Users, BookMarked, ArrowLeft, Eye } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import Lottie from 'lottie-react';

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [quranAnimation, setQuranAnimation] = useState<any>(null);

  useEffect(() => {
    fetch('/Reading in Quran.json')
      .then((res) => res.json())
      .then((data) => setQuranAnimation(data))
      .catch((err) => console.error('Error loading animation:', err));
  }, []);

  const handleBookTrial = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/register');
    }
  };

  const handleBrowseCourses = () => {
    router.push('/courses');
  };

  const stats = [
    { icon: Users, label: 'طلاب', value: '500+', color: 'from-[#1e40af] to-[#2563eb]' },
    { icon: BookMarked, label: 'دورة', value: '50+', color: 'from-[#2563eb] to-[#3b82f6]' },
    { icon: Award, label: 'معلم', value: '30+', color: 'from-[#C5A15A] to-[#D4B16B]' },
  ];

  return (
    <section id="home" className="relative min-h-[60vh] sm:min-h-[65vh] md:min-h-[70vh] lg:min-h-[60vh] flex items-center mt-12 sm:mt-16 md:mt-16 lg:mt-6 pt-4 sm:pt-6 md:pt-8 lg:pt-10 pb-3 sm:pb-4 md:pb-8 lg:pb-6 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300" dir="rtl">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #1e40af 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      {/* Sophisticated Gradient Overlays */}
      <div className="absolute top-0 right-0 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-gradient-to-br from-[#1e40af]/6 via-[#2563eb]/4 to-transparent rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[350px] sm:w-[500px] lg:w-[700px] h-[350px] sm:h-[500px] lg:h-[700px] bg-gradient-to-tr from-[#C5A15A]/5 via-[#2563eb]/3 to-transparent rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3" />
      
      {/* Elegant Decorative Lines - Hidden on mobile */}
      <div className="hidden md:block absolute top-32 right-24 w-px h-40 bg-gradient-to-b from-[#1e40af] via-[#2563eb] to-transparent opacity-15" />
      <div className="hidden md:block absolute bottom-32 left-24 w-40 h-px bg-gradient-to-r from-[#C5A15A] via-[#2563eb] to-transparent opacity-15" />

      <div className="container mx-auto max-w-6xl px-3 sm:px-6 md:px-8 lg:px-8 py-2 sm:py-4 md:py-5 lg:py-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8 lg:gap-10 items-center">
          {/* Content - Takes full width on mobile/tablet, 7 columns on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="md:col-span-1 lg:col-span-7 text-center md:text-center lg:text-right space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-4 mt-6 sm:mt-0 lg:mt-8"
          >
            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-extrabold leading-[1.2] sm:leading-[1.3] md:leading-[1.35] lg:leading-[1.4] tracking-tight space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2"
            >
              <span className="text-[#222222] dark:text-slate-50 block">مع أكاديمية نور…</span>
              <span className="block text-[#1e40af] dark:text-blue-400 font-extrabold">
                اجعل لأبنائك نورًا يهتدي به
              </span>
              <span className="text-[#222222] dark:text-slate-50 block">في دروب الحياة</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="text-xs sm:text-sm md:text-base lg:text-lg text-[#555555] dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light px-1 sm:px-0 md:px-4 lg:px-0 mb-1.5 sm:mb-0"
            >
              <span className="hidden sm:inline">بيئة قرآنية تربوية متكاملة تجمع بين <span className="font-semibold text-[#1e40af] dark:text-blue-400">الإتقان</span> و<span className="font-semibold text-[#1e40af] dark:text-blue-400">العصرية</span> بإشراف نخبة من المعلمين والمعلمات.</span>
              <span className="sm:hidden">بيئة قرآنية تربوية متكاملة</span>
            </motion.p>

            {/* Stats - Enhanced Design - Better layout for mobile/tablet */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="grid grid-cols-3 md:flex md:flex-wrap items-center justify-center md:justify-center lg:justify-start gap-2 sm:gap-3 md:gap-4 lg:gap-6 pt-3 sm:pt-4 md:pt-5 lg:pt-4 border-t-2 border-[#1e40af]/10 dark:border-blue-400/20"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.7, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.05, duration: 0.3 }}
                    className="group relative w-full md:w-auto"
                  >
                    <div className="relative bg-gradient-to-br from-white to-[#1e40af]/5 dark:from-slate-900 dark:to-slate-800 rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-2.5 lg:p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#1e40af]/10 dark:border-blue-400/20">
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />
                      <div className="relative z-10 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                            <Icon className="text-white" size={14} />
                          </div>
                          <span className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-[#1e40af] dark:text-blue-400">{stat.value}</span>
                        </div>
                        <span className="text-[9px] sm:text-[10px] lg:text-xs text-[#555555] dark:text-slate-400 font-semibold">{stat.label}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* CTA Buttons - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 md:gap-4 lg:gap-4 justify-center md:justify-center lg:justify-start pt-2 sm:pt-4 md:pt-5 lg:pt-4 w-full sm:w-auto"
            >
              <Button 
                onClick={handleBookTrial}
                className="group relative bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#1e40af] hover:from-[#1e3a8a] hover:via-[#1e40af] hover:to-[#1e3a8a] text-white px-4 sm:px-5 lg:px-7 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden w-full sm:w-auto"
                size="lg"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <BookOpen className="ml-1.5 sm:ml-2 group-hover:rotate-12 transition-transform relative z-10" size={14} />
                <span className="relative z-10">سجل الآن</span>
              </Button>
              <Button 
                onClick={handleBrowseCourses}
                variant="outline"
                className="group border-2 border-[#1e40af] dark:border-blue-400 bg-transparent text-[#1e40af] dark:text-blue-400 hover:bg-[#1e40af]/10 dark:hover:bg-blue-400/10 px-4 sm:px-5 lg:px-7 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                size="lg"
              >
                <Eye className="ml-1.5 sm:ml-2 group-hover:scale-110 transition-transform relative z-10" size={14} />
                <span className="relative z-10">تصفح الدورات</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Visual Element - Shows on mobile/tablet too, takes 5 columns on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="md:col-span-1 lg:col-span-5 relative flex items-center justify-center order-first md:order-last mt-4 sm:mt-0"
          >
            {/* Multi-layer Glow Effects */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-full h-full max-w-lg bg-gradient-to-br from-[#1e40af]/15 to-[#2563eb]/10 rounded-full blur-3xl" />
              <div className="absolute w-[90%] h-[90%] bg-gradient-to-br from-[#C5A15A]/8 to-[#2563eb]/6 rounded-full blur-2xl" />
            </div>
            
            {/* Main Card - Responsive sizing */}
            <div className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-sm">
              <div className="relative bg-gradient-to-br from-white via-white to-[#1e40af]/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-2xl border-2 border-[#1e40af]/10 dark:border-blue-400/20 backdrop-blur-xl">
                {/* Decorative Corners */}
                <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-bl from-[#1e40af]/8 via-[#2563eb]/5 to-transparent rounded-tl-xl sm:rounded-tl-2xl rounded-br-full" />
                <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-[#C5A15A]/8 via-[#2563eb]/5 to-transparent rounded-bl-xl sm:rounded-bl-2xl rounded-tl-full" />
                
                {/* Content */}
                <div className="relative z-10 text-center space-y-3 sm:space-y-4">
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="w-full h-32 sm:h-40 md:h-48 mx-auto flex items-center justify-center relative"
                  >
                    {/* Glow Background for Animation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-full h-full max-w-[150px] sm:max-w-[200px] bg-gradient-to-br from-[#1e40af]/30 via-[#2563eb]/25 to-[#1e40af]/20 rounded-full blur-2xl animate-pulse" />
                      <div className="absolute w-[80%] h-[80%] bg-gradient-to-br from-[#2563eb]/20 via-[#3b82f6]/15 to-[#2563eb]/10 rounded-full blur-xl" />
                    </div>
                    {quranAnimation ? (
                      <Lottie
                        animationData={quranAnimation}
                        loop={true}
                        className="w-full h-full relative z-10"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-[#1e40af] to-[#2563eb] rounded-xl flex items-center justify-center shadow-2xl relative z-10">
                        <BookOpen className="text-white" size={40} />
                      </div>
                    )}
                  </motion.div>
                  
                  <div className="space-y-1 sm:space-y-1.5 pt-2 border-t-2 border-[#1e40af]/10 dark:border-blue-400/20">
                    <h3 className="text-base sm:text-lg font-extrabold text-[#222222] dark:text-slate-50">أكاديمية نور</h3>
                    <p className="text-xs sm:text-sm text-[#555555] dark:text-slate-300 font-semibold">نور يهتدي به في دروب الحياة</p>
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
