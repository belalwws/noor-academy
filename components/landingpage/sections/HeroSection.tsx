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
    { icon: Users, label: 'طلاب', value: '500+', color: 'from-[#0A5734] to-[#4A8F5C]' },
    { icon: BookMarked, label: 'دورة', value: '50+', color: 'from-[#4A8F5C] to-[#5BA86D]' },
    { icon: Award, label: 'معلم', value: '30+', color: 'from-[#C5A15A] to-[#D4B16B]' },
  ];

  return (
    <section id="home" className="relative min-h-[60vh] sm:min-h-[65vh] md:min-h-[68vh] lg:min-h-[70vh] flex items-center mt-20 sm:mt-24 md:mt-20 lg:mt-8 pt-8 sm:pt-10 md:pt-12 lg:pt-12 pb-6 sm:pb-8 md:pb-10 lg:pb-8 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300" dir="rtl">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #0A5734 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      {/* Sophisticated Gradient Overlays */}
      <div className="absolute top-0 right-0 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-gradient-to-br from-[#0A5734]/6 via-[#4A8F5C]/4 to-transparent rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[350px] sm:w-[500px] lg:w-[700px] h-[350px] sm:h-[500px] lg:h-[700px] bg-gradient-to-tr from-[#C5A15A]/5 via-[#4A8F5C]/3 to-transparent rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3" />
      
      {/* Elegant Decorative Lines - Hidden on mobile */}
      <div className="hidden md:block absolute top-32 right-24 w-px h-40 bg-gradient-to-b from-[#0A5734] via-[#4A8F5C] to-transparent opacity-15" />
      <div className="hidden md:block absolute bottom-32 left-24 w-40 h-px bg-gradient-to-r from-[#C5A15A] via-[#4A8F5C] to-transparent opacity-15" />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-8 py-3 sm:py-4 md:py-5 lg:py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
          {/* Content - Takes 7 columns */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="lg:col-span-7 text-center md:text-center lg:text-right space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6"
          >
            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.2] sm:leading-[1.3] md:leading-[1.35] lg:leading-[1.4] tracking-tight space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2"
            >
              <span className="text-[#222222] dark:text-slate-50 block">مع أكاديمية نور…</span>
              <span className="block text-[#0A5734] dark:text-[#4A8F5C] font-extrabold">
                اجعل لأبنائك نورًا يهتدي به
              </span>
              <span className="text-[#222222] dark:text-slate-50 block">في دروب الحياة</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="text-sm sm:text-base md:text-xl lg:text-2xl text-[#555555] dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light px-2 sm:px-0 md:px-4 lg:px-0 mb-2 sm:mb-0"
            >
              بيئة قرآنية تربوية متكاملة تجمع بين <span className="font-semibold text-[#0A5734] dark:text-[#4A8F5C]">الإتقان</span> و<span className="font-semibold text-[#0A5734] dark:text-[#4A8F5C]">العصرية</span> بإشراف نخبة من المعلمين والمعلمات.
            </motion.p>

            {/* Stats - Enhanced Design */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex flex-wrap items-center justify-center md:justify-center lg:justify-start gap-2 sm:gap-3 md:gap-4 lg:gap-6 pt-3 sm:pt-4 md:pt-5 lg:pt-4 border-t-2 border-[#0A5734]/10 dark:border-[#4A8F5C]/20"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.7, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.05, duration: 0.3 }}
                    className="group relative"
                  >
                    <div className="relative bg-gradient-to-br from-white to-[#0A5734]/5 dark:from-slate-900 dark:to-slate-800 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-3.5 lg:p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#0A5734]/10 dark:border-[#4A8F5C]/20 min-w-[70px] sm:min-w-[90px] md:min-w-[95px] lg:min-w-[100px]">
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />
                      <div className="relative z-10 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1.5">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                            <Icon className="text-white" size={18} />
                          </div>
                          <span className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-extrabold text-[#0A5734] dark:text-[#4A8F5C]">{stat.value}</span>
                        </div>
                        <span className="text-[10px] sm:text-xs lg:text-sm text-[#555555] dark:text-slate-400 font-semibold">{stat.label}</span>
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
              className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-4 justify-center md:justify-center lg:justify-start pt-3 sm:pt-4 md:pt-5 lg:pt-4 w-full sm:w-auto"
            >
              <Button 
                onClick={handleBookTrial}
                className="group relative bg-gradient-to-r from-[#0A5734] via-[#4A8F5C] to-[#0A5734] hover:from-[#073D24] hover:via-[#3A7148] hover:to-[#073D24] text-white px-5 sm:px-7 lg:px-10 py-3 sm:py-4 lg:py-6 text-xs sm:text-sm lg:text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden w-full sm:w-auto"
                size="lg"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <BookOpen className="ml-2 group-hover:rotate-12 transition-transform relative z-10" size={20} />
                <span className="relative z-10">سجل الآن</span>
              </Button>
              <Button 
                onClick={handleBrowseCourses}
                variant="outline"
                className="group border-2 border-[#0A5734] dark:border-[#4A8F5C] bg-transparent text-[#0A5734] dark:text-[#4A8F5C] hover:bg-[#0A5734]/10 dark:hover:bg-[#4A8F5C]/10 px-5 sm:px-7 lg:px-10 py-3 sm:py-4 lg:py-6 text-xs sm:text-sm lg:text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                size="lg"
              >
                <Eye className="ml-2 group-hover:scale-110 transition-transform relative z-10" size={20} />
                <span className="relative z-10">تصفح الدورات</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Visual Element - Takes 5 columns */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5 relative hidden lg:flex items-center justify-center"
          >
            {/* Multi-layer Glow Effects */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-full h-full max-w-lg bg-gradient-to-br from-[#0A5734]/15 to-[#4A8F5C]/10 rounded-full blur-3xl" />
              <div className="absolute w-[90%] h-[90%] bg-gradient-to-br from-[#C5A15A]/8 to-[#4A8F5C]/6 rounded-full blur-2xl" />
            </div>
            
            {/* Main Card */}
            <div className="relative w-full max-w-sm">
              <div className="relative bg-gradient-to-br from-white via-white to-[#0A5734]/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-8 lg:p-10 shadow-2xl border-2 border-[#0A5734]/10 dark:border-[#4A8F5C]/20 backdrop-blur-xl">
                {/* Decorative Corners */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#0A5734]/8 via-[#4A8F5C]/5 to-transparent rounded-tl-3xl rounded-br-full" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#C5A15A]/8 via-[#4A8F5C]/5 to-transparent rounded-bl-3xl rounded-tl-full" />
                
                {/* Content */}
                <div className="relative z-10 text-center space-y-6">
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="w-full h-64 mx-auto flex items-center justify-center"
                  >
                    {quranAnimation ? (
                      <Lottie
                        animationData={quranAnimation}
                        loop={true}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#0A5734] to-[#4A8F5C] rounded-2xl flex items-center justify-center shadow-2xl">
                        <BookOpen className="text-white" size={64} />
                      </div>
                    )}
                  </motion.div>
                  
                  <div className="space-y-2 pt-3 border-t-2 border-[#0A5734]/10 dark:border-[#4A8F5C]/20">
                    <h3 className="text-2xl font-extrabold text-[#222222] dark:text-slate-50">أكاديمية نور</h3>
                    <p className="text-base text-[#555555] dark:text-slate-300 font-semibold">نور يهتدي به في دروب الحياة</p>
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
