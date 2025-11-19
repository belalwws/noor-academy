'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Mail, Calendar, Crown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { BatchStudent, Batch } from '@/lib/types/live-education'

interface BatchMembersProps {
  batch: Batch
  students: BatchStudent[]
}

export default function BatchMembers({ batch, students }: BatchMembersProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Create members list from batch and students
  const members = React.useMemo(() => {
    const membersList = []
    
    // Add teacher first
    if (batch.teacher_name) {
      membersList.push({
        id: batch.teacher || '0',
        name: batch.teacher_name,
        email: '',
        role: 'teacher' as const,
        isOnline: true,
        joinDate: batch.created_at
      })
    }
    
    // Add students
    students.forEach(student => {
      membersList.push({
        id: typeof student.student === 'string' ? student.student : student.student?.toString() || '',
        name: student.student_name || 'طالب غير معروف',
        email: student.student_email || '',
        role: 'student' as const,
        isOnline: student.status === 'active',
        joinDate: student.created_at || '',
        status: student.status
      })
    })
    
    return membersList
  }, [batch, students])

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">نشط</Badge>
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">موقوف</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">مكتمل</Badge>
      case 'withdrawn':
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">منسحب</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
          <Users className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          الأعضاء ({members.length})
        </h3>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="بحث عن عضو..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500 pr-10 h-9 text-sm"
        />
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {filteredMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  member.role === 'teacher'
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                  <span className="text-white font-semibold text-sm">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {member.isOnline && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900 dark:text-slate-50 text-sm truncate">
                    {member.name}
                  </p>
                  {member.role === 'teacher' && (
                    <Crown className="w-3.5 h-3.5 text-purple-600" />
                  )}
                </div>
                
                {member.email && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-400 mb-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                
                {member.joinDate && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      انضم في {new Date(member.joinDate).toLocaleDateString('ar-EG', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1 items-end shrink-0">
                <span className={`text-xs px-2 py-1 rounded-md ${
                  member.role === 'teacher'
                    ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 font-medium'
                    : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                }`}>
                  {member.role === 'teacher' ? 'معلم' : 'طالب'}
                </span>
                {member.role === 'student' && getStatusBadge(member.status)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">لا توجد نتائج</p>
        </div>
      )}
    </div>
  )
}

