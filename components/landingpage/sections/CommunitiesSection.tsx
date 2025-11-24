'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Users, 
  MessageSquare,
  CheckCircle
} from 'lucide-react';

export const CommunitiesSection: React.FC = () => {
  const communities = [
    {
      title: 'مجتمع المجموعات',
      description: 'مجتمع خاص يجمع الطلاب في مجموعات تعليمية منظمة، يتيح التواصل والتفاعل بين أعضاء المجموعة الواحدة',
      icon: Globe,
      features: [
        'مجموعات تعليمية منظمة',
        'تواصل مباشر بين أعضاء المجموعة',
        'مشاركة الملفات والموارد',
        'بيئة تفاعلية آمنة ومحكمة',
      ],
      color: 'from-[#1e40af] to-[#2563eb]',
      bgColor: 'from-[#1e40af]/5 to-[#2563eb]/5',
      borderColor: 'border-[#1e40af]/20',
      iconColor: 'text-[#1e40af] dark:text-blue-400',
    },
    {
      title: 'مجتمعات الدورات المباشرة',
      description: 'مجتمع خاص يجمع المعلم مع طلابه لكل دورة مباشرة في النظام',
      icon: MessageSquare,
      features: [
        'نقاش وتبادل آراء',
        'مشاركة الملفات والواجبات',
        'طرح الأسئلة والاستفسارات',
        'استمرارية التواصل بعد الحصة',
      ],
      color: 'from-[#2563eb] to-[#3b82f6]',
      bgColor: 'from-[#2563eb]/5 to-[#3b82f6]/5',
      borderColor: 'border-[#2563eb]/20',
      iconColor: 'text-[#2563eb] dark:text-[#3b82f6]',
    },
  ];

  return (
    <section 
      id="communities" 
      dir="rtl"
      className="relative py-12 md:py-16 bg-background-light dark:bg-slate-950 transition-colors duration-300 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-hero pattern-dots opacity-30 -z-10" />
      
      {/* Color Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1e40af]/10 via-[#1e40af]/5 to-transparent pointer-events-none -z-10" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#1e40af]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#2563eb]/10 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-[#1e40af]/10 rounded-full blur-2xl animate-pulse delay-1000" />

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
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1e40af]/10 to-[#2563eb]/10 text-[#1e40af] dark:text-blue-400 px-4 py-2.5 rounded-full text-sm font-semibold border border-[#1e40af]/20 dark:border-blue-400/30 shadow-sm mb-6"
          >
            <Users size={18} />
            <span>مجتمعات تفاعلية</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary dark:text-slate-50 mb-6 leading-tight">
            <span className="text-[#1e40af] dark:text-blue-400 font-extrabold">نظام المجتمعات التفاعلية</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            نوعان من المجتمعات المنظمة والآمنة لتعزيز التواصل والتفاعل بين الطلاب والمعلمين
          </p>
        </motion.div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
          {communities.map((community, index) => (
            <motion.div
              key={community.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
              className={`bg-gradient-to-br ${community.bgColor} dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border ${community.borderColor} dark:border-slate-700 hover:scale-105`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${community.color} rounded-2xl flex items-center justify-center shadow-lg mb-6`}>
                <community.icon className="text-white" size={32} />
              </div>

              <h3 className="text-2xl font-bold text-text-primary dark:text-slate-50 mb-3">
                {community.title}
              </h3>
              
              <p className="text-text-secondary dark:text-slate-300 mb-6 leading-relaxed">
                {community.description}
              </p>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">المميزات:</p>
                {community.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className={`${community.iconColor} mt-0.5 flex-shrink-0`} size={18} />
                    <span className="text-sm text-text-secondary dark:text-slate-300 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-[#1e40af]/5 to-[#2563eb]/5 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 lg:p-12 border border-[#1e40af]/20 dark:border-slate-700 shadow-lg mb-8"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-text-primary dark:text-slate-50 mb-4 flex items-center justify-center gap-2">
              <CheckCircle className="text-[#1e40af] dark:text-blue-400" size={28} />
              تفاعل آمن ومنظم
            </h3>
            <p className="text-lg text-text-secondary dark:text-slate-300 leading-relaxed">
              نوفر بيئة تفاعلية آمنة حيث يمكن للطلاب والمعلمين التواصل والتعاون بفعالية،
              مع الحفاظ على خصوصية البيانات وسلامة المحتوى.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
