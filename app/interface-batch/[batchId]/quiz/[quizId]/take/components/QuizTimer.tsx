'use client'

import React, { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface QuizTimerProps {
  initialTime: number // in seconds
  onTick: (remaining: number) => void
  isActive: boolean
}

export default function QuizTimer({ initialTime, onTick, isActive }: QuizTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1)
        onTick(newTime)
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, onTick])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isWarning = timeRemaining < 60 && timeRemaining > 0
  const isAlert = timeRemaining === 0

  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${
        isAlert 
          ? 'bg-red-100 dark:bg-red-900/30' 
          : isWarning 
          ? 'bg-yellow-100 dark:bg-yellow-900/30'
          : 'bg-blue-100 dark:bg-blue-900/30'
      }`}>
        <Clock className={`w-5 h-5 ${
          isAlert
            ? 'text-red-600'
            : isWarning
            ? 'text-yellow-600'
            : 'text-blue-600'
        }`} />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-slate-400">الوقت المتبقي</p>
        <p className={`text-lg font-bold font-mono ${
          isAlert
            ? 'text-red-600'
            : isWarning
            ? 'text-yellow-600'
            : 'text-blue-600'
        }`}>
          {formatTime(timeRemaining)}
        </p>
      </div>
    </div>
  )
}
