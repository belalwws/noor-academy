'use client'

import React from 'react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, BarChart3, BookOpen } from 'lucide-react'

export default function StudentTabs() {
  return (
    <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg rounded-2xl p-2 border-0">
      <TabsTrigger 
        value="info" 
        className="flex items-center gap-2 py-3 px-6 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
      >
        <User className="w-5 h-5" />
        <span className="font-medium">المعلومات الشخصية</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="stats" 
        className="flex items-center gap-2 py-3 px-6 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
      >
        <BarChart3 className="w-5 h-5" />
        <span className="font-medium">الإحصائيات</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="courses" 
        className="flex items-center gap-2 py-3 px-6 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
      >
        <BookOpen className="w-5 h-5" />
        <span className="font-medium">دوراتي</span>
      </TabsTrigger>
    </TabsList>
  )
}
