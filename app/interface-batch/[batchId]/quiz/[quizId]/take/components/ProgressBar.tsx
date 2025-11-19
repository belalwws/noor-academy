'use client'

import React from 'react'

interface ProgressBarProps {
  current: number
  total: number
  answered: number
}

export default function ProgressBar({ current, total, answered }: ProgressBarProps) {
  const percentage = (current / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          السؤال {current} من {total}
        </p>
        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
          {answered} / {total} مجاب
        </p>
      </div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
