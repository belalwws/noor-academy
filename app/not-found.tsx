'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header } from '@/components/landingpage/sections/Header'
import { Home, ArrowRight, Search } from 'lucide-react'

export default function NotFound() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <div lang="ar" dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-slate-950 dark:via-amber-950/20 dark:to-orange-950/20">
      <Header />

      <main className="pt-32 md:pt-40 pb-12 px-4 md:px-6 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Animated 404 Number */}
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="mb-8"
            >
              <div className="relative inline-block">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-9xl md:text-[150px] font-black bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent"
                >
                  404
                </motion.div>
                
                {/* Decorative circles */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-10 -right-10 w-32 h-32 border-2 border-amber-200 dark:border-amber-900/30 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  className="absolute -bottom-10 -left-10 w-24 h-24 border-2 border-orange-200 dark:border-orange-900/30 rounded-full"
                />
              </div>
            </motion.div>

            {/* Main Message */}
            <motion.div variants={itemVariants} className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                عذراً! الصفحة غير موجودة
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                يبدو أنك حاولت الوصول إلى صفحة غير موجودة. قد تكون الصفحة قد تم نقلها أو حذفها.
              </p>
            </motion.div>

            {/* Decorative Icon */}
            <motion.div
              variants={itemVariants}
              className="mb-12 flex justify-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-6 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-full"
              >
                <Search className="w-16 h-16 text-amber-600 dark:text-amber-400" />
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  العودة للصفحة الرئيسية
                </motion.button>
              </Link>

              <Link href="/courses">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold rounded-xl shadow-lg hover:shadow-xl border-2 border-amber-200 dark:border-amber-900/30 transition-all duration-300 flex items-center gap-2"
                >
                  <span>استكشف الدورات</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Helpful Links */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                قد تكون هذه الصفحات مفيدة:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { href: '/', label: 'الصفحة الرئيسية', icon: '🏠' },
                  { href: '/courses', label: 'الدورات', icon: '📚' },
                  { href: '/community', label: 'المجتمع', icon: '👥' },
                  { href: '/about', label: 'عن الأكاديمية', icon: 'ℹ️' },
                ].map((link, idx) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <Link href={link.href}>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 transition-all duration-300 cursor-pointer border border-amber-200 dark:border-amber-900/20"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{link.icon}</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {link.label}
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Footer Message */}
            <motion.p
              variants={itemVariants}
              className="mt-12 text-slate-600 dark:text-slate-400"
            >
              إذا كنت تعتقد أن هذا خطأ، يرجى{' '}
              <a href="mailto:support@academy.com" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                التواصل معنا
              </a>
            </motion.p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

