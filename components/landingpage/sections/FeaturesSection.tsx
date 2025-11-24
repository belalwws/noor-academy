'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, BookOpen, Users, FileText, Clock, Gift, Sparkles, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'تحفيظ القرآن الكريم بروايات متعددة',
    description: 'نقدم تحفيظ القرآن الكريم بجميع الروايات المتواترة مع إتقان التلاوة والتجويد',
    color: 'from-[#1e40af] to-[#1e40af]',
    bgColor: 'from-[#1e40af]/8 to-[#1e40af]/8',
    borderColor: 'border-[#1e40af]/20',
  },
  {
    icon: Users,
    title: 'تجويد وتلقين بأساليب مبسطة',
    description: 'أساليب تعليمية حديثة تجعل من التلقين والتجويد تجربة ممتعة وسهلة',
    color: 'from-[#2563eb] to-[#3b82f6]',
    bgColor: 'from-[#2563eb]/8 to-[#3b82f6]/8',
    borderColor: 'border-[#2563eb]/20',
  },
  {
    icon: FileText,
    title: 'تقييمات دورية وتقارير أسبوعية',
    description: 'متابعة مستمرة لتقدم الطالب مع تقارير مفصلة لولي الأمر',
    color: 'from-[#1e40af] to-[#1e40af]',
    bgColor: 'from-[#1e40af]/8 to-[#1e40af]/8',
    borderColor: 'border-[#1e40af]/20',
  },
  {
    icon: Clock,
    title: 'متابعة يومية وتواصل دائم مع ولي الأمر',
    description: 'تواصل مستمر مع أولياء الأمور لمتابعة تقدم أبنائهم',
    color: 'from-[#2563eb] to-[#3b82f6]',
    bgColor: 'from-[#2563eb]/8 to-[#3b82f6]/8',
    borderColor: 'border-[#2563eb]/20',
  },
  {
    icon: Users,
    title: 'حلقات أونلاين مرنة',
    description: 'حلقات تعليمية عبر الإنترنت تناسب جميع الجداول الزمنية',
    color: 'from-[#1e40af] to-[#1e40af]',
    bgColor: 'from-[#1e40af]/8 to-[#1e40af]/8',
    borderColor: 'border-[#1e40af]/20',
  },
  {
    icon: Gift,
    title: 'دعم مستمر وخصومات للأشقاء',
    description: 'برامج خاصة وخصومات مميزة للعائلات والأشقاء',
    color: 'from-[#2563eb] to-[#3b82f6]',
    bgColor: 'from-[#2563eb]/8 to-[#3b82f6]/8',
    borderColor: 'border-[#2563eb]/20',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative py-2 sm:py-4 md:py-5 lg:py-5 bg-white dark:bg-slate-950 overflow-hidden" dir="rtl">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, #1e40af 1px, transparent 1px), linear-gradient(-45deg, #1e40af 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }} />
      </div>

      {/* Sophisticated Gradient Overlays */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#1e40af]/4 via-[#2563eb]/2 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-[600px] bg-gradient-to-t from-[#2563eb]/4 via-[#1e40af]/2 to-transparent pointer-events-none" />

      {/* Floating Accent Elements */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-[#1e40af]/6 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-tr from-[#2563eb]/6 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto max-w-6xl px-3 lg:px-8 relative z-10">
        {/* Header Section - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.3 }}
          className="text-center mb-2 sm:mb-4 md:mb-5 lg:mb-6 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05, duration: 0.3 }}
            className="inline-flex items-center gap-1 sm:gap-2.5 bg-gradient-to-r from-[#1e40af]/10 via-[#2563eb]/8 to-[#1e40af]/10 dark:from-[#1e40af]/20 dark:via-[#2563eb]/15 dark:to-[#1e40af]/20 px-2 sm:px-5 lg:px-6 py-1 sm:py-2 lg:py-3 rounded-full border border-[#1e40af]/20 dark:border-blue-400/30 shadow-lg backdrop-blur-sm mb-3 sm:mb-6 lg:mb-8 text-[10px] sm:text-sm"
          >
            <Sparkles className="text-[#1e40af] dark:text-blue-400" size={14} />
            <span className="text-xs sm:text-sm font-bold text-[#1e40af] dark:text-blue-400 tracking-wide">مميزاتنا</span>
          </motion.div>

          <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#222222] dark:text-slate-50 mb-1.5 sm:mb-3 md:mb-3 lg:mb-4 leading-[1.2] tracking-tight">
            ماذا نقدم في
            <span className="block mt-1.5 sm:mt-2 text-[#1e40af] dark:text-blue-400 font-extrabold">
              أكاديمية نور؟
            </span>
          </h2>
          
          <p className="hidden sm:block text-sm md:text-base text-[#555555] dark:text-slate-300 leading-relaxed font-light max-w-3xl mx-auto mb-2 sm:mb-4 lg:mb-0">
            نقدم تجربة تعليمية شاملة تجمع بين الأصالة والحداثة
          </p>
          
          {/* Enhanced Decorative Line */}
          <div className="hidden sm:flex items-center justify-center gap-5 mt-4 sm:mt-6 lg:mt-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#1e40af]/30 to-[#1e40af]"></div>
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#1e40af] to-[#2563eb] shadow-lg"></div>
            <div className="w-32 h-px bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#1e40af]"></div>
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#2563eb] to-[#C5A15A] shadow-lg"></div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent via-[#2563eb]/30 to-[#2563eb]"></div>
          </div>
        </motion.div>

        {/* Features Grid - Enhanced Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-4 max-w-7xl mx-auto">
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
                <div className={`relative bg-gradient-to-br ${feature.bgColor} dark:from-slate-900/60 dark:to-slate-800/60 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-lg hover:shadow-xl transition-all duration-500 border-2 ${feature.borderColor} dark:border-slate-700/50 h-full flex flex-col overflow-hidden backdrop-blur-sm`}>
                  {/* Animated Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />
                  
                  {/* Decorative Corner Elements */}
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${feature.color} opacity-[0.06] rounded-tl-2xl rounded-br-full`} />
                  <div className="absolute bottom-0 left-0 w-14 h-14 bg-gradient-to-tr from-[#C5A15A]/5 to-transparent rounded-bl-2xl rounded-tl-full" />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon - Enhanced */}
                    <div className="mb-2 sm:mb-3 lg:mb-4">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 8 }}
                        className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 mx-auto lg:mx-0`}
                      >
                        <Icon className="text-white" size={18} style={{ width: '18px', height: '18px' }} />
                      </motion.div>
                    </div>

                    {/* Title and Description */}
                    <div className="flex-1 space-y-1 sm:space-y-2">
                      <h3 className="text-xs sm:text-base lg:text-lg font-extrabold text-[#222222] dark:text-slate-50 leading-tight flex items-start gap-1.5">
                        <CheckCircle2 className="text-[#1e40af] dark:text-blue-400 flex-shrink-0 mt-0.5" size={12} style={{ width: '12px', height: '12px' }} />
                        <span>{feature.title}</span>
                      </h3>
                      <p className="text-[#555555] dark:text-slate-300 leading-relaxed text-[9px] sm:text-sm line-clamp-1 sm:line-clamp-none">
                        {feature.description}
                      </p>
                    </div>

                    {/* Bottom Accent Line */}
                    <div className={`mt-3 pt-3 border-t-2 ${feature.borderColor} dark:border-slate-700/50`}>
                      <div className={`h-1 bg-gradient-to-r ${feature.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
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
