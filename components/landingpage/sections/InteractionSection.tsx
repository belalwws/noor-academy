'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  MessageSquare,
  Gamepad2,
  Users,
  CheckCircle,
  Target,
  Trophy,
  Star,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export const InteractionSection: React.FC = () => {
  const interactions = [
    {
      type: 'communities',
      icon: Users,
      badge: 'نظام المجتمعات',
      title: 'مجتمعات تفاعلية',
      subtitle: 'تواصل وتعاون فعال',
      description: 'نوفر بيئة تفاعلية آمنة حيث يمكن للطلاب والمعلمين التواصل والتعاون بفعالية، مع الحفاظ على خصوصية البيانات وسلامة المحتوى.',
      features: [
        {
          title: 'مجتمع المجموعات',
          description: 'مجتمع خاص يجمع الطلاب في مجموعات تعليمية منظمة',
          icon: Globe,
          items: [
            'مجموعات تعليمية منظمة',
            'تواصل مباشر بين أعضاء المجموعة',
            'مشاركة الملفات والموارد',
            'بيئة تفاعلية آمنة ومحكمة',
          ],
        },
        {
          title: 'مجتمعات الدورات المباشرة',
          description: 'مجتمع خاص يجمع المعلم مع طلابه لكل دورة مباشرة',
          icon: MessageSquare,
          items: [
            'نقاش وتبادل آراء',
            'مشاركة الملفات والواجبات',
            'طرح الأسئلة والاستفسارات',
            'استمرارية التواصل بعد الحصة',
          ],
        },
      ],
      link: '/communities',
      gradient: 'from-[#1e40af] to-[#2563eb]',
      bgGradient: 'from-[#1e40af]/10 to-[#2563eb]/10',
      borderColor: 'border-[#1e40af]/30',
    },
    {
      type: 'games',
      icon: Gamepad2,
      badge: 'ألعاب تفاعلية',
      title: 'تعلم ممتع',
      subtitle: 'من خلال الألعاب التفاعلية',
      description: 'حوّل تعلمك إلى مغامرة تفاعلية ممتعة! استمتع بألعاب تعليمية مبتكرة تجمع بين المتعة والفائدة مع تقييم فوري لأدائك.',
      features: [
        {
          title: 'تمارين تفاعلية متنوعة',
          description: 'أنواع متعددة من التمارين: اختيار من متعدد، صواب وخطأ، توصيل العناصر',
          icon: Target,
        },
        {
          title: 'نظام المكافآت والتحفيز',
          description: 'احصل على نقاط ومكافآت عند إكمال التحديات مع مؤشرات تقدم واضحة',
          icon: Trophy,
        },
        {
          title: 'تقييم فوري وتحليل الأداء',
          description: 'احصل على تقييم فوري لأدائك مع تحليل مفصل يوضح نقاط القوة والتحسين',
          icon: Star,
        },
      ],
      link: '/interactive-learning',
      gradient: 'from-[#2563eb] to-[#C5A15A]',
      bgGradient: 'from-[#2563eb]/10 to-[#C5A15A]/10',
      borderColor: 'border-[#2563eb]/30',
    },
  ];

  return (
    <section 
      id="interaction" 
      dir="rtl"
      className="relative py-4 sm:py-5 md:py-6 lg:py-6 bg-gradient-to-b from-white via-[#2563eb]/4 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300 overflow-hidden"
    >
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(30deg, #1e40af 1px, transparent 1px), linear-gradient(-30deg, #1e40af 1px, transparent 1px)`,
          backgroundSize: '88px 88px'
        }} />
      </div>

      {/* Sophisticated Gradient Accents */}
      <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-gradient-to-r from-[#C5A15A]/6 via-[#2563eb]/4 to-transparent rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 right-0 w-[600px] h-[600px] bg-gradient-to-l from-[#1e40af]/6 via-[#2563eb]/4 to-transparent rounded-full blur-[100px]" />

      <div className="container mx-auto max-w-6xl px-4 lg:px-8 relative z-10">
        {/* Header - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9 }}
          className="text-center mb-4 sm:mb-6 lg:mb-8 max-w-4xl mx-auto"
        >
          <h2 className="text-base sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-[#222222] dark:text-slate-50 mb-2 sm:mb-3 lg:mb-4 leading-[1.2] tracking-tight">
            انضم إلى مجتمعات تفاعلية
            <span className="block mt-1 sm:mt-2 lg:mt-3 text-[#1e40af] dark:text-blue-400 font-extrabold">
              واستمتع بألعاب تعليمية
            </span>
          </h2>
          <p className="hidden sm:block text-base md:text-lg text-[#555555] dark:text-slate-300 leading-relaxed font-light mb-4">
            تجربة تعليمية شاملة تجمع بين المتعة والفائدة
          </p>
          
          {/* Badge - Moved below */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring" }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1e40af]/10 via-[#C5A15A]/8 to-[#2563eb]/10 dark:from-[#1e40af]/20 dark:via-[#C5A15A]/15 dark:to-[#2563eb]/20 px-5 py-2 rounded-full border border-[#1e40af]/20 dark:border-blue-400/30 shadow-lg backdrop-blur-sm"
          >
            <Sparkles className="text-[#1e40af] dark:text-blue-400" size={16} />
            <span className="text-xs font-bold text-[#1e40af] dark:text-blue-400 tracking-wide">التفاعل والمشاركة</span>
          </motion.div>
        </motion.div>

        {/* Interactions Grid - Enhanced Layout */}
        <div className="grid md:grid-cols-2 gap-5 lg:gap-6 max-w-7xl mx-auto">
          {interactions.map((interaction, index) => {
            const Icon = interaction.icon;
            return (
              <motion.div
                key={interaction.type}
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative"
              >
                {/* Main Card - Premium Design */}
                <div className={`relative bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-5 md:p-7 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 ${interaction.borderColor} dark:border-slate-700/50 h-full flex flex-col overflow-hidden backdrop-blur-sm`}>
                  {/* Animated Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${interaction.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Corner Accent - Enhanced */}
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${interaction.gradient} opacity-[0.08] rounded-tl-[2.5rem] rounded-br-full`} />
                  <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-[#C5A15A]/5 to-transparent rounded-bl-[2.5rem] rounded-tl-full" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Badge - Enhanced */}
                    <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${interaction.gradient}/15 dark:${interaction.gradient}/25 px-4 py-2 rounded-full text-xs font-bold border-2 ${interaction.borderColor} dark:border-blue-400/40 shadow-md mb-4 w-fit`}>
                      <Icon className={`text-[#1e40af] dark:text-blue-400`} size={16} />
                      <span className={`text-[#1e40af] dark:text-blue-400`}>{interaction.badge}</span>
                    </div>

                    {/* Title - Enhanced */}
                    <h3 className="text-base sm:text-xl md:text-3xl font-extrabold mb-2 sm:mb-3 leading-[1.2]">
                      <span className={`text-[#1e40af] dark:text-blue-400 font-extrabold block mb-1 sm:mb-2`}>
                        {interaction.title}
                      </span>
                      <span className="text-[#222222] dark:text-slate-50 text-sm sm:text-lg md:text-xl block mt-1 sm:mt-2">{interaction.subtitle}</span>
                    </h3>

                    {/* Description - Enhanced */}
                    <p className="hidden sm:block text-sm md:text-base text-[#555555] dark:text-slate-300 mb-3 sm:mb-5 leading-relaxed">
                      {interaction.description}
                    </p>

                    {/* Features - Enhanced Layout */}
                    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-5 flex-1">
                      {interaction.features.map((feature, idx) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + idx * 0.1, type: "spring" }}
                            className="group/feature relative bg-gradient-to-br from-white to-[#1e40af]/5 dark:from-slate-800 dark:to-slate-800/60 rounded-xl p-2.5 sm:p-4 border-2 border-[#1e40af]/10 dark:border-slate-700/50 hover:border-[#1e40af]/40 dark:hover:border-blue-400/40 transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${interaction.gradient}/15 flex items-center justify-center border-2 ${interaction.borderColor} dark:border-blue-400/40 flex-shrink-0 group-hover/feature:scale-110 group-hover/feature:rotate-3 transition-transform`}>
                                <FeatureIcon className={`text-[#1e40af] dark:text-blue-400`} size={16} style={{ width: '16px', height: '16px' }} />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-xs sm:text-sm md:text-base font-extrabold text-[#222222] dark:text-slate-50 mb-1 sm:mb-1.5">
                                  {feature.title}
                                </h4>
                                <p className="text-[10px] sm:text-xs md:text-sm text-[#555555] dark:text-slate-300 mb-1.5 sm:mb-2.5 leading-relaxed">
                                  {feature.description}
                                </p>
                                {feature.items && (
                                  <ul className="space-y-1.5 sm:space-y-2 mt-2 sm:mt-3">
                                    {feature.items.map((item, itemIdx) => (
                                      <li key={itemIdx} className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-[#555555] dark:text-slate-400">
                                        <CheckCircle className="text-[#1e40af] dark:text-blue-400 mt-0.5 flex-shrink-0" size={12} style={{ width: '12px', height: '12px' }} />
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* CTA Button - Enhanced */}
                    <Link href={interaction.link} className="mt-auto">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className={`w-full bg-gradient-to-r ${interaction.gradient} hover:opacity-95 text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn py-2.5 sm:py-4 md:py-5 text-xs sm:text-sm lg:text-base font-bold rounded-lg overflow-hidden relative`}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                        <span className="relative z-10">استكشف الآن</span>
                        <ArrowLeft className="mr-2 group-hover/btn:translate-x-1 transition-transform relative z-10" size={14} style={{ width: '14px', height: '14px' }} />
                      </Button>
                    </Link>
                  </div>

                  {/* Bottom Accent Line - Enhanced */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${interaction.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-3xl`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
