import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  BookOpen, 
  Languages, 
  Globe, 
  Code, 
  GraduationCap, 
  Users 
} from 'lucide-react';

export const CourseCategoriesSection: React.FC = () => {
  const categories = [
    {
      title: 'الدروس والفيديوهات',
      description: 'محتوى تعليمي منظم في وحدات ودروس فرعية',
      icon: BookOpen,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'التمارين التفاعلية',
      description: 'اختبارات ومسائل بمستويات مختلفة مع تقييم فوري',
      icon: Code,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      title: 'الجلسات المباشرة',
      description: 'بث حي للمحاضرات مع إمكانية التفاعل المباشر',
      icon: Users,
      color: 'bg-green-500/10 text-green-600',
    },
    {
      title: 'تتبع التقدم',
      description: 'تقارير تفصيلية ونسبة إكمال المحتوى',
      icon: GraduationCap,
      color: 'bg-orange-500/10 text-orange-600',
    },
    {
      title: 'الواجبات والمشاريع',
      description: 'تسليم الواجبات وتقييمات من المعلمين',
      icon: Languages,
      color: 'bg-red-500/10 text-red-600',
    },
    {
      title: 'الشهادات المعتمدة',
      description: 'شهادات إتمام معتمدة لجميع الدورات',
      icon: Globe,
      color: 'bg-teal-500/10 text-teal-600',
    },
  ];

  return (
    <section id="courses" className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[#0A5734] dark:text-[#4A8F5C] font-extrabold">محتوى الدورات والتعليم</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            محتوى تعليمي شامل بأنواع مختلفة ينسجم مع احتياجات الطلاب
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Card key={category.title} delay={index * 0.1}>
              <div className="flex flex-col items-center text-center gap-4">
                <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110`}>
                  <category.icon size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    {category.title}
                  </h3>
                  <p className="text-text-secondary">
                    {category.description}
                  </p>
                </div>
                <button className="mt-2 text-primary font-semibold hover:text-primary-dark transition-colors">
                  استكشف الدورات ←
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
