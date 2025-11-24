'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, BookOpen, Mail, Sparkles } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';

export const ContactSection: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const handleWhatsApp = () => {
    window.open('https://wa.me/00962776642079', '_blank');
  };

  const handleCall = () => {
    window.location.href = 'tel:00962776642079';
  };

  const handleBookTrial = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/register');
    }
  };

  return (
    <section id="contact" className="relative py-4 sm:py-5 md:py-6 lg:py-6 bg-white dark:bg-slate-950 text-[#222222] dark:text-slate-50 overflow-hidden" dir="rtl">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #1e40af 1px, transparent 0)`,
          backgroundSize: '56px 56px'
        }} />
      </div>

      {/* Sophisticated Gradient Overlays */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#2563eb]/8 via-[#1e40af]/5 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr from-[#C5A15A]/8 via-[#2563eb]/5 to-transparent rounded-full blur-[120px]" />

      {/* Elegant Decorative Elements */}
      <div className="hidden md:block absolute top-24 right-24 w-1.5 h-40 bg-gradient-to-b from-[#1e40af]/15 via-[#2563eb]/10 to-transparent" />
      <div className="hidden md:block absolute bottom-24 left-24 w-40 h-1.5 bg-gradient-to-r from-[#1e40af]/15 via-[#2563eb]/10 to-transparent" />

      <div className="container mx-auto max-w-6xl px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9 }}
          className="text-center max-w-5xl mx-auto space-y-4 sm:space-y-6 lg:space-y-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring" }}
            className="inline-flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-r from-[#1e40af]/10 via-[#2563eb]/8 to-[#1e40af]/10 dark:from-[#1e40af]/20 dark:via-[#2563eb]/15 dark:to-[#1e40af]/20 px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full border-2 border-[#1e40af]/20 dark:border-blue-400/30 shadow-xl text-xs sm:text-sm"
          >
            <Sparkles className="text-[#1e40af] dark:text-blue-400" size={18} />
            <span className="text-sm font-bold text-[#1e40af] dark:text-blue-400 tracking-wide">تواصل معنا</span>
          </motion.div>

          {/* Title - Enhanced */}
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.2] tracking-tight text-[#222222] dark:text-slate-50">
            <span className="block mb-2 sm:mb-3 lg:mb-4">سجّل الآن وابدأ</span>
            <span className="block mt-2 sm:mt-3 lg:mt-4 text-[#1e40af] dark:text-blue-400 font-extrabold">
              رحلتك مع القرآن
            </span>
          </h2>

          {/* Contact Card - Premium Design */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative bg-gradient-to-br from-white via-[#1e40af]/5 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-8 lg:p-10 shadow-2xl border-2 border-[#1e40af]/10 dark:border-blue-400/20"
          >
            {/* Decorative Corners */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#1e40af]/10 to-transparent rounded-tl-[2.5rem] rounded-br-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#C5A15A]/10 to-transparent rounded-br-[2.5rem] rounded-tl-full" />

            <div className="relative z-10 space-y-8">
              {/* Phone Number - Enhanced */}
              <div className="flex flex-col items-center gap-5">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e40af] to-[#2563eb] flex items-center justify-center shadow-xl"
                >
                  <Phone className="text-white" size={36} />
                </motion.div>
                <a 
                  href="tel:00962776642079" 
                  className="text-3xl md:text-4xl font-extrabold text-[#1e40af] dark:text-blue-400 hover:text-[#C5A15A] transition-colors duration-300 tracking-tight"
                >
                  00962776642079
                </a>
                <p className="text-[#555555] dark:text-slate-300 text-lg font-semibold">اتصل بنا الآن</p>
              </div>

              {/* Divider - Enhanced */}
              <div className="flex items-center justify-center gap-5">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1e40af]/20 to-[#1e40af]/10"></div>
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#1e40af] to-[#2563eb] shadow-lg"></div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#1e40af]/20 to-[#1e40af]/10"></div>
              </div>

              {/* Action Buttons - Enhanced Grid */}
              <div className="grid sm:grid-cols-3 gap-5">
                <Button
                  onClick={handleWhatsApp}
                  className="group relative bg-white text-[#1e40af] hover:bg-[#C5A15A] hover:text-white px-10 py-8 text-lg lg:text-xl font-bold shadow-2xl hover:shadow-[#C5A15A]/40 transition-all duration-300 rounded-2xl overflow-hidden"
                  size="lg"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#C5A15A]/0 via-[#C5A15A]/20 to-[#C5A15A]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <MessageCircle className="ml-3 group-hover:scale-110 transition-transform relative z-10" size={24} />
                  <span className="relative z-10">واتساب</span>
                </Button>
                
                <Button
                  onClick={handleCall}
                  className="bg-transparent backdrop-blur-md text-[#1e40af] dark:text-blue-400 hover:bg-[#1e40af]/10 dark:hover:bg-blue-400/10 border-2 border-[#1e40af] dark:border-blue-400 px-10 py-8 text-lg lg:text-xl font-bold transition-all duration-300 rounded-2xl group hover:scale-[1.02]"
                  size="lg"
                  variant="outline"
                >
                  <Phone className="ml-3 group-hover:scale-110 transition-transform" size={24} />
                  اتصال مباشر
                </Button>
                
                <Button
                  onClick={handleBookTrial}
                  className="group relative bg-gradient-to-r from-[#C5A15A] via-[#D4B16B] to-[#C5A15A] hover:from-[#B8914A] hover:via-[#C5A15A] hover:to-[#B8914A] text-white px-10 py-8 text-lg lg:text-xl font-bold shadow-2xl hover:shadow-[#C5A15A]/40 transition-all duration-300 rounded-2xl overflow-hidden"
                  size="lg"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <BookOpen className="ml-3 group-hover:rotate-12 transition-transform relative z-10" size={24} />
                  <span className="relative z-10">سجل الآن</span>
                </Button>
              </div>

              {/* Email - Enhanced */}
              <div className="flex items-center justify-center gap-4 pt-6 border-t-2 border-[#1e40af]/10 dark:border-blue-400/20">
                <Mail className="text-[#1e40af] dark:text-blue-400" size={24} />
                <a 
                  href="mailto:info@nour.academy"
                  className="text-[#1e40af] dark:text-blue-400 hover:text-[#2563eb] dark:hover:text-[#6BA86D] transition-colors font-semibold text-lg"
                >
                  info@nour.academy
                </a>
              </div>
            </div>
          </motion.div>

          {/* Description - Enhanced */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#555555] dark:text-slate-300 leading-relaxed font-light max-w-3xl mx-auto">
            تواصل معنا الآن واحصل على استشارة مجانية حول البرنامج المناسب لك أو لأبنائك
          </p>
        </motion.div>
      </div>
    </section>
  );
};
