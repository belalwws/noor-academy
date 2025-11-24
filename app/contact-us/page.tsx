'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('📧 [Contact Us Page] Contact us page loaded');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    
    // Create mailto link
    const subject = encodeURIComponent(formData.subject || 'رسالة من موقع أكاديمية نور');
    const body = encodeURIComponent(
      `الاسم: ${formData.name}\n` +
      `البريد الإلكتروني: ${formData.email}\n\n` +
      `الرسالة:\n${formData.message}`
    );
    const mailtoLink = `mailto:info@nour.academy?subject=${subject}&body=${body}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Reset form after a delay
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
      toast.success('تم فتح بريدك الإلكتروني لإرسال الرسالة');
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            تواصل معنا
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            نحن هنا للإجابة على استفساراتك ومساعدتك في أي وقت. تواصل معنا على رقم الواتساب: 00962776642079
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-lg border-2 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MessageSquare className="w-6 h-6 text-[#1e40af] dark:text-blue-400" />
                  أرسل لنا رسالة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الاسم الكامل *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الموضوع
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="موضوع الرسالة (اختياري)"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الرسالة *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full"
                      placeholder="اكتب رسالتك هنا..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#1e40af] to-[#2563eb] hover:from-[#1e3a8a] hover:to-[#1e40af] text-white"
                    size="lg"
                  >
                    {isSubmitting ? (
                      'جاري الإرسال...'
                    ) : (
                      <>
                        <Send className="w-5 h-5 ml-2" />
                        إرسال الرسالة
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <Card className="shadow-lg border-2 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl">معلومات التواصل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#1e40af]/10 dark:bg-blue-500/30 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-[#1e40af] dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">البريد الإلكتروني</h3>
                    <a
                      href="mailto:info@nour.academy"
                      className="text-[#1e40af] dark:text-blue-400 hover:underline"
                    >
                      info@nour.academy
                    </a>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#2563eb]/10 dark:bg-blue-500/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#2563eb] dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">ساعات العمل</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      الأحد - الخميس: 9:00 ص - 5:00 م<br />
                      الجمعة - السبت: مغلق
                    </p>
                  </div>
                </div>

                {/* Response Time */}
                <div className="bg-gradient-to-r from-[#1e40af]/5 to-[#2563eb]/5 dark:from-blue-500/20 dark:to-blue-400/20 rounded-lg p-4 border border-[#1e40af]/20 dark:border-blue-400/30">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>ملاحظة:</strong> نحن نسعى للرد على جميع الرسائل خلال 24-48 ساعة خلال أيام العمل.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info Card */}
            <Card className="shadow-lg border-2 border-gray-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">كيف يمكننا مساعدتك؟</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-[#1e40af] dark:text-blue-400 mt-1">•</span>
                    <span>استفسارات حول الدورات والبرامج التعليمية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1e40af] dark:text-blue-400 mt-1">•</span>
                    <span>مشاكل تقنية أو دعم فني</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1e40af] dark:text-blue-400 mt-1">•</span>
                    <span>اقتراحات وتحسينات للمنصة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1e40af] dark:text-blue-400 mt-1">•</span>
                    <span>شراكات تعليمية</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

