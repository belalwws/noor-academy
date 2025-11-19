'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppSelector } from '@/lib/hooks'
import { getAuthToken } from '@/lib/auth'
import { toast } from 'sonner'
import ProtectedRoute from '@/components/ProtectedRoute'
import { cn } from '@/lib/utils'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// Icons
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Settings,
  RefreshCw,
  Edit,
  Camera,
  CheckCircle2,
  Globe,
  FileText,
  Shield,
  Lock,
  Unlock,
  BookOpen,
  Award,
  Clock
} from 'lucide-react'
import { getProxiedImageUrl } from '@/lib/imageUtils'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

// Types
interface UserProfile {
  id: number
  username: string
  full_name: string
  first_name: string
  last_name: string
  email: string
  gender?: 'male' | 'female'
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  role: 'student' | 'teacher' | 'supervisor' | 'admin'
  last_login?: string
  date_joined: string
  country_code?: string
  phone_number?: string
  age?: number
  preferred_language?: 'ar' | 'en'
  bio?: string
  is_verified: boolean
  is_profile_complete: boolean
  is_profile_public: boolean
  profile_image_url?: string
  profile_image_thumbnail_url?: string
}

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export default function TeacherProfilePage() {
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  // Edit form states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    country_code: '',
    age: '',
    gender: '' as 'male' | 'female' | '',
    preferred_language: '' as 'ar' | 'en' | '',
    bio: '',
    is_profile_public: false
  })
  
  // Password form data
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  const sidebarItems: SidebarItem[] = [
    {
      id: 'overview',
      label: 'نظرة عامة',
      icon: User
    },
    {
      id: 'personal',
      label: 'معلومات شخصية',
      icon: FileText
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: Settings
    },
    {
      id: 'security',
      label: 'الأمان',
      icon: Shield
    }
  ]

  // Load profile data
  const loadProfileData = async () => {
    try {
      setLoading(true)
      const token = await getAuthToken()
      
      // Load profile from /auth/profile/
      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8',
        },
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Profile data loaded:', data)
        setProfile(data)
        
        // Initialize form data
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          country_code: data.country_code || '',
          age: data.age?.toString() || '',
          gender: data.gender || '',
          preferred_language: data.preferred_language || '',
          bio: data.bio || '',
          is_profile_public: data.is_profile_public || false
        })

      // Load profile image URLs
      try {
        const imageResponse = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/image/urls/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
            if (imageData.data?.profile_image_url || imageData.data?.profile_image_thumbnail_url) {
              setProfileImage(imageData.data.profile_image_thumbnail_url || imageData.data.profile_image_url)
          }
        }
      } catch (error) {
        console.log('Failed to load profile image:', error)
        }
      } else {
        toast.error('تعذر تحميل بيانات الملف الشخصي')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadProfileData()
    setRefreshing(false)
    toast.success('تم تحديث البيانات بنجاح')
  }

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صحيح')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت')
      return
    }

    setUploadingImage(true)
    
    try {
      const token = await getAuthToken()
      const formData = new FormData()
      formData.append('image', file)

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
        const newImageUrl = data.data?.profile_image_url || data.profile_image_url
        setProfileImage(newImageUrl)
        toast.success('تم تحديث صورة الملف الشخصي بنجاح')
        await loadProfileData()
      } else {
        toast.error('فشل في رفع الصورة')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('حدث خطأ أثناء رفع الصورة')
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!profile) return
    
    setUpdatingProfile(true)
    
    try {
      const token = await getAuthToken()
      
      // Prepare update data - send all form fields (except email)
      // The backend will handle which fields to update
      const updateData: any = {}
      
      // Always send first_name and last_name
      if (formData.first_name) updateData.first_name = formData.first_name.trim()
      if (formData.last_name) updateData.last_name = formData.last_name.trim()
      
      // Add optional fields if they exist
      if (formData.phone_number) updateData.phone_number = formData.phone_number.trim()
      if (formData.country_code) updateData.country_code = formData.country_code.trim()
      if (formData.age) updateData.age = parseInt(formData.age)
      if (formData.gender) updateData.gender = formData.gender
      if (formData.preferred_language) updateData.preferred_language = formData.preferred_language
      if (formData.bio !== undefined) updateData.bio = formData.bio.trim()
      if (formData.is_profile_public !== undefined) updateData.is_profile_public = formData.is_profile_public
      
      console.log('🔄 Updating profile with data:', JSON.stringify(updateData, null, 2))
      console.log('📋 Current profile:', { 
        first_name: profile.first_name, 
        last_name: profile.last_name,
        id: profile.id 
      })
      console.log('📝 Form data:', { 
        first_name: formData.first_name, 
        last_name: formData.last_name 
      })
      
      // Validate that we have at least first_name or last_name
      if (!updateData.first_name && !updateData.last_name) {
        toast.error('يرجى إدخال الاسم الأول أو الأخير')
        setUpdatingProfile(false)
        return
      }
      
      const apiUrl = `${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/`
      console.log('🌐 API URL:', apiUrl)
      console.log('📤 Request body:', JSON.stringify(updateData, null, 2))
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8',
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      })
      
      console.log('📥 Response status:', response.status, response.statusText)

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Profile updated successfully:', responseData)
        
        // Handle different response formats
        // Some APIs return {message: '...', user: {...}}, others return the user directly
        const updatedProfile = responseData.user || responseData
        
        console.log('📦 Updated profile data from API:', updatedProfile)
        console.log('🔍 Checking first_name:', {
          sent: formData.first_name,
          received: updatedProfile.first_name,
          match: formData.first_name === updatedProfile.first_name
        })
        
        // Always use formData values for fields we just updated (optimistic update)
        // This ensures UI shows the changes immediately even if backend returns old data
        const newFirstName = formData.first_name || updatedProfile.first_name || profile?.first_name || ''
        const newLastName = formData.last_name || updatedProfile.last_name || profile?.last_name || ''
        const newFullName = `${newFirstName} ${newLastName}`.trim() || updatedProfile.full_name || profile?.full_name || profile?.username || ''
        
        const finalProfile: UserProfile = {
          ...profile!, // Start with existing profile data
          ...updatedProfile, // Override with API response
          // Force use formData values for fields we just updated
          first_name: newFirstName,
          last_name: newLastName,
          full_name: newFullName,
          phone_number: formData.phone_number || updatedProfile.phone_number || profile?.phone_number,
          country_code: formData.country_code || updatedProfile.country_code || profile?.country_code,
          age: formData.age ? parseInt(formData.age) : (updatedProfile.age || profile?.age),
          gender: formData.gender || updatedProfile.gender || profile?.gender,
          preferred_language: formData.preferred_language || updatedProfile.preferred_language || profile?.preferred_language,
          bio: formData.bio !== undefined ? formData.bio : (updatedProfile.bio !== undefined ? updatedProfile.bio : profile?.bio),
          is_profile_public: formData.is_profile_public !== undefined ? formData.is_profile_public : (updatedProfile.is_profile_public !== undefined ? updatedProfile.is_profile_public : profile?.is_profile_public),
        }
        
        console.log('🎯 Final profile data to use:', {
          first_name: finalProfile.first_name,
          last_name: finalProfile.last_name,
          full_name: finalProfile.full_name,
          id: finalProfile.id
        })
        
        // Update state immediately with optimistic update
        console.log('🔄 Setting profile state to:', {
          first_name: finalProfile.first_name,
          last_name: finalProfile.last_name,
          full_name: finalProfile.full_name
        })
        setProfile(finalProfile)
        
        // Force a re-render by updating a dummy state if needed
        // This ensures React detects the state change
        console.log('✅ Profile state updated, component should re-render')
        
        // Update form data with new profile data
        setFormData({
          first_name: finalProfile.first_name || '',
          last_name: finalProfile.last_name || '',
          email: finalProfile.email || profile?.email || '',
          phone_number: finalProfile.phone_number || '',
          country_code: finalProfile.country_code || '',
          age: finalProfile.age?.toString() || '',
          gender: finalProfile.gender || '',
          preferred_language: finalProfile.preferred_language || '',
          bio: finalProfile.bio || '',
          is_profile_public: finalProfile.is_profile_public || false
        })
        
        setIsEditingProfile(false)
        toast.success('تم تحديث الملف الشخصي بنجاح')
        
        // Check if backend returned different data than what we sent
        const dataMismatch = 
          (formData.first_name && updatedProfile.first_name !== formData.first_name) ||
          (formData.last_name && updatedProfile.last_name !== formData.last_name)
        
        if (dataMismatch) {
          console.warn('⚠️ Backend returned different data than sent. Keeping optimistic update.')
          console.warn('Sent:', { first_name: formData.first_name, last_name: formData.last_name })
          console.warn('Received:', { first_name: updatedProfile.first_name, last_name: updatedProfile.last_name })
          
          // Show a warning to the user if Arabic characters were lost
          const hasArabicChars = /[\u0600-\u06FF]/.test(formData.first_name + formData.last_name)
          const receivedEnglish = !/[\u0600-\u06FF]/.test(updatedProfile.first_name + updatedProfile.last_name)
          
          if (hasArabicChars && receivedEnglish) {
            toast.warning('تم حفظ البيانات محلياً، لكن الخادم قد لا يدعم الأحرف العربية بشكل كامل.')
          }
          
          // Don't reload - keep the optimistic update
          // The backend may have encoding issues or doesn't support Arabic properly
        } else {
          // Only reload if data matches (backend updated successfully)
          setTimeout(async () => {
            console.log('🔄 Reloading profile data to sync with backend...')
            await loadProfileData()
          }, 1000)
        }
      } else {
        const errorData = await response.json()
        console.error('❌ Profile update failed:', errorData)
        toast.error(errorData.message || errorData.detail || 'فشل في تحديث الملف الشخصي')
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      toast.error('حدث خطأ أثناء تحديث الملف الشخصي')
    } finally {
      setUpdatingProfile(false)
    }
  }

  // Handle password change
  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('كلمة المرور الجديدة وتأكيدها غير متطابقين')
      return
    }
    
    if (passwordData.new_password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }
    
    setChangingPassword(true)
    
    try {
      const token = await getAuthToken()
      
      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/change-password/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password
        })
      })

      if (response.ok) {
        setPasswordData({
          old_password: '',
          new_password: '',
          confirm_password: ''
        })
        setIsChangingPassword(false)
        toast.success('تم تغيير كلمة المرور بنجاح')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'فشل في تغيير كلمة المرور')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('حدث خطأ أثناء تغيير كلمة المرور')
    } finally {
      setChangingPassword(false)
    }
  }

  // Handle image delete
  const handleDeleteImage = async () => {
    setUploadingImage(true)
    
    try {
      const token = await getAuthToken()
      
      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/image/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (response.ok) {
        setProfileImage(null)
        toast.success('تم حذف الصورة الشخصية بنجاح')
        await loadProfileData()
      } else {
        toast.error('فشل في حذف الصورة')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('حدث خطأ أثناء حذف الصورة')
    } finally {
      setUploadingImage(false)
    }
  }

  useEffect(() => {
    loadProfileData()
  }, [])

  // Calculate fullName dynamically - must be before conditional returns
  const fullName = profile 
    ? (profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username)
    : ''
  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : ''
  const imageUrl = profileImage || profile?.profile_image_thumbnail_url || profile?.profile_image_url
  
  // Debug: Log fullName calculation
  if (profile) {
    console.log('🔄 Rendering with profile:', {
      first_name: profile.first_name,
      last_name: profile.last_name,
      full_name: profile.full_name,
      calculated_fullName: fullName
    })
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background-light pt-20 dark:bg-background-dark">
          <div className="container mx-auto px-4 py-8">
            <div className="flex gap-8">
              <Skeleton className="w-80 h-96 rounded-2xl" />
              <div className="flex-1 space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!profile) {
        return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background-light pt-20 dark:bg-background-dark">
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-text-secondary">لا توجد بيانات للملف الشخصي</p>
              </CardContent>
            </Card>
          </div>
          </div>
      </ProtectedRoute>
    )
  }


  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Bio Card */}
            {profile.bio && (
              <Card className="border border-border shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <FileText className="w-5 h-5" />
                    نبذة عني
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary leading-relaxed">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Info Card */}
              <Card className="border border-border shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <User className="w-5 h-5" />
                    معلومات الحساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">اسم المستخدم</span>
                    <span className="font-semibold text-text-primary">{profile.username}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">تاريخ الانضمام</span>
                    <span className="font-semibold text-text-primary">
                      {formatDistanceToNow(new Date(profile.date_joined), { addSuffix: true, locale: ar })}
                    </span>
                  </div>
                  {profile.last_login && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary">آخر تسجيل دخول</span>
                        <span className="font-semibold text-text-primary">
                          {formatDistanceToNow(new Date(profile.last_login), { addSuffix: true, locale: ar })}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Profile Status Card */}
              <Card className="border border-border shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                    حالة الملف الشخصي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">اكتمال الملف الشخصي</span>
                    <Badge className={profile.is_profile_complete ? 'bg-green-500' : 'bg-amber-500'}>
                      {profile.is_profile_complete ? 'مكتمل' : 'غير مكتمل'}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">التحقق</span>
                    <Badge className={profile.is_verified ? 'bg-green-500' : 'bg-gray-500'}>
                      {profile.is_verified ? 'موثق' : 'غير موثق'}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">الخصوصية</span>
                    <Badge className={profile.is_profile_public ? 'bg-blue-500' : 'bg-gray-500'}>
                      {profile.is_profile_public ? 'عام' : 'خاص'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info Card */}
              <Card className="border border-border shadow-soft md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Globe className="w-5 h-5" />
                    معلومات إضافية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {profile.gender && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-text-secondary">الجنس</span>
                        <span className="font-semibold text-text-primary">
                          {profile.gender === 'male' ? 'ذكر' : 'أنثى'}
                        </span>
                      </div>
                    )}
                    {profile.age && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-text-secondary">العمر</span>
                        <span className="font-semibold text-text-primary">{profile.age} سنة</span>
                      </div>
                    )}
                    {profile.preferred_language && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-text-secondary">اللغة المفضلة</span>
                        <Badge className="bg-primary">
                          {profile.preferred_language === 'ar' ? 'العربية' : 'English'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
          </div>
          </motion.div>
        )

      case 'personal':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-border shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <User className="w-5 h-5" />
                      المعلومات الشخصية
                    </CardTitle>
                    <CardDescription>إدارة معلوماتك الشخصية</CardDescription>
                  </div>
                  {!isEditingProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                      className="bg-primary hover:bg-primary-dark text-white"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditingProfile ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile() }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">الاسم الأول</Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">الاسم الأخير</Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          disabled
                          className="bg-muted cursor-not-allowed opacity-60"
                          title="لا يمكن تعديل البريد الإلكتروني"
                        />
                        <p className="text-xs text-text-secondary">البريد الإلكتروني لا يمكن تعديله</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone_number">رقم الهاتف</Label>
                        <div className="flex gap-2">
                          <Input
                            id="country_code"
                            placeholder="966"
                            value={formData.country_code}
                            onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                            className="w-20"
                          />
                          <Input
                            id="phone_number"
                            value={formData.phone_number}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">العمر</Label>
                        <Input
                          id="age"
                          type="number"
                          min="1"
                          max="120"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">الجنس</Label>
                        <select
                          id="gender"
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | '' })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">اختر الجنس</option>
                          <option value="male">ذكر</option>
                          <option value="female">أنثى</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferred_language">اللغة المفضلة</Label>
                        <select
                          id="preferred_language"
                          value={formData.preferred_language}
                          onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value as 'ar' | 'en' | '' })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">اختر اللغة</option>
                          <option value="ar">العربية</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">نبذة عني</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        maxLength={500}
                        placeholder="اكتب نبذة عنك..."
                      />
                      <p className="text-xs text-text-secondary text-left">
                        {formData.bio.length}/500
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={updatingProfile}
                        className="flex-1 bg-primary hover:bg-primary-dark text-white"
                      >
                        {updatingProfile ? (
                          <>
                            <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 ml-2" />
                            حفظ التغييرات
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingProfile(false)
                          // Reset form data
                          if (profile) {
                            setFormData({
                              first_name: profile.first_name || '',
                              last_name: profile.last_name || '',
                              email: profile.email || '',
                              phone_number: profile.phone_number || '',
                              country_code: profile.country_code || '',
                              age: profile.age?.toString() || '',
                              gender: profile.gender || '',
                              preferred_language: profile.preferred_language || '',
                              bio: profile.bio || '',
                              is_profile_public: profile.is_profile_public || false
                            })
                          }
                        }}
                        disabled={updatingProfile}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-text-secondary mb-2 block">الاسم الأول</Label>
                        <div className="p-3 bg-muted rounded-lg text-text-primary">{profile.first_name}</div>
                      </div>
                      <div>
                        <Label className="text-text-secondary mb-2 block">الاسم الأخير</Label>
                        <div className="p-3 bg-muted rounded-lg text-text-primary">{profile.last_name}</div>
                      </div>
                      <div>
                        <Label className="text-text-secondary mb-2 block">البريد الإلكتروني</Label>
                        <div className="p-3 bg-muted rounded-lg text-text-primary">{profile.email}</div>
                      </div>
                      {profile.phone_number && (
                        <div>
                          <Label className="text-text-secondary mb-2 block">رقم الهاتف</Label>
                          <div className="p-3 bg-muted rounded-lg text-text-primary">
                            {profile.country_code} {profile.phone_number}
                          </div>
                        </div>
                      )}
                      {profile.age && (
                        <div>
                          <Label className="text-text-secondary mb-2 block">العمر</Label>
                          <div className="p-3 bg-muted rounded-lg text-text-primary">{profile.age} سنة</div>
                        </div>
                      )}
                      {profile.gender && (
                        <div>
                          <Label className="text-text-secondary mb-2 block">الجنس</Label>
                          <div className="p-3 bg-muted rounded-lg text-text-primary">
                            {profile.gender === 'male' ? 'ذكر' : 'أنثى'}
                          </div>
                        </div>
                      )}
                    </div>
                    {profile.bio && (
                      <div>
                        <Label className="text-text-secondary mb-2 block">نبذة عني</Label>
                        <div className="p-3 bg-muted rounded-lg text-text-primary">{profile.bio}</div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-border shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Settings className="w-5 h-5" />
                  الإعدادات
                </CardTitle>
                <CardDescription>إدارة إعدادات حسابك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">الملف الشخصي العام</p>
                    <p className="text-sm text-text-secondary">السماح للآخرين برؤية ملفك الشخصي</p>
            </div>
                  <Badge className={profile.is_profile_public ? 'bg-green-500' : 'bg-gray-500'}>
                    {profile.is_profile_public ? 'مفعل' : 'معطل'}
                  </Badge>
          </div>
                <p className="text-sm text-text-secondary text-center">المزيد من الإعدادات قريباً...</p>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'security':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card className="border border-border shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Shield className="w-5 h-5" />
                      الأمان
                    </CardTitle>
                    <CardDescription>إدارة أمان حسابك</CardDescription>
                  </div>
                  {!isChangingPassword && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsChangingPassword(true)}
                      className="bg-primary hover:bg-primary-dark text-white"
                    >
                      <Lock className="w-4 h-4 ml-2" />
                      تغيير كلمة المرور
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isChangingPassword ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleChangePassword() }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="old_password">كلمة المرور الحالية</Label>
                      <Input
                        id="old_password"
                        type="password"
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                        required
                        placeholder="أدخل كلمة المرور الحالية"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password">كلمة المرور الجديدة</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        required
                        minLength={8}
                        placeholder="أدخل كلمة المرور الجديدة (8 أحرف على الأقل)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">تأكيد كلمة المرور الجديدة</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        required
                        minLength={8}
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                      />
                      {passwordData.new_password && passwordData.confirm_password && 
                       passwordData.new_password !== passwordData.confirm_password && (
                        <p className="text-sm text-red-500">كلمة المرور غير متطابقة</p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={changingPassword || passwordData.new_password !== passwordData.confirm_password}
                        className="flex-1 bg-primary hover:bg-primary-dark text-white"
                      >
                        {changingPassword ? (
                          <>
                            <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                            جاري التغيير...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 ml-2" />
                            تغيير كلمة المرور
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsChangingPassword(false)
                          setPasswordData({
                            old_password: '',
                            new_password: '',
                            confirm_password: ''
                          })
                        }}
                        disabled={changingPassword}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <Lock className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                    <p className="text-text-secondary mb-4">قم بتغيير كلمة المرور لحماية حسابك</p>
                    <Button
                      onClick={() => setIsChangingPassword(true)}
                      className="bg-primary hover:bg-primary-dark text-white"
                    >
                      <Lock className="w-4 h-4 ml-2" />
                      تغيير كلمة المرور
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background-light pt-20 dark:bg-background-dark">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Profile Header Card */}
          <motion.div
            key={`profile-header-${profile?.first_name || ''}-${profile?.last_name || ''}-${profile?.id || ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-glow overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-white dark:from-background-dark-card dark:via-amber-950/20 dark:to-background-dark-card">
              {/* Header Background with Platform Colors */}
              <div className="bg-gradient-to-r from-primary via-primary-light to-primary-dark p-8 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-300/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    {/* Profile Info */}
                    <div className="flex items-center gap-6 flex-wrap">
                      {/* Avatar */}
                      <div className="relative group">
                        <Avatar className="w-28 h-28 border-4 border-white/90 shadow-2xl ring-4 ring-primary/20">
                          <AvatarImage 
                            src={imageUrl ? getProxiedImageUrl(imageUrl, false) : undefined}
                            alt={fullName}
                            className="object-cover"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement
                              img.style.display = 'none'
                            }}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-white text-3xl font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Upload Button Overlay */}
                        <div 
                          className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                          onClick={() => document.getElementById('profile-image-input')?.click()}
                        >
                          {uploadingImage ? (
                            <RefreshCw className="w-8 h-8 text-white animate-spin" />
                          ) : (
                            <Camera className="w-8 h-8 text-white" />
                          )}
                        </div>
                        
                        {/* Hidden File Input */}
                        <input
                          id="profile-image-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </div>

                      {/* User Info */}
                      <div className="text-white">
                        <div className="flex items-center gap-3 mb-2">
                          <h1 
                            key={`name-${profile?.first_name || ''}-${profile?.last_name || ''}`}
                            className="text-4xl font-bold bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent"
                          >
                            {fullName}
                          </h1>
                          {profile.is_verified && (
                            <Badge className="bg-white/20 text-white border-white/30">
                              <CheckCircle2 className="w-4 h-4 ml-1" />
                              موثق
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-amber-100 mb-4">
                          {profile.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span className="text-sm">{profile.email}</span>
                            </div>
                          )}
                          
                          {profile.phone_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span className="text-sm">{profile.country_code} {profile.phone_number}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-white/20 text-white border-white/30">
                            <User className="w-3 h-3 ml-1" />
                            {profile.role === 'teacher' ? 'معلم' : profile.role}
                          </Badge>
                          {profile.is_active && (
                            <Badge className="bg-green-500/30 text-white border-green-300/30">
                              <CheckCircle2 className="w-3 h-3 ml-1" />
                              نشط
                            </Badge>
                          )}
                          {profile.is_profile_public ? (
                            <Badge className="bg-blue-500/30 text-white border-blue-300/30">
                              <Unlock className="w-3 h-3 ml-1" />
                              عام
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/30 text-white border-gray-300/30">
                              <Lock className="w-3 h-3 ml-1" />
                              خاص
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {imageUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteImage}
                          disabled={uploadingImage}
                          className="bg-white/90 text-red-600 hover:bg-white border-red-200 shadow-md"
                        >
                          <Settings className="w-4 h-4 ml-2" />
                          حذف الصورة
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="bg-white/90 text-primary hover:bg-white border-primary/30 shadow-md"
                      >
                        <RefreshCw className={`w-4 h-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
                        تحديث
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Main Content with Sidebar */}
          <div className="flex gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="w-80 flex-shrink-0"
            >
              <Card className="border border-border shadow-soft sticky top-28">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-text-primary">إعدادات الملف الشخصي</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-2 p-6">
                    {sidebarItems.map((item, index) => {
                      const Icon = item.icon
                      const isActive = activeTab === item.id
                      
                      return (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveTab(item.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all duration-300",
                            isActive
                              ? "bg-gradient-to-r from-primary via-primary-light to-primary-dark text-white shadow-lg shadow-primary/30"
                              : "text-text-secondary hover:bg-muted hover:text-primary"
                          )}
                        >
                          <Icon className={cn(
                            "w-5 h-5 transition-colors",
                            isActive ? "text-white" : "text-text-secondary"
                          )} />
                          <span className="flex-1 font-medium">{item.label}</span>
                        </motion.button>
                      )
                    })}
                  </nav>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
