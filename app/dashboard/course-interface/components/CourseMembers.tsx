'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  GraduationCap, 
  Users, 
  Mail,
  Phone,
  MoreVertical
} from 'lucide-react'

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

interface CourseMembersProps {
  members: Member[]
}

export default function CourseMembers({ members }: CourseMembersProps) {
  const admins = members.filter(m => m.role === 'admin')
  const teachers = members.filter(m => m.role === 'teacher')
  const students = members.filter(m => m.role === 'student')

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'teacher':
        return <GraduationCap className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مشرف أكاديمي'
      case 'teacher':
        return 'معلم'
      default:
        return 'طالب'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'teacher':
        return 'bg-[#2d7d32]/10 text-[#2d7d32] border-[#2d7d32]/20'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const MemberCard = ({ member }: { member: Member }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
            <AvatarImage src={member.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-[#2d7d32] to-[#1b5e20] text-white font-medium">
              {member.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {member.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">{member.name}</h4>
            <Badge className={`text-xs border ${getRoleColor(member.role)}`}>
              {getRoleIcon(member.role)}
              <span className="mr-1">{getRoleLabel(member.role)}</span>
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{member.email}</span>
            </div>
            <span>انضم في {member.joinDate}</span>
            {member.lastActive && (
              <span>آخر نشاط {member.lastActive}</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-200 rounded-lg">
          <Mail className="w-4 h-4 text-gray-600" />
        </Button>
        <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-200 rounded-lg">
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{admins.length}</div>
            <div className="text-sm text-gray-600">مشرف أكاديمي</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-[#2d7d32]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <GraduationCap className="w-6 h-6 text-[#2d7d32]" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{teachers.length}</div>
            <div className="text-sm text-gray-600">معلم</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{students.length}</div>
            <div className="text-sm text-gray-600">طالب</div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Supervisors */}
      {admins.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              <Shield className="w-5 h-5 text-purple-600" />
              المشرفون الأكاديميون ({admins.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {admins.map((admin) => (
              <MemberCard key={admin.id} member={admin} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Teachers */}
      {teachers.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              <GraduationCap className="w-5 h-5 text-[#2d7d32]" />
              المعلمون ({teachers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teachers.map((teacher) => (
              <MemberCard key={teacher.id} member={teacher} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Students */}
      {students.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              <Users className="w-5 h-5 text-blue-600" />
              الطلاب ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {students.map((student) => (
              <MemberCard key={student.id} member={student} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
