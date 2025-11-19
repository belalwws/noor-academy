'use client'

import React, { useState, useEffect } from 'react'
import CourseSidebar from './components/CourseSidebar'
import CourseTopBar from './components/CourseTopBar'
import CourseDetails from './components/CourseDetails'
import CourseMembers from './components/CourseMembers'
import PostsList from './components/PostsList'
import CourseFiles from './components/CourseFiles'

interface CourseData {
  id: string
  title: string
  description: string
  instructor: string
  startDate: string
  endDate: string
  studentsCount: number
  status: 'active' | 'upcoming' | 'completed'
  objectives?: string[]
  requirements?: string[]
  duration?: string
  level?: string
  language?: string
  location?: string
  category?: string
}

interface Member {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'teacher' | 'student'
  joinDate: string
  lastActive?: string
  isOnline?: boolean
}

interface UserData {
  name: string
  avatar?: string
  role: 'teacher' | 'student'
}

export default function CourseInterface() {
  const [courseData, setCourseData] = useState<CourseData>({
    id: '1',
    title: 'دورة تعليم القرآن الكريم',
    description: 'تعلم تلاوة القرآن الكريم بأحكام التجويد الصحيحة مع أفضل المعلمين المتخصصين في علوم القرآن',
    instructor: 'د. أحمد محمد الحافظ',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    studentsCount: 25,
    status: 'active',
    objectives: [
      'تعلم أحكام التجويد الأساسية',
      'إتقان قراءة القرآن الكريم بالطريقة الصحيحة',
      'فهم مخارج الحروف وصفاتها',
      'تطبيق أحكام الوقف والابتداء'
    ],
    requirements: [
      'معرفة أساسية بالقراءة العربية',
      'الالتزام بحضور الجلسات',
      'أداء التمارين العملية'
    ],
    duration: '8 أسابيع',
    level: 'مبتدئ',
    language: 'العربية',
    location: 'عبر الإنترنت',
    category: 'علوم شرعية'
  })

  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: 'د. محمد العلي',
      email: 'admin@example.com',
      role: 'admin',
      joinDate: '2024-01-01',
      lastActive: 'منذ ساعة',
      isOnline: true
    },
    {
      id: '2',
      name: 'د. أحمد محمد الحافظ',
      email: 'teacher@example.com',
      role: 'teacher',
      joinDate: '2024-01-10',
      lastActive: 'منذ 30 دقيقة',
      isOnline: true
    },
    {
      id: '3',
      name: 'فاطمة أحمد',
      email: 'student1@example.com',
      role: 'student',
      joinDate: '2024-01-15',
      lastActive: 'منذ 5 دقائق',
      isOnline: true
    }
  ])

  const [userData, setUserData] = useState<UserData>({
    name: 'أحمد محمد',
    avatar: '',
    role: 'teacher'
  })

  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'details' | 'members'>('details')
  const [activeTab, setActiveTab] = useState<'announcements' | 'files'>('announcements')
  const [isSessionActive, setIsSessionActive] = useState(false)

  useEffect(() => {
    // Simulate loading course and user data
    const loadData = async () => {
      try {
        // Here you would fetch actual data from your API
        // const courseResponse = await fetch(`/api/courses/${courseId}`)
        // const userResponse = await fetch('/api/user/profile')

        // For now, we'll use mock data
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleStartSession = () => {
    setIsSessionActive(!isSessionActive)
  }

  const handleFileUpload = (files: FileList) => {
    console.log('Files uploaded:', files)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#2d7d32] rounded-full mx-auto animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-48 mx-auto animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
        </div>
      </div>
    )
  }

  const renderMainContent = () => {
    if (activeTab === 'files') {
      return (
        <CourseFiles
          userRole={userData.role}
          onUpload={handleFileUpload}
        />
      )
    }

    return (
      <PostsList
        courseId={courseData.id}
        userRole={userData.role}
        userName={userData.name}
        userAvatar={userData.avatar}
      />
    )
  }

  const renderSidebarContent = () => {
    if (activeSection === 'members') {
      return <CourseMembers members={members} />
    }

    return <CourseDetails course={courseData} />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">

                  {/* Sidebar */}
      <CourseSidebar
        course={courseData}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <CourseTopBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onStartSession={handleStartSession}
          isSessionActive={isSessionActive}
          liveSessionsCount={isSessionActive ? 1 : 0}
        />

        {/* Content */}
        <div className="flex-1 p-6">
          {renderMainContent()}
        </div>

              {/* Sidebar Content Overlay */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-6">
          {renderSidebarContent()}
        </div>
      </div>
      </div>
    </div>
  )
}
