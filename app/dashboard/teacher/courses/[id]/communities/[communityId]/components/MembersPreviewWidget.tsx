'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { courseCommunitiesApi, type Community, type CommunityMember } from '@/lib/api/course-communities'
import { Users, UserCheck } from 'lucide-react'
import { getProxiedImageUrl } from '@/lib/imageUtils'

interface MembersPreviewWidgetProps {
  community: Community
}

interface MemberWithSignedImage extends CommunityMember {
  signedImageUrl?: string
}

export default function MembersPreviewWidget({ community }: MembersPreviewWidgetProps) {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.['id'] as string
  const [members, setMembers] = useState<MemberWithSignedImage[]>([])
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
      console.log('📦 Community data with members:', data)
      
      if (data.members && Array.isArray(data.members)) {
        console.log('👥 Total members:', data.members.length)
        console.log('👤 First member sample:', data.members[0])
        
        // Get first 9 members - use the profile_image_url directly from member data
        const membersSlice = data.members.slice(0, 9).map(member => {
          const imageUrl = member.user?.profile_image_url || member.user?.profile_image_thumbnail_url
          console.log(`🖼️ Member ${member.user?.get_full_name} image URL:`, imageUrl)
          
          // Try direct URL first, fallback to proxy if needed
          return {
            ...member,
            signedImageUrl: imageUrl ? getProxiedImageUrl(imageUrl, false) : undefined
          }
        })
        
        setMembers(membersSlice)
      }
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setLoading(false)
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
          {members.map((member) => {
            const userId = member.user?.id?.toString() || member.id
            return (
              <div
                key={member.id}
                className="relative group cursor-pointer"
                title={member.user?.get_full_name || member.user?.email || 'عضو'}
                onClick={() => {
                  router.push(`/dashboard/teacher/courses/${courseId}/communities/${community.id}/profile/${userId}`)
                }}
              >
                <Avatar className="w-16 h-16 border-2 border-gray-200 dark:border-gray-700 group-hover:border-amber-500 transition-all shadow-md group-hover:shadow-lg group-hover:scale-105">
                  <AvatarImage 
                    src={member.signedImageUrl}
                    onError={(e) => {
                      const currentSrc = (e.target as HTMLImageElement).src;
                      const originalUrl = member.user?.profile_image_url || member.user?.profile_image_thumbnail_url;
                      console.log('❌ MembersPreviewWidget - Avatar image error:', { 
                        currentSrc, 
                        originalUrl,
                        memberName: member.user?.get_full_name 
                      });
                      if (originalUrl) {
                        if (currentSrc.includes('/auth/image-proxy/')) {
                          console.log('🔄 Trying direct URL');
                          (e.target as HTMLImageElement).src = originalUrl;
                        } else {
                          console.log('❌ All attempts failed, showing fallback');
                        }
                      }
                    }}
                    onLoad={() => {
                      if (member.signedImageUrl) {
                        console.log('✅ MembersPreviewWidget - Avatar image loaded:', member.signedImageUrl);
                      }
                    }}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white font-semibold">
                    {member.user?.get_full_name?.charAt(0) || member.user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {member.role === 'teacher' && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center z-10">
                    <UserCheck className="w-3 h-3 text-white" />
                  </div>
                )}
                {/* Name tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  {member.user?.get_full_name || member.user?.email || 'عضو'}
                </div>
              </div>
            )
          })}
        </div>
        {members.length >= 9 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Scroll to members tab
              const element = document.querySelector('[data-tab="members"]') as HTMLElement
              if (element) {
                element.click()
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 100)
              }
            }}
            className="w-full mt-4 border-2 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:border-amber-300 dark:hover:border-amber-700 transition-all"
          >
            <Users className="w-4 h-4 ml-2" />
            عرض جميع الأعضاء ({community.members?.length || parseInt(community.members_count || '0')})
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

