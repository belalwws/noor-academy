'use client'

import { motion } from 'framer-motion'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  Users, 
  Edit,
  FlaskConical,
  Gamepad2
} from 'lucide-react'

interface TeacherTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function TeacherTabs({ activeTab, setActiveTab }: TeacherTabsProps) {
  const tabs = [
    { value: 'recorded-courses', label: 'الدورات المسجلة', icon: BookOpen, gradient: 'from-purple-600 to-purple-700', activeColor: 'purple' },
    { value: 'live-courses', label: 'الدورات المباشرة', icon: Users, gradient: 'from-[#2d7d32] to-[#1b5e20]', activeColor: 'green' },
    { value: 'interactive-games', label: 'الألعاب التفاعلية', icon: Gamepad2, gradient: 'from-green-600 to-emerald-600', activeColor: 'green' },
    { value: 'knowledge-labs', label: 'مختبراتي', icon: FlaskConical, gradient: 'from-yellow-600 to-amber-600', activeColor: 'yellow' },
    { value: 'edit-requests', label: 'طلبات التعديل', icon: Edit, gradient: 'from-orange-600 to-orange-700', activeColor: 'orange' },
  ]

  return (
    <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800/90 dark:to-slate-900/90 rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-2xl border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-xl" dir="rtl">
      <TabsList className="grid w-full grid-cols-5 p-1.5 bg-slate-100/70 dark:bg-slate-900/60 rounded-xl md:rounded-2xl h-auto gap-2 backdrop-blur-sm" dir="rtl">
        {tabs.map((tab, index) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.value
          
          return (
            <motion.div
              key={tab.value}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative"
            >
              <TabsTrigger 
                value={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`
                  flex items-center justify-center gap-2 rounded-xl md:rounded-2xl
                  font-bold py-3 md:py-4 px-3 md:px-5
                  transition-all duration-500 relative overflow-hidden
                  text-xs md:text-sm lg:text-base w-full
                  border-2
                  ${
                    isActive
                      ? `bg-gradient-to-br ${tab.gradient} text-white shadow-2xl border-transparent
                         ring-4 ring-${tab.activeColor}-400/20 dark:ring-${tab.activeColor}-500/30`
                      : `text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 
                         bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800
                         border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600
                         hover:shadow-lg`
                  }
                `}
              >
                {isActive && (
                  <>
                    <motion.div
                      layoutId="activeTabBackground"
                      className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} opacity-100`}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-white/10"
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                      style={{
                        backgroundSize: '200% 200%',
                        backgroundImage: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                      }}
                    />
                  </>
                )}
                <Icon 
                  className={`
                    w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 relative z-10 
                    transition-transform duration-300
                    ${isActive ? 'text-white scale-110' : 'scale-100'}
                  `} 
                />
                <span className={`
                  relative z-10 font-bold tracking-wide
                  ${isActive ? 'text-white' : ''}
                `}>
                  {tab.label}
                </span>
              </TabsTrigger>
            </motion.div>
          )
        })}
      </TabsList>
    </div>
  )
}
