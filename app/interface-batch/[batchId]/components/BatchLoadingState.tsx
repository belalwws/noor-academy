'use client'

import React from 'react'
import { RefreshCw } from 'lucide-react'

export default function BatchLoadingState() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] flex items-center justify-center pt-16">
      <div className="text-center space-y-4">
        <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
        <h2 className="text-lg font-semibold text-white">
          جاري تحميل المجموعة...
        </h2>
        <p className="text-sm text-gray-400">يرجى الانتظار</p>
      </div>
    </div>
  )
}

