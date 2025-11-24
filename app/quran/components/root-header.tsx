"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useCurrentFont } from "@/lib/store/hooks/useQuran";
import ButtonGroup from "./button-group";

export default function RootHeader() {
  const [font] = useCurrentFont();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-600 dark:from-blue-700 dark:via-blue-800 dark:to-blue-800 p-8 text-white shadow-2xl shadow-blue-500/20 dark:shadow-blue-900/40"
    >
      {/* Sparkles decorations */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-8 left-8"
      >
        <Sparkles className="w-6 h-6 text-blue-200 dark:text-blue-300" />
      </motion.div>
      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-8 right-8"
      >
        <Sparkles className="w-8 h-8 text-blue-200 dark:text-blue-300" />
      </motion.div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-center md:text-right flex-1"
        >
          <h1
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{
              fontFamily: `var(--font-${font})`
            }}
          >
            📖 قارئ القرآن الكريم
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/90"
          >
            اقرأ واستمع إلى كلام الله بخطوط جميلة وتلاوات مباركة
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ButtonGroup />
        </motion.div>
      </div>
    </motion.header>
  );
}
