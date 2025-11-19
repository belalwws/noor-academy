'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HadithHeader, HadithCard, HadithControls } from './components'
import { hadithCollection } from './data/hadiths'
import type { Hadith as HadithType } from './components'

export default function HadithPage() {
  const [currentHadith, setCurrentHadith] = useState<HadithType>(hadithCollection[0])
  const [favourites, setFavourites] = useState<string[]>([])

  useEffect(() => {
    console.log('📖 [Hadith Page] Hadith page loaded');
  }, []);

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    hadithCollection.forEach(hadith => {
      counts.set(hadith.category, (counts.get(hadith.category) ?? 0) + 1)
    })
    return [...counts.entries()]
  }, [])

  const handleRefresh = () => {
    const pool = hadithCollection.filter(h => h.id !== currentHadith.id)
    const next = pool[Math.floor(Math.random() * pool.length)] ?? hadithCollection[0]
    setCurrentHadith(next)
  }

  const toggleFavourite = () => {
    setFavourites(prev =>
      prev.includes(currentHadith.id)
        ? prev.filter(item => item !== currentHadith.id)
        : [...prev, currentHadith.id]
    )
  }

  const isFavourite = favourites.includes(currentHadith.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 md:pt-28 lg:pt-32">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-5rem] right-[-6rem] h-96 w-96 rounded-full bg-gradient-to-br from-blue-200/20 to-indigo-200/20 blur-3xl dark:from-blue-500/10 dark:to-indigo-500/10"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
            x: [0, -40, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-6rem] left-[-4rem] h-80 w-80 rounded-full bg-gradient-to-br from-purple-200/20 to-pink-200/20 blur-3xl dark:from-purple-500/10 dark:to-pink-500/10"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-[#0A5734]/15 to-[#4A8F5C]/15 dark:from-[#0A5734]/8 dark:to-[#4A8F5C]/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6 lg:px-8 pt-4 pb-8 md:pb-10 lg:pb-12 space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between">
          <div className="flex-1">
            <HadithHeader
              totalCount={hadithCollection.length}
              categories={categories}
            />
          </div>
          
          <div className="lg:min-w-[320px]">
            <HadithControls
              onRefresh={handleRefresh}
              onToggleFavourite={toggleFavourite}
              isFavourite={isFavourite}
              favouritesCount={favourites.length}
            />
          </div>
        </div>

        {/* Hadith Card */}
        <AnimatePresence mode="wait">
          <HadithCard key={currentHadith.id} hadith={currentHadith} />
        </AnimatePresence>
      </div>
    </div>
  )
}
