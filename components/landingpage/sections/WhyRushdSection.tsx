'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  Video,
  PlayCircle,
  Gamepad2,
  FlaskConical,
  Users, 
  Award, 
  Star
} from 'lucide-react';

export const WhyRushdSection: React.FC = () => {
  const features = [
    {
      title: 'دورات مباشرة تفاعلية',
      description: 'انضم إلى جلسات تعليمية مباشرة مع مدربين محترفين. تفاعل مباشر، طرح أسئلة فورية، وإجابات لحظية في بيئة ديناميكية تشجع على المشاركة',
      icon: Video,
      color: 'from-red-500 to-orange-500',
      bgColor: 'from-red-50 to-orange-50',
      borderColor: 'border-red-100',
    },
    {
      title: 'دورات مسجلة مرنة',
      description: 'تعلم في الوقت والمكان الذي يناسبك مع دورات مسجلة عالية الجودة. أعد مشاهدة الدروس متى احتجت، محتوى منظم ومتاح دائماً',
      icon: PlayCircle,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'ألعاب تفاعلية ممتعة',
      description: 'تعلم من خلال الألعاب والتمارين التفاعلية المتنوعة. نظام مكافآت وتحفيز، تقييم فوري، وتمارين تفاعلية تجعل التعلم أكثر متعة وفعالية',
      icon: Gamepad2,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-100',
    },
    {
      title: 'مختبر المعرفة الشامل',
      description: 'بنك أسئلة شامل في مختلف المواضيع. تمارين تفاعلية، اختبارات شاملة، وتقييم فوري للأداء لتعزيز المعرفة والفهم',
      icon: FlaskConical,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-100',
    },
    {
      title: 'مجتمعات تفاعلية منظمة',
      description: 'نوعان من المجتمعات: مجتمع المجموعات التعليمية ومجتمعات الدورات المباشرة. تواصل فعال وآمن بين الطلاب والمعلمين في بيئة محكمة',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-100',
    },
    {
      title: 'مزايا إسلامية متكاملة',
      description: 'أدوات إسلامية شاملة: أذكار الصباح والمساء، مسبحة رقمية، قارئ القرآن الكريم، مواقيت الصلاة الدقيقة، والحديث اليومي',
      icon: Award,
      color: 'from-blue-500 to-blue-500',
      bgColor: 'from-blue-50 to-blue-50',
      borderColor: 'border-blue-100',
    },
  ];

  return (
    <section 
      id="why-rushd" 
      dir="rtl"
      className="relative py-12 md:py-16 bg-white dark:bg-slate-900 transition-colors duration-300 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-hero pattern-dots opacity-30 -z-10" />
      
      {/* Color Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-primary/5 to-transparent pointer-events-none -z-10" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse delay-1000" />

      <div className="container mx-auto px-4 lg:px-8 py-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary dark:text-primary px-4 py-2.5 rounded-full text-sm font-semibold border border-primary/20 dark:border-primary/30 shadow-sm mb-6"
          >
            <Star size={18} />
            <span>لماذا رُشد؟</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary dark:text-slate-50 mb-6 leading-tight">
            <span className="text-[#1e40af] dark:text-blue-400 font-extrabold">لماذا أكاديمية رُشد؟</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            نقدم لك تجربة تعليمية متكاملة تجمع بين الجودة والابتكار في بيئة تفاعلية وآمنة. 
            منصة شاملة تجمع كل ما تحتاجه للتعلم والتطوير: دورات مباشرة ومسجلة، ألعاب تفاعلية، 
            مختبر معرفة شامل، مجتمعات تفاعلية، ومزايا إسلامية متكاملة
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
            >
              <Card className={`h-full bg-gradient-to-br ${feature.bgColor} dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border ${feature.borderColor} dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <div className="flex flex-col items-center text-center gap-4 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <feature.icon className="text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary dark:text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
