'use client'

import { 
  User, 
  BarChart3, 
  BookOpen, 
  Settings 
} from 'lucide-react'

interface ProfileTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const tabs = [
    {
      id: 'info',
      label: 'المعلومات',
      icon: User,
      description: 'البيانات الشخصية والأكاديمية'
    },
    {
      id: 'edit',
      label: 'التعديل',
      icon: User,
      description: 'تحديث البيانات الشخصية'
    },
    {
      id: 'courses',
      label: 'الدورات',
      icon: BookOpen,
      description: 'إدارة الدورات التعليمية'
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: Settings,
      description: 'إعدادات الحساب والتفضيلات'
    }
  ]

  return (
    <div className="mb-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-t-3xl p-6 text-white">
        <h2 className="text-2xl font-bold text-center mb-2">إدارة الملف الشخصي</h2>
        <p className="text-center text-green-100 text-sm">اختر القسم الذي تريد عرضه أو تعديله</p>
      </div>

      {/* Enhanced Tabs */}
      <div className="bg-white/90 backdrop-blur-sm rounded-b-3xl shadow-2xl border-t-0 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {tabs.map((tab, index) => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex flex-col items-center gap-3 p-6 transition-all duration-500 group
                  ${isActive 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-800 shadow-inner' 
                    : 'text-gray-600 hover:text-green-700 hover:bg-gradient-to-br hover:from-green-50/50 hover:to-transparent'
                  }
                  ${index < tabs.length - 1 ? 'border-r border-gray-200' : ''}
                `}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                )}
                
                {/* Icon with Enhanced Styling */}
                <div className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg scale-110' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-600 group-hover:scale-105'
                  }
                `}>
                  <IconComponent className="w-6 h-6" />
                </div>
                
                {/* Text Content */}
                <div className="text-center">
                  <div className={`font-bold text-sm mb-1 ${isActive ? 'text-green-800' : 'text-current'}`}>
                    {tab.label}
                  </div>
                  <div className={`text-xs leading-relaxed ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {tab.description}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
