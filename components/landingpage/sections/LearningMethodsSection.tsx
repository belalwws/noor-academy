'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  Video, 
  PlayCircle, 
  Users, 
  BookOpen, 
  Gamepad2,
  Sparkles
} from 'lucide-react';

export const LearningMethodsSection: React.FC = () => {
  const methods = [
    {
      title: 'دورات مباشرة',
      description: 'انضم إلى جلسات تعليمية مباشرة مع المدربين والتفاعل في الوقت الفعلي',
      icon: Video,
      color: 'from-red-500 to-orange-500',
      href: '/live-teaching',
    },
    {
      title: 'دورات مسجلة',
      description: 'تعلم في الوقت الذي يناسبك من خلال محتوى مسجل عالي الجودة',
      icon: PlayCircle,
      color: 'from-blue-500 to-cyan-500',
      href: '/recorded-courses',
    },
    {
      title: 'تعلم تفاعلي',
      description: 'استمتع بتجربة تعليمية ممتعة من خلال الألعاب والتمارين التفاعلية',
      icon: Gamepad2,
      color: 'from-green-500 to-emerald-500',
      href: '/interactive-learning',
    },
    {
      title: 'مجتمعات تعليمية',
      description: 'انضم إلى مجتمعات تفاعلية للتعلم والنقاش مع زملائك والمدربين',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      href: '/community',
    },
    {
      title: 'مكتبة تعليمية',
      description: 'استكشف مجموعة واسعة من المصادر والمواد التعليمية',
      icon: BookOpen,
      color: 'from-indigo-500 to-blue-500',
      href: '/courses',
    },
  ];

  return (
    <section className="py-20 bg-background-light dark:bg-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-primary dark:text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-primary bg-clip-text text-transparent">
                طرق التعلم
              </span>
            </h2>
            <Sparkles className="w-10 h-10 text-primary dark:text-primary" />
          </div>
          <p className="text-lg text-text-secondary dark:text-slate-300 max-w-3xl mx-auto">
            نوفر لك طرقاً متنوعة للتعلم تناسب احتياجاتك وأسلوبك المفضل
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method, index) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-glow transition-all duration-300 cursor-pointer group">
                <div className="flex flex-col items-center text-center gap-4 p-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <method.icon className="text-white" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-2">
                      {method.title}
                    </h3>
                    <p className="text-text-secondary dark:text-slate-300">
                      {method.description}
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


