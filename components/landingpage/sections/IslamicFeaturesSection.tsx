'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  BookOpen, 
  Zap, 
  Heart, 
  Mic,
  ArrowLeft
} from 'lucide-react';

export const IslamicFeaturesSection: React.FC = () => {
  const router = useRouter();

  const features = [
    {
      title: 'مواقيت الصلاة الدقيقة',
      description: 'أوقات صلاة حسب الموقع الجغرافي مع تنبيهات',
      icon: Zap,
      color: 'from-[#1e40af] to-[#2563eb]',
      bgColor: 'from-[#1e40af]/5 to-[#2563eb]/5',
      borderColor: 'border-[#1e40af]/20',
      path: '/prayer-times',
    },
    {
      title: 'قارئ القرآن الكريم',
      description: 'تجربة قراءة متكاملة بأصوات متعددة',
      icon: BookOpen,
      color: 'from-[#2563eb] to-[#3b82f6]',
      bgColor: 'from-[#2563eb]/5 to-[#3b82f6]/5',
      borderColor: 'border-[#2563eb]/20',
      path: '/quran',
    },
    {
      title: 'الحديث اليومي',
      description: 'أحاديث نبوية موثقة مع شروح مبسطة',
      icon: Mic,
      color: 'from-[#1e40af] to-[#2563eb]',
      bgColor: 'from-[#1e40af]/5 to-[#2563eb]/5',
      borderColor: 'border-[#1e40af]/20',
      path: '/hadith',
    },
    {
      title: 'منطقة الذكر والتسبيح',
      description: 'أذكار الصباح والمساء، مسبحة رقمية مع إحصاءات',
      icon: Sparkles,
      color: 'from-[#2563eb] to-[#3b82f6]',
      bgColor: 'from-[#2563eb]/5 to-[#3b82f6]/5',
      borderColor: 'border-[#2563eb]/20',
      path: '/dhikr',
    },
  ];

  return (
    <section 
      id="islamic-features" 
      dir="rtl"
      className="relative py-4 md:py-6 lg:py-6 bg-gradient-to-b from-white via-[#1e40af]/2 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #1e40af 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>
      
      {/* Gradient Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#1e40af]/8 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#C5A15A]/8 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto max-w-6xl px-4 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-center mb-4 sm:mb-6 lg:mb-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#1e40af]/10 to-[#2563eb]/10 dark:from-[#1e40af]/20 dark:to-[#2563eb]/20 px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-full text-xs sm:text-sm font-semibold border border-[#1e40af]/20 dark:border-blue-400/30 shadow-sm mb-3 sm:mb-4 lg:mb-6"
          >
            <Sparkles className="text-[#1e40af] dark:text-blue-400" size={16} />
            <span className="text-[#1e40af] dark:text-blue-400">الأدوات الإسلامية</span>
          </motion.div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-4 text-[#222222] dark:text-slate-50 leading-[1.2] tracking-tight">
            <span className="text-[#1e40af] dark:text-blue-400 font-extrabold block">
              الأدوات الإسلامية في نور
            </span>
          </h2>
          <p className="text-base md:text-lg text-[#555555] dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            نجمع بين التعليم والدين لتقوية الإيمان جنباً إلى جنب مع التطور العلمي
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
              className="group"
            >
              <Card 
                className={`h-full bg-gradient-to-br ${feature.bgColor} dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 ${feature.borderColor} dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden`}
                onClick={() => router.push(feature.path)}
              >
                <div className="p-5 flex flex-col items-center text-center gap-4 h-full">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                  >
                    <feature.icon className="text-white" size={28} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#222222] dark:text-slate-50 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#555555] dark:text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  {/* Arrow Icon */}
                  <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#1e40af] dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>استكشف الأداة</span>
                    <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-[#1e40af]/10 to-[#2563eb]/10 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 lg:p-8 border border-[#1e40af]/20 dark:border-slate-700 shadow-lg"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl md:text-2xl font-bold text-[#222222] dark:text-slate-50 mb-3">
              تجربة إسلامية تعليمية متكاملة
            </h3>
            <p className="text-base md:text-lg text-[#555555] dark:text-slate-300 mb-5 leading-relaxed">
              حرصنا في أكاديمية نور على دمج أدوات ومحتوى إسلامي احترافي يساعدك على تعزيز روح الإيمان بجانب التعليم،
              من خلال تجربة تفاعلية سهلة وممتعة تناسب الأطفال والكبار.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 }}
                className="text-center"
              >
                <h4 className="text-2xl font-bold text-[#1e40af] dark:text-blue-400">4</h4>
                <p className="text-sm text-[#555555] dark:text-slate-300">مزايا إسلامية</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.95 }}
                className="text-center"
              >
                <h4 className="text-2xl font-bold text-[#1e40af] dark:text-blue-400">مجاني</h4>
                <p className="text-sm text-[#555555] dark:text-slate-300">لجميع المستخدمين</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <h4 className="text-2xl font-bold text-[#1e40af] dark:text-blue-400">آمن</h4>
                <p className="text-sm text-[#555555] dark:text-slate-300">محتوى معتمد</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
