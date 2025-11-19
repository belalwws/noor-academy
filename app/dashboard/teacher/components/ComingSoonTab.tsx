'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

interface ComingSoonTabProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  gradientFrom: string
  gradientVia: string
  gradientTo: string
  iconBg: string
  textColor: string
  rotation?: string
}

export default function ComingSoonTab({
  icon,
  title,
  description,
  features,
  gradientFrom,
  gradientVia,
  gradientTo,
  iconBg,
  textColor,
  rotation = "rotate-3"
}: ComingSoonTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden text-center py-16 md:py-24 bg-gradient-to-br ${gradientFrom} dark:from-slate-800 ${gradientVia} dark:via-slate-700 ${gradientTo} dark:to-slate-800 rounded-2xl md:rounded-3xl border-0 shadow-2xl`}
    >
      {/* Decorative Elements */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-6 right-6 w-32 h-32 bg-gradient-to-br from-purple-400/20 dark:from-purple-600/20 to-purple-400/20 dark:to-purple-600/20 rounded-full blur-2xl`}
      ></motion.div>
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className={`absolute bottom-6 left-6 w-24 h-24 bg-gradient-to-br from-purple-400/20 dark:from-purple-600/20 to-purple-400/20 dark:to-purple-600/20 rounded-full blur-xl`}
      ></motion.div>
      
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          whileHover={{ rotate: 0, scale: 1.1 }}
          className={`${iconBg} w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-2xl transform ${rotation}`}
        >
          {icon}
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-center gap-3"
        >
          {title}
        </motion.h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 max-w-lg mx-auto border border-white/40 dark:border-slate-700/40 shadow-lg"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`${textColor} dark:text-purple-300 text-lg md:text-xl font-semibold mb-3`}
          >
            قريبًا على المنصة
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 text-sm md:text-base"
          >
            {description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm text-slate-600 dark:text-slate-400"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg"
              >
                <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600 dark:text-purple-400" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
