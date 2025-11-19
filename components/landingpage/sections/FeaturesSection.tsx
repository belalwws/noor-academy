'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, BookOpen, Users, FileText, Clock, Gift, Sparkles, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'تحفيظ القرآن الكريم بروايات متعددة',
    description: 'نقدم تحفيظ القرآن الكريم بجميع الروايات المتواترة مع إتقان التلاوة والتجويد',
    color: 'from-[#0A5734] to-[#0D6B42]',
    bgColor: 'from-[#0A5734]/8 to-[#0D6B42]/8',
    borderColor: 'border-[#0A5734]/20',
  },
  {
    icon: Users,
    title: 'تجويد وتلقين بأساليب مبسطة',
    description: 'أساليب تعليمية حديثة تجعل من التلقين والتجويد تجربة ممتعة وسهلة',
    color: 'from-[#4A8F5C] to-[#5BA86D]',
    bgColor: 'from-[#4A8F5C]/8 to-[#5BA86D]/8',
    borderColor: 'border-[#4A8F5C]/20',
  },
  {
    icon: FileText,
    title: 'تقييمات دورية وتقارير أسبوعية',
    description: 'متابعة مستمرة لتقدم الطالب مع تقارير مفصلة لولي الأمر',
    color: 'from-[#0A5734] to-[#0D6B42]',
    bgColor: 'from-[#0A5734]/8 to-[#0D6B42]/8',
    borderColor: 'border-[#0A5734]/20',
  },
  {
    icon: Clock,
    title: 'متابعة يومية وتواصل دائم مع ولي الأمر',
    description: 'تواصل مستمر مع أولياء الأمور لمتابعة تقدم أبنائهم',
    color: 'from-[#4A8F5C] to-[#5BA86D]',
    bgColor: 'from-[#4A8F5C]/8 to-[#5BA86D]/8',
    borderColor: 'border-[#4A8F5C]/20',
  },
  {
    icon: Users,
    title: 'حلقات أونلاين مرنة',
    description: 'حلقات تعليمية عبر الإنترنت تناسب جميع الجداول الزمنية',
    color: 'from-[#0A5734] to-[#0D6B42]',
    bgColor: 'from-[#0A5734]/8 to-[#0D6B42]/8',
    borderColor: 'border-[#0A5734]/20',
  },
  {
    icon: Gift,
    title: 'دعم مستمر وخصومات للأشقاء',
    description: 'برامج خاصة وخصومات مميزة للعائلات والأشقاء',
    color: 'from-[#4A8F5C] to-[#5BA86D]',
    bgColor: 'from-[#4A8F5C]/8 to-[#5BA86D]/8',
    borderColor: 'border-[#4A8F5C]/20',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative py-4 md:py-6 lg:py-6 bg-white dark:bg-slate-950 overflow-hidden" dir="rtl">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, #0A5734 1px, transparent 1px), linear-gradient(-45deg, #0A5734 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }} />
      </div>

      {/* Sophisticated Gradient Overlays */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#0A5734]/4 via-[#4A8F5C]/2 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-[600px] bg-gradient-to-t from-[#4A8F5C]/4 via-[#0A5734]/2 to-transparent pointer-events-none" />

      {/* Floating Accent Elements */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-[#0A5734]/6 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-tr from-[#4A8F5C]/6 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header Section - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.3 }}
          className="text-center mb-4 sm:mb-6 lg:mb-8 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05, duration: 0.3 }}
            className="inline-flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-r from-[#0A5734]/10 via-[#4A8F5C]/8 to-[#0A5734]/10 dark:from-[#0A5734]/20 dark:via-[#4A8F5C]/15 dark:to-[#0A5734]/20 px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full border border-[#0A5734]/20 dark:border-[#4A8F5C]/30 shadow-lg backdrop-blur-sm mb-4 sm:mb-6 lg:mb-8 text-xs sm:text-sm"
          >
            <Sparkles className="text-[#0A5734] dark:text-[#4A8F5C]" size={18} />
            <span className="text-sm font-bold text-[#0A5734] dark:text-[#4A8F5C] tracking-wide">مميزاتنا</span>
          </motion.div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-[#222222] dark:text-slate-50 mb-2 sm:mb-3 lg:mb-4 leading-[1.2] tracking-tight">
            ماذا نقدم في
            <span className="block mt-3 text-[#0A5734] dark:text-[#4A8F5C] font-extrabold">
              أكاديمية نور؟
            </span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg text-[#555555] dark:text-slate-300 leading-relaxed font-light max-w-3xl mx-auto mb-3 sm:mb-4 lg:mb-0">
            نقدم تجربة تعليمية شاملة تجمع بين الأصالة والحداثة
          </p>
          
          {/* Enhanced Decorative Line */}
          <div className="hidden sm:flex items-center justify-center gap-5 mt-4 sm:mt-6 lg:mt-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#0A5734]/30 to-[#0A5734]"></div>
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#0A5734] to-[#4A8F5C] shadow-lg"></div>
            <div className="w-32 h-px bg-gradient-to-r from-[#0A5734] via-[#4A8F5C] to-[#0A5734]"></div>
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#4A8F5C] to-[#C5A15A] shadow-lg"></div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent via-[#4A8F5C]/30 to-[#4A8F5C]"></div>
          </div>
        </motion.div>

        {/* Features Grid - Enhanced Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative"
              >
                {/* Card with Enhanced Design */}
                <div className={`relative bg-gradient-to-br ${feature.bgColor} dark:from-slate-900/60 dark:to-slate-800/60 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-500 border-2 ${feature.borderColor} dark:border-slate-700/50 h-full flex flex-col overflow-hidden backdrop-blur-sm`}>
                  {/* Animated Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />
                  
                  {/* Decorative Corner Elements */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${feature.color} opacity-[0.06] rounded-tl-3xl rounded-br-full`} />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[#C5A15A]/5 to-transparent rounded-bl-3xl rounded-tl-full" />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon - Enhanced */}
                    <div className="mb-3 sm:mb-4 lg:mb-5">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 8 }}
                        className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 mx-auto lg:mx-0`}
                      >
                        <Icon className="text-white" size={20} style={{ width: '20px', height: '20px' }} />
                      </motion.div>
                    </div>

                    {/* Title and Description */}
                    <div className="flex-1 space-y-2 sm:space-y-3">
                      <h3 className="text-base sm:text-lg lg:text-xl font-extrabold text-[#222222] dark:text-slate-50 leading-tight flex items-start gap-2">
                        <CheckCircle2 className="text-[#0A5734] dark:text-[#4A8F5C] flex-shrink-0 mt-0.5 sm:mt-1" size={16} style={{ width: '16px', height: '16px' }} />
                        <span>{feature.title}</span>
                      </h3>
                      <p className="text-[#555555] dark:text-slate-300 leading-relaxed text-xs sm:text-sm lg:text-base">
                        {feature.description}
                      </p>
                    </div>

                    {/* Bottom Accent Line */}
                    <div className={`mt-5 pt-4 border-t-2 ${feature.borderColor} dark:border-slate-700/50`}>
                      <div className={`h-1.5 bg-gradient-to-r ${feature.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
