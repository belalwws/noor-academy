'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Sparkles } from 'lucide-react'

interface HadithHeaderProps {
  totalCount: number
  categories: Array<[string, number]>
}

export default function HadithHeader({ totalCount, categories }: HadithHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col gap-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-700/50 md:flex-row md:items-center md:justify-between"
    >
      <div className="space-y-4 text-right flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge 
            variant="outline" 
            className="border-blue-200 dark:border-blue-500/30 bg-blue-50/80 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-4 py-1.5 text-sm font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 ml-2" />
            المجموع {totalCount} أحاديث
          </Badge>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span className="text-sm font-medium">نافذة نور من السنة النبوية</span>
          </div>
        </div>
        
        <motion.h1
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent"
        >
          نافذة نور من السنة النبوية
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base"
        >
          استلهم من روائع الحديث الشريف وارسم خارطة قيمك اليومية. كل حديث يحمل رسالة توقظ القلب وتدفع إلى عمل صالح أو فكرة ملهمة.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-end gap-3"
        >
          {categories.map(([category, count], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Badge
                variant="outline"
                className="border-amber-200 dark:border-amber-500/40 bg-amber-50/80 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3 py-1.5 text-xs md:text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300"
              >
                {category} • {count}
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

