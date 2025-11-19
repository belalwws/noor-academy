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
    <section id="contact" className="relative py-8 md:py-12 lg:py-14 bg-gradient-to-br from-[#0A5734] via-[#073D24] to-[#0A5734] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white overflow-hidden" dir="rtl">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '56px 56px'
        }} />
      </div>

      {/* Sophisticated Gradient Overlays */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#4A8F5C]/15 via-[#0A5734]/10 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr from-[#C5A15A]/15 via-[#4A8F5C]/10 to-transparent rounded-full blur-[120px]" />

      {/* Elegant Decorative Elements */}
      <div className="absolute top-24 right-24 w-1.5 h-40 bg-gradient-to-b from-white/25 via-white/15 to-transparent" />
      <div className="absolute bottom-24 left-24 w-40 h-1.5 bg-gradient-to-r from-white/25 via-white/15 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9 }}
          className="text-center max-w-5xl mx-auto space-y-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring" }}
            className="inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-md px-6 py-3 rounded-full border-2 border-white/25 shadow-xl"
          >
            <Sparkles className="text-white" size={18} />
            <span className="text-sm font-bold text-white tracking-wide">تواصل معنا</span>
          </motion.div>

          {/* Title - Enhanced */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.2] tracking-tight">
            <span className="block mb-4">سجّل الآن وابدأ</span>
            <span className="block mt-4 text-white font-extrabold">
              رحلتك مع القرآن
            </span>
          </h2>

          {/* Contact Card - Premium Design */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative bg-white/12 backdrop-blur-2xl rounded-3xl p-8 lg:p-10 shadow-2xl border-2 border-white/20"
          >
            {/* Decorative Corners */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/15 to-transparent rounded-tl-[2.5rem] rounded-br-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#C5A15A]/20 to-transparent rounded-br-[2.5rem] rounded-tl-full" />

            <div className="relative z-10 space-y-8">
              {/* Phone Number - Enhanced */}
              <div className="flex flex-col items-center gap-5">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/25 to-white/15 flex items-center justify-center shadow-xl border-2 border-white/30"
                >
                  <Phone className="text-white" size={36} />
                </motion.div>
                <a 
                  href="tel:00962776642079" 
                  className="text-3xl md:text-4xl font-extrabold hover:text-[#C5A15A] transition-colors duration-300 tracking-tight"
                >
                  00962776642079
                </a>
                <p className="text-white/90 text-lg font-semibold">اتصل بنا الآن</p>
              </div>

              {/* Divider - Enhanced */}
              <div className="flex items-center justify-center gap-5">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-white/20"></div>
                <div className="w-3 h-3 rounded-full bg-white/50 shadow-lg"></div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/30 to-white/20"></div>
              </div>

              {/* Action Buttons - Enhanced Grid */}
              <div className="grid sm:grid-cols-3 gap-5">
                <Button
                  onClick={handleWhatsApp}
                  className="group relative bg-white text-[#0A5734] hover:bg-[#C5A15A] hover:text-white px-10 py-8 text-lg lg:text-xl font-bold shadow-2xl hover:shadow-[#C5A15A]/40 transition-all duration-300 rounded-2xl overflow-hidden"
                  size="lg"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#C5A15A]/0 via-[#C5A15A]/20 to-[#C5A15A]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <MessageCircle className="ml-3 group-hover:scale-110 transition-transform relative z-10" size={24} />
                  <span className="relative z-10">واتساب</span>
                </Button>
                
                <Button
                  onClick={handleCall}
                  className="bg-white/15 backdrop-blur-md text-white hover:bg-white/25 border-2 border-white/40 px-10 py-8 text-lg lg:text-xl font-bold transition-all duration-300 rounded-2xl group hover:scale-[1.02]"
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
              <div className="flex items-center justify-center gap-4 pt-6 border-t-2 border-white/25">
                <Mail className="text-white/90" size={24} />
                <a 
                  href="mailto:info@nour.academy"
                  className="text-white/90 hover:text-white transition-colors font-semibold text-lg"
                >
                  info@nour.academy
                </a>
              </div>
            </div>
          </motion.div>

          {/* Description - Enhanced */}
          <p className="text-xl md:text-2xl text-white/95 leading-relaxed font-light max-w-3xl mx-auto">
            تواصل معنا الآن واحصل على استشارة مجانية حول البرنامج المناسب لك أو لأبنائك
          </p>
        </motion.div>
      </div>
    </section>
  );
};
