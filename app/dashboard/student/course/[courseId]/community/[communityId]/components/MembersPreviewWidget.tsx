'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { courseCommunitiesApi, type Community, type CommunityMember } from '@/lib/api/course-communities'
import { Users, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MembersPreviewWidgetProps {
  community: Community
}

export default function MembersPreviewWidget({ community }: MembersPreviewWidgetProps) {
  const router = useRouter()
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (community) {
      loadMembers()
    }
  }, [community])

  const loadMembers = async () => {
    try {
      setLoading(true)
      // Load community to get members
      const data = await courseCommunitiesApi.get(community.id)
      if (data.members && Array.isArray(data.members)) {
        // Get first 9 members
        setMembers(data.members.slice(0, 9))
      }
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'teacher':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs">معلم</Badge>
      case 'assistant':
        return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-xs">مساعد</Badge>
      case 'student':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs">طالب</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card className="shadow-md border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-200 dark:border-amber-800 pb-3">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">الأعضاء</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (members.length === 0) {
    return null
  }

  return (
    <Card className="shadow-md border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-200 dark:border-amber-800 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">الأعضاء</CardTitle>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {community.members?.length || parseInt(community.members_count || '0')} عضو
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="relative group cursor-pointer"
              title={member.user?.get_full_name || member.user?.email || 'عضو'}
            >
              <Avatar className="w-16 h-16 border-2 border-gray-200 dark:border-gray-700 group-hover:border-amber-500 transition-colors shadow-md">
                <AvatarImage src={member.user?.profile_image_url} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white font-semibold">
                  {member.user?.get_full_name?.charAt(0) || member.user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {member.role === 'teacher' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                  <UserCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

