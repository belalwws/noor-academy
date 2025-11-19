'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Megaphone, 
  FileText, 
  Video,
  Play,
  Users as UsersIcon,
  Upload
} from 'lucide-react'

interface CourseTopBarProps {
  activeTab: 'announcements' | 'files'
  onTabChange: (tab: 'announcements' | 'files') => void
  onStartSession: () => void
  isSessionActive?: boolean
  liveSessionsCount?: number
}

export default function CourseTopBar({ 
  activeTab, 
  onTabChange, 
  onStartSession,
  isSessionActive = false,
  liveSessionsCount = 0
}: CourseTopBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <Button
            variant={activeTab === 'announcements' ? 'default' : 'ghost'}
            onClick={() => onTabChange('announcements')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
              activeTab === 'announcements'
                ? 'bg-white text-[#2d7d32] shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            الإعلانات
            {liveSessionsCount > 0 && activeTab === 'announcements' && (
              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                {liveSessionsCount} مباشر
              </Badge>
            )}
          </Button>
          
          <Button
            variant={activeTab === 'files' ? 'default' : 'ghost'}
            onClick={() => onTabChange('files')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
              activeTab === 'files'
                ? 'bg-white text-[#2d7d32] shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            الملفات
          </Button>
        </div>

        {/* Start Session Button */}
        <div className="flex items-center gap-3">
          {isSessionActive && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700">جلسة مباشرة نشطة</span>
              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                <UsersIcon className="w-3 h-3 ml-1" />
                12 مشارك
              </Badge>
            </div>
          )}
          
          <Button
            onClick={onStartSession}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              isSessionActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-[#2d7d32] to-[#1b5e20] hover:from-[#1b5e20] hover:to-[#0d4f12] text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isSessionActive ? (
              <>
                <Video className="w-5 h-5" />
                انضم للجلسة
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                ابدأ حصة
              </>
            )}
          </Button>
                      <Button 
              onClick={() => document.getElementById('file-upload')?.click()}
              className="bg-gradient-to-r from-[#2d7d32] to-[#1b5e20] hover:from-[#1b5e20] hover:to-[#0d4f12] text-white flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              رفع ملف جديد
            </Button>
        </div>
      </div>
    </div>
  )
}
