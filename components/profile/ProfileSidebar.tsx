'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import {
  User,
  BookOpen,
  Shield,
  Settings
} from 'lucide-react'
import { motion } from 'framer-motion'

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

interface ProfileSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  activeTab,
  onTabChange
}) => {
  const sidebarItems: SidebarItem[] = [
    {
      id: 'personal',
      label: 'البيانات الشخصية',
      icon: User
    },
    {
      id: 'security',
      label: 'الأمان والخصوصية',
      icon: Shield
    },
    {
      id: 'preferences',
      label: 'التفضيلات',
      icon: Settings
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 h-fit sticky top-28"
    >
      {/* Navigation Menu */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">إعدادات الملف الشخصي</h3>
        <nav className="space-y-2">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white shadow-lg shadow-orange-500/30 dark:shadow-orange-900/40"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-amber-600 dark:hover:text-amber-400"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-white" : "text-slate-400 dark:text-slate-500"
                )} />
                <span className="flex-1 font-medium">{item.label}</span>
                {item.count !== undefined && (
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  )}>
                    {item.count}
                  </span>
                )}
              </motion.button>
            )
          })}
        </nav>
      </div>
    </motion.div>
  )
}

export default ProfileSidebar
