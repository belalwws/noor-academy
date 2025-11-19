'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getApiUrl } from '@/lib/config';

export const Footer: React.FC = () => {
  const router = useRouter();
  const [teacherStatus, setTeacherStatus] = useState<{
    isTeacher: boolean;
    hasPendingRequest: boolean;
    isActiveTeacher: boolean;
    loading: boolean;
  }>({ isTeacher: false, hasPendingRequest: false, isActiveTeacher: false, loading: true });
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-sky-500' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-600' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-700' },
    { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-600' },
  ];

  const quickLinks = [
    { label: 'الرئيسية', href: '#home' },
    { label: 'الدورات', href: '#courses' },
    { label: 'عن الأكاديمية', href: '#about' },
  ];

  // Check teacher status on mount
  useEffect(() => {
    checkTeacherStatus();
  }, []);

  const checkTeacherStatus = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('teacher_access_token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        setTeacherStatus({ isTeacher: false, hasPendingRequest: false, isActiveTeacher: false, loading: false });
        return;
      }

      const userData = JSON.parse(user);
      
      if (userData.role !== 'teacher') {
        setTeacherStatus({ isTeacher: false, hasPendingRequest: false, isActiveTeacher: false, loading: false });
        return;
      }

      // Check join request status
      const response = await fetch(getApiUrl('/teachers/join-request/status/'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeacherStatus({
          isTeacher: true,
          hasPendingRequest: data.data?.has_pending_request || false,
          isActiveTeacher: data.data?.is_active_teacher || false,
          loading: false,
        });
      } else {
        setTeacherStatus({ isTeacher: true, hasPendingRequest: false, isActiveTeacher: false, loading: false });
      }
    } catch (error) {
      console.error('Error checking teacher status:', error);
      setTeacherStatus({ isTeacher: false, hasPendingRequest: false, isActiveTeacher: false, loading: false });
    }
  };

  const handleTeacherButtonClick = () => {
    if (teacherStatus.isTeacher) {
      if (teacherStatus.hasPendingRequest) {
        // Redirect to choose supervisor page to view pending request
        router.push('/choose-supervisor');
      } else if (teacherStatus.isActiveTeacher) {
        // Redirect to teacher dashboard
        router.push('/dashboard/teacher');
      } else {
        // Redirect to choose supervisor page
        router.push('/choose-supervisor');
      }
    } else {
      // Redirect to teacher registration
      router.push('/teacher-register');
    }
  };

  const getButtonContent = () => {
    if (teacherStatus.loading) {
      return (
        <>
          <Loader2 className="animate-spin" size={16} />
          <span>جاري التحميل...</span>
        </>
      );
    }

    if (teacherStatus.isTeacher) {
      if (teacherStatus.hasPendingRequest) {
        return (
          <>
            <Loader2 className="animate-spin" size={16} />
            <span>طلبك قيد المراجعة</span>
          </>
        );
      } else if (teacherStatus.isActiveTeacher) {
        return (
          <>
            <CheckCircle size={16} />
            <span>لوحة التحكم</span>
          </>
        );
      } else {
        return (
          <>
            <ArrowRight size={16} />
            <span>اختر مشرف عام</span>
          </>
        );
      }
    }

    return (
      <>
        <ArrowRight size={16} />
        <span>انضم كمدرس</span>
      </>
    );
  };

  return (
    <footer id="contact" className="bg-gradient-to-br from-[#0A5734] via-[#073D24] to-[#0A5734] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="شعار أكاديمية نور"
                className="w-12 h-12 object-contain rounded-xl shadow-glow"
              />
              <div>
                <h3 className="text-xl font-bold dark:text-slate-50">أكاديمية نور</h3>
                <p className="text-sm text-gray-400 dark:text-slate-400">نور يهتدي به في دروب الحياة</p>
              </div>
            </div>
            <p className="text-gray-400 dark:text-slate-300 leading-relaxed mb-4">
              بيئة قرآنية تربوية متكاملة تجمع بين الإتقان والعصرية بإشراف نخبة من المعلمين والمعلمات.
              نقدم تحفيظ القرآن الكريم بروايات متعددة وتجويد وتلقين بأساليب مبسطة.
            </p>
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleTeacherButtonClick}
              className="cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {getButtonContent()}
              </span>
            </Button>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-bold dark:text-slate-50 mb-4">روابط سريعة</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-gray-400 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <ArrowRight size={16} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold dark:text-slate-50 mb-4">تواصل معنا</h3>
            <div className="space-y-4">
              <a 
                href="mailto:info@nour.academy" 
                className="flex items-center gap-3 text-gray-400 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                <div className="w-10 h-10 bg-white/10 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">البريد الإلكتروني</p>
                  <p className="font-medium dark:text-slate-200">info@nour.academy</p>
                </div>
              </a>
              <a 
                href="tel:00962776642079" 
                className="flex items-center gap-3 text-gray-400 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                <div className="w-10 h-10 bg-white/10 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">الهاتف</p>
                  <p className="font-medium dark:text-slate-200">00962776642079</p>
                </div>
              </a>
              <a 
                href="https://wa.me/00962776642079" 
                className="flex items-center gap-3 text-gray-400 dark:text-slate-300 hover:text-green-500 dark:hover:text-green-400 transition-colors"
              >
                <div className="w-10 h-10 bg-white/10 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">واتساب</p>
                  <p className="font-medium dark:text-slate-200">00962776642079</p>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold dark:text-slate-50 mb-4">تابعنا</h3>
            <p className="text-gray-400 dark:text-slate-300 mb-4">
              تواصل معنا على منصات التواصل الاجتماعي
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`w-12 h-12 bg-white/10 dark:bg-slate-800 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:bg-white/20 dark:hover:bg-slate-700 ${social.color}`}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 dark:border-slate-700 pt-8">
          <div className="flex justify-center items-center">
            <p className="text-gray-400 dark:text-slate-300 text-sm text-center">
              2025{' '}
              <a 
                href="https://nour.academy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#C5A15A] dark:text-[#C5A15A] font-semibold hover:text-[#D4B16B] dark:hover:text-[#D4B16B] transition-colors"
              >
                <span className="text-lg">©</span> رشد
              </a>
              . جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
