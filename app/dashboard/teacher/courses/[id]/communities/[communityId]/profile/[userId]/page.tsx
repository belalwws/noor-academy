'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { courseCommunitiesApi, type CommunityMember, type CommunityPost, type CommunityBadge } from '@/lib/api/course-communities'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Crown, Mail, Calendar, Award, MessageSquare, Heart, FileText, Image as ImageIcon, Video, Music, Archive, File, Download, User, Users, Trophy, Medal, Star } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAppSelector } from '@/lib/hooks'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { getProxiedImageUrl } from '@/lib/imageUtils'

export default function MemberProfilePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.['id'] as string
  const communityId = params?.['communityId'] as string
  const userId = params?.['userId'] as string

  const { user } = useAppSelector(state => state.auth)
  const [member, setMember] = useState<CommunityMember | null>(null)
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [badges, setBadges] = useState<CommunityBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [loadingBadges, setLoadingBadges] = useState(false)
  const [activeTab, setActiveTab] = useState<'timeline' | 'about' | 'badges'>('timeline')
  const [profileImageRetryCount, setProfileImageRetryCount] = useState(0)
  const [profileImageSrc, setProfileImageSrc] = useState<string | null>(null)
  const isMyProfile = user?.id?.toString() === userId

  useEffect(() => {
    if (communityId && userId) {
      loadMemberProfile()
      loadMemberPosts()
    }
  }, [communityId, userId])

  // Initialize profile image src when member data is loaded
  useEffect(() => {
    if (member?.user?.profile_image_url || member?.user?.profile_image_thumbnail_url) {
      const imageUrl = member.user.profile_image_url || member.user.profile_image_thumbnail_url;
      if (imageUrl) {
        // For Wasabi URLs, use Next.js proxy first to avoid backend rate limiting
        // Backend proxy has 429 (Too Many Requests) issues
        const isWasabiUrl = imageUrl.includes('wasabisys.com');
        // Use Next.js proxy first (avoids backend rate limiting)
        const initialSrc = isWasabiUrl ? getProxiedImageUrl(imageUrl, false) : imageUrl;
        
        if (profileImageSrc !== initialSrc) {
          console.log('🔄 Initializing profile image src (Next.js proxy first):', {
            originalUrl: imageUrl,
            isWasabiUrl,
            initialSrc
          });
          setProfileImageSrc(initialSrc);
          setProfileImageRetryCount(0);
        }
      }
    } else {
      // Reset if no image URL
      setProfileImageSrc(null);
      setProfileImageRetryCount(0);
    }
  }, [member?.user?.profile_image_url, member?.user?.profile_image_thumbnail_url])

  const loadMemberProfile = async () => {
    try {
      setLoading(true)
      const community = await courseCommunitiesApi.get(communityId)
      const foundMember = community.members?.find(m => m.user.id.toString() === userId || m.id === userId)
      
      if (foundMember) {
        console.log('🔍 Member Profile Data:', {
          memberId: foundMember.id,
          userId: foundMember.user?.id,
          userName: foundMember.user?.get_full_name,
          profileImageUrl: foundMember.user?.profile_image_url,
          profileImageThumbnailUrl: foundMember.user?.profile_image_thumbnail_url,
          allUserKeys: foundMember.user ? Object.keys(foundMember.user) : [],
          fullUserObject: foundMember.user
        })
        setMember(foundMember)
        // Load badges after member is set
        await loadMemberBadges()
      } else {
        toast.error('لم يتم العثور على العضو')
        router.back()
      }
    } catch (error: any) {
      console.error('Error loading member profile:', error)
      toast.error(error?.response?.data?.detail || 'فشل تحميل بروفايل العضو')
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const loadMemberPosts = async () => {
    try {
      setLoadingPosts(true)
      const response = await courseCommunitiesApi.listPosts({ community: communityId })
      const memberPosts = response.results.filter(post => 
        post.author.id.toString() === userId
      )
      setPosts(memberPosts)
    } catch (error: any) {
      console.error('Error loading member posts:', error)
      toast.error('فشل تحميل منشورات العضو')
    } finally {
      setLoadingPosts(false)
    }
  }

  const loadMemberBadges = async () => {
    try {
      setLoadingBadges(true)
      // Get all badges for the community
      const response = await courseCommunitiesApi.listBadges({ 
        community: communityId 
      })
      
      if (!member) {
        setBadges([])
        return
      }
      
      // Filter badges for this member by matching:
      // 1. Student name (most reliable - case-insensitive, trimmed, with multiple variations)
      // 2. Student ID (badge.student is StudentProfile ID, not User ID)
      const memberBadges = response.results.filter(badge => {
        const memberName = (member.user.get_full_name || '').toLowerCase().trim()
        const badgeStudentName = (badge.student_name || '').toLowerCase().trim()
        
        // Normalize names: remove extra spaces, handle Arabic characters
        const normalizeName = (name: string) => {
          return name
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim()
        }
        
        const normalizedMemberName = normalizeName(memberName)
        const normalizedBadgeName = normalizeName(badgeStudentName)
        
        // Primary match: by exact normalized name
        const exactNameMatch = normalizedBadgeName === normalizedMemberName
        
        // Secondary match: by partial name (in case of slight differences)
        const partialNameMatch = normalizedBadgeName.includes(normalizedMemberName) || 
                                 normalizedMemberName.includes(normalizedBadgeName)
        
        // Tertiary match: by student ID if available
        // badge.student is StudentProfile ID, we need to check if it matches
        // Try matching with various ID formats
        const idMatch = 
          badge.student === member.id?.toString() ||
          badge.student === member.user.id?.toString() ||
          badge.student === userId ||
          String(badge.student) === String(member.id) ||
          String(badge.student) === String(member.user.id) ||
          String(badge.student) === String(userId)
        
        const matches = exactNameMatch || (partialNameMatch && normalizedMemberName.length > 3) || idMatch
        
        if (process.env.NODE_ENV === 'development' && matches) {
          console.log('Badge match found:', {
            badgeName: badge.name,
            badgeStudentName: badge.student_name,
            memberName: member.user.get_full_name,
            badgeStudent: badge.student,
            memberId: member.id,
            userId: member.user.id,
            matchType: exactNameMatch ? 'exact-name' : partialNameMatch ? 'partial-name' : 'id'
          })
        }
        
        return matches
      })
      
      console.log('Member badges search:', {
        memberName: member.user.get_full_name,
        memberId: member.id,
        userId: member.user.id,
        totalBadges: response.results.length,
        filteredBadges: memberBadges.length,
        allBadges: response.results.map(b => ({
          name: b.name,
          student_name: b.student_name,
          student: b.student
        }))
      })
      
      setBadges(memberBadges)
    } catch (error: any) {
      console.error('Error loading member badges:', error)
      // Don't show error toast for badges, just log it
      setBadges([])
    } finally {
      setLoadingBadges(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'teacher':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">معلم</Badge>
      case 'assistant':
        return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">مساعد</Badge>
      case 'student':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">طالب</Badge>
      default:
        return <Badge variant="outline">عضو</Badge>
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />
      case 'video':
        return <Video className="w-4 h-4" />
      case 'audio':
        return <Music className="w-4 h-4" />
      case 'archive':
        return <Archive className="w-4 h-4" />
      default:
        return <File className="w-4 h-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'title':
        return <Medal className="w-5 h-5" />
      case 'achievement':
        return <Trophy className="w-5 h-5" />
      case 'participation':
        return <Star className="w-5 h-5" />
      case 'excellence':
        return <Award className="w-5 h-5" />
      default:
        return <Award className="w-5 h-5" />
    }
  }

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'title':
        return 'bg-gradient-to-br from-amber-400 to-orange-500'
      case 'achievement':
        return 'bg-gradient-to-br from-yellow-400 to-amber-500'
      case 'participation':
        return 'bg-gradient-to-br from-blue-400 to-cyan-500'
      case 'excellence':
        return 'bg-gradient-to-br from-purple-400 to-pink-500'
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!member) {
    return null
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
        {/* Back Button */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="h-9"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Cover Photo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-64 md:h-80 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600"
          >
            <div className="absolute inset-0 bg-black/10"></div>
            {/* Profile Picture - Centered on Cover */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <div className="w-32 h-32 md:w-40 md:h-40 ring-4 ring-white dark:ring-slate-800 shadow-2xl rounded-full overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                {(() => {
                  const imageUrl = member.user?.profile_image_url || member.user?.profile_image_thumbnail_url;
                  const proxiedUrl = imageUrl ? getProxiedImageUrl(imageUrl, true) : undefined;
                  
                  console.log('🖼️ Profile Page - Rendering avatar:', {
                    hasImageUrl: !!imageUrl,
                    imageUrl,
                    proxiedUrl,
                    memberUser: member.user
                  });
                  
                  // If we have an image URL, try to render it
                  if (imageUrl) {
                    // Use profileImageSrc if set, otherwise use the image URL directly
                    const currentSrc = profileImageSrc || imageUrl;
                    const isWasabiUrl = imageUrl.includes('wasabisys.com');
                    
                    console.log('🎨 Profile Page - About to render image:', {
                      imageUrl,
                      currentSrc,
                      profileImageSrc,
                      retryCount: profileImageRetryCount,
                      isWasabiUrl
                    });
                    
                    return (
                      <img
                        key={`profile-img-${profileImageRetryCount}-${currentSrc}`}
                        src={currentSrc}
                        alt={member.user.get_full_name || 'Profile'}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          const failedSrc = img.src;
                          const originalUrl = imageUrl;
                          
                          const newRetryCount = profileImageRetryCount + 1;
                          console.log('❌ Profile Page - Image error:', { 
                            failedSrc, 
                            originalUrl, 
                            isWasabiUrl,
                            retryCount: newRetryCount,
                            maxRetries: 2
                          });
                          
                          // Prevent infinite loops - max 2 retries (direct -> backend proxy -> Next.js proxy)
                          if (newRetryCount > 2) {
                            console.log('❌ Max retries reached, showing fallback (initials)');
                            // Don't hide image - let fallback show
                            img.style.display = 'none';
                            return;
                          }
                          
                          setProfileImageRetryCount(newRetryCount);
                          
                          // Retry strategy: backend proxy -> direct URL
                          if (originalUrl) {
                            if (failedSrc.includes('/auth/image-proxy/')) {
                              // Backend proxy failed (likely 429 rate limit), try direct URL
                              console.log('🔄 Backend proxy failed (likely rate limited), trying direct URL:', originalUrl);
                              setProfileImageSrc(originalUrl);
                            } else {
                              // All attempts failed, show fallback
                              console.log('❌ All attempts failed, showing fallback');
                              img.style.display = 'none';
                            }
                          }
                        }}
                        onLoad={(e) => {
                          setProfileImageRetryCount(0); // Reset retry count on success
                          console.log('✅ Profile Page - Image loaded successfully!', {
                            src: (e.target as HTMLImageElement).src,
                            naturalWidth: (e.target as HTMLImageElement).naturalWidth,
                            naturalHeight: (e.target as HTMLImageElement).naturalHeight
                          });
                        }}
                      />
                    );
                  }
                  
                  // If no image URL, show fallback
                  console.log('⚠️ Profile Page - No image URL, showing fallback');
                  return (
                    <div className="w-full h-full flex items-center justify-center text-white text-4xl md:text-5xl font-bold">
                      {member.user.get_full_name?.charAt(0) || 'U'}
                    </div>
                  );
                })()}
              </div>
            </div>
          </motion.div>

          {/* Profile Info Section */}
          <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 pt-20 pb-4">
            <div className="px-4 md:px-6">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                <div className="flex-1 text-center md:text-right">
                  <div className="flex items-center justify-center md:justify-end gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {member.user.get_full_name}
                    </h1>
                    {member.role === 'teacher' && (
                      <Crown className="w-6 h-6 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-center md:justify-end gap-3 mb-3">
                    {getRoleBadge(member.role)}
                    <Badge variant="outline" className={
                      member.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }>
                      {member.status_display}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    انضم في {new Date(member.joined_at).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {member.total_points || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">النقاط</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {posts.length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">المنشورات</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 sticky top-[57px] z-40">
            <div className="px-4 md:px-6">
              <div className="flex items-center gap-1 overflow-x-auto">
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('timeline')}
                  className={`rounded-none border-b-2 h-12 px-6 ${
                    activeTab === 'timeline'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 ml-2" />
                  Timeline
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('about')}
                  className={`rounded-none border-b-2 h-12 px-6 ${
                    activeTab === 'about'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <User className="w-4 h-4 ml-2" />
                  معلومات
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('badges')}
                  className={`rounded-none border-b-2 h-12 px-6 ${
                    activeTab === 'badges'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Award className="w-4 h-4 ml-2" />
                  الشارات ({badges.length})
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6">
            {/* Main Content */}
            <div className="flex-1">
              {activeTab === 'timeline' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {loadingPosts ? (
                    <div className="space-y-4">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : posts.length === 0 ? (
                    <Card className="border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-12 text-center">
                        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">لا توجد منشورات</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <Card key={post.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                {member.user.profile_image_url ? (
                                  <img
                                    src={getProxiedImageUrl(member.user.profile_image_url, true)}
                                    alt={member.user.get_full_name || 'Profile'}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => {
                                      const currentSrc = (e.target as HTMLImageElement).src;
                                      const originalUrl = member.user.profile_image_url;
                                      if (originalUrl) {
                                        if (currentSrc.includes('/auth/image-proxy/')) {
                                          (e.target as HTMLImageElement).src = originalUrl;
                                        } else {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                                    {member.user.get_full_name?.charAt(0) || 'U'}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {member.user.get_full_name}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {post.post_type_display}
                                  </Badge>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ar })}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  {post.title}
                                </h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                                  {post.content}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                                  <Button variant="ghost" size="sm" className="h-8 gap-2">
                                    <Heart className="w-4 h-4" />
                                    {post.likes_count || 0}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    {post.comments_count || 0}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'about' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="space-y-4">
                    <Card className="border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold">معلومات العضو</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-start gap-4">
                          <Mail className="w-5 h-5 text-gray-500 mt-1" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">البريد الإلكتروني</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{member.user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">تاريخ الانضمام</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(member.joined_at).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <Award className="w-5 h-5 text-gray-500 mt-1" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">النقاط</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{member.total_points || 0} نقطة</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <Users className="w-5 h-5 text-gray-500 mt-1" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">الدور</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{member.role_display}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <MessageSquare className="w-5 h-5 text-gray-500 mt-1" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">عدد المنشورات</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{posts.length} منشور</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <Trophy className="w-5 h-5 text-gray-500 mt-1" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">عدد الشارات</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{badges.length} شارة</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeTab === 'badges' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {loadingBadges ? (
                    <div className="space-y-4">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : badges.length === 0 ? (
                    <Card className="border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-12 text-center">
                        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">لا توجد شارات</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {badges.map((badge) => (
                        <Card key={badge.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={`${getBadgeColor(badge.badge_type)} p-4 rounded-xl text-white flex-shrink-0`}>
                                {badge.icon ? (
                                  <span className="text-3xl">{badge.icon}</span>
                                ) : (
                                  getBadgeIcon(badge.badge_type)
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                  {badge.name}
                                </h3>
                                <Badge variant="outline" className="text-xs mb-2">
                                  {badge.badge_type_display}
                                </Badge>
                                {badge.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {badge.description}
                                  </p>
                                )}
                                <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                                  <p>
                                    <span className="font-medium">منحه:</span> {badge.granted_by_name}
                                  </p>
                                  <p>
                                    <span className="font-medium">التاريخ:</span> {formatDate(badge.granted_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 space-y-4">
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">الإحصائيات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">النقاط</span>
                    <span className="font-bold text-2xl text-amber-600 dark:text-amber-400">{member.total_points || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">المنشورات</span>
                    <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">{posts.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">الشارات</span>
                    <span className="font-bold text-2xl text-purple-600 dark:text-purple-400">{badges.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Badges Preview */}
              {badges.length > 0 && (
                <Card className="border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      الشارات الأخيرة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {badges.slice(0, 3).map((badge) => (
                        <div key={badge.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                          <div className={`${getBadgeColor(badge.badge_type)} p-2 rounded-lg text-white`}>
                            {badge.icon ? (
                              <span className="text-lg">{badge.icon}</span>
                            ) : (
                              <div className="w-5 h-5">
                                {getBadgeIcon(badge.badge_type)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                              {badge.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(badge.granted_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {badges.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab('badges')}
                          className="w-full text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                        >
                          عرض جميع الشارات ({badges.length})
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

