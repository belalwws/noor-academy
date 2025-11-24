'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Gamepad2, Trophy, Target, Star, CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Lottie from 'lottie-react';

export const InteractiveGamesSection: React.FC = () => {
  const [bookLoadingAnimation, setBookLoadingAnimation] = useState<any>(null);

  useEffect(() => {
    fetch('/Book loading.json')
      .then((res) => res.json())
      .then((data) => setBookLoadingAnimation(data))
      .catch((err) => console.error('Error loading animation:', err));
  }, []);

  const features = [
    {
      icon: Gamepad2,
      text: 'تمارين تفاعلية متنوعة',
      description: 'أنواع متعددة من التمارين: اختيار من متعدد، صواب وخطأ، توصيل العناصر، وسحب وإفلات',
    },
    {
      icon: Target,
      text: 'نظام تدريب واختبارات',
      description: 'مستويات تدريبية متدرجة واختبارات شاملة تناسب جميع المستويات والقدرات',
    },
    {
      icon: Trophy,
      text: 'نظام المكافآت والتحفيز',
      description: 'احصل على نقاط ومكافآت عند إكمال التحديات مع مؤشرات تقدم واضحة تحفزك على الاستمرار في التعلم',
    },
    {
      icon: Star,
      text: 'تقييم فوري وتحليل الأداء',
      description: 'احصل على تقييم فوري لأدائك مع تحليل مفصل يوضح نقاط القوة والتحسين',
    },
  ];

  return (
    <section 
      id="interactive-games" 
      dir="rtl"
      className="relative py-12 md:py-16 bg-background-light dark:bg-slate-950 transition-colors duration-300 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-hero pattern-dots opacity-30 -z-10" />
      
      {/* Color Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1e40af]/10 via-[#1e40af]/5 to-transparent pointer-events-none -z-10" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#1e40af]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#C5A15A]/10 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-[#2563eb]/10 rounded-full blur-2xl animate-pulse delay-1000" />

      <div className="container mx-auto px-4 lg:px-8 py-8 relative z-10">
        {/* Header Section - Centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1e40af]/10 to-[#C5A15A]/10 text-[#1e40af] dark:text-blue-400 px-4 py-2.5 rounded-full text-sm font-semibold border border-[#1e40af]/20 dark:border-blue-400/30 shadow-sm mb-6"
          >
            <Gamepad2 size={18} />
            <span>ألعاب تفاعلية</span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-text-primary dark:text-slate-50 leading-tight mb-3 sm:mb-6"
          >
            <span className="text-[#1e40af] dark:text-blue-400 font-extrabold">
              تعلم ممتع
            </span>
            <br />
            <span className="text-text-primary dark:text-slate-50">من خلال الألعاب التفاعلية</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="hidden sm:block text-lg md:text-xl text-text-secondary dark:text-slate-300 leading-relaxed max-w-3xl mx-auto mb-4 sm:mb-8"
          >
            حوّل تعلمك إلى مغامرة تفاعلية ممتعة! استمتع بألعاب تعليمية مبتكرة تجمع بين المتعة والفائدة. 
            اختبر معلوماتك من خلال تمارين متنوعة تشمل الاختيار من متعدد، صواب وخطأ، والتوصيل. 
            احصل على تقييم فوري لأدائك وتابع تقدمك مع نظام النقاط والمكافآت الذي يحفزك على الاستمرار.
          </motion.p>
        </motion.div>

        {/* Main Content - Image in Center with Cards Around */}
        <div className="relative max-w-6xl mx-auto">
          {/* Image in Center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="relative w-full max-w-md mx-auto mb-8"
          >
            <div className="relative h-[200px] sm:h-[300px] md:h-[400px] flex items-center justify-center">
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-full h-full flex items-center justify-center"
              >
                {bookLoadingAnimation ? (
                  <Lottie
                    animationData={bookLoadingAnimation}
                    loop={true}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-pulse text-text-secondary">جاري التحميل...</div>
                  </div>
                )}
              </motion.div>

              {/* Central Glow Effect */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#1e40af] to-[#C5A15A] rounded-full blur-3xl opacity-10 animate-pulse -z-10" />
            </div>
          </motion.div>

          {/* Features Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-gradient-to-br from-[#1e40af]/5 to-[#C5A15A]/5 dark:from-slate-800 dark:to-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-[#1e40af]/20 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-14 md:h-14 rounded-xl bg-gradient-to-br from-[#1e40af]/10 to-[#C5A15A]/10 flex items-center justify-center border border-[#1e40af]/20 dark:border-blue-400/30 shadow-sm mb-2 sm:mb-4">
                  <feature.icon className="text-[#1e40af] dark:text-blue-400" size={20} style={{ width: '20px', height: '20px' }} />
                </div>
                <h3 className="text-xs sm:text-sm md:text-lg font-bold text-text-primary dark:text-slate-50 mb-1 sm:mb-2">
                  {feature.text}
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-text-secondary dark:text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA Button - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.1 }}
            className="flex justify-center"
          >
            <Link href="/interactive-learning">
              <Button variant="primary" size="lg" className="group shadow-lg hover:shadow-xl transition-all px-4 sm:px-6 py-2 sm:py-3">
                <span className="text-xs sm:text-base md:text-lg">تعلم الآن</span>
                <ArrowLeft className="mr-2 group-hover:translate-x-1 transition-transform" size={16} style={{ width: '16px', height: '16px' }} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
