'use client'

import React from 'react'
import {
  MessageSquare,
  Award,
  Trophy
} from 'lucide-react'

interface CommunityTabsProps {
  activeTab: 'posts' | 'badges' | 'leaderboard'
  onTabChange: (tab: 'posts' | 'badges' | 'leaderboard') => void
  postsCount?: number
  badgesCount?: number
}

export default function CommunityTabs({
  activeTab,
  onTabChange,
  postsCount,
  badgesCount
}: CommunityTabsProps) {
  const tabs = [
    {
      id: 'posts' as const,
      label: 'المنشورات',
      icon: MessageSquare,
      count: postsCount
    },
    {
      id: 'badges' as const,
      label: 'الشارات',
      icon: Award,
      count: badgesCount
    },
    {
      id: 'leaderboard' as const,
      label: 'لوحة الشرف',
      icon: Trophy,
      count: undefined
    }
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center gap-1 overflow-x-auto p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-t-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

