'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { RefreshCw, BookmarkCheck, BookmarkPlus } from 'lucide-react'

interface HadithControlsProps {
  onRefresh: () => void
  onToggleFavourite: () => void
  isFavourite: boolean
  favouritesCount: number
}

export default function HadithControls({
  onRefresh,
  onToggleFavourite,
  isFavourite,
  favouritesCount
}: HadithControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="flex w-full max-w-sm flex-col gap-3 text-right"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={onRefresh}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-11 md:h-12 text-sm md:text-base font-medium"
        >
          <RefreshCw className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          الحصول على حديث جديد
        </Button>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant={isFavourite ? 'secondary' : 'outline'}
          onClick={onToggleFavourite}
          className={`w-full h-11 md:h-12 text-sm md:text-base font-medium transition-all duration-300 ${
            isFavourite
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl border-0'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          {isFavourite ? (
            <>
              <BookmarkCheck className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              مُضاف إلى المفضلة
            </>
          ) : (
            <>
              <BookmarkPlus className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              حفظ الحديث
            </>
          )}
        </Button>
      </motion.div>
      
      {favouritesCount > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs md:text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
        >
          لديك <span className="font-semibold text-amber-600 dark:text-amber-400">{favouritesCount}</span> حديثاً في قائمة المفضلة لسهولة الرجوع إليها لاحقاً.
        </motion.p>
      )}
    </motion.div>
  )
}

