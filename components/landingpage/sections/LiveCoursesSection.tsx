'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Video, Users, Clock, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const LiveCoursesSection: React.FC = () => {
  const features = [
    {
      icon: Video,
      text: 'تفاعل مباشر مع المدربين',
    },
    {
      icon: Users,
      text: 'مجموعات صغيرة لتعلم أفضل',
    },
    {
      icon: MessageCircle,
      text: 'أسئلة وإجابات فورية',
    },
    {
      icon: Clock,
      text: 'جلسات منتظمة ومنظمة',
    },
  ];

  return (
    <section 
      id="live-courses" 
      dir="rtl"
      className="relative py-0 bg-white dark:bg-slate-900 transition-colors duration-300 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-hero pattern-dots opacity-30 -z-10" />
      
      {/* Color Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1e40af]/10 via-[#1e40af]/5 to-transparent pointer-events-none -z-10" />

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-[#1e40af]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#2563eb]/10 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#1e40af]/10 rounded-full blur-2xl animate-pulse delay-1000" />

      <div className="container mx-auto px-4 lg:px-8 py-0 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Section - Left */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-right space-y-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1e40af]/10 to-[#2563eb]/10 text-[#1e40af] dark:text-blue-400 px-4 py-2.5 rounded-full text-sm font-semibold border border-[#1e40af]/20 dark:border-blue-400/30 shadow-sm"
            >
              <Video size={18} />
              <span>دورات مباشرة</span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary dark:text-slate-50 leading-tight"
            >
              <span className="text-[#1e40af] dark:text-blue-400 font-extrabold">
                تعلم مباشر
              </span>
              <br />
              <span className="text-text-primary dark:text-slate-50">مع أفضل المدربين</span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-text-secondary dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              انضم إلى جلسات تعليمية مباشرة تفاعلية مع مدربين محترفين. احصل على تجربة تعليمية حية 
              تتيح لك التفاعل المباشر، طرح الأسئلة، والحصول على إجابات فورية. تعلم في بيئة ديناميكية 
              تشجع على المشاركة والتفاعل مع زملائك في التعلم.
            </motion.p>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1e40af]/5 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e40af]/10 to-[#2563eb]/10 flex items-center justify-center border border-[#1e40af]/20 dark:border-blue-400/30 shadow-sm flex-shrink-0">
                    <feature.icon className="text-[#1e40af] dark:text-blue-400" size={22} />
                  </div>
                  <span className="text-text-primary dark:text-slate-200 font-medium text-sm md:text-base">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center lg:justify-start"
            >
              <Link href="/live-courses">
                <Button variant="primary" size="lg" className="group shadow-lg hover:shadow-xl transition-all">
                  <span className="text-lg">تعلم الآن</span>
                  <ArrowLeft className="mr-2 group-hover:translate-x-1 transition-transform" size={22} />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Image Section - Right */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full h-[900px] flex items-center justify-center">
              {/* Main Image */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-full h-full flex items-center justify-center scale-[2.2]"
              >
                <img
                  src="/livecourses-section.png"
                  alt="الدورات المباشرة"
                  className="w-full h-full object-contain"
                />
              </motion.div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-48 right-16 bg-gradient-to-br from-[#1e40af] to-[#2563eb] text-white p-5 rounded-2xl shadow-glow z-10"
              >
                <Video size={36} />
              </motion.div>

              {/* Floating Card */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-60 left-16 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-glow w-64 z-10 border border-gray-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1e40af]/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Users className="text-[#1e40af] dark:text-blue-400" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary dark:text-slate-100">تعلم تفاعلي</h4>
                    <p className="text-sm text-text-secondary dark:text-slate-400">مع مدربين محترفين</p>
                  </div>
                </div>
              </motion.div>

              {/* Central Glow Effect */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#1e40af] to-[#2563eb] rounded-full blur-3xl opacity-10 animate-pulse -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
