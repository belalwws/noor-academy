'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { Batch } from '@/lib/types/live-education'

interface BatchHeaderProps {
  batch: Batch
  studentsCount: number
}

export default function BatchHeader({ batch, studentsCount }: BatchHeaderProps) {
  return (
    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-50 flex-1">
          {batch.name}
        </h1>
        <Badge className={`shrink-0 ${
          batch.status === 'active' 
            ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
            : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
        }`}>
          {batch.status === 'active' ? 'نشط' : 'مغلق'}
        </Badge>
      </div>
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">
        {batch.course_title || 'دورة غير معروفة'}
      </p>
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {batch.teacher_name || 'معلم غير معروف'}
        </p>
        <span className="text-xs text-gray-400">•</span>
        <Badge variant="outline" className="text-xs">
          {batch.type === 'individual' ? 'فردي' : 'جماعي'}
        </Badge>
        <span className="text-xs text-gray-400">•</span>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {typeof batch.students_count === 'number' 
            ? batch.students_count 
            : (typeof batch.students_count === 'string' 
              ? parseInt(batch.students_count) || 0 
              : (batch.current_students || studentsCount || 0))} / {batch.max_students} طالب
        </p>
      </div>
    </div>
  )
}

