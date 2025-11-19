'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, ArrowLeft } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';

export const CTASection: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const handleRegister = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/register');
    }
  };

  const handleBrowseCourses = () => {
    router.push('/courses');
  };

  return (
    <section 
      id="cta" 
      dir="rtl"
      className="relative py-12 md:py-16 bg-white dark:bg-slate-900 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-hero pattern-dots opacity-30 -z-10" />
      
      {/* Color Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-primary/10 to-transparent pointer-events-none -z-10" />

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-primary via-primary-dark to-accent rounded-3xl p-8 md:p-16 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full mb-6 backdrop-blur-sm"
            >
              <BookOpen size={20} />
              <span className="font-semibold">ابدأ رحلتك التعليمية</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              ابدأ رحلتك التعليمية اليوم مع رُشد
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              انضم إلى آلاف المتعلمين واكتسب مهارات جديدة من خلال دورات عالية الجودة ومدربين محترفين
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                variant="secondary" 
                size="lg"
                onClick={handleRegister}
                className="bg-white text-primary hover:bg-white/90 shadow-xl group"
              >
                <span className="flex items-center gap-2">
                  {isAuthenticated ? 'لوحة التحكم' : 'التسجيل الآن'}
                  <ArrowLeft className="mr-2 group-hover:translate-x-1 transition-transform" size={20} />
                </span>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleBrowseCourses}
                className="border-white text-white hover:bg-white/10 backdrop-blur-sm"
              >
                تصفح الدورات
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
