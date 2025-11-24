'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlayCircle, Video, Clock, Rewind, BookOpen, Users, MessageCircle, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const CoursesSection: React.FC = () => {
  const courses = [
    {
      type: 'recorded',
      icon: PlayCircle,
      badge: 'دورات مسجلة',
      title: 'تعلم بمرونة',
      subtitle: 'في الوقت الذي يناسبك',
      description: 'استمتع بتجربة تعليمية مرنة مع دوراتنا المسجلة عالية الجودة. تعلم في الوقت والمكان الذي يناسبك، وأعد مشاهدة الدروس متى احتجت.',
      features: [
        { icon: Clock, text: 'تعلم في الوقت المناسب لك' },
        { icon: Rewind, text: 'إعادة المشاهدة متى شئت' },
        { icon: BookOpen, text: 'محتوى منظم ومتاح دائماً' },
        { icon: PlayCircle, text: 'جودة عالية في التسجيل' },
      ],
      link: '/recorded-courses',
      gradient: 'from-[#1e40af] to-[#2563eb]',
      bgGradient: 'from-[#1e40af]/10 to-[#2563eb]/10',
      borderColor: 'border-[#1e40af]/30',
      accentColor: 'from-[#1e40af]/20 to-[#2563eb]/20',
    },
    {
      type: 'live',
      icon: Video,
      badge: 'دورات مباشرة',
      title: 'تعلم مباشر',
      subtitle: 'مع أفضل المدربين',
      description: 'انضم إلى جلسات تعليمية مباشرة تفاعلية مع مدربين محترفين. احصل على تجربة تعليمية حية تتيح لك التفاعل المباشر وطرح الأسئلة.',
      features: [
        { icon: Video, text: 'تفاعل مباشر مع المدربين' },
        { icon: Users, text: 'مجموعات صغيرة لتعلم أفضل' },
        { icon: MessageCircle, text: 'أسئلة وإجابات فورية' },
        { icon: Clock, text: 'جلسات منتظمة ومنظمة' },
      ],
      link: '/live-courses',
      gradient: 'from-[#2563eb] to-[#1e40af]',
      bgGradient: 'from-[#2563eb]/10 to-[#1e40af]/10',
      borderColor: 'border-[#2563eb]/30',
      accentColor: 'from-[#2563eb]/20 to-[#1e40af]/20',
    },
  ];

  return (
    <section 
      id="courses" 
      dir="rtl"
      className="relative py-4 sm:py-5 md:py-6 lg:py-6 bg-gradient-to-b from-white via-[#1e40af]/3 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300 overflow-hidden"
    >
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1e40af 1px, transparent 0)`,
          backgroundSize: '56px 56px'
        }} />
      </div>

      {/* Sophisticated Gradient Accents */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-l from-[#1e40af]/8 via-[#2563eb]/5 to-transparent rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-gradient-to-r from-[#2563eb]/8 via-[#1e40af]/5 to-transparent rounded-full blur-[100px]" />

      <div className="container mx-auto max-w-6xl px-4 lg:px-8 relative z-10">
        {/* Header - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9 }}
          className="text-center mb-4 sm:mb-5 md:mb-6 lg:mb-8 max-w-4xl mx-auto"
        >
          <h2 className="text-base sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-[#222222] dark:text-slate-50 mb-2 sm:mb-3 lg:mb-4 leading-[1.2] tracking-tight">
            اختر النوع الذي
            <span className="block mt-1 sm:mt-2 lg:mt-3 text-[#1e40af] dark:text-blue-400 font-extrabold">
              يناسبك
            </span>
          </h2>
          <p className="hidden sm:block text-sm sm:text-base md:text-lg text-[#555555] dark:text-slate-300 leading-relaxed font-light mb-3 sm:mb-4">
            دورات مسجلة للتعلم المرن أو دورات مباشرة للتفاعل الفوري
          </p>
          
          {/* Badge - Moved below */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring" }}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#1e40af]/10 via-[#2563eb]/8 to-[#1e40af]/10 dark:from-[#1e40af]/20 dark:via-[#2563eb]/15 dark:to-[#1e40af]/20 px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-full border border-[#1e40af]/20 dark:border-blue-400/30 shadow-lg backdrop-blur-sm text-xs sm:text-sm"
          >
            <Sparkles className="text-[#1e40af] dark:text-blue-400" size={16} />
            <span className="text-xs font-bold text-[#1e40af] dark:text-blue-400 tracking-wide">أنواع الدورات</span>
          </motion.div>
        </motion.div>

        {/* Courses Grid - Enhanced Layout */}
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 max-w-7xl mx-auto">
          {courses.map((course, index) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={course.type}
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative"
              >
                {/* Main Card - Premium Design */}
                <div className={`relative bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-5 md:p-7 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 ${course.borderColor} dark:border-slate-700/50 h-full flex flex-col overflow-hidden backdrop-blur-sm`}>
                  {/* Animated Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${course.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Corner Accent - Enhanced */}
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${course.gradient} opacity-[0.08] rounded-tl-[2.5rem] rounded-br-full`} />
                  <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-[#C5A15A]/5 to-transparent rounded-bl-[2.5rem] rounded-tl-full" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Badge - Enhanced */}
                    <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${course.gradient}/15 dark:${course.gradient}/25 px-4 py-2 rounded-full text-xs font-bold border-2 ${course.borderColor} dark:border-blue-400/40 shadow-md mb-4 w-fit`}>
                      <Icon className={`text-[#1e40af] dark:text-blue-400`} size={16} />
                      <span className={`text-[#1e40af] dark:text-blue-400`}>{course.badge}</span>
                    </div>

                    {/* Title - Enhanced */}
                    <h3 className="text-base sm:text-xl md:text-3xl font-extrabold mb-2 sm:mb-3 leading-[1.2]">
                      <span className={`text-[#1e40af] dark:text-blue-400 font-extrabold block mb-1 sm:mb-2`}>
                        {course.title}
                      </span>
                      <span className="text-[#222222] dark:text-slate-50 text-sm sm:text-lg md:text-xl block mt-1 sm:mt-2">{course.subtitle}</span>
                    </h3>

                    {/* Description - Enhanced */}
                    <p className="hidden sm:block text-sm md:text-base text-[#555555] dark:text-slate-300 mb-5 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Features - Enhanced Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mb-3 sm:mb-5 flex-1">
                      {course.features.map((feature, idx) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + idx * 0.1, type: "spring" }}
                            className="group/feature relative bg-gradient-to-br from-white to-[#1e40af]/5 dark:from-slate-800 dark:to-slate-800/60 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-5 border-2 border-[#1e40af]/10 dark:border-slate-700/50 hover:border-[#1e40af]/40 dark:hover:border-blue-400/40 transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            <div className="flex items-center gap-2 sm:gap-4">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${course.gradient}/15 flex items-center justify-center border-2 ${course.borderColor} dark:border-blue-400/40 flex-shrink-0 group-hover/feature:scale-110 group-hover/feature:rotate-3 transition-transform`}>
                                <FeatureIcon className={`text-[#1e40af] dark:text-blue-400`} size={16} style={{ width: '16px', height: '16px' }} />
                              </div>
                              <span className="text-xs sm:text-sm md:text-base font-semibold text-[#222222] dark:text-slate-200">
                                {feature.text}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* CTA Button - Enhanced */}
                    <Link href={course.link} className="mt-auto">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className={`w-full bg-gradient-to-r ${course.gradient} hover:opacity-95 text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn py-2.5 sm:py-4 md:py-5 text-xs sm:text-sm lg:text-base font-bold rounded-lg overflow-hidden relative`}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                        <span className="relative z-10">استكشف الدورات</span>
                        <ArrowLeft className="mr-2 group-hover/btn:translate-x-1 transition-transform relative z-10" size={14} style={{ width: '14px', height: '14px' }} />
                      </Button>
                    </Link>
                  </div>

                  {/* Bottom Accent Line - Enhanced */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${course.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-3xl`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
