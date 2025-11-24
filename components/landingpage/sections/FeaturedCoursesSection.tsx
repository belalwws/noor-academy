'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCourses } from '@/hooks/useCourses';
import { Users, BookOpen, Star } from 'lucide-react';

export const FeaturedCoursesSection: React.FC = () => {
  const { courses, loading } = useCourses({ is_published: true });

  // Get first 6 courses
  const featuredCourses = courses.slice(0, 6);

  return (
    <section id="featured-courses" className="py-20 bg-background-light dark:bg-slate-950 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-hero pattern-diagonal -z-10" />
      <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[#1e40af] dark:text-blue-400 font-extrabold">الدورات المميزة</span>
          </h2>
          <p className="text-lg text-text-secondary dark:text-slate-300 max-w-2xl mx-auto">
            اختر من بين مجموعة متنوعة من الدورات التعليمية المتخصصة
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-white dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course, index) => (
              <Card key={course.id} delay={index * 0.1}>
                <div className="flex flex-col h-full">
                  {/* Course Header */}
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-3">
                      <BookOpen size={16} />
                      {course.course_type_display}
                    </div>
                    <h3 className="text-xl font-bold text-text-primary dark:text-slate-50 line-clamp-2">
                      {course.title}
                    </h3>
                  </div>

                  {/* Course Description */}
                  <p className="text-text-secondary dark:text-slate-300 text-sm mb-4 line-clamp-2 flex-grow">
                    {course.description}
                  </p>

                  {/* Teacher Info */}
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-text-secondary dark:text-slate-400">
                      <span className="font-semibold">المدرب:</span> {course.teacher_name}
                    </p>
                    {course.teacher_specialization && (
                      <p className="text-xs text-text-secondary dark:text-slate-400">
                        {course.teacher_specialization}
                      </p>
                    )}
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center gap-1 text-text-secondary dark:text-slate-400">
                      <Users size={16} />
                      <span>{course.enrolled_count} طالب</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <Star size={16} fill="currentColor" />
                      <span>4.5</span>
                    </div>
                  </div>

                  {/* Enroll Button */}
                  <Button variant="primary" size="md" className="w-full">
                    التسجيل الآن
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-text-secondary dark:text-slate-300">
              لا توجد دورات متاحة حالياً
            </p>
          </div>
        )}

        {/* View All Courses Button */}
        {featuredCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button variant="secondary" size="lg">
              عرض جميع الدورات
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

