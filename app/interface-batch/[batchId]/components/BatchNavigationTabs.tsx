'use client'

import React from 'react'

interface BatchNavigationTabsProps {
  activeSection: 'details' | 'members' | 'manage-students' | 'badges'
  onSectionChange: (section: 'details' | 'members' | 'manage-students' | 'badges') => void
  studentsCount: number
  userRole: 'teacher' | 'student'
  badgesCount?: number
}

export default function BatchNavigationTabs({
  activeSection,
  onSectionChange,
  studentsCount,
  userRole,
  badgesCount
}: BatchNavigationTabsProps) {
  return (
    <div className={`grid gap-2 mb-4 ${
      userRole === 'teacher' ? 'grid-cols-4' : 'grid-cols-3'
    }`}>
      <button
        onClick={() => onSectionChange('details')}
        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
          activeSection === 'details'
            ? 'bg-primary text-white'
            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
        }`}
      >
        التفاصيل
      </button>
      <button
        onClick={() => onSectionChange('members')}
        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
          activeSection === 'members'
            ? 'bg-primary text-white'
            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
        }`}
      >
        الأعضاء ({studentsCount})
      </button>
      <button
        onClick={() => onSectionChange('badges')}
        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
          activeSection === 'badges'
            ? 'bg-primary text-white'
            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
        }`}
      >
        الشارات {badgesCount !== undefined && `(${badgesCount})`}
      </button>
      {userRole === 'teacher' && (
        <button
          onClick={() => onSectionChange('manage-students')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeSection === 'manage-students'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
          }`}
        >
          إدارة الطلاب
        </button>
      )}
    </div>
  )
}

