'use client'

import React from 'react'
import BatchHeader from './BatchHeader'
import BatchNavigationTabs from './BatchNavigationTabs'
import BatchDetails from './BatchDetails'
import BatchMembers from './BatchMembers'
import BatchStudentsManager from './BatchStudentsManager'
import type { Batch } from '@/lib/types/live-education'
import type { BatchStudent } from '@/lib/api/batches'

import BatchBadges from './BatchBadges'

interface BatchSidebarProps {
  batch: Batch
  batchStudents: BatchStudent[]
  activeSection: 'details' | 'members' | 'manage-students' | 'badges'
  onSectionChange: (section: 'details' | 'members' | 'manage-students' | 'badges') => void
  userRole: 'teacher' | 'student'
  batchId: string
  courseId?: string
  onStudentsUpdate: () => void
  communityId?: string
}

export default function BatchSidebar({
  batch,
  batchStudents,
  activeSection,
  onSectionChange,
  userRole,
  batchId,
  courseId,
  onStudentsUpdate,
  communityId
}: BatchSidebarProps) {
  const renderContent = () => {
    if (activeSection === 'manage-students') {
      return (
        <BatchStudentsManager 
          batchId={batchId} 
          courseId={courseId}
          onStudentsUpdate={onStudentsUpdate} 
        />
      )
    }
    
    if (activeSection === 'members') {
      return <BatchMembers batch={batch} students={batchStudents} />
    }

    if (activeSection === 'badges') {
      if (!communityId) {
        return (
          <div className="p-4 text-center text-gray-500">
            <p>المجتمع غير متاح حالياً</p>
          </div>
        )
      }
      return (
        <BatchBadges
          communityId={communityId}
          userRole={userRole}
          batchStudents={batchStudents.map((s) => ({
            id: String(s.student), // s.student is StudentProfile ID (UUID)
            user: {
              id: 0, // Not needed for badges
              get_full_name: s.student_name || 'طالب'
            }
          }))}
        />
      )
    }

    return <BatchDetails batch={batch} studentsCount={batchStudents.length} />
  }

  return (
    <>
      <style jsx global>{`
        .batch-sidebar-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .batch-sidebar-scroll::-webkit-scrollbar-track {
          background: rgb(243 244 246);
          border-radius: 4px;
        }
        .batch-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgb(209 213 219);
          border-radius: 4px;
        }
        .batch-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgb(156 163 175);
        }
        .dark .batch-sidebar-scroll::-webkit-scrollbar-track {
          background: rgb(30 41 59);
        }
        .dark .batch-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgb(71 85 105);
        }
        .dark .batch-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgb(100 116 139);
        }
        .batch-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgb(209 213 219) rgb(243 244 246);
        }
        .dark .batch-sidebar-scroll {
          scrollbar-color: rgb(71 85 105) rgb(30 41 59);
        }
      `}</style>
    <div className="w-96 h-full bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden">
        <div 
          className="flex-1 overflow-y-auto batch-sidebar-scroll" 
          style={{ direction: 'ltr' }}
        >
          <div className="p-4" dir="rtl">
          <BatchHeader batch={batch} studentsCount={batchStudents.length} />
          
          <BatchNavigationTabs
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            studentsCount={batchStudents.length}
            userRole={userRole}
            badgesCount={undefined}
          />

          {renderContent()}
        </div>
      </div>
    </div>
    </>
  )
}

