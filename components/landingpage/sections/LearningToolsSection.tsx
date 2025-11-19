import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  Calendar, 
  CheckSquare, 
  TrendingUp, 
  MessageSquare, 
  Video, 
  BookOpen, 
  Award, 
  BarChart,
  Clock
} from 'lucide-react';

export const LearningToolsSection: React.FC = () => {
  const tools = [
    {
      title: 'تقويم دراسي',
      description: 'تنظيم وجدولة الدروس والاختبارات',
      icon: Calendar,
      status: 'متاح',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'إدارة المهام',
      description: 'تتبع المهام والواجبات الدراسية',
      icon: CheckSquare,
      status: 'متاح',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'لوحة متابعة التقدم',
      description: 'مراقبة تقدمك في الدورات',
      icon: TrendingUp,
      status: 'متاح',
      color: 'from-primary to-accent',
    },
    {
      title: 'منتدى النقاش',
      description: 'تبادل الأفكار مع الطلاب والمدربين',
      icon: MessageSquare,
      status: 'قيد التطوير',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'قاعة المحاضرات المباشرة',
      description: 'حضور الجلسات التعليمية مباشرة',
      icon: Video,
      status: 'متاح',
      color: 'from-red-500 to-orange-500',
    },
    {
      title: 'مكتبة إلكترونية',
      description: 'الوصول إلى مصادر تعليمية متنوعة',
      icon: BookOpen,
      status: 'قيد التطوير',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'التقييم الذاتي',
      description: 'اختبر معرفتك وتقييم مستواك',
      icon: BarChart,
      status: 'قيد التطوير',
      color: 'from-teal-500 to-green-500',
    },
    {
      title: 'لوحة إنجازات الطالب',
      description: 'عرض شهاداتك وإنجازاتك',
      icon: Award,
      status: 'متاح',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <section className="py-20 bg-background-light dark:bg-slate-900">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-slate-50">
            <span className="text-[#0A5734] dark:text-[#4A8F5C] font-extrabold">أدوات تعليمية تفاعلية</span>
          </h2>
          <p className="text-lg text-text-secondary dark:text-slate-300 max-w-2xl mx-auto">
            مجموعة متكاملة من الأدوات لتحسين تجربتك التعليمية وتحقيق أهدافك
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <Card key={tool.title} delay={index * 0.05}>
              <div className="flex flex-col items-center text-center gap-4 relative">
                {/* Status Badge */}
                <div className="absolute -top-2 -left-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    tool.status === 'متاح'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                  }`}>
                    {tool.status === 'متاح' ? (
                      <span className="flex items-center gap-1">
                        ✓ {tool.status}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {tool.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className={`w-16 h-16 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center shadow-lg mt-2`}>
                  <tool.icon className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-slate-50 mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-text-secondary dark:text-slate-300">
                    {tool.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
