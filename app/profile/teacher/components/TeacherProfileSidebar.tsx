'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { 
  User, 
  BookOpen, 
  Edit3, 
  Settings
} from 'lucide-react'

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

interface TeacherProfileSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const TeacherProfileSidebar: React.FC<TeacherProfileSidebarProps> = ({
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
      id: 'edit',
      label: 'تعديل البيانات الشخصية',
      icon: Edit3
    },
    {
      id: 'courses',
      label: 'الدورات التعليمية',
      icon: BookOpen
    },
    {
      id: 'preferences',
      label: 'التفضيلات',
      icon: Settings
    }
  ]

  return (
    <div className="w-80 bg-white rounded-2xl shadow-lg border border-gray-100 h-fit sticky top-8">
      {/* Navigation Menu */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">إعدادات الملف الشخصي</h3>
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-[#2d7d32] to-[#4caf50] text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#2d7d32]"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-white" : "text-gray-400"
                )} />
                <span className="flex-1 font-medium">{item.label}</span>
                {item.count !== undefined && (
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  )}>
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default TeacherProfileSidebar
