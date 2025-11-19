'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, Target } from 'lucide-react';

interface CourseDetailsProps {
  course: {
    title: string;
    description: string;
    instructor: string;
    startDate: string;
    endDate: string;
    studentsCount: number;
    status: string;
    objectives?: string[];
    requirements?: string[];
  };
}

export default function CourseDetails({ course }: CourseDetailsProps) {
  return (
    <div className="space-y-4">
      {/* Description Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-slate-50">الوصف</h3>
        </div>
        <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{course.description}</p>
      </motion.div>

      {/* Objectives Card */}
      {course.objectives && course.objectives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-50">الأهداف</h3>
          </div>
          <ul className="space-y-2">
            {course.objectives.map((obj, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                <span className="text-primary mt-1">•</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              <span className="text-sm text-gray-600 dark:text-slate-400">المعلم</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-slate-50">{course.instructor}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              <span className="text-sm text-gray-600 dark:text-slate-400">عدد الطلاب</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-slate-50">{course.studentsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              <span className="text-sm text-gray-600 dark:text-slate-400">البداية</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-slate-50">{course.startDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              <span className="text-sm text-gray-600 dark:text-slate-400">النهاية</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-slate-50">{course.endDate}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
