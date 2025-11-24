'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAuthToken } from '@/lib/auth'
import { toast } from 'sonner'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Award,
  CheckCircle,
  Upload,
  RefreshCw,
  Edit,
  Camera,
  BookOpen,
  Users,
  Clock,
  AlertCircle,
  Trash2,
  X
} from 'lucide-react'

interface TeacherProfile {
  id: number
  user: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  bio?: string
  specialization?: string
  experience_years?: number
  education?: string
  certifications?: string
  profile_image?: string
  date_joined: string
  is_approved: boolean
  approval_status: string
  courses_count: number
  students_count: number
  rating?: number
  total_hours?: number
}

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name?: string
  is_active: boolean
  is_staff?: boolean
  is_superuser?: boolean
  date_joined: string
  last_login?: string | null
  profile_image_url?: string
  profile_image_thumbnail_url?: string
  role?: string
  is_verified?: boolean
  is_profile_complete?: boolean
  is_profile_public?: boolean
  gender?: string
  age?: number
  bio?: string
  country_code?: string
  phone_number?: string
  preferred_language?: string
  learning_goal?: string
}

interface ProfileHeaderProps {
  profile: TeacherProfile | null
  user: User | null
  refreshing: boolean
  onRefresh: () => void
  editMode: boolean
  onToggleEdit: () => void
  onProfileUpdate?: (updatedProfile: TeacherProfile) => void
}

// Helper function to translate specialization
const getSpecializationLabel = (specialization: string) => {
  const specializations: { [key: string]: string } = {
    'memorize_quran': 'حفظ القرآن الكريم',
    'arabic_language': 'اللغة العربية',
    'islamic_studies': 'الدراسات الإسلامية',
    'quran_recitation': 'تلاوة القرآن',
    'hadith_studies': 'دراسات الحديث',
    'fiqh': 'الفقه الإسلامي',
    'tafsir': 'تفسير القرآن',
    'aqeedah': 'العقيدة الإسلامية'
  }
  return specializations[specialization] || specialization
}


const getApprovalStatus = (isApproved: boolean, approvalStatus: string) => {
  if (isApproved) {
    return {
      label: 'معتمد',
      color: 'bg-blue-500',
      textColor: 'text-white',
      icon: CheckCircle
    }
  } else if (approvalStatus === 'rejected') {
    return {
      label: 'مرفوض',
      color: 'bg-red-500',
      textColor: 'text-white',
      icon: AlertCircle
    }
  } else {
    return {
      label: 'قيد المراجعة',
      color: 'bg-yellow-500',
      textColor: 'text-white',
      icon: Clock
    }
  }
}

export default function ProfileHeader({
  profile,
  user,
  refreshing,
  onRefresh,
  editMode,
  onToggleEdit,
  onProfileUpdate
}: ProfileHeaderProps) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load profile image when user or profile data is available
  useEffect(() => {
    const loadProfileImage = async () => {
      if (!user || !profile) return

      try {
        const token = await getAuthToken()
        const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/image/urls/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          console.log('🖼️ Profile image URLs loaded:', data)
          
          if (data.data?.profile_image_url) {
            setProfileImage(data.data.profile_image_url)
          }
        }
      } catch (error) {
        console.log('Failed to load profile image:', error)
        // Silent fail for image loading
      }
    }

    loadProfileImage()
  }, [user, profile])

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !profile) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صحيح')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت')
      return
    }

    setUploadingImage(true)
    
    try {
      const token = await getAuthToken()
      const formData = new FormData()
      formData.append('image', file)

      console.log('🖼️ Uploading teacher profile image...')
      
      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/image/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🖼️ Image upload response:', data)
        
        // Update local state
        const newImageUrl = data.data?.profile_image_url || data.profile_image_url || data.profile_image || data.image_url || data.url
        setProfileImage(newImageUrl)
        
        // Update parent component
        if (onProfileUpdate && newImageUrl) {
          const updatedProfile = { ...profile, profile_image: newImageUrl }
          onProfileUpdate(updatedProfile)
        }
        
        toast.success('تم تحديث صورة الملف الشخصي بنجاح')
        
        // Refresh the page data
        if (onRefresh) {
          setTimeout(onRefresh, 1000)
        }
      } else {
        const errorText = await response.text()
        console.error('🖼️ Image upload failed:', errorText)
        toast.error('فشل في رفع الصورة. يرجى المحاولة مرة أخرى')
      }
    } catch (error) {
      console.error('🖼️ Error uploading image:', error)
      toast.error('حدث خطأ أثناء رفع الصورة')
    } finally {
      setUploadingImage(false)
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteImage = async () => {
    if (!profile) return

    setUploadingImage(true)
    
    try {
      const token = await getAuthToken()
      
      console.log('🗑️ Deleting teacher profile image...')
      
      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/image/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (response.ok) {
        console.log('🗑️ Image deleted successfully')
        
        // Clear local state
        setProfileImage(null)
        
        // Update parent component
        if (onProfileUpdate) {
          const updatedProfile = { ...profile, profile_image: undefined }
          onProfileUpdate(updatedProfile)
        }
        
        toast.success('تم حذف الصورة الشخصية بنجاح')
        
        // Refresh the page data
        if (onRefresh) {
          setTimeout(onRefresh, 1000)
        }
      } else {
        const errorText = await response.text()
        console.error('🗑️ Image deletion failed:', errorText)
        toast.error('فشل في حذف الصورة. يرجى المحاولة مرة أخرى')
      }
    } catch (error) {
      console.error('🗑️ Error deleting image:', error)
      toast.error('حدث خطأ أثناء حذف الصورة')
    } finally {
      setUploadingImage(false)
    }
  }

  if (!profile || !user) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            لا توجد بيانات للملف الشخصي
          </div>
        </CardContent>
      </Card>
    )
  }

  const approvalStatus = getApprovalStatus(profile.is_approved, profile.approval_status)
  const StatusIcon = approvalStatus.icon
  const fullName = `${profile.first_name} ${profile.last_name}`.trim() || user.username

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-white rounded-3xl overflow-hidden">
      {/* Header Background */}
      <div className="bg-gradient-to-r from-[#2d7d32] via-[#4caf50] to-[#1b5e20] p-8 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-300/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Profile Info */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Avatar with Upload */}
              <div className="relative group">
                <Avatar className="w-20 h-20 border-3 border-white/30 shadow-xl">
                  <AvatarImage 
                    src={profileImage || profile.profile_image || user?.profile_image_thumbnail_url || user?.profile_image_url} 
                    alt={fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                    {fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Upload Button Overlay */}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                     onClick={triggerFileInput}>
                  {uploadingImage ? (
                    <RefreshCw className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
                
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                
                {/* Status Badge */}
                <div className="absolute -bottom-2 -right-2">
                  <Badge className={`${approvalStatus.color} ${approvalStatus.textColor} shadow-lg`}>
                    <StatusIcon className="w-3 h-3 ml-1" />
                    {approvalStatus.label}
                  </Badge>
                </div>
              </div>

              {/* Simplified Basic Info */}
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {user?.full_name || fullName}
                </h1>
                
                {/* Essential Info Only */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-blue-100 min-w-0">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate max-w-[180px] overflow-hidden text-ellipsis" title={user?.email || profile.email}>{user?.email || profile.email}</span>
                  </div>
                  
                  {user?.phone_number && (
                    <div className="flex items-center gap-2 text-blue-100">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{user.country_code} {user.phone_number}</span>
                    </div>
                  )}
                  
                  {profile.specialization && (
                    <div className="flex items-center gap-2 text-blue-100">
                      <Award className="w-4 h-4" />
                      <span className="text-sm">{getSpecializationLabel(profile.specialization)}</span>
                    </div>
                  )}
                </div>
                
                {/* Compact Status */}
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                    👨‍🏫 معلم
                  </span>
                  {user?.is_active && (
                    <span className="bg-blue-500/30 text-white px-3 py-1 rounded-full text-sm">
                      🟢 نشط
                    </span>
                  )}
                  {user?.gender && (
                    <span className="bg-blue-500/30 text-white px-3 py-1 rounded-full text-sm">
                      {user.gender === 'male' ? '♂️ ذكر' : '♀️ أنثى'}
                    </span>
                  )}
                  {user?.preferred_language && (
                    <span className="bg-purple-500/30 text-white px-3 py-1 rounded-full text-sm">
                      🌐 {user.preferred_language === 'ar' ? 'العربية' : 'English'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {(profileImage || profile.profile_image || user?.profile_image_thumbnail_url || user?.profile_image_url) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteImage}
                  disabled={uploadingImage}
                  className="bg-white/90 text-red-700 hover:bg-white border-red-200 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  <span>حذف الصورة</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={refreshing}
                className="bg-white/90 text-blue-700 hover:bg-white border-blue-200 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span>تحديث</span>
              </Button>
              
            </div>
          </div>
        </div>
      </div>

      {/* Clean empty bar */}
      <CardContent className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/60 border-t border-gray-200/50">
        <div className="flex items-center justify-center">
          {/* Empty content - just for spacing */}
        </div>
      </CardContent>
    </Card>
  )
}
