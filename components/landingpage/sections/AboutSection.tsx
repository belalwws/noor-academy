'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Target, Lightbulb, Rocket, TrendingUp, Users as UsersIcon, BookOpen as BookOpenIcon, Info } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const values = [
    {
      title: 'رؤيتنا',
      description: 'أن نكون المنصة التعليمية الرائدة في تطوير المهارات والمعرفة',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'مهمتنا',
      description: 'توفير تعليم عالي الجودة ومتاح للجميع في بيئة تفاعلية',
      icon: Lightbulb,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'قيمنا',
      description: 'الابتكار، الجودة، والالتزام بنجاح كل متعلم',
      icon: Rocket,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const stats = [
    { number: '500+', label: 'طالب نشط', icon: UsersIcon },
    { number: '50+', label: 'مدرب محترف', icon: TrendingUp },
    { number: '100+', label: 'دورة تدريبية', icon: BookOpenIcon },
  ];

  return (
    <section 
      id="about" 
      dir="rtl"
      className="relative py-12 md:py-16 bg-background-light dark:bg-slate-950 transition-colors duration-300 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-hero pattern-dots opacity-30 -z-10" />
      
      {/* Color Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 via-indigo-500/5 to-transparent pointer-events-none -z-10" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl animate-pulse delay-1000" />

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
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-2.5 rounded-full text-sm font-semibold border border-indigo-200 dark:border-indigo-800 shadow-sm mb-6"
          >
            <Info size={18} />
            <span>من نحن</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary dark:text-slate-50 mb-6 leading-tight">
            <span className="text-[#0A5734] dark:text-[#4A8F5C] font-extrabold">من نحن</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            أكاديمية رُشد هي منصة تعليمية رقمية متخصصة في تقديم دورات تدريبية عالية الجودة 
            في مختلف المجالات. نؤمن بأن التعليم هو مفتاح النمو والتطور، ونسعى لتوفير 
            بيئة تعليمية حديثة تساعد المتعلمين على تحقيق أهدافهم.
          </p>
        </motion.div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
            >
              <Card className="h-full bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <value.icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-text-secondary dark:text-slate-300 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 md:p-12 shadow-lg border border-indigo-100 dark:border-slate-700"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 text-text-primary dark:text-slate-50">
            أرقامنا تتحدث
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="text-primary" size={32} />
                </div>
                <h4 className="text-4xl md:text-5xl font-bold text-[#0A5734] dark:text-[#4A8F5C] mb-2">
                  {stat.number}
                </h4>
                <p className="text-text-secondary dark:text-slate-300 font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
