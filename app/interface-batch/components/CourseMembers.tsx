'use client'

import React, { useState, useEffect } from 'react'
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
  MoreVertical,
  RefreshCw
} from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'supervisor' | 'academic_supervisor' | 'teacher' | 'student'
  joinDate: string
  lastActive?: string
  isOnline?: boolean
  first_name?: string
  last_name?: string
  profile_image_url?: string
  profile_image_thumbnail_url?: string
}

interface CourseMembersProps {
  courseId?: string
}

export default function CourseMembers({ courseId }: CourseMembersProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load course members from API
  useEffect(() => {
    const loadCourseMembers = async () => {
      if (!courseId) return

      try {
        setLoading(true)
        setError(null)

        // Get auth token
        const getAuthToken = async () => {
          try {
            const response = await fetch('/api/auth/token', {
              method: 'GET',
              credentials: 'include',
            })
            if (response.ok) {
              const data = await response.json()
              return data.token
            }
          } catch (error) {
            console.error('Error getting auth token:', error)
          }
          return null
        }

        const token = await getAuthToken()
        const headers: HeadersInit = token
          ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
          : { 'Accept': 'application/json' }

        // Fetch course members
        const response = await fetch(
          `${process.env['NEXT_PUBLIC_API_URL']}/live-education/courses/${courseId}/members/`,
          {
            headers,
            credentials: 'include'
          }
        )

        if (response.ok) {
          const data = await response.json()
          console.log('📚 Course members data:', data)
          setMembers(data.results || data || [])
        } else {
          console.error('Failed to fetch course members:', response.status)
          setError('فشل في تحميل بيانات الأعضاء')
        }
      } catch (error) {
        console.error('Error loading course members:', error)
        setError('حدث خطأ في تحميل بيانات الأعضاء')
      } finally {
        setLoading(false)
      }
    }

    loadCourseMembers()
  }, [courseId])

  const supervisors = members.filter(m => m.role === 'supervisor')
  const academicSupervisors = members.filter(m => m.role === 'academic_supervisor')
  const teachers = members.filter(m => m.role === 'teacher')
  const students = members.filter(m => m.role === 'student')

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'supervisor':
        return <Shield className="w-4 h-4 text-red-600" />
      case 'academic_supervisor':
        return <Shield className="w-4 h-4 text-blue-600" />
      case 'teacher':
        return <GraduationCap className="w-4 h-4 text-green-600" />
      default:
        return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'supervisor':
        return 'المشرف العام'
      case 'academic_supervisor':
        return 'المشرف الأكاديمي'
      case 'teacher':
        return 'المعلم'
      default:
        return 'طالب'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'supervisor':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'academic_supervisor':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'teacher':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-[#2d7d32]" />
          <span className="mr-2 text-gray-600">جاري تحميل بيانات الأعضاء...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  const MemberCard = ({ member }: { member: Member }) => {
    const displayName = member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'غير محدد'
    const avatarUrl = member.avatar || member.profile_image_thumbnail_url || member.profile_image_url

    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-[#2d7d32] to-[#1b5e20] text-white font-medium">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {member.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">{displayName}</h4>
              <Badge className={`text-xs border ${getRoleBadgeColor(member.role)}`}>
                {getRoleIcon(member.role)}
                <span className="mr-1">{getRoleLabel(member.role)}</span>
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span>{member.email || 'غير محدد'}</span>
              </div>
            {member.joinDate && <span>انضم في {member.joinDate}</span>}
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
  )}

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{supervisors.length}</div>
            <div className="text-sm text-gray-600">مشرف عام</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{academicSupervisors.length}</div>
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
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{students.length}</div>
            <div className="text-sm text-gray-600">طالب</div>
          </CardContent>
        </Card>
      </div>

      {/* General Supervisors */}
      {supervisors.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              <Shield className="w-5 h-5 text-red-600" />
              المشرفون العامون ({supervisors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {supervisors.map((supervisor) => (
              <MemberCard key={supervisor.id} member={supervisor} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Academic Supervisors */}
      {academicSupervisors.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              <Shield className="w-5 h-5 text-blue-600" />
              المشرفون الأكاديميون ({academicSupervisors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {academicSupervisors.map((academicSupervisor) => (
              <MemberCard key={academicSupervisor.id} member={academicSupervisor} />
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
