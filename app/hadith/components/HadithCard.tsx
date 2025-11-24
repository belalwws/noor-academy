'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Quote, Sparkles } from 'lucide-react'

export interface Hadith {
  id: string
  arabic: string
  translation: string
  narrator: string
  source: string
  grade: string
  lesson: string
  category: string
}

interface HadithCardProps {
  hadith: Hadith
}

export default function HadithCard({ hadith }: HadithCardProps) {
  return (
    <motion.div
      key={hadith.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="w-full"
    >
      <Card className="overflow-hidden border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300">
        <CardHeader className="flex items-start justify-between gap-4 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/20 border-b border-slate-200/50 dark:border-slate-700/50 p-6 md:p-8">
          <div className="space-y-3 text-right flex-1">
            <div className="flex items-center justify-end gap-2 flex-wrap">
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1.5 text-sm font-medium shadow-md">
                {hadith.category}
              </Badge>
            </div>
            
            <CardTitle className="flex items-center justify-end gap-2 text-slate-900 dark:text-white text-xl md:text-2xl">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-indigo-500 dark:text-indigo-400" />
              من روائع الحديث
            </CardTitle>
            
            <div className="flex flex-wrap items-center justify-end gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="font-medium">الراوي:</span>
                <span>{hadith.narrator}</span>
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="flex items-center gap-1.5">
                <span className="font-medium">المصدر:</span>
                <span>{hadith.source}</span>
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="flex items-center gap-1.5">
                <span className="font-medium">الحكم:</span>
                <Badge variant="outline" className="border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5">
                  {hadith.grade}
                </Badge>
              </span>
            </div>
          </div>
          
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            whileHover={{ rotate: 5, scale: 1.1 }}
            className="hidden md:block"
          >
            <Quote className="h-12 w-12 md:h-16 md:w-16 text-indigo-200/60 dark:text-indigo-500/40" />
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6 text-right p-6 md:p-8">
          {/* Arabic Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100/30 to-blue-100/30 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-full blur-2xl -z-10" />
            <p
              className="text-xl md:text-2xl lg:text-3xl leading-loose md:leading-relaxed text-slate-900 dark:text-slate-100 font-medium"
              style={{ fontFamily: "'Amiri', 'Cairo', serif", lineHeight: '2.2' }}
            >
              {hadith.arabic}
            </p>
          </motion.div>

          {/* Translation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-gradient-to-br from-slate-100/80 to-slate-50/80 dark:from-slate-800/60 dark:to-slate-700/60 p-5 md:p-6 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
              <span className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                التفسير
              </span>
            </div>
            <p className="text-sm md:text-base leading-relaxed">{hadith.translation}</p>
          </motion.div>

          {/* Lesson */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50/60 to-blue-50/60 dark:from-indigo-500/10 dark:to-blue-500/10 p-5 md:p-6 text-indigo-900 dark:text-indigo-100 shadow-md"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-indigo-500 dark:text-indigo-400" />
              <span className="text-xs md:text-sm font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                العبرة والدروس
              </span>
            </div>
            <p className="text-sm md:text-base leading-relaxed font-medium">{hadith.lesson}</p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

