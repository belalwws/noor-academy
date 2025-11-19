'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface BatchErrorStateProps {
  error: string | null
  batchId: string
}

export default function BatchErrorState({ error, batchId }: BatchErrorStateProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-20 flex items-center justify-center">
      <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 max-w-md">
        <div className="mb-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'المجموعة غير موجودة'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-1">
            لم يتم العثور على المجموعة المطلوبة
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Batch ID: {batchId}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/teacher')}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          العودة للوحة التحكم
        </button>
      </div>
    </div>
  )
}

